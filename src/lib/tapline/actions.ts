import { REGION, SMOKE_ALARM, TRADE_IDS, addBusinessDays, emergencyText, isAfterHours, isSmokeAlarm, money, ruleTriage, slots, terms, tradeWho, when } from "./rules";
import { priorRelated } from "./seed";
import type { Access, ChargeTo, Job, Sandbox, Stage, Trade, Triage, Urgency } from "./types";

// Every change to a sandbox goes through apply(). Pure: takes a sandbox and an
// action, returns the new sandbox or a message a person can read. The API
// route loads, applies and saves with a version check; nothing else writes.
// Inputs from the public API are untrusted: every field is checked here.

export type PublicAction =
  | { type: "report"; propertyId: string; title: string; description: string; photo?: string; access?: Access; afterHours?: boolean }
  | {
      type: "confirm";
      jobId: string;
      trade: Trade;
      urgency: Urgency;
      reply: string;
      safety: string[];
      chargeTo: ChargeTo;
      strataReferral: boolean;
      insuranceClaim: boolean;
    }
  | { type: "accept"; jobId: string; slot: number; tenantAgreed?: boolean }
  | { type: "quote"; jobId: string; amount: number; note: string; earliest: number }
  | { type: "owner"; jobId: string; decision: "approved" | "declined"; note?: string }
  | { type: "ownerQuestion"; jobId: string; text: string }
  | { type: "requote"; jobId: string }
  | { type: "complete"; jobId: string; photo?: string }
  | { type: "invoice"; jobId: string; amount: number }
  | { type: "approveInvoice"; jobId: string }
  | { type: "complianceJob"; complianceId: string };

/** Server-only actions: never accepted from the public API. */
export type InternalAction = { type: "triage"; jobId: string; triage: Triage } | { type: "autoDispatch"; jobId: string };

export type Action = PublicAction | InternalAction;
export const PUBLIC_TYPES = new Set(["report", "confirm", "accept", "quote", "owner", "ownerQuestion", "requote", "complete", "invoice", "approveInvoice", "complianceJob"]);

type Result = { ok: true; sb: Sandbox; jobId?: string } | { ok: false; error: string };

const H = 3600_000;
const D = 24 * H;
// Size limits keep a demo small (the database is shared until the demo one is split out).
const MAX_JOBS = 100;
const MAX_EVENTS = 30;
const LONG = { ok: false as const, error: "This job has a long history now. Use Reset demo to start again." };

// ---------- input checks ----------

const BIDI = /[‪-‮⁦-⁩‎‏]/g;
// Zero-width and other invisible format characters: a title of three of them is not a title.
const INVISIBLE = /[\u00AD\u115F\u1160\u17B4\u17B5\u180E\u200B-\u200D\u2060-\u2064\u2800\u3164\uFEFF\uFFA0]/g;
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F]/g;

/** Plain text: trimmed, control and bidi characters removed, newlines kept, cut by characters (not UTF-16 units). */
export function text(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  const s = v.replace(BIDI, "").replace(INVISIBLE, "").replace(CONTROL, " ").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return Array.from(s).slice(0, max).join("").trim();
}

/** Money in whole cents, from a number only (never a boolean or array). */
function amountOf(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  const cents = Math.round(v * 100);
  if (cents <= 0 || cents > 5_000_000) return null;
  return cents / 100;
}

const oneOf = <T extends string>(v: unknown, list: readonly T[]): T | null => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : null);
const URGENCIES = ["urgent", "routine"] as const;
const CHARGES = ["owner", "tenant", "strata"] as const;
const ACCESS = ["home", "keys", "times"] as const;

function access(v: unknown): Access | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const mode = oneOf(o.mode, ACCESS);
  if (!mode) return undefined;
  return { mode, note: text(o.note, 160), pets: o.pets === true };
}

// ---------- helpers ----------

function nextRef(sb: Sandbox) {
  const prefix = sb.region === "AU" ? "HL" : "NG";
  const max = sb.jobs.reduce((m, j) => Math.max(m, Number(j.ref.split("-")[1]) || 0), 4100);
  return `${prefix}-${max + 1}`;
}

