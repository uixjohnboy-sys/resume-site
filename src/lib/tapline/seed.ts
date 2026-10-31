import { REGION, money, slots, terms } from "./rules";
import type { ComplianceItem, Contractor, Job, Manager, Owner, Property, Region, Sandbox, Stage, Trade, Urgency } from "./types";

// Deterministic fictional data that obeys the product's own rules: owner-stage
// quotes are over the owner's limit, work orders are capped at it, bookings sit
// on business-hour slots, compliance follows each region's rules, and every
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

type Tpl = {
  trade: Trade;
  urgency: Urgency;
  /** AUD price band; GBP uses 0.55 of it. */
  price: [number, number];
  au: [string, string[]];
  uk?: [string, string[]];
  chargeTo?: "tenant";
};

const TEMPLATES: Tpl[] = [
  { trade: "plumber", urgency: "routine", price: [150, 260], au: ["Kitchen tap dripping", ["The kitchen mixer drips all the time, even when it's fully off.", "Constant drip from the kitchen tap, filling a cup overnight."]] },
  { trade: "plumber", urgency: "routine", price: [140, 240], au: ["Toilet keeps running", ["The cistern refills every few minutes and you can hear it all night.", "Toilet won't stop running after a flush unless I jiggle the button."]] },
  { trade: "plumber", urgency: "routine", price: [180, 320], au: ["Kitchen sink draining slowly", ["Sink takes ten minutes to drain and smells a bit.", "Water sits in the kitchen sink after washing up."]] },
  { trade: "plumber", urgency: "routine", price: [160, 280], au: ["Shower drain blocked", ["Water pools around our feet in the shower.", "Shower takes ages to drain."]] },
  { trade: "plumber", urgency: "routine", price: [180, 300], au: ["Leak under the bathroom basin", ["Small puddle under the vanity every morning."]], uk: ["Leak under the bathroom sink", ["Small puddle under the sink every morning."]] },
  { trade: "plumber", urgency: "urgent", price: [380, 900], au: ["Water coming through the ceiling", ["Brown stain on the living room ceiling and it's dripping into a bucket."]] },
  { trade: "plumber", urgency: "urgent", price: [420, 1100], au: ["Burst pipe in the laundry", ["A pipe behind the washing machine burst and water is everywhere."]], uk: ["Burst pipe in the kitchen", ["A pipe under the kitchen sink has burst and water is everywhere."]] },
  { trade: "plumber", urgency: "urgent", price: [450, 1500], au: ["No hot water", ["The hot water system stopped this morning, only cold water now."]] },
  { trade: "plumber", urgency: "urgent", price: [250, 450], au: ["Only toilet blocked", ["Our only toilet is blocked and won't flush."]] },
  { trade: "gas", urgency: "urgent", price: [200, 420], au: ["Smell of gas in the kitchen", ["Strong smell of gas near the cooktop since this afternoon."]], uk: ["Smell of gas in the kitchen", ["Strong smell of gas near the hob since this afternoon."]] },
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
  { trade: "handyman", urgency: "routine", price: [200, 450], au: ["Fence palings down", ["A few palings blew off the side fence in the wind."]], uk: ["Fence panel down", ["A fence panel blew down in the wind."]] },
  { trade: "handyman", urgency: "routine", price: [90, 180], au: ["Flyscreen torn", ["The bedroom flyscreen has a big tear."]], uk: ["Kitchen cupboard door hanging off", ["A hinge has come out of a kitchen cupboard door."]] },
  { trade: "roofer", urgency: "routine", price: [200, 450], au: ["Gutter overflowing", ["The back gutter overflows every time it rains and water runs down the wall."]] },
  { trade: "roofer", urgency: "routine", price: [300, 700], au: ["Roof tiles slipped", ["A few roof tiles look like they've slipped after the storm."]], uk: ["Slates slipped", ["A few slates look like they've slipped after the storm."]] },
  { trade: "hvac", urgency: "routine", price: [220, 480], au: ["Air con not cooling", ["The split system runs but only blows warm air."]], uk: ["Boiler losing pressure", ["Boiler pressure drops below 1 bar every couple of days and the radiators go cold."]] },
  { trade: "hvac", urgency: "routine", price: [160, 320], au: ["Air con dripping inside", ["Water drips from the indoor unit onto the floor."]], uk: ["Radiator cold at the top", ["The bedroom radiator is cold at the top and warm at the bottom."]] },
  { trade: "pest", urgency: "routine", price: [180, 300], au: ["Mice in the kitchen", ["Droppings in the pantry and scratching at night."]] },
  { trade: "pest", urgency: "routine", price: [150, 280], au: ["Cockroaches in the kitchen", ["Seeing cockroaches every night near the fridge."]], uk: ["Wasps nest by the front door", ["There's a wasps nest under the eaves by the front door."]] },
  { trade: "glazier", urgency: "routine", price: [250, 600], au: ["Cracked window pane", ["Crack across the bottom pane of the bedroom window."]] },
  { trade: "glazier", urgency: "urgent", price: [300, 700], au: ["Smashed back window", ["Someone smashed the back window overnight, it's wide open."]] },
  { trade: "damp", urgency: "routine", price: [250, 700], au: ["Mould in the bathroom", ["Black mould keeps coming back on the bathroom ceiling."]], uk: ["Black mould in the bedroom", ["Black mould on the bedroom wall behind the wardrobe."]] },
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
  const priceScale = AU ? 1 : 0.55;
  const round5 = (n: number) => Math.round(n / 5) * 5;

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
      const licence = AU
        ? trade === "pest"
          ? `Pest licence ${5100 + n * 37}`
          : `NSW licence ${(320000 + n * 4111).toString()}C`
        : trade === "gas"
          ? `Gas Safe ${(512000 + n * 917).toString()}`
          : trade === "electrician"
            ? `NICEIC ${(60000 + n * 311).toString()}`
            : "Public liability verified";
      contractors.push({
        id: `t${n}`,
        name: person(),
        business,
        trade,
        onCall: i === 0,
        licence,
        licenceExpires: now + between(60, 700) * D,
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

  const byTrade = (t: Trade) => contractors.filter((x) => x.trade === t && x.insuranceExpires > now);
  let rr = 0;
  const assign = (t: Trade, urgent: boolean) => {
    const list = byTrade(t);
    if (urgent) return list.find((x) => x.onCall) ?? list[0];
    return list[rr++ % list.length];
  };

  // Ages (hours) at which each stage was reached. Routine work is slower; urgent work fast.
  const AGE: Record<Stage, [number, number]> = AU
    ? { new: [0.1, 4], sent: [3, 60], owner: [10, 70], booked: [20, 140], done: [30, 200], billed: [60, 600] }
    : { new: [0.2, 5], sent: [2, 70], owner: [8, 60], booked: [24, 150], done: [36, 220], billed: [70, 640] };

  const jobs: Job[] = [];
  STAGE_MIX.forEach((stage, i) => {
    // Owner-stage work is always routine and always over the owner's limit.
    const pool = stage === "owner" || stage === "sent" ? TEMPLATES.filter((t) => t.urgency === "routine") : TEMPLATES;
    const t = pool[Math.floor(r() * pool.length)];
    let prop = properties[Math.floor(r() * properties.length)];
    if (prop.id === DEMO_PROPERTY) prop = properties[0];
    const urgent = t.urgency === "urgent";
    const scale = urgent ? 0.12 : 1;
    const ageH = between(AGE[stage][0], AGE[stage][1]) * (stage === "billed" ? 1 : scale);
    const createdAt = now - ageH * H;
    const [title, variants] = !AU && t.uk ? t.uk : t.au;
    const description = pick(variants);
    const owner = owners.find((o) => o.id === prop.ownerId)!;
    const contractor = assign(t.trade, urgent);
    const base = between(t.price[0], t.price[1]) * priceScale;
    const job: Job = {
      id: `j${i + 1}`,
      ref: `${AU ? "HL" : "NG"}-${4100 + i}`,
      propertyId: prop.id,
      createdAt,
      stageEnteredAt: createdAt,
      title,
      description,
      access: { mode: prop.keysAtOffice ? "keys" : "home", note: "", pets: r() < 0.25 },
      trade: t.trade,
      urgency: t.urgency,
      stage,
      events: [{ at: createdAt, by: "tenant", text: "Reported by the tenant" }],
    };
    let at = createdAt;
    const step = (frac: number) => (at = Math.min(now - 60_000, createdAt + ageH * H * frac));

    if (stage !== "new") {
      step(0.08);
      job.triage = {
        source: "ai",
        at,
        trade: t.trade,
        urgency: t.urgency,
        reason: "",
        safety: [],
        emergency: [],
        reply: "",
        chargeTo: t.chargeTo ?? "owner",
        strataReferral: false,
        insuranceClaim: false,
        confirmedAt: at,
      };
      job.events.push({ at, by: "manager", text: "Triage confirmed, reply sent to the tenant" });
      job.contractorId = contractor.id;
      if (urgent) {
        job.ownerDecision = { decision: "urgent", at };
        job.events.push({ at, by: "tapline", text: `Urgent: sent to on-call ${contractor.business}, ${c.owner} notified` });
      } else {
        job.cap = owner.approvalLimit;
        job.events.push({ at, by: "tapline", text: `${c.workOrder[0].toUpperCase() + c.workOrder.slice(1)} sent to ${contractor.business}, up to ${money(region, owner.approvalLimit)}` });
      }
      job.stageEnteredAt = at;
    }

    let amount = round5(base);
    if (stage === "owner") {
      // Over the limit by a realistic margin, so it genuinely needs the owner.
      amount = round5(owner.approvalLimit * between(1.15, 1.9));
      step(0.5);
      job.quote = { amount, note: pick(["Labour and parts, includes a new cartridge", "Two hours labour plus materials", "Replace the unit, old one is not repairable", "Includes after-hours call-out"]), at };
      job.events.push({ at, by: "contractor", text: `Quote sent: ${money(region, amount)}, over the ${money(region, owner.approvalLimit)} limit` });
      job.events.push({ at, by: "tapline", text: `Sent to the ${c.owner} for approval` });
      job.stageEnteredAt = at;
    }

    if (["booked", "done", "billed"].includes(stage)) {
      if (!urgent) {
        amount = Math.min(amount, owner.approvalLimit);
        job.ownerDecision = { decision: "auto", at: step(0.25) };
      }
      step(0.3);
      // Urgent visits happen within hours, any time; routine ones on business-hour slots.
      const slot = stage === "booked" ? (urgent ? now + between(0.5, 3) * H : slots(region, now, 1, between(4, 60))[0]) : at + between(2, 30) * H;
      job.bookedFor = slot;
      job.events.push({ at, by: "contractor", text: `Accepted and booked for ${new Date(slot).toLocaleString(R.locale, { timeZone: R.tz, weekday: "short", hour: "numeric", minute: "2-digit" })}` });
      job.stageEnteredAt = at;
    }
    if (["done", "billed"].includes(stage)) {
      job.completedAt = Math.min(now - 30 * 60_000, (job.bookedFor ?? at) + 1.5 * H);
      at = job.completedAt;
      job.events.push({ at, by: "contractor", text: "Marked complete with a photo" });
      job.stageEnteredAt = at;
    }
    if (stage === "billed") {
      const inv = round5(amount * between(0.9, 1.0));
      at = Math.min(now - 60_000, at + between(4, 40) * H);
      job.invoice = { amount: inv, at, overApproved: false };
      job.billedAt = at;
      job.events.push({ at, by: "contractor", text: `Invoice uploaded: ${money(region, inv)}` });
      job.events.push({ at, by: "tapline", text: `Bill entered in ${c.accounts}` });
      job.stageEnteredAt = at;
    }
    jobs.push(job);
  });

  // The demo's repeat-fault story: the property the tenant demo reports from
  // already had a plumbing job 45 days ago.
  const prior = jobs.filter((j) => j.stage === "billed").pop();
  if (prior) {
    const at0 = now - 45 * D;
    const plumber = assign("plumber", false);
    prior.propertyId = DEMO_PROPERTY;
    prior.trade = "plumber";
    prior.urgency = "routine";
    prior.title = AU ? "Leak under the bathroom basin" : "Leak under the bathroom sink";
    prior.description = "Slow leak from the pipe joint under the basin.";
    prior.createdAt = at0;
    prior.contractorId = plumber.id;
    prior.cap = owners.find((o) => o.id === properties[6].ownerId)!.approvalLimit;
    prior.triage = { source: "ai", at: at0 + 2 * H, trade: "plumber", urgency: "routine", reason: "", safety: [], emergency: [], reply: "", chargeTo: "owner", strataReferral: false, insuranceClaim: false, confirmedAt: at0 + 2 * H };
    prior.ownerDecision = { decision: "auto", at: at0 + 2 * H };
    prior.bookedFor = at0 + 26 * H;
    prior.completedAt = at0 + 27.5 * H;
    const inv = AU ? 245 : 135;
    prior.invoice = { amount: inv, at: at0 + 50 * H, overApproved: false };
    prior.billedAt = at0 + 50 * H;
    prior.stageEnteredAt = at0 + 50 * H;
    prior.events = [
      { at: at0, by: "tenant", text: "Reported by the tenant" },
      { at: at0 + 2 * H, by: "manager", text: "Triage confirmed, reply sent to the tenant" },
      { at: at0 + 2 * H, by: "tapline", text: `${c.workOrder[0].toUpperCase() + c.workOrder.slice(1)} sent to ${plumber.business}` },
      { at: at0 + 3 * H, by: "contractor", text: "Accepted and booked" },
      { at: at0 + 27.5 * H, by: "contractor", text: "Marked complete with a photo" },
      { at: at0 + 50 * H, by: "contractor", text: `Invoice uploaded: ${money(region, inv)}` },
      { at: at0 + 50 * H, by: "tapline", text: `Bill entered in ${c.accounts}` },
    ];
  }

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

const FAMILY: Record<Trade, string> = {
  plumber: "water",
  roofer: "water",
  damp: "water",
  gas: "gas",
  hvac: "heating",
  electrician: "power",
  locksmith: "security",
  glazier: "security",
  handyman: "general",
  pest: "pest",
};

/** The most recent earlier job at the same property, in the same fault family, within 90 days. */
export function priorRelated(jobs: Job[], j: Job, trade: Trade = j.trade) {
  return jobs
    .filter((x) => x.id !== j.id && x.propertyId === j.propertyId && x.createdAt < j.createdAt && j.createdAt - x.createdAt < 90 * D && FAMILY[x.trade] === FAMILY[trade] && !x.complianceId)
    .sort((a, b) => b.createdAt - a.createdAt)[0];
}

