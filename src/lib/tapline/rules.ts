import type { ChargeTo, Region, Stage, Trade, Urgency } from "./types";

// Everything that changes between the Australian and the UK agency lives here:
// words, trades, money, time, compliance and the fixed emergency text. A region
// switch changes the vocabulary, not just the currency.

// ---------- regions ----------

type Terms = {
  owner: string; // "owner" / "landlord"
  owners: string;
  contractor: string; // "tradie" / "contractor"
  contractors: string;
  workOrder: string; // "work order" / "works order"
  manager: string; // "property manager" / "letting agent"
  powerPoint: string;
  switchboard: string;
  waterMain: string;
  strataBody: string; // "strata manager" / "block managing agent"
  accounts: string; // trust accounting system
  tax: string; // "GST" / "VAT"
};

export type ComplianceRule = {
  kind: string;
  everyDays: number;
  basis: "law" | "policy";
  basisNote: string;
  appliesTo: "all" | "gas" | "pool";
  trade: Trade;
};

export const REGION = {
  AU: {
    currency: "AUD",
    locale: "en-AU",
    tz: "Australia/Sydney",
    agency: "Harbourline Property",
    city: "Sydney",
    taxRate: 0.1,
    terms: {
      owner: "owner",
      owners: "owners",
      contractor: "tradie",
      contractors: "tradies",
      workOrder: "work order",
      manager: "property manager",
      powerPoint: "power point",
      switchboard: "switchboard",
      waterMain: "main water tap",
      strataBody: "strata manager",
      accounts: "PropertyMe",
      tax: "GST",
    } satisfies Terms,
    urgentNote:
      "Urgent repairs follow the NSW list (for example a burst water service, a serious roof leak, a gas leak, a dangerous electrical fault, a failure of an essential service such as hot water). General information, not legal advice.",
    entryNote: "NSW: at least 2 days' notice to the tenant for necessary repairs, unless urgent or agreed.",
    compliance: [
      { kind: "Smoke alarm check", everyDays: 365, basis: "law", basisNote: "NSW law, every 12 months", appliesTo: "all", trade: "electrician" },
      { kind: "Pool barrier certificate", everyDays: 1095, basis: "law", basisNote: "NSW law, every 3 years where there is a pool", appliesTo: "pool", trade: "handyman" },
      { kind: "Gas appliance service", everyDays: 730, basis: "policy", basisNote: "Agency policy, every 2 years where there is gas", appliesTo: "gas", trade: "gas" },
    ] as ComplianceRule[],
    limits: [300, 500, 500, 750, 1000],
  },
  UK: {
    currency: "GBP",
    locale: "en-GB",
    tz: "Europe/London",
    agency: "Northgate Lettings",
    city: "Manchester",
    taxRate: 0.2,
    terms: {
      owner: "landlord",
      owners: "landlords",
      contractor: "contractor",
      contractors: "contractors",
      workOrder: "works order",
      manager: "letting agent",
      powerPoint: "plug socket",
      switchboard: "consumer unit",
      waterMain: "stopcock",
      strataBody: "block managing agent",
      accounts: "Alto",
      tax: "VAT",
    } satisfies Terms,
    urgentNote:
      "Emergency repairs follow common letting-agent practice (for example no heating or hot water in cold weather, a major leak, an unsafe electrical fault, a home that cannot be secured, a gas or carbon monoxide alarm). General information, not legal advice.",
    entryNote: "England: at least 24 hours' written notice to the tenant, except in an emergency.",
    compliance: [
      { kind: "Gas Safety certificate", everyDays: 365, basis: "law", basisNote: "Law, every 12 months where there is gas", appliesTo: "gas", trade: "gas" },
      { kind: "EICR electrical report", everyDays: 1825, basis: "law", basisNote: "Law, at least every 5 years", appliesTo: "all", trade: "electrician" },
      { kind: "Smoke and CO alarm check", everyDays: 365, basis: "policy", basisNote: "Agency policy, yearly (law: working at each new tenancy)", appliesTo: "all", trade: "electrician" },
    ] as ComplianceRule[],
    limits: [200, 300, 300, 500, 750],
  },
} as const;

export const terms = (r: Region): Terms => REGION[r].terms;

// ---------- trades ----------

type TradeWords = { label: string; noun: string; work: string };
const T = (label: string, noun: string, work: string): TradeWords => ({ label, noun, work });

