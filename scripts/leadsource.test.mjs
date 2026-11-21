// Run: node --experimental-strip-types scripts/leadsource.test.mjs
// Lead-source tracker demo: the source normaliser (SPEC 5.3), the report grouping (DESIGN 5.2), first and last touch,
// the existing-contact guard, the public projection (SPEC 6.3 and 8), the shared cache and the rate limit. No network:
// the live GoHighLevel provider is only ever built with a fake fetch here, and never with real env vars.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { applyTouch, isExcluded, normaliseRef, normaliseTouch, reportRow, touchFromUrl } from "../src/lib/leadsource/normalise.ts";
import { brisbaneStamp, brisbaneTime, publicCampaign, publicRef, publicSource, publicStage, roundQuarter } from "../src/lib/leadsource/public.ts";
import { buildReport } from "../src/lib/leadsource/report.ts";
import { FIXTURE_FIELDS, FIXTURE_OPPORTUNITIES, FIXTURE_PIPELINES, fillerBookings, fixtureProvider, simulatedBooking } from "../src/lib/leadsource/fixture.ts";
import { ghlProvider, mapOpportunity, parseFieldIds, pickPipeline } from "../src/lib/leadsource/ghl.ts";
import { adHref, adQuery, adSends } from "../src/lib/leadsource/links.ts";
import { liveConfigured, pageConfig, selectProvider } from "../src/lib/leadsource/provider.ts";
import { allowRequest, getBookings, rateMax, resetMemory } from "../src/lib/leadsource/store.ts";
import { CACHE_SECONDS, RATE_MAX } from "../src/lib/leadsource/config.ts";

let passed = 0;
const test = async (name, fn) => {
  try {
    await fn();
    passed++;
  } catch (e) {
    console.error("FAIL", name, "\n ", e.message);
    process.exitCode = 1;
  }
};

/** Link query string (and referrer) to [source, medium, report row]. */
const route = (q, referrer = "") => {
  const t = normaliseTouch(touchFromUrl(`?${q}`, referrer));
  return [t.source, t.medium, reportRow(t.source, t.medium)];
};

// ---------- 1. Source normaliser: Facebook vs Instagram vs Google, paid vs free ----------

await test("the three demo ad links land on their ads rows", () => {
  assert.deepEqual(route(adQuery("fb", "ref-K7Q2", "demoA1")), ["Facebook", "paid_social", "Facebook ads"]);
  assert.deepEqual(route(adQuery("ig", "ref-K7Q2", "demoA1")), ["Instagram", "paid_social", "Instagram ads"]);
  assert.deepEqual(route(adQuery("google", "ref-K7Q2", "demoA1")), ["Google", "cpc", "Google Ads"]);
});

await test("Spike 0 values: fb_ad source, and Google tagged by hand", () => {
  assert.deepEqual(route("utm_source=fb_ad&utm_medium=paid_social&utm_campaign=spike1&utm_content=ref-SPK1&fbclid=TESTspike1"), ["Facebook", "paid_social", "Facebook ads"]);
  assert.deepEqual(route("utm_source=google&utm_medium=cpc&utm_campaign=spike2&gclid=TESTspike2"), ["Google", "cpc", "Google Ads"]);
  assert.deepEqual(route("utm_source=adwords&utm_medium=cpc"), ["Google", "cpc", "Google Ads"]);
});

await test("source names are case-insensitive and trimmed", () => {
  assert.deepEqual(route("utm_source=FB&utm_medium=Paid_Social"), ["Facebook", "paid_social", "Facebook ads"]);
  assert.deepEqual(route("utm_source=%20Instagram%20&utm_medium=CPC"), ["Instagram", "paid_social", "Instagram ads"]);
  assert.deepEqual(route("utm_source=ig_ad&utm_medium=paid_social"), ["Instagram", "paid_social", "Instagram ads"]);
});

await test("every Google click ID is Google Ads, whatever the medium says", () => {
  for (const id of ["gclid", "wbraid", "gbraid"]) assert.deepEqual(route(`${id}=demoX`), ["Google", "cpc", "Google Ads"], id);
  assert.deepEqual(route("gclid=demoX&utm_medium=organic&utm_source=fb"), ["Google", "cpc", "Google Ads"]);
});

