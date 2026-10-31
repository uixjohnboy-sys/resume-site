import { REGION, SMOKE_ALARM, TARGET_HOURS, addBusinessDays, emergencyText, isAfterHours, isSmokeAlarm, money, nextOpen, officeBack, ruleTriage, slots, tenantReply, terms, tradeWho } from "./rules";
import type { ComplianceItem, Contractor, Job, Manager, Owner, Property, Region, Sandbox, Stage, Trade, Urgency } from "./types";

// Deterministic fictional data that obeys the product's own rules: owner-stage
// quotes are big-ticket work priced inside the fault's own band and over that
// owner's limit, work orders are capped at it, bookings sit on business-hour
// slots after the notice period, titles never repeat in a column, compliance
// follows each region's rules, and every
// number on the board comes from these records. Timestamps are relative to the
// moment the sandbox is made, so the timers always look like a live morning.
// Phone numbers are from the ranges reserved for fiction (ACMA 02 5550 xxxx,
// Ofcom 0161 496 0xxx).

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const H = 3600_000;
const D = 24 * H;
export const DEMO_PROPERTY = "p7";

const FIRST = ["Olivia", "Jack", "Mia", "Noah", "Ava", "Leo", "Isla", "Oscar", "Grace", "Henry", "Zara", "Lucas", "Ruby", "Ethan", "Chloe", "Liam", "Sophie", "Archie", "Ella", "Max", "Priya", "Arjun", "Mei", "Tom", "Hannah", "Sam", "Aisha", "Ben", "Layla", "Dylan", "Fatima", "Kenji", "Elena", "Tariq", "Bronte", "Callum", "Nadia", "Rhys", "Ines", "Kai"];
const LAST = ["Nguyen", "Smith", "Patel", "Brown", "Wilson", "Taylor", "Kelly", "Murphy", "Chen", "Walker", "Clarke", "Hughes", "Singh", "Martin", "Evans", "Wright", "Hall", "Young", "Lee", "Khan", "Reid", "Cooper", "Ward", "Price", "Bennett", "Okafor", "Rossi", "Haddad", "Kowalski", "Doyle"];

const PLACES = {
  AU: {
    streets: ["Wattle St", "Bay Rd", "Albert Ave", "Ocean Pde", "Railway Tce", "Banksia Cres", "Victoria Rd", "Park Ln", "Elizabeth St", "Harbour View Dr", "Kent St", "Short St", "Addison Rd", "Livingstone Rd", "Belmore St"],
    suburbs: [
      ["Marrickville", "2204"],
      ["Glebe", "2037"],
      ["Randwick", "2031"],
      ["Parramatta", "2150"],
      ["Manly", "2095"],
      ["Newtown", "2042"],
      ["Bondi", "2026"],
      ["Chatswood", "2067"],
      ["Ryde", "2112"],
      ["Leichhardt", "2040"],
    ],
  },
  UK: {
    streets: ["Mill Lane", "Station Road", "Church Street", "Victoria Road", "Park Avenue", "Albert Street", "Queens Road", "Canal Walk", "Wilmslow Road", "Rose Terrace", "King Street", "Beech Road", "Barlow Moor Road", "Burton Road"],
    suburbs: [
      ["Didsbury", "M20"],
      ["Chorlton", "M21"],
      ["Ancoats", "M4"],
      ["Salford", "M5"],
      ["Levenshulme", "M19"],
      ["Withington", "M20"],
      ["Stretford", "M32"],
      ["Prestwich", "M25"],
      ["Sale", "M33"],
      ["Fallowfield", "M14"],
    ],
  },
};

const BUSINESSES: Record<Region, Record<Trade, string[]>> = {
  AU: {
    plumber: ["FlowRight Plumbing", "Inner West Plumbing Co", "Same Day Plumbing"],
    gas: ["Blue Flame Gasfitting", "SafeGas Services"],
    electrician: ["Bright Spark Electrical", "Circuit Co Electrical"],
    locksmith: ["KeyFast Locksmiths"],
    handyman: ["Fix It Friday", "Odd Jobs Co"],
    roofer: ["TopCover Roofing"],
    hvac: ["CoolBreeze Air"],
    pest: ["Shield Pest Control"],
    glazier: ["ClearView Glass"],
    damp: ["MouldGone Remediation"],
  },
  UK: {
    plumber: ["FlowRight Plumbing", "Northern Pipeworks", "Same Day Plumbing"],
    gas: ["Pennine Gas Services", "SafeHeat Gas"],
    electrician: ["Bright Spark Electrical", "Circuit Co Electrical"],
    locksmith: ["KeyFast Locksmiths"],
    handyman: ["Fix It Friday", "Odd Jobs Co"],
    roofer: ["TopCover Roofing"],
    hvac: ["WarmHome Heating", "Boiler Care North"],
    pest: ["Shield Pest Control"],
    glazier: ["ClearView Glazing"],
    damp: ["DryWall Damp Specialists"],
  },
};

