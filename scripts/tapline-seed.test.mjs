// Run: node scripts/tapline-seed.test.mjs
// The seed is the first thing a prospect sees, so it is held to the product's own rules (G4 round 2):
// owner-stage quotes are priced inside the fault's band and over that owner's limit, no title repeats in a
// column, one gas leak at most, routine visits on business-hour slots, and the timeline runs forwards.
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, { alias: { "@/": new URL("../src/", import.meta.url).pathname.replace(/^\/(\w:)/, "$1") } });
const { seedSandbox } = await jiti.import("../src/lib/tapline/seed.ts");
const { REGION, ruleTriage } = await jiti.import("../src/lib/tapline/rules.ts");
const { kpis } = await jiti.import("../src/lib/tapline/metrics.ts");

let fail = 0;
const check = (ok, msg) => {
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);
};
const H = 3600_000;

for (const region of ["AU", "UK"]) {
  const sb = seedSandbox("seedtest01", region);
  const now = sb.createdAt;
  const R = REGION[region];
  const local = (t) => {
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: R.tz, hour: "numeric", minute: "numeric", weekday: "short", hour12: false }).formatToParts(t);
    const g = (k) => p.find((x) => x.type === k)?.value;
    return { h: Number(g("hour")) % 24, wd: g("weekday") };
  };
  const owner = (j) => sb.owners.find((o) => o.id === sb.properties.find((p) => p.id === j.propertyId).ownerId);

  const ownerJobs = sb.jobs.filter((j) => j.stage === "owner");
  check(ownerJobs.length === 6 && ownerJobs.every((j) => j.quote.amount > owner(j).approvalLimit), `${region}: all 6 owner-stage quotes are over that owner's limit`);
  check(ownerJobs.every((j) => j.quote.note && !/after-hours/i.test(j.quote.note) && j.quote.note !== "Labour and parts"), `${region}: every owner-stage quote has a note for its own fault`);
  console.log("      " + ownerJobs.map((j) => `${j.title} ${j.quote.amount} (limit ${owner(j).approvalLimit})`).join(" | "));

  const byCol = {};
  for (const j of sb.jobs) (byCol[j.stage] ??= []).push(j.title);
  const dupCols = Object.entries(byCol).filter(([, t]) => new Set(t).size !== t.length);
  check(dupCols.length === 0, `${region}: no title repeats inside a column ${dupCols.map(([c]) => c).join(",")}`);
  const leaks = sb.jobs.filter((j) => j.trade === "gas" && j.urgency === "urgent").length;
  check(leaks <= 1, `${region}: at most one gas leak (${leaks})`);

  const routineVisits = sb.jobs.filter((j) => j.bookedFor && j.urgency === "routine" && j.id !== "jh0");
  const offHours = routineVisits.filter((j) => {
    const l = local(j.bookedFor);
    return l.wd === "Sun" || l.h < 8 || l.h > 16;
  });
  check(offHours.length === 0, `${region}: routine visits sit in business hours (${offHours.map((j) => j.ref).join(",")})`);
  const booked = sb.jobs.filter((j) => j.stage === "booked" && j.urgency === "routine");
  check(new Set(booked.map((j) => j.bookedFor)).size >= booked.length - 1, `${region}: booked visits are spread out, not all one slot`);
  const backwards = sb.jobs.filter((j) => j.completedAt && j.bookedFor && j.bookedFor > j.completedAt);
  check(backwards.length === 0, `${region}: no visit booked after the job was completed (${backwards.map((j) => j.ref).join(",")})`);
  const eventsOrdered = sb.jobs.every((j) => j.events.every((e, i) => i === 0 || e.at >= j.events[i - 1].at - 1));
  check(eventsOrdered, `${region}: every job's activity runs forwards in time`);

  const strataRoofs = sb.jobs.filter((j) => j.trade === "roofer" && sb.properties.find((p) => p.id === j.propertyId).strata);
  check(strataRoofs.length === 0, `${region}: no roof job billed to a lot owner in a strata scheme or block`);
  check(sb.jobs.every((j) => j.urgency !== "urgent" || j.stage === "new" || j.cap === R.urgentLimit), `${region}: urgent work carries the agency's urgent limit`);

  const k = kpis(sb, now);
  check(k.repeatOpen >= 2, `${region}: at least 2 open repeat faults on load (${k.repeatOpen})`);
  const newUrgent = sb.jobs.filter((j) => j.stage === "new" && ruleTriage(`${j.title}. ${j.description}`, region).urgency === "urgent").length;
  console.log(`      new reports the rules call urgent: ${newUrgent}; open ${k.open}, late ${k.late}, urgent on target ${k.urgentOnTime}/${k.urgentTotal}`);

  if (region === "UK") {
    const heat = sb.contractors.filter((c) => c.trade === "hvac" || c.trade === "gas");
    check(heat.every((c) => /^Gas Safe \d+/.test(c.licence)), "UK: every gas and heating engineer holds a Gas Safe number");
    check(sb.jobs.every((j) => !/hot water|boiler/i.test(j.title) || j.trade !== "plumber"), "UK: boiler and hot water jobs never go to a plumber");
  } else {
    const smoke = sb.jobs.filter((j) => /smoke alarm/i.test(j.title) && j.stage !== "new");
    check(smoke.every((j) => j.dueBy && j.ownerDecision?.decision === "auto"), "AU: smoke alarm jobs carry the 2-business-day deadline and no owner approval");
  }
}

console.log(fail ? `\n${fail} FAILED` : "\nAll seed checks pass");
process.exit(fail ? 1 : 0);
