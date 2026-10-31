"use client";

import { useState } from "react";
import { REGION } from "@/lib/tapline/rules";
import type { Sandbox } from "@/lib/tapline/types";
import type { useSandbox } from "./useSandbox";

// Safety-check due dates across the whole portfolio, worst first. One click
// turns a check into a job card that asks the right tradie for a quote.

const D = 24 * 3600_000;

export default function Compliance({ sb, now, busy, act }: { sb: Sandbox; now: number; busy: boolean; act: ReturnType<typeof useSandbox>["act"] }) {
  const R = REGION[sb.region];
  const [item, setItem] = useState<string>("all");
  const [view, setView] = useState<"overdue" | "soon" | "all">("overdue");

  const openJobs = new Set(sb.jobs.filter((j) => j.stage !== "invoiced").map((j) => `${j.propertyId}|${j.title}`));
  const rows = sb.compliance
    .filter((c) => item === "all" || c.item === item)
    .map((c) => ({ c, days: Math.floor((c.dueAt - now) / D) }))
    .filter(({ days }) => (view === "overdue" ? days < 0 : view === "soon" ? days >= 0 && days <= 30 : true))
    .sort((a, b) => a.days - b.days);

  const overdue = sb.compliance.filter((c) => c.dueAt < now).length;
  const soon = sb.compliance.filter((c) => c.dueAt >= now && c.dueAt - now <= 30 * D).length;
  const fmt = (t: number) => new Date(t).toLocaleDateString(R.locale, { timeZone: R.tz, day: "numeric", month: "short", year: "numeric" });

  return (
    <section className="tl-view" aria-label="Compliance">
      <div className="tl-view-head">
        <div>
          <h2>Compliance</h2>
          <p>
            {sb.compliance.length} checks across {sb.properties.length} properties: <b className="tl-late-t">{overdue} overdue</b>,{" "}
            <b className="tl-warn-t">{soon} due within 30 days</b>.
          </p>
        </div>
        <div className="tl-view-controls">
          <div className="tl-seg" role="group" aria-label="Show">
            {(
              [
                ["overdue", "Overdue"],
                ["soon", "Due in 30 days"],
                ["all", "All"],
              ] as const
            ).map(([v, l]) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
                {l}
              </button>
            ))}
          </div>
          <label>
            <span className="tl-sr">Check type</span>
            <select value={item} onChange={(e) => setItem(e.target.value)}>
              <option value="all">All checks</option>
              {R.compliance.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <p className="tl-fine">Check intervals are this demo agency&apos;s settings. General information, not legal advice.</p>
      <div className="tl-table-wrap">
        <table className="tl-table">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Check</th>
              <th scope="col">Last done</th>
              <th scope="col">Due</th>
              <th scope="col">
                <span className="tl-sr">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 60).map(({ c, days }) => {
              const p = sb.properties.find((x) => x.id === c.propertyId)!;
              const has = openJobs.has(`${c.propertyId}|${c.item}`);
              return (
                <tr key={c.id}>
                  <td>
                    {p.address}, {p.suburb}
                  </td>
                  <td>{c.item}</td>
                  <td>{fmt(c.lastDoneAt)}</td>
                  <td className={days < 0 ? "tl-late-t" : days <= 30 ? "tl-warn-t" : ""}>
                    {fmt(c.dueAt)} <small>({days < 0 ? `${-days} days overdue` : `in ${days} days`})</small>
                  </td>
                  <td>
                    {has ? (
                      <span className="tl-pill">Job open</span>
                    ) : (
                      <button type="button" className="tl-btn tl-btn-quiet tl-btn-sm" disabled={busy} onClick={() => act({ type: "complianceJob", complianceId: c.id })}>
                        Create job
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="tl-empty">Nothing here. Every check in this view is up to date.</p>}
        {rows.length > 60 && <p className="tl-fine">Showing the first 60 of {rows.length}.</p>}
      </div>
    </section>
  );
}
