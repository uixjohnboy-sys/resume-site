import Anthropic from "@anthropic-ai/sdk";
import { cookies } from "next/headers";
import { runTurn, startConversation, MAX_CUSTOMER_MESSAGES, type CallModel, type ModelBlock } from "@/lib/deskhand/agent";
import { CARDS, freshConversation, seedSandbox, type CardId } from "@/lib/deskhand/seed";
import { DANGER_TEXT, isDanger } from "@/lib/deskhand/safety";
import { CAPS, allowMessage, allowRead, claimSandbox, freeLock, hasStore, loadSandbox, newId, priceOf, reserveCall, saveSandbox, settleCall, takeLock, validId } from "@/lib/deskhand/store";
import { network } from "@/lib/tapline/store";
import { clientIp, hashKey } from "@/lib/twin/gate";

// Deskhand demo API. The visitor's id is a server-issued, HttpOnly cookie, and history lives on the server, so the body only ever
// carries the customer's words.
//   GET                                   the sandbox
//   POST { start: "mia"|"tom"|"priya"|null }   a new conversation
//   POST { text }                          one customer message, answered as a stream of work-log events, then the reply
//   POST { reset: true }                   reseed the sandbox (message caps are not refilled)

export const runtime = "nodejs";
export const maxDuration = 25;

const MODEL = "claude-haiku-5-5";
const COOKIE = "deskhand";
const PAUSED = "This demo is paused for a moment. Please try again shortly.";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

async function sandboxId() {
  const jar = await cookies();
  const have = jar.get(COOKIE)?.value;
  if (validId(have)) return have;
  const id = newId();
  jar.set(COOKIE, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 48 });
  return id;
}

function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

/** Calls the model only inside the spend meter. Anything it cannot do becomes a throw, and the turn falls back to fixed rules. */
function modelFor(ipKey: string): CallModel | null {
  // Its own key in its own Console workspace with a monthly limit, so abuse of a public demo can't reach the other demos.
  // Falls back to the shared key until JB has set DESKHAND_ANTHROPIC_API_KEY in Vercel.
  const key = process.env.DESKHAND_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const client = new Anthropic({ apiKey: key, maxRetries: 0 });
  return async ({ system, messages, tools, timeoutMs }) => {
    if (!(await reserveCall(ipKey))) throw new Error("over cap");
    const started = Date.now();
    const call = (timeout: number) =>
      client.messages.create(
        {
          model: MODEL,
          max_tokens: 1500,
          output_config: { effort: "low" },
          system,
          messages: messages as Anthropic.MessageParam[],
          tools: tools.map((t) => ({ ...t, strict: true })) as unknown as Anthropic.ToolUnion[],
          tool_choice: tools.length ? { type: "auto", disable_parallel_tool_use: true } : undefined,
        },
        { timeout },
      );
    let res: Anthropic.Message;
    try {
      res = await call(timeoutMs);
    } catch (e) {
      // Busy or rate-limited is usually gone in a second: one retry while the turn still has time, then the fixed rules.
      // Only the status code is logged, never the request or the provider's message.
      const status = (e as { status?: number }).status ?? 0;
      console.warn(`deskhand model status ${status || "none"}`);
      const left = timeoutMs - (Date.now() - started) - 1200;
      // BUILD-ONLY DIAGNOSIS (remove before G4): the status travels as the error's message into the back-office log's code.
      if (![429, 500, 502, 503, 529].includes(status) || left < 4000) throw new Error(`status:${status || (e as Error).name || "none"}`);
      await new Promise((r) => setTimeout(r, 1200));
      try {
        res = await call(left);
      } catch (again) {
        throw new Error(`status:${(again as { status?: number }).status ?? "none"}:retried`);
      }
    }
    await settleCall(priceOf(res.usage.input_tokens, res.usage.output_tokens));
    return { content: res.content as unknown as ModelBlock[], stopReason: res.stop_reason };
  };
}

export async function GET(req: Request) {
  const ipKey = hashKey(network(clientIp(req)));
  if (!hasStore() || !(await allowRead(ipKey))) return json({ error: PAUSED }, 503);
  const id = await sandboxId();
  return json({ sb: await loadSandbox(id) });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Not allowed." }, 403);
  let body: { text?: unknown; start?: unknown; reset?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Please try again." }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Please try again." }, 400);
  const raw = typeof body.text === "string" ? body.text.normalize("NFKC").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim() : null;

  // The danger line never depends on the store, a cap or the model.
  if (raw && isDanger(raw) && !hasStore()) return json({ reply: DANGER_TEXT });
  if (!hasStore()) return json({ error: PAUSED }, 503);

  const id = await sandboxId();
  const ipKey = hashKey(network(clientIp(req)));
  const lock = await takeLock(id);
  if (!lock) return json({ error: "One moment, still working on your last message." }, 409);
  // The stream frees the lock when the turn ends. Every other way out frees it here (G3 QA, M1: an early return held it ~33 s).
  let streaming = false;

  try {
    const sb = await loadSandbox(id);
    const now = Date.now();

    if (body.reset === true) {
      const fresh = seedSandbox();
      await saveSandbox(id, fresh);
      return json({ sb: fresh });
    }
    if ("start" in body) {
      const card = typeof body.start === "string" && Object.hasOwn(CARDS, body.start) ? (body.start as CardId) : null;
      // A new customer on a fresh page: earlier contacts and visits stay, the conversation does not.
      sb.conv = freshConversation();
      startConversation(sb, card, now);
      await saveSandbox(id, sb);
      return json({ sb });
    }
    if (raw === null || !raw) return json({ error: "Please type a message." }, 400);
    if (raw.length > CAPS.messageChars) return json({ error: `Please keep it under ${CAPS.messageChars} characters.` }, 400);
    if (!sb.conv.contactId) startConversation(sb, null, now);

    const said = sb.conv.messages.filter((m) => m.from === "customer").length;
    if (said >= MAX_CUSTOMER_MESSAGES) {
      return json({ reply: "That's as long as this demo conversation goes. Press New customer or Reset to try another.", sb });
    }

    // Caps are checked for the model only: over a cap, the customer still gets the fixed rules, and is never told which cap.
    const claimed = await claimSandbox(id, ipKey);
    const allowed = claimed && (await allowMessage(id, ipKey));
    const callModel = allowed ? modelFor(ipKey) : null;
    // BUILD-ONLY DIAGNOSIS (remove before G4): which gate kept the model out.
    const pausedWhy = !claimed ? "cap:new-sandbox" : !allowed ? "cap:messages" : !callModel ? "no-key" : undefined;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        try {
          const result = await runTurn(sb, raw, { now, callModel, pausedWhy, onLog: (entry) => send("log", entry) });
          const saved = await saveSandbox(id, sb);
          send("done", saved ? { reply: result.reply, sb } : { error: PAUSED });
        } catch {
          // Never leak the cause: no provider error, cap, model or key reaches the page or the logs.
          send("done", { reply: "Sorry, something went wrong on my side. Please try that again." });
        } finally {
          await freeLock(id, lock);
          controller.close();
        }
      },
    });
    streaming = true;
    return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-store", "x-accel-buffering": "no" } });
  } catch {
    return json({ error: PAUSED }, 503);
  } finally {
    if (!streaming) await freeLock(id, lock);
  }
}
