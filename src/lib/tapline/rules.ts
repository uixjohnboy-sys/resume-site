import type { Region, Stage, Trade, Urgency } from "./types";

// Agency service targets. These are the demo agency's own settings, not law.
export const TARGET_HOURS: Record<Urgency, Partial<Record<Stage, number>>> = {
  urgent: { new: 1, quote: 2, owner: 2, booked: 4 },
  routine: { new: 24, quote: 48, owner: 48, booked: 120 },
};

export const STAGES: { id: Stage; label: string; waiting: string }[] = [
  { id: "new", label: "New", waiting: "Waiting on you" },
  { id: "quote", label: "Quote requested", waiting: "Waiting on tradie" },
  { id: "owner", label: "Awaiting owner", waiting: "Waiting on owner" },
  { id: "booked", label: "Booked", waiting: "Tradie booked" },
  { id: "done", label: "Done", waiting: "Waiting on invoice" },
  { id: "invoiced", label: "Invoiced", waiting: "Closed" },
];

export const TRADE_LABEL: Record<Trade, string> = {
  plumber: "Plumber",
  electrician: "Electrician",
  locksmith: "Locksmith",
  handyman: "Handyman",
  roofer: "Roofer",
  hvac: "Heating and cooling",
  pest: "Pest control",
  glazier: "Glazier",
};

export const REGION = {
  AU: {
    currency: "AUD",
    symbol: "A$",
    locale: "en-AU",
    agency: "Harbourline Property",
    city: "Sydney",
    urgentNote:
      "Urgent repairs are based on the NSW list (for example a burst water service, a serious roof leak, a gas leak, a failure of an essential service). General information, not legal advice.",
    compliance: ["Smoke alarm check", "Gas safety check", "Electrical safety check"],
    approvalLimit: 500,
  },
  UK: {
    currency: "GBP",
    symbol: "£",
    locale: "en-GB",
    agency: "Northgate Lettings",
    city: "Manchester",
    urgentNote:
      "Emergency repairs follow common letting-agent practice (for example no heating or hot water in winter, a major leak, an unsafe electrical fault, a property that cannot be secured). General information, not legal advice.",
    compliance: ["Gas Safety certificate", "EICR electrical report", "Smoke and CO alarm test"],
    approvalLimit: 300,
  },
} as const;

export function money(region: Region, n: number) {
  const r = REGION[region];
  return new Intl.NumberFormat(r.locale, { style: "currency", currency: r.currency, maximumFractionDigits: 0 }).format(n);
}

// Keyword rules: the fallback when the AI is unavailable, and the safety net
// that can only ever raise urgency, never lower it.
const URGENT_WORDS = [
  "burst",
  "flood",
  "flooding",
  "gushing",
  "gas",
  "spark",
  "smoke coming",
  "smoking",
  "burning smell",
  "smells burnt",
  "smells like burning",
  "no power",
  "power out",
  "no hot water",
  "no heating",
  "through the ceiling",
  "ceiling leak",
  "ceiling is leaking",
  "sewage",
  "toilet overflow",
  "toilet is overflowing",
  "locked out",
  "broken lock",
  "can't lock",
  "cannot lock",
  "smashed",
  "electric shock",
];

const TRADE_WORDS: [Trade, string[]][] = [
  ["plumber", ["leak", "tap", "toilet", "pipe", "water", "drain", "hot water", "shower", "sewage", "through the ceiling", "burst", "gas"]],
  ["electrician", ["power", "light", "switch", "socket", "powerpoint", "outlet", "spark", "fuse", "rcd", "electric", "fan"]],
  ["locksmith", ["lock", "key", "locked out", "deadbolt"]],
  ["glazier", ["window", "glass", "smashed", "cracked pane"]],
  ["roofer", ["roof", "gutter", "tile", "storm"]],
  ["hvac", ["heating", "boiler", "air con", "aircon", "air conditioning", "radiator", "heat pump"]],
  ["pest", ["mice", "rats", "cockroach", "ants", "termite", "wasp", "pest"]],
];

const GENERIC = ["water", "leak"];

// Whole-word start match, so "tap" does not fire on "laptop".
// The keyword lists hold only letters, spaces and apostrophes, so no escaping is needed.
const has = (t: string, w: string) => new RegExp("(^|[^a-z])" + w).test(t);

export function ruleTriage(text: string): { trade: Trade; urgency: Urgency; matched: string[] } {
  const t = text.toLowerCase();
  const matched = URGENT_WORDS.filter((w) => has(t, w));
  let trade: Trade = "handyman";
  let best = 0;
  for (const [tr, words] of TRADE_WORDS) {
    // Generic words (water, leak) count half, so "gutter overflowing, water
    // down the wall" goes to the roofer, not the plumber.
    const hits = words.filter((w) => has(t, w)).reduce((n, w) => n + (GENERIC.includes(w) ? 0.5 : 1), 0);
    if (hits > best) {
      best = hits;
      trade = tr;
    }
  }
  return { trade, urgency: matched.length ? "urgent" : "routine", matched };
}
