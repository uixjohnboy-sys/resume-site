import { JOBS, type JobKind, ADD_ONS, FEES } from "./pack.ts";
import { SEED_NAMES } from "./seed.ts";
import type { LedgerEntry, Offer } from "./types.ts";

// The customer never reads unchecked model text. Whatever trips this is replaced whole by a template built from what really
// happened, so a false alarm costs nothing but wording, and a false claim can never be shown.

/** Commitment, link and code trips count toward turning the model off. Format mismatches do not. */
export type Trip = { reason: string; strike: boolean; safety?: boolean };
export type GuardCtx = {
  ledger: LedgerEntry[];
  offers: Offer[];
  bedrooms: number | null;
  /** First names and digits the customer themselves used. */
  customerText: string;
  firstName: string | null;
};

const MAX_WORDS = 80;

const SAFETY = /\b(first aid|rinse|flush (it|your)|open (the |all )?windows?|ventilate|evacuat\w*|get out of the house|leave the house|seek medical|see a doctor|poisons? (line|information)|13 ?11 ?26|safe to (mix|use|combine)|don't mix|do not mix|never mix)\b/i;
const NEVER: [RegExp, string][] = [
  [/\b(bond|deposit)\b.{0,40}\b(guarantee\w*|you'?ll get|will get|get it back|back for sure|definitely)\b|\bguarantee\w*\b.{0,40}\bbond\b/i, "promised the bond"],
  [/\b(your|the) (lease|agent|landlord|property manager) (can|can't|cannot|must|has to|requires?|is allowed)\b|\b(legally|by law)\b/i, "tenancy advice"],
  [/\b(safe (for|around)|non[- ]?toxic|eco[- ]?friendly|hypoallergenic|disinfect\w*|kills? (germs|bacteria|viruses)|gone for good|asthma[- ]friendly|allergy[- ]friendly)\b/i, "a health or product claim"],
  [/\b(we'?ll|we will|i'?ll|i will) (refund|replace|repair|reimburse)\b|\binsurance (will )?(cover|pay)\b/i, "promised a refund or cover"],
  [/\blicen[cs]ed\b/i, "claimed a licence"],
  [/\b(same (cleaner|team) (every|each)|always the same)\b/i, "promised the same cleaner"],
  [/\b(ndis|aged care|home care)\b.{0,30}\b(yes|we (can|do)|accepted?|covered|billing is)\b|\b(we (can|do)|yes)\b.{0,30}\b(ndis|aged care|home care)\b/i, "agreed to funding billing"],
  [/\b(cash (discount|job)|no gst|no invoice|without (an )?invoice)\b/i, "a cash arrangement"],
  [/\bi('?m| am) (dana|a person|human|a real person)\b/i, "claimed to be a person"],
  [/\bhome (will be )?empty\b.{0,20}\b(on|until|from)\b/i, "said when a home is empty"],
];

const sentences = (t: string) => t.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
const has = (ledger: LedgerEntry[], kind: LedgerEntry["kind"]) => ledger.some((l) => l.kind === kind);

const kindOf = (s: string): JobKind | null => {
  if (/\b(end of lease|bond clean|vacate|move[- ]?out|exit clean)\b/i.test(s)) return "lease";
  if (/\b(deep|first clean|first visit|spring|one[- ]?off|once[- ]?off)\b/i.test(s)) return "deep";
  if (/\b(regular|fortnight\w*|weekly|week|after that|each visit)\b/i.test(s)) return "regular";
  return null;
};

function checkPrices(text: string, ctx: GuardCtx): Trip | null {
  let previous: JobKind | null = null;
  const fromOffers = new Set(ctx.offers.map((o) => o.price));
  for (const s of sentences(text)) {
    const here = kindOf(s);
    const kind = here ?? previous;
    for (const m of s.matchAll(/\$\s?(\d[\d,]*)(\.\d{2})?/g)) {
      const value = Number(m[1].replace(/,/g, ""));
      const addOn = (/\boven\b/i.test(s) && value === ADD_ONS.oven.price) || (/\bfridge\b/i.test(s) && value === ADD_ONS.fridge.price) || (/\bbathroom\b/i.test(s) && value === ADD_ONS.bathroom.price);
      const fee = /\b(fee|late|cancel\w*|mov\w*|charge)\b/i.test(s) && (value === FEES.moveFee || value === FEES.leaseFee);
      if (addOn || fee) continue;
      const bed = s.match(/\b([1-4])[- ]?(bed\w*|br)\b|\bstudio\b/i);
      const beds = bed ? (bed[1] ? Number(bed[1]) : 1) : ctx.bedrooms;
      const rows = Object.values(JOBS).filter((j) => (!kind || j.kind === kind) && (beds === null || j.beds === beds));
      const ok = kind !== null && rows.some((j) => j.price === value);
      if (!ok && !(kind === null && fromOffers.has(value))) return { reason: "a price that does not match its job", strike: false };
    }
    if (here) previous = here;
  }
  return null;
}

function checkClaims(text: string, ctx: GuardCtx): Trip | null {
  const done = has(ctx.ledger, "booked") || has(ctx.ledger, "moved");
  for (const s of sentences(text)) {
    if (s.endsWith("?")) continue;
    if (/\b(booked|confirmed|locked in|you'?re (all )?set|got you down|in the (diary|calendar))\b/i.test(s) && !/\b(once|when|after|if|until|before|not)\b.{0,30}\b(booked|confirmed)\b/i.test(s) && !done) {
      return { reason: "claimed a booking that does not exist", strike: true };
    }
    if (/\b(moved|rescheduled|shifted)\b/i.test(s) && !/\b(once|when|after|if)\b/i.test(s) && !has(ctx.ledger, "moved")) {
      return { reason: "claimed a move that did not happen", strike: true };
    }
    if (/\b(cancel+ed|cancel+ing it)\b/i.test(s) && !/\bif\b/i.test(s) && !/\b(free|fee|before)\b/i.test(s)) {
      return { reason: "claimed a cancellation", strike: true };
    }
    if (/\b(passed|passing|sent|forwarded|flagged|told|let) .{0,20}\bdana\b|\bdana\b.{0,30}\b(will|'ll|she'?ll) (call|ring|text|contact|reply|get back)\b|\bshe'?ll (call|ring|text)\b/i.test(s) && !/\b(afternoon before|lockbox|address|on the day|before we start)\b/i.test(s) && !has(ctx.ledger, "handoff")) {
      return { reason: "claimed a hand-off that did not happen", strike: true };
    }
  }
  return null;
}

export function guardReply(text: string, ctx: GuardCtx): Trip | null {
  const t = text.trim();
  if (!t) return { reason: "no reply", strike: false };
  if (/https?:\/\/|www\.|\b[\w.-]+\.(com|au|org|net)\b|[\w.]+@[\w.]+/i.test(t)) return { reason: "a link or address", strike: true };
  if (/```|<\/?[a-z]+>|\bfunction\s*\(|\bslot_|\bs\d{1,4}\b|refusal|tool call/i.test(t)) return { reason: "code or internal words", strike: true };
  if (t.split(/\s+/).length > MAX_WORDS) return { reason: "too long", strike: true };
  if (SAFETY.test(t)) return { reason: "safety advice", strike: false, safety: true };
  for (const [r, why] of NEVER) if (r.test(t)) return { reason: why, strike: false };
  for (const s of sentences(t)) if (s.endsWith("?") && /\b(street |full |home )?address\b|\b(lockbox |access |gate |alarm )?code\b|\bpin\b/i.test(s)) return { reason: "asked for an address or code", strike: false };
  const claim = checkClaims(t, ctx);
  if (claim) return claim;
  const price = checkPrices(t, ctx);
  if (price) return price;

  const known = /\b(\d{1,2})(:\d{2})?\s?(am|pm)\b/gi;
  for (const m of t.matchAll(known)) {
    const hour = `${Number(m[1])} ${m[3].toLowerCase()}`;
    if (!["8 am", "9 am", "11 am", "12 pm", "1 pm", "2 pm", "4 pm", "3 pm", "5 pm"].includes(hour) || m[2]) return { reason: "a time not offered", strike: false };
  }
  const said = ctx.customerText.replace(/\D/g, "");
  for (const m of t.matchAll(/\+?\d[\d\s-]{6,}\d/g)) {
    const d = m[0].replace(/\D/g, "");
    if (!said.includes(d)) return { reason: "a phone number nobody gave", strike: false };
  }
  for (const name of SEED_NAMES) {
    if (name !== ctx.firstName && new RegExp(`\\b${name}\\b`).test(t) && !new RegExp(`\\b${name}\\b`, "i").test(ctx.customerText)) return { reason: "another customer's name", strike: false };
  }
  return null;
}