export const TRADES: Record<Region, Record<Trade, TradeWords>> = {
  AU: {
    plumber: T("Plumber", "a plumber", "plumbing"),
    gas: T("Gasfitter", "a licensed gasfitter", "gas work"),
    electrician: T("Electrician", "an electrician", "electrical work"),
    locksmith: T("Locksmith", "a locksmith", "locksmith work"),
    handyman: T("Handyman", "a handyman", "general repairs"),
    roofer: T("Roofer", "a roofer", "roofing"),
    hvac: T("Air conditioning", "an air conditioning technician", "air conditioning work"),
    pest: T("Pest control", "a pest controller", "pest control"),
    glazier: T("Glazier", "a glazier", "glazing"),
    damp: T("Mould and damp", "a mould and damp specialist", "mould treatment"),
  },
  UK: {
    plumber: T("Plumber", "a plumber", "plumbing"),
    gas: T("Gas Safe engineer", "a Gas Safe engineer", "gas work"),
    electrician: T("Electrician", "an electrician", "electrical work"),
    locksmith: T("Locksmith", "a locksmith", "locksmith work"),
    handyman: T("Handyman", "a handyman", "general repairs"),
    roofer: T("Roofer", "a roofer", "roofing"),
    hvac: T("Heating engineer", "a heating engineer", "heating work"),
    pest: T("Pest control", "a pest controller", "pest control"),
    glazier: T("Glazier", "a glazier", "glazing"),
    damp: T("Damp specialist", "a damp specialist", "damp and mould work"),
  },
};

export const TRADE_IDS = Object.keys(TRADES.AU) as Trade[];
export const tradeLabel = (r: Region, t: Trade) => TRADES[r][t].label;

/** One line per trade, so the AI picks the right one for each region. */
export function tradeGlossary(r: Region) {
  const g: Record<Trade, string> =
    r === "AU"
      ? {
          plumber: "water, taps, toilets, pipes, drains, hot water systems, leaks",
          gas: "gas leaks, gas smells, gas cooktops and gas heaters (licensed gasfitter)",
          electrician: "power, lights, power points, switchboards, safety switches, smoke alarms (hardwired)",
          locksmith: "locks, keys, lockouts, doors that will not secure",
          handyman: "doors, cupboards, handrails, fences, small carpentry, flyscreens",
          roofer: "roofs, tiles, gutters, downpipes, storm damage to the roof",
          hvac: "split systems, ducted air conditioning",
          pest: "mice, rats, cockroaches, termites, wasps, possums",
          glazier: "broken or cracked glass, windows, shower screens",
          damp: "mould, damp walls, condensation problems",
        }
      : {
          plumber: "water, taps, toilets, pipes, drains, leaks (not boilers)",
          gas: "gas leaks, gas smells, carbon monoxide alarms, gas hobs and fires (Gas Safe engineer)",
          electrician: "power, lights, plug sockets, consumer units, smoke alarms",
          locksmith: "locks, keys, lockouts, doors that will not secure",
          handyman: "doors, cupboards, handrails, fences, small carpentry",
          roofer: "roofs, slates, gutters, flashing, storm damage to the roof",
          hvac: "boilers, central heating, radiators, hot water from the boiler",
          pest: "mice, rats, cockroaches, wasps, bedbugs",
          glazier: "broken or cracked glass, windows, double glazing",
          damp: "damp, black mould, condensation, rising damp",
        };
  return TRADE_IDS.map((t) => `- ${t}: ${g[t]}`).join("\n");
}

// ---------- stages ----------

export function stageLabel(r: Region, s: Stage) {
  const c = terms(r);
  return {
    new: "New",
    sent: `With ${c.contractor}`,
    owner: `Waiting on ${c.owner}`,
    booked: "Visit booked",
    done: "Completed",
    billed: `Bill entered`,
  }[s];
}
export const STAGE_ORDER: Stage[] = ["new", "sent", "owner", "booked", "done", "billed"];

// Agency service targets, hours in a stage. The demo agency's settings, not law.
export const TARGET_HOURS: Record<Urgency, Partial<Record<Stage, number>>> = {
  urgent: { new: 1, sent: 1, owner: 2, booked: 4 },
  routine: { new: 24, sent: 48, owner: 48, booked: 168 },
};

// ---------- money and time ----------

