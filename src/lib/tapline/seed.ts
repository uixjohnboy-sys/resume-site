import { REGION, money } from "./rules";
import type { ComplianceItem, Job, Manager, Owner, Property, Region, Sandbox, Stage, Tradie, Trade, Urgency } from "./types";

// Deterministic fictional data. Same seed, same agency, every visitor; only
// the timestamps are relative to the moment the sandbox is created, so the
// timers always look like a live Tuesday morning.

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

const FIRST = ["Olivia", "Jack", "Mia", "Noah", "Ava", "Leo", "Isla", "Oscar", "Grace", "Henry", "Zara", "Lucas", "Ruby", "Ethan", "Chloe", "Liam", "Sophie", "Archie", "Ella", "Max", "Priya", "Arjun", "Mei", "Tom", "Hannah", "Sam", "Aisha", "Ben", "Layla", "Dylan"];
const LAST = ["Nguyen", "Smith", "Patel", "Brown", "Wilson", "Taylor", "Kelly", "Murphy", "Chen", "Walker", "Clarke", "Hughes", "Singh", "Martin", "Evans", "Wright", "Hall", "Young", "Lee", "Khan", "Reid", "Cooper", "Ward", "Price", "Bennett"];

const PLACES = {
  AU: {
    streets: ["Wattle St", "Bay Rd", "Albert Ave", "Ocean Pde", "Railway Tce", "Banksia Cres", "Victoria Rd", "Park Lane", "Elizabeth St", "Harbour View Dr", "Kent St", "Short St"],
    suburbs: ["Marrickville", "Glebe", "Randwick", "Parramatta", "Manly", "Newtown", "Bondi", "Chatswood", "Ryde", "Leichhardt"],
  },
  UK: {
    streets: ["Mill Lane", "Station Road", "Church Street", "Victoria Road", "Park Avenue", "Albert Street", "Queens Road", "Canal Walk", "Oxford Road", "Rose Terrace", "King Street", "Granby Row"],
    suburbs: ["Didsbury", "Chorlton", "Ancoats", "Salford", "Levenshulme", "Withington", "Stretford", "Prestwich", "Sale", "Fallowfield"],
  },
};

const TRADIE_BIZ: Record<Trade, string[]> = {
  plumber: ["FlowRight Plumbing", "Pipeline Pros", "Same Day Plumbing"],
  electrician: ["Bright Spark Electrical", "Circuit Co"],
  locksmith: ["KeyFast Locksmiths"],
  handyman: ["Fix It Friday", "Odd Jobs Co"],
  roofer: ["TopCover Roofing"],
  hvac: ["Comfort Air Services"],
  pest: ["Shield Pest Control"],
  glazier: ["ClearView Glass"],
};

type Template = { trade: Trade; urgency: Urgency; title: string; description: string; photo?: string };
const TEMPLATES: Template[] = [
  { trade: "plumber", urgency: "urgent", title: "Water coming through the ceiling", description: "Brown stain on the living room ceiling and it is dripping into a bucket.", photo: "ceiling" },
  { trade: "plumber", urgency: "routine", title: "Kitchen tap dripping", description: "The kitchen mixer tap drips constantly even when fully off.", photo: "tap" },
  { trade: "plumber", urgency: "routine", title: "Toilet keeps running", description: "Toilet cistern refills every few minutes." },
  { trade: "plumber", urgency: "urgent", title: "No hot water", description: "Hot water system stopped working this morning, only cold water." },
  { trade: "electrician", urgency: "urgent", title: "Power point sparking", description: "The bedroom power point sparked when I plugged in a lamp and smells burnt." },
  { trade: "electrician", urgency: "routine", title: "Bathroom light not working", description: "Changed the globe but the bathroom light still will not turn on." },
  { trade: "locksmith", urgency: "urgent", title: "Front door will not lock", description: "The deadbolt on the front door is jammed and we cannot lock the house." },
  { trade: "handyman", urgency: "routine", title: "Wardrobe door off its track", description: "Sliding wardrobe door has come off the bottom track." },
  { trade: "handyman", urgency: "routine", title: "Loose stair handrail", description: "The handrail on the stairs is coming away from the wall." },
  { trade: "roofer", urgency: "routine", title: "Gutter overflowing", description: "Back gutter overflows every time it rains, water runs down the wall." },
  { trade: "hvac", urgency: "routine", title: "Air con not cooling", description: "Split system runs but only blows warm air." },
  { trade: "pest", urgency: "routine", title: "Mice in the kitchen", description: "Droppings in the pantry and we have heard scratching at night." },
  { trade: "glazier", urgency: "routine", title: "Cracked window pane", description: "Crack across the bottom pane of the bedroom window." },
];

