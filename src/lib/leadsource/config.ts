// Lead-source tracker demo: the numbers and names the server and the page share.
// Values that can only be known from the live GoHighLevel build are null until G3 measures them (DESIGN.md: never
// guessed). The page shows a dashed "measured at G3" box, or hides the line, while they are null.

/** One shared server cache window: GoHighLevel is called at most once per window, whatever the traffic (SPEC 6.3). */
export const CACHE_SECONDS = 30;
export const CACHE_WINDOW_LABEL = "30 seconds";

/** Per-connection limit on report requests. The page polls at most every 15 seconds, so a normal visit stays well under. */
export const RATE_MAX = 60;
export const RATE_WINDOW_SECONDS = 600;
export const RATE_WINDOW_LABEL = "10 minutes";

/** Report counts cover the last 4 weeks plus the labelled seed (SPEC 7). */
export const WINDOW_DAYS = 28;
export const LATEST_MAX = 10;

/** How often the page asks again while it waits for the visitor's booking, and otherwise. */
export const POLL_WAITING_SECONDS = 15;
export const POLL_IDLE_SECONDS = 30;
export const POLL_IDLE_MAX = 20;

/** The demo's own campaigns. Any other campaign shows as "Other" (SPEC 6.3). */
export const CAMPAIGNS = ["kp-initial-consult"] as const;

export const PIPELINE_NAME = "DEMO Kestrel Physio";
export const DEMO_TAG = "demo-kestrel";
/** Contact tag on John Boy's own test bookings (the labelled seed). Read only to set Booking.seed, then dropped. */
export const SEED_TAG = "demo-kestrel-seed";
/** The value the existing-contact guard writes to the opportunity Source; the report leaves these out (SPEC 5.6). */
export const EXCLUDED = "Excluded";

/** Length cap on every value read from GoHighLevel before any allowlist runs. */
export const MAX_FIELD = 64;

/** The test code: ref- plus 4 capital letters or digits. */
export const REF_RE = /^ref-[A-Z0-9]{4}$/;

/** The campaign the three demo ads carry. */
export const DEMO_CAMPAIGN = "kp-initial-consult";

/**
 * Measured on the live build at G3. Until then:
 * - lagSeconds null: "usually appears within N seconds" is not shown, and checking stops after PROVISIONAL_LAG_SECONDS x 3.
 * - plainResult / googleResult null: the "Should show as" value sits in a dashed "measured at G3" box.
 * - stageWorkflowProven false: "A workflow then moves the booking." sits in a dashed box.
 * - recording null: the watch row shows a dashed placeholder instead of a link.
 */
export const MEASURED: {
  lagSeconds: number | null;
  lagDate: string | null; // "21 Nov 2026"
  plainResult: "Referral" | "Unknown" | null;
  googleResult: string | null; // "Google, cpc"
  stageWorkflowProven: boolean;
  recording: { href: string; transcript: string; length: string } | null;
} = {
  lagSeconds: null,
  lagDate: null,
  plainResult: null,
  googleResult: "Google, cpc", // measured 23 Nov 2026: test booking 3 (click ID only) read as Google / cpc
  stageWorkflowProven: true, // measured 23 Nov 2026: Showed moved the booking to Attended, No show to No-show
  recording: null,
};

export const PROVISIONAL_LAG_SECONDS = 60;

/** Fixture mode only: a simulated booking "lands" this many seconds after the click, so the Waiting state is visible. */
export const FIXTURE_LAG_SECONDS = 12;
