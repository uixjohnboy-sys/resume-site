import { DEMO_TAG, EXCLUDED, FIXTURE_LAG_SECONDS, PIPELINE_NAME, SEED_TAG } from "./config.ts";
import { mapOpportunity, pickPipeline, type FieldIds } from "./ghl.ts";
import { adQuery, type Channel } from "./links.ts";
import { isExcluded, normaliseTouch, touchFromUrl } from "./normalise.ts";
import type { Booking, Provider } from "./types.ts";

// The fixture provider: the default until the live token is set. It serves made-up GoHighLevel-shaped records (same
// shape as GET /opportunities/search, contact names and emails included) and runs them through the SAME projection as
// the live provider, so the report never sees a name or email in either mode. Each record goes through the same steps
// the GHL workflow takes: normalise the link, apply the existing-contact guard, write the opportunity fields.
// The names are made up, use the reserved .invalid domain, and are never shown.

export const FIXTURE_FIELDS: FieldIds = { source: "fxSource0001", medium: "fxMedium0001", campaign: "fxCampaign01", ref: "fxDemoRef001", bookedAt: "fxBookedAt01" };

const STAGES = [
  { id: "fxStageBooked", name: "Booked" },
  { id: "fxStageAttended", name: "Attended" },
  { id: "fxStageNoShow", name: "No-show" },
  { id: "fxStageCancelled", name: "Cancelled" },
];
export const FIXTURE_PIPELINES = [{ id: "fxPipeline01", name: PIPELINE_NAME, stages: STAGES }];
const stageId = (name: string) => STAGES.find((s) => s.name === name)!.id;

type Record_ = {
  link: string; // the booking link's query string
  referrer?: string;
  at: string; // when the booking was made (UTC)
  stage: "Booked" | "Attended" | "No-show" | "Cancelled";
  contact: { name: string; email: string; tags: string[]; addedAt?: string };
};

const SITE = "https://www.johnboydesign.com/demo/lead-source";
const seedTags = [DEMO_TAG, SEED_TAG];

// John Boy's own test bookings in the live build; here, made-up stand-ins with the same shape (times are Brisbane in
// the comments). Six seed bookings, one per channel shape, plus one existing contact the guard leaves out.
const RECORDS: Record_[] = [
  // Thu 19 Nov, 2:15 pm: Google ad, auto-tagging style (gclid only).
  { link: "gclid=demoT4M8xq&utm_content=ref-T4M8", at: "2026-11-19T04:15:00Z", stage: "Attended", contact: { name: "Test Avery", email: "avery.test@example.invalid", tags: seedTags } },
  // Wed 18 Nov, 10:00 am: Instagram ad.
  { link: "utm_source=ig&utm_medium=paid_social&utm_campaign=kp-initial-consult&utm_content=ref-T2Q9&fbclid=demoT2Q9pw", at: "2026-11-18T00:00:00Z", stage: "No-show", contact: { name: "Test Blake", email: "blake.test@example.invalid", tags: seedTags } },
  // Wed 18 Nov, 8:45 am: a pasted link, no tags and no referring site.
  { link: "", at: "2026-11-17T22:45:00Z", stage: "Booked", contact: { name: "Test Casey", email: "casey.test@example.invalid", tags: seedTags } },
  // Tue 17 Nov, 4:30 pm: Facebook ad, later cancelled (it stays counted).
  { link: "utm_source=fb&utm_medium=paid_social&utm_campaign=kp-initial-consult&utm_content=ref-T8C3&fbclid=demoT8C3nb", at: "2026-11-17T06:30:00Z", stage: "Cancelled", contact: { name: "Test Drew", email: "drew.test@example.invalid", tags: seedTags } },
  // Mon 16 Nov, 7:15 pm: Google ad.
  { link: "gclid=demoT5H1kd&utm_content=ref-T5H1", at: "2026-11-16T09:15:00Z", stage: "Booked", contact: { name: "Test Emery", email: "emery.test@example.invalid", tags: seedTags } },
  // Sun 15 Nov, 12:30 pm: the plain link clicked on this site, so the browser sent the referrer.
  { link: "", referrer: SITE, at: "2026-11-15T02:30:00Z", stage: "Attended", contact: { name: "Test Finley", email: "finley.test@example.invalid", tags: seedTags } },
  // Sat 14 Nov, 9:00 am: an email that was already a contact (a non-demo tag). The guard stamps nothing and the
  // opportunity Source is "Excluded", so the report leaves it out.
  {
    link: "utm_source=fb&utm_medium=paid_social&utm_campaign=kp-initial-consult&utm_content=ref-X9Z9&fbclid=demoX9Z9aa",
    at: "2026-11-13T23:00:00Z",
    stage: "Booked",
    contact: { name: "Test Gray", email: "gray.test@example.invalid", tags: ["coach-os-client", DEMO_TAG], addedAt: "2026-10-01T00:00:00Z" },
  },
];

