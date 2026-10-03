import { NextRequest } from "next/server";
import { getRedis } from "@/lib/redis";
import { hashKey } from "@/lib/twin/gate";

// Admin only: the people who signed in to the AI twin chat, newest first,
// each with the questions they asked. Read by /admin.

export const runtime = "nodejs";

type Lead = { name: string; email: string; at: string; source?: string };

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("jb_admin")?.value;
  if (!cookie || cookie !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const redis = getRedis();
  if (!redis) return Response.json({ leads: [], configured: false });

  const raw = await redis.lrange<Lead | string>("twin:leads", 0, 99);
  const leads = raw.map((r) => (typeof r === "string" ? (JSON.parse(r) as Lead) : r));

  // One row per email (they may sign in again on another day), keeping the
  // latest sign-in, with their questions attached.
  const seen = new Map<string, Lead>();
  for (const l of leads) if (!seen.has(l.email)) seen.set(l.email, l);
  const rows = await Promise.all(
    [...seen.values()].map(async (l) => {
      const qs = await redis.lrange<{ q: string; at: string } | string>(`twin:q:${hashKey(l.email)}`, 0, 19);
      return { ...l, questions: qs.map((q) => (typeof q === "string" ? JSON.parse(q) : q)) };
    })
  );
  return Response.json({ leads: rows, configured: true }, { headers: { "cache-control": "no-store" } });
}
