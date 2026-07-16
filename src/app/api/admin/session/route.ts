import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("jb_admin")?.value;
  const authed = Boolean(cookie && cookie === process.env.ADMIN_PASSWORD);
  return NextResponse.json({ authed });
}
