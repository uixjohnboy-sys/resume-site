"use client";

import { useMemo, useState } from "react";
import { kpis, stageClock } from "@/lib/tapline/metrics";
import { REGION, STAGES, TRADE_LABEL, money } from "@/lib/tapline/rules";
import { DEMO_PROPERTY } from "@/lib/tapline/seed";
import type { Job, Sandbox, Trade, Urgency } from "@/lib/tapline/types";
import { useSandbox } from "./useSandbox";

const H = 3600_000;

export function dur(hours: number) {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  return `${Math.round(hours / 24)}d`;
}

function when(sb: Sandbox, t: number) {
  return new Date(t).toLocaleString(REGION[sb.region].locale, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

export default function Board() {
  const { sb, now, error, busy, act, reset, triage, setError } = useSandbox();
  const [openId, setOpenId] = useState<string | null>(null);
  const [tenantOpen, setTenantOpen] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [trade, setTrade] = useState<Trade | "all">("all");

  const k = useMemo(() => (sb ? kpis(sb, now) : null), [sb, now]);
  const open = sb?.jobs.find((j) => j.id === openId) ?? null;

  if (!sb || !k) {
    return (
      <div className="tl-loading" role="status">
        {error ?? "Setting up your private demo agency..."}
      </div>
    );
  }

  const R = REGION[sb.region];
  const jobs = sb.jobs.filter((j) => (!urgentOnly || j.urgency === "urgent") && (trade === "all" || j.trade === trade));
  const rank = { late: 0, warn: 1, ok: 2, none: 3 } as const;

  async function openJob(j: Job) {
    setOpenId(j.id);
    if (j.stage === "new" && !j.triage) await triage(j.id);
  }

  return (
    <div className="tl">
      <header className="tl-top">
        <div className="tl-brand">
          <span className="tl-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M12 2.5c3 4 6 7.3 6 10.7a6 6 0 1 1-12 0c0-3.4 3-6.7 6-10.7Z" fill="currentColor" />
            </svg>
          </span>
          <div>
            <b>Tapline</b>
            <span>
              {sb.agency} · {R.city}
            </span>
          </div>
        </div>
        <div className="tl-top-actions">
          <div className="tl-seg" role="group" aria-label="Region">
            {(["AU", "UK"] as const).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={sb.region === r}
                onClick={() => {
                  if (sb.region !== r && confirm(`Switch to the ${r === "AU" ? "Australian" : "UK"} demo agency? This resets your demo.`)) reset(r);
                }}
              >
                {r === "AU" ? "Australia" : "UK"}
              </button>
            ))}
          </div>
          <button type="button" className="tl-btn tl-btn-quiet" onClick={() => confirm("Reset the demo to its starting data?") && reset(sb.region)}>
            Reset demo
          </button>
          <button type="button" className="tl-btn tl-btn-primary" onClick={() => setTenantOpen(true)}>
            Report a repair as a tenant
          </button>
        </div>
      </header>

      <p className="tl-banner">
        Demo data: a fictional agency, {sb.properties.length} fictional properties. Your changes are private to you and reset after 48 hours.
      </p>

      {error && (
        <p className="tl-error" role="alert">
          {error}{" "}
          <button type="button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </p>
      )}

      <section className="tl-kpis" aria-label="This week at a glance">
        <Kpi label="Open jobs" value={String(k.open)} note={k.late ? `${k.late} past target` : "All on target"} tone={k.late ? "late" : "ok"} />
        <Kpi label="Median time to acknowledge" value={dur(k.medianAckHours)} note="Report to confirmed reply" />
        <Kpi label="Urgent jobs on target" value={`${k.urgentOnTimePct}%`} note="Sent to a tradie within 1 hour" tone={k.urgentOnTimePct >= 90 ? "ok" : "warn"} />
        <Kpi label="Waiting on owners" value={String(k.waitingOwner)} note={k.waitingOwner ? `Oldest ${dur(k.oldestOwnerHours)}` : "None"} tone={k.oldestOwnerHours > 48 ? "late" : undefined} />
        <Kpi label="Repair spend, 30 days" value={money(sb.region, k.spend30)} note="From uploaded invoices" />
        <Kpi label="Repeat faults" value={String(k.repeatProperties)} note="Properties, same trade within 90 days" />
        <Kpi label="Manager hours saved" value={`~${k.hoursSaved}h`} note="Estimate: 25 min of calls and emails per routed job" />
      </section>

      <div className="tl-filters">
        <label className="tl-check">
          <input type="checkbox" checked={urgentOnly} onChange={(e) => setUrgentOnly(e.target.checked)} /> Urgent only
        </label>
        <label>
          <span className="tl-sr">Trade</span>
          <select value={trade} onChange={(e) => setTrade(e.target.value as Trade | "all")}>
            <option value="all">All trades</option>
            {(Object.keys(TRADE_LABEL) as Trade[]).map((t) => (
              <option key={t} value={t}>
                {TRADE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="tl-board">
        {STAGES.map((s) => {
          const col = jobs
            .filter((j) => j.stage === s.id)
            .sort((a, b) => rank[stageClock(a, now).state] - rank[stageClock(b, now).state] || a.createdAt - b.createdAt);
          return (
            <section key={s.id} className="tl-col" aria-label={s.label}>
              <h2>
                {s.label} <span>{col.length}</span>
              </h2>
              <ul>
                {col.map((j) => (
                  <li key={j.id}>
                    <Card sb={sb} j={j} now={now} onOpen={() => openJob(j)} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {open && <Drawer sb={sb} j={open} now={now} busy={busy} onClose={() => setOpenId(null)} act={act} triage={triage} />}

      {tenantOpen && (
        <TenantReport
          sb={sb}
          busy={busy}
          onClose={() => setTenantOpen(false)}
          onSubmit={async (propertyId, title, description) => {
            const d = await act({ type: "report", propertyId, title, description });
            if (d?.jobId) {
              setTenantOpen(false);
              setOpenId(d.jobId);
              await triage(d.jobId);
            }
          }}
        />
      )}
    </div>
  );
}

function Kpi({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "ok" | "warn" | "late" }) {
  return (
    <div className={`tl-kpi ${tone ? "tl-" + tone : ""}`}>
      <span>{label}</span>
      <b>{value}</b>
      <small>{note}</small>
    </div>
  );
}

function Card({ sb, j, now, onOpen }: { sb: Sandbox; j: Job; now: number; onOpen: () => void }) {
  const p = sb.properties.find((x) => x.id === j.propertyId);
  const c = stageClock(j, now);
  const stage = STAGES.find((s) => s.id === j.stage)!;
  const repeat = j.triage?.repeat;
  return (
    <button type="button" className={`tl-card tl-${c.state}`} onClick={onOpen}>
      <span className="tl-card-top">
        <span className="tl-ref">{j.ref}</span>
        {j.urgency === "urgent" && !(j.stage === "new" && !j.triage) && <span className="tl-pill tl-pill-urgent">Urgent</span>}
        {repeat && <span className="tl-pill tl-pill-repeat">Repeat</span>}
        {j.stage === "new" && !j.triage && <span className="tl-pill">Needs triage</span>}
      </span>
      <b className="tl-card-title">{j.title}</b>
      <span className="tl-card-addr">
        {p?.address}, {p?.suburb}
      </span>
      <span className="tl-card-foot">
        <span>{j.stage === "new" && !j.triage ? "Open to triage" : TRADE_LABEL[j.trade]}</span>
        <span className="tl-timer" title={c.target ? `Target ${c.target}h in this stage` : undefined}>
          {stage.waiting} · {dur(c.hours)}
        </span>
      </span>
    </button>
  );
}

function Drawer({
  sb,
  j,
  now,
  busy,
  onClose,
  act,
  triage,
}: {
  sb: Sandbox;
  j: Job;
  now: number;
  busy: boolean;
  onClose: () => void;
  act: ReturnType<typeof useSandbox>["act"];
  triage: ReturnType<typeof useSandbox>["triage"];
}) {
  const p = sb.properties.find((x) => x.id === j.propertyId)!;
  const owner = sb.owners.find((o) => o.id === p.ownerId)!;
  const tradie = sb.tradies.find((t) => t.id === j.tradieId);
  const [tradeSel, setTradeSel] = useState<Trade>(j.triage?.trade ?? j.trade);
  const [urg, setUrg] = useState<Urgency>(j.triage?.urgency ?? j.urgency);
  const [reply, setReply] = useState(j.triage?.reply ?? "");
  const [seen, setSeen] = useState(j.triage);
  const [quote, setQuote] = useState("380");
  const [inv, setInv] = useState(String(j.quote?.amount ?? 380));

  // When the AI suggestion arrives, load it into the editable fields once.
  if (j.triage && j.triage !== seen) {
    setSeen(j.triage);
    setTradeSel(j.triage.trade);
    setUrg(j.triage.urgency);
    setReply(j.triage.reply);
  }

  return (
    <div className="tl-drawer-wrap" role="dialog" aria-modal="true" aria-label={`${j.ref} ${j.title}`}>
      <button type="button" className="tl-scrim" aria-label="Close" onClick={onClose} />
      <aside className="tl-drawer">
        <header>
          <div>
            <span className="tl-ref">{j.ref}</span>
            <h2>{j.title}</h2>
            <p>
              {p.address}, {p.suburb} · Tenant {p.tenant} · Owner {owner.name}
            </p>
          </div>
          <button type="button" className="tl-x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <p className="tl-desc">&ldquo;{j.description}&rdquo;</p>

        {j.stage === "new" && (
          <section className="tl-triage">
            <h3>Triage</h3>
            {!j.triage ? (
              <div className="tl-thinking" role="status">
                <span className="tl-dot" /> Reading the report, checking this property&apos;s history...
                <button type="button" className="tl-btn tl-btn-quiet" disabled={busy} onClick={() => triage(j.id)}>
                  Run again
                </button>
              </div>
            ) : (
              <>
                <p className="tl-source">
                  {j.triage.source === "ai" ? "Suggested by AI" : "Suggested by the keyword rules (AI unavailable)"} · you confirm before anything is sent
                </p>
                {j.triage.repeat && (
                  <p className="tl-flag">
                    Repeat fault: this property had a {TRADE_LABEL[j.triage.trade].toLowerCase()} job in the last 90 days. Worth asking the tradie to
                    check the earlier repair.
                  </p>
                )}
                <p className="tl-reason">{j.triage.reason}</p>
                <div className="tl-row">
                  <label>
                    Trade
                    <select value={tradeSel} onChange={(e) => setTradeSel(e.target.value as Trade)}>
                      {(Object.keys(TRADE_LABEL) as Trade[]).map((t) => (
                        <option key={t} value={t}>
                          {TRADE_LABEL[t]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="tl-seg" role="group" aria-label="Urgency">
                    {(["urgent", "routine"] as const).map((u) => (
                      <button key={u} type="button" aria-pressed={urg === u} onClick={() => setUrg(u)}>
                        {u === "urgent" ? "Urgent" : "Routine"}
                      </button>
                    ))}
                  </div>
                </div>
                {j.triage.safety.length > 0 && (
                  <div className="tl-safety">
                    <b>Safety steps for the tenant</b>
                    <ul>
                      {j.triage.safety.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <label className="tl-reply">
                  Reply to the tenant
                  <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={4} />
                </label>
                <p className="tl-next">
                  {urg === "urgent"
                    ? `Confirming sends this to the on-call ${TRADE_LABEL[tradeSel].toLowerCase()} straight away and notifies the owner.`
                    : `Confirming asks a ${TRADE_LABEL[tradeSel].toLowerCase()} for a quote. Quotes under ${money(sb.region, owner.approvalLimit)} are approved automatically.`}
                </p>
                <button type="button" className="tl-btn tl-btn-primary" disabled={busy} onClick={() => act({ type: "confirm", jobId: j.id, trade: tradeSel, urgency: urg, reply })}>
                  Confirm and send
                </button>
              </>
            )}
          </section>
        )}

        {j.stage === "quote" && (
          <Role who="tradie" name={tradie?.business}>
            <p>Waiting for a quote from {tradie?.business}.</p>
            <label>
              Quote amount ({REGION[sb.region].currency})
              <input inputMode="numeric" value={quote} onChange={(e) => setQuote(e.target.value.replace(/[^0-9]/g, ""))} />
            </label>
            <button type="button" className="tl-btn tl-btn-primary" disabled={busy} onClick={() => act({ type: "quote", jobId: j.id, amount: Number(quote), note: "Labour and parts", earliest: now + 26 * H })}>
              Send quote as the tradie
            </button>
          </Role>
        )}

        {j.stage === "owner" && (
          <Role who="owner" name={owner.name}>
            <p>
              Quote {money(sb.region, j.quote?.amount ?? 0)} from {tradie?.business}, above the owner&apos;s {money(sb.region, owner.approvalLimit)} limit.
            </p>
            <div className="tl-row">
              <button type="button" className="tl-btn tl-btn-primary" disabled={busy} onClick={() => act({ type: "owner", jobId: j.id, decision: "approved" })}>
                Approve as the owner
              </button>
              <button type="button" className="tl-btn tl-btn-quiet" disabled={busy} onClick={() => act({ type: "owner", jobId: j.id, decision: "declined" })}>
                Decline
              </button>
            </div>
          </Role>
        )}

        {j.stage === "booked" && (
          <Role who="tradie" name={tradie?.business}>
            <p>Booked for {j.bookedFor ? when(sb, j.bookedFor) : "a time to be confirmed"}.</p>
            <button type="button" className="tl-btn tl-btn-primary" disabled={busy} onClick={() => act({ type: "complete", jobId: j.id })}>
              Mark complete as the tradie
            </button>
          </Role>
        )}

        {j.stage === "done" && (
          <Role who="tradie" name={tradie?.business}>
            <label>
              Invoice amount ({REGION[sb.region].currency})
              <input inputMode="numeric" value={inv} onChange={(e) => setInv(e.target.value.replace(/[^0-9]/g, ""))} />
            </label>
            <button type="button" className="tl-btn tl-btn-primary" disabled={busy} onClick={() => act({ type: "invoice", jobId: j.id, amount: Number(inv) })}>
              Upload invoice as the tradie
            </button>
          </Role>
        )}

        <section className="tl-timeline">
          <h3>Timeline</h3>
          <ol>
            {[...j.events].reverse().map((e, i) => (
              <li key={i}>
                <span>{when(sb, e.at)}</span>
                <b>{e.by}</b> {e.text}
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  );
}

function Role({ who, name, children }: { who: "tradie" | "owner"; name?: string; children: React.ReactNode }) {
  return (
    <section className="tl-role">
      <p className="tl-role-h">
        Acting as the {who}
        {name ? `, ${name}` : ""} <span>(in real life this happens on their phone, from a text message link)</span>
      </p>
      {children}
    </section>
  );
}

function TenantReport({
  sb,
  busy,
  onClose,
  onSubmit,
}: {
  sb: Sandbox;
  busy: boolean;
  onClose: () => void;
  onSubmit: (propertyId: string, title: string, description: string) => void;
}) {
  const demo = sb.properties.find((p) => p.id === DEMO_PROPERTY)!;
  const [title, setTitle] = useState("Water coming through the ceiling");
  const [desc, setDesc] = useState(
    sb.region === "UK"
      ? "There is a brown stain on the living room ceiling and water is dripping onto the floor. It started tonight and is getting worse."
      : "There's a brown stain on the living room ceiling and water is dripping onto the floor. Started tonight and getting worse."
  );
  return (
    <div className="tl-drawer-wrap" role="dialog" aria-modal="true" aria-label="Report a repair">
      <button type="button" className="tl-scrim" aria-label="Close" onClick={onClose} />
      <div className="tl-phone">
        <div className="tl-phone-bar">
          <b>{sb.agency}</b>
          <button type="button" className="tl-x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <h2>Report a repair</h2>
        <p className="tl-phone-sub">
          {demo.address}, {demo.suburb}
          <br />
          Tenant: {demo.tenant}
        </p>
        <label>
          What&apos;s the problem?
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
        </label>
        <label>
          Tell us more
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} maxLength={600} />
        </label>
        <p className="tl-hint">
          Try your own wording too, for example a sparking {sb.region === "UK" ? "plug socket" : "power point"} or a lock that will not close.
        </p>
        <button type="button" className="tl-btn tl-btn-primary tl-wide" disabled={busy} onClick={() => onSubmit(demo.id, title, desc)}>
          {busy ? "Sending..." : "Send report"}
        </button>
      </div>
    </div>
  );
}