await test("fbclid: Instagram when the source says Instagram, else Facebook; the medium decides paid or free", () => {
  assert.deepEqual(route("utm_source=ig&utm_medium=paid_social&fbclid=demoX"), ["Instagram", "paid_social", "Instagram ads"]);
  assert.deepEqual(route("utm_source=google&fbclid=demoX&utm_medium=paid_social"), ["Facebook", "paid_social", "Facebook ads"]);
  // A free Facebook post: Facebook adds fbclid too, with no tags. Free, never ads.
  assert.deepEqual(route("fbclid=demoX"), ["Facebook", "none", "Facebook, free"]);
  assert.deepEqual(route("fbclid=demoX", "https://l.facebook.com/"), ["Facebook", "referral", "Facebook, free"]);
  assert.deepEqual(route("fbclid=demoX", "https://l.instagram.com/"), ["Instagram", "referral", "Instagram, free"]);
});

await test("alternate paid medium names go to the ads rows (paid, ppc, cpm, paidsocial, paid-social)", () => {
  for (const m of ["paid", "ppc", "cpm", "paidsocial", "paid-social", "cpc", "paid_social"]) {
    assert.deepEqual(route(`utm_source=fb&utm_medium=${m}`), ["Facebook", "paid_social", "Facebook ads"], `fb ${m}`);
    assert.deepEqual(route(`utm_source=ig&utm_medium=${m}`), ["Instagram", "paid_social", "Instagram ads"], `ig ${m}`);
    assert.deepEqual(route(`utm_source=google&utm_medium=${m}`), ["Google", "cpc", "Google Ads"], `google ${m}`);
  }
});

await test("social on its own is free social; organic, referral and none are free", () => {
  assert.deepEqual(route("utm_source=fb&utm_medium=social"), ["Facebook", "organic", "Facebook, free"]);
  assert.deepEqual(route("utm_source=ig&utm_medium=social"), ["Instagram", "organic", "Instagram, free"]);
  assert.deepEqual(route("utm_source=google&utm_medium=organic"), ["Google", "organic", "Google, free"]);
  assert.deepEqual(route("utm_source=fb&utm_medium=referral"), ["Facebook", "referral", "Facebook, free"]);
  assert.deepEqual(route("utm_source=fb&utm_medium=(none)"), ["Facebook", "none", "Facebook, free"]);
  assert.deepEqual(route("utm_source=fb"), ["Facebook", "none", "Facebook, free"]);
});

await test("an unknown medium lands in Other, never in a free row", () => {
  for (const m of ["email", "banner", "display", "xyz", "paid social ads", "<script>"]) {
    for (const s of ["fb", "ig", "google"]) {
      const [, medium, row] = route(`utm_source=${s}&utm_medium=${encodeURIComponent(m)}`);
      assert.equal(medium, "Other", `${s} ${m}`);
      assert.equal(row, "Other", `${s} ${m}`);
      assert.ok(!row.includes("free"), `${s} ${m}`);
    }
  }
});

await test("an unknown source is Other; TikTok by source or click ID", () => {
  assert.deepEqual(route("utm_source=newsletter&utm_medium=email"), ["Other", "Other", "Other"]);
  assert.deepEqual(route("utm_source=newsletter&utm_medium=paid"), ["Other", "cpc", "Other"]);
  assert.deepEqual(route("ttclid=demoX"), ["TikTok", "paid_social", "TikTok"]);
  assert.deepEqual(route("utm_source=tiktok&utm_medium=paid"), ["TikTok", "paid_social", "TikTok"]);
});

