// Run against a running server: node scripts/tapline-flow.test.mjs [baseUrl]
// Walks one routine job and one urgent job through every stage.
const BASE = process.argv[2] || "http://localhost:3200";
const sb = "flowtest" + Math.random().toString(36).slice(2, 8);
let fail = 0;
const check = (ok, msg) => {
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);
};
const post = async (path, body) => {
  const r = await fetch(BASE + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sb, ...body }) });
  return { status: r.status, d: await r.json() };
};
const job = (d, id) => d.sb.jobs.find((j) => j.id === id);

const g = await fetch(`${BASE}/api/tapline?sb=${sb}&region=AU`).then((r) => r.json());
check(g.sb.jobs.length === 40 && g.sb.properties.length === 120, "seeded 40 jobs, 120 properties");

// Routine job, quote above the owner's limit, owner approves.
let r = await post("/api/tapline", { action: { type: "report", propertyId: "p3", title: "Wardrobe door off its track", description: "Sliding door came off the bottom track." } });
const a = r.d.jobId;
check(r.status === 200 && job(r.d, a).stage === "new", "report creates a New job");
r = await post("/api/tapline/triage", { jobId: a });
check(job(r.d, a).triage?.urgency === "routine" && job(r.d, a).triage?.trade === "handyman", `triage: ${job(r.d, a).triage?.trade}/${job(r.d, a).triage?.urgency} (${job(r.d, a).triage?.source})`);
r = await post("/api/tapline", { action: { type: "confirm", jobId: a, trade: "handyman", urgency: "routine", reply: "Thanks" } });
check(job(r.d, a).stage === "quote", "confirm routine -> Quote requested");
r = await post("/api/tapline", { action: { type: "quote", jobId: a, amount: 900, note: "x", earliest: Date.now() + 86400000 } });
check(job(r.d, a).stage === "owner", "quote above limit -> Awaiting owner");
r = await post("/api/tapline", { action: { type: "owner", jobId: a, decision: "approved" } });
check(job(r.d, a).stage === "booked", "owner approves -> Booked");
r = await post("/api/tapline", { action: { type: "complete", jobId: a } });
check(job(r.d, a).stage === "done", "tradie completes -> Done");
r = await post("/api/tapline", { action: { type: "invoice", jobId: a, amount: 880 } });
check(job(r.d, a).stage === "invoiced" && job(r.d, a).invoice.amount === 880, "invoice -> Invoiced");

// Routine job under the limit is auto-approved straight to Booked.
r = await post("/api/tapline", { action: { type: "report", propertyId: "p4", title: "Toilet keeps running", description: "Cistern refills often." } });
const b = r.d.jobId;
await post("/api/tapline/triage", { jobId: b });
await post("/api/tapline", { action: { type: "confirm", jobId: b, trade: "plumber", urgency: "routine", reply: "Thanks" } });
r = await post("/api/tapline", { action: { type: "quote", jobId: b, amount: 200, note: "x", earliest: Date.now() + 86400000 } });
check(job(r.d, b).stage === "booked" && job(r.d, b).ownerDecision?.decision === "auto", "quote under limit -> auto-approved, Booked");

// Urgent job skips quote and owner.
r = await post("/api/tapline", { action: { type: "report", propertyId: "p7", title: "Water coming through the ceiling", description: "Dripping and getting worse." } });
const c = r.d.jobId;
r = await post("/api/tapline/triage", { jobId: c });
check(job(r.d, c).triage?.urgency === "urgent" && job(r.d, c).triage?.repeat === true, "ceiling leak at p7: urgent + repeat fault");
r = await post("/api/tapline", { action: { type: "confirm", jobId: c, trade: "plumber", urgency: "urgent", reply: "Thanks" } });
check(job(r.d, c).stage === "booked", "confirm urgent -> Booked straight away");

// The manager's edited reply is what the tenant receives.
r = await post("/api/tapline", { action: { type: "report", propertyId: "p5", title: "Bathroom light not working", description: "Globe changed, still off." } });
const e = r.d.jobId;
await post("/api/tapline/triage", { jobId: e });
r = await post("/api/tapline", { action: { type: "confirm", jobId: e, trade: "electrician", urgency: "routine", reply: "Edited by Sarah: an electrician will call you today." } });
check(job(r.d, e).triage?.reply === "Edited by Sarah: an electrician will call you today.", "edited reply is saved for the tenant");

// Photos: only small JPEG data URLs are kept, and a sandbox keeps the newest 6.
const tinyJpeg = "data:image/jpeg;base64," + "A".repeat(400);
r = await post("/api/tapline", { action: { type: "report", propertyId: "p6", title: "Bad photo", description: "x", photo: "javascript:alert(1)" } });
check(job(r.d, r.d.jobId).photo === undefined, "non-JPEG photo is dropped");
for (let i = 0; i < 8; i++) r = await post("/api/tapline", { action: { type: "report", propertyId: "p8", title: `Photo ${i}`, description: "x", photo: tinyJpeg } });
const withPhotos = r.d.sb.jobs.filter((j) => j.photo?.startsWith("data:")).length;
check(withPhotos === 6, `sandbox keeps the newest 6 photos (kept ${withPhotos})`);

// Guards.
r = await post("/api/tapline", { action: { type: "invoice", jobId: c, amount: 100 } });
check(r.status === 409, "cannot invoice a job that is not done");
r = await post("/api/tapline", { action: { type: "report", propertyId: "nope", title: "x", description: "y" } });
check(r.status === 409, "unknown property rejected");
const bad = await fetch(`${BASE}/api/tapline?sb=../../etc`);
check(bad.status === 400, "bad sandbox id rejected");

// Reset.
r = await post("/api/tapline", { reset: "UK" });
check(r.d.sb.region === "UK" && r.d.sb.jobs.length === 40 && r.d.sb.agency === "Northgate Lettings", "reset to UK agency");

console.log(fail ? `${fail} failing` : "all pass");
process.exit(fail ? 1 : 0);