type Band = [number, number];
type Tpl = {
  trade: Trade;
  urgency: Urgency;
  /** AUD price band; GBP uses 0.55 of it unless ukPrice is set. */
  price: Band;
  au: [string, string[]];
  uk?: [string, string[]];
  ukTrade?: Trade;
  ukPrice?: Band;
  chargeTo?: "tenant";
  /** Roofs, gutters, fences and decks: houses only (in a strata scheme or a block they are common property). */
  house?: boolean;
  /** What the contractor's quote covers, AU then UK (owner-stage templates). */
  note?: [string, string];
};

const TEMPLATES: Tpl[] = [
  { trade: "plumber", urgency: "routine", price: [150, 260], au: ["Kitchen tap dripping", ["The kitchen mixer drips all the time, even when it's fully off.", "Constant drip from the kitchen tap, filling a cup overnight."]] },
  { trade: "plumber", urgency: "routine", price: [140, 240], au: ["Toilet keeps running", ["The cistern refills every few minutes and you can hear it all night.", "Toilet won't stop running after a flush unless I jiggle the button."]] },
  { trade: "plumber", urgency: "routine", price: [180, 320], au: ["Kitchen sink draining slowly", ["Sink takes ten minutes to drain and smells a bit.", "Water sits in the kitchen sink after washing up."]] },
  { trade: "plumber", urgency: "routine", price: [160, 280], au: ["Shower drain blocked", ["Water pools around our feet in the shower.", "Shower takes ages to drain."]] },
  { trade: "plumber", urgency: "routine", price: [180, 300], au: ["Leak under the bathroom basin", ["Small puddle under the vanity every morning."]], uk: ["Leak under the bathroom sink", ["Small puddle under the sink every morning."]] },
  { trade: "plumber", urgency: "urgent", price: [380, 900], au: ["Water coming through the ceiling", ["Brown stain on the living room ceiling and it's dripping into a bucket."]] },
  { trade: "plumber", urgency: "urgent", price: [420, 1100], au: ["Burst pipe in the laundry", ["A pipe behind the washing machine burst and water is everywhere."]], uk: ["Burst pipe in the kitchen", ["A pipe under the kitchen sink has burst and water is everywhere."]] },
  {
    trade: "plumber",
    urgency: "urgent",
    price: [450, 1500],
    au: ["No hot water", ["The hot water system has stopped, only cold water now."]],
    uk: ["Boiler not giving hot water", ["The boiler fires up for the heating but there's no hot water from the taps."]],
    ukTrade: "hvac",
  },
  { trade: "plumber", urgency: "urgent", price: [250, 450], au: ["Only toilet blocked", ["Our only toilet is blocked and won't flush."]] },
  { trade: "gas", urgency: "urgent", price: [200, 420], au: ["Smell of gas in the kitchen", ["Strong smell of gas near the cooktop and it's getting stronger."]], uk: ["Smell of gas in the kitchen", ["Strong smell of gas near the hob and it's getting stronger."]] },
  { trade: "gas", urgency: "routine", price: [180, 320], au: ["Cooktop burner won't light", ["One of the gas burners clicks but won't light."]], uk: ["Hob ring won't light", ["One of the gas rings clicks but won't light."]] },
  { trade: "electrician", urgency: "routine", price: [160, 260], au: ["Bathroom light not working", ["Changed the globe but the bathroom light still won't turn on."]], uk: ["Bathroom light not working", ["Changed the bulb but the bathroom light still won't turn on."]] },
  { trade: "electrician", urgency: "routine", price: [160, 280], au: ["Power point not working", ["The power point next to the bed has no power."]], uk: ["Plug socket not working", ["The socket next to the bed has no power."]] },
  { trade: "electrician", urgency: "routine", price: [200, 380], au: ["Safety switch keeps tripping", ["The safety switch trips a couple of times a week, it resets fine."]], uk: ["Electrics keep tripping", ["The consumer unit trips a couple of times a week, it resets fine."]] },
  { trade: "electrician", urgency: "routine", price: [150, 250], au: ["Smoke alarm beeping", ["The hallway smoke alarm chirps every minute."]], uk: ["Smoke alarm beeping", ["The landing smoke alarm chirps every minute."]] },
  { trade: "electrician", urgency: "urgent", price: [220, 420], au: ["Power point sparking", ["The power point in the bedroom sparked and smells burnt."]], uk: ["Plug socket sparking", ["The bedroom socket sparked and smells burnt."]] },
  { trade: "locksmith", urgency: "urgent", price: [180, 380], au: ["Front door won't lock", ["The deadlock on the front door is jammed and we can't lock the house."]], uk: ["Front door won't lock", ["The lock on the front door is jammed and we can't lock the flat."]] },
  { trade: "locksmith", urgency: "urgent", price: [150, 300], au: ["Locked out, lost keys", ["I lost my keys and I'm locked out."]], chargeTo: "tenant" },
  { trade: "locksmith", urgency: "routine", price: [150, 260], au: ["Sliding door lock stiff", ["The back sliding door lock is very stiff and hard to turn."]], uk: ["Back door lock stiff", ["The back door lock is very stiff and hard to turn."]] },
  { trade: "handyman", urgency: "routine", price: [120, 220], au: ["Wardrobe door off its track", ["The sliding wardrobe door has come off the bottom track."]] },
  { trade: "handyman", urgency: "routine", price: [150, 280], au: ["Loose stair handrail", ["The handrail on the stairs is coming away from the wall."]], uk: ["Loose bannister", ["The bannister is coming away from the wall."]] },
  { trade: "handyman", urgency: "routine", price: [200, 450], au: ["Fence palings down", ["A few palings blew off the side fence in the wind."]], uk: ["Fence panel down", ["A fence panel blew down in the wind."]], house: true },
  { trade: "handyman", urgency: "routine", price: [90, 180], au: ["Flyscreen torn", ["The bedroom flyscreen has a big tear."]], uk: ["Kitchen cupboard door hanging off", ["A hinge has come out of a kitchen cupboard door."]] },
  { trade: "roofer", urgency: "routine", price: [200, 450], au: ["Gutter overflowing", ["The back gutter overflows every time it rains and water runs down the wall."]], house: true },
  { trade: "roofer", urgency: "routine", price: [300, 700], au: ["Roof tiles slipped", ["A few roof tiles look like they've slipped after the storm."]], uk: ["Slates slipped", ["A few slates look like they've slipped after the storm."]], house: true },
  { trade: "hvac", urgency: "routine", price: [220, 480], au: ["Air con not cooling", ["The split system runs but only blows warm air."]], uk: ["Boiler losing pressure", ["Boiler pressure drops below 1 bar every couple of days and the radiators go cold."]] },
  { trade: "hvac", urgency: "routine", price: [160, 320], au: ["Air con dripping inside", ["Water drips from the indoor unit onto the floor."]], uk: ["Radiator cold at the top", ["The bedroom radiator is cold at the top and warm at the bottom."]] },
  { trade: "pest", urgency: "routine", price: [180, 300], au: ["Mice in the kitchen", ["Droppings in the pantry and scratching at night."]] },
  { trade: "pest", urgency: "routine", price: [150, 280], au: ["Cockroaches in the kitchen", ["Seeing cockroaches every night near the fridge."]], uk: ["Wasps nest by the front door", ["There's a wasps nest under the eaves by the front door."]] },
  { trade: "glazier", urgency: "routine", price: [250, 600], au: ["Cracked window pane", ["Crack across the bottom pane of the bedroom window."]] },
  { trade: "glazier", urgency: "urgent", price: [300, 700], au: ["Smashed back window", ["Someone smashed the back window overnight, it's wide open."]] },
  { trade: "damp", urgency: "routine", price: [250, 700], au: ["Mould in the bathroom", ["Black mould keeps coming back on the bathroom ceiling."]], uk: ["Black mould in the bedroom", ["Black mould on the bedroom wall behind the wardrobe."]] },
];