await test("referrer only: Facebook, Instagram and Google hosts by name; any other site is Referral", () => {
  assert.deepEqual(route("", "https://www.google.com.au/"), ["Google", "organic", "Google, free"]);
  assert.deepEqual(route("", "https://www.google.com/"), ["Google", "organic", "Google, free"]);
  for (const h of ["facebook.com", "www.facebook.com", "m.facebook.com", "l.facebook.com", "lm.facebook.com"]) {
    assert.deepEqual(route("", `https://${h}/`), ["Facebook", "referral", "Facebook, free"], h);
  }
  assert.deepEqual(route("", "https://l.instagram.com/?u=x"), ["Instagram", "referral", "Instagram, free"]);
  assert.deepEqual(route("", "https://googleads.example.com/"), ["Referral", "referral", "Referral"]);
  assert.deepEqual(route("", "not a url"), ["Unknown", "none", "Unknown"]);
});

// ---------- 2. The "No tracking tags" link ----------

await test("no tracking tags: the plain link carries nothing and no code", () => {
  assert.equal(adQuery("plain", "ref-K7Q2", "demoX"), "");
  assert.equal(adHref("https://book.example.invalid/x", "plain", "ref-K7Q2", "demoX"), "https://book.example.invalid/x");
  assert.equal(adSends("plain", "ref-K7Q2"), "");
});

await test("no tracking tags, pasted: Unknown, none, counted in the Unknown row with no code", () => {
  const t = normaliseTouch(touchFromUrl("https://book.example.invalid/x"));
  assert.deepEqual([t.source, t.medium, t.ref, t.campaign, t.clickId], ["Unknown", "none", "", "", ""]);
  assert.equal(reportRow(t.source, t.medium), "Unknown");
});

await test("no tracking tags, clicked on this site: Referral (the browser sends the referrer)", () => {
  const t = normaliseTouch(touchFromUrl("https://book.example.invalid/x", "https://www.johnboydesign.com/demo/lead-source"));
  assert.deepEqual([t.source, t.medium, t.ref], ["Referral", "referral", ""]);
  assert.equal(reportRow(t.source, t.medium), "Referral");
  assert.equal(t.raw, "johnboydesign.com");
});

await test("test code: one code whatever the case, anything else blank", () => {
  assert.equal(normaliseRef("ref-k7q2"), "ref-K7Q2");
  assert.equal(normaliseRef("ref-K7Q22"), "");
  assert.equal(normaliseRef("Kestrel ad 3"), "");
  assert.equal(publicRef("ref-K7Q2"), "ref-K7Q2");
  assert.equal(publicRef("<script>alert(1)</script>"), "");
  assert.equal(publicRef("ref-" + "A".repeat(5000)), "");
});

// ---------- 3. First touch and last touch ----------

const fb = normaliseTouch(touchFromUrl(`?${adQuery("fb", "ref-K7Q2", "demoFB1")}`));
const gg = normaliseTouch(touchFromUrl(`?${adQuery("google", "ref-T4M8", "demoG1")}`));

await test("a new contact gets first touch and last touch from its booking", () => {
  const c = applyTouch({}, fb, "2026-11-17");
  assert.deepEqual(
    [c.leadSource, c.leadMedium, c.leadCampaign, c.firstTouchDate, c.lastSource, c.lastMedium, c.lastCampaign, c.lastTouchDate],
    ["Facebook", "paid_social", "kp-initial-consult", "2026-11-17", "Facebook", "paid_social", "kp-initial-consult", "2026-11-17"],
  );
  assert.equal(c.clickId, "demoFB1");
  assert.equal(c.rawSource, "fb");
});

await test("a returning contact keeps its first touch and gets a new last touch (DESIGN 6 example)", () => {
  const c = applyTouch(applyTouch({}, fb, "2026-11-17"), gg, "2026-11-19");
  assert.deepEqual([c.leadSource, c.leadMedium, c.leadCampaign, c.firstTouchDate], ["Facebook", "paid_social", "kp-initial-consult", "2026-11-17"]);
  assert.deepEqual([c.lastSource, c.lastMedium, c.lastCampaign, c.lastTouchDate], ["Google", "cpc", "", "2026-11-19"]);
  assert.equal(publicCampaign(c.lastCampaign), "Not set");
  assert.equal(c.clickId, "demoG1");
});