/** One record through the workflow's steps, to a GoHighLevel-shaped opportunity. */
export function toOpportunity(r: Record_, i: number) {
  const at = Date.parse(r.at);
  const touch = normaliseTouch(touchFromUrl(`?${r.link}`, r.referrer ?? ""));
  const excluded = isExcluded({ dateAdded: r.contact.addedAt ? Date.parse(r.contact.addedAt) : at, tags: r.contact.tags }, at);
  const f = FIXTURE_FIELDS;
  return {
    id: `fxOpp${String(i).padStart(4, "0")}`,
    name: r.contact.name,
    pipelineId: FIXTURE_PIPELINES[0].id,
    pipelineStageId: stageId(r.stage),
    status: r.stage === "Cancelled" ? "abandoned" : "open",
    createdAt: r.at,
    contact: { id: `fxContact${i}`, name: r.contact.name, email: r.contact.email, phone: null, tags: r.contact.tags },
    customFields: excluded
      ? [{ id: f.source, fieldValueString: EXCLUDED }]
      : [
          { id: f.source, fieldValueString: touch.source },
          { id: f.medium, fieldValueString: touch.medium },
          { id: f.campaign, fieldValueString: touch.campaign },
          { id: f.ref, fieldValueString: touch.ref },
          { id: f.bookedAt, fieldValueString: new Date(at).toISOString() },
        ],
  };
}

export const FIXTURE_OPPORTUNITIES = RECORDS.map(toOpportunity);

function project(opps: ReturnType<typeof toOpportunity>[]): Booking[] {
  const pipe = pickPipeline(FIXTURE_PIPELINES)!;
  return opps.map((o) => mapOpportunity(o, pipe.stages, FIXTURE_FIELDS)).filter((b): b is Booking => b !== null);
}

export const fixtureProvider: Provider = {
  mode: "fixture",
  async list() {
    return project(FIXTURE_OPPORTUNITIES);
  },
};

/**
 * Fixture mode only: the visitor's own booking, simulated so the "Your booking" states can be walked without a live
 * booking page. It "lands" FIXTURE_LAG_SECONDS after the click. Stateless: the page says which link it clicked and how
 * long ago. Never used in live mode.
 */
export function simulatedBooking(channel: Channel, code: string, secondsAgo: number, now: number): Booking | null {
  if (secondsAgo < FIXTURE_LAG_SECONDS) return null;
  const at = now - Math.min(secondsAgo, 3600) * 1000;
  const link = adQuery(channel, channel === "plain" ? "" : code, "demoSIM");
  const opp = toOpportunity({ link, referrer: channel === "plain" ? SITE : "", at: new Date(at).toISOString(), stage: "Booked", contact: { name: "Test Visitor", email: "visitor.test@example.invalid", tags: [DEMO_TAG] } }, 9000);
  return project([opp])[0] ?? null;
}

/** Fixture mode only (QA scenario "pushed"): ten newer bookings, so the visitor's row drops out of the latest 10. */
export function fillerBookings(now: number): Booking[] {
  const shapes: Channel[] = ["fb", "google", "ig", "google", "fb", "plain", "google", "fb", "ig", "google"];
  return shapes.map((ch, i) => {
    const code = ch === "plain" ? "" : `ref-F${i}Q${(i * 7) % 10}`;
    const at = now - (i + 1) * 60 * 1000;
    const opp = toOpportunity({ link: adQuery(ch, code, "demoFILL"), referrer: ch === "plain" ? SITE : "", at: new Date(at).toISOString(), stage: "Booked", contact: { name: "Test Filler", email: "filler.test@example.invalid", tags: [DEMO_TAG] } }, 9100 + i);
    return project([opp])[0]!;
  });
}
