// Run against a running server: node scripts/tapline-flow.test.mjs [baseUrl]
// Walks jobs through every stage of v0.3, then checks the G4 review's
// blockers and majors: concurrent writes, double triage, bad input, decimals,
// unchanged polls, compliance roll-forward, after-hours dispatch.
const BASE = process.argv[2] || "http://localhost:3200";
const sb = "flow" + Math.random().toString(36).slice(2, 10);
let fail = 0;
const check = (ok, msg) => {
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);
};
const post = async (path, body) => {
  const r = await fetch(BASE + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sb, region: "AU", ...body }) });
  let d = {};
  try {
    d = await r.json();
  } catch {}
  return { status: r.status, d };
};
const act = (action) => post("/api/tapline", { action });
const job = (d, id) => d.sb?.jobs.find((j) => j.id === id);
const H = 3600_000;

// Seed (not saved until the first change).
let g = await fetch(`${BASE}/api/tapline?sb=${sb}&region=AU`).then((r) => r.json());
check(g.sb.jobs.length === 38 && g.sb.properties.length === 120 && g.v === 0, "seed: 38 jobs, 120 properties, not saved yet (v0)");
const ownerJobs = g.sb.jobs.filter((j) => j.stage === "owner");
const limitOf = (j) => g.sb.owners.find((o) => o.id === g.sb.properties.find((p) => p.id === j.propertyId).ownerId).approvalLimit;
check(ownerJobs.length > 0 && ownerJobs.every((j) => j.quote.amount > limitOf(j)), "seed: every owner-stage quote is over the owner's limit");
check(new Set(g.sb.jobs.map((j) => j.title)).size >= 20, `seed: varied faults (${new Set(g.sb.jobs.map((j) => j.title)).size} distinct titles)`);

// Routine: report, triage, work order, quote over cap, owner approves, complete, invoice, bill.
let r = await act({ type: "report", propertyId: "p3", title: "Wardrobe door off its track", description: "Sliding door came off.\nSecond line kept.", access: { mode: "times", note: "Weekday mornings", pets: true } });
const a = r.d.jobId;
check(r.status === 200 && job(r.d, a).stage === "new" && job(r.d, a).description.includes("\n") && job(r.d, a).access.pets, "report: New, newline kept, access saved");
r = await post("/api/tapline/triage", { jobId: a });
const tA = job(r.d, a).triage;
check(tA && tA.urgency === "routine" && tA.reply.endsWith("Harbourline Property"), `triage: ${tA?.trade}/${tA?.urgency} (${tA?.source}), reply signed by the agency on its own line`);
r = await act({ type: "confirm", jobId: a, trade: "handyman", urgency: "routine", reply: "Edited by Sarah: thanks, a handyman will be in touch.", safety: ["ignored for routine"], chargeTo: "owner", strataReferral: false, insuranceClaim: false });
const jA = job(r.d, a);
check(jA.stage === "sent" && jA.cap === limitOf(jA) && jA.triage.reply.startsWith("Edited by Sarah") && jA.triage.safety.length === 0, "confirm routine: work order capped at the owner's limit, edited reply kept, no safety steps on routine");
r = await act({ type: "quote", jobId: a, amount: jA.cap + 150.5, note: "Replace the track", earliest: Date.now() + 3000 });
check(job(r.d, a).stage === "owner" && job(r.d, a).quote.amount === jA.cap + 150.5, "quote over the cap -> waiting on owner, decimals kept");
await new Promise((res) => setTimeout(res, 3500));
r = await act({ type: "owner", jobId: a, decision: "approved" });
check(job(r.d, a).stage === "booked" && job(r.d, a).bookedFor > Date.now(), "owner approves late -> booked in the future, never the past");
r = await act({ type: "complete", jobId: a });
check(job(r.d, a).stage === "done", "complete -> Completed");
r = await act({ type: "invoice", jobId: a, amount: 99.95 });
check(job(r.d, a).stage === "billed" && job(r.d, a).invoice.amount === 99.95, "invoice 99.95 kept exactly -> Bill entered");

