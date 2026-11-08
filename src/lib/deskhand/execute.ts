import {
  ADD_ONS,
  AREA,
  BOOKABLE_DAYS,
  DAYS,
  FEES,
  HANDOFF_KEYS,
  HANDOFF_REASONS,
  JOBS,
  JOB_KEYS,
  JOB_KIND_LABEL,
  NOW,
  TEAMS,
  TRAVEL,
  WINDOWS,
  closeOf,
  minuteOf,
  type DayKey,
  type HandoffReason,
  type JobKey,
  type Team,
} from "./pack.ts";
import type { Contact, LedgerEntry, LogEntry, Offer, Sandbox, Stage, Visit } from "./types.ts";
import { CARDS, type CardId } from "./seed.ts";

// The only code that changes a sandbox. The model proposes and this decides: every call is validated against the data and the
// business pack, and the state change and its log entry are written together, so the log can never claim what did not happen.

export type Actor = LogEntry["actor"];
export type ToolResult = { ok: true; data: Record<string, unknown> } | { ok: false; code: string; next: string; alternatives?: unknown };
export type ExecCtx = { actor: Actor; customerText: string; at: number; ledger: LedgerEntry[] };

const clockOf = (turn: number) => {
  const m = 9 * 60 + 40 + turn;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")} am`;
};

export function addLog(sb: Sandbox, entry: Omit<LogEntry, "seq" | "conv" | "who" | "clock">): LogEntry {
  const who = sb.contacts.find((c) => c.id === sb.conv.contactId)?.firstName ?? "New customer";
  const full = { ...entry, seq: ++sb.seq, conv: sb.convNo, who, clock: clockOf(sb.conv.turn) };
  sb.log.push(full);
  return full;
}

const refuse = (sb: Sandbox, ctx: ExecCtx, tool: string, code: string, text: string, next: string, alternatives?: unknown): ToolResult => {
  addLog(sb, { at: ctx.at, actor: ctx.actor, tool, status: "refused", code, text });
  ctx.ledger.push({ kind: "refused", code });
  return { ok: false, code, next, alternatives };
};

export const currentContact = (sb: Sandbox): Contact | null => sb.contacts.find((c) => c.id === sb.conv.contactId) ?? null;

function setStage(c: Contact, stage: Stage) {
  c.stage = stage;
}

export const windowLabel = (start: number) => WINDOWS.find((w) => w.start === start)?.label ?? "";
export const slotLabel = (day: DayKey, start: number) => {
  const d = DAYS[day].label;
  return `${d[0].toUpperCase()}${d.slice(1)}, arriving between ${windowLabel(start)}`;
};
const jobLabel = (key: JobKey) => `${JOB_KIND_LABEL[JOBS[key].kind]}, ${JOBS[key].beds}-bed`;
const digits = (s: string) => s.replace(/\D/g, "");
const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];

/**
 * The booking a verified customer is working on: one made or moved in this sandbox first (the newest), else their next one.
 * Not simply the first match, which moved an older booking when a customer came back (G4 QA, M1 and M4).
 */
export function activeVisit(sb: Sandbox, contactId: string | null): Visit | undefined {
  if (!contactId) return undefined;
  const ahead = sb.visits.filter((v) => v.contactId === contactId && minuteOf(v.day, v.start) > NOW);
  return ahead.filter((v) => v.isNew).at(-1) ?? [...ahead].sort((a, b) => minuteOf(a.day, a.start) - minuteOf(b.day, b.start))[0];
}

/** A day the customer named in this message ("Friday", "next Tuesday"), as the bookable days it can mean. */
function daysNamed(text: string): DayKey[] {
  const t = text.toLowerCase();
  const names: [RegExp, string][] = [[/\bmon(day)?\b/, "mon"], [/\btue(s|sday)?\b/, "tue"], [/\bwed(nesday)?\b/, "wed"], [/\bthu(rs|rsday)?\b/, "thu"], [/\bfri(day)?\b/, "fri"], [/\bsat(urday)?\b/, "sat"]];
  const hit = names.filter(([r]) => r.test(t)).map(([, d]) => d);
  if (hit.length !== 1) return [];
  const next = /\bnext (week|mon|tue|wed|thu|fri|sat)/.test(t);
  return BOOKABLE_DAYS.filter((d) => d === (next ? `next-${hit[0]}` : hit[0]) || (!next && d === `next-${hit[0]}`));
}

