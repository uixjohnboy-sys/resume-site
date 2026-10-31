// Run: node scripts/tapline-seed.test.mjs
// The seed is the first thing a prospect sees, so it is held to the product's own rules (G4 round 2):
// owner-stage quotes are priced inside the fault's band and over that owner's limit, no title repeats in a
// column, one gas leak at most, routine visits on business-hour slots, and the timeline runs forwards.
// Round 3: every time on the agency's clock (managers in office hours, contractors in trade hours, night-time
// urgent reports through the after-hours path), urgent visits within hours, common-property work never billed to
// a lot owner, and the board not drowning in red on a weekend. Run it at several clock times: SEED_NOW=<ms>.
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, { alias: { "@/": new URL("../src/", import.meta.url).pathname.replace(/^\/(\w:)/, "$1") } });
const { seedSandbox } = await jiti.import("../src/lib/tapline/seed.ts");
const { REGION, ruleTriage, isAfterHours } = await jiti.import("../src/lib/tapline/rules.ts");
const { kpis, stageClock } = await jiti.import("../src/lib/tapline/metrics.ts");
const NOW = process.env.SEED_NOW ? Number(process.env.SEED_NOW) : Date.now();

let fail = 0;
const check = (ok, msg) => {
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);
};
const H = 3600_000;