// Routine within the cap: accept and book directly.
r = await act({ type: "report", propertyId: "p4", title: "Toilet keeps running", description: "Cistern refills often." });
const b = r.d.jobId;
await post("/api/tapline/triage", { jobId: b });
r = await act({ type: "confirm", jobId: b, trade: "plumber", urgency: "routine", reply: "Thanks", safety: [], chargeTo: "owner", strataReferral: false, insuranceClaim: false });
r = await act({ type: "accept", jobId: b, slot: Date.now() + 26 * H });
check(job(r.d, b).stage === "booked" && job(r.d, b).ownerDecision.decision === "auto", "work order accepted -> booked, within the owner's limit");
r = await act({ type: "complete", jobId: b });
r = await act({ type: "invoice", jobId: b, amount: job(r.d, b).cap * 2 });
check(job(r.d, b).stage === "done" && job(r.d, b).invoice.overApproved, "invoice far over the approved amount is held for a manager");
r = await act({ type: "approveInvoice", jobId: b });
check(job(r.d, b).stage === "billed", "manager approves the invoice -> Bill entered");

// Urgent after hours: the fixed safety text and the on-call page go out before anyone confirms.
r = await act({ type: "report", propertyId: "p7", title: "Water coming through the ceiling", description: "Dripping and getting worse.", afterHours: true });
const c = r.d.jobId;
r = await post("/api/tapline/triage", { jobId: c });
const jC = job(r.d, c);
check(jC.triage.urgency === "urgent" && jC.triage.repeatOf?.trade === "plumber", `ceiling leak at p7: urgent, repeat of ${jC.triage.repeatOf?.ref}`);
check(jC.triage.emergency.length > 0 && jC.stage === "sent" && jC.contractorId, "after hours: emergency text set, on-call contractor paged before confirmation");
r = await act({ type: "confirm", jobId: c, trade: "plumber", urgency: "urgent", reply: "Hi Chloe, we're on it.", safety: ["Move furniture away from the water.", ""], chargeTo: "owner", strataReferral: false, insuranceClaim: true });
check(job(r.d, c).triage.confirmedAt && job(r.d, c).triage.safety.length === 1 && job(r.d, c).triage.insuranceClaim, "morning confirm: edited safety saved, insurance flag set");
r = await act({ type: "accept", jobId: c, slot: Date.now() + 31 * 60_000 });
check(job(r.d, c).stage === "booked", "on-call contractor accepts -> booked within the hour");

// Owner declines -> hold -> second quote.
r = await act({ type: "report", propertyId: "p9", title: "Kitchen tap dripping", description: "Constant drip." });
const d0 = r.d.jobId;
await post("/api/tapline/triage", { jobId: d0 });
r = await act({ type: "confirm", jobId: d0, trade: "plumber", urgency: "routine", reply: "Thanks", safety: [], chargeTo: "owner", strataReferral: false, insuranceClaim: false });
r = await act({ type: "quote", jobId: d0, amount: 5000, note: "x", earliest: Date.now() + 26 * H });
r = await act({ type: "owner", jobId: d0, decision: "declined", note: "Too much" });
check(job(r.d, d0).stage === "new" && job(r.d, d0).hold === "ownerDeclined" && job(r.d, d0).triage, "owner declines -> held for a call, not sent back to triage");
r = await act({ type: "requote", jobId: d0 });
check(job(r.d, d0).stage === "sent" && !job(r.d, d0).quote, "second quote requested -> with contractor again");

