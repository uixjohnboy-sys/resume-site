import { apply, PUBLIC_TYPES, type PublicAction } from "@/lib/tapline/actions";
import { load, mutate, putPhoto, reset, validId, version } from "@/lib/tapline/store";
import type { Region } from "@/lib/tapline/types";
import { clientIp, hashKey } from "@/lib/twin/gate";

// Tapline demo API.
//   GET  ?sb=<id>&region=AU|UK&v=<version>   the sandbox, or {unchanged} if the version matches
//   POST { sb, action }                       apply one public action (validated in actions.ts)
//   POST { sb, reset: "AU"|"UK" }             reseed the sandbox
// Sandboxes are private to the visitor's random id; nothing here is real data.

export const runtime = "nodejs";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const OOPS = "Something went wrong. Reload the page and try again.";
const regionOf = (r: unknown): Region => (r === "UK" ? "UK" : "AU");

export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("sb");
  if (!validId(id)) return json({ error: OOPS }, 400);
  const have = Number(u.searchParams.get("v") ?? "-1");
  if (have > 0 && (await version(id)) === have) return json({ unchanged: true, v: have, now: Date.now() });
  const loaded = await load(id, regionOf(u.searchParams.get("region")));
  return json({ sb: loaded.sb, v: loaded.v, now: Date.now() });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: OOPS }, 400);
  }
  if (!body || typeof body !== "object") return json({ error: OOPS }, 400);
  const b = body as { sb?: unknown; action?: unknown; reset?: unknown; region?: unknown };
  if (!validId(b.sb)) return json({ error: OOPS }, 400);
  const ipKey = hashKey(clientIp(req));
  const now = Date.now();

  if (b.reset === "AU" || b.reset === "UK") {
    const r = await reset(b.sb, b.reset, ipKey);
    return r.ok ? json({ sb: r.sb, v: r.v, now }) : json({ error: r.error }, r.status);
  }

  const action = b.action as PublicAction | undefined;
  if (!action || typeof action !== "object" || Array.isArray(action) || !PUBLIC_TYPES.has((action as { type?: string }).type ?? "")) {
    return json({ error: OOPS }, 400);
  }

  // Photos are checked and stored first; the job only keeps the photo's id.
  if ((action.type === "report" || action.type === "complete") && action.photo !== undefined) {
    if (typeof action.photo === "string" && action.photo.startsWith("data:")) {
      const ph = await putPhoto(b.sb, action.photo);
      if (typeof ph !== "string") return json({ error: ph.error }, 400);
      action.photo = ph;
    } else {
      action.photo = undefined;
    }
  }

  const r = await mutate<string | undefined>(b.sb, regionOf(b.region), ipKey, (loaded) => {
    const res = apply(loaded.sb, action, now);
    return res.ok ? { ok: true, sb: res.sb, out: res.jobId } : { ok: false, error: res.error };
  });
  if (!r.ok) return json({ error: r.error }, r.status);
  return json({ sb: r.sb, v: r.v, jobId: r.out, now });
}