// Work that genuinely costs more than most owners' limits: the jobs that wait on the owner.
const OWNER_TEMPLATES: Tpl[] = [
  {
    trade: "plumber",
    urgency: "routine",
    price: [1400, 2300],
    au: ["Hot water system leaking at the base", ["There's a puddle under the hot water system and rust on the tank."]],
    uk: ["Boiler keeps cutting out", ["The boiler cuts out a few times a day and shows a fault code."]],
    ukTrade: "hvac",
    ukPrice: [1900, 2800],
    note: [
      "Replace the 250 L electric hot water unit; the tank has rusted through",
      "The boiler is 17 years old and the heat exchanger has failed. Replace with a new combi, includes flue and Gas Safe certificate",
    ],
  },
  {
    trade: "hvac",
    urgency: "routine",
    price: [1600, 2600],
    au: ["Split system not working", ["The living room split system won't start at all now."]],
    uk: ["Damp patch spreading on the back wall", ["A damp patch on the back wall is getting bigger and the paint is bubbling."]],
    ukTrade: "damp",
    ukPrice: [900, 1600],
    house: true,
    note: ["Compressor has failed. Replace the 2.5 kW split system, includes removing the old unit", "Inject a damp-proof course along the 4 m back wall and re-plaster"],
  },
  {
    trade: "handyman",
    urgency: "routine",
    price: [1100, 2000],
    au: ["Fence leaning after the storm", ["The back fence is leaning badly after the storm and two posts are loose."]],
    uk: ["Fence panels down after the storm", ["Four fence panels and a post came down in the storm."]],
    ukPrice: [480, 900],
    house: true,
    note: ["Replace 6 m of paling fence and two rotten posts", "Replace four fence panels and two concrete posts"],
  },
  {
    trade: "plumber",
    urgency: "routine",
    price: [1600, 3200],
    au: ["Shower leaking into the next room", ["The wall next to the shower is damp and the skirting is swelling."]],
    uk: ["Shower leaking through to the kitchen", ["There's a damp patch on the kitchen ceiling under the shower."]],
    ukPrice: [1100, 1900],
    house: true,
    note: ["Strip and re-waterproof the shower recess, then re-tile", "Remove the tray, re-seal and re-tile the shower enclosure"],
  },
  {
    trade: "electrician",
    urgency: "routine",
    price: [480, 900],
    au: ["Oven not heating", ["The oven light comes on but it doesn't heat up."]],
    uk: ["Oven not heating", ["The oven light comes on but it doesn't heat up."]],
    ukPrice: [300, 520],
    note: ["Replace the oven element and thermostat, parts ordered", "Replace the oven element and thermostat, parts ordered"],
  },
  {
    trade: "handyman",
    urgency: "routine",
    price: [900, 1800],
    au: ["Rotten deck boards", ["Several deck boards are soft and one has cracked through."]],
    uk: ["Window won't close properly", ["The bedroom window won't close and there's a draught and condensation between the panes."]],
    ukTrade: "glazier",
    ukPrice: [420, 780],
    house: true,
    note: ["Replace 12 rotten deck boards and two joists", "Replace the failed double-glazed unit and both hinges"],
  },
];

