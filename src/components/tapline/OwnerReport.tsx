"use client";

import { IconPrinter } from "@tabler/icons-react";
import { useState } from "react";
import { REGION, money, taxIn, terms, tradeLabel } from "@/lib/tapline/rules";
import type { Sandbox } from "@/lib/tapline/types";

// The statement an owner receives each month: what was fixed, what it cost
// and how fast, for one calendar month in the agency's time zone. Tenant-paid
// work is excluded. Built from the same job data as the board, ready to print.

const D = 24 * 3600_000;

function monthBounds(region: "AU" | "UK", now: number, back: 0 | 1) {
  const tz = REGION[region].tz;
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit" }).formatToParts(now);
  let y = Number(parts.find((p) => p.type === "year")!.value);
  let m = Number(parts.find((p) => p.type === "month")!.value) - back;
  if (m < 1) {
    m += 12;
    y -= 1;
  }
  // Midnight on the 1st in the agency's zone, found by testing offsets.
  const at = (yy: number, mm: number) => {
    const guess = Date.UTC(yy, mm - 1, 1);
    for (let h = -14; h <= 14; h++) {
      const t = guess - h * 3600_000;
      const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).format(t);
      if (f.startsWith(`${yy}-${String(mm).padStart(2, "0")}-01`) && f.endsWith("00")) return t;
    }
    return guess;
  };
  const start = at(y, m);
  const end = back === 0 ? now + 1 : at(m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1);
  const label = new Date(start + 12 * 3600_000).toLocaleDateString(REGION[region].locale, { timeZone: tz, month: "long", year: "numeric" });
  return { start, end, label: back === 0 ? `${label} to date` : label };
}

const cap = (x: string) => x[0].toUpperCase() + x.slice(1);