await test("a later untagged booking: last touch Unknown, first touch and click ID kept", () => {
  const plain = normaliseTouch(touchFromUrl("https://book.example.invalid/x"));
  const c = applyTouch(applyTouch({}, fb, "2026-11-17"), plain, "2026-11-20");
  assert.equal(c.leadSource, "Facebook");
  assert.equal(c.lastSource, "Unknown");
  assert.equal(c.lastMedium, "none");
  assert.equal(c.clickId, "demoFB1");
});

await test("a contact whose Lead source is empty still gets its first touch written", () => {
  const c = applyTouch({ leadSource: "", lastSource: "Google" }, fb, "2026-11-18");
  assert.equal(c.leadSource, "Facebook");
  assert.equal(c.firstTouchDate, "2026-11-18");
});

// ---------- 4. Existing-contact guard ----------

await test("existing-contact guard", () => {
  const at = Date.parse("2026-11-20T01:00:00Z");
  assert.equal(isExcluded({ dateAdded: at - 5000, tags: [] }, at), false, "created by this booking");
  assert.equal(isExcluded({ dateAdded: at - 5000, tags: ["demo-kestrel"] }, at), false, "new, tagged by the booking");
  assert.equal(isExcluded({ dateAdded: at - 86400e3 * 30, tags: ["coach-os-client"] }, at), true, "a Coach OS contact");
  assert.equal(isExcluded({ dateAdded: at - 5000, tags: ["demo-kestrel", "vip"] }, at), true, "any non-demo tag");
  assert.equal(isExcluded({ dateAdded: at - 86400e3 * 3, tags: [] }, at), true, "added before, never a demo contact");
  assert.equal(isExcluded({ dateAdded: at - 86400e3 * 3, tags: ["demo-kestrel"] }, at), false, "a returning demo contact");
});

// ---------- 5. Projection, allowlists and the report ----------

const pipe = pickPipeline(FIXTURE_PIPELINES);
const opp = (fields, extra = {}) => ({
  pipelineStageId: pipe.stages.keys().next().value,
  createdAt: "2026-11-20T13:37:00Z",
  contact: { name: "Test Zed", email: "zed.test@example.invalid", phone: "+61400111222", tags: ["demo-kestrel"] },
  customFields: Object.entries(fields).map(([k, v]) => ({ id: FIXTURE_FIELDS[k], fieldValueString: v })),
  ...extra,
});
const NOW = Date.parse("2026-11-21T02:00:00Z");

await test("fixture report matches the design's seed (six John Boy rows; the guarded contact left out)", async () => {
  const r = buildReport(await fixtureProvider.list(NOW), { now: NOW, updatedAt: NOW, stale: false, mode: "fixture" });
  const rows = Object.fromEntries(r.rows.map((x) => [x.name, [x.booked, x.upcoming, x.attended, x.noShow, x.cancelled]]));
  assert.deepEqual(rows, {
    "Facebook ads": [1, 0, 0, 0, 1],
    "Instagram ads": [1, 0, 0, 1, 0],
    "Google Ads": [2, 1, 1, 0, 0],
    Referral: [1, 0, 1, 0, 0],
    Unknown: [1, 1, 0, 0, 0],
  });
  assert.deepEqual([r.total.booked, r.total.upcoming, r.total.attended, r.total.noShow, r.total.cancelled], [6, 2, 2, 1, 1]);
  assert.equal(r.latest.length, 6);
  assert.ok(r.latest.every((b) => b.seed));
  assert.deepEqual(r.latest.map((b) => b.code), ["ref-T4M8", "ref-T2Q9", "No code", "ref-T8C3", "ref-T5H1", "No code"]);
  assert.deepEqual(r.latest[0], { code: "ref-T4M8", source: "Google", medium: "cpc", campaign: "Not set", stage: "Attended", bookedAt: "Thu 19 Nov, 2:15 pm", seed: true });
  assert.ok(!JSON.stringify(r).includes("X9Z9"), "the existing contact is excluded");
});

