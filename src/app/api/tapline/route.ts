import { apply, type Action } from "@/lib/tapline/actions";
import { getOrCreate, loadSandbox, resetSandbox, saveSandbox, validId } from "@/lib/tapline/store";
import type { Region } from "@/lib/tapline/types";

// Tapline demo API. One endpoint, three verbs:
//   GET  ?sb=<id>&region=AU|UK      the sandbox (created from seed on first use)
//   POST { sb, action }             apply one action, return the new sandbox
//   POST { sb, reset: "AU"|"UK" }   reseed the sandbox
// Sandboxes are private to the visitor's random id; nothing here is real data.

export const runtime = "nodejs";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

const region = (r: unknown): Region => (r === "UK" ? "UK" : "AU");

export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("sb");
  if (!validId(id)) return json({ error: "Missing demo id." }, 400);
  const sb = await getOrCreate(id, region(u.searchParams.get("region")));
  return json({ sb, now: Date.now() });
}

export async function POST(req: Request) {
  let body: { sb?: string; action?: Action; reset?: Region };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad request." }, 400);
  }
  if (!validId(body.sb)) return json({ error: "Missing demo id." }, 400);

  if (body.reset) {
    const sb = await resetSandbox(body.sb, region(body.reset));
    return json({ sb, now: Date.now() });
  }

  const current = await loadSandbox(body.sb);
  if (!current) return json({ error: "This demo has expired. Reload to start a fresh one." }, 404);
  if (!body.action || typeof body.action !== "object") return json({ error: "Bad request." }, 400);

  const now = Date.now();
  const result = apply(current, body.action, now);
  if (!result.ok) return json({ error: result.error }, 409);
  await saveSandbox(result.sb);
  return json({ sb: result.sb, jobId: result.jobId, now });
}
