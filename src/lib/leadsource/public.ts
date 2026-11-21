import { CAMPAIGNS, MAX_FIELD, REF_RE } from "./config.ts";
import type { Medium, Source, Stage } from "./types.ts";

// The public allowlists (SPEC 6.3). Every value read from GoHighLevel passes through one of these before it is cached
// or shown: anything not on a list is "Other", a test code that does not match ref-XXXX is blank. Values are capped in
// length first, and nothing here is ever rendered as HTML.

const SOURCES: readonly Source[] = ["Facebook", "Instagram", "Google", "TikTok", "Referral", "Unknown"];
const MEDIUMS: readonly Medium[] = ["paid_social", "cpc", "organic", "referral", "none"];

const str = (v: unknown) => (typeof v === "string" ? v.slice(0, MAX_FIELD).trim() : "");

export function publicSource(v: unknown): Source {
  const s = str(v).toLowerCase();
  return SOURCES.find((x) => x.toLowerCase() === s) ?? "Other";
}

export function publicMedium(v: unknown): Medium {
  const s = str(v).toLowerCase();
  return MEDIUMS.find((x) => x === s) ?? "Other";
}

/** A campaign from the demo's own list, "Not set" when blank, otherwise "Other". */
export function publicCampaign(v: unknown): string {
  if (typeof v === "string" && v.length > MAX_FIELD) return "Other";
  const s = str(v).toLowerCase();
  if (!s) return "Not set";
  return (CAMPAIGNS as readonly string[]).includes(s) ? s : "Other";
}

export function publicRef(v: unknown): string {
  if (typeof v !== "string" || v.length > MAX_FIELD) return "";
  const s = v.trim();
  const up = /^ref-/i.test(s) ? `ref-${s.slice(4).toUpperCase()}` : s;
  return REF_RE.test(up) ? up : "";
}

/** A pipeline stage name to the report's word for it. Unknown names fall back to the opportunity status. */
export function publicStage(stageName: unknown, status?: unknown): Stage {
  const s = str(stageName).toLowerCase().replace(/[\s_-]+/g, "");
  if (s === "booked" || s === "upcoming") return "Upcoming";
  if (s === "attended" || s === "showed") return "Attended";
  if (s === "noshow") return "No-show";
  if (s === "cancelled" || s === "canceled") return "Cancelled";
  const st = str(status).toLowerCase();
  if (st === "won") return "Attended";
  if (st === "lost" || st === "abandoned") return "Cancelled";
  return "Upcoming";
}

// Times. Brisbane is UTC+10 all year (no daylight saving), so the offset is fixed and the labels never depend on the
// server's own time zone.
const BNE = 10 * 60 * 60 * 1000;
const QUARTER = 15 * 60 * 1000;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const roundQuarter = (ms: number) => Math.round(ms / QUARTER) * QUARTER;

function clock(d: Date) {
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

/** "11:42 pm", Brisbane. */
export function brisbaneTime(ms: number): string {
  return clock(new Date(ms + BNE));
}

/** "Fri 20 Nov, 11:30 pm", Brisbane. */
export function brisbaneStamp(ms: number): string {
  const d = new Date(ms + BNE);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}, ${clock(d)}`;
}
