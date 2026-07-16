import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

const KEY = "availability_waitlist";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  await redis.sadd(KEY, email.trim().toLowerCase());
  return NextResponse.json({ ok: true });
}