export default function OwnerReport({ sb, now }: { sb: Sandbox; now: number }) {
  const R = REGION[sb.region];
  const c = terms(sb.region);
  const [back, setBack] = useState<0 | 1>(0);
  const [ownerId, setOwnerId] = useState<string>("");
  const period = monthBounds(sb.region, now, back);
  const inPeriod = (t?: number) => !!t && t >= period.start && t < period.end;

  const owners = sb.owners
    .map((o) => {
      const props = sb.properties.filter((p) => p.ownerId === o.id).map((p) => p.id);
      const jobs = sb.jobs.filter((j) => props.includes(j.propertyId) && j.triage?.chargeTo !== "tenant" && (inPeriod(j.createdAt) || inPeriod(j.billedAt) || inPeriod(j.completedAt)));
      return { o, jobs };
    })
    .filter((x) => x.jobs.length)
    .sort((a, b) => b.jobs.filter((j) => inPeriod(j.billedAt)).length - a.jobs.filter((j) => inPeriod(j.billedAt)).length || b.jobs.length - a.jobs.length);
  const sel = owners.find((x) => x.o.id === ownerId) ?? owners[0];

  const controls = (
    <div className="tl-view-head tl-noprint">
      <div>
        <h2 id="tl-own-h">{cap(c.owner)} statements</h2>
        <p>The maintenance statement each {c.owner} receives, built from the board.</p>
      </div>
      <div className="tl-view-controls">
        <div className="tl-seg" role="group" aria-label="Period">
          <button type="button" aria-pressed={back === 0} onClick={() => setBack(0)}>
            This month
          </button>
          <button type="button" aria-pressed={back === 1} onClick={() => setBack(1)}>
            Last month
          </button>
        </div>
        {sel && (
          <label>
            <span className="tl-sr">{cap(c.owner)}</span>
            <select value={sel.o.id} onChange={(e) => setOwnerId(e.target.value)}>
              {owners.map(({ o, jobs }) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({jobs.length} {jobs.length === 1 ? "job" : "jobs"})
                </option>
              ))}
            </select>
          </label>
        )}
        <button type="button" className="tl-btn tl-btn-quiet" onClick={() => window.print()}>
          <IconPrinter size={16} aria-hidden="true" /> Print or save as PDF
        </button>
      </div>
    </div>
  );

  if (!sel)
    return (
      <section className="tl-view" aria-labelledby="tl-own-h">
        {controls}
        <p className="tl-empty">No repairs in this period.</p>
      </section>
    );

  const props = sb.properties.filter((p) => p.ownerId === sel.o.id);
  const fmt = (t: number) => new Date(t).toLocaleDateString(R.locale, { timeZone: R.tz, day: "numeric", month: "short" });
  const billed = sel.jobs.filter((j) => inPeriod(j.billedAt) && j.invoice);
  const total = Math.round(billed.reduce((s, j) => s + j.invoice!.amount, 0) * 100) / 100;
  const completed = sel.jobs.filter((j) => j.completedAt && inPeriod(j.completedAt));
  const avgDays = completed.length ? completed.reduce((s, j) => s + (j.completedAt! - j.createdAt), 0) / completed.length / D : 0;
  const open = sel.jobs.filter((j) => !["done", "billed"].includes(j.stage));

  return (
    <section className="tl-view" aria-labelledby="tl-own-h">
      {controls}
      <article className="tl-report">
        <header>
          <p className="tl-report-k">{sb.agency}</p>
          <h3>Maintenance statement, {period.label}</h3>
          <p>
            Prepared for {sel.o.name} · {props.map((p) => `${p.address}, ${p.suburb}`).join(" · ")}
          </p>
        </header>
        <dl className="tl-report-kpis">
          <div>
            <dt>Repairs</dt>
            <dd>{sel.jobs.length}</dd>
          </div>
          <div>
            <dt>Paid from your rent</dt>
            <dd>{money(sb.region, total)}</dd>
          </div>
          <div>
            <dt>Average time to fix</dt>
            <dd>{completed.length ? `${avgDays < 1 ? "Under 1" : avgDays.toFixed(1)} days` : "None completed"}</dd>
          </div>
          <div>
            <dt>Still open</dt>
            <dd>{open.length}</dd>
          </div>
        </dl>
        <div className="tl-table-wrap">
          <table className="tl-table">
            <thead>
              <tr>
                <th scope="col">Reported</th>
                <th scope="col">Repair</th>
                <th scope="col">Trade</th>
                <th scope="col">Approval</th>
                <th scope="col">Status</th>
                <th scope="col" className="tl-num">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {[...sel.jobs]
                .sort((a, b) => a.createdAt - b.createdAt)
                .map((j) => (
                  <tr key={j.id}>
                    <td>{fmt(j.createdAt)}</td>
                    <td>
                      {j.title}
                      {j.urgency === "urgent" && <small> · urgent</small>}
                    </td>
                    <td>{tradeLabel(sb.region, j.trade)}</td>
                    <td>
                      {j.ownerDecision?.decision === "urgent"
                        ? "Urgent repair, you were told"
                        : j.ownerDecision?.decision === "auto"
                          ? "Within your limit"
                          : j.ownerDecision?.decision === "approved"
                            ? "Approved by you"
                            : j.ownerDecision?.decision === "declined"
                              ? "Declined"
                              : j.stage === "owner"
                                ? "Waiting for you"
                                : "Not needed yet"}
                    </td>
                    <td>{j.stage === "billed" ? "Fixed, paid" : j.stage === "done" ? "Fixed" : j.stage === "booked" ? "Visit booked" : "In progress"}</td>
                    <td className="tl-num">{j.invoice && inPeriod(j.billedAt) ? money(sb.region, j.invoice.amount) : j.quote ? `Quoted ${money(sb.region, j.quote.amount)}` : "-"}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={5}>
                  Total paid this period, incl. {money(sb.region, taxIn(sb.region, total))} {c.tax}
                </th>
                <td className="tl-num">
                  <b>{money(sb.region, total)}</b>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="tl-fine">Demo statement with a fictional {c.owner}, properties and amounts.</p>
      </article>
    </section>
  );
}
