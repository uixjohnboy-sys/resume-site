"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CACHE_WINDOW_LABEL, MEASURED, POLL_WAITING_SECONDS, PROVISIONAL_LAG_SECONDS, RATE_WINDOW_SECONDS } from "@/lib/leadsource/config";
import type { PublicBooking, PublicReport, PublicRow } from "@/lib/leadsource/types";
import { getCode, parseVisitor, readClick, serverSnapshot, subscribe, visitorSnapshot } from "./visitor";

// 02 The live report (DESIGN 5). The "Your booking" box sits in a role=status container that is in the page from the
// first render and is only ever filled in place. Checking runs only while the visitor's booking is awaited, and stops
// at Found, at Still waiting (3 times the lag) and on the plain-link state. The tables and the "Updated" line are not
// live regions. No state change moves focus; only "Jump to it" does, on click.

type Status = "loading" | "ok" | "error";
type Mine = "none" | "pending" | "plain" | "waiting" | "found" | "still";

const FIXED = ["Facebook ads", "Instagram ads", "Google Ads", "Unknown"];
const lag = MEASURED.lagSeconds ?? PROVISIONAL_LAG_SECONDS;

const fxParam = () => {
  try {
    const fx = new URLSearchParams(window.location.search).get("fx") ?? "";
    return /^[a-z]{3,12}$/.test(fx) ? fx : "";
  } catch {
    return "";
  }
};

