import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getRedis } from "@/lib/redis";
import { load, validId } from "./store";
import type { Region } from "./types";

// A real signed webhook for the repairs desk: an HMAC-SHA256 signature over the timestamp and the exact body, a
// five-minute window against replayed copies, an atomic first-write check so an event is only ever applied once,
// and a failed-event log with retries. Everything is keyed by the visitor's sandbox and kept apart from it, because
// the sandbox goes to the browser and the signing secret must not. In-memory fallback for local development.

const TTL = 60 * 60 * 48;
const TOLERANCE_SECONDS = 300;
export const MAX_BODY = 8192;
const LOG_LENGTH = 30;

export type WebhookStatus = "delivered" | "duplicate" | "rejected" | "failed";
export type LogRow = { key: string; at: number; event: string; status: WebhookStatus; http: number; note: string; attempt: number };
export type Counts = { applied: number; duplicates: number; rejected: number; waiting: number };
export type SendKind = "send" | "replay" | "tamper" | "stale" | "outage" | "retry";
export const SEND_KINDS: ReadonlySet<string> = new Set<SendKind>(["send", "replay", "tamper", "stale", "outage", "retry"]);

type WebhookEvent = { id: string; sb: string; type: string; data: Record<string, string> };
type SendState = { last?: WebhookEvent; waiting: WebhookEvent[] };

const k = {
  secret: (id: string) => `tapline:wh:sec:${id}`,
  seen: (id: string, ev: string) => `tapline:wh:seen:${id}:${ev}`,
  log: (id: string) => `tapline:wh:log:${id}`,
  down: (id: string) => `tapline:wh:down:${id}`,
  state: (id: string) => `tapline:wh:st:${id}`,
  count: (id: string, name: string) => `tapline:wh:n:${id}:${name}`,
};

type Mem = { kv: Map<string, string>; lists: Map<string, string[]> };
const g = globalThis as unknown as { __taplineWebhookMem?: Mem };
const mem = (g.__taplineWebhookMem ??= { kv: new Map(), lists: new Map() });

async function getText(key: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return mem.kv.get(key) ?? null;
  const v = await redis.get<unknown>(key);
  if (v === null || v === undefined) return null;
  return typeof v === "string" ? v : JSON.stringify(v);
}
async function setText(key: string, value: string): Promise<void> {
  const redis = getRedis();
  if (!redis) mem.kv.set(key, value);
  else await redis.set(key, value, { ex: TTL });
}
/** True only for the first caller. This one atomic step is what makes "applied once" true under parallel retries. */
async function setFirst(key: string, value: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    if (mem.kv.has(key)) return false;
    mem.kv.set(key, value);
    return true;
  }
  return (await redis.set(key, value, { nx: true, ex: TTL })) === "OK";
}
async function drop(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) mem.kv.delete(key);
  else await redis.del(key);
}
async function bump(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    mem.kv.set(key, String(Number(mem.kv.get(key) ?? 0) + 1));
    return;
  }
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, TTL);
}
async function addLog(id: string, row: Omit<LogRow, "key">): Promise<void> {
  const full: LogRow = { ...row, key: randomBytes(6).toString("hex") };
  const redis = getRedis();
  if (!redis) {
    const list = mem.lists.get(k.log(id)) ?? [];
    mem.lists.set(k.log(id), [JSON.stringify(full), ...list].slice(0, LOG_LENGTH));
    return;
  }
  await redis.lpush(k.log(id), JSON.stringify(full));
  await redis.ltrim(k.log(id), 0, LOG_LENGTH - 1);
  await redis.expire(k.log(id), TTL);
}

