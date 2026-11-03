"use client";

import { IconCheck, IconDots, IconRepeat, IconRoute, IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { kpis, stageClock } from "@/lib/tapline/metrics";
import { REGION, STAGE_ORDER, TRADE_IDS, money, ruleTriage, stageLabel, terms, tradeLabel } from "@/lib/tapline/rules";
import type { Job, Region, Sandbox, Trade } from "@/lib/tapline/types";
import Guide from "@/components/guide/Guide";
import Compliance from "./Compliance";
import Drawer from "./Drawer";
import OwnerReport from "./OwnerReport";
import TenantReport from "./TenantReport";
import { TOURS, type TourCtx } from "./tours";
import { Avatar, ConfirmDialog, TimerChip, TradeIcon, dur, useAnnouncer } from "./ui";
import { useSandbox } from "./useSandbox";

type Tab = "board" | "compliance" | "owners";
type TourId = keyof typeof TOURS;
const TOUR_SEEN = "tapline-tour-seen";
const EMAIL = "uix.johnboy@gmail.com";
const DEMO_URL = "https://www.johnboydesign.com/demo/tapline";
const CONTACT = {
  mail: `mailto:${EMAIL}?subject=${encodeURIComponent("The Tapline demo")}&body=${encodeURIComponent("Hi John Boy, I tried the Tapline demo. Our agency:\n\n")}`,
  whatsapp: `https://wa.me/639773659548?text=${encodeURIComponent("Hi John Boy, I tried the Tapline demo.")}`,
  emailSelf: `mailto:?subject=${encodeURIComponent("Tapline repairs desk demo")}&body=${encodeURIComponent(`A live demo of a repairs desk for property managers: ${DEMO_URL}`)}`,
};

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
  const menuRef = useRef<HTMLDivElement>(null);
  const [tour, setTour] = useState<TourId | null>(null);
  const [tourFrom, setTourFrom] = useState(0);
  const [offer, setOffer] = useState(false);
  const hasDemo = !!sb;
  const offerHead = useRef<HTMLHeadingElement>(null);
  const offerAsked = useRef(false);

  // Escape closes the offer from anywhere, unless a dialog is using it.
  useEffect(() => {
    if (!offer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector('[aria-modal="true"]')) return;
      setOffer(false);
      try {
        localStorage.setItem(TOUR_SEEN, "1");
      } catch {}
      Array.from(document.querySelectorAll<HTMLElement>("[data-guide-return]")).find((x) => x.offsetParent !== null)?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [offer]);

  // Asked for with the button or menu: focus moves to the offer. The first-visit offer doesn't steal focus.
  useEffect(() => {
    if (offer && offerAsked.current) offerHead.current?.focus();
    offerAsked.current = false;
  }, [offer]);

  // The guided tour: offered once to a first-time visitor, opened straight by a ?tour= link.
  useEffect(() => {
    if (!hasDemo) return;
    let wanted: string | null = null;
    let seen = false;
    try {
      wanted = new URL(window.location.href).searchParams.get("tour");
      seen = localStorage.getItem(TOUR_SEEN) === "1";
    } catch {}
    Promise.resolve().then(() => {
      if (wanted === "manager" || wanted === "owner") {
        setTour(wanted);
        setTourFrom(Date.now());
      } else if (!seen) setOffer(true);
    });
  }, [hasDemo]);

  function startTour(which: TourId) {
    setOffer(false);
    setMenu(false);
    setConfirm(null);
    setTourFrom(Date.now());
    setTour(which);
    markSeen();
  }
  function markSeen() {
    try {
      localStorage.setItem(TOUR_SEEN, "1");
    } catch {}
  }

  // The phone menu is a disclosure: Escape or a click outside closes it and returns focus to its button.
  useEffect(() => {
    if (!menu) return;
    const close = (focus: boolean) => {
      setMenu(false);
      if (focus) menuRef.current?.querySelector<HTMLElement>("button")?.focus();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(true);
    const onDown = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && close(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [menu]);

  // A dialog opening or closing starts clean: an old refusal never follows the user into another dialog.
  useEffect(() => {
    setError(null);
  }, [openId, tenantOpen, setError]);

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
  // New reports the keyword rules think are urgent go first in New, flagged "Likely urgent" until triaged.
  const likely = (j: Job) => (j.stage === "new" && !j.triage && ruleTriage(`${j.title}. ${j.description}`, sb.region).urgency === "urgent" ? 0 : 1);

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

  const tourCtx: TourCtx = {
    sb,
    k,
    // The newest repair a tenant reported since this tour began (a minute's grace for clock differences).
    job: sb.jobs.filter((j) => j.createdAt >= tourFrom - 60_000 && j.events[0]?.by === "tenant").sort((a, b) => b.createdAt - a.createdAt)[0] ?? null,
    tenantOpen,
    sampleJobId: sb.jobs.find((j) => j.afterHours && j.urgency === "urgent" && j.stage !== "new" && j.events.length >= 5)?.id ?? null,
    go: {
      board: () => setTab("board"),
      compliance: () => setTab("compliance"),
      owners: () => setTab("owners"),
      open: (jid) => setOpenId(jid),
      tenant: () => setTenantOpen(true),
    },
    contact: CONTACT,
  };

  function openJob(j: Job) {
    setOpenId(j.id);
    // Only a visitor's own new report is triaged automatically; seeded ones wait for a click.
    if (j.stage === "new" && !j.triage && !j.hold && now - j.createdAt < 10 * 60_000) triage(j.id);
  }

  return (
    <>
      {offer && !tour && (
        <section className="gd-start" aria-labelledby="gd-start-h">
          <h2 className="gd-h" id="gd-start-h" tabIndex={-1} ref={offerHead}>
            Take the guided tour?
          </h2>
          <p className="gd-text">Use the real product while it shows you around. No sign-up, and the data is fictional.</p>
          <div className="gd-paths">
            <button type="button" className="gd-path" onClick={() => startTour("manager")}>
              <b>I&apos;m {sb.region === "AU" ? "a property manager" : "a letting agent"}</b>
              <span>Follow one repair from the tenant&apos;s report to the {terms(sb.region).contractor}&apos;s phone. 2 minutes.</span>
            </button>
            <button type="button" className="gd-path" onClick={() => startTour("owner")}>
              <b>I run the agency</b>
              <span>See control, proof and risk across the desk. 1 minute.</span>
            </button>
          </div>
          <button
            type="button"
            className="gd-later"
            onClick={() => {
              setOffer(false);
              markSeen();
              Array.from(document.querySelectorAll<HTMLElement>("[data-guide-return]")).find((x) => x.offsetParent !== null)?.focus();
            }}
          >
            I&apos;ll explore on my own
          </button>
        </section>
      )}
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
            <button
              type="button"
              className="tl-btn tl-btn-onink tl-desk"
              data-guide-return
              onClick={() => {
                offerAsked.current = true;
                setOffer(true);
              }}
            >
              <IconRoute size={16} aria-hidden="true" /> Guided tour
            </button>
            <div className="tl-seg tl-desk" role="group" aria-label="Agency region" data-spot="regions">
              {(["AU", "UK"] as const).map((r) => (
                <button key={r} type="button" aria-pressed={sb.region === r} onClick={() => sb.region !== r && askSwitch(r)}>
                  {r === "AU" ? "Australia" : "UK"}
                </button>
              ))}
            </div>
            <button type="button" className="tl-btn tl-btn-onink tl-desk" onClick={askReset}>
              Reset demo
            </button>
            <button type="button" className="tl-btn tl-btn-primary" data-spot="report" onClick={() => setTenantOpen(true)}>
              <span className="tl-desk">Report a repair as a tenant</span>
              <span className="tl-mob">Report a repair</span>
            </button>
            <div className="tl-mob tl-menu-wrap" ref={menuRef}>
              <button type="button" className="tl-icon-btn" data-guide-return aria-label="More options" aria-expanded={menu} aria-controls="tl-menu" onClick={() => setMenu((m) => !m)}>
                <IconDots size={20} aria-hidden="true" />
              </button>
              {menu && (
                <div className="tl-menu" id="tl-menu">
                  <button
                    type="button"
                    onClick={() => {
                      offerAsked.current = true;
                      setMenu(false);
                      setOffer(true);
                    }}
                  >
                    Guided tour
                  </button>
                  <p className="tl-menu-h" id="tl-menu-h">
                    Agency
                  </p>
                  {(["AU", "UK"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={sb.region === r}
                      onClick={() => {
                        setMenu(false);
                        if (sb.region !== r) askSwitch(r);
                      }}
                    >
                      {r === "AU" ? "Australia, Sydney" : "UK, Manchester"}
                      {sb.region === r && <IconCheck size={16} aria-hidden="true" />}
                    </button>
                  ))}
                  <button
                    type="button"
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
            <section className="tl-kpis" aria-label="At a glance" data-spot="kpis">
              <Kpi label="Open jobs" value={String(k.open)} note={k.late ? `${k.late} past target` : "All on target"} tone={k.late ? "late" : undefined} />
              <Kpi label="Median time to acknowledge" value={dur(k.medianAckHours)} note="Report to confirmed reply" />
              <Kpi
                label="Urgent jobs on target"
                value={`${k.urgentOnTime} of ${k.urgentTotal}`}
                note={k.urgentOnTime < k.urgentTotal ? `${k.urgentTotal - k.urgentOnTime} missed target` : `Sent to a ${c.contractor} in 2 hours`}
                tone={k.urgentOnTime < k.urgentTotal ? "late" : undefined}
              />
              <Kpi label={`Waiting on ${c.owners}`} value={String(k.waitingOwner)} note={k.waitingOwner ? `Oldest ${dur(k.oldestOwnerHours)}` : "None"} tone={k.oldestOwnerHours > 48 ? "late" : undefined} />
              <Kpi label="Repair spend, 30 days" value={money(sb.region, k.spend30)} note={`Bills entered, incl. ${c.tax}`} />
              <Kpi label="Open repeat faults" value={String(k.repeatOpen)} note="Same fault within 90 days" />
              <Kpi label="Manager hours saved" value={`~${k.hoursSaved}h`} note="Estimate: 25 min a job" />
            </section>

            <div className="tl-filters" data-spot="filters">
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
                  .sort((a, b) => likely(a) - likely(b) || rank[stageClock(a, now, sb.region).state] - rank[stageClock(b, now, sb.region).state] || (st === "billed" ? (b.billedAt ?? 0) - (a.billedAt ?? 0) : a.stageEnteredAt - b.stageEnteredAt))
                  .slice(0, st === "billed" ? 12 : 60);
                const total = jobs.filter((j) => j.stage === st).length;
                return (
                  <section key={st} className="tl-col" aria-labelledby={`col-${st}`} data-spot={`col-${st}`}>
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
      </div>

      {/* Outside #tl-app: a dialog makes the app inert, and inert content is never announced. */}
      <p className="tl-sr" aria-live="polite">
        {announce}
      </p>
      {/* With a dialog open, the dialog shows the error itself, next to what needs fixing. */}
      {error && !open && !tenantOpen && (
        <p className="tl-toast" role="alert">
          {error}
          <button type="button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </p>
      )}

      {/* Closing a dialog clears its error in the same update, so it never flashes up as a board alert. */}
      {open && id && (
        <Drawer
          id={id}
          s={s}
          j={open}
          onClose={() => {
            setError(null);
            setOpenId(null);
          }}
        />
      )}
      {tenantOpen && id && (
        <TenantReport
          id={id}
          sb={sb}
          busy={busy}
          api={s}
          onClose={() => {
            setError(null);
            setTenantOpen(false);
          }}
          onSent={(jobId) => {
            setTenantOpen(false);
            setTab("board");
            setOpenId(jobId);
            triage(jobId);
          }}
        />
      )}
      {confirm && <ConfirmDialog title={confirm.title} body={confirm.body} confirm={confirm.confirm} onConfirm={confirm.run} onClose={() => setConfirm(null)} />}
      {tour && <Guide key={tour} tour={TOURS[tour]} ctx={tourCtx} onClose={() => setTour(null)} />}
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
  const clock = stageClock(j, now, sb.region);
  const untriaged = j.stage === "new" && !j.triage;
  const pills: string[] = [];
  const open = !["done", "billed"].includes(j.stage);
  if (j.urgency === "urgent" && !untriaged && open) pills.push("Urgent");
  if (untriaged && ruleTriage(`${j.title}. ${j.description}`, sb.region).urgency === "urgent") pills.push("Likely urgent");
  if (j.triage?.repeatOf) pills.push("Repeat fault");
  if (untriaged && !pills.includes("Likely urgent")) pills.push("Needs triage");
  if (j.hold === "ownerDeclined") pills.push(`${terms(sb.region).owner[0].toUpperCase()}${terms(sb.region).owner.slice(1)} declined`);
  if (j.invoice?.overApproved && j.stage === "done") pills.push("Invoice over approval");
  // After hours the on-call contractor can be paged, book and even finish before a manager has sent the reply.
  if (j.afterHours && j.triage && !j.triage.confirmedAt && j.stage !== "new") pills.push("Reply to confirm");
  if (j.triage?.needsCheck?.length && !j.triage.confirmedAt) pills.push("Check now");
  if (j.hold === "strata") pills.push(sb.region === "AU" ? "With the strata" : "With the block agent");
  const timer = clock.state === "none" ? "" : `${clock.state === "late" ? "Overdue, " : clock.state === "soon" ? "Due soon, " : ""}${dur(clock.hours)} in this stage`;
  const label = [`${j.ref}, ${j.title}, ${p.address}, ${p.suburb}`, pills.join(", "), untriaged ? "" : tradeLabel(sb.region, j.trade), timer, `Manager ${m.name}`].filter(Boolean).join(". ") + ".";
  return (
    <button type="button" className={`tl-card tl-card-${clock.state}`} onClick={onOpen} aria-label={label} data-job={j.id}>
      <span className="tl-card-r1">
        <span className="tl-ref">{j.ref}</span>
        {clock.state !== "none" && <TimerChip state={clock.state} hours={clock.hours} office={clock.office} compact />}
      </span>
      <span className="tl-card-title">{j.title}</span>
      <span className="tl-card-addr">
        {p.address}, {p.suburb}
      </span>
      {/* Pills get their own row, so a wide one never runs under the avatar. */}
      {pills.length > 0 && (
        <span className="tl-card-pills">
          {pills.map((x) => (
            <span
              key={x}
              className={`tl-pill ${x === "Urgent" ? "tl-pill-urgent" : x === "Likely urgent" || x === "Check now" ? "tl-pill-likely" : x.includes("declined") || x.includes("over") || x === "Reply to confirm" ? "tl-pill-warn" : "tl-pill-neutral"}`}
            >
              {x === "Repeat fault" && <IconRepeat size={12} aria-hidden="true" />}
              {x}
            </span>
          ))}
        </span>
      )}
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
        <Avatar initials={m.initials} name={m.name} />
      </span>
    </button>
  );
}
