"use client";

import { IconDots, IconRepeat, IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { kpis, stageClock } from "@/lib/tapline/metrics";
import { REGION, STAGE_ORDER, TRADE_IDS, money, stageLabel, terms, tradeLabel } from "@/lib/tapline/rules";
import type { Job, Region, Sandbox, Trade } from "@/lib/tapline/types";
import Compliance from "./Compliance";
import Drawer from "./Drawer";
import OwnerReport from "./OwnerReport";
import TenantReport from "./TenantReport";
import { Avatar, ConfirmDialog, TimerChip, TradeIcon, dur, useAnnouncer } from "./ui";
import { useSandbox } from "./useSandbox";

type Tab = "board" | "compliance" | "owners";

export default function Board() {
  const s = useSandbox();
  const { id, sb, now, error, busy, act, reset, triage, setError } = s;
  const [openId, setOpenId] = useState<string | null>(null);
  const [tenantOpen, setTenantOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState<null | { title: string; body: string; confirm: string; run: () => void }>(null);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [trade, setTrade] = useState<Trade | "all">("all");
  const [manager, setManager] = useState<string>("all");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("board");
  const announce = useAnnouncer(sb);

  const k = useMemo(() => (sb ? kpis(sb, now) : null), [sb, now]);
  const open = sb?.jobs.find((j) => j.id === openId) ?? null;

  if (!sb || !k) {
    return (
      <div className="tl tl-loading" role="status">
        <div className="tl-skel-top" />
        <p>{error ?? "Setting up your private demo agency..."}</p>
      </div>
    );
  }

  const R = REGION[sb.region];
  const c = terms(sb.region);
  const needle = q.trim().toLowerCase();
  const jobs = sb.jobs.filter((j) => {
    if (urgentOnly && j.urgency !== "urgent") return false;
    if (trade !== "all" && j.trade !== trade) return false;
    const p = sb.properties.find((x) => x.id === j.propertyId)!;
    if (manager !== "all" && p.managerId !== manager) return false;
    if (needle && !`${j.ref} ${j.title} ${p.address} ${p.suburb} ${p.tenant}`.toLowerCase().includes(needle)) return false;
    return true;
  });
  const rank = { late: 0, soon: 1, ok: 2, none: 3 } as const;

  const askSwitch = (r: Region) =>
    setConfirm({
      title: `Switch to the ${r === "AU" ? "Australian" : "UK"} agency?`,
      body: `This resets your demo to ${r === "AU" ? "Harbourline Property in Sydney" : "Northgate Lettings in Manchester"}. Your changes so far will be cleared.`,
      confirm: "Switch and reset",
      run: () => {
        setOpenId(null);
        reset(r);
      },
    });
  const askReset = () =>
    setConfirm({
      title: "Reset the demo?",
      body: "Every job goes back to its starting point. Anything you added is cleared.",
      confirm: "Reset demo",
      run: () => {
        setOpenId(null);
        reset(sb.region);
      },
    });

  function openJob(j: Job) {
    setOpenId(j.id);
    // Only a visitor's own new report is triaged automatically; seeded ones wait for a click.
    if (j.stage === "new" && !j.triage && !j.hold && now - j.createdAt < 10 * 60_000) triage(j.id);
  }

  return (
    <>
      <div id="tl-app" className="tl">
        <header className="tl-top">
          <div className="tl-brand">
            <span className="tl-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20">
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
            <div className="tl-seg tl-desk" role="group" aria-label="Agency region">
              {(["AU", "UK"] as const).map((r) => (
                <button key={r} type="button" aria-pressed={sb.region === r} onClick={() => sb.region !== r && askSwitch(r)}>
                  {r === "AU" ? "Australia" : "UK"}
                </button>
              ))}
            </div>
            <button type="button" className="tl-btn tl-btn-onink tl-desk" onClick={askReset}>
              Reset demo
            </button>
            <button type="button" className="tl-btn tl-btn-primary" onClick={() => setTenantOpen(true)}>
              <span className="tl-desk">Report a repair as a tenant</span>
              <span className="tl-mob">Report a repair</span>
            </button>
            <div className="tl-mob tl-menu-wrap">
              <button type="button" className="tl-icon-btn" aria-label="More options" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
                <IconDots size={20} aria-hidden="true" />
              </button>
              {menu && (
                <div className="tl-menu" role="menu">
                  <p className="tl-menu-h">Agency</p>
                  {(["AU", "UK"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      role="menuitemradio"
                      aria-checked={sb.region === r}
                      onClick={() => {
                        setMenu(false);
                        if (sb.region !== r) askSwitch(r);
                      }}
                    >
                      {r === "AU" ? "Australia, Sydney" : "UK, Manchester"}
                    </button>
                  ))}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenu(false);
                      askReset();
                    }}
                  >
                    Reset demo
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <p className="tl-banner">Demo data: a fictional agency with {sb.properties.length} properties. Your changes are private to you and reset after 48 hours.</p>

        {error && (
          <p className="tl-error" role="alert">
            {error}{" "}
            <button type="button" onClick={() => setError(null)}>
              Dismiss
            </button>
          </p>
        )}

        <h1 className="tl-sr">Tapline repairs desk, {sb.agency}</h1>
        <nav className="tl-tabs" aria-label="Views">
          {(
            [
              ["board", "Repairs board"],
              ["compliance", "Compliance"],
              ["owners", `${c.owner[0].toUpperCase()}${c.owner.slice(1)} statements`],
            ] as const
          ).map(([v, l]) => (
            <button key={v} type="button" aria-current={tab === v ? "page" : undefined} onClick={() => setTab(v)}>
              {l}
            </button>
          ))}
        </nav>

        {tab === "compliance" && <Compliance sb={sb} now={now} busy={busy} act={act} onOpenJob={(jid) => {
              setTab("board");
              setOpenId(jid);
            }} />}
        {tab === "owners" && <OwnerReport sb={sb} now={now} />}

        {tab === "board" && (
          <>
            <section className="tl-kpis" aria-label="At a glance">
              <Kpi label="Open jobs" value={String(k.open)} note={k.late ? `${k.late} past target` : "All on target"} tone={k.late ? "late" : undefined} />
              <Kpi label="Median time to acknowledge" value={dur(k.medianAckHours)} note="Report to confirmed reply" />
              <Kpi label="Urgent jobs on target" value={`${k.urgentOnTime} of ${k.urgentTotal}`} note="Sent to a contractor within 2 hours" tone={k.urgentOnTime < k.urgentTotal ? "soon" : undefined} />
              <Kpi label={`Waiting on ${c.owners}`} value={String(k.waitingOwner)} note={k.waitingOwner ? `Oldest ${dur(k.oldestOwnerHours)}` : "None"} tone={k.oldestOwnerHours > 48 ? "late" : undefined} />
              <Kpi label="Repair spend, 30 days" value={money(sb.region, k.spend30)} note={`Bills entered, incl. ${c.tax}`} />
              <Kpi label="Open repeat faults" value={String(k.repeatOpen)} note="Same kind of fault within 90 days" />
              <Kpi label="Manager hours saved" value={`~${k.hoursSaved}h`} note="Estimate: 25 min per routed job" />
            </section>

            <div className="tl-filters">
              <label className="tl-search">
                <IconSearch size={16} aria-hidden="true" />
                <span className="tl-sr">Search jobs</span>
                <input type="search" placeholder="Search address, tenant or job" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
              <label>
                <span className="tl-sr">Manager</span>
                <select value={manager} onChange={(e) => setManager(e.target.value)}>
                  <option value="all">All managers</option>
                  {sb.managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="tl-sr">Trade</span>
                <select value={trade} onChange={(e) => setTrade(e.target.value as Trade | "all")}>
                  <option value="all">All trades</option>
                  {TRADE_IDS.map((t) => (
                    <option key={t} value={t}>
                      {tradeLabel(sb.region, t)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="tl-check">
                <input type="checkbox" checked={urgentOnly} onChange={(e) => setUrgentOnly(e.target.checked)} /> Urgent only
              </label>
            </div>

            <div className="tl-board">
              {STAGE_ORDER.map((st) => {
                const col = jobs
                  .filter((j) => j.stage === st)
                  .sort((a, b) => rank[stageClock(a, now).state] - rank[stageClock(b, now).state] || (st === "billed" ? (b.billedAt ?? 0) - (a.billedAt ?? 0) : a.stageEnteredAt - b.stageEnteredAt))
                  .slice(0, st === "billed" ? 12 : 60);
                const total = jobs.filter((j) => j.stage === st).length;
                return (
                  <section key={st} className="tl-col" aria-labelledby={`col-${st}`}>
                    <h2 id={`col-${st}`}>
                      {stageLabel(sb.region, st)} <span>{total}</span>
                    </h2>
                    {col.length === 0 ? (
                      <p className="tl-col-empty">Nothing here.</p>
                    ) : (
                      <ul>
                        {col.map((j) => (
                          <li key={j.id}>
                            <Card sb={sb} j={j} now={now} onOpen={() => openJob(j)} />
                          </li>
                        ))}
                      </ul>
                    )}
                    {st === "billed" && total > col.length && <p className="tl-col-empty">Showing the latest {col.length}.</p>}
                  </section>
                );
              })}
            </div>
          </>
        )}
        <p className="tl-sr" aria-live="polite">
          {announce}
        </p>
      </div>

      {open && id && <Drawer id={id} s={s} j={open} onClose={() => setOpenId(null)} />}
      {tenantOpen && id && (
        <TenantReport
          id={id}
          sb={sb}
          busy={busy}
          api={s}
          onClose={() => setTenantOpen(false)}
          onSent={(jobId) => {
            setTenantOpen(false);
            setTab("board");
            setOpenId(jobId);
            triage(jobId);
          }}
        />
      )}
      {confirm && <ConfirmDialog title={confirm.title} body={confirm.body} confirm={confirm.confirm} onConfirm={confirm.run} onClose={() => setConfirm(null)} />}
    </>
  );
}

function Kpi({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "soon" | "late" }) {
  return (
    <div className="tl-kpi">
      <span>{label}</span>
      <b>{value}</b>
      <small className={tone ? `tl-note-${tone}` : undefined}>{note}</small>
    </div>
  );
}

function Card({ sb, j, now, onOpen }: { sb: Sandbox; j: Job; now: number; onOpen: () => void }) {
  const p = sb.properties.find((x) => x.id === j.propertyId)!;
  const m = sb.managers.find((x) => x.id === p.managerId)!;
  const clock = stageClock(j, now);
  const untriaged = j.stage === "new" && !j.triage;
  const pills: string[] = [];
  if (j.urgency === "urgent" && !untriaged) pills.push("Urgent");
  if (j.triage?.repeatOf) pills.push("Repeat fault");
  if (untriaged) pills.push("Needs triage");
  if (j.hold === "ownerDeclined") pills.push(`${terms(sb.region).owner[0].toUpperCase()}${terms(sb.region).owner.slice(1)} declined`);
  if (j.invoice?.overApproved && j.stage === "done") pills.push("Invoice over approval");
  if (j.afterHours && j.stage === "sent" && !j.triage?.confirmedAt) pills.push("After hours");
  const timeWord = clock.state === "late" ? "overdue" : clock.state === "soon" ? "due soon" : "in this stage";
  const label = `${j.ref}, ${j.title}, ${p.address}, ${p.suburb}. ${pills.join(", ")}. ${untriaged ? "" : tradeLabel(sb.region, j.trade) + "."} ${dur(clock.hours)} ${timeWord}. Manager ${m.name}.`;
  return (
    <button type="button" className={`tl-card tl-card-${clock.state}`} onClick={onOpen} aria-label={label}>
      <span className="tl-card-r1">
        <span className="tl-ref">{j.ref}</span>
        {clock.state !== "none" && <TimerChip state={clock.state} hours={clock.hours} />}
      </span>
      <span className="tl-card-title">{j.title}</span>
      <span className="tl-card-addr">
        {p.address}, {p.suburb}
      </span>
      <span className="tl-card-r4">
        <span className="tl-trade">
          {untriaged ? (
            "New report"
          ) : (
            <>
              <TradeIcon trade={j.trade} /> {tradeLabel(sb.region, j.trade)}
            </>
          )}
        </span>
        <span className="tl-card-pills">
          {pills.map((x) => (
            <span key={x} className={`tl-pill ${x === "Urgent" ? "tl-pill-urgent" : x === "Repeat fault" ? "tl-pill-neutral" : x.includes("declined") || x.includes("over") ? "tl-pill-warn" : "tl-pill-neutral"}`}>
              {x === "Repeat fault" && <IconRepeat size={11} aria-hidden="true" />}
              {x}
            </span>
          ))}
        </span>
        <Avatar initials={m.initials} name={m.name} />
      </span>
    </button>
  );
}
