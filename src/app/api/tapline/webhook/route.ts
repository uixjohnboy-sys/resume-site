import { clientIp, hashKey } from "@/lib/twin/gate";
import { network, underLimit } from "@/lib/tapline/store";
import { MAX_BODY, receive } from "@/lib/tapline/webhook";

// The public receiver. Anyone can post to it; only a request signed with the sandbox's secret gets past the first
// check, and the secret never leaves the server. POST with the header x-tapline-signature: t=<unix>,v1=<hmac>.

export const runtime = "nodejs";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const today = () => new Date().toISOString().slice(0, 10);

export async function POST(req: Request) {
  const ipKey = hashKey(network(clientIp(req)));
  if (!(await underLimit(`tapline:wh:pub:${ipKey}:${today()}`, 300))) return json({ status: "rejected", note: "Too many requests today." }, 429);
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY) return json({ status: "rejected", note: "That body is too large." }, 413);
  const body = await req.text();
  if (body.length > MAX_BODY) return json({ status: "rejected", note: "That body is too large." }, 413);
  const r = await receive(body, req.headers.get("x-tapline-signature") ?? "");
  return json({ status: r.status, note: r.note }, r.http);
}
