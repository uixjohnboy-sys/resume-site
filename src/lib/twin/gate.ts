import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// The contact gate in front of the AI twin (JB's call, 2026-10-03: get a
// name and email before anyone can spend money on the chat).
//
// /api/twin/lead checks the details and hands back a signed pass; /api/twin
// refuses any question without one. The pass is "<email b64url>.<expiry>.
// <hmac>", valid 24 hours, so caps can be counted per email as well as per
// connection, and nobody can mint one without the server secret.

const DAY_MS = 24 * 60 * 60 * 1000;

function secret() {
  const s = process.env.TWIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD;
  if (s) return s;
  if (process.env.NODE_ENV !== "production") return "dev-only-twin-secret";
  return null;
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString("utf8");

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function issuePass(email: string): string | null {
  const key = secret();
  if (!key) return null;
  const payload = `${b64(email)}.${Date.now() + DAY_MS}`;
  return `${payload}.${sign(payload, key)}`;
}

// Returns the email the pass was issued to, or null if it is forged,
// malformed or expired.
export function readPass(pass: string | null | undefined): string | null {
  const key = secret();
  if (!key || !pass) return null;
  const parts = pass.split(".");
  if (parts.length !== 3) return null;
  const [e, exp, sig] = parts;
  const want = Buffer.from(sign(`${e}.${exp}`, key));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return null;
  try {
    return unb64(e);
  } catch {
    return null;
  }
}

// A stable, non-reversible key for counters (raw emails and IPs are never
// used as Redis keys).
export function hashKey(value: string) {
  const salt = process.env.ADMIN_PASSWORD || "twin";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 24);
}

export function clientIp(req: Request) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

// Throwaway inboxes and placeholder domains: someone using these is not a
// prospect, they are spending his money.
const BLOCKED = new Set([
  "example.com",
  "example.org",
  "test.com",
  "mailinator.com",
  "guerrillamail.com",
  "sharklasers.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "tempmail.dev",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
  "throwawaymail.com",
  "mintemail.com",
  "emailondeck.com",
  "moakt.com",
  "mohmal.com",
]);

export function checkContact(nameRaw: unknown, emailRaw: unknown): { name: string; email: string } | string {
  const name = typeof nameRaw === "string" ? nameRaw.trim().replace(/\s+/g, " ") : "";
  const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
  if (name.length < 2 || name.length > 80) return "Please enter your name.";
  if (!EMAIL.test(email) || email.length > 120) return "Please enter a valid email address.";
  const domain = email.split("@")[1];
  if (BLOCKED.has(domain)) return "Please use your real email so John Boy can reply.";
  return { name, email };
}