export default function Report() {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<PublicReport | null>(null);
  const [clientStale, setClientStale] = useState(false);
  const [limited, setLimited] = useState<string | null>(null);
  const v = parseVisitor(useSyncExternalStore(subscribe, visitorSnapshot, serverSnapshot));
  const click = v.click;
  // The code to look for is the one the clicked link carried; the page may already show the next one (G3 v1 QA M1).
  const code = click?.code || v.code;
  // Checking runs for 3 times the lag. It starts at this page load when the click is recent (the visitor still had to
  // pick a time and fill the form, G3 v1 QA R1), at the click itself when it is older than 30 minutes (an old click does
  // not start a new wait on a later visit), or at a Try again, whichever is latest.
  const [loadedAt] = useState(() => Date.now());
  const [startedAt, setStartedAt] = useState(0);
  const RECENT_MS = 30 * 60 * 1000;
  const from = click ? (loadedAt - click.at < RECENT_MS ? Math.max(loadedAt, click.at) : click.at) : 0;
  const deadline = Math.max(from, startedAt) + 3 * lag * 1000;
  const [nowTick, setNowTick] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);
  const lastShowLoad = useRef(0);
  const dataRef = useRef<PublicReport | null>(null);

  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const failed = () => {
      if (dataRef.current) setClientStale(true);
      else setStatus("error");
    };
    const c = readClick();
    const ref = (c && c.code) || getCode();
    const q = new URLSearchParams({ ref });
    if (c) {
      q.set("sim", c.ch);
      q.set("ago", String(Math.max(0, Math.floor((Date.now() - c.at) / 1000))));
    }
    const fx = fxParam();
    if (fx) q.set("fx", fx);
    try {
      const r = await fetch(`/api/lead-source/report?${q}`, { cache: "no-store" });
      if (r.status === 429) {
        const d = (await r.json().catch(() => ({}))) as { window?: string };
        setLimited(typeof d.window === "string" ? d.window : "a few minutes");
      } else if (!r.ok) {
        // Keep what is on screen if there is anything; otherwise the error state.
        failed();
      } else {
        const d = (await r.json()) as PublicReport;
        dataRef.current = d;
        setData(d);
        setStatus("ok");
        setClientStale(false);
        setLimited(null);
      }
    } catch {
      failed();
    } finally {
      busy.current = false;
      setNowTick(Date.now());
    }
  }, []);

  // First visit, and every new click (here or in another tab): one load now. setTimeout keeps the state updates in a
  // callback, outside the effect body.
  const clickKey = click ? `${click.ch}:${click.at}` : "";
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load, clickKey]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const fixtureStill = data?.mode === "fixture" && fxParam() === "stillwaiting";
  const mine: Mine = !click
    ? "none"
    : click.ch === "plain"
      ? "plain"
      : !data
        ? "pending"
        : data.yours?.found
          ? "found"
          : fixtureStill || (nowTick || 0) >= deadline
            ? "still"
            : "waiting";

  // Checking: only while waiting, and never past the deadline. A rate limit waits out its window first.
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (mine !== "waiting" || status === "loading") return;
    const wait = limited ? RATE_WINDOW_SECONDS * 1000 : POLL_WAITING_SECONDS * 1000;
    const until = deadline - Date.now();
    timer.current = setTimeout(() => {
      if (Date.now() >= deadline) setNowTick(Date.now());
      else load();
    }, Math.max(1000, Math.min(wait, until + 50)));
  }, [mine, status, limited, deadline, nowTick, load]);

  // A rate limit when nothing is being waited for: ask once more after the window, as the message promises (G3 v1 QA minor).
  useEffect(() => {
    if (!limited || mine === "waiting") return;
    const t = setTimeout(load, RATE_WINDOW_SECONDS * 1000);
    return () => clearTimeout(t);
  }, [limited, mine, load]);

  // Back on this tab after booking in the other one: if the click is recent and the booking is not found yet, look again
  // and wait once more (the same gap as R1, for the demo page where the report sits under the ads).
  useEffect(() => {
    const onShow = () => {
      if (document.visibilityState !== "visible" || !click || mine === "found" || mine === "plain") return;
      if (Date.now() - click.at > RECENT_MS) return;
      // No more than one extra check every 15 seconds, so a visitor who switches tabs a lot cannot hit the rate limit.
      if (Date.now() - lastShowLoad.current < 15_000) return;
      lastShowLoad.current = Date.now();
      setStartedAt(Date.now());
      load();
    };
    document.addEventListener("visibilitychange", onShow);
    return () => document.removeEventListener("visibilitychange", onShow);
  }, [click, mine, load, RECENT_MS]);

  const retry = () => {
    setStatus("loading");
    setStartedAt(Date.now());
    load();
  };

  const rows = data?.rows ?? [];
  const latest = data?.latest ?? [];
  const empty = status === "ok" && data !== null && data.total.booked === 0;
  // A rate limit on the very first load: the status line says so, and no "Loading" rows sit there forever.
  const showTables = (status === "loading" && !limited) || (status === "ok" && !empty);
  const fixture = data?.mode === "fixture";

  return (
    <>
      <div className="rephead">
        <p>
          {data ? (
            <>
              <b>Updated {data.updated}</b>{" · "}Read from GoHighLevel at most once every {data.cacheWindow}
            </>
          ) : (
            <>Read from GoHighLevel at most once every {CACHE_WINDOW_LABEL}</>
          )}
        </p>
        {limited ? (
          <p>This connection has asked for the report too often. It will update again in {limited}.</p>
        ) : MEASURED.lagSeconds !== null && MEASURED.lagDate ? (
          <p>
            New bookings usually appear within {MEASURED.lagSeconds} seconds, measured {MEASURED.lagDate}.
          </p>
        ) : null}
      </div>

      <div role="status" className="yours-live">
        {code && mine !== "none" && mine !== "pending" ? <YoursBox mine={mine} code={code} data={data} /> : null}
      </div>

      {fixture && (
        <p className="stale">
          Sample data. This build is not connected to GoHighLevel yet, so every row and count below is made up to show how the report works.
        </p>
      )}
      {data && (data.stale || clientStale) && status === "ok" && (
        <p className="stale">Showing the report from {data.updated}. GoHighLevel did not answer just now. We will try again shortly.</p>
      )}

      {status === "error" && (
        <div className="state">
          <p>The report cannot reach GoHighLevel right now. If you booked, your booking is still saved there.</p>
          <div className="acts">
            <button className="pill" type="button" onClick={retry}>
              Try again
            </button>
            {MEASURED.recording ? (
              <a className="textlink" href="#watch">
                Watch the recording
              </a>
            ) : null}
          </div>
        </div>
      )}

      {empty && (
        <div className="state">
          <p>
            No bookings in the last 4 weeks. Book from <a href="/demo/lead-source#ads">a demo ad</a>{" "}and yours will be the first.
          </p>
        </div>
      )}

      {showTables && (
        <>
          <div className="srcblk">
            <div>
              <SourceTable rows={rows} total={data?.total} loading={status === "loading"} />
              <SourceStack rows={rows} total={data?.total} loading={status === "loading"} />
            </div>
            <div className="notes">
              <p>
                <b>Upcoming</b>{" "}means the booking is not yet marked Attended, No-show or Cancelled. Cancelled bookings stay counted.
              </p>
              <p>
                <b>Attended and No-show</b>{" "}come from the appointment status the front desk sets in GoHighLevel (Showed or No show).{" "}
                {MEASURED.stageWorkflowProven ? "A workflow then moves the booking." : <span className="ph prose">A workflow then moves the booking.</span>} In this
                demo, John Boy sets them on his test bookings.
              </p>
              <p>
                <b>Ads rows</b>{" "}count bookings with a paid tag or a Google click ID. Free visits from Google, Facebook or Instagram get their own rows when there are
                any. Facebook adds a click ID to free posts too, so the tag decides.
              </p>
              <p>
                <b>Unknown</b>{" "}means the link had no tags and no click ID, like a link pasted into a message or the plain link on this page. It is counted,
                never dropped. The tracker does not guess from the referring site. GoHighLevel&apos;s own reports call it Direct traffic.
              </p>
            </div>
          </div>

          <div id="latest">
            <LatestTable latest={latest} loading={status === "loading"} />
            <LatestStack latest={latest} loading={status === "loading"} />
            <div className="after-t">
              <p>
                <span className="chip lead0">John Boy</span>{" "}
                {fixture
                  ? "In the live report, this marks a test booking John Boy made, kept so the report is never empty."
                  : "A test booking John Boy made, kept so the report is never empty."}
              </p>
              <p className="small">Booked at is when the booking was made, rounded to 15 minutes. The report never shows names, emails or appointment times.</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function YoursBox({ mine, code, data }: { mine: Exclude<Mine, "none" | "pending">; code: string; data: PublicReport | null }) {
  if (mine === "found" && data?.yours?.found) {
    const y = data.yours;
    return (
      <div className="yours">
        <span className="tag solid">Your booking</span>
        <div>
          <p>
            Found test code <b>{code}</b>. GoHighLevel saved it as{" "}
            <b>
              {y.source}, {y.medium}
            </b>
            {y.campaign !== "Not set" ? (
              <>
                , campaign <span className="nw">{y.campaign}</span>
              </>
            ) : null}
            .
          </p>
          <p className="sub">
            {y.inLatest ? "It is marked in Latest bookings below." : "It is counted in Bookings by source. Newer bookings have pushed it out of the latest 10."}
          </p>
        </div>
        {y.inLatest ? <JumpLink /> : null}
      </div>
    );
  }
  if (mine === "plain") {
    return (
      <div className="yours">
        <span className="tag">Your booking</span>
        <div>
          <p>Your last click was the plain link, so there is no code to look for.</p>
          <p className="sub">
            If you booked from it, it is counted as {MEASURED.plainResult ?? "Unknown"}, like any untagged booking. No
            tags, so the report cannot tell which one is yours. That is the point.
          </p>
        </div>
      </div>
    );
  }
  if (mine === "still") {
    return (
      <div className="yours">
        <span className="tag">Your booking</span>
        <div>
          <p>
            Still no booking with test code <b>{code}</b>.
          </p>
          <p className="sub">
            If you finished booking, wait a minute and refresh. If you booked in another browser, your code stayed in this one. If your email was already a
            contact in John Boy&apos;s GoHighLevel account, the demo leaves your booking out on purpose, so it never changes a real record.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="yours">
      <span className="tag">Your booking</span>
      <div>
        <p>
          Waiting for test code <b>{code}</b>{" "}to appear in GoHighLevel.
        </p>
        <p className="sub">
          This page checks again on its own.{MEASURED.lagSeconds !== null ? ` Usually ${MEASURED.lagSeconds} seconds.` : ""}
        </p>
      </div>
    </div>
  );
}

/** Focuses whichever Yours item is visible: the table row at wide widths, the list item at 760 px and below. */
function JumpLink() {
  return (
    <a
      className="textlink"
      href="#latest"
      onClick={(e) => {
        const t = Array.from(document.querySelectorAll<HTMLElement>("[data-yours]")).find((el) => el.getClientRects().length > 0);
        if (!t) return;
        e.preventDefault();
        t.focus();
      }}
    >
      Jump to it
    </a>
  );
}

const counts = (r: PublicRow) => [r.booked, r.upcoming, r.attended, r.noShow, r.cancelled];

function SourceTable({ rows, total, loading }: { rows: PublicRow[]; total?: PublicRow; loading: boolean }) {
  return (
    <table className="wide">
      <caption>Bookings by source</caption>
      <thead>
        <tr>
          <th scope="col">Source</th>
          <th scope="col" className="n">
            Booked
          </th>
          <th scope="col" className="n">
            Upcoming
          </th>
          <th scope="col" className="n">
            Attended
          </th>
          <th scope="col" className="n">
            No-show
          </th>
          <th scope="col" className="n">
            Cancelled
          </th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <>
            <tr className="loading">
              <td colSpan={6}>Loading the report from GoHighLevel</td>
            </tr>
            {FIXED.map((n) => (
              <tr key={n} aria-hidden="true">
                <td colSpan={6}>&nbsp;</td>
              </tr>
            ))}
          </>
        ) : (
          <>
            {rows.map((r) => (
              <tr key={r.name}>
                <th scope="row">{r.name}</th>
                {counts(r).map((n, i) => (
                  <td key={i} className="n">
                    {n}
                  </td>
                ))}
              </tr>
            ))}
            {total && (
              <tr className="total">
                <th scope="row">Total</th>
                {counts(total).map((n, i) => (
                  <td key={i} className="n">
                    {n}
                  </td>
                ))}
              </tr>
            )}
          </>
        )}
      </tbody>
    </table>
  );
}

const line2 = (r: PublicRow) => `${r.upcoming} upcoming, ${r.attended} attended, ${r.noShow} no-show, ${r.cancelled} cancelled`;

function SourceStack({ rows, total, loading }: { rows: PublicRow[]; total?: PublicRow; loading: boolean }) {
  return (
    <div className="stack">
      <h3>Bookings by source</h3>
      <ul>
        {loading ? (
          <>
            <li>
              <div className="r2">Loading the report from GoHighLevel</div>
            </li>
            {FIXED.map((n) => (
              <li key={n} aria-hidden="true">
                <div className="r1">&nbsp;</div>
                <div className="r2">&nbsp;</div>
              </li>
            ))}
          </>
        ) : (
          <>
            {rows.map((r) => (
              <li key={r.name}>
                <div className="r1">
                  <span>{r.name}</span>
                  <span className="n">{r.booked} booked</span>
                </div>
                <div className="r2">{line2(r)}</div>
              </li>
            ))}
            {total && (
              <li className="tot">
                <div className="r1">
                  <span>Total</span>
                  <span className="n">{total.booked} booked</span>
                </div>
                <div className="r2">{line2(total)}</div>
              </li>
            )}
          </>
        )}
      </ul>
    </div>
  );
}

function Chips({ b }: { b: PublicBooking }) {
  return (
    <>
      {b.yours ? <span className="chip me">Yours</span> : null}
      {b.seed ? <span className="chip">John Boy</span> : null}
    </>
  );
}

function LatestTable({ latest, loading }: { latest: PublicBooking[]; loading: boolean }) {
  let marked = false;
  return (
    <table className="wide">
      <caption>Latest bookings (up to 10)</caption>
      <thead>
        <tr>
          <th scope="col">Test code</th>
          <th scope="col">Source</th>
          <th scope="col">Medium</th>
          <th scope="col">Campaign</th>
          <th scope="col">Stage</th>
          <th scope="col">Booked at</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <>
            <tr className="loading">
              <td colSpan={6}>Loading the report from GoHighLevel</td>
            </tr>
            {[1, 2, 3, 4, 5].map((n) => (
              <tr key={n} aria-hidden="true">
                <td colSpan={6}>&nbsp;</td>
              </tr>
            ))}
          </>
        ) : (
          latest.map((b, i) => {
            const target = b.yours && !marked;
            if (target) marked = true;
            return (
              <tr key={`${b.code}-${b.bookedAt}-${i}`} className={b.yours ? "me" : undefined} {...(target ? { "data-yours": "", tabIndex: -1 } : {})}>
                <th scope="row" className="refc">
                  {b.code}
                  <Chips b={b} />
                </th>
                <td>{b.source}</td>
                <td>{b.medium}</td>
                <td className="nw">{b.campaign}</td>
                <td>{b.stage}</td>
                <td>{b.bookedAt}</td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

function LatestStack({ latest, loading }: { latest: PublicBooking[]; loading: boolean }) {
  let marked = false;
  return (
    <div className="stack">
      <h3>Latest bookings (up to 10)</h3>
      <ul>
        {loading ? (
          <li>
            <div className="r2">Loading the report from GoHighLevel</div>
          </li>
        ) : (
          latest.map((b, i) => {
            const target = b.yours && !marked;
            if (target) marked = true;
            return (
              <li key={`${b.code}-${b.bookedAt}-${i}`} className={b.yours ? "me" : undefined} {...(target ? { "data-yours": "", tabIndex: -1 } : {})}>
                <div className="r1">
                  <span className="refc">
                    {b.code} <Chips b={b} />
                  </span>
                  <span>{b.stage}</span>
                </div>
                <div className="r2">
                  {b.source}, {b.medium}, {b.campaign === "Not set" ? "campaign not set" : b.campaign}
                </div>
                <div className="r2">{b.bookedAt}</div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