await test("report JSON: no @, no run of 8 or more digits, no test first name, no email domain", async () => {
  const now = Date.now();
  const all = [...(await fixtureProvider.list(now)), simulatedBooking("fb", "ref-K7Q2", 60, now), ...fillerBookings(now)];
  const s = JSON.stringify(buildReport(all, { now, updatedAt: now, stale: false, mode: "fixture", ref: "ref-K7Q2" }));
  assert.ok(!s.includes("@"));
  assert.ok(!/\d{8,}/.test(s));
  for (const n of ["Avery", "Blake", "Casey", "Drew", "Emery", "Finley", "Gray", "Visitor", "Filler", "Test ", "invalid", "+61", "phone"]) assert.ok(!s.includes(n), n);
  // The raw fixture does hold them, so the check above means something.
  assert.ok(JSON.stringify(FIXTURE_OPPORTUNITIES).includes("avery.test@example.invalid"));
});

await test("hostile values show as Other: a script tag, a 5,000-character campaign, a swear word", () => {
  const cases = [
    { source: "<script>alert(1)</script>", medium: "paid_social", campaign: "kp-initial-consult", ref: "ref-AB12" },
    { source: "Facebook", medium: "paid_social", campaign: "x".repeat(5000), ref: "ref-AB12" },
    { source: "Facebook", medium: "paid_social", campaign: "shit", ref: "<b>ref</b>" },
    { source: "Facebook", medium: "<img src=x onerror=1>", campaign: "<script>", ref: "ref-AB12" },
  ];
  const out = cases.map((f) => mapOpportunity(opp(f), pipe.stages, FIXTURE_FIELDS));
  assert.equal(out[0].source, "Other");
  assert.equal(out[1].campaign, "Other");
  assert.equal(out[2].campaign, "Other");
  assert.equal(out[2].ref, "");
  assert.equal(out[3].medium, "Other");
  assert.equal(out[3].campaign, "Other");
  const s = JSON.stringify(buildReport(out, { now: NOW, updatedAt: NOW, stale: false, mode: "live" }));
  assert.ok(!/[<>]/.test(s));
  assert.ok(!s.includes("shit"));
  assert.ok(!s.includes("xxxxxxxx"));
});

await test("a booking with no source is counted as Unknown, never dropped; Excluded is left out", () => {
  const none = mapOpportunity(opp({ ref: "ref-AB12" }), pipe.stages, FIXTURE_FIELDS);
  assert.deepEqual([none.source, none.medium, none.campaign], ["Unknown", "none", "Not set"]);
  assert.equal(mapOpportunity(opp({ source: "Excluded" }), pipe.stages, FIXTURE_FIELDS), null);
  const r = buildReport([none], { now: NOW, updatedAt: NOW, stale: false, mode: "live" });
  assert.equal(r.rows.find((x) => x.name === "Unknown").booked, 1);
});

await test("Booked at: rounded to 15 minutes, Brisbane; createdAt when the field has no time", () => {
  const b = mapOpportunity(opp({ source: "Facebook", medium: "paid_social" }), pipe.stages, FIXTURE_FIELDS);
  assert.equal(brisbaneStamp(b.bookedAt), "Fri 20 Nov, 11:30 pm"); // 13:37Z = 11:37 pm Brisbane, rounds to 11:30
  const dateOnly = mapOpportunity(opp({ source: "Facebook", bookedAt: "2026-11-20" }), pipe.stages, FIXTURE_FIELDS);
  assert.equal(dateOnly.bookedAt, b.bookedAt);
  assert.equal(brisbaneStamp(roundQuarter(Date.parse("2026-11-20T13:38:00Z"))), "Fri 20 Nov, 11:45 pm");
  assert.equal(brisbaneTime(Date.parse("2026-11-20T02:05:00Z")), "12:05 pm");
  assert.equal(brisbaneTime(Date.parse("2026-11-20T14:05:00Z")), "12:05 am");
});