for (const region of ["AU", "UK"]) {
  const sb = seedSandbox("seedtest01", region, NOW);
  const now = sb.createdAt;
  const R = REGION[region];
  const local = (t) => {
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: R.tz, hour: "numeric", minute: "numeric", weekday: "short", hour12: false }).formatToParts(t);
    const g = (k) => p.find((x) => x.type === k)?.value;
    return { h: Number(g("hour")) % 24, m: Number(g("minute")), wd: g("weekday") };
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

  // Clock: managers in office hours (Mon to Fri 8:30 to 5:30 pm, allowing the 75-minute confirm window), routine
  // contractor replies in trade hours (Mon to Sat 7 am to 6 pm).
  const mins = (t) => { const l = local(t); return l.h * 60 + l.m; };
  const managerOff = sb.jobs.flatMap((j) => j.events.filter((e) => e.by === "manager").map((e) => [j, e])).filter(([, e]) => {
    const l = local(e.at);
    return ["Sat", "Sun"].includes(l.wd) || mins(e.at) < 510 || mins(e.at) > 1020 + 80;
  });
  check(managerOff.length === 0, `${region}: managers act in office hours (${managerOff.slice(0, 3).map(([j, e]) => j.ref + " " + new Date(e.at).toISOString()).join(", ")})`);
  const tradeOff = sb.jobs.filter((j) => j.urgency === "routine").flatMap((j) => j.events.filter((e) => e.by === "contractor").map((e) => [j, e])).filter(([, e]) => {
    const l = local(e.at);
    return l.wd === "Sun" || mins(e.at) < 420 || mins(e.at) > 1080 + 120;
  });
  check(tradeOff.length === 0, `${region}: routine contractor replies in trade hours (${tradeOff.slice(0, 3).map(([j]) => j.ref).join(", ")})`);
  const ahWrong = sb.jobs.filter((j) => !!j.afterHours !== isAfterHours(region, j.createdAt));
  check(ahWrong.length === 0, `${region}: the after-hours flag matches the report time`);
  const ahUrgent = sb.jobs.filter((j) => j.afterHours && j.urgency === "urgent" && j.stage !== "new");
  check(ahUrgent.every((j) => j.events.some((e) => /^After hours: on-call/.test(e.text))), `${region}: night-time urgent reports go through the on-call page (${ahUrgent.length})`);
  const urgentLate = sb.jobs.filter((j) => j.urgency === "urgent" && j.bookedFor && j.stage !== "new").filter((j) => {
    const acc = j.events.find((e) => /accepted and booked/.test(e.text));
    return !acc || j.bookedFor - acc.at > 4 * H || j.bookedFor < j.createdAt;
  });
  check(urgentLate.length === 0, `${region}: urgent visits within 4 hours of the contractor accepting (${urgentLate.map((j) => j.ref).join(",")})`);
  const quarter = sb.jobs.filter((j) => j.bookedFor && (j.bookedFor / 60000) % 15 !== 0);
  check(quarter.length === 0, `${region}: visits on the quarter hour (${quarter.map((j) => j.ref).join(",")})`);
  const early = sb.jobs.filter((j) => j.events.some((e) => e.at < j.createdAt) || (j.invoice && j.completedAt && j.invoice.at < j.completedAt) || (j.bookedFor && j.bookedFor < j.createdAt));
  check(early.length === 0, `${region}: nothing happens before the report, no invoice before the work (${early.map((j) => j.ref).join(",")})`);
  const noReply = sb.jobs.filter((j) => j.triage?.confirmedAt && !j.triage.reply);
  check(noReply.length === 0, `${region}: every confirmed job has the reply that was sent`);
  const common = sb.jobs.filter((j) => j.stage === "owner" && /shower|damp patch|fence|deck|roof|gutter/i.test(j.title) && sb.properties.find((p) => p.id === j.propertyId).strata);
  check(common.length === 0, `${region}: no common-property work waits on a lot owner (${common.map((j) => j.ref).join(",")})`);

  // Round 4: what the seed says must match what the product does.
  const smokeLate = sb.jobs.filter((j) => j.dueBy && j.bookedFor && j.bookedFor > j.dueBy);
  check(smokeLate.length === 0, `${region}: no smoke alarm visit after its legal due date (${smokeLate.map((j) => j.ref).join(",")})`);
  const urgentNewLate = sb.jobs.filter((j) => j.stage === "new" && !j.triage && ruleTriage(`${j.title}. ${j.description}`, region).urgency === "urgent" && stageClock(j, now, region).state === "late");
  check(urgentNewLate.length === 0, `${region}: no urgent report sits untriaged past its target (${urgentNewLate.map((j) => j.ref).join(",")})`);
  const noSafety = sb.jobs.filter((j) => j.urgency === "urgent" && j.triage && ruleTriage(`${j.title}. ${j.description}`, region).hazards.length && !j.triage.emergency.length);
  check(noSafety.length === 0, `${region}: seeded emergencies carry the fixed safety text (${noSafety.map((j) => j.ref).join(",")})`);
  const staleReply = sb.jobs.filter((j) => {
    const r = j.triage?.reply ?? "";
    const accept = j.events.find((e) => /accepted and booked/.test(e.text))?.at;
    const at = j.triage?.confirmedAt ?? now;
    return accept !== undefined && at >= accept && /arranging|contacted our on-call|will confirm a time/.test(r);
  });
  check(staleReply.length === 0, `${region}: no reply says "arranging" once the visit is booked (${staleReply.map((j) => j.ref).join(",")})`);
  const sevenOClock = sb.jobs.flatMap((j) => j.events.filter((e) => e.by === "contractor")).filter((e) => local(e.at).h === 7 && local(e.at).m === 0).length;
  check(sevenOClock <= 2, `${region}: contractor replies are not all on the stroke of 7 (${sevenOClock})`);

  // Grammar in everything a person reads: never "a electrician".
  const texts = sb.jobs.flatMap((j) => [j.triage?.reply ?? "", j.triage?.reason ?? "", ...j.events.map((e) => e.text)]);
  const aVowel = texts.filter((x) => /\ba [aeiouAEIOU]/.test(x));
  check(aVowel.length === 0, `${region}: no "a" before a vowel (${aVowel.slice(0, 2).join(" | ")})`);
  check(sb.jobs.every((j) => !j.triage || j.triage.reason), `${region}: every triaged job says why`);

  const k = kpis(sb, now);
  check(k.late <= 6, `${region}: the board is not a wall of red (${k.late} of ${k.open} open jobs late)`);
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
