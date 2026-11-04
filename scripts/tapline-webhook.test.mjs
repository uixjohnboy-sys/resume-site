// Run against a running server: node scripts/tapline-webhook.test.mjs [baseUrl]
// Every failure the Integrations tab claims to handle, through the real endpoints, including parallel retries.
const BASE = process.argv[2] || "http://localhost:3200";
const sb = "hook" + Math.random().toString(36).slice(2, 10);
let fail = 0;
const check = (ok, msg) => {
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);
};
const press = async (kind) => {
  const r = await fetch(`${BASE}/api/tapline/webhook/send`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sb, kind }) });
  return { status: r.status, d: await r.json() };
};
const publicPost = async (body, signature) => {
  const r = await fetch(`${BASE}/api/tapline/webhook`, { method: "POST", headers: { "content-type": "application/json", ...(signature ? { "x-tapline-signature": signature } : {}) }, body });
  return { status: r.status, d: await r.json() };
};

let r = await press("replay");
check(r.status === 200 && /first/.test(r.d.result.message ?? ""), "nothing to replay yet: says so");
r = await press("retry");
check(r.status === 200 && /Nothing is waiting/.test(r.d.result.message ?? ""), "nothing to retry yet: says so");

r = await press("send");
check(r.d.result.status === "delivered" && r.d.result.http === 200 && r.d.counts.applied === 1, "a signed event is applied once");
const { body, signature } = r.d.result;
check(/^t=\d{10},v1=[a-f0-9]{64}$/.test(signature), "the signature has the documented shape");
check(!JSON.stringify(r.d).includes("secret"), "the secret is not in the response");

r = await press("replay");
check(r.d.result.status === "duplicate" && r.d.counts.applied === 1 && r.d.counts.duplicates === 1, "the same event again is not applied twice");

r = await press("tamper");
check(r.d.result.status === "rejected" && r.d.result.http === 401 && r.d.counts.applied === 1, "a body changed after signing is rejected");

r = await press("stale");
check(r.d.result.status === "rejected" && /five minutes/.test(r.d.result.note), "an old signed copy is rejected");

// The public endpoint, as anyone on the internet would hit it.
const p1 = await publicPost(body, "");
check(p1.status === 401 && p1.d.status === "rejected", "public: no signature is rejected");
const p2 = await publicPost(body, "t=1700000000,v1=" + "0".repeat(64));
check(p2.status === 401, "public: a made-up signature is rejected");
const p3 = await publicPost("not json", "t=1700000000,v1=" + "0".repeat(64));
check(p3.status === 401, "public: a bad body is rejected without an error");
const p4 = await publicPost(JSON.stringify({ id: "evt_aaaaaaaaaaaa", sb: "nosuchdemo123", type: "x", data: {} }), "t=1700000000,v1=" + "0".repeat(64));
check(p4.status === 401, "public: an unknown demo is rejected and stores nothing");
const big = await publicPost("x".repeat(9000), "");
check(big.status === 413, "public: an oversized body is refused");
const p5 = await publicPost(body, signature);
check(p5.status === 200 && p5.d.status === "duplicate", "public: a genuine signed retry is accepted as a duplicate");

// Outage and recovery.
r = await press("outage");
check(r.d.result.status === "failed" && r.d.result.http === 503 && r.d.counts.waiting === 1, "with the receiver down the event fails and waits");
const applied = r.d.counts.applied;
r = await press("retry");
check(r.d.result.status === "delivered" && r.d.counts.waiting === 0 && r.d.counts.applied === applied + 1, "the retry applies the waiting event once");
r = await press("retry");
check(/Nothing is waiting/.test(r.d.result.message ?? ""), "a second retry finds nothing");

// Parallel retries: exactly one wins.
r = await press("send");
const before = r.d.counts.applied;
const parallel = await Promise.all(Array.from({ length: 8 }, () => publicPost(r.d.result.body, r.d.result.signature)));
check(parallel.every((x) => x.status === 200 && x.d.status === "duplicate"), "parallel genuine retries are all duplicates");
const after = await fetch(`${BASE}/api/tapline/webhook/send?sb=${sb}`).then((x) => x.json());
check(after.counts.applied === before, "parallel retries applied nothing extra");
check(after.log.length > 0 && after.log.length <= 30, "the log keeps the last 30");

const bad = await fetch(`${BASE}/api/tapline/webhook/send`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sb, kind: "drop-tables" }) });
check(bad.status === 400, "an unknown button is refused");
const badId = await fetch(`${BASE}/api/tapline/webhook/send?sb=../x`);
check(badId.status === 400, "a bad demo id is refused");

console.log(fail ? `${fail} FAILED` : "all pass");
process.exit(fail ? 1 : 0);
