import { getRedis } from "../redis.ts";
import { CACHE_SECONDS, RATE_MAX, RATE_WINDOW_SECONDS } from "./config.ts";
import type { Booking, Provider } from "./types.ts";

// One shared cache window for the whole site (SPEC 6.3): GoHighLevel is called at most once per window whatever the
// traffic, because only the request that wins a short lock refreshes; everyone else reads the cached copy. Only the
// projected bookings are cached. On a GoHighLevel error the last good copy is served, marked stale, and the lock keeps
// the next attempt one window away. Upstash Redis when configured, memory otherwise (local dev, one instance).

export type Cached = { at: number; bookings: Booking[] };
export type Got = { ok: true; data: Cached; stale: boolean } | { ok: false };

const LAST_GOOD_TTL = 60 * 60 * 24 * 7;
const MAX_BOOKINGS = 500;
const key = (mode: string) => ({ cache: `leadsource:cache:${mode}`, lock: `leadsource:lock:${mode}` });

type Mem = { cache: Map<string, Cached>; locks: Map<string, number>; counters: Map<string, { n: number; until: number }> };
const g = globalThis as unknown as { __leadsourceMem?: Mem };
const mem = (g.__leadsourceMem ??= { cache: new Map(), locks: new Map(), counters: new Map() });

/** Test hook: forget the in-memory cache, locks and counters. */
export function resetMemory() {
  mem.cache.clear();
  mem.locks.clear();
  mem.counters.clear();
}

async function readCache(mode: string): Promise<Cached | null> {
  const redis = getRedis();
  if (!redis) return mem.cache.get(key(mode).cache) ?? null;
  return (await redis.get<Cached>(key(mode).cache)) ?? null;
}

async function writeCache(mode: string, c: Cached) {
  const redis = getRedis();
  if (!redis) {
    mem.cache.set(key(mode).cache, c);
    return;
  }
  await redis.set(key(mode).cache, c, { ex: LAST_GOOD_TTL });
}

async function takeLock(mode: string, now: number): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    const until = mem.locks.get(key(mode).lock) ?? 0;
    if (until > now) return false;
    mem.locks.set(key(mode).lock, now + CACHE_SECONDS * 1000);
    return true;
  }
  return (await redis.set(key(mode).lock, "1", { nx: true, ex: CACHE_SECONDS })) === "OK";
}

// The refresh this instance is running, so parallel requests on one instance wait for it instead of failing.
const inflight = new Map<string, Promise<Got>>();
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function refresh(provider: Provider, now: number, cached: Cached | null): Promise<Got> {
  try {
    const bookings = (await provider.list(now)).slice(0, MAX_BOOKINGS);
    const fresh = { at: now, bookings };
    await writeCache(provider.mode, fresh);
    return { ok: true, data: fresh, stale: false };
  } catch (e) {
    // The reason only (an HTTP status or a config word). Never the response body, never the token.
    const reason = e && typeof e === "object" && "reason" in e ? String((e as { reason: unknown }).reason) : "error";
    console.warn(`lead-source: refresh failed (${reason})`);
    return cached ? { ok: true, data: cached, stale: true } : { ok: false };
  }
}

/** The report data: fresh from the cache, refreshed by this request if it wins the lock, or the last good copy. */
export async function getBookings(provider: Provider, now: number): Promise<Got> {
  try {
    const cached = await readCache(provider.mode);
    if (cached && now - cached.at < CACHE_SECONDS * 1000) return { ok: true, data: cached, stale: false };
    const running = inflight.get(provider.mode);
    if (running) return await running;
    if (await takeLock(provider.mode, now)) {
      const p = refresh(provider, now, cached).finally(() => inflight.delete(provider.mode));
      inflight.set(provider.mode, p);
      return await p;
    }
    // Another instance is refreshing (or its refresh just failed). Serve what there is.
    if (cached) return { ok: true, data: cached, stale: now - cached.at > 2 * CACHE_SECONDS * 1000 };
    // Nothing cached yet (a cold start): give the other instance a moment to write its copy.
    for (let i = 0; i < 4; i++) {
      await pause(400);
      const c = await readCache(provider.mode);
      if (c) return { ok: true, data: c, stale: false };
    }
    return { ok: false };
  } catch {
    console.warn("lead-source: cache unavailable");
    return { ok: false };
  }
}

/** Per-connection limit, fixed window. Fails CLOSED when Redis errors, like every cap on the site's demos. */
export async function allowRequest(ipKey: string, now: number): Promise<boolean> {
  const win = Math.floor(now / (RATE_WINDOW_SECONDS * 1000));
  const k = `leadsource:rl:${ipKey}:${win}`;
  const redis = getRedis();
  if (!redis) {
    const c = mem.counters.get(k);
    const n = (c?.n ?? 0) + 1;
    mem.counters.set(k, { n, until: (win + 1) * RATE_WINDOW_SECONDS * 1000 });
    if (mem.counters.size > 5000) for (const [kk, v] of mem.counters) if (v.until <= now) mem.counters.delete(kk);
    return n <= RATE_MAX;
  }
  try {
    const n = await redis.incr(k);
    if (n === 1) await redis.expire(k, RATE_WINDOW_SECONDS);
    return n <= RATE_MAX;
  } catch {
    return false;
  }
}
