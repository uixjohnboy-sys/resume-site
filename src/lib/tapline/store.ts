import { getRedis } from "@/lib/redis";
import { seedSandbox } from "./seed";
import type { Region, Sandbox } from "./types";

// One private sandbox per visitor. Stored as JSON with a separate version
// number; every write is a compare-and-set (a small Lua script) and retries on
// conflict, so two devices acting at once never lose each other's changes.
// A sandbox is only saved on its first change: just looking at the demo
// stores nothing. Photos live under their own keys. In-memory fallback for
// local development (on globalThis, because dev route handlers are separate
// module instances).

const TTL = 60 * 60 * 48;
const MAX_BYTES = 450_000;
const NEW_PER_IP_PER_DAY = 30;
const PHOTOS_PER_SANDBOX = 12;

const k = {
  sb: (id: string) => `tapline:sb:${id}`,
  v: (id: string) => `tapline:sv:${id}`,
  photo: (id: string, ph: string) => `tapline:ph:${id}:${ph}`,
  photos: (id: string) => `tapline:pn:${id}`,
};

type Mem = { sb: Map<string, { sb: Sandbox; v: number }>; photo: Map<string, string>; counters: Map<string, number> };
const g = globalThis as unknown as { __taplineMem?: Mem };
const mem = (g.__taplineMem ??= { sb: new Map(), photo: new Map(), counters: new Map() });

export function validId(id: unknown): id is string {
  return typeof id === "string" && /^[a-z0-9]{8,20}$/.test(id);
}

export type Loaded = { sb: Sandbox; v: number; persisted: boolean };

/** The saved sandbox, or a fresh seed (not saved) when there is none yet. */
export async function load(id: string, region: Region = "AU"): Promise<Loaded> {
  const redis = getRedis();
  if (!redis) {
    const m = mem.sb.get(id);
    return m ? { sb: m.sb, v: m.v, persisted: true } : { sb: seedSandbox(id, region), v: 0, persisted: false };
  }
  const [sb, v] = await redis.mget<[Sandbox | null, number | string | null]>(k.sb(id), k.v(id));
  if (sb && v !== null) return { sb, v: Number(v), persisted: true };
  return { sb: seedSandbox(id, region), v: 0, persisted: false };
}

export async function version(id: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return mem.sb.get(id)?.v ?? 0;
  return Number((await redis.get<number | string>(k.v(id))) ?? 0);
}

const CAS = `
local cur = redis.call('GET', KEYS[2])
if (cur or '0') ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
redis.call('SET', KEYS[2], tostring(tonumber(ARGV[1]) + 1), 'EX', ARGV[3])
return 1`;

async function casSave(id: string, sb: Sandbox, expected: number): Promise<"ok" | "conflict" | "too-big"> {
  const json = JSON.stringify(sb);
  if (json.length > MAX_BYTES) return "too-big";
  const redis = getRedis();
  if (!redis) {
    const cur = mem.sb.get(id)?.v ?? 0;
    if (cur !== expected) return "conflict";
    mem.sb.set(id, { sb: structuredClone(sb), v: cur + 1 });
    return "ok";
  }
  const res = await redis.eval(CAS, [k.sb(id), k.v(id)], [String(expected), json, String(TTL)]);
  return Number(res) === 1 ? "ok" : "conflict";
}

/** Count against a daily limit. Fails CLOSED when Redis errors (returns false). */
export async function underLimit(key: string, max: number, seconds = 172800): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    const n = (mem.counters.get(key) ?? 0) + 1;
    mem.counters.set(key, n);
    return n <= max;
  }
  try {
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, seconds);
    return n <= max;
  } catch {
    return false;
  }
}

export type Mutation<T> = (loaded: Loaded) => { ok: true; sb: Sandbox; out?: T } | { ok: false; error: string; status?: number };

/**
 * Load, change and save with a version check, retrying on conflict so
 * concurrent writes are never lost. `ipKey` limits how many NEW sandboxes one
 * connection may create per day.
 */
export async function mutate<T>(id: string, region: Region, ipKey: string, fn: Mutation<T>): Promise<{ ok: true; sb: Sandbox; v: number; out?: T } | { ok: false; error: string; status: number }> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const loaded = await load(id, region);
    if (!loaded.persisted && attempt === 0) {
      const day = new Date().toISOString().slice(0, 10);
      if (!(await underLimit(`tapline:new:${ipKey}:${day}`, NEW_PER_IP_PER_DAY))) {
        return { ok: false, error: "You've started a lot of demos today. Please come back tomorrow, or reuse the one you have.", status: 429 };
      }
    }
    const r = fn(loaded);
    if (!r.ok) return { ok: false, error: r.error, status: r.status ?? 409 };
    const saved = await casSave(id, r.sb, loaded.v);
    if (saved === "ok") return { ok: true, sb: r.sb, v: loaded.v + 1, out: r.out };
    if (saved === "too-big") return { ok: false, error: "This demo is full. Use Reset demo to start again.", status: 413 };
    await new Promise((res) => setTimeout(res, 40 + Math.random() * 120));
  }
  return { ok: false, error: "Lots of changes at once. Please try again.", status: 409 };
}

export async function reset(id: string, region: Region, ipKey: string) {
  return mutate(id, region, ipKey, () => ({ ok: true, sb: seedSandbox(id, region) }));
}

// ---------- photos ----------

const JPEG = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/;

/** Checks a small browser-made JPEG (size, base64, JPEG magic bytes and dimensions) and stores it. */
export async function putPhoto(id: string, dataUrl: unknown): Promise<string | { error: string }> {
  if (typeof dataUrl !== "string" || dataUrl.length > 100_000) return { error: "That photo is too large. Try another one." };
  const m = JPEG.exec(dataUrl);
  if (!m) return { error: "Please send the photo as a JPEG." };
  const bytes = Buffer.from(m[1], "base64");
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return { error: "Please send the photo as a JPEG." };
  const dims = jpegSize(bytes);
  if (!dims || dims.w > 1600 || dims.h > 1600 || dims.w < 16 || dims.h < 16) return { error: "That photo's size isn't supported. Try another one." };
  if (!(await underLimit(k.photos(id), PHOTOS_PER_SANDBOX, 172800))) return { error: "This demo already has the most photos it can hold." };
  const ph = "ph" + Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(36)).join("").slice(0, 12);
  const redis = getRedis();
  if (!redis) mem.photo.set(k.photo(id, ph), dataUrl);
  else await redis.set(k.photo(id, ph), dataUrl, { ex: TTL });
  return ph;
}

export async function getPhoto(id: string, ph: string): Promise<string | null> {
  if (!/^ph[a-z0-9]{6,20}$/.test(ph)) return null;
  const redis = getRedis();
  if (!redis) return mem.photo.get(k.photo(id, ph)) ?? null;
  return (await redis.get<string>(k.photo(id, ph))) ?? null;
}

/** Width and height from a JPEG's SOF marker, without decoding it. */
function jpegSize(b: Buffer): { w: number; h: number } | null {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}
