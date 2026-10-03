import { getRedis } from "@/lib/redis";
import { checkContact, clientIp, hashKey, issuePass } from "@/lib/twin/gate";

// Step one of the AI twin chat: the visitor's name and email.
//
// POST { name, email, website }   ("website" is a hidden honeypot field)
//   -> { ok: true, pass, name }   pass goes on every /api/twin request
//   -> { ok: false, error }       shown under the form
//
// The lead is kept in Redis (list "twin:leads", newest first, read on
// /admin) and, when GHL_TWIN_WEBHOOK_URL is set, also sent to John Boy's
// GoHighLevel inbound-webhook workflow so it lands as a contact. A failed
// GoHighLevel call never blocks the visitor.

export const runtime = "nodejs";

const LEADS_PER_IP_PER_DAY = 5;

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request) {
  let body: { name?: unknown; email?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Something went wrong. Please try again." }, 400);
  }

  // Bots fill every field; people never see this one. Pretend it worked.
  if (typeof body.website === "string" && body.website.trim()) {
    return json({ ok: true, pass: "", name: "" });
  }

  const contact = checkContact(body.name, body.email);
  if (typeof contact === "string") return json({ ok: false, error: contact }, 400);

  const pass = issuePass(contact.email);
  if (!pass) {
    console.error("[twin/lead] no TWIN_TOKEN_SECRET or ADMIN_PASSWORD set");
    return json({ ok: false, error: "The chat is offline right now. Email uix.johnboy@gmail.com instead." }, 503);
  }

  const redis = getRedis();
  const day = new Date().toISOString().slice(0, 10);
  if (redis) {
    try {
      const ipKey = `twin:leadip:${hashKey(clientIp(req))}:${day}`;
      const n = await redis.incr(ipKey);
      if (n === 1) await redis.expire(ipKey, 60 * 60 * 48);
      if (n > LEADS_PER_IP_PER_DAY) {
        return json({ ok: false, error: "Too many sign-ins from this connection today. Email uix.johnboy@gmail.com instead." }, 429);
      }
      const record = { name: contact.name, email: contact.email, at: new Date().toISOString(), source: "v3 AI twin" };
      await redis.lpush("twin:leads", JSON.stringify(record));
      await redis.ltrim("twin:leads", 0, 499);
    } catch (err) {
      console.error("[twin/lead] redis failed", err);
    }
  }

  const hook = process.env.GHL_TWIN_WEBHOOK_URL;
  if (hook) {
    try {
      const [first, ...rest] = contact.name.split(" ");
      await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          first_name: first,
          last_name: rest.join(" "),
          full_name: contact.name,
          email: contact.email,
          source: "Portfolio AI twin",
          tag: "portfolio-ai-chat",
        }),
        signal: AbortSignal.timeout(4000),
      });
    } catch (err) {
      console.error("[twin/lead] GoHighLevel webhook failed", err);
    }
  }

  return json({ ok: true, pass, name: contact.name.split(" ")[0] });
}
