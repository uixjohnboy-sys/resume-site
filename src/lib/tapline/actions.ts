import { REGION, TRADE_IDS, emergencyText, isAfterHours, money, ruleTriage, slots, terms, tradeLabel } from "./rules";
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
  | { type: "accept"; jobId: string; slot: number }
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
const MAX_JOBS = 150;

// ---------- input checks ----------

const BIDI = /[‪-‮⁦-⁩‎‏]/g;
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F]/g;

/** Plain text: trimmed, control and bidi characters removed, newlines kept, cut by characters (not UTF-16 units). */
export function text(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  const s = v.replace(BIDI, "").replace(CONTROL, " ").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
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
  const owner = (j: Job) => next.owners.find((o) => o.id === prop(j).ownerId)!;
  const handled = { ok: false as const, error: "Someone has already dealt with this. The board has been refreshed." };

  switch (a.type) {
    case "report": {
      const p = next.properties.find((x) => x.id === a.propertyId);
      const title = text(a.title, 80);
      const description = text(a.description, 600);
      if (!p) return { ok: false, error: "We couldn't find that property. Reload the page and try again." };
      if (Array.from(title).length < 3) return { ok: false, error: "Please describe the problem in a few words." };
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
        events: [{ at: now, by: "tenant", text: "Reported by the tenant" }],
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
      j.events.push({
        at: now,
        by: "tapline",
        text: `${who} suggested: ${tradeLabel(next.region, a.triage.trade).toLowerCase()}, ${a.triage.urgency}${a.triage.repeatOf ? `, repeat of ${a.triage.repeatOf.ref}` : ""}`,
      });
      return { ok: true, sb: next };
    }

    case "autoDispatch": {
      // After hours, an urgent report gets the fixed safety text and the on-call
      // contractor straight away. The AI's own reply still waits for a person.
      const j = job(a.jobId);
      if (!j || j.stage !== "new" || !j.triage || j.triage.urgency !== "urgent") return { ok: false, error: "Not eligible." };
      const con = contractorFor(next, j.triage.trade, true, now);
      if (!con) return { ok: false, error: "No on-call contractor." };
      j.contractorId = con.id;
      j.trade = j.triage.trade;
      j.urgency = "urgent";
      j.ownerDecision = { decision: "urgent", at: now };
      enter(j, "sent", now);
      j.events.push({ at: now, by: "tapline", text: "After hours: the tenant was sent the safety steps automatically" });
      j.events.push({ at: now, by: "tapline", text: `After hours: on-call ${con.business} paged, ${c.owner} notified. Waiting for a manager to confirm the reply.` });
      return { ok: true, sb: next };
    }

    case "confirm": {
      const j = job(a.jobId);
      if (!j || !(j.stage === "new" || (j.stage === "sent" && j.afterHours && !j.triage?.confirmedAt))) return handled;
      const trade = oneOf(a.trade, TRADE_IDS);
      const urgency = oneOf(a.urgency, URGENCIES);
      const chargeTo = oneOf(a.chargeTo, CHARGES) ?? "owner";
      if (!trade || !urgency) return { ok: false, error: "Choose a trade and an urgency before confirming." };
      const reply = text(a.reply, 900);
      if (!reply) return { ok: false, error: "Write a reply to the tenant before confirming." };
      const safety = Array.isArray(a.safety) ? a.safety.map((s) => text(s, 200)).filter(Boolean).slice(0, 4) : [];
      if (!j.triage) {
        const rules = ruleTriage(`${j.title}. ${j.description}`);
        j.triage = { source: "rules", at: now, trade, urgency, reason: "Triaged by hand.", safety: [], emergency: emergencyText(next.region, rules.hazards), reply: "", chargeTo, strataReferral: false, insuranceClaim: false };
      }
      const t = j.triage;
      t.trade = trade;
      t.urgency = urgency;
      t.reply = reply;
      t.safety = urgency === "urgent" ? safety : [];
      t.chargeTo = chargeTo;
      t.strataReferral = a.strataReferral === true && !!prop(j).strata;
      t.insuranceClaim = a.insuranceClaim === true;
      // Keep the first confirmation time: it is the acknowledgement time.
      t.confirmedAt = t.confirmedAt ?? now;
      j.trade = trade;
      j.urgency = urgency;
      j.hold = undefined;
      j.events.push({ at: now, by: "manager", text: "Triage confirmed, reply sent to the tenant" });
      if (t.strataReferral) j.events.push({ at: now, by: "manager", text: `Referred to the ${c.strataBody}, ${prop(j).strata!.manager}` });
      if (t.insuranceClaim) j.events.push({ at: now, by: "manager", text: "Flagged as a possible insurance claim" });
      if (j.stage === "sent") return { ok: true, sb: next }; // already dispatched after hours
      // A strata referral still sends a contractor to make the home safe; the
      // cause and the cost go to the building manager when it is common property.
      const con = contractorFor(next, trade, urgency === "urgent", now);
      if (!con) return { ok: false, error: `No ${tradeLabel(next.region, trade).toLowerCase()} with current licence and insurance. Add one before sending.` };
      j.contractorId = con.id;
      if (urgency === "urgent") {
        j.ownerDecision = { decision: "urgent", at: now };
        j.events.push({ at: now, by: "tapline", text: `Urgent: sent to on-call ${con.business}, ${c.owner} notified` });
      } else if (chargeTo === "tenant") {
        j.events.push({ at: now, by: "tapline", text: `${cap(c.workOrder)} sent to ${con.business}, charged to the tenant` });
      } else {
        j.cap = owner(j).approvalLimit;
        j.events.push({ at: now, by: "tapline", text: `${cap(c.workOrder)} sent to ${con.business}, up to ${money(next.region, j.cap)}` });
      }
      enter(j, "sent", now);
      return { ok: true, sb: next };
    }

    case "accept": {
      const j = job(a.jobId);
      if (!j || j.stage !== "sent") return handled;
      const allowed = j.urgency === "urgent" ? [now + 30 * 60_000, now + 4 * H] : [now + H, now + 30 * D];
      const slot = typeof a.slot === "number" && Number.isFinite(a.slot) ? a.slot : NaN;
      if (!(slot >= allowed[0] - 60_000 && slot <= allowed[1])) return { ok: false, error: "Pick one of the times offered." };
      j.bookedFor = slot;
      if (!j.ownerDecision) j.ownerDecision = { decision: "auto", at: now };
      enter(j, "booked", now);
      const con = next.contractors.find((x) => x.id === j.contractorId);
      j.events.push({ at: now, by: "contractor", text: `${con?.business ?? "Contractor"} accepted and booked a visit` });
      return { ok: true, sb: next };
    }

    case "quote": {
      const j = job(a.jobId);
      if (!j || j.stage !== "sent" || j.urgency === "urgent") return handled;
      const amount = amountOf(a.amount);
      if (amount === null) return { ok: false, error: "Enter the quote amount, for example 380 or 380.50." };
      const note = text(a.note, 200) || "Labour and parts";
      j.quote = { amount, note, at: now };
      const earliest = typeof a.earliest === "number" && a.earliest > now && a.earliest < now + 30 * D ? a.earliest : slots(next.region, now, 1, 24)[0];
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
        const lead = slots(next.region, now, 1, 4)[0];
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
      j.ownerQuestion = q;
      j.events.push({ at: now, by: "owner", text: `Asked: "${q}"` });
      return { ok: true, sb: next };
    }

    case "requote": {
      const j = job(a.jobId);
      if (!j || j.hold !== "ownerDeclined") return handled;
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
      const approved = j.quote?.amount ?? j.cap;
      const over = approved !== undefined && amount > approved * 1.1 + 0.005;
      j.invoice = { amount, at: now, overApproved: over };
      j.events.push({ at: now, by: "contractor", text: `Invoice uploaded: ${money(next.region, amount)} incl. ${c.tax}` });
      if (over) {
        j.events.push({ at: now, by: "tapline", text: `Held: the invoice is more than the approved ${money(next.region, approved!)}. A manager needs to check it.` });
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
      if (!con) return { ok: false, error: "No contractor with current licence and insurance for this check." };
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