export function sign(secret: string, timestamp: number, body: string): string {
  return `t=${timestamp},v1=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
}

function matches(secret: string, header: string, body: string): { ok: boolean; timestamp: number } {
  const m = /^t=(\d{10}),v1=([a-f0-9]{64})$/.exec(header);
  if (!m) return { ok: false, timestamp: 0 };
  const timestamp = Number(m[1]);
  const want = Buffer.from(sign(secret, timestamp, body).split("v1=")[1], "hex");
  const got = Buffer.from(m[2], "hex");
  return { ok: want.length === got.length && timingSafeEqual(want, got), timestamp };
}

function parseEvent(body: string): WebhookEvent | null {
  try {
    const e = JSON.parse(body) as WebhookEvent;
    if (!e || typeof e !== "object" || !validId(e.sb)) return null;
    if (typeof e.id !== "string" || !/^evt_[a-z0-9]{8,24}$/.test(e.id)) return null;
    if (typeof e.type !== "string" || e.type.length > 40) return null;
    return e;
  } catch {
    return null;
  }
}

export type Received = { http: number; status: WebhookStatus; note: string };

/** The receiver. The public endpoint and the demo's buttons both come through here, so the buttons prove the real checks. */
export async function receive(body: string, header: string, attempt = 1): Promise<Received> {
  const bad: Received = { http: 401, status: "rejected", note: "Rejected: the signature could not be checked." };
  const ev = parseEvent(body);
  if (!ev) return bad;
  const secret = await getText(k.secret(ev.sb));
  if (!secret) return bad;
  const at = Date.now();
  const finish = async (r: Received, counter?: string) => {
    if (counter) await bump(k.count(ev.sb, counter));
    await addLog(ev.sb, { at, event: ev.id, status: r.status, http: r.http, note: r.note, attempt });
    return r;
  };

  const check = matches(secret, header, body);
  if (!check.ok) return finish({ http: 401, status: "rejected", note: "Rejected: the signature does not match this body, so nothing was applied." }, "rejected");
  if (Math.abs(at / 1000 - check.timestamp) > TOLERANCE_SECONDS) {
    return finish({ http: 401, status: "rejected", note: "Rejected: a real signature, but older than five minutes, so a copied request can't be replayed." }, "rejected");
  }
  if (await getText(k.down(ev.sb))) return finish({ http: 503, status: "failed", note: "The receiver is down. The event is kept in the failed log for a retry." });
  if (!(await setFirst(k.seen(ev.sb, ev.id), String(at)))) {
    return finish({ http: 200, status: "duplicate", note: "Already applied, so nothing changed." }, "duplicates");
  }
  return finish({ http: 200, status: "delivered", note: "Signature checked and applied once." }, "applied");
}

async function secretFor(id: string): Promise<string> {
  await setFirst(k.secret(id), randomBytes(32).toString("hex"));
  return (await getText(k.secret(id))) ?? "";
}
async function readState(id: string): Promise<SendState> {
  const raw = await getText(k.state(id));
  if (!raw) return { waiting: [] };
  try {
    const s = JSON.parse(raw) as SendState;
    return { last: s.last, waiting: Array.isArray(s.waiting) ? s.waiting : [] };
  } catch {
    return { waiting: [] };
  }
}

async function newEvent(id: string, region: Region): Promise<WebhookEvent> {
  const { sb } = await load(id, region);
  const open = sb.jobs.filter((j) => j.stage !== "billed");
  const job = open[Math.floor(Math.random() * open.length)] ?? sb.jobs[0];
  return {
    id: `evt_${randomBytes(9).toString("hex")}`,
    sb: id,
    type: "repair.updated",
    data: { ref: job.ref, title: job.title, trade: job.trade, urgency: job.urgency, stage: job.stage },
  };
}

export type SendResult = Received & { signature: string; body: string; message?: string };

/** One press of a demo button: a signed request built here and passed through the real receiver. */
export async function send(id: string, region: Region, kind: SendKind): Promise<SendResult> {
  const secret = await secretFor(id);
  const state = await readState(id);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const none = (message: string): SendResult => ({ http: 200, status: "delivered", note: "", signature: "", body: "", message });
  const pass = async (ev: WebhookEvent, attempt = 1) => {
    const body = JSON.stringify(ev);
    const signature = sign(secret, nowSeconds, body);
    return { ...(await receive(body, signature, attempt)), signature, body };
  };

  if (kind === "retry") {
    await drop(k.down(id));
    const ev = state.waiting[0];
    if (!ev) return none("Nothing is waiting. The receiver is up.");
    const out = await pass(ev, 2);
    await setText(k.state(id), JSON.stringify({ last: ev, waiting: state.waiting.slice(1) }));
    return out;
  }
  if (kind === "replay") {
    if (!state.last) return none("Send an event first, then send it again.");
    return pass(state.last, 2);
  }
  if (kind === "tamper") {
    const ev = state.last ?? (await newEvent(id, region));
    const signature = sign(secret, nowSeconds, JSON.stringify(ev));
    const changed = JSON.stringify({ ...ev, data: { ...ev.data, urgency: ev.data.urgency === "urgent" ? "routine" : "urgent" } });
    return { ...(await receive(changed, signature)), signature, body: changed };
  }
  if (kind === "stale") {
    const ev = state.last ?? (await newEvent(id, region));
    const body = JSON.stringify(ev);
    const signature = sign(secret, nowSeconds - 3600, body);
    return { ...(await receive(body, signature)), signature, body };
  }

  if (kind === "outage") await setText(k.down(id), "1");
  const ev = await newEvent(id, region);
  const out = await pass(ev);
  await setText(k.state(id), JSON.stringify({ last: ev, waiting: out.status === "failed" ? [...state.waiting, ev].slice(-10) : state.waiting }));
  return out;
}

/** The log, newest first, and the running totals. */
export async function overview(id: string): Promise<{ log: LogRow[]; counts: Counts }> {
  const redis = getRedis();
  const raw: unknown[] = redis ? await redis.lrange(k.log(id), 0, LOG_LENGTH - 1) : (mem.lists.get(k.log(id)) ?? []);
  const log = raw.map((r) => (typeof r === "string" ? (JSON.parse(r) as LogRow) : (r as LogRow)));
  const n = async (name: string) => Number((await getText(k.count(id, name))) ?? 0);
  const state = await readState(id);
  return { log, counts: { applied: await n("applied"), duplicates: await n("duplicates"), rejected: await n("rejected"), waiting: state.waiting.length } };
}
