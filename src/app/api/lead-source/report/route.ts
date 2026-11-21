import { CACHE_SECONDS, RATE_WINDOW_LABEL } from "@/lib/leadsource/config";
import { fillerBookings, simulatedBooking } from "@/lib/leadsource/fixture";
import { isChannel } from "@/lib/leadsource/links";
import { selectProvider } from "@/lib/leadsource/provider";
import { publicRef } from "@/lib/leadsource/public";
import { buildReport } from "@/lib/leadsource/report";
import { allowRequest, getBookings } from "@/lib/leadsource/store";
import { network } from "@/lib/tapline/store";
import { clientIp, hashKey } from "@/lib/twin/gate";

// Lead-source tracker demo report.
//   GET ?ref=ref-XXXX     the public report, plus whether that test code has landed ("yours")
// Fixture mode only (ignored when the live GoHighLevel token is set):
//   &sim=fb|ig|google|plain&ago=<seconds since the click>   simulate the visitor's own booking
//   &fx=stale|error|empty|limited|slow|pushed|nobooking      QA scenarios for every report state
// The response holds labels only: no names, emails, phones, appointment times or timestamps.

export const runtime = "nodejs";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

const FX = new Set(["stale", "error", "empty", "limited", "slow", "pushed", "nobooking"]);
const ERROR = { error: "unavailable" };

export async function GET(req: Request) {
  const u = new URL(req.url);
  const now = Date.now();
  const provider = selectProvider();
  const fixture = provider.mode === "fixture";
  const fxRaw = u.searchParams.get("fx") ?? "";
  const fx = fixture && FX.has(fxRaw) ? fxRaw : "";

  if (fx === "limited" || !(await allowRequest(hashKey(network(clientIp(req))), now))) {
    return json({ limited: true, window: RATE_WINDOW_LABEL }, 429);
  }
  if (fx === "error") return json(ERROR, 503);
  if (fx === "slow") await new Promise((r) => setTimeout(r, 2500));

  const got = await getBookings(provider, now);
  if (!got.ok) return json(ERROR, 503);

  const ref = publicRef(u.searchParams.get("ref") ?? "");
  let bookings = got.data.bookings;
  let stale = got.stale;
  let updatedAt = got.data.at;

  if (fixture) {
    if (fx === "empty") bookings = [];
    const sim = u.searchParams.get("sim");
    const ago = Number(u.searchParams.get("ago"));
    if (fx !== "nobooking" && fx !== "empty" && isChannel(sim) && Number.isInteger(ago) && ago >= 0 && ago <= 86400 * 30) {
      // "pushed": the visitor's booking is an hour old, so the ten newer filler bookings push it out of the latest 10.
      const mine = simulatedBooking(sim, sim === "plain" ? "" : ref, fx === "pushed" ? Math.max(ago, 3600) : ago, now);
      if (mine) bookings = [...bookings, mine];
      if (mine && fx === "pushed") bookings = [...bookings, ...fillerBookings(now)];
    }
    if (fx === "stale") {
      stale = true;
      updatedAt = now - 10 * CACHE_SECONDS * 1000;
    }
  }

  return json(buildReport(bookings, { now, updatedAt, stale, mode: provider.mode, ref }));
}
