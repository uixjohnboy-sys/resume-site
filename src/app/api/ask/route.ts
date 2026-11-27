import { getRedis } from "@/lib/redis";
import { checkContact, clientIp, hashKey } from "@/lib/twin/gate";

// "Not on the list?" message from the homepage (JB 2026-11-27).
//
// POST { message, name, email, website }   ("website" is a hidden honeypot field)
//   -> { ok: true }            stored, and sent to John Boy's GoHighLevel
//   -> { ok: false, error }    shown under the form
//
// The message is kept in Redis (list "ask:messages", newest first, read on /admin) and sent to John Boy's GoHighLevel
// inbound-webhook workflow (ASK_GHL_WEBHOOK_URL). That workflow creates the contact with the tag portfolio-ask, sends
// the visitor an instant confirmation and alerts John Boy. The homepage only shows this form when that URL is set, so a
// message never lands where nobody sees it.

export const runtime = "nodejs";

const PER_IP_PER_DAY = 5;
const MIN_MESSAGE = 10;
const MAX_MESSAGE = 2000;

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request) {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > 16_000) return json({ ok: false, error: "That message is too long. Please shorten it." }, 413);
  let body: { message?: unknown; name?: unknown; email?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Something went wrong. Please try again." }, 400);
  }

  // Bots fill every field; people never see this one. Pretend it worked.
  if (typeof body.website === "string" && body.website.trim()) return json({ ok: true });

  const message = typeof body.message === "string" ? body.message.replace(/\r/g, "").trim() : "";
  if (message.length < MIN_MESSAGE) return json({ ok: false, error: "Tell me a little more, one or two sentences is enough." }, 400);
  if (message.length > MAX_MESSAGE) return json({ ok: false, error: "That message is too long. Please shorten it." }, 400);

  const contact = checkContact(body.name, body.email);
  if (typeof contact === "string") return json({ ok: false, error: contact }, 400);

  const hook = process.env.ASK_GHL_WEBHOOK_URL;
  if (!hook) return json({ ok: false, error: "The form is offline right now. Email uix.johnboy@gmail.com instead." }, 503);

  const redis = getRedis();
  const day = new Date().toISOString().slice(0, 10);
  if (redis) {
    try {
      const ipKey = `ask:ip:${hashKey(clientIp(req))}:${day}`;
      const n = await redis.incr(ipKey);
      if (n === 1) await redis.expire(ipKey, 60 * 60 * 48);
      if (n > PER_IP_PER_DAY) return json({ ok: false, error: "Too many messages from this connection today. Email uix.johnboy@gmail.com instead." }, 429);
      await redis.lpush("ask:messages", JSON.stringify({ name: contact.name, email: contact.email, message, at: new Date().toISOString(), source: "homepage" }));
      await redis.ltrim("ask:messages", 0, 499);
    } catch (err) {
      console.error("[ask] redis failed", (err as Error).message);
    }
  }

  try {
    const [first, ...rest] = contact.name.split(" ");
    const r = await fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        first_name: first,
        last_name: rest.join(" "),
        full_name: contact.name,
        email: contact.email,
        message,
        source: "Portfolio homepage: Not on the list",
        tag: "portfolio-ask",
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) throw new Error(`GHL ${r.status}`);
  } catch (err) {
    // Stored in Redis already; John Boy still sees it on /admin. The visitor is told plainly.
    console.error("[ask] ghl failed", (err as Error).message);
    return json({ ok: true, note: "saved" });
  }
  return json({ ok: true });
}
