import { randomBytes } from "node:crypto";
import { getRedis } from "../redis.ts";
import { seedSandbox } from "./seed.ts";
import type { Sandbox } from "./types.ts";

// One private sandbox per visitor, under a server-issued id in an HttpOnly cookie. Caps fail closed: in production, no Redis or a
// Redis error means no model call. Spend is reserved before each model call and settled after, so concurrent turns cannot overshoot.
// In-memory fallback only for local development, on globalThis because dev route handlers are separate module instances.

const TTL = 60 * 60 * 48;
const MAX_BYTES = 60_000;
const PREFIX = "deskhand";
const today = () => new Date().toISOString().slice(0, 10);

export const CAPS = {
  messageChars: 500,
  conversationMessages: 16,
  sandboxMessages: 30,
  // Review budget while the build is tested from one address. These return to 40, 120 and 10 the day G4 closes (sandboxes were 200, now 400 after evals spent the day).
  ipMessages: 4000,
  ipModelCalls: 8000,
  ipSandboxes: 1000,
  // Also review budget while the evals run. Back to 300 the day G4 closes. The spend meter below still holds the day to $2.
  // 2026-11-07: a full G3 day (two reviewers, rechecks, evals, safety) spent 1500 by mid-afternoon.
  siteMessages: 4000,
  // Review budget too: back to 1000 when G4 closes. The $2 meter below is still the real ceiling on spend.
  siteModelCalls: 8000,
  // Review budget: back to 150 when G4 closes. Today's evals spent the 150, which left real visitors on the fixed rules.
  siteSandboxes: 1000,
  // Review budget too: back to 600 the day G4 closes (eight reviewers on one network spent 600 page loads on 2026-11-07).
  ipReads: 20000,
  siteMicrodollars: 2_000_000,
};

// Haiku 5.5, per million tokens. An assumption from the API reference, to be checked against the pricing page before G4.
const INPUT_PER_M = 0.1;
const OUTPUT_PER_M = 0.5;
export const WORST_CALL_MICRODOLLARS = Math.ceil(12_000 * INPUT_PER_M + 1_500 * OUTPUT_PER_M);
export const priceOf = (input: number, output: number) => Math.ceil(input * INPUT_PER_M + output * OUTPUT_PER_M);

type Mem = { sb: Map<string, Sandbox>; counters: Map<string, number> };
const g = globalThis as unknown as { __deskhandMem?: Mem };
const mem = (g.__deskhandMem ??= { sb: new Map(), counters: new Map() });

/** Local development has no Redis and that is fine. Production without it is paused. */
export const hasStore = () => Boolean(getRedis()) || process.env.NODE_ENV !== "production";

export const newId = () => randomBytes(16).toString("hex");
export const validId = (id: unknown): id is string => typeof id === "string" && /^[a-f0-9]{32}$/.test(id);

async function bump(key: string, by: number, seconds: number): Promise<number | null> {
  const redis = getRedis();
  if (!redis) {
    if (process.env.NODE_ENV === "production") return null;
    const n = (mem.counters.get(key) ?? 0) + by;
    mem.counters.set(key, n);
    return n;
  }
  try {
    const n = await redis.incrby(key, by);
    if (n === by) await redis.expire(key, seconds);
    return n;
  } catch {
    return null;
  }
}

async function under(key: string, max: number, by = 1, seconds = 172800) {
  const n = await bump(key, by, seconds);
  return n !== null && n <= max;
}

export async function loadSandbox(id: string): Promise<Sandbox> {
  const redis = getRedis();
  if (!redis) return structuredClone(mem.sb.get(id) ?? seedSandbox());
  const sb = await redis.get<Sandbox>(`${PREFIX}:sb:${id}`);
  // A sandbox saved by an older build has an older shape. It holds nothing worth keeping, so it starts fresh.
  return sb && typeof sb.convNo === "number" ? sb : seedSandbox();
}