/** True when a job of this length starts at the window and leaves the team's other visits their travel time. */
export function teamFree(visits: Visit[], team: Team, day: DayKey, start: number, minutes: number, ignore?: string) {
  if (start + minutes > closeOf(day)) return false;
  return !visits.some((v) => {
    if (v.id === ignore || v.team !== team || v.day !== day) return false;
    return start < v.start + v.minutes + TRAVEL && v.start < start + minutes + TRAVEL;
  });
}

function saveContact(sb: Sandbox, input: Record<string, unknown>, ctx: ExecCtx): ToolResult {
  const c = currentContact(sb);
  if (!c) return refuse(sb, ctx, "save_contact", "NO_CONVERSATION", "No customer in this conversation", "Say you can't do that here.");
  const said = sb.conv.messages.filter((m) => m.from === "customer").map((m) => m.text).join(" ").toLowerCase();
  const before = { firstName: c.firstName, suburb: c.suburb, phone: c.phone, bedrooms: c.bedrooms, access: c.access, frequency: c.frequency, notes: c.notes };
  const changed: Record<string, unknown> = {};
  const stage = c.stage;

  if (typeof input.first_name === "string" && input.first_name.trim()) {
    const name = input.first_name.replace(/[^\p{L} '-]/gu, "").trim().slice(0, 40);
    if (!said.includes(name.toLowerCase()) && name !== c.firstName) {
      return refuse(sb, ctx, "save_contact", "NOT_SAID", "Name not saved: the customer has not said it", "Ask the customer for their first name.");
    }
    // A matched booking keeps its owner's name: whoever typed the number, the record is not renamed (G4 QA, M1).
    if (c.id === sb.conv.verifiedContactId && c.firstName && name.toLowerCase() !== c.firstName.toLowerCase()) {
      return refuse(sb, ctx, "save_contact", "NOT_THEIR_NAME", "Name not changed: the booking is under another name", "Keep the name on the booking. Dana can update it.");
    }
    c.firstName = name;
    changed.firstName = name;
  }
  if (typeof input.suburb === "string" && input.suburb.trim()) {
    const known = AREA.find((a) => a.toLowerCase() === (input.suburb as string).trim().toLowerCase());
    c.suburb = known ?? "other";
    changed.suburb = c.suburb;
  }
  if (typeof input.phone === "string" && input.phone.trim() && !(c.phone && digits(c.phone) === digits(input.phone))) {
    const wanted = digits(input.phone);
    const inText = sb.conv.messages.filter((m) => m.from === "customer").some((m) => digits(m.text).includes(wanted) || m.text.includes(input.phone as string));
    if (!inText) return refuse(sb, ctx, "save_contact", "NOT_SAID", "Phone not saved: the customer has not said it", "Ask the customer for their mobile number.");
    c.phone = input.phone.trim().slice(0, 20);
    changed.phone = c.phone;
  }
  // Every value needs the customer's own word for it, or a receipt would promise what nobody asked for (G4 AI Quality, M4).
  const notSaid = (what: string) => refuse(sb, ctx, "save_contact", "NOT_SAID", `${what} not saved: the customer has not said it`, `Ask the customer about ${what.toLowerCase()}.`);
  if (typeof input.bedrooms === "number" && Number.isInteger(input.bedrooms) && input.bedrooms >= 1 && input.bedrooms <= 8 && input.bedrooms !== c.bedrooms) {
    const n = input.bedrooms;
    if (!new RegExp(`\\b(${n}|${NUMBER_WORDS[n]})\\b`).test(said) && !(n === 1 && /\bstudio\b/.test(said))) return notSaid("Bedrooms");
    c.bedrooms = n;
    changed.bedrooms = n;
  }
  if ((input.access === "home" || input.access === "lockbox") && input.access !== c.access) {
    const heard = input.access === "home" ? /\bhome\b|\bbe (there|in|around)\b|\blet (you|them|the team) in\b/ : /\block ?box\b|\bkey ?safe\b|\bkey box\b|\bleave (a |the )?keys?\b|\bhidden key\b/;
    if (!heard.test(said)) return notSaid("Access");
    c.access = input.access;
    changed.access = input.access;
  }
  if ((input.frequency === "weekly" || input.frequency === "fortnightly") && input.frequency !== c.frequency) {
    const heard = input.frequency === "weekly" ? /\bweekly\b|\bevery week\b|\beach week\b|\bonce a week\b/ : /\bfortnight\w*\b|\bevery (two|2) weeks\b|\bevery (other|second) week\b/;
    if (!heard.test(said)) return notSaid("How often");
    c.frequency = input.frequency;
    changed.frequency = input.frequency;
  }
  if (typeof input.notes === "string" && input.notes.trim()) {
    // Notes are the customer's words, lightly shortened: most of their longer words must be ones the customer used.
    const words = input.notes.toLowerCase().match(/[a-z]{4,}/g) ?? [];
    const heard = words.filter((w) => said.includes(w.slice(0, 5))).length;
    if (words.length && heard / words.length < 0.6) return notSaid("Notes");
    c.notes = input.notes.trim().slice(0, 200);
    changed.notes = c.notes;
  }
  if (c.firstName && c.suburb && c.phone && c.access && c.stage === "New enquiry") setStage(c, "Details collected");
  // A small model often re-sends what it already saved. Only a real difference is a change, and only a change is logged.
  const labels: Record<string, string> = { firstName: "name", suburb: "suburb", phone: "mobile", bedrooms: "bedrooms", access: "access", frequency: "how often", notes: "notes" };
  const real = Object.keys(changed).filter((k) => before[k as keyof typeof before] !== changed[k]);
  const stageBefore = stage;
  // Dana's open card follows the contact: the name and mobile, and anything new the customer adds, so "I've passed that on" is true.
  for (const h of sb.handoffs.filter((x) => x.contactId === c.id)) {
    if (c.firstName) h.customer = c.firstName;
    if (c.phone) h.phone = c.phone;
    for (const k of real.filter((x) => x === "notes" || x === "frequency" || x === "bedrooms")) {
      const item = `${labels[k][0].toUpperCase()}${labels[k].slice(1)}: ${String(changed[k])}`;
      if (!h.items.includes(item)) h.items.push(item);
    }
  }
  if (real.length) {
    const after = Object.fromEntries(real.map((k) => [k, changed[k]]));
    addLog(sb, { at: ctx.at, actor: ctx.actor, tool: "save_contact", status: "done", text: `Contact updated: ${real.map((k) => labels[k]).join(", ")}${c.stage !== stageBefore ? `. Pipeline: ${c.stage}` : ""}`, before, after });
  }
  return { ok: true, data: { saved: Object.keys(changed), stage: c.stage } };
}

function getOpenSlots(sb: Sandbox, input: Record<string, unknown>, ctx: ExecCtx): ToolResult {
  const c = currentContact(sb);
  const moving = activeVisit(sb, sb.conv.verifiedContactId);
  const jobKey = (moving?.jobKey ?? input.job_key) as JobKey;
  if (!JOB_KEYS.includes(jobKey)) return refuse(sb, ctx, "get_open_slots", "UNKNOWN_JOB", "Job not on the price list", "Use hand_off with reason size if this cannot be priced.");
  const suburb = moving?.suburb ?? c?.suburb;
  if (!suburb) return refuse(sb, ctx, "get_open_slots", "NEED_SUBURB", "Calendar not checked: no suburb yet", "Ask which suburb.");
  if (suburb === "other") return refuse(sb, ctx, "get_open_slots", "OUT_OF_AREA", "Calendar not checked: outside the service area", "Say you don't get out there.");
  const job = JOBS[jobKey];
  const existing = c?.existing || Boolean(moving);
  if (job.kind === "regular" && !existing) {
    const deep = `deep-${job.beds}` as JobKey;
    return refuse(sb, ctx, "get_open_slots", "FIRST_VISIT_IS_DEEP", "Regular clean refused: a new customer's first visit is a deep clean", "Explain the first clean is a deep clean, then check that job.", JOB_KEYS.includes(deep) ? { job_key: deep, price: JOBS[deep].price } : { hand_off: "size" });
  }
  let lease: DayKey[] | null = null;
  if (job.kind === "lease") {
    const from = input.empty_from_day as DayKey;
    const until = input.inspection_day as DayKey;
    if (!BOOKABLE_DAYS.includes(from) && !DAYS[from]) return refuse(sb, ctx, "get_open_slots", "NEED_LEASE_DAYS", "Calendar not checked: need the day it is empty and the inspection day", "Ask which day of the week the home will be empty from and which day of the week the final inspection is.");
    if (!DAYS[until]) return refuse(sb, ctx, "get_open_slots", "NEED_LEASE_DAYS", "Calendar not checked: need the day it is empty and the inspection day", "Ask which day of the week the home will be empty from and which day of the week the final inspection is.");
    lease = BOOKABLE_DAYS.filter((d) => DAYS[d].index >= DAYS[from].index && DAYS[d].index < DAYS[until].index);
    if (!lease.length) return leaseToDana(sb, ctx, jobKey, from, until);
  }
  let minutes: number = job.minutes;
  let price: number = job.price;
  if (input.add_oven === true && job.kind !== "lease") { minutes += ADD_ONS.oven.minutes; price += ADD_ONS.oven.price; }
  if (input.add_fridge === true) { minutes += ADD_ONS.fridge.minutes; price += ADD_ONS.fridge.price; }
  const extra = typeof input.extra_bathrooms === "number" ? Math.min(3, Math.max(0, Math.floor(input.extra_bathrooms))) : 0;
  minutes += extra * ADD_ONS.bathroom.minutes;
  price += extra * ADD_ONS.bathroom.price;

  // A day the model did not pass but the customer named ("any Friday?") still narrows the search, so the four windows are on that day.
  const named = daysNamed(ctx.customerText);
  const asked = typeof input.day === "string" && BOOKABLE_DAYS.includes(input.day as DayKey) ? [input.day as DayKey] : named.length ? named : BOOKABLE_DAYS;
  const teams = (Object.keys(TEAMS) as Team[]).filter((t) => TEAMS[t].jobs.includes(job.kind));
  const search = (days: DayKey[]) => {
    const found: Offer[] = [];
    for (const day of lease ? days.filter((d) => lease.includes(d)) : days) {
      for (const w of WINDOWS) {
        const team = teams.find((t) => teamFree(sb.visits, t, day, w.start, minutes, moving?.id));
        if (team && found.length < 4 && !(moving && moving.day === day && moving.start === w.start)) {
          found.push({ id: `s${sb.nextOffer++}`, day, start: w.start, team, jobKey, minutes, price, label: slotLabel(day, w.start), turn: sb.conv.turn });
        }
      }
    }
    return found;
  };
  let offers = search(asked);
  if (!offers.length && asked !== BOOKABLE_DAYS) offers = search(BOOKABLE_DAYS);
  // A bond clean must land between move-out and inspection. With nothing free there, the job is Dana's, never "change the inspection" (G4 NP, M4).
  if (lease && !offers.length) return leaseToDana(sb, ctx, jobKey, input.empty_from_day as DayKey, input.inspection_day as DayKey);
  sb.conv.offers.push(...offers);
  addLog(sb, { at: ctx.at, actor: ctx.actor, tool: "get_open_slots", status: "checked", text: `Checked the calendar: ${offers.length} open windows for ${jobLabel(jobKey)}` });
  ctx.ledger.push({ kind: "slots", offerIds: offers.map((o) => o.id) });
  // The windows can go out before the last details are in, so say now what booking will still need.
  const stillNeed = c ? [!c.firstName && "first name", !c.phone && "mobile", !c.access && "home or lockbox"].filter(Boolean) : [];
  return { ok: true, data: { price, slots: offers.map((o) => ({ slot_id: o.id, label: o.label })), ...(stillNeed.length ? { ask_with_the_windows: stillNeed } : {}) } };
}

function leaseToDana(sb: Sandbox, ctx: ExecCtx, jobKey: JobKey, from: DayKey, until: DayKey): ToolResult {
  const summary = `End of lease, ${JOBS[jobKey].beds}-bed: empty from ${DAYS[from].label}, final inspection ${DAYS[until].label}. No window free before the inspection.`;
  handOff(sb, { reason: "leaseDates", summary }, { ...ctx, actor: "server" });
  return { ok: false, code: "NO_LEASE_WINDOW", next: "No window before the inspection, so the system has passed it to Dana with both days. Do not ask to move the inspection and do not promise a time." };
}

/** A turn books or moves once. A second call in the same turn would send the customer a second confirmation (G3 QA, M2). */
const doneThisTurn = (ctx: ExecCtx): ToolResult | null =>
  ctx.ledger.some((l) => l.kind === "booked" || l.kind === "moved") ? { ok: false, code: "ALREADY_DONE", next: "That is already done this turn. Do not call it again; the system adds the confirmation." } : null;

function bookVisit(sb: Sandbox, input: Record<string, unknown>, ctx: ExecCtx): ToolResult {
  const again = doneThisTurn(ctx);
  if (again) return again;
  const c = currentContact(sb);
  if (!c) return refuse(sb, ctx, "book_visit", "NO_CONVERSATION", "No customer in this conversation", "Say you can't do that here.");
  // A verified customer with a booking already on the calendar is moving it, whichever tool the model reached for. Booking again
  // would put the same household on the calendar twice (G2 v2, N1).
  const upcoming = sb.conv.verifiedContactId === c.id ? activeVisit(sb, c.id) : undefined;
  if (upcoming) return moveVisit(sb, { visit_id: upcoming.id, slot_id: input.slot_id }, ctx);
  const missing = [!c.firstName && "first name", !c.suburb && "suburb", !c.phone && "mobile", !c.access && "home or lockbox"].filter(Boolean);
  if (missing.length) return refuse(sb, ctx, "book_visit", "MISSING_DETAILS", `Booking refused: still need ${missing.join(", ")}`, `Ask for: ${missing.join(", ")}.`);
  const already = sb.visits.find((v) => v.contactId === c.id && v.isNew);
  if (already) return { ok: false, code: "ALREADY_BOOKED", next: `Already booked, ref ${already.ref}. Do not book again.` };
  if (sb.handoffs.some((h) => h.contactId === c.id && HANDOFF_REASONS[h.reason].ends)) {
    return refuse(sb, ctx, "book_visit", "HANDED_OFF", "Booking refused: this one is with Dana", "Say Dana will text them.");
  }
  const offer = sb.conv.offers.find((o) => o.id === input.slot_id);
  if (!offer) return refuse(sb, ctx, "book_visit", "NOT_OFFERED", "Booking refused: that window was never offered", "Call get_open_slots and offer the windows first.");
  if (offer.turn >= sb.conv.turn) return refuse(sb, ctx, "book_visit", "NOT_AGREED", "Booking refused: the customer has not picked a window yet", "Offer the windows and wait for their pick.");
  if (!teamFree(sb.visits, offer.team, offer.day, offer.start, offer.minutes)) {
    return refuse(sb, ctx, "book_visit", "SLOT_GONE", "Booking refused: that window has just gone", "Call get_open_slots and offer other windows.");
  }
  const visit: Visit = { id: `v${sb.nextRef}`, ref: `LH-${sb.nextRef++}`, contactId: c.id, customer: c.firstName ?? "", suburb: c.suburb ?? "", team: offer.team, day: offer.day, start: offer.start, jobKey: offer.jobKey, minutes: offer.minutes, price: offer.price, repeat: false, isNew: true };
  sb.visits.push(visit);
  setStage(c, "Booked");
  sb.conv.jobDone = true;
  sb.conv.doneTurn = sb.conv.turn;
  addLog(sb, { at: ctx.at, actor: ctx.actor, tool: "book_visit", status: "done", ref: visit.ref, text: `Booked ${visit.ref}: ${jobLabel(visit.jobKey)}, ${offer.label}, ${TEAMS[offer.team].label}`, after: { stage: "Booked" } });
  addLog(sb, { at: ctx.at, actor: "server", tool: "confirmation", status: "done", ref: visit.ref, text: "Confirmation and secure details link recorded (demo, not sent)" });
  ctx.ledger.push({ kind: "booked", visitId: visit.id });
  return { ok: true, data: { ref: visit.ref, note: "The system adds the confirmation to your reply. Do not repeat the details." } };
}

function moveVisit(sb: Sandbox, input: Record<string, unknown>, ctx: ExecCtx): ToolResult {
  const again = doneThisTurn(ctx);
  if (again) return again;
  const verified = sb.conv.verifiedContactId;
  if (!verified) return refuse(sb, ctx, "move_visit", "NOT_VERIFIED", "Move refused: no matching mobile number", "Ask what mobile the booking is under.");
  const visit = sb.visits.find((v) => v.id === input.visit_id && v.contactId === verified);
  if (!visit) return refuse(sb, ctx, "move_visit", "NOT_THEIR_VISIT", "Move refused: not a booking on this number", "Use the visit listed in the state block.");
  if (minuteOf(visit.day, visit.start) <= NOW) return refuse(sb, ctx, "move_visit", "ALREADY_HAPPENED", "Move refused: that visit has already started", "Use hand_off with reason question.");
  const offer = sb.conv.offers.find((o) => o.id === input.slot_id);
  if (!offer) return refuse(sb, ctx, "move_visit", "NOT_OFFERED", "Move refused: that window was never offered", "Call get_open_slots and offer the windows first.");
  if (offer.turn >= sb.conv.turn) return refuse(sb, ctx, "move_visit", "NOT_AGREED", "Move refused: the customer has not picked a window yet", "Offer the windows and wait for their pick.");
  if (offer.day === visit.day && offer.start === visit.start) return { ok: false, code: "ALREADY_THERE", next: `${visit.ref} is already in that window. Do not move it again.` };
  if (!teamFree(sb.visits, offer.team, offer.day, offer.start, visit.minutes, visit.id)) {
    return refuse(sb, ctx, "move_visit", "SLOT_GONE", "Move refused: that window has just gone", "Call get_open_slots and offer other windows.");
  }
  const lease = JOBS[visit.jobKey].kind === "lease";
  const free = lease ? FEES.leaseFree : FEES.moveFree;
  const feeAmount = lease ? FEES.leaseFee : FEES.moveFee;
  const late = minuteOf(visit.day, visit.start) - NOW < free;
  const consented = sb.conv.feeConsent?.visitId === visit.id && sb.conv.feeConsent.turn <= sb.conv.turn;
  if (late && !consented) {
    sb.conv.feeNotice = { visitId: visit.id, turn: sb.conv.turn };
    return refuse(sb, ctx, "move_visit", "FEE_NOTICE", `Move held: inside the free window, the $${feeAmount} fee must be agreed first`, `Tell the customer the $${feeAmount} fee and ask if they want to go ahead.`);
  }
  const fromLabel = slotLabel(visit.day, visit.start);
  const before = { day: visit.day, start: visit.start, team: visit.team };
  visit.day = offer.day;
  visit.start = offer.start;
  visit.team = offer.team;
  visit.isNew = true;
  const fee = late ? feeAmount : 0;
  addLog(sb, { at: ctx.at, actor: ctx.actor, tool: "move_visit", status: "done", ref: visit.ref, text: `Moved ${visit.ref} to ${offer.label}${fee ? `, $${fee} fee` : ""}`, before, after: { day: offer.day, start: offer.start, team: offer.team } });
  addLog(sb, { at: ctx.at, actor: "server", tool: "confirmation", status: "done", ref: visit.ref, text: "Confirmation recorded (demo, not sent)" });
  sb.conv.jobDone = true;
  sb.conv.doneTurn = sb.conv.turn;
  ctx.ledger.push({ kind: "moved", visitId: visit.id, fee, fromLabel });
  return { ok: true, data: { ref: visit.ref, note: "The system adds the confirmation to your reply. Do not repeat the details." } };
}

function handOff(sb: Sandbox, input: Record<string, unknown>, ctx: ExecCtx): ToolResult {
  const reason = input.reason as HandoffReason;
  if (!HANDOFF_KEYS.includes(reason)) return refuse(sb, ctx, "hand_off", "UNKNOWN_REASON", "Hand-off refused: unknown reason", "Use a listed reason.");
  const c = currentContact(sb) ?? (sb.conv.verifiedContactId ? sb.contacts.find((x) => x.id === sb.conv.verifiedContactId) ?? null : null);
  // Dana reads booking refs, never internal ids: "visit v17" becomes "LH-1017" (G4 NP and DD minors).
  const summary =
    typeof input.summary === "string"
      ? input.summary
          .replace(/[<>]/g, "")
          .replace(/\b(?:visit |booking )?(v\d+n?)\b/gi, (m, id) => sb.visits.find((v) => v.id === id)?.ref ?? m)
          .slice(0, 300)
      : "";
  const open = sb.handoffs.find((h) => h.reason === reason && h.contactId === (c?.id ?? null));
  const refused = sb.log.filter((l) => l.status === "refused" && l.conv === sb.convNo).slice(-3).map((l) => l.text);
  if (open) {
    // Told the customer it was passed on, so it has to be on the card.
    if (summary && !open.items.includes(summary)) open.items.push(summary);
    open.phone = c?.phone ?? open.phone;
    addLog(sb, { at: ctx.at, actor: ctx.actor, tool: "hand_off", status: "done", text: `Added to Dana's card: ${HANDOFF_REASONS[reason].label}` });
    ctx.ledger.push({ kind: "handoff", reason, added: true });
    return { ok: true, data: { note: "Added to the card Dana already has." } };
  }
  sb.handoffs.push({ id: `h${sb.handoffs.length + 1}`, contactId: c?.id ?? null, customer: c?.firstName ?? "Unknown caller", reason, items: summary ? [summary] : [], phone: c?.phone ?? null, promised: "Reply by 5 pm today", refused, actor: ctx.actor === "ai" ? "ai" : ctx.actor === "rules" ? "rules" : "server" });
  if (c && HANDOFF_REASONS[reason].ends) setStage(c, "Handed to Dana");
  addLog(sb, { at: ctx.at, actor: ctx.actor, tool: "hand_off", status: "done", text: `Handed to Dana: ${HANDOFF_REASONS[reason].label}`, after: c && HANDOFF_REASONS[reason].ends ? { stage: "Handed to Dana" } : undefined });
  if (HANDOFF_REASONS[reason].ends) {
    sb.conv.jobDone = true;
    sb.conv.doneTurn = sb.conv.turn;
  }
  ctx.ledger.push({ kind: "handoff", reason });
  return { ok: true, data: { note: "The system tells the customer when Dana will reply. Do not promise a time." } };
}

export function executeTool(sb: Sandbox, name: string, input: unknown, ctx: ExecCtx): ToolResult {
  const body = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  switch (name) {
    case "save_contact":
      return saveContact(sb, body, ctx);
    case "get_open_slots":
      return getOpenSlots(sb, body, ctx);
    case "book_visit":
      return bookVisit(sb, body, ctx);
    case "move_visit":
      return moveVisit(sb, body, ctx);
    case "hand_off":
      return handOff(sb, body, ctx);
    default:
      return refuse(sb, ctx, name.slice(0, 30), "UNKNOWN_TOOL", "Refused: not an allowed action", "Use only the listed tools.");
  }
}

/** Server-side phone check: reads digits from the customer's own message, so a number the model holds proves nothing. */
export function checkPhone(sb: Sandbox, text: string, ctx: ExecCtx) {
  const found = text.match(/0491[\s-]?57\d[\s-]?\d{3}/g);
  if (!found) return;
  // A card customer has one real mobile. Another customer's number, even one booked earlier in this sandbox, is not theirs (G3 QA, M3).
  const card = sb.conv.card && sb.conv.card in CARDS ? CARDS[sb.conv.card as CardId] : null;
  const cardMobile = card ? digits(("mobile" in card && card.mobile) || card.phone) : null;
  for (const raw of found) {
    const number = digits(raw);
    const contact = cardMobile && number !== cardMobile ? undefined : [...sb.contacts].reverse().find((c) => c.phone && digits(c.phone) === number && sb.visits.some((v) => v.contactId === c.id));
    if (contact) {
      if (sb.conv.verifiedContactId !== contact.id) {
        // From here the record being worked on is the real customer's. The blank enquiry opened for the call goes.
        const opened = currentContact(sb);
        if (opened && opened.id !== contact.id && !opened.existing && !sb.visits.some((v) => v.contactId === opened.id)) sb.contacts = sb.contacts.filter((c) => c.id !== opened.id);
        sb.conv.contactId = contact.id;
        sb.conv.verifiedContactId = contact.id;
        addLog(sb, { at: ctx.at, actor: "server", tool: "phone_check", status: "checked", code: "MATCH", text: `Mobile matched a booking under ${contact.firstName}` });
      }
      return;
    }
    const talkingAboutBooking = /\b(move|moving|resched\w*|change|booking|under|shift)\b/i.test(sb.conv.messages.filter((m) => m.from === "customer").map((m) => m.text).join(" "));
    const own = currentContact(sb)?.phone;
    if (talkingAboutBooking && !(own && digits(own) === number && !sb.conv.card)) {
      sb.conv.wrongPhones += 1;
      addLog(sb, { at: ctx.at, actor: "server", tool: "phone_check", status: "refused", code: "NO_MATCH", text: `No booking on a number ending ${number.slice(-3)}. Booking details not shown` });
      ctx.ledger.push({ kind: "refused", code: "NO_MATCH" });
    }
  }
}