// Bad input is refused with a message, never saved, never a 500.
r = await act({ type: "confirm", jobId: d0, trade: "plumber", urgency: "maybe", reply: "x", safety: [], chargeTo: "owner" });
check(r.status === 409 && r.d.error, "urgency 'maybe' refused");
r = await post("/api/tapline", { action: { type: "triage", jobId: a, triage: { source: "ai" } } });
check(r.status === 400, "public API refuses the server-only triage action");
r = await post("/api/tapline", { action: { type: "nope" } });
check(r.status === 400 && r.d.error, "unknown action -> 400 with a message");
r = await post("/api/tapline", { action: [] });
check(r.status === 400, "array action -> 400");
r = await act({ type: "quote", jobId: d0, amount: true, note: "x", earliest: 0 });
check(r.status === 409, "boolean amount refused");
r = await act({ type: "report", propertyId: "p3", title: "Photo test", description: "x", photo: "data:image/png;base64,AAAA" });
check(r.status === 400, "non-JPEG photo refused");
r = await act({ type: "report", propertyId: "p3", title: "‮evil‬ title 😀".repeat(1) + "x".repeat(200), description: "" });
check(r.status === 200 && !/[‪-‮]/.test(job(r.d, r.d.jobId).title) && Array.from(job(r.d, r.d.jobId).title).length <= 80, "bidi controls stripped, title cut by characters");

// Concurrency: five reports at once all survive.
const before = (await fetch(`${BASE}/api/tapline?sb=${sb}`).then((x) => x.json())).sb.jobs.length;
const five = await Promise.all([1, 2, 3, 4, 5].map((i) => act({ type: "report", propertyId: "p10", title: `Parallel ${i}`, description: "x" })));
const after = (await fetch(`${BASE}/api/tapline?sb=${sb}`).then((x) => x.json())).sb.jobs.length;
check(five.every((x) => x.status === 200) && after === before + 5, `five parallel reports: ${after - before} of 5 saved`);

// Double triage at the same time: one AI call, one triage event.
r = await act({ type: "report", propertyId: "p11", title: "Bathroom light not working", description: "Globe changed." });
const e = r.d.jobId;
await Promise.all([post("/api/tapline/triage", { jobId: e }), post("/api/tapline/triage", { jobId: e })]);
g = await fetch(`${BASE}/api/tapline?sb=${sb}`).then((x) => x.json());
const evs = job(g, e).events.filter((x) => /suggested:/.test(x.text)).length;
check(evs === 1, `double triage: ${evs} triage event`);

// Unchanged polls are tiny.
const pollR = await fetch(`${BASE}/api/tapline?sb=${sb}&v=${g.v}`).then((x) => x.json());
check(pollR.unchanged === true, "poll with the current version -> unchanged");

// Compliance job completes and rolls the due date forward.
const item = g.sb.compliance.find((x) => x.dueAt < Date.now()) ?? g.sb.compliance[0];
r = await act({ type: "complianceJob", complianceId: item.id });
const cj = r.d.jobId;
r = await act({ type: "accept", jobId: cj, slot: Date.now() + 26 * H });
r = await act({ type: "complete", jobId: cj });
r = await act({ type: "invoice", jobId: cj, amount: 120 });
const rolled = r.d.sb.compliance.find((x) => x.id === item.id);
check(job(r.d, cj).stage === "billed" && rolled.dueAt > Date.now() + 300 * 24 * H, "compliance job billed -> next due date rolled forward");

// Reset to the UK agency.
r = await post("/api/tapline", { reset: "UK" });
check(r.d.sb.region === "UK" && r.d.sb.agency === "Northgate Lettings" && r.d.sb.jobs.length === 38, "reset to the UK agency");
const ukAddr = r.d.sb.properties.filter((p) => p.address.startsWith("Flat ")).length;
check(ukAddr > 20 && !r.d.sb.properties.some((p) => /^\d+\/\d+ /.test(p.address)), `UK addresses use "Flat n, ..." (${ukAddr}), never AU slashes`);

console.log(fail ? `${fail} failing` : "all pass");
process.exit(fail ? 1 : 0);
