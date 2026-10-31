import { getRedis } from "@/lib/redis";
import { seedSandbox } from "./seed";
import type { Region, Sandbox } from "./types";

// One private sandbox per visitor, so nobody sees another visitor's changes.
// Upstash in production; an in-memory map when Redis is not configured
// (local development). Sandboxes expire after 48 hours of no use.

const TTL = 60 * 60 * 48;
// On globalThis because each route handler is its own module instance in
// development; a module-level Map would give every route a different store.
const g = globalThis as unknown as { __taplineMemory?: Map<string, Sandbox> };
const memory = (g.__taplineMemory ??= new Map<string, Sandbox>());
const key = (id: string) => `tapline:sb:${id}`;

export function newSandboxId() {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 14);
}

export function validId(id: string | null | undefined): id is string {
  return !!id && /^[a-z0-9]{8,20}$/.test(id);
}

export async function loadSandbox(id: string): Promise<Sandbox | null> {
  const redis = getRedis();
  if (!redis) return memory.get(id) ?? null;
  return (await redis.get<Sandbox>(key(id))) ?? null;
}

export async function saveSandbox(sb: Sandbox) {
  const redis = getRedis();
  if (!redis) {
    memory.set(sb.id, sb);
    return;
  }
  await redis.set(key(sb.id), sb, { ex: TTL });
}

export async function getOrCreate(id: string, region: Region = "AU"): Promise<Sandbox> {
  const existing = await loadSandbox(id);
  if (existing) return existing;
  const sb = seedSandbox(id, region);
  await saveSandbox(sb);
  return sb;
}

export async function resetSandbox(id: string, region: Region): Promise<Sandbox> {
  const sb = seedSandbox(id, region);
  await saveSandbox(sb);
  return sb;
}