const UK_SWAP: Record<string, string> = {
  "Air con not cooling": "Boiler losing pressure",
  "Split system runs but only blows warm air.": "Boiler pressure drops below 1 bar every couple of days and the radiators go cold.",
  "Hot water system stopped working this morning, only cold water.": "Boiler stopped working this morning, no hot water at all.",
  "power point": "plug socket",
  "Power point": "Plug socket",
  globe: "bulb",
};

function uk(s: string) {
  let out = s;
  for (const [a, b] of Object.entries(UK_SWAP)) out = out.split(a).join(b);
  return out;
}

// Stage mix for the 40 open-ish jobs, chosen so every column has work and a
// few timers are already red.
const STAGE_MIX: Stage[] = [
  ...Array(5).fill("new"),
  ...Array(6).fill("quote"),
  ...Array(7).fill("owner"),
  ...Array(9).fill("booked"),
  ...Array(6).fill("done"),
  ...Array(7).fill("invoiced"),
];

export function seedSandbox(id: string, region: Region, now = Date.now()): Sandbox {
  const r = rng(region === "AU" ? 20261031 : 20261101);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
  const person = () => `${pick(FIRST)} ${pick(LAST)}`;
  const R = REGION[region];

  const managers: Manager[] = [
    { id: "m1", name: region === "AU" ? "Sarah Mitchell" : "Rebecca Shaw", initials: region === "AU" ? "SM" : "RS" },
    { id: "m2", name: region === "AU" ? "Daniel Okafor" : "James Doyle", initials: region === "AU" ? "DO" : "JD" },
    { id: "m3", name: region === "AU" ? "Lauren Tran" : "Amira Hussain", initials: region === "AU" ? "LT" : "AH" },
  ];

  const owners: Owner[] = Array.from({ length: 60 }, (_, i) => {
    const name = person();
    return {
      id: `o${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
      approvalLimit: R.approvalLimit,
    };
  });

  const tradies: Tradie[] = [];
  for (const [trade, bizs] of Object.entries(TRADIE_BIZ) as [Trade, string[]][]) {
    bizs.forEach((business, i) => tradies.push({ id: `t${tradies.length + 1}`, name: person(), business, trade, onCall: i === 0 }));
  }

  const P = PLACES[region];
  const properties: Property[] = Array.from({ length: 120 }, (_, i) => ({
    id: `p${i + 1}`,
    address: `${1 + Math.floor(r() * 180)}${r() < 0.3 ? "/" + (1 + Math.floor(r() * 12)) : ""} ${pick(P.streets)}`,
    suburb: pick(P.suburbs),
    ownerId: owners[i % owners.length].id,
    managerId: managers[i % managers.length].id,
    tenant: person(),
    beds: 1 + Math.floor(r() * 4),
  }));

  const jobs: Job[] = STAGE_MIX.map((stage, i) => {
    // Urgent jobs skip the quote and owner steps (the on-call tradie goes
    // straight out and the owner is told), so those two columns only hold
    // routine work.
    const pool = stage === "quote" || stage === "owner" ? TEMPLATES.filter((x) => x.urgency === "routine") : TEMPLATES;
    const t = pool[Math.floor(r() * pool.length)];
    let prop = properties[Math.floor(r() * properties.length)];
    if (prop.id === DEMO_PROPERTY) prop = properties[0];
    // Age by stage: later stages are older. A handful are overdue on purpose.
    const baseAge: Record<Stage, number> = { new: 0.4, quote: 20, owner: 30, booked: 50, done: 80, invoiced: 140 };
    const ageH = baseAge[stage] * (t.urgency === "urgent" ? 0.15 : 1) * (0.4 + r() * 1.4);
    const createdAt = now - ageH * H;
    const trade = t.trade;
    const tradie = tradies.find((x) => x.trade === trade) ?? tradies[0];
    const title = region === "UK" ? uk(t.title) : t.title;
    const description = region === "UK" ? uk(t.description) : t.description;
    const amount = Math.round((trade === "handyman" ? 120 : 180) + r() * (t.urgency === "urgent" ? 650 : 420));
    const job: Job = {
      id: `j${i + 1}`,
      ref: `${region === "AU" ? "HL" : "NG"}-${(4100 + i).toString()}`,
      propertyId: prop.id,
      createdAt,
      title,
      description,
      photo: t.photo,
      trade,
      urgency: t.urgency,
      stage,
      events: [{ at: createdAt, by: "tenant", text: "Reported by the tenant" }],
    };
    if (stage !== "new") {
      job.triage = {
        source: "ai",
        trade,
        urgency: t.urgency,
        reason: "Confirmed by the property manager.",
        safety: [],
        reply: "",
        repeat: false,
        confirmedAt: createdAt + 0.3 * H,
      };
      job.events.push({ at: createdAt + 0.3 * H, by: "manager", text: "Triage confirmed, tenant replied to" });
      job.tradieId = tradie.id;
      job.events.push(
        t.urgency === "urgent"
          ? { at: createdAt + 0.31 * H, by: "system", text: `Urgent: sent to on-call ${tradie.business}, owner notified` }
          : { at: createdAt + 0.31 * H, by: "system", text: `Quote requested from ${tradie.business}` }
      );
    }
    if (t.urgency === "routine" && ["owner", "booked", "done", "invoiced"].includes(stage)) {
      job.quote = { amount, note: "Labour and parts", at: createdAt + ageH * H * 0.2 };
      job.events.push({ at: job.quote.at, by: "tradie", text: `Quote sent: ${money(region, amount)}` });
    }
    if (t.urgency === "routine" && ["booked", "done", "invoiced"].includes(stage)) {
      const auto = amount <= R.approvalLimit;
      job.ownerDecision = { decision: auto ? "auto" : "approved", at: createdAt + ageH * H * 0.35 };
      job.events.push({ at: job.ownerDecision.at, by: auto ? "system" : "owner", text: auto ? "Auto-approved under the owner's limit" : "Approved by the owner" });
    }
    if (["booked", "done", "invoiced"].includes(stage)) {
      job.bookedFor = stage === "booked" ? now + (2 + r() * 40) * H : createdAt + ageH * H * 0.6;
      job.events.push({ at: createdAt + ageH * H * 0.45, by: "tradie", text: "Accepted and booked a time" });
    }
    if (["done", "invoiced"].includes(stage)) {
      job.completedAt = createdAt + ageH * H * 0.7;
      job.events.push({ at: job.completedAt, by: "tradie", text: "Marked complete with photos" });
    }
    if (stage === "invoiced") {
      job.invoice = { amount, at: createdAt + ageH * H * 0.85 };
      job.events.push({ at: job.invoice.at, by: "tradie", text: "Invoice uploaded" });
    }
    return job;
  });

  // The demo's "repeat fault" story: the property the tenant demo reports from
  // (DEMO_PROPERTY) already had a plumbing job 45 days ago.
  const prior = jobs.filter((j) => j.stage === "invoiced").pop();
  if (prior) {
    const at = now - 45 * D;
    prior.propertyId = DEMO_PROPERTY;
    prior.trade = "plumber";
    prior.urgency = "routine";
    prior.title = region === "UK" ? "Leaking pipe under the bath" : "Leaking pipe under the bathroom vanity";
    prior.description = "Slow leak from the pipe joint under the bathroom basin.";
    prior.createdAt = at;
    prior.tradieId = tradies.find((x) => x.trade === "plumber")!.id;
    prior.events = [
      { at, by: "tenant", text: "Reported by the tenant" },
      { at: at + 2 * H, by: "manager", text: "Triage confirmed, tenant replied to" },
      { at: at + 30 * H, by: "tradie", text: "Marked complete with photos" },
      { at: at + 50 * H, by: "tradie", text: "Invoice uploaded" },
    ];
    prior.completedAt = at + 30 * H;
    if (prior.invoice) prior.invoice.at = at + 50 * H;
  }

  const compliance: ComplianceItem[] = [];
  properties.forEach((p) => {
    R.compliance.forEach((item, k) => {
      const period = k === 0 ? 365 : k === 1 ? 730 : 365;
      const daysSince = Math.floor(r() * (period + 40));
      const lastDoneAt = now - daysSince * D;
      compliance.push({ id: `c${p.id}-${k}`, propertyId: p.id, item, lastDoneAt, dueAt: lastDoneAt + period * D });
    });
  });

  return {
    id,
    region,
    createdAt: now,
    agency: R.agency,
    managers,
    owners,
    tradies,
    properties,
    jobs,
    compliance,
  };
}