function newId(now: number) {
  return `j${now.toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function contractorFor(sb: Sandbox, trade: Trade, urgent: boolean, now: number) {
  const ok = sb.contractors.filter((c) => c.trade === trade && c.insuranceExpires > now && c.licenceExpires > now);
  if (!ok.length) return null;
  if (urgent) return ok.find((c) => c.onCall) ?? ok[0];
  // Spread routine work: the contractor with the fewest open jobs.
  const open = (id: string) => sb.jobs.filter((j) => j.contractorId === id && !["done", "billed"].includes(j.stage)).length;
  return [...ok].sort((a, b) => open(a.id) - open(b.id))[0];
}

/** Hours of notice the tenant needs before a routine visit. */
export function noticeHours(sb: Sandbox, j: Job) {
  if (j.urgency === "urgent") return 0;
  if (sb.region === "AU" && j.dueBy) return SMOKE_ALARM.noticeHours;
  return REGION[sb.region].noticeHours;
}

/** Earliest visit time for a job: an hour away, or the notice period unless the tenant agreed to earlier. */
export function earliestVisit(sb: Sandbox, j: Job, now: number, tenantAgreed = false) {
  return now + Math.max(1, tenantAgreed ? 1 : noticeHours(sb, j)) * H;
}

/**
 * Send a confirmed job to the right contractor with the right not-to-exceed amount. Urgent work goes to the
 * on-call contractor under the agency's urgent limit; NSW smoke alarms go to an electrician with a 2-business-day
 * deadline and no owner approval; everything else is a work order capped at the owner's limit.
 */
function dispatch(sb: Sandbox, j: Job, trade: Trade, urgency: Urgency, chargeTo: ChargeTo, now: number): string | null {
  const c = terms(sb.region);
  const R = REGION[sb.region];
  const con = contractorFor(sb, trade, urgency === "urgent", now);
  if (!con) return `No ${tradeWho(sb.region, trade)} with current licence and insurance. Add one before sending.`;
  const p = sb.properties.find((x) => x.id === j.propertyId)!;
  const o = sb.owners.find((x) => x.id === p.ownerId)!;
  j.contractorId = con.id;
  j.trade = trade;
  j.urgency = urgency;
  j.bookedFor = undefined;
  j.quote = undefined;
  j.dueBy = undefined;
  if (urgency === "urgent") {
    j.cap = R.urgentLimit;
    j.ownerDecision = { decision: "urgent", at: now };
    j.events.push({ at: now, by: "tapline", text: `Urgent: sent to on-call ${con.business} (up to ${money(sb.region, j.cap)}), ${c.owner} notified` });
    // An urgent smoke alarm job (water or smoke at the alarm) still carries the law's 2-business-day deadline.
    if (sb.region === "AU" && trade === "electrician" && isSmokeAlarm(`${j.title} ${j.description}`)) j.dueBy = addBusinessDays(sb.region, j.createdAt, SMOKE_ALARM.businessDays);
  } else if (sb.region === "AU" && trade === "electrician" && isSmokeAlarm(`${j.title} ${j.description}`)) {
    j.cap = R.urgentLimit;
    j.dueBy = addBusinessDays(sb.region, j.createdAt, SMOKE_ALARM.businessDays);
    j.ownerDecision = { decision: "auto", at: now };
    j.events.push({ at: now, by: "tapline", text: `Smoke alarm repair sent to ${con.business}: due within 2 business days by NSW law, no ${c.owner} approval needed, ${c.owner} notified` });
  } else if (chargeTo === "tenant") {
    j.cap = R.urgentLimit;
    j.ownerDecision = undefined;
    j.events.push({ at: now, by: "tapline", text: `${cap(c.workOrder)} sent to ${con.business}, charged to the tenant` });
  } else {
    j.cap = o.approvalLimit;
    j.ownerDecision = undefined;
    j.events.push({ at: now, by: "tapline", text: `${cap(c.workOrder)} sent to ${con.business}, up to ${money(sb.region, j.cap)}` });
  }
  enter(j, "sent", now);
  return null;
}

function enter(j: Job, stage: Stage, now: number) {
  j.stage = stage;
  j.stageEnteredAt = now;
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

// ---------- apply ----------

export function apply(sb: Sandbox, a: Action, now = Date.now()): Result {
  if (!a || typeof a !== "object" || typeof (a as { type?: unknown }).type !== "string") return { ok: false, error: "Something went wrong. Reload the page and try again." };
  const next: Sandbox = structuredClone(sb);
  const c = terms(next.region);
  const R = REGION[next.region];
  const job = (id: unknown) => (typeof id === "string" ? next.jobs.find((j) => j.id === id) : undefined);
  const prop = (j: Job) => next.properties.find((p) => p.id === j.propertyId)!;
  const handled = { ok: false as const, error: "Someone has already dealt with this. The board has been refreshed." };

  switch (a.type) {
    case "report": {
      const p = next.properties.find((x) => x.id === a.propertyId);
      const title = text(a.title, 80);
      const description = text(a.description, 600);
      if (!p) return { ok: false, error: "We couldn't find that property. Reload the page and try again." };
      if (Array.from(title).length < 3 || (title.match(/[\p{L}\p{N}]/gu) ?? []).length < 2) return { ok: false, error: "Please describe the problem in a few words." };
      if (next.jobs.length >= MAX_JOBS) return { ok: false, error: "This demo is full. Use Reset demo to start again." };
      const j: Job = {
        id: newId(now),
        ref: nextRef(next),
        propertyId: p.id,
        createdAt: now,
        stageEnteredAt: now,
        title,
        description,
        photo: typeof a.photo === "string" && /^ph[a-z0-9]{6,20}$/.test(a.photo) ? a.photo : undefined,
        access: access(a.access),
        afterHours: a.afterHours === true || isAfterHours(next.region, now),
        trade: "handyman",
        urgency: "routine",
        stage: "new",
        events: [{ at: now, by: "tenant", text: a.afterHours === true && !isAfterHours(next.region, now) ? "Reported by the tenant (demo: treated as 9:47 pm)" : "Reported by the tenant" }],
      };
      next.jobs.push(j);
      return { ok: true, sb: next, jobId: j.id };
    }

    case "triage": {
      const j = job(a.jobId);
      if (!j || j.stage !== "new" || j.triage) return { ok: false, error: "This job has already been triaged." };
      j.triage = a.triage;
      j.trade = a.triage.trade;
      j.urgency = a.triage.urgency;
      const who = a.triage.source === "ai" ? "AI" : "Keyword rules";
      const level = a.triage.raisedBy?.length ? `routine, raised to urgent by keyword rules (${a.triage.raisedBy.join(", ")})` : a.triage.urgency;
      j.events.push({
        at: now,
        by: "tapline",
        text: `${who} suggested: ${tradeWho(next.region, a.triage.trade)}, ${level}${a.triage.repeatOf ? `, related to ${a.triage.repeatOf.ref}` : ""}`,
      });
      return { ok: true, sb: next };
    }

    case "autoDispatch": {
      // After hours, an urgent report gets the fixed safety text and the on-call
      // contractor straight away. The AI's own reply still waits for a person.
      const j = job(a.jobId);
      if (!j || j.stage !== "new" || !j.triage || j.triage.urgency !== "urgent") return { ok: false, error: "Not eligible." };
      const con = contractorFor(next, j.triage.trade, true, now);
      if (!con) return { ok: false, error: `No on-call ${c.contractor}.` };
      j.contractorId = con.id;
      j.trade = j.triage.trade;
      j.urgency = "urgent";
      j.cap = R.urgentLimit;
      j.ownerDecision = { decision: "urgent", at: now };
      enter(j, "sent", now);
      // Log only what was really sent: the fixed emergency text exists only when a hazard was found.
      j.events.push({
        at: now,
        by: "tapline",
        text: j.triage.emergency.length
          ? "After hours: the tenant was sent the fixed safety steps automatically"
          : `After hours: the tenant was told the on-call ${c.contractor} has been contacted`,
      });
      j.events.push({ at: now, by: "tapline", text: `After hours: on-call ${con.business} paged (up to ${money(next.region, j.cap)}), ${c.owner} notified. Waiting for a manager to confirm the reply.` });
      return { ok: true, sb: next };
    }

    case "confirm": {
      const j = job(a.jobId);
      // After hours the on-call contractor may accept, and even finish, before a manager is in: the morning
      // confirm still sends the reply. Once the work is done it changes only the reply and the flags.
      const dispatched = !!j && j.afterHours === true && !!j.triage && !j.triage.confirmedAt && j.stage !== "new";
      if (!j || !((j.stage === "new" && !j.hold) || dispatched)) return handled;
      const workDone = j.stage === "done" || j.stage === "billed";
      const trade = workDone ? j.trade : oneOf(a.trade, TRADE_IDS);
      const urgency = workDone ? j.urgency : oneOf(a.urgency, URGENCIES);
      let chargeTo = oneOf(a.chargeTo, CHARGES) ?? "owner";
      if (chargeTo === "strata" && !prop(j).strata) chargeTo = "owner";
      if (!trade || !urgency) return { ok: false, error: "Choose a trade and an urgency before confirming." };
      const reply = text(a.reply, 900);
      if (!reply) return { ok: false, error: "Write a reply to the tenant before confirming." };
      const safety = Array.isArray(a.safety) ? a.safety.map((s) => text(s, 200)).filter(Boolean).slice(0, 4) : [];
      if (!j.triage) {
        const rules = ruleTriage(`${j.title}. ${j.description}`, next.region);
        j.triage = { source: "rules", at: now, trade, urgency, reason: "Triaged by hand.", safety: [], emergency: emergencyText(next.region, rules.hazards), reply: "", chargeTo, strataReferral: false, insuranceClaim: false };
      }
      const t = j.triage;
      const changed = dispatched && (trade !== j.trade || urgency !== j.urgency);
      t.trade = trade;
      t.urgency = urgency;
      t.reply = reply;
      t.safety = urgency === "urgent" ? safety : [];
      t.chargeTo = chargeTo;
      t.strataReferral = a.strataReferral === true && !!prop(j).strata;
      t.insuranceClaim = a.insuranceClaim === true;
      // Keep the first confirmation time: it is the acknowledgement time.
      t.confirmedAt = t.confirmedAt ?? now;
      j.events.push({ at: now, by: "manager", text: "Triage confirmed, reply sent to the tenant" });
      if (t.strataReferral) j.events.push({ at: now, by: "manager", text: `Referred to the ${c.strataBody}, ${prop(j).strata!.manager}` });
      if (t.insuranceClaim) j.events.push({ at: now, by: "manager", text: "Flagged as a possible insurance claim" });
      if (dispatched && !changed) return { ok: true, sb: next }; // the on-call contractor stays on it
      // A changed trade or urgency stands the on-call contractor down and sends the job again by the normal rule.
      const before = next.contractors.find((x) => x.id === j.contractorId);
      // A strata referral still sends a contractor to make the home safe; the
      // cause and the cost go to the building manager when it is common property.
      const err = dispatch(next, j, trade, urgency, chargeTo, now);
      if (err) return { ok: false, error: err };
      if (dispatched && before) j.events.splice(j.events.length - 1, 0, { at: now, by: "manager", text: `Stood down ${before.business} (trade or urgency changed)` });
      return { ok: true, sb: next };
    }

    case "accept": {
      const j = job(a.jobId);
      if (!j || j.stage !== "sent") return handled;
      const agreed = a.tenantAgreed === true;
      const allowed = j.urgency === "urgent" ? [now + 30 * 60_000, now + 4 * H] : [earliestVisit(next, j, now, agreed), now + 30 * D];
      const slot = typeof a.slot === "number" && Number.isFinite(a.slot) ? a.slot : NaN;
      if (!(slot >= allowed[0] - 60_000 && slot <= allowed[1])) return { ok: false, error: "Pick one of the times offered." };
      j.bookedFor = slot;
      if (!j.ownerDecision) j.ownerDecision = { decision: "auto", at: now };
      enter(j, "booked", now);
      const con = next.contractors.find((x) => x.id === j.contractorId);
      j.events.push({ at: now, by: "contractor", text: `${con?.business ?? cap(c.contractor)} accepted and booked a visit` });
      if (j.dueBy && now < j.dueBy && slot > j.dueBy) {
        j.bookedFor = undefined;
        return { ok: false, error: `This repair is due by ${when(next.region, j.dueBy)} (NSW law). Pick an earlier time.` };
      }
      if (agreed && j.urgency !== "urgent" && slot < now + noticeHours(next, j) * H) j.events.push({ at: now, by: "contractor", text: "The tenant agreed to an earlier time than the notice period" });
      return { ok: true, sb: next };
    }

    case "quote": {
      const j = job(a.jobId);
      if (!j || j.stage !== "sent" || j.urgency === "urgent") return handled;
      if (j.events.length >= MAX_EVENTS) return LONG;
      const amount = amountOf(a.amount);
      if (amount === null) return { ok: false, error: "Enter the quote amount, for example 380 or 380.50." };
      const note = text(a.note, 200) || "Labour and parts";
      j.quote = { amount, note, at: now };
      const min = earliestVisit(next, j, now);
      const earliest = typeof a.earliest === "number" && a.earliest >= min && a.earliest < now + 30 * D ? a.earliest : slots(next.region, min, 1, 0)[0];
      j.bookedFor = earliest;
      j.events.push({ at: now, by: "contractor", text: `Quote sent: ${money(next.region, amount)}` });
      if (j.cap && amount <= j.cap) {
        j.ownerDecision = { decision: "auto", at: now };
        enter(j, "booked", now);
        j.events.push({ at: now, by: "tapline", text: `Within the ${money(next.region, j.cap)} limit, approved and booked` });
      } else {
        enter(j, "owner", now);
        j.events.push({ at: now, by: "tapline", text: `Over the ${money(next.region, j.cap ?? 0)} limit, sent to the ${c.owner} for approval` });
      }
      return { ok: true, sb: next };
    }

    case "owner": {
      const j = job(a.jobId);
      if (!j || j.stage !== "owner") return { ok: false, error: "This quote has already been approved or declined." };
      const decision = oneOf(a.decision, ["approved", "declined"] as const);
      if (!decision) return { ok: false, error: "Choose approve or decline." };
      const note = text(a.note, 300);
      j.ownerDecision = { decision, at: now, note: note || undefined };
      if (decision === "approved") {
        // Never book a time that has already passed.
        const lead = slots(next.region, earliestVisit(next, j, now), 1, 0)[0];
        if (!j.bookedFor || j.bookedFor < lead) j.bookedFor = lead;
        enter(j, "booked", now);
        j.events.push({ at: now, by: "owner", text: `Approved by the ${c.owner}, visit booked` });
      } else {
        j.hold = "ownerDeclined";
        enter(j, "new", now);
        j.events.push({ at: now, by: "owner", text: `Declined by the ${c.owner}${note ? `: "${note}"` : ""}. The repair is still needed: call the ${c.owner}.` });
      }
      return { ok: true, sb: next };
    }

    case "ownerQuestion": {
      const j = job(a.jobId);
      const q = text(a.text, 300);
      if (!j || j.stage !== "owner") return { ok: false, error: "This quote has already been approved or declined." };
      if (!q) return { ok: false, error: "Type your question first." };
      if (j.events.length >= MAX_EVENTS) return LONG;
      j.ownerQuestion = q;
      j.events.push({ at: now, by: "owner", text: `Asked: "${q}"` });
      return { ok: true, sb: next };
    }

    case "requote": {
      const j = job(a.jobId);
      if (!j || j.hold !== "ownerDeclined") return handled;
      if (j.events.length >= MAX_EVENTS) return LONG;
      j.hold = undefined;
      j.quote = undefined;
      j.ownerDecision = undefined;
      enter(j, "sent", now);
      j.events.push({ at: now, by: "manager", text: "Asked for a second quote" });
      return { ok: true, sb: next };
    }

    case "complete": {
      const j = job(a.jobId);
      if (!j || j.stage !== "booked") return handled;
      j.donePhoto = typeof a.photo === "string" && /^ph[a-z0-9]{6,20}$/.test(a.photo) ? a.photo : undefined;
      j.completedAt = now;
      enter(j, "done", now);
      j.events.push({ at: now, by: "contractor", text: j.donePhoto ? "Marked complete with a photo" : "Marked complete" });
      return { ok: true, sb: next };
    }

    case "invoice": {
      const j = job(a.jobId);
      if (!j || j.stage !== "done" || j.invoice) return handled;
      const amount = amountOf(a.amount);
      if (amount === null) return { ok: false, error: "Enter the invoice amount, for example 380 or 380.50." };
      // Every invoice is checked: against the approved quote, or the work order's not-to-exceed amount
      // (the owner's limit, or the agency's urgent limit for urgent and tenant-charged work).
      const approved = j.quote?.amount ?? j.cap ?? R.urgentLimit;
      const over = amount > approved * 1.1 + 0.005;
      j.invoice = { amount, at: now, overApproved: over };
      j.events.push({ at: now, by: "contractor", text: `Invoice uploaded: ${money(next.region, amount)} incl. ${c.tax}` });
      if (over) {
        j.events.push({ at: now, by: "tapline", text: `Held: the invoice is more than 10% over the approved ${money(next.region, approved)}. A manager needs to check it.` });
        return { ok: true, sb: next };
      }
      return bill(next, j, now);
    }

    case "approveInvoice": {
      const j = job(a.jobId);
      if (!j || j.stage !== "done" || !j.invoice?.overApproved) return handled;
      j.events.push({ at: now, by: "manager", text: "Approved the invoice above the agreed amount" });
      return bill(next, j, now);
    }

    case "complianceJob": {
      const item = next.compliance.find((x) => x.id === a.complianceId);
      if (!item) return { ok: false, error: "We couldn't find that check. Reload the page and try again." };
      if (next.jobs.some((j) => j.complianceId === item.id && j.stage !== "billed")) return { ok: false, error: "A job for this check is already open." };
      if (next.jobs.length >= MAX_JOBS) return { ok: false, error: "This demo is full. Use Reset demo to start again." };
      const rule = R.compliance.find((x) => x.kind === item.kind)!;
      const con = contractorFor(next, rule.trade, false, now);
      if (!con) return { ok: false, error: `No ${c.contractor} with current licence and insurance for this check.` };
      const p = next.properties.find((x) => x.id === item.propertyId)!;
      const o = next.owners.find((x) => x.id === p.ownerId)!;
      const j: Job = {
        id: newId(now),
        ref: nextRef(next),
        propertyId: item.propertyId,
        createdAt: now,
        stageEnteredAt: now,
        title: item.kind,
        description: `Scheduled check. Last done ${new Date(item.lastDoneAt).toLocaleDateString(R.locale, { timeZone: R.tz, day: "numeric", month: "short", year: "numeric" })}.`,
        trade: rule.trade,
        urgency: "routine",
        stage: "sent",
        complianceId: item.id,
        contractorId: con.id,
        cap: o.approvalLimit,
        access: { mode: p.keysAtOffice ? "keys" : "home", note: "", pets: false },
        triage: { source: "rules", at: now, trade: rule.trade, urgency: "routine", reason: rule.basisNote, safety: [], emergency: [], reply: "", chargeTo: "owner", strataReferral: false, insuranceClaim: false, confirmedAt: now },
        events: [
          { at: now, by: "manager", text: "Created from the compliance view" },
          { at: now, by: "tapline", text: `${cap(c.workOrder)} sent to ${con.business}, up to ${money(next.region, o.approvalLimit)}` },
        ],
      };
      next.jobs.push(j);
      return { ok: true, sb: next, jobId: j.id };
    }
  }
  return { ok: false, error: "Something went wrong. Reload the page and try again." };
}

function bill(sb: Sandbox, j: Job, now: number): Result {
  const c = terms(sb.region);
  enter(j, "billed", now);
  j.billedAt = now;
  j.events.push({ at: now, by: "tapline", text: `Bill entered in ${c.accounts}${j.triage?.chargeTo === "tenant" ? ", charged to the tenant" : ""}` });
  // A finished compliance job rolls its check forward.
  if (j.complianceId) {
    const item = sb.compliance.find((x) => x.id === j.complianceId);
    const rule = item && REGION[sb.region].compliance.find((x) => x.kind === item.kind);
    if (item && rule) {
      item.lastDoneAt = j.completedAt ?? now;
      item.dueAt = item.lastDoneAt + rule.everyDays * D;
    }
  }
  return { ok: true, sb, jobId: j.id };
}

/** Repeat link for a job, from the same rule the seed and the board use. */
export function repeatOf(sb: Sandbox, j: Job, trade: Trade) {
  const e = priorRelated(sb.jobs, j, trade);
  return e ? { ref: e.ref, title: e.title, trade: e.trade, daysAgo: Math.round((j.createdAt - e.createdAt) / D) } : undefined;
}