export async function saveSandbox(id: string, sb: Sandbox): Promise<boolean> {
  // The log is what grows: trim the oldest entries rather than fail a booking.
  while (Buffer.byteLength(JSON.stringify(sb), "utf8") > MAX_BYTES && sb.log.length > 40) sb.log.splice(0, 10);
  const redis = getRedis();
  if (!redis) {
    mem.sb.set(id, structuredClone(sb));
    return true;
  }
  try {
    // The sandbox dies 48 hours after it was first claimed, however often it is saved, so "deleted within 48 hours" stays true
    // (G4 Security, M4). The claim is always taken before the first save; a sandbox with no claim is never written.
    const left = await redis.ttl(`${PREFIX}:claimed:${id}`);
    if (left <= 0) return false;
    await redis.set(`${PREFIX}:sb:${id}`, sb, { ex: left });
    return true;
  } catch {
    return false;
  }
}

/** One turn at a time per sandbox. The token means a slow turn can only free its own lock. */
export async function takeLock(id: string, seconds = 30): Promise<string | null> {
  const token = randomBytes(8).toString("hex");
  const redis = getRedis();
  const key = `${PREFIX}:lock:${id}`;
  if (!redis) {
    if (process.env.NODE_ENV === "production") return null;
    if (mem.counters.get(key)) return null;
    mem.counters.set(key, 1);
    return token;
  }
  try {
    const ok = await redis.set(key, token, { nx: true, ex: seconds });
    return ok ? token : null;
  } catch {
    return null;
  }
}
export async function freeLock(id: string, token: string) {
  const redis = getRedis();
  const key = `${PREFIX}:lock:${id}`;
  if (!redis) {
    mem.counters.delete(key);
    return;
  }
  try {
    await redis.eval(`if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0`, [key], [token]);
  } catch {}
}

/** Counts a message against the sandbox, network and site. False means this message gets no model call. */
export async function allowMessage(id: string, ipKey: string) {
  const d = today();
  return (
    (await under(`${PREFIX}:msg:sb:${id}`, CAPS.sandboxMessages)) &&
    (await under(`${PREFIX}:msg:ip:${ipKey}:${d}`, CAPS.ipMessages)) &&
    (await under(`${PREFIX}:msg:site:${d}`, CAPS.siteMessages))
  );
}

/**
 * Claimed once, before anything is saved for a new id: a start, a reset or a message. Over the new-sandbox caps nothing is claimed,
 * so the next request is checked again, and nothing is saved (G4 Security, M2 and M3: start and reset used to save unclaimed, and
 * a failed claim used to stay claimed).
 */
export async function claimSandbox(id: string, ipKey: string) {
  const redis = getRedis();
  const seen = `${PREFIX}:claimed:${id}`;
  if (redis) {
    try {
      if (await redis.exists(seen)) return true;
    } catch {
      return false;
    }
  } else {
    if (process.env.NODE_ENV === "production") return false;
    if (mem.counters.get(seen)) return true;
  }
  const d = today();
  const ok = (await under(`${PREFIX}:new:ip:${ipKey}:${d}`, CAPS.ipSandboxes)) && (await under(`${PREFIX}:new:site:${d}`, CAPS.siteSandboxes));
  if (!ok) return false;
  if (!redis) {
    mem.counters.set(seen, 1);
    return true;
  }
  try {
    // Two first requests at once both count; that only ever errs on the strict side.
    await redis.set(seen, 1, { nx: true, ex: TTL });
    return true;
  } catch {
    return false;
  }
}

export async function allowRead(ipKey: string) {
  return under(`${PREFIX}:read:ip:${ipKey}:${today()}`, CAPS.ipReads);
}

/** Reserves the worst case for one model call. False means no call. */
export async function reserveCall(ipKey: string) {
  const d = today();
  if (!(await under(`${PREFIX}:call:ip:${ipKey}:${d}`, CAPS.ipModelCalls))) return false;
  if (!(await under(`${PREFIX}:call:site:${d}`, CAPS.siteModelCalls))) return false;
  return under(`${PREFIX}:usd:${d}`, CAPS.siteMicrodollars, WORST_CALL_MICRODOLLARS);
}
export async function settleCall(actualMicrodollars: number) {
  await bump(`${PREFIX}:usd:${today()}`, actualMicrodollars - WORST_CALL_MICRODOLLARS, 172800);
}
