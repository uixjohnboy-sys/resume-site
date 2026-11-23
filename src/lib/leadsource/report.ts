import { CACHE_WINDOW_LABEL, LATEST_MAX, WINDOW_DAYS } from "./config.ts";
import { FIXED_ROWS, OPTIONAL_ROWS, reportRow } from "./normalise.ts";
import { brisbaneStamp, brisbaneTime, publicRef } from "./public.ts";
import type { Booking, Counts, PublicBooking, PublicReport, PublicRow, RowName, Yours } from "./types.ts";

// Builds the public report from projected bookings (DESIGN 5.2 to 5.4). Counts only, no percentages.

const zero = (): Counts => ({ booked: 0, upcoming: 0, attended: 0, noShow: 0, cancelled: 0 });

function add(c: Counts, b: Booking) {
  c.booked++;
  if (b.stage === "Upcoming") c.upcoming++;
  else if (b.stage === "Attended") c.attended++;
  else if (b.stage === "No-show") c.noShow++;
  else c.cancelled++;
}

/** Bookings the report counts: the last 4 weeks, plus the labelled seed whatever its age. */
export function inWindow(bookings: readonly Booking[], now: number): Booking[] {
  const from = now - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return bookings.filter((b) => b.seed || b.bookedAt >= from);
}

export function buildReport(
  bookings: readonly Booking[],
  opts: { now: number; updatedAt: number; stale: boolean; mode: "fixture" | "live"; ref?: string },
): PublicReport {
  const counted = inWindow(bookings, opts.now).sort((a, b) => (b.sortAt ?? b.bookedAt) - (a.sortAt ?? a.bookedAt) || a.ref.localeCompare(b.ref));
  const by = new Map<RowName, Counts>();
  const total = zero();
  for (const b of counted) {
    const row = reportRow(b.source, b.medium);
    if (!by.has(row)) by.set(row, zero());
    add(by.get(row)!, b);
    add(total, b);
  }
  const rows: PublicRow[] = [
    ...FIXED_ROWS.map((name) => ({ name, ...(by.get(name) ?? zero()) })),
    ...OPTIONAL_ROWS.filter((name) => (by.get(name)?.booked ?? 0) > 0).map((name) => ({ name, ...by.get(name)! })),
  ];

  const ref = publicRef(opts.ref ?? "");
  const latestRaw = counted.slice(0, LATEST_MAX);
  const latest: PublicBooking[] = latestRaw.map((b) => ({
    code: b.ref || "No code",
    source: b.source,
    medium: b.medium,
    campaign: b.campaign,
    stage: b.stage,
    bookedAt: brisbaneStamp(b.bookedAt),
    seed: b.seed,
    ...(ref && b.ref === ref ? { yours: true } : {}),
  }));

  let yours: Yours | undefined;
  if (ref) {
    const mine = counted.find((b) => b.ref === ref);
    yours = mine
      ? { found: true, inLatest: latestRaw.includes(mine), source: mine.source, medium: mine.medium, campaign: mine.campaign }
      : { found: false };
  }

  return {
    mode: opts.mode,
    updated: brisbaneTime(opts.updatedAt),
    cacheWindow: CACHE_WINDOW_LABEL,
    stale: opts.stale,
    rows,
    total: { name: "Total", ...total },
    latest,
    ...(yours ? { yours } : {}),
  };
}
