import { clientIp, hashKey } from "@/lib/twin/gate";
import { network, underLimit, validId } from "@/lib/tapline/store";
import { overview, send, SEND_KINDS, type SendKind } from "@/lib/tapline/webhook";

// The demo's Integrations tab. GET reads the log for one sandbox; POST presses one button: the server signs a request
// and passes it through the real receiver. Nothing here creates or counts as a saved demo.

export const runtime = "nodejs";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const OOPS = "Something went wrong. Reload the page and try again.";
const today = () => new Date().toISOString().slice(0, 10);

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("sb");
  if (!validId(id)) return json({ error: OOPS }, 400);
  return json(await overview(id));
}

export async function POST(req: Request) {
  let b: { sb?: unknown; kind?: unknown; region?: unknown };
  try {
    b = (await req.json()) as typeof b;
  } catch {
    return json({ error: OOPS }, 400);
  }
  if (!b || !validId(b.sb) || typeof b.kind !== "string" || !SEND_KINDS.has(b.kind)) return json({ error: OOPS }, 400);
  const ipKey = hashKey(network(clientIp(req)));
  const day = today();
  const allowed =
    (await underLimit(`tapline:wh:sb:${b.sb}`, 120)) && (await underLimit(`tapline:wh:ip:${ipKey}:${day}`, 400)) && (await underLimit(`tapline:wh:site:${day}`, 3000));
  if (!allowed) return json({ error: "That's a lot of test events today. Please try again tomorrow." }, 429);
  try {
    const result = await send(b.sb, b.region === "UK" ? "UK" : "AU", b.kind as SendKind);
    return json({ result, ...(await overview(b.sb)) });
  } catch {
    return json({ error: OOPS }, 500);
  }
}
