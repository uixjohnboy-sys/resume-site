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
    noticeHours: 48,
    /** The agency's authority for urgent work without the owner's approval (a not-to-exceed amount). */
    urgentLimit: 1500,
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
    noticeHours: 24,
    urgentLimit: 800,
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

/** label: a heading ("Gas Safe engineer"); who: inside a sentence ("the on-call Gas Safe engineer"); noun: with its article. */
type TradeWords = { label: string; who: string; noun: string; work: string };
const T = (label: string, who: string, noun: string, work: string): TradeWords => ({ label, who, noun, work });

export const TRADES: Record<Region, Record<Trade, TradeWords>> = {
  AU: {
    plumber: T("Plumber", "plumber", "a plumber", "plumbing"),
    gas: T("Gasfitter", "gasfitter", "a licensed gasfitter", "gas work"),
    electrician: T("Electrician", "electrician", "an electrician", "electrical work"),
    locksmith: T("Locksmith", "locksmith", "a locksmith", "locksmith work"),
    handyman: T("Handyman", "handyman", "a handyman", "general repairs"),
    roofer: T("Roofer", "roofer", "a roofer", "roofing"),
    hvac: T("Air conditioning", "air conditioning technician", "an air conditioning technician", "air conditioning work"),
    pest: T("Pest control", "pest controller", "a pest controller", "pest control"),
    glazier: T("Glazier", "glazier", "a glazier", "glazing"),
    damp: T("Mould and damp", "mould and damp specialist", "a mould and damp specialist", "mould treatment"),
  },
  UK: {
    plumber: T("Plumber", "plumber", "a plumber", "plumbing"),
    gas: T("Gas Safe engineer", "Gas Safe engineer", "a Gas Safe engineer", "gas work"),
    electrician: T("Electrician", "electrician", "an electrician", "electrical work"),
    locksmith: T("Locksmith", "locksmith", "a locksmith", "locksmith work"),
    handyman: T("Handyman", "handyman", "a handyman", "general repairs"),
    roofer: T("Roofer", "roofer", "a roofer", "roofing"),
    hvac: T("Heating engineer", "Gas Safe heating engineer", "a Gas Safe heating engineer", "heating work"),
    pest: T("Pest control", "pest controller", "a pest controller", "pest control"),
    glazier: T("Glazier", "glazier", "a glazier", "glazing"),
    damp: T("Damp specialist", "damp specialist", "a damp specialist", "damp and mould work"),
  },
};

export const TRADE_IDS = Object.keys(TRADES.AU) as Trade[];
export const tradeLabel = (r: Region, t: Trade) => TRADES[r][t].label;
export const tradeWho = (r: Region, t: Trade) => TRADES[r][t].who;

