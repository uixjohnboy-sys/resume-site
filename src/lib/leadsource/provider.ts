import { fixtureProvider } from "./fixture.ts";
import { ghlProvider, parseFieldIds } from "./ghl.ts";
import type { Provider } from "./types.ts";

// One interface, two providers. The live GoHighLevel provider is used only when BOTH GHL_LEADSOURCE_TOKEN and
// GHL_LEADSOURCE_LOCATION are set (server env, never NEXT_PUBLIC_). Anything less is the fixture.
//   GHL_LEADSOURCE_FIELDS    the opportunity custom field ids, JSON (see ghl.ts). Live mode errors without it.
//   GHL_LEADSOURCE_PIPELINE  optional pipeline id; without it the pipeline is found by name ("DEMO Kestrel Physio").

type Env = Record<string, string | undefined>;

export function liveConfigured(env: Env = process.env): boolean {
  return Boolean(env.GHL_LEADSOURCE_TOKEN?.trim() && env.GHL_LEADSOURCE_LOCATION?.trim());
}

export function selectProvider(env: Env = process.env): Provider {
  if (!liveConfigured(env)) return fixtureProvider;
  return ghlProvider({
    token: env.GHL_LEADSOURCE_TOKEN!.trim(),
    location: env.GHL_LEADSOURCE_LOCATION!.trim(),
    pipelineId: env.GHL_LEADSOURCE_PIPELINE?.trim() || undefined,
    fields: parseFieldIds(env.GHL_LEADSOURCE_FIELDS),
  });
}

/** The page's own switches. LEADSOURCE_PAUSED=1 is the kill switch (SPEC 6). */
export function pageConfig(env: Env = process.env) {
  const live = liveConfigured(env);
  const bookingUrl = env.LEADSOURCE_BOOKING_URL?.trim() || "";
  const okUrl = /^https:\/\/[^\s"'<>]+$/.test(bookingUrl);
  // Live mode needs the real booking page. In fixture mode the links open the report as a stand-in, so the whole loop
  // (click, wait, found) can be walked without GoHighLevel.
  const paused = env.LEADSOURCE_PAUSED === "1" || (live && !okUrl);
  return { live, paused, bookingBase: okUrl ? bookingUrl : "/demo/lead-source/report" };
}