await test("stage names map to report words; unknown names fall back to the status", () => {
  assert.equal(publicStage("Booked"), "Upcoming");
  assert.equal(publicStage("Attended"), "Attended");
  assert.equal(publicStage("No-show"), "No-show");
  assert.equal(publicStage("No show"), "No-show");
  assert.equal(publicStage("Cancelled"), "Cancelled");
  assert.equal(publicStage("Something", "abandoned"), "Cancelled");
  assert.equal(publicStage("Something", "open"), "Upcoming");
});

await test("allowlists: sources and campaigns", () => {
  assert.equal(publicSource("facebook"), "Facebook");
  assert.equal(publicSource("Excluded"), "Other");
  assert.equal(publicCampaign(""), "Not set");
  assert.equal(publicCampaign("KP-Initial-Consult"), "kp-initial-consult");
  assert.equal(publicCampaign("spike1"), "Other");
});

await test("optional rows show only when above 0, in the design's order, before Total", () => {
  const mk = (q, ref = "") => ({ ...normaliseTouch(touchFromUrl(`?${q}`)), ref, stage: "Upcoming", bookedAt: NOW - 3600e3, seed: false });
  const r = buildReport([mk("utm_source=fb&utm_medium=email"), mk("ttclid=x"), mk("fbclid=x"), mk("utm_source=google&utm_medium=organic")], { now: NOW, updatedAt: NOW, stale: false, mode: "live" });
  assert.deepEqual(r.rows.map((x) => x.name), ["Facebook ads", "Instagram ads", "Google Ads", "Referral", "Unknown", "Google, free", "Facebook, free", "TikTok", "Other"]);
  assert.equal(r.total.booked, 4);
});

await test("4-week window: old live bookings drop out, the labelled seed stays", () => {
  const old = { ref: "ref-OLD1", source: "Facebook", medium: "paid_social", campaign: "kp-initial-consult", stage: "Attended", bookedAt: NOW - 29 * 86400e3, seed: false };
  const oldSeed = { ...old, ref: "ref-OLD2", seed: true };
  const r = buildReport([old, oldSeed], { now: NOW, updatedAt: NOW, stale: false, mode: "live" });
  assert.equal(r.total.booked, 1);
  assert.deepEqual(r.latest.map((b) => b.code), ["ref-OLD2"]);
});

await test("Your booking: waiting, found and marked, then pushed out of the latest 10", async () => {
  const now = Date.now();
  const seed = await fixtureProvider.list(now);
  assert.equal(simulatedBooking("fb", "ref-K7Q2", 3, now), null, "not landed yet");
  const wait = buildReport(seed, { now, updatedAt: now, stale: false, mode: "fixture", ref: "ref-K7Q2" });
  assert.deepEqual(wait.yours, { found: false });
  const mine = simulatedBooking("fb", "ref-K7Q2", 40, now);
  const found = buildReport([...seed, mine], { now, updatedAt: now, stale: false, mode: "fixture", ref: "ref-K7Q2" });
  assert.deepEqual(found.yours, { found: true, inLatest: true, source: "Facebook", medium: "paid_social", campaign: "kp-initial-consult" });
  assert.equal(found.latest[0].code, "ref-K7Q2");
  assert.equal(found.latest[0].yours, true);
  assert.equal(found.latest.filter((b) => b.yours).length, 1);
  const old = simulatedBooking("fb", "ref-K7Q2", 3600, now);
  const pushed = buildReport([...seed, old, ...fillerBookings(now)], { now, updatedAt: now, stale: false, mode: "fixture", ref: "ref-K7Q2" });
  assert.equal(pushed.yours.found, true);
  assert.equal(pushed.yours.inLatest, false);
  assert.equal(pushed.latest.length, 10);
  assert.ok(!pushed.latest.some((b) => b.yours));
  assert.equal(pushed.rows.find((x) => x.name === "Facebook ads").booked, 1 + 1 + 3);
});

await test("a plain-link booking has no code and cannot be marked as yours", () => {
  const now = Date.now();
  const b = simulatedBooking("plain", "ref-K7Q2", 60, now);
  assert.deepEqual([b.ref, b.source, b.medium], ["", "Referral", "referral"]);
  const r = buildReport([b], { now, updatedAt: now, stale: false, mode: "fixture", ref: "ref-K7Q2" });
  assert.equal(r.latest[0].code, "No code");
  assert.equal(r.latest[0].yours, undefined);
  assert.deepEqual(r.yours, { found: false });
});