export function money(region: Region, n: number) {
  const r = REGION[region];
  const whole = Math.abs(n - Math.round(n)) < 0.005;
  return new Intl.NumberFormat(r.locale, {
    style: "currency",
    currency: r.currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Tax included in a tax-inclusive amount. */
export const taxIn = (region: Region, gross: number) => Math.round((gross - gross / (1 + REGION[region].taxRate)) * 100) / 100;

// Times are shown in the agency's own time zone, whoever is viewing.
export function when(region: Region, t: number, withDay = true) {
  const r = REGION[region];
  return new Date(t).toLocaleString(r.locale, {
    timeZone: r.tz,
    ...(withDay ? { weekday: "short" as const } : {}),
    hour: "numeric",
    minute: "2-digit",
  });
}

export function day(region: Region, t: number) {
  const r = REGION[region];
  return new Date(t).toLocaleDateString(r.locale, { timeZone: r.tz, day: "numeric", month: "short", year: "numeric" });
}

/** Hour and weekday in the agency's zone. */
function local(region: Region, t: number) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: REGION[region].tz, hour: "numeric", minute: "numeric", weekday: "short", hour12: false }).formatToParts(t);
  const get = (k: string) => parts.find((p) => p.type === k)?.value ?? "";
  return { hour: Number(get("hour")) % 24, minute: Number(get("minute")), weekday: get("weekday") };
}

export function isAfterHours(region: Region, t: number) {
  const l = local(region, t);
  return l.weekday === "Sat" || l.weekday === "Sun" || l.hour < 8 || l.hour >= 18;
}

/** Next `count` half-hour visit slots inside business hours (Mon to Sat, 8:00 to 16:30), at least `leadHours` away. */
export function slots(region: Region, from: number, count: number, leadHours: number) {
  const out: number[] = [];
  let t = Math.ceil((from + leadHours * 3600_000) / 1800_000) * 1800_000;
  for (let guard = 0; out.length < count && guard < 2000; guard++, t += 1800_000) {
    const l = local(region, t);
    if (l.weekday === "Sun") continue;
    if (l.hour < 8 || l.hour > 16 || (l.hour === 16 && l.minute > 30)) continue;
    if (out.length && t - out[out.length - 1] < 3 * 3600_000) continue; // spread the choices out
    out.push(t);
  }
  return out;
}

// ---------- keyword rules: fallback and safety net ----------

export type Hazard = "gas" | "co" | "fire" | "electricWater" | "electric" | "ceiling" | "flood" | "security";

