import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

const KEY = "availability_status";

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ available: true, configured: false });
  }
  const status = await redis.get<string>(KEY);
  return NextResponse.json({ available: status !== "unavailable", configured: true });
}

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("jb_admin")?.value;
  if (!cookie || cookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  const { available } = await req.json();
  await redis.set(KEY, available ? "available" : "unavailable");
  return NextResponse.json({ available: Boolean(available) });
}
