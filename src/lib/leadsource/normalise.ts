import { DEMO_TAG, MAX_FIELD } from "./config.ts";
import type { Medium, RowName, Source } from "./types.ts";

// The source normaliser (SPEC 5.3) and the report grouping rule (DESIGN 5.2). In the live build the same mapping runs
// inside GoHighLevel so the snapshot carries it; this module is the reference the fixture, the tests and the SOP's
// mapping list are checked against.
//
// Precedence for the source:
//   1. Click ID: gclid, wbraid, gbraid = Google; fbclid = Instagram when the source says Instagram, else Facebook;
//      ttclid = TikTok.
//   2. utm_source, lower-cased: fb, fb_ad, facebook = Facebook; ig, ig_ad, instagram = Instagram; google, adwords =
//      Google; tiktok = TikTok. Any other utm_source = Other.
//   3. Referrer host: Facebook, Instagram and Google hosts by name; any other host = Referral.
//   4. Nothing at all = Unknown.
// Medium normalises to paid_social, cpc, organic, referral or none. A medium not on the synonym list is Other, never
// free (G2 recheck N-m7).

export type RawTouch = {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  gclid?: string | null;
  wbraid?: string | null;
  gbraid?: string | null;
  fbclid?: string | null;
  ttclid?: string | null;
  referrer?: string | null;
};

export type Touch = { source: Source; medium: Medium; campaign: string; ref: string; clickId: string; raw: string };

const clip = (v: unknown) => (typeof v === "string" ? v.slice(0, MAX_FIELD * 4).trim() : "");
const lc = (v: unknown) => clip(v).toLowerCase();
const has = (v: unknown) => clip(v).length > 0;

const UTM_SOURCES: Record<string, Exclude<Source, "Referral" | "Unknown" | "Other">> = {
  fb: "Facebook",
  fb_ad: "Facebook",
  facebook: "Facebook",
  ig: "Instagram",
  ig_ad: "Instagram",
  instagram: "Instagram",
  google: "Google",
  adwords: "Google",
  tiktok: "TikTok",
};

const FB_HOSTS = new Set(["facebook.com", "m.facebook.com", "l.facebook.com", "lm.facebook.com"]);
const IG_HOSTS = new Set(["instagram.com", "l.instagram.com"]);
const GOOGLE_HOST = /^google\.[a-z]{2,3}(\.[a-z]{2})?$/;

