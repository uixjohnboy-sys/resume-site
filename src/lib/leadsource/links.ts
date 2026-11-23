import { DEMO_CAMPAIGN } from "./config.ts";

// The four demo links (SPEC 6.1, DESIGN 3). Each carries the real URL shape of its channel; the three ad links add the
// visitor's test code in utm_content, the plain link carries nothing at all. Pure, so the page and the fixture share it.

export type Channel = "fb" | "ig" | "google" | "plain";
export const CHANNELS: readonly Channel[] = ["fb", "ig", "google", "plain"];

export const isChannel = (v: unknown): v is Channel => typeof v === "string" && (CHANNELS as readonly string[]).includes(v);

/** The query string for one channel. clickId stands in for the platform's click ID ("demo" plus random letters). */
export function adQuery(channel: Channel, code: string, clickId: string): string {
  const content = code ? [["utm_content", code]] : [];
  const pairs: string[][] =
    channel === "fb"
      ? [["utm_source", "fb"], ["utm_medium", "paid_social"], ["utm_campaign", DEMO_CAMPAIGN], ...content, ["fbclid", clickId]]
      : channel === "ig"
        ? [["utm_source", "ig"], ["utm_medium", "paid_social"], ["utm_campaign", DEMO_CAMPAIGN], ...content, ["fbclid", clickId]]
        : channel === "google"
          ? [["gclid", clickId], ...content]
          : [];
  return pairs.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
}

export function adHref(base: string, channel: Channel, code: string, clickId: string): string {
  const q = adQuery(channel, code, clickId);
  if (!q) return base;
  return `${base}${base.includes("?") ? "&" : "?"}${q}`;
}

/** What the card prints under "This link sends": the same pairs, broken before each "&". */
export function adSends(channel: Channel, code: string): string {
  const q = adQuery(channel, code || "ref-XXXX", "demo...");
  return q.split("&").join(" &");
}
