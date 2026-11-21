// Lead-source tracker demo (C:\PortfolioProjects\lead-source-tracker\SPEC.md v0.2, DESIGN.md v0.3).
// Shared types. A Booking is the projected, allowlisted record: it is the only thing that is ever cached or sent to
// the browser. Nothing in it can hold a name, an email, a phone number or an appointment time.

export type Source = "Facebook" | "Instagram" | "Google" | "TikTok" | "Referral" | "Unknown" | "Other";
export type Medium = "paid_social" | "cpc" | "organic" | "referral" | "none" | "Other";
export type Stage = "Upcoming" | "Attended" | "No-show" | "Cancelled";

export type RowName =
  | "Facebook ads"
  | "Instagram ads"
  | "Google Ads"
  | "Referral"
  | "Unknown"
  | "Google, free"
  | "Facebook, free"
  | "Instagram, free"
  | "TikTok"
  | "Other";

/** One booking after projection. bookedAt is epoch ms, already rounded to 15 minutes. ref is "" when there is no code. */
export type Booking = {
  ref: string;
  source: Source;
  medium: Medium;
  campaign: string;
  stage: Stage;
  bookedAt: number;
  seed: boolean;
};

export type Counts = { booked: number; upcoming: number; attended: number; noShow: number; cancelled: number };

export type PublicRow = Counts & { name: RowName | "Total" };

export type PublicBooking = {
  code: string; // ref-XXXX or "No code"
  source: Source;
  medium: Medium;
  campaign: string; // a value from the campaign allowlist, "Not set" or "Other"
  stage: Stage;
  bookedAt: string; // "Fri 20 Nov, 11:30 pm", Brisbane
  seed: boolean;
  yours?: boolean;
};

export type Yours =
  | { found: true; inLatest: boolean; source: Source; medium: Medium; campaign: string }
  | { found: false };

/** The report JSON the browser gets. Labels only: no timestamps, so no long digit runs. */
export type PublicReport = {
  mode: "fixture" | "live";
  updated: string; // "11:42 pm"
  cacheWindow: string; // "30 seconds"
  stale: boolean;
  rows: PublicRow[];
  total: PublicRow;
  latest: PublicBooking[];
  yours?: Yours;
};

export type Provider = {
  mode: "fixture" | "live";
  /** Every booking in the demo pipeline, projected. Throws on any failure (the caller serves the last good copy). */
  list(now: number): Promise<Booking[]>;
};