// ---------- 6. Providers, config and the token ----------

await test("the fixture is the default; live needs BOTH the token and the location", () => {
  assert.equal(selectProvider({}).mode, "fixture");
  assert.equal(selectProvider({ GHL_LEADSOURCE_TOKEN: "pit-fake" }).mode, "fixture");
  assert.equal(selectProvider({ GHL_LEADSOURCE_LOCATION: "loc" }).mode, "fixture");
  assert.equal(selectProvider({ GHL_LEADSOURCE_TOKEN: " ", GHL_LEADSOURCE_LOCATION: "loc" }).mode, "fixture");
  assert.equal(liveConfigured({ GHL_LEADSOURCE_TOKEN: "pit-fake", GHL_LEADSOURCE_LOCATION: "loc" }), true);
  assert.equal(selectProvider({ GHL_LEADSOURCE_TOKEN: "pit-fake", GHL_LEADSOURCE_LOCATION: "loc" }).mode, "live"); // built, never called
  assert.equal(selectProvider().mode, "fixture", "this test run has no live env");
});

await test("page config: kill switch, and live without a booking page pauses itself", () => {
  assert.deepEqual(pageConfig({}), { live: false, paused: false, bookingBase: "/demo/lead-source/report" });
  assert.equal(pageConfig({ LEADSOURCE_PAUSED: "1" }).paused, true);
  assert.equal(pageConfig({ GHL_LEADSOURCE_TOKEN: "t", GHL_LEADSOURCE_LOCATION: "l" }).paused, true);
  assert.equal(pageConfig({ GHL_LEADSOURCE_TOKEN: "t", GHL_LEADSOURCE_LOCATION: "l", LEADSOURCE_BOOKING_URL: "https://link.example.invalid/widget/bookings/x" }).paused, false);
  assert.equal(pageConfig({ LEADSOURCE_BOOKING_URL: "javascript:alert(1)" }).bookingBase, "/demo/lead-source/report");
});

await test("field ids: parsed strictly", () => {
  assert.deepEqual(parseFieldIds('{"source":"abc123","medium":"abc124","campaign":"abc125","ref":"abc126"}'), { source: "abc123", medium: "abc124", campaign: "abc125", ref: "abc126" });
  assert.equal(parseFieldIds('{"source":"abc123"}'), null);
  assert.equal(parseFieldIds('{"source":"a b","medium":"abc124","campaign":"abc125","ref":"abc126"}'), null);
  assert.equal(parseFieldIds("not json"), null);
  assert.equal(parseFieldIds(undefined), null);
});

await test("live provider (fake fetch, no network): one scope's endpoints, the version header, projection, no token in errors", async () => {
  const TOKEN = "pit-SECRET-should-never-leak";
  const seen = [];
  const fakeFetch = async (url, init) => {
    seen.push({ url, headers: init.headers });
    if (url.includes("/opportunities/pipelines")) return new Response(JSON.stringify({ pipelines: FIXTURE_PIPELINES }), { status: 200 });
    return new Response(JSON.stringify({ opportunities: FIXTURE_OPPORTUNITIES, meta: { total: 7 } }), { status: 200 });
  };
  const p = ghlProvider({ token: TOKEN, location: "locFake01", fields: FIXTURE_FIELDS, fetchImpl: fakeFetch });
  const out = await p.list(NOW);
  assert.equal(out.length, 6);
  assert.ok(seen[0].url.startsWith("https://services.leadconnectorhq.com/opportunities/pipelines?locationId=locFake01"));
  assert.ok(seen[1].url.startsWith("https://services.leadconnectorhq.com/opportunities/search?location_id=locFake01&pipeline_id=fxPipeline01&limit=100&page=1"));
  assert.equal(seen[0].headers.Version, "2021-07-28");
  assert.equal(seen[0].headers.Authorization, `Bearer ${TOKEN}`);
  assert.ok(!JSON.stringify(out).includes("@"));

  const denied = ghlProvider({ token: TOKEN, location: "locFake01", fields: FIXTURE_FIELDS, fetchImpl: async () => new Response("{}", { status: 401 }) });
  const err = await denied.list(NOW).catch((e) => e);
  assert.equal(err.reason, "status 401");
  assert.ok(!String(err.message).includes(TOKEN) && !String(err.stack).includes(TOKEN));
  const noFields = ghlProvider({ token: TOKEN, location: "locFake01", fields: null, fetchImpl: fakeFetch });
  assert.match((await noFields.list(NOW).catch((e) => e)).reason, /GHL_LEADSOURCE_FIELDS/);
});

