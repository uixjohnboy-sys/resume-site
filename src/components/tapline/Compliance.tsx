"use client";

import { useState } from "react";
import { REGION, day } from "@/lib/tapline/rules";
import type { Sandbox } from "@/lib/tapline/types";
import type { useSandbox } from "./useSandbox";

// Safety-check due dates across the whole rent roll, worst first. Each check
// shows whether it is the law or the agency's own policy. One click turns a
// check into a job; finishing that job rolls the due date forward.

const D = 24 * 3600_000;
const days = (n: number) => (n === 1 ? "1 day" : `${n} days`);

export default function Compliance({ sb, now, busy, act, onOpenJob }: { sb: Sandbox; now: number; busy: boolean; act: ReturnType<typeof useSandbox>["act"]; onOpenJob: (id: string) => void }) {
  const R = REGION[sb.region];
  const [kind, setKind] = useState<string>("all");
  const [view, setView] = useState<"overdue" | "soon" | "all">("overdue");

  const openJob = new Map(sb.jobs.filter((j) => j.complianceId && j.stage !== "billed").map((j) => [j.complianceId!, j]));
  const rows = sb.compliance
    .filter((c) => kind === "all" || c.kind === kind)
    .map((c) => ({ c, d: Math.floor((c.dueAt - now) / D) }))
    .filter(({ d }) => (view === "overdue" ? d < 0 : view === "soon" ? d >= 0 && d <= 30 : true))
    .sort((a, b) => a.d - b.d);
  const overdue = sb.compliance.filter((c) => c.dueAt < now).length;
  const soon = sb.compliance.filter((c) => c.dueAt >= now && c.dueAt - now <= 30 * D).length;

  return (
    <section className="tl-view" aria-labelledby="tl-comp-h">
      <div className="tl-view-head">
        <div>
          <h2 id="tl-comp-h">Compliance</h2>
          <p>
            {sb.compliance.length} checks across {sb.properties.length} properties: <b className="tl-late-t">{overdue} overdue</b>, <b className="tl-warn-t">{soon} due within 30 days</b>.
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
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="all">All checks</option>
              {R.compliance.map((c) => (
                <option key={c.kind} value={c.kind}>
                  {c.kind}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <p className="tl-fine">Rules shown are general information for this demo agency, not legal advice.</p>
      <div className="tl-table-wrap">
        <table className="tl-table">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Check</th>
              <th scope="col">Basis</th>
              <th scope="col">Last done</th>
              <th scope="col">Due</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="tl-sr">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 60).map(({ c, d }) => {
              const p = sb.properties.find((x) => x.id === c.propertyId)!;
              const rule = R.compliance.find((x) => x.kind === c.kind)!;
              const job = openJob.get(c.id);
              return (
                <tr key={c.id}>
                  <td>
                    {p.address}, {p.suburb}
                  </td>
                  <td>{c.kind}</td>
                  <td>
                    <span className={`tl-pill ${rule.basis === "law" ? "tl-pill-neutral" : "tl-pill-plain"}`} title={rule.basisNote}>
                      {rule.basis === "law" ? "Law" : "Agency policy"}
                    </span>
                  </td>
                  <td>{day(sb.region, c.lastDoneAt)}</td>
                  <td>{day(sb.region, c.dueAt)}</td>
                  <td>
                    <span className={`tl-chip ${d < 0 ? "tl-chip-late" : d <= 30 ? "tl-chip-soon" : "tl-chip-ok"}`}>
                      {d < 0 ? `${days(-d)} overdue` : d === 0 ? "Due today" : `Due in ${days(d)}`}
                    </span>
                  </td>
                  <td className="tl-td-action">
                    {job ? (
                      <button type="button" className="tl-btn tl-btn-ghost tl-btn-sm" onClick={() => onOpenJob(job.id)}>
                        View {job.ref}
                      </button>
                    ) : (
                      <button type="button" className="tl-btn tl-btn-ghost tl-btn-sm" disabled={busy} onClick={() => act({ type: "complianceJob", complianceId: c.id })}>
                        Create job
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="tl-empty">Nothing in this view. Every check here is up to date.</p>}
        {rows.length > 60 && <p className="tl-fine tl-pad">Showing the first 60 of {rows.length}.</p>}
      </div>
    </section>
  );
}