/** The referring host, lower-cased and without "www.", or "" when there is none or it does not parse. */
export function referrerHost(referrer: unknown): string {
  const r = clip(referrer);
  if (!r) return "";
  try {
    return new URL(r).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function hostSource(host: string): Source {
  if (FB_HOSTS.has(host)) return "Facebook";
  if (IG_HOSTS.has(host)) return "Instagram";
  if (GOOGLE_HOST.test(host)) return "Google";
  return "Referral";
}

const googleClick = (t: RawTouch) => has(t.gclid) || has(t.wbraid) || has(t.gbraid);

export function normaliseSource(t: RawTouch): Source {
  const src = lc(t.utmSource);
  const host = referrerHost(t.referrer);
  if (googleClick(t)) return "Google";
  if (has(t.fbclid)) {
    const ig = src ? UTM_SOURCES[src] === "Instagram" : IG_HOSTS.has(host);
    return ig ? "Instagram" : "Facebook";
  }
  if (has(t.ttclid)) return "TikTok";
  if (src) return UTM_SOURCES[src] ?? "Other";
  if (host) return hostSource(host);
  return "Unknown";
}

// Medium synonyms. "Paid" names become paid_social on a social platform and cpc everywhere else, so an ad tagged
// utm_medium=cpc on Facebook still lands in "Facebook ads".
const PAID = new Set([
  "paid_social",
  "paidsocial",
  "paid-social",
  "paid social",
  "social_paid",
  "social-paid",
  "paid",
  "cpc",
  "ppc",
  "cpm",
  "paid_search",
  "paidsearch",
  "paid-search",
  "sem",
]);
// "social" on its own is free social (GA4 treats it as organic social).
const ORGANIC = new Set(["organic", "social", "organic_social", "organic-social", "social_organic", "social-organic", "organic social"]);
const REFERRAL = new Set(["referral"]);
const NONE = new Set(["none", "(none)", "direct"]);

const SOCIAL: ReadonlySet<Source> = new Set<Source>(["Facebook", "Instagram", "TikTok"]);

export function normaliseMedium(t: RawTouch, source: Source = normaliseSource(t)): Medium {
  // A Google click ID only exists on an ad click, so it is always paid search.
  if (googleClick(t)) return "cpc";
  const m = lc(t.utmMedium);
  if (m) {
    if (PAID.has(m)) return SOCIAL.has(source) ? "paid_social" : "cpc";
    if (ORGANIC.has(m)) return "organic";
    if (REFERRAL.has(m)) return "referral";
    if (NONE.has(m)) return "none";
    return "Other";
  }
  if (has(t.ttclid)) return "paid_social";
  // No tags at all, but a referring site: Google is organic search, any other site is a referral.
  if (!lc(t.utmSource) && referrerHost(t.referrer)) return source === "Google" ? "organic" : "referral";
  return "none";
}

/** The visitor's test code from utm_content, upper-cased ("ref-k7q2" and "ref-K7Q2" are one code), or "". */
export function normaliseRef(v: unknown): string {
  const m = /^ref-([a-z0-9]{4})$/i.exec(clip(v));
  return m ? `ref-${m[1].toUpperCase()}` : "";
}

export function normaliseCampaign(v: unknown): string {
  return lc(v).slice(0, MAX_FIELD);
}

/** The whole touch: what the workflow writes to the contact and the opportunity for one booking. */
export function normaliseTouch(t: RawTouch): Touch {
  const source = normaliseSource(t);
  return {
    source,
    medium: normaliseMedium(t, source),
    campaign: normaliseCampaign(t.utmCampaign),
    ref: normaliseRef(t.utmContent),
    clickId: clip(t.gclid) || clip(t.wbraid) || clip(t.gbraid) || clip(t.fbclid) || clip(t.ttclid),
    raw: (clip(t.utmSource) || referrerHost(t.referrer)).slice(0, MAX_FIELD),
  };
}

/** Read a booking link's query string (and the referrer the browser sent) into a raw touch. */
export function touchFromUrl(url: string, referrer = ""): RawTouch {
  let q: URLSearchParams;
  try {
    q = new URL(url, "https://example.invalid").searchParams;
  } catch {
    q = new URLSearchParams();
  }
  return {
    utmSource: q.get("utm_source"),
    utmMedium: q.get("utm_medium"),
    utmCampaign: q.get("utm_campaign"),
    utmContent: q.get("utm_content"),
    gclid: q.get("gclid"),
    wbraid: q.get("wbraid"),
    gbraid: q.get("gbraid"),
    fbclid: q.get("fbclid"),
    ttclid: q.get("ttclid"),
    referrer,
  };
}

// Report grouping (DESIGN 5.2). The contact fields keep source and medium as they are; only the report groups them.
const PAID_MEDIUMS: ReadonlySet<Medium> = new Set<Medium>(["paid_social", "cpc"]);
const FREE_MEDIUMS: ReadonlySet<Medium> = new Set<Medium>(["organic", "referral", "none"]);

export function reportRow(source: Source, medium: Medium): RowName {
  if (source === "Referral" || source === "Unknown" || source === "TikTok" || source === "Other") return source;
  const ads = PAID_MEDIUMS.has(medium);
  const free = FREE_MEDIUMS.has(medium);
  if (!ads && !free) return "Other";
  if (source === "Google") return ads ? "Google Ads" : "Google, free";
  return ads ? `${source} ads` : `${source}, free`;
}

/** Rows always shown, in this order; then the optional rows, only when their count is above 0. */
// Referral is optional since G3 v1 (QA M2): the live GoHighLevel workflow classifies from tags and click IDs only and never
// reads the referring site, so an untagged booking is Unknown. A Referral row appears only if an install adds referrer rules.
export const FIXED_ROWS: readonly RowName[] = ["Facebook ads", "Instagram ads", "Google Ads", "Unknown"];
export const OPTIONAL_ROWS: readonly RowName[] = ["Referral", "Google, free", "Facebook, free", "Instagram, free", "TikTok", "Other"];

// First touch and last touch on the contact (SPEC 5.2). First touch = the first booking this workflow captured: written
// only while Lead source is empty. Last touch: written on every booking.

export type ContactFields = {
  leadSource?: string;
  leadMedium?: string;
  leadCampaign?: string;
  firstTouchDate?: string;
  lastSource?: string;
  lastMedium?: string;
  lastCampaign?: string;
  lastTouchDate?: string;
  rawSource?: string;
  clickId?: string;
};

/** The contact's fields after one booking. date is the booking date as GoHighLevel stores it ("2026-11-17"). */
export function applyTouch(c: ContactFields, touch: Touch, date: string): ContactFields {
  const next: ContactFields = { ...c };
  if (!c.leadSource) {
    next.leadSource = touch.source;
    next.leadMedium = touch.medium;
    next.leadCampaign = touch.campaign;
    next.firstTouchDate = date;
  }
  next.lastSource = touch.source;
  next.lastMedium = touch.medium;
  next.lastCampaign = touch.campaign;
  next.lastTouchDate = date;
  next.rawSource = touch.raw;
  if (touch.clickId) next.clickId = touch.clickId;
  return next;
}

/**
 * The existing-contact guard (SPEC 5.6): the demo never stamps a contact that existed before the demo touched it.
 * Excluded when the contact has any tag that is not a demo tag, or was added before this booking and was never a demo
 * contact. A returning demo contact (already tagged demo-kestrel) is not excluded: it keeps its first touch.
 * toleranceMs covers the seconds between GoHighLevel creating the contact and the booking event.
 */
export function isExcluded(contact: { dateAdded: number; tags: readonly string[] }, bookingAt: number, toleranceMs = 10 * 60 * 1000): boolean {
  const demo = (t: string) => t === DEMO_TAG || t.startsWith(`${DEMO_TAG}-`);
  if (contact.tags.some((t) => !demo(t))) return true;
  const addedBefore = contact.dateAdded < bookingAt - toleranceMs;
  return addedBefore && !contact.tags.some(demo);
}