/** One line per trade, so the AI picks the right one for each region. */
export function tradeGlossary(r: Region) {
  const g: Record<Trade, string> =
    r === "AU"
      ? {
          plumber: "water, taps, toilets, pipes, drains, hot water systems, leaks",
          gas: "gas leaks, gas smells, gas cooktops and gas heaters (licensed gasfitter)",
          electrician: "power, lights, power points, switchboards, safety switches, smoke alarms (hardwired), exhaust fans, ceiling fans, electric ovens and cooktops",
          locksmith: "locks, keys, lockouts, doors that will not secure",
          handyman: "doors, cupboards, handrails, fences, small carpentry, flyscreens",
          roofer: "roofs, tiles, gutters, downpipes, storm damage to the roof",
          hvac: "split systems, ducted air conditioning",
          pest: "mice, rats, cockroaches, termites, wasps, possums",
          glazier: "broken or cracked glass, windows, shower screens",
          damp: "mould, damp walls, condensation problems",
        }
      : {
          plumber: "water, taps, toilets, pipes, drains, leaks (not boilers, and not hot water from a boiler)",
          gas: "gas leaks, gas smells, carbon monoxide alarms, gas hobs and gas fires (Gas Safe engineer)",
          electrician: "power, lights, plug sockets, consumer units, smoke alarms",
          locksmith: "locks, keys, lockouts, doors that will not secure",
          handyman: "doors, cupboards, handrails, fences, small carpentry",
          roofer: "roofs, slates, gutters, flashing, storm damage to the roof",
          hvac: "gas boilers, central heating, radiators, no hot water from the boiler (Gas Safe registered heating engineer)",
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

// Agency service targets, hours in a stage. The demo agency's settings, not law. Urgent work runs on the wall
// clock; routine work on office hours (Mon to Fri 8:30 to 5 pm, 8.5 h a day), so a weekend never turns the board red:
// 1 business day to triage, 2 to get a time or a quote, 2 for the owner, 5 to the visit.
export const TARGET_HOURS: Record<Urgency, Partial<Record<Stage, number>>> = {
  urgent: { new: 1, sent: 1, owner: 2, booked: 4 },
  routine: { new: 8.5, sent: 17, owner: 17, booked: 42.5 },
};
export const OFFICE_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const OFFICE_OPEN = 510; // 8:30
export const OFFICE_CLOSE = 1020; // 17:00

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

/** "today at 7:45 pm", "tomorrow at 8:00 am", or "Mon 8:00 am", seen from `now` in the agency's zone. */
export function whenFrom(region: Region, t: number, now?: number) {
  if (now === undefined) return when(region, t);
  const key = (x: number) => new Date(x).toLocaleDateString("en-CA", { timeZone: REGION[region].tz });
  const time = when(region, t, false);
  if (key(t) === key(now)) return `today at ${time}`;
  if (key(t) === key(now + 24 * 3600_000)) return `tomorrow at ${time}`;
  return when(region, t);
}

export function day(region: Region, t: number) {
  const r = REGION[region];
  return new Date(t).toLocaleDateString(r.locale, { timeZone: r.tz, day: "numeric", month: "short", year: "numeric" });
}

/** Hour and weekday in the agency's zone. */
// One formatter per region: building an Intl.DateTimeFormat is slow, and the seed asks for local times often.
const FORMATTERS: Partial<Record<Region, Intl.DateTimeFormat>> = {};
function local(region: Region, t: number) {
  const f = (FORMATTERS[region] ??= new Intl.DateTimeFormat("en-GB", { timeZone: REGION[region].tz, hour: "numeric", minute: "numeric", weekday: "short", hour12: false }));
  const parts = f.formatToParts(t);
  const get = (k: string) => parts.find((p) => p.type === k)?.value ?? "";
  return { hour: Number(get("hour")) % 24, minute: Number(get("minute")), weekday: get("weekday") };
}

export function isAfterHours(region: Region, t: number) {
  const l = local(region, t);
  const m = l.hour * 60 + l.minute;
  // Outside office hours (Mon to Fri 8:30 to 5 pm): the on-call path takes over.
  return !OFFICE_DAYS.includes(l.weekday) || m < OFFICE_OPEN || m >= OFFICE_CLOSE;
}

/** The first moment at or after `t` inside a daily window (minutes after midnight, agency zone) on the given weekdays. */
export function nextOpen(region: Region, t: number, open: number, close: number, days: string[]) {
  let x = Math.ceil(t / 60_000) * 60_000;
  for (let guard = 0; guard < 10; guard++) {
    const l = local(region, x);
    const m = l.hour * 60 + l.minute;
    const today = days.includes(l.weekday);
    if (today && m >= open && m < close) return x;
    x += (today && m < open ? open - m : 24 * 60 - m + open) * 60_000;
  }
  return x;
}

/** Office hours (Mon to Fri 8:30 to 5 pm, agency zone) between two moments. */
export function officeHours(region: Region, a: number, b: number) {
  let total = 0;
  let x = a;
  for (let guard = 0; guard < 120 && x < b; guard++) {
    const open = nextOpen(region, x, OFFICE_OPEN, OFFICE_CLOSE, OFFICE_DAYS);
    if (open >= b) break;
    const l = local(region, open);
    const close = open + (OFFICE_CLOSE - (l.hour * 60 + l.minute)) * 60_000;
    total += Math.min(close, b) - open;
    x = close;
  }
  return total / 3600_000;
}

/** The moment `hours` office hours before `t` (the inverse of officeHours). */
export function officeBack(region: Region, t: number, hours: number) {
  let x = t;
  let left = hours * 60;
  for (let guard = 0; guard < 200; guard++) {
    const l = local(region, x);
    const m = l.hour * 60 + l.minute;
    if (OFFICE_DAYS.includes(l.weekday) && m > OFFICE_OPEN && m <= OFFICE_CLOSE) {
      const avail = m - OFFICE_OPEN;
      if (left <= avail) return x - left * 60_000;
      left -= avail;
      x -= (avail + 24 * 60 - OFFICE_CLOSE + OFFICE_OPEN) * 60_000; // back to the previous day's 5 pm
    } else {
      x -= (m > OFFICE_CLOSE ? m - OFFICE_CLOSE : m + 24 * 60 - OFFICE_CLOSE) * 60_000; // back to the last 5 pm
    }
  }
  return x;
}

/** A deadline `n` business days (Mon to Fri) after `t`, at 5 pm that day in the agency's zone. */
export function addBusinessDays(region: Region, t: number, n: number) {
  let x = t;
  let left = n;
  while (left > 0) {
    x += 24 * 3600_000;
    const w = local(region, x).weekday;
    if (w !== "Sat" && w !== "Sun") left--;
  }
  const l = local(region, x);
  return x + ((17 - l.hour) * 60 - l.minute) * 60_000;
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

const THING = "(oven|stove|cooktop|cooker|hob|heater|power ?points?|sockets?|switch(board)?|outlets?|plugs?|walls?|ceiling|roof|meter|fuse ?box|wires?|wiring|dryer|washing machine|fridge|microwave|kettle|lights?|light fitting|fan|ceiling fan|extractor( hood| fan)?|range ?hood|air ?con|boiler|appliance|tap|taps|tv|television|computer|charger)";
const R = (s: string) => new RegExp(s);
const NONE = /$^/;

// Four tiers (G4 rounds 3 to 5). Each reworded probe a reviewer found became a test in scripts/tapline-rules.test.mjs.
// - core: a short list of life-safety phrases (gas, carbon monoxide, actual fire or smoke from something, a ceiling
//   coming down, water on electrics). They raise urgency on their own, AI or not.
// - check: strong but everyday-adjacent phrases (sparks, a burst pipe, a break-in, can't lock the front door). With the
//   AI available they count only when the AI flags the same hazard; otherwise the manager sees "check the urgency".
//   With no AI they raise (a person confirms before anything routine is sent).
// - context: phrases that are emergencies only sometimes (power out, gushing, a burning smell, a flooded floor). They
//   count only when the AI agrees, and never raise on their own.
// - weak: everyday words ("flame", "smoking", "won't lock", "sewage"), shown as words worth a check.
type Tier = { core: RegExp; check: RegExp; context: RegExp; weak: RegExp };
const HAZARDS: [Hazard, Tier][] = [
  [
    "co",
    {
      core: /\b((carbon monoxide|co) (alarm|detector|monitor)s? (is |are |keeps |has been |have been )?(going off|beeping|sounding|ringing|went off)|carbon monoxide (leak|poisoning|symptoms)|(smell|leak) of carbon monoxide)\b/,
      check: NONE,
      context: /\b(carbon monoxide|co (alarm|detector|monitor))\b/,
      weak: NONE,
    },
  ],
  [
    "gas",
    {
      core: /\b(smell(s|ing)? (strongly )?(of |like )?gas|reeks? of gas|gas (leak|smell)(?!( \w+){0,5} (was|were|has been|got) (fixed|repaired|sorted))|leaking gas|gas (is )?(leaking|hissing|escaping)|rotten eggs?|gas (bottle|cylinder) (is )?(leaking|hissing)|hissing (from|near) the gas)\b/,
      check: NONE,
      context: NONE,
      weak: NONE,
    },
  ],
  [
    "fire",
    {
      // Never the bare word "fire": "gas fire", "fire alarm" and "fire door" are everyday words, not emergencies.
      core: R(
        `\\b(on fire|caught fire|catching fire|(is|are|was) alight|(a |there'?s a |there is a )fire in (the|our) (kitchen|house|flat|unit|bedroom|lounge|laundry|garage|building|roof|hallway)|flames? (are |is )?(coming|came|come|shooting|shot|pouring)( out)?( of| from)?|smoke( \\w+){0,4} (coming|pouring|billowing)( out)? (of|from) (the |a |our )?${THING}|smoke from (the |a |our )?${THING}|${THING} (is |are )?(smoking|on fire|alight)|${THING}( \\w+){1,3} (is|are) (smoking|on fire|alight)|${THING}( \\w+){0,4} (has |have |is |are )?(melted|melting|scorched)|(filling|filled|full) (up )?with smoke|full of smoke|smoke everywhere|burning plastic)\\b`
      ),
      check: R(
        `\\b((burning smell|smell of burning|smells? (like |of )?burn(ing|t))( \\w+){0,3} (from|in|near|around|behind) (the |a |our )?${THING}|${THING}( \\w+){0,3} smells? (like |of )?(burning|burnt)(?! (dust|food|toast)))\\b`
      ),
      context: /\b(burning smell|smell of burning|smells? (like |of )?burn(ing|t)(?! (dust|food|toast))|smoke (is )?(coming|pouring))\b/,
      weak: /\b(flames?|smok(e|ing))\b/,
    },
  ],
  [
    "electricWater",
    {
      core: /\b((water|dripping|leaking|drips)( (is|are))?( (coming|pouring|running|getting|dripping|leaking))?( \w+)? (from|through|into|onto|on|in|near|around|out of|behind|inside|down)( the| a| our)?( \w+){0,2} (light|lights|light fitting|downlights?|power ?points?|sockets?|switch(es)?|switchboard)|wet (light|socket|power ?point)|(rain|water)( \w+){0,4} (switchboard|fuse ?box|meter box|consumer unit)|(switchboard|consumer unit|fuse ?box)( \w+){0,4} (is )?wet)\b/,
      check: NONE,
      context: NONE,
      weak: NONE,
    },
  ],
  [
    "electric",
    {
      core: NONE,
      check: R(
        `\\b(spark(s|ing|ed)?|exposed wires?|wires? (are )?(hanging|sticking|exposed|bare)|electric shock|shocked me|(?<!static )shock from (the |a )?(\\w+ ){0,2}${THING}|(a |get a |got a )?tingl(e|ing) (from|when)|tripped (and|but) won'?t reset|no power (in|to) (the )?(whole|entire) (house|flat|unit|home|property))\\b`
      ),
      context: /\b(power (is )?out|no power)\b/,
      weak: /\b(shock)\b/,
    },
  ],
  [
    "ceiling",
    {
      core: /\b(sagging|bulging|collaps(e|ed|ing)) (the )?ceiling|ceiling(?! (light|fan|paint|rose|cover|vent|hatch|globe))( \w+){0,4} (is |has )?(sagging|bulging|collaps(e|ed|ing)|fallen|come down|caved in|dropped)\b/,
      check: NONE,
      context: NONE,
      weak: NONE,
    },
  ],
  [
    "flood",
    {
      core: NONE,
      check: /\b(burst (water )?(pipe|pipes|main|hose|flexi|tap)|pipe (has )?(burst|split)|water (is )?spraying|through the ceiling|ceiling (is )?leaking|ceiling leak|sewage (is )?(coming|backing|overflowing|everywhere|on the floor|in the)|toilet (is )?overflow(ing)?|hose (came|has come) off|(laundry|kitchen|bathroom|house|flat) is (under water|flooding))\b/,
      context: /\b(burst|flooded|flooding|(a|is a) flood(?! ?lights?)|gushing|water everywhere|water (is )?(pouring|spreading)|under water|overflowing (onto|into|on) the)\b/,
      weak: /\b(sewage|flood|overflow\w*)\b/,
    },
  ],
  [
    "security",
    {
      core: NONE,
      check: /\b((front|back|main|entry|sliding|balcony)( \w+)? door (won'?t|will not|doesn'?t|does not|can'?t|cannot) lock|(patio|garage|security)( \w+)? door (won'?t|will not|doesn'?t|does not|can'?t|cannot) lock|(front|back|main|entry) door( \w+){1,5} (won'?t|will not|doesn'?t|does not|can'?t|cannot) lock|(can'?t|cannot|unable to) (lock|secure) (the )?(house|flat|unit|home|property|front|back|place)|locked out of (the |our |my )?(house|flat|unit|home|place)|(i'?m|we'?re|i am|we are) locked out(?! of the (shed|garage|garden))|forced (entry|open)|jemm(ied|y)|break-?in|broke in|broken into|kicked (the |our )?(front |back )?door in|smashed (the )?(back |front |bedroom |kitchen |lounge )?(window|door)s?\b(?! seal)|window (won'?t|will not) (lock|close|shut))\b/,
      context: /\b((front|back|main|entry|sliding|balcony)( \w+)? door (won'?t|will not|doesn'?t|does not|can'?t|cannot) (close|shut))\b/,
      weak: /\b(won'?t lock|will not lock|can'?t lock|broken lock|locked out)\b/,
    },
  ],
];

const URGENT_EXTRA = /\b(no hot water|no heating|boiler (has )?(stopped|broken|not working)|no water at all)\b/;

const TRADE_HINTS: [Trade, RegExp][] = [
  ["gas", /\b(gas|carbon monoxide|co alarm|cooktop|gas heater|gas hob)\b/],
  ["damp", /\b(mould|mold|damp|condensation)\b/],
  ["hvac", /\b(boiler|radiators?|central heating|split system|air ?con|air conditioning|heat pump|ducted)\b/],
  ["electrician", /\b(power|lights?|switch(es)?|sockets?|power ?points?|outlets?|spark(s|ing|ed)?|floodlights?|downlights?|fuse|rcd|safety switch|electric\w*|fan|(smoke|fire|heat) alarms?|wires?|switchboard|consumer unit)\b/],
  ["locksmith", /\b(locks?|keys?|locked out|deadbolt|won'?t lock|can'?t lock)\b/],
  ["glazier", /\b(window|glass|pane|smashed|double glazing|shower screen)\b/],
  ["roofer", /\b(roof|gutters?|tiles?|slates?|downpipe|flashing)\b/],
  ["pest", /\b(mice|mouse|rats?|cockroach(es)?|ants|termites?|wasps?|possums?|bed ?bugs?|pests?)\b/],
  ["plumber", /\b(leak\w*|taps?|toilet|pipes?|drains?|hot water|shower|sewage|burst|water|cistern|basin|sink|ceiling)\b/],
];

// "Not sure if it's gas" is a worry, not a denial.
const NEGATION = /\b(no|not(?! sure| certain)|isn'?t|aren'?t|never|without)\s+(\w+\s+){0,2}$/;

/** Find the first match of `re` in `t` that is not negated ("no gas smell"). */
function hit(t: string, re: RegExp) {
  const g = new RegExp(re.source, "g");
  for (let m = g.exec(t); m; m = g.exec(t)) {
    const before = t.slice(Math.max(0, m.index - 24), m.index);
    if (!NEGATION.test(before)) return m[0];
  }
  return null;
}

/** A smoke, heat or (household) fire alarm fault, not a carbon monoxide alarm. */
export const isSmokeAlarm = (text: string) => /\b(smoke|heat|fire) (alarm|detector)s?\b/i.test(text) && !/\b(co alarm|carbon monoxide)\b/i.test(text);

/** NSW: a smoke alarm repair is due within 2 business days, by a licensed electrician if hardwired, needs no owner
 * approval, and the tenant needs only 1 hour's notice for the repair itself (NSW Fair Trading). */
export const SMOKE_ALARM = { businessDays: 2, noticeHours: 1 };

export type RuleResult = {
  trade: Trade;
  /** From core phrases (and no hot water, no heating) only: what may override the AI. */
  urgency: Urgency;
  /** Core hazards. */
  hazards: Hazard[];
  matched: string[];
  /** Check-tier hazards: count with the AI's agreement, or on their own when the AI is unavailable. */
  check: Hazard[];
  checkMatched: string[];
  /** Context-tier hazards: count only with the AI's agreement. */
  context: Hazard[];
  contextMatched: string[];
  weak: string[];
};

/** Urgency from the rules alone (AI unavailable): core and check phrases both raise. */
export const rulesOnlyUrgency = (r: RuleResult): Urgency => (r.urgency === "urgent" || r.check.length ? "urgent" : "routine");

export function ruleTriage(text: string, region?: Region): RuleResult {
  const t = ` ${text.toLowerCase().replace(/\s+/g, " ")} `;
  const hazards: Hazard[] = [];
  const matched: string[] = [];
  const check: Hazard[] = [];
  const checkMatched: string[] = [];
  const context: Hazard[] = [];
  const contextMatched: string[] = [];
  const weak: string[] = [];
  for (const [h, tier] of HAZARDS) {
    const m = hit(t, tier.core);
    if (m) {
      hazards.push(h);
      matched.push(m.trim());
      continue;
    }
    const k = hit(t, tier.check);
    if (k) {
      check.push(h);
      checkMatched.push(k.trim());
      continue;
    }
    const c = hit(t, tier.context);
    if (c) {
      context.push(h);
      contextMatched.push(c.trim());
      continue;
    }
    const w = hit(t, tier.weak);
    if (w) weak.push(w.trim());
  }
  const extra = hit(t, URGENT_EXTRA);
  if (extra) matched.push(extra.trim());
  let trade: Trade = "handyman";
  if (hazards.includes("gas") || hazards.includes("co")) trade = "gas";
  else {
    // Trade hints are never negated: "no power" still needs an electrician.
    for (const [tr, re] of TRADE_HINTS) {
      if (new RegExp(re.source).test(t)) {
        trade = tr;
        break;
      }
    }
  }
  // England: hot water comes from the gas boiler, so it is a Gas Safe heating engineer's job.
  if (region === "UK" && trade === "plumber" && /\bhot water\b/.test(t)) trade = "hvac";
  return { trade, urgency: hazards.length || extra ? "urgent" : "routine", hazards, matched, check, checkMatched, context, contextMatched, weak };
}

// ---------- fixed emergency text (verified numbers, 2026-10-31) ----------
// AU: 000 for emergencies; Jemena gas faults and emergencies 131 909 (NSW, 24 h).
// UK: 999; National Gas Emergency Service 0800 111 999 (24 h); NHS 111 for urgent medical advice.
// Police non-emergency: NSW Police Assistance Line 131 444; UK 101.

export function emergencyText(region: Region, hazards: Hazard[]): string[] {
  const c = terms(region);
  const out: string[] = [];
  const AU = region === "AU";
  if (hazards.includes("gas"))
    out.push(
      AU
        ? "If you smell gas: do not use light switches, phones or flames inside. Turn the gas off at the meter if it is safe, open doors and windows, leave, and call Jemena on 131 909 (24 hours). If anyone is in danger, call 000."
        : "If you smell gas: do not use light switches or naked flames. Turn the gas off at the meter if it is safe (not if the meter is in a cellar), open doors and windows, leave, and call the National Gas Emergency Service on 0800 111 999 (24 hours). If anyone is in danger, call 999."
    );
  if (hazards.includes("co"))
    out.push(
      AU
        ? "If a carbon monoxide alarm sounds or anyone feels dizzy, sick or has a headache: get everyone outside into fresh air, turn gas appliances off if it is safe, and call 000."
        : "If a carbon monoxide alarm sounds: get everyone into fresh air, turn gas appliances off if it is safe, and call the National Gas Emergency Service on 0800 111 999. If anyone has collapsed or has severe symptoms, call 999; for medical advice, call NHS 111."
    );
  if (hazards.includes("fire")) out.push(AU ? "If there is fire or smoke, get everyone out and call 000." : "If there is fire or smoke, get everyone out and call 999.");
  if (hazards.includes("electricWater") || hazards.includes("electric"))
    out.push(`Stay away from wet or sparking fittings. If it is safe, turn the power off at the ${c.switchboard}. Do not touch any wet light, ${c.powerPoint} or switch.`);
  if (hazards.includes("ceiling")) out.push("Keep everyone out of the room and away from a sagging ceiling. Do not stand under it or try to drain it.");
  if (hazards.includes("flood"))
    out.push(`If water is spreading and it is safe, turn the water off at the ${c.waterMain}. Move belongings away only if they and you are dry. Never touch anything electrical that water has reached.`);
  if (hazards.includes("security"))
    out.push(
      AU
        ? "If someone is still there or you are in danger, call 000. To report a break-in afterwards, call the Police Assistance Line on 131 444. If the home cannot be secured, keep valuables out of sight and stay with a neighbour or friend if you feel unsafe."
        : "If someone is still there or you are in danger, call 999. To report a break-in afterwards, call 101. If the home cannot be secured, keep valuables out of sight and stay with a neighbour or friend if you feel unsafe."
    );
  return out;
}

/**
 * The reply a tenant should get for where the job is NOW: the morning confirm of a job the on-call contractor
 * already booked or finished must not say "we're arranging a tradie" (G4 round 4).
 */
export function tenantReply(
  region: Region,
  agency: string,
  first: string,
  j: { stage: Stage; urgency: Urgency; trade: Trade },
  booked?: { business: string; at?: number; now?: number }
) {
  const who = TRADES[region][j.trade].who;
  const thanks = j.urgency === "urgent" ? `Hi ${first}, thanks for letting us know.` : `Hi ${first}, thanks for reporting this.`;
  let body: string;
  if ((j.stage === "done" || j.stage === "billed") && booked) body = `${booked.business} came out and has done the repair. Please tell us if anything still isn't right.`;
  else if (j.stage === "booked" && booked?.at) body = `${booked.business} is booked to come out ${whenFrom(region, booked.at, booked.now)}.`;
  else if (j.urgency === "urgent") body = `We're treating this as urgent and have contacted our on-call ${who}. We'll confirm the visit as soon as they accept.`;
  else body = `We've sent it to ${TRADES[region][j.trade].noun} and will confirm a time with you.`;
  return `${thanks} ${body}\n\n${agency}`;
}

export const CHARGE_LABEL = (r: Region): Record<ChargeTo, string> => ({
  owner: `${terms(r).owner[0].toUpperCase()}${terms(r).owner.slice(1)}`,
  tenant: "Tenant",
  strata: r === "AU" ? "Strata" : "Block (service charge)",
});