// ---------- 7. Shared cache window and rate limit ----------

await test("shared cache: one provider call per window whatever the traffic; last good copy on error", async () => {
  resetMemory();
  let calls = 0;
  let fail = false;
  const p = { mode: "fixture", list: async () => { calls++; if (fail) throw Object.assign(new Error("x"), { reason: "status 500" }); return [{ ref: "ref-AB12", source: "Facebook", medium: "paid_social", campaign: "kp-initial-consult", stage: "Upcoming", bookedAt: 0, seed: true }]; } };
  const t0 = 1_000_000;
  const results = await Promise.all(Array.from({ length: 50 }, () => getBookings(p, t0)));
  assert.equal(calls, 1);
  assert.ok(results.every((r) => r.ok));
  await getBookings(p, t0 + (CACHE_SECONDS - 1) * 1000);
  assert.equal(calls, 1);
  fail = true;
  const warn = console.warn;
  console.warn = () => {};
  const r = await getBookings(p, t0 + (CACHE_SECONDS + 1) * 1000);
  console.warn = warn;
  assert.equal(calls, 2);
  assert.equal(r.ok, true);
  assert.equal(r.stale, true);
  assert.equal(r.data.at, t0);
  // The failed refresh holds the lock, so the next window is not hammered.
  await getBookings(p, t0 + (CACHE_SECONDS + 2) * 1000);
  assert.equal(calls, 2);
});

await test("shared cache: no copy and GoHighLevel down is an error, not a crash", async () => {
  resetMemory();
  const p = { mode: "live", list: async () => { throw Object.assign(new Error("x"), { reason: "network" }); } };
  const warn = console.warn;
  console.warn = () => {};
  const r = await getBookings(p, 5_000_000);
  console.warn = warn;
  assert.deepEqual(r, { ok: false });
});

await test("rate limit: the request after the limit is refused, per connection, and resets next window", async () => {
  resetMemory();
  const t = 7_000_000_000;
  for (let i = 0; i < RATE_MAX; i++) assert.equal(await allowRequest("ipA", t), true);
  assert.equal(await allowRequest("ipA", t), false);
  assert.equal(await allowRequest("ipB", t), true);
  assert.equal(await allowRequest("ipA", t + 600_000), true);
});

await test("rate limit override for a review day: whole numbers 1 to 10000 only", () => {
  assert.equal(rateMax({}), RATE_MAX);
  assert.equal(rateMax({ LEADSOURCE_RATE_MAX: "500" }), 500);
  for (const v of ["0", "-5", "1e9", "abc", "99999", " 50"]) assert.equal(rateMax({ LEADSOURCE_RATE_MAX: v }), RATE_MAX, v);
});

// ---------- 8. Copy: no em or en dashes in any lead-source source file ----------

await test("no em dash or en dash in the page, components, API or library", () => {
  const roots = ["src/lib/leadsource", "src/components/leadsource", "src/app/demo/lead-source", "src/app/api/lead-source"];
  const files = [];
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx?|css)$/.test(f)) files.push(p);
    }
  };
  for (const r of roots) {
    try {
      walk(r);
    } catch {}
  }
  assert.ok(files.length >= 8, `found ${files.length} files`);
  const bad = files.filter((f) => /[–—]/.test(readFileSync(f, "utf8")));
  assert.deepEqual(bad, []);
});

console.log(`${passed} passed`);
