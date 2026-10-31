"use client";

import { useState } from "react";
import { REGION, TRADE_LABEL, money } from "@/lib/tapline/rules";
import type { Sandbox } from "@/lib/tapline/types";

// The monthly statement an owner receives: what was fixed, what it cost, how
// fast it happened. Built from the same job data as the board, ready to print.

const D = 24 * 3600_000;

export default function OwnerReport({ sb, now }: { sb: Sandbox; now: number }) {
  const R = REGION[sb.region];
  // Owners with any job activity in the last 60 days.
  const active = sb.owners
    .map((o) => {
      const props = sb.properties.filter((p) => p.ownerId === o.id).map((p) => p.id);
      const jobs = sb.jobs.filter((j) => props.includes(j.propertyId) && now - j.createdAt <= 60 * D);
      return { o, jobs };
    })
    .filter((x) => x.jobs.length)
    // Lead with the owner whose statement shows the most finished work.
    .sort((a, b) => b.jobs.filter((j) => j.invoice).length - a.jobs.filter((j) => j.invoice).length || b.jobs.length - a.jobs.length);
  const [ownerId, setOwnerId] = useState(active[0]?.o.id ?? "");
  const sel = active.find((x) => x.o.id === ownerId) ?? active[0];
  if (!sel) return <p className="tl-empty">No owner activity yet.</p>;

  const props = sb.properties.filter((p) => p.ownerId === sel.o.id);
  const fmt = (t: number) => new Date(t).toLocaleDateString(R.locale, { timeZone: R.tz, day: "numeric", month: "short" });
  const spend = sel.jobs.reduce((s, j) => s + (j.invoice?.amount ?? 0), 0);
  const completed = sel.jobs.filter((j) => j.completedAt);
  const avgDays = completed.length ? completed.reduce((s, j) => s + (j.completedAt! - j.createdAt), 0) / completed.length / D : 0;
  const open = sel.jobs.filter((j) => j.stage !== "invoiced" && j.stage !== "done");
  const month = new Date(now).toLocaleDateString(R.locale, { timeZone: R.tz, month: "long", year: "numeric" });

  return (
    <section className="tl-view" aria-label="Owner reports">
      <div className="tl-view-head tl-noprint">
        <div>
          <h2>Owner reports</h2>
          <p>The statement each owner receives monthly, built from the board. Pick an owner to preview.</p>
        </div>
        <div className="tl-view-controls">
          <label>
            <span className="tl-sr">Owner</span>
            <select value={sel.o.id} onChange={(e) => setOwnerId(e.target.value)}>
              {active.map(({ o, jobs }) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({jobs.length} jobs)
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="tl-btn tl-btn-quiet" onClick={() => window.print()}>
            Print or save as PDF
          </button>
        </div>
      </div>

      <article className="tl-report">
        <header>
          <div>
            <p className="tl-report-k">{sb.agency}</p>
            <h3>Maintenance statement, {month}</h3>
            <p>
              Prepared for {sel.o.name} · {props.map((p) => `${p.address}, ${p.suburb}`).join(" · ")}
            </p>
          </div>
        </header>
        <dl className="tl-report-kpis">
          <div>
            <dt>Jobs (last 60 days)</dt>
            <dd>{sel.jobs.length}</dd>
          </div>
          <div>
            <dt>Invoiced</dt>
            <dd>{money(sb.region, spend)}</dd>
          </div>
          <div>
            <dt>Average report to fixed</dt>
            <dd>{completed.length ? `${avgDays < 1 ? "<1" : avgDays.toFixed(1)} days` : "No completed jobs"}</dd>
          </div>
          <div>
            <dt>Still open</dt>
            <dd>{open.length}</dd>
          </div>
        </dl>
        <table className="tl-table">
          <thead>
            <tr>
              <th scope="col">Reported</th>
              <th scope="col">Repair</th>
              <th scope="col">Trade</th>
              <th scope="col">Approval</th>
              <th scope="col">Status</th>
              <th scope="col">Cost</th>
            </tr>
          </thead>
          <tbody>
            {sel.jobs
              .sort((a, b) => a.createdAt - b.createdAt)
              .map((j) => (
                <tr key={j.id}>
                  <td>{fmt(j.createdAt)}</td>
                  <td>
                    {j.title}
                    {j.urgency === "urgent" && <small> · urgent</small>}
                  </td>
                  <td>{TRADE_LABEL[j.trade]}</td>
                  <td>
                    {j.urgency === "urgent"
                      ? "Urgent repair, you were notified"
                      : j.ownerDecision?.decision === "auto"
                        ? "Under your limit"
                        : j.ownerDecision?.decision === "approved"
                          ? "Approved by you"
                          : j.ownerDecision?.decision === "declined"
                            ? "Declined"
                            : "Pending"}
                  </td>
                  <td>{j.stage === "invoiced" ? "Fixed, invoiced" : j.stage === "done" ? "Fixed" : j.stage === "booked" ? "Booked" : "In progress"}</td>
                  <td>{j.invoice ? money(sb.region, j.invoice.amount) : j.quote ? `Quoted ${money(sb.region, j.quote.amount)}` : "-"}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <p className="tl-fine">Demo statement: fictional owner, properties and amounts.</p>
      </article>
    </section>
  );
}