// Stage mix: 38 jobs. Every column has work; a few timers are already late.
const STAGE_MIX: Stage[] = [
  ...Array(5).fill("new"),
  ...Array(6).fill("sent"),
  ...Array(6).fill("owner"),
  ...Array(8).fill("booked"),
  ...Array(6).fill("done"),
  ...Array(7).fill("billed"),
];

export function seedSandbox(id: string, region: Region, now = Date.now()): Sandbox {
  const r = rng(region === "AU" ? 20261031 : 20261101);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
  const between = (a: number, b: number) => a + r() * (b - a);
  const person = () => `${pick(FIRST)} ${pick(LAST)}`;
  const R = REGION[region];
  const c = terms(region);
  const AU = region === "AU";
  const round5 = (n: number) => Math.round(n / 5) * 5;
  const WO = c.workOrder[0].toUpperCase() + c.workOrder.slice(1);

  const managers: Manager[] = AU
    ? [
        { id: "m1", name: "Sarah Mitchell", initials: "SM" },
        { id: "m2", name: "Daniel Okafor", initials: "DO" },
        { id: "m3", name: "Lauren Tran", initials: "LT" },
      ]
    : [
        { id: "m1", name: "Rebecca Shaw", initials: "RS" },
        { id: "m2", name: "James Doyle", initials: "JD" },
        { id: "m3", name: "Amira Hussain", initials: "AH" },
      ];

  const owners: Owner[] = Array.from({ length: 60 }, (_, i) => {
    const name = person();
    return { id: `o${i + 1}`, name, email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`, approvalLimit: pick(R.limits) };
  });

  const contractors: Contractor[] = [];
  for (const [trade, bizs] of Object.entries(BUSINESSES[region]) as [Trade, string[]][]) {
    bizs.forEach((business, i) => {
      const n = contractors.length + 1;
      // UK: gas and heating work needs a Gas Safe registration; most other UK trades hold no licence.
      const licence = AU
        ? trade === "pest"
          ? `Pest licence ${5100 + n * 37}`
          : `NSW licence ${(320000 + n * 4111).toString()}C`
        : trade === "gas" || trade === "hvac"
          ? `Gas Safe ${(512000 + n * 917).toString()}`
          : trade === "electrician"
            ? `NICEIC ${(60000 + n * 311).toString()}`
            : "";
      const licenceDays = between(60, 700);
      contractors.push({
        id: `t${n}`,
        name: person(),
        business,
        trade,
        onCall: i === 0,
        licence,
        licenceExpires: now + (licence ? licenceDays : 3650) * D,
        // One contractor's insurance has lapsed, so the block on dispatch can be seen.
        insuranceExpires: trade === "handyman" && i === 1 ? now - 9 * D : now + between(40, 360) * D,
      });
    });
  }

  const P = PLACES[region];
  const strataNames = AU ? ["Harbour Strata Management", "Westside Strata"] : ["Northern Block Management", "City Living Estates"];
  const properties: Property[] = Array.from({ length: 120 }, (_, i) => {
    const [suburb, postcode] = pick(P.suburbs);
    const num = 1 + Math.floor(r() * 180);
    const isUnit = i !== 6 && r() < (AU ? 0.4 : 0.45); // p7 (index 6) is the demo house
    const unit = 1 + Math.floor(r() * 14);
    const street = pick(P.streets);
    const address = isUnit ? (AU ? `${unit}/${num} ${street}` : `Flat ${unit}, ${num} ${street}`) : `${num} ${street}`;
    const strataName = pick(strataNames);
    return {
      id: `p${i + 1}`,
      address,
      suburb,
      postcode,
      ownerId: owners[i % owners.length].id,
      managerId: managers[i % managers.length].id,
      tenant: person(),
      beds: 1 + Math.floor(r() * 4),
      hasGas: i === 6 ? true : r() < (AU ? 0.5 : 0.85),
      hasPool: AU && !isUnit && r() < 0.15,
      strata: isUnit ? { manager: strataName, phone: AU ? `02 5550 0${100 + Math.floor(r() * 800)}` : `0161 496 0${100 + Math.floor(r() * 800)}` } : undefined,
      keysAtOffice: r() < 0.7,
    };
  });
  const ownerOf = (p: Property) => owners.find((o) => o.id === p.ownerId)!;

  const byTrade = (t: Trade) => contractors.filter((x) => x.trade === t && x.insuranceExpires > now);
  let rr = 0;
  const assign = (t: Trade, urgent: boolean) => {
    const list = byTrade(t);
    if (urgent) return list.find((x) => x.onCall) ?? list[0];
    return list[rr++ % list.length];
  };

  // Templates are dealt like cards: shuffled, without replacement, never the same title twice in one column,
  // and at most one gas leak on the board.
  const deck = (pool: Tpl[]) => {
    let cards: Tpl[] = [];
    return () => {
      if (!cards.length) {
        cards = [...pool];
        for (let i = cards.length - 1; i > 0; i--) {
          const k = Math.floor(r() * (i + 1));
          [cards[i], cards[k]] = [cards[k], cards[i]];
        }
      }
      return cards.pop()!;
    };
  };
  const decks = { open: deck(TEMPLATES), routine: deck(TEMPLATES.filter((t) => t.urgency === "routine")), owner: deck(OWNER_TEMPLATES) };
  // The demo property's earlier basin leak becomes a billed job below, so its title is taken in that column.
  const columns = new Map<Stage, Set<string>>([["billed", new Set([AU ? "Leak under the bathroom basin" : "Leak under the bathroom sink"])]]);
  let gasLeaks = 0;
  const deal = (stage: Stage): Tpl => {
    const draw = stage === "owner" ? decks.owner : stage === "sent" ? decks.routine : decks.open;
    const seen = columns.get(stage) ?? new Set<string>();
    columns.set(stage, seen);
    for (let guard = 0; guard < 200; guard++) {
      const t = draw();
      const title = (!AU && t.uk ? t.uk : t.au)[0];
      const leak = t.trade === "gas" && t.urgency === "urgent";
      if (seen.has(title) || (leak && gasLeaks > 0)) continue;
      // A booked NSW smoke alarm must sit inside its 2-business-day deadline, which a weekend can make impossible.
      if (stage === "booked" && AU && isSmokeAlarm(title)) continue;
      if (leak) gasLeaks++;
      seen.add(title);
      return t;
    }
    throw new Error("seed: ran out of templates");
  };

  // One job per property, so no two seeded jobs look like a repeat by accident.
  const used = new Set<string>([DEMO_PROPERTY]);
  const propFor = (t: Tpl, limitBelow?: number) => {
    const fits = (p: Property) => !used.has(p.id) && (!t.house || !p.strata) && (limitBelow === undefined || ownerOf(p).approvalLimit < limitBelow);
    const ok = properties.filter(fits);
    const p = ok.length ? pick(ok) : pick(properties.filter((x) => !used.has(x.id)));
    used.add(p.id);
    return p;
  };

  // Ages (hours) at which each stage was reached: where each report starts before its timeline is built.
  const AGE: Record<Stage, [number, number]> = AU
    ? { new: [0.1, 4], sent: [3, 60], owner: [10, 70], booked: [20, 140], done: [30, 200], billed: [60, 600] }
    : { new: [0.2, 5], sent: [2, 70], owner: [8, 60], booked: [24, 150], done: [36, 220], billed: [70, 640] };

  // Every seeded time sits on the agency's clock (G4 round 3): managers act in office hours (Mon to Fri 8:30 to
  // 5 pm), contractors reply in trade hours (Mon to Sat 7 am to 6 pm), a night-time urgent report goes through the
  // after-hours path (on-call paged in minutes, the manager confirms at 8:30), urgent visits come 30 minutes to 3
  // hours after the contractor accepts, on the quarter hour, and routine visits sit on business-hour slots after
  // the notice period.
  const M = 60_000;
  const minutes = (a: number, b: number) => Math.round(between(a, b)) * M;
  const q15 = (t: number) => Math.ceil(t / (15 * M)) * 15 * M;
  const office = (t: number) => nextOpen(region, t, 510, 1020, ["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const tradeOpen = (t: number) => nextOpen(region, t, 420, 1080, ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  // A contractor replies some time into their day, not on the stroke of 7 (and never wraps past 6 pm to tomorrow).
  const tradeHours = (t: number) => {
    const x = tradeOpen(t);
    const y = x + minutes(10, 100);
    return tradeOpen(y) === y ? y : x;
  };
  // A manager's confirm lands inside office hours, never after 5 pm.
  const officeAct = (t: number, a: number, b: number) => office(office(t) + minutes(a, b));

  type Clock = { after: boolean; suggest: number; confirm: number; dispatch: number; quote?: number; accept?: number; visit?: number; done?: number; invoice?: number; last: number };
  const takenSlots = new Set<number>();
  /** The job's whole timeline, built forwards from the report. */
  const clockFor = (createdAt: number, stage: Stage, urgent: boolean, notice: number): Clock => {
    const after = isAfterHours(region, createdAt);
    const suggest = createdAt + minutes(1, 3);
    if (stage === "new") return { after, suggest, confirm: 0, dispatch: 0, last: createdAt };
    let confirm: number;
    let dispatch: number;
    if (urgent && after) {
      dispatch = createdAt + minutes(3, 8);
      confirm = officeAct(createdAt, 5, 25);
    } else {
      confirm = urgent ? createdAt + minutes(5, 20) : officeAct(createdAt, 5, 75);
      dispatch = confirm;
    }
    // A night-time urgent job does not wait for the manager: the 8:30 confirm may still be ahead (a weekend), and
    // then the job is on the board with its reply not sent yet, as it would be in real life.
    const k: Clock = { after, suggest, confirm, dispatch, last: urgent && after ? dispatch : Math.max(confirm, dispatch) };
    if (stage === "sent") return k;
    if (stage === "owner") {
      k.quote = tradeHours(dispatch + between(2, 30) * H);
      k.last = Math.max(k.last, k.quote);
      return k;
    }
    k.accept = urgent ? dispatch + minutes(4, 20) : tradeHours(dispatch + between(1, 20) * H);
    if (stage === "booked") {
      k.last = Math.max(k.last, k.accept);
      return k; // the visit itself is in the future, chosen below
    }
    // A smoke alarm (1 hour's notice) is visited within its 2 business days: one of the first slots.
    k.visit = urgent ? q15(k.accept + between(0.5, 3) * H) : pick(slots(region, k.accept + notice * H, 6, 0).slice(0, notice === 1 ? 2 : 6));
    k.done = k.visit + Math.round(between(4, 8)) * 15 * M;
    k.last = Math.max(k.last, k.done);
    if (stage === "billed") {
      k.invoice = tradeHours(k.done + between(1, 30) * H);
      k.last = Math.max(k.last, k.invoice);
    }
    return k;
  };

  const jobs: Job[] = [];
  STAGE_MIX.forEach((stage, i) => {
    const t = deal(stage);
    const trade = (!AU && t.ukTrade) || t.trade;
    const band: Band = !AU && t.ukPrice ? t.ukPrice : AU ? t.price : [t.price[0] * 0.55, t.price[1] * 0.55];
    let amount = round5(between(band[0], band[1]));
    // Owner-stage work goes to a property whose owner's limit is below the quote: that is why it waits.
    const prop = propFor(t, stage === "owner" ? amount : undefined);
    const owner = ownerOf(prop);
    const urgent = t.urgency === "urgent";
    const [title, variants] = !AU && t.uk ? t.uk : t.au;
    const smoke = AU && isSmokeAlarm(title);
    const notice = urgent ? 0 : smoke ? SMOKE_ALARM.noticeHours : R.noticeHours;
    let ageH = between(AGE[stage][0], AGE[stage][1]) * (urgent && stage !== "billed" ? 0.12 : 1);
    if (urgent && stage === "booked") ageH = between(0.6, 2.2); // accepted moments ago, visit still to come
    if (urgent && stage === "new") ageH = between(3, 12) / 60; // just in: an urgent report never sits untriaged
    if (smoke && stage !== "billed") ageH = Math.min(ageH, 30); // the law's 2 business days
    // Routine work runs on office hours: place the job at a spread of points through its stage's target (most well
    // inside it, a few due soon, one or two late), counted in office hours, so no day of the week paints the board
    // one colour. The report comes a few office hours before it entered the stage.
    let createdAt = now - ageH * H;
    const target = TARGET_HOURS.routine[stage];
    if (!urgent && !smoke && target && stage !== "new") {
      const u = r();
      const frac = u < 0.08 ? between(1.05, 1.35) : u < 0.25 ? between(0.76, 0.95) : between(0.05, 0.7);
      const entered = officeBack(region, now, frac * target);
      createdAt = officeBack(region, entered, stage === "sent" ? between(0.2, 1.2) : between(3, 14));
    }
    // Build the timeline; if any step would land in the future, the report moves earlier and it is built again.
    let k = clockFor(createdAt, stage, urgent, notice);
    for (let n = 0; n < 8 && k.last > now - 2 * M; n++) {
      createdAt -= k.last - (now - 2 * M) + between(0.5, 3) * H;
      k = clockFor(createdAt, stage, urgent, notice);
    }
    const description = pick(variants);
    const contractor = assign(trade, urgent);
    const first = prop.tenant.split(" ")[0];
    const job: Job = {
      id: `j${i + 1}`,
      ref: `${AU ? "HL" : "NG"}-${4100 + i}`,
      propertyId: prop.id,
      createdAt,
      stageEnteredAt: createdAt,
      title,
      description,
      access: { mode: prop.keysAtOffice ? "keys" : "home", note: "", pets: r() < 0.25 },
      afterHours: k.after,
      trade,
      urgency: t.urgency,
      stage,
      events: [{ at: createdAt, by: "tenant", text: "Reported by the tenant" }],
    };
    const ev = (at: number, by: Job["events"][number]["by"], text: string) => job.events.push({ at, by, text });

    if (stage !== "new") {
      job.triage = {
        source: "ai",
        at: k.suggest,
        trade,
        urgency: t.urgency,
        reason: "",
        safety: [],
        emergency: urgent ? emergencyText(region, ruleTriage(`${title}. ${description}`, region).hazards) : [],
        reply: "",
        chargeTo: t.chargeTo ?? "owner",
        strataReferral: false,
        insuranceClaim: false,
        confirmedAt: k.confirm <= now - M ? k.confirm : undefined,
      };
      ev(k.suggest, "tapline", `AI suggested: ${tradeWho(region, trade)}, ${t.urgency}`);
      if (job.triage.confirmedAt) ev(k.confirm, "manager", "Triage confirmed, reply sent to the tenant");
      job.contractorId = contractor.id;
      job.stageEnteredAt = k.dispatch;
      if (urgent) {
        job.cap = R.urgentLimit;
        job.ownerDecision = { decision: "urgent", at: k.dispatch };
        if (k.after) {
          ev(
            k.dispatch,
            "tapline",
            job.triage.emergency.length ? "After hours: the tenant was sent the fixed safety steps automatically" : `After hours: the tenant was told the on-call ${c.contractor} has been contacted`
          );
          ev(k.dispatch, "tapline", `After hours: on-call ${contractor.business} paged (up to ${money(region, R.urgentLimit)}), ${c.owner} notified. Waiting for a manager to confirm the reply.`);
        } else {
          ev(k.dispatch, "tapline", `Urgent: sent to on-call ${contractor.business} (up to ${money(region, R.urgentLimit)}), ${c.owner} notified`);
        }
      } else if (smoke) {
        job.cap = R.urgentLimit;
        job.dueBy = addBusinessDays(region, createdAt, SMOKE_ALARM.businessDays);
        job.ownerDecision = { decision: "auto", at: k.dispatch };
        ev(k.dispatch, "tapline", `Smoke alarm repair sent to ${contractor.business}: due within 2 business days by NSW law, no ${c.owner} approval needed, ${c.owner} notified`);
      } else {
        job.cap = owner.approvalLimit;
        ev(k.dispatch, "tapline", `${WO} sent to ${contractor.business}, up to ${money(region, owner.approvalLimit)}`);
      }
    }

    if (stage === "owner") {
      job.quote = { amount, note: t.note ? t.note[AU ? 0 : 1] : "Labour and parts", at: k.quote! };
      ev(k.quote!, "contractor", `Quote sent: ${money(region, amount)}`);
      ev(k.quote!, "tapline", `Over the ${money(region, owner.approvalLimit)} limit, sent to the ${c.owner} for approval`);
      job.stageEnteredAt = k.quote!;
    }

    if (["booked", "done", "billed"].includes(stage)) {
      if (!urgent) {
        amount = Math.min(amount, job.cap!);
        if (!smoke) job.ownerDecision = { decision: "auto", at: k.accept! };
      }
      if (stage === "booked") {
        const free = slots(region, Math.max(now + H, k.accept! + notice * H), 14, 0).filter((x) => !takenSlots.has(x));
        // A smoke alarm visit sits before its legal due date.
        const legal = free.filter((x) => !job.dueBy || x <= job.dueBy);
        k.visit = urgent ? Math.max(q15(k.accept! + between(0.5, 3) * H), q15(now + 20 * M)) : legal.length ? pick(legal.slice(0, 6)) : free[0];
        takenSlots.add(k.visit);
      }
      job.bookedFor = k.visit;
      ev(k.accept!, "contractor", `${contractor.business} accepted and booked a visit`);
      job.stageEnteredAt = k.accept!;
    }
    if (["done", "billed"].includes(stage)) {
      job.completedAt = k.done!;
      ev(k.done!, "contractor", "Marked complete with a photo");
      job.stageEnteredAt = k.done!;
    }
    if (stage === "billed") {
      const inv = round5(amount * between(0.9, 1.0));
      job.invoice = { amount: inv, at: k.invoice!, overApproved: false };
      job.billedAt = k.invoice!;
      ev(k.invoice!, "contractor", `Invoice uploaded: ${money(region, inv)} incl. ${c.tax}`);
      ev(k.invoice!, "tapline", `Bill entered in ${c.accounts}`);
      job.stageEnteredAt = k.invoice!;
    }
    if (job.triage) {
      const at = job.triage.confirmedAt ?? now;
      const stageThen: Stage = k.done && at >= k.done ? "done" : k.accept && at >= k.accept ? "booked" : "sent";
      job.triage.reply = tenantReply(region, R.agency, first, { stage: stageThen, urgency: t.urgency, trade }, { business: contractor.business, at: job.bookedFor });
    }
    job.events.sort((a, b) => a.at - b.at);
    jobs.push(job);
  });

  /** A finished routine job from the past, on the same clock (the history behind the repeat faults). */
  const pastJob = (at0: number, base: { id: string; ref: string; propertyId: string; title: string; description: string; trade: Trade; contractorId: string; cap: number; access?: Job["access"] }, inv: number): Job => {
    const con = contractors.find((x) => x.id === base.contractorId)!;
    const confirm = officeAct(at0, 10, 60);
    const accept = tradeHours(confirm + between(1, 8) * H);
    const visit = slots(region, accept + R.noticeHours * H, 1, 0)[0];
    const done = visit + 90 * M;
    const billed = tradeHours(done + between(2, 24) * H);
    const tenant = properties.find((p) => p.id === base.propertyId)!.tenant.split(" ")[0];
    return {
      ...base,
      createdAt: at0,
      stageEnteredAt: billed,
      urgency: "routine",
      stage: "billed",
      afterHours: isAfterHours(region, at0),
      triage: { source: "ai", at: at0 + 2 * M, trade: base.trade, urgency: "routine", reason: "", safety: [], emergency: [], reply: tenantReply(region, R.agency, tenant, { stage: "sent", urgency: "routine", trade: base.trade }), chargeTo: "owner", strataReferral: false, insuranceClaim: false, confirmedAt: confirm },
      ownerDecision: { decision: "auto", at: accept },
      bookedFor: visit,
      completedAt: done,
      invoice: { amount: inv, at: billed, overApproved: false },
      billedAt: billed,
      events: [
        { at: at0, by: "tenant", text: "Reported by the tenant" },
        { at: at0 + 2 * M, by: "tapline", text: `AI suggested: ${tradeWho(region, base.trade)}, routine` },
        { at: confirm, by: "manager", text: "Triage confirmed, reply sent to the tenant" },
        { at: confirm, by: "tapline", text: `${WO} sent to ${con.business}, up to ${money(region, base.cap)}` },
        { at: accept, by: "contractor", text: `${con.business} accepted and booked a visit` },
        { at: done, by: "contractor", text: "Marked complete with a photo" },
        { at: billed, by: "contractor", text: `Invoice uploaded: ${money(region, inv)} incl. ${c.tax}` },
        { at: billed, by: "tapline", text: `Bill entered in ${c.accounts}` },
      ],
    };
  };

  // The demo's repeat-fault story: the property the tenant demo reports from already had a plumbing job 45 days ago.
  const prior = jobs.filter((j) => j.stage === "billed").pop();
  if (prior) {
    const idx = jobs.indexOf(prior);
    jobs[idx] = pastJob(
      now - 45 * D,
      {
        id: prior.id,
        ref: prior.ref,
        propertyId: DEMO_PROPERTY,
        title: AU ? "Leak under the bathroom basin" : "Leak under the bathroom sink",
        description: "Slow leak from the pipe joint under the basin.",
        trade: "plumber",
        contractorId: assign("plumber", false).id,
        cap: ownerOf(properties[6]).approvalLimit,
        access: prior.access,
      },
      AU ? 245 : 135
    );
  }

  // Two open repeat faults: the same fault at the same property, fixed a few weeks ago and back again.
  const billedTitles = new Set(jobs.filter((j) => j.stage === "billed").map((j) => j.title));
  const candidates = (st: Stage) => jobs.find((j) => j.stage === st && j.urgency === "routine" && !j.dueBy && j.propertyId !== DEMO_PROPERTY && !billedTitles.has(j.title));
  [candidates("sent"), candidates("booked")].forEach((j, k) => {
    if (!j) return;
    const cap = j.cap ?? 300;
    jobs.push(
      pastJob(
        j.createdAt - (k ? 38 : 24) * D,
        { id: `jh${k + 1}`, ref: `${AU ? "HL" : "NG"}-${4071 + k * 12}`, propertyId: j.propertyId, title: j.title, description: j.description, trade: j.trade, contractorId: j.contractorId!, cap, access: j.access },
        round5(Math.min(cap, cap * 0.55 + 40))
      )
    );
  });

  // Repeat faults are flagged once, from the same rule the board uses.
  for (const j of jobs) {
    if (!j.triage) continue;
    const earlier = priorRelated(jobs, j);
    if (earlier) j.triage.repeatOf = { ref: earlier.ref, title: earlier.title, trade: earlier.trade, daysAgo: Math.round((j.createdAt - earlier.createdAt) / D) };
  }

  // Compliance: per region and per property; a small, realistic share overdue.
  const compliance: ComplianceItem[] = [];
  properties.forEach((p) => {
    R.compliance.forEach((rule, k) => {
      if (rule.appliesTo === "gas" && !p.hasGas) return;
      if (rule.appliesTo === "pool" && !p.hasPool) return;
      const overdue = r() < 0.035;
      const daysSince = overdue ? rule.everyDays + between(3, 45) : between(5, rule.everyDays - 2);
      const lastDoneAt = now - daysSince * D;
      compliance.push({ id: `c${p.id}-${k}`, propertyId: p.id, kind: rule.kind, lastDoneAt, dueAt: lastDoneAt + rule.everyDays * D });
    });
  });

  return { id, region, createdAt: now, agency: R.agency, managers, owners, contractors, properties, jobs, compliance };
}

/** The most recent earlier job at the same property, for the same trade, within 90 days. The AI can name a
 * related job in another trade (a roof leak behind a ceiling stain); the rule stays narrow on purpose. */
export function priorRelated(jobs: Job[], j: Job, trade: Trade = j.trade) {
  return jobs
    .filter((x) => x.id !== j.id && x.propertyId === j.propertyId && x.createdAt < j.createdAt && j.createdAt - x.createdAt < 90 * D && x.trade === trade && !x.complianceId)
    .sort((a, b) => b.createdAt - a.createdAt)[0];
}