const HAZARDS: [Hazard, RegExp][] = [
  ["co", /\b(carbon monoxide|co alarm|co detector)\b/],
  ["gas", /\b(smell(s|ing)? (of )?gas|gas (leak|smell)|leaking gas|rotten eggs?)\b/],
  ["fire", /\b(fire|flames?|smoke (is )?coming|smoking|burning smell|smells? (like )?burn(ing|t))\b/],
  ["electricWater", /\b(water (in|from|through|near|dripping (from|onto|into)) (the )?(light|lights|light fitting|power ?point|socket|switch)|wet (light|socket|power ?point))\b/],
  ["electric", /\b(spark(s|ing|ed)?|exposed wires?|electric shock|shocked me|no power|power (is )?out|tripped (and|but) won't reset)\b/],
  ["ceiling", /\b(sagging|bulging|collaps(e|ed|ing)) (the )?ceiling|ceiling (is )?(sagging|bulging|collaps(e|ed|ing))\b/],
  ["flood", /\b(burst|flood(ed|ing)?|gushing|water (is )?pouring|through the ceiling|ceiling (is )?leaking|ceiling leak|sewage|toilet (is )?overflow(ing)?)\b/],
  ["security", /\b(won'?t lock|will not lock|cannot lock|can'?t lock|broken lock|locked out|forced (entry|open)|break-?in|broke in|broken into|smashed (the )?(back |front )?(window|door|glass)(es)?)\b/],
];

const URGENT_EXTRA = /\b(no hot water|no heating|boiler (has )?(stopped|broken|not working)|no water at all)\b/;

const TRADE_HINTS: [Trade, RegExp][] = [
  ["gas", /\b(gas|carbon monoxide|co alarm|cooktop|gas heater|gas hob)\b/],
  ["hvac", /\b(boiler|radiators?|central heating|split system|air ?con|air conditioning|heat pump|ducted)\b/],
  ["electrician", /\b(power|lights?|switch(es)?|sockets?|power ?points?|outlets?|spark(s|ing|ed)?|floodlights?|downlights?|fuse|rcd|safety switch|electric\w*|fan|smoke alarm|wires?)\b/],
  ["locksmith", /\b(locks?|keys?|locked out|deadbolt|won'?t lock|can'?t lock)\b/],
  ["glazier", /\b(window|glass|pane|smashed|double glazing|shower screen)\b/],
  ["roofer", /\b(roof|gutters?|tiles?|slates?|downpipe|flashing)\b/],
  ["pest", /\b(mice|mouse|rats?|cockroach(es)?|ants|termites?|wasps?|possums?|bed ?bugs?|pests?)\b/],
  ["damp", /\b(mould|mold|damp|condensation)\b/],
  ["plumber", /\b(leak\w*|taps?|toilet|pipes?|drains?|hot water|shower|sewage|burst|water|cistern|basin|sink|ceiling)\b/],
];

const NEGATION = /\b(no|not|isn'?t|aren'?t|never|without)\s+(\w+\s+){0,2}$/;

/** Find the first match of `re` in `t` that is not negated ("no gas smell"). */
function hit(t: string, re: RegExp) {
  const g = new RegExp(re.source, "g");
  for (let m = g.exec(t); m; m = g.exec(t)) {
    const before = t.slice(Math.max(0, m.index - 24), m.index);
    if (!NEGATION.test(before)) return m[0];
  }
  return null;
}

export function ruleTriage(text: string): { trade: Trade; urgency: Urgency; hazards: Hazard[]; matched: string[] } {
  const t = ` ${text.toLowerCase().replace(/\s+/g, " ")} `;
  const hazards: Hazard[] = [];
  const matched: string[] = [];
  for (const [h, re] of HAZARDS) {
    const m = hit(t, re);
    if (m) {
      hazards.push(h);
      matched.push(m.trim());
    }
  }
  const extra = hit(t, URGENT_EXTRA);
  if (extra) matched.push(extra.trim());
  let trade: Trade = "handyman";
  if (hazards.includes("gas") || hazards.includes("co")) trade = "gas";
  else {
    for (const [tr, re] of TRADE_HINTS) {
      if (hit(t, re)) {
        trade = tr;
        break;
      }
    }
  }
  return { trade, urgency: hazards.length || extra ? "urgent" : "routine", hazards, matched };
}

// ---------- fixed emergency text (verified numbers, 2026-10-31) ----------
// AU: 000 for emergencies; Jemena gas faults and emergencies 131 909 (NSW, 24 h).
// UK: 999; National Gas Emergency Service 0800 111 999 (24 h); NHS 111 for urgent medical advice.

export function emergencyText(region: Region, hazards: Hazard[]): string[] {
  const c = terms(region);
  const out: string[] = [];
  const AU = region === "AU";
  if (hazards.includes("gas"))
    out.push(
      AU
        ? "If you smell gas: do not use light switches, phones or flames inside. Turn the gas off at the meter if it is safe, open doors and windows, leave, and call Jemena on 131 909 (24 hours). If anyone is in danger, call 000."
        : "If you smell gas: do not use light switches or naked flames. Turn the gas off at the meter if it is safe (not if the meter is in a cellar), open doors and windows, leave, and call the National Gas Emergency Service on 0800 111 999 (24 hours)."
    );
  if (hazards.includes("co"))
    out.push(
      AU
        ? "If a carbon monoxide alarm sounds or anyone feels dizzy, sick or has a headache: get everyone outside into fresh air, turn gas appliances off if it is safe, and call 000."
        : "If a carbon monoxide alarm sounds: get everyone into fresh air, turn gas appliances off if it is safe, and call the National Gas Emergency Service on 0800 111 999. If anyone has collapsed or has severe symptoms, call 999; for medical advice, call NHS 111."
    );
  if (hazards.includes("fire")) out.push(AU ? "If there is fire or smoke, get everyone out and call 000." : "If there is fire or smoke, get everyone out and call 999.");
  if (hazards.includes("electricWater") || hazards.includes("electric"))
    out.push(`Stay away from wet or sparking fittings. If it is safe, turn the power off at the ${c.switchboard}. Do not touch the ${c.powerPoint} or switch.`);
  if (hazards.includes("ceiling")) out.push("Keep everyone out of the room and away from a sagging ceiling. Do not stand under it or try to drain it.");
  if (hazards.includes("flood")) out.push(`If water is spreading, turn the water off at the ${c.waterMain} and move belongings and electrical items away from it.`);
  if (hazards.includes("security")) out.push("If the home cannot be secured, keep valuables out of sight and stay with a neighbour or friend if you feel unsafe.");
  return out;
}

export const CHARGE_LABEL = (r: Region): Record<ChargeTo, string> => ({
  owner: `${terms(r).owner[0].toUpperCase()}${terms(r).owner.slice(1)}`,
  tenant: "Tenant",
  strata: r === "AU" ? "Strata" : "Block (service charge)",
});
