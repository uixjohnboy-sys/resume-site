"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BUSINESS, CLOCK_LABEL, DAYS, HANDOFF_REASONS, JOBS, JOB_KIND_LABEL, RULES, TEAMS, WINDOWS, type DayKey, type Team } from "@/lib/deskhand/pack";
import { CARDS, type CardId } from "@/lib/deskhand/seed";
import type { Contact, LogEntry, Sandbox, Visit } from "@/lib/deskhand/types";

// The demo's one screen. The left pane is the customer's text thread; the right pane is what the agent is doing about it.
// Everything shown comes from the server's record, and the reply only appears once the server has checked it.

type Panel = "calendar" | "contact" | "handoffs" | "rules";
type View = "customer" | "office";

const STARTERS: Record<CardId, string[]> = {
  mia: [
    "Hi, how much for a fortnightly clean? 3 bed in Marrickville",
    "I'm Mia. 2 bathrooms, a house, no stairs. Last cleaned about two months ago. No pets. Street parking is fine.",
    "I'll be home on the day",
    "Can you check what's open?",
  ],
  tom: ["Hi it's Tom, can I move my Thursday clean?", "It's under 0491 570 006", "Sorry, it's 0491 570 313", "Any chance of a discount? I've been with you a while", "Yes please, pass it on"],
  priya: ["Hi, do you clean the common areas of a strata building in Glebe?", "It's 40 units and we'd want it weekly. I'm Priya."],
};

const STATUS_LABEL: Record<LogEntry["status"], string> = { done: "Done", checked: "Checked", refused: "Refused", failed: "Failed", flagged: "Flagged" };
const ACTOR_LABEL: Record<LogEntry["actor"], string> = { ai: "Agent", rules: "Fixed rules", safety: "Safety", server: "System" };

async function api(body: unknown) {
  const res = await fetch("/api/deskhand", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return res;
}

export default function Desk() {
  const [sb, setSb] = useState<Sandbox | null>(null);
  const [liveLog, setLiveLog] = useState<LogEntry[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>("calendar");
  const [view, setView] = useState<View>("customer");
  const [changed, setChanged] = useState<Set<string>>(new Set());
  const thread = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<string | null>(null);

  const start = useCallback(async (card: CardId | null) => {
    setNotice(null);
    setChanged(new Set());
    const res = await api({ start: card });
    const data = await res.json();
    if (data.sb) setSb(data.sb);
    else setNotice(data.error ?? "Please try again.");
    setLiveLog([]);
    setPanel("calendar");
  }, []);

  useEffect(() => {
    fetch("/api/deskhand")
      .then((r) => r.json())
      .then((d) => {
        if (d.sb) setSb(d.sb);
        else setNotice(d.error ?? "This demo is paused for a moment.");
      })
      .catch(() => setNotice("This demo is paused for a moment."));
  }, []);

  useEffect(() => {
    thread.current?.scrollTo({ top: thread.current.scrollHeight });
  }, [sb?.conv.messages.length, pending]);

  const send = useCallback(
    async (message: string) => {
      const words = message.trim();
      if (!words || busy) return;
      setBusy(true);
      setPending(words);
      setText("");
      setNotice(null);
      setLiveLog([]);
      try {
        const res = await api({ text: words });
        if (!(res.headers.get("content-type") ?? "").includes("event-stream")) {
          const data = await res.json();
          if (data.sb) setSb(data.sb);
          setNotice(data.reply ?? data.error ?? null);
          return;
        }
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const seen = new Set<string>();
        while (reader) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() ?? "";
          for (const block of blocks) {
            const event = block.match(/^event: (.*)$/m)?.[1];
            const data = block.match(/^data: (.*)$/m)?.[1];
            if (!data) continue;
            const parsed = JSON.parse(data);
            if (event === "log") {
              const entry = parsed as LogEntry;
              setLiveLog((l) => [...l, entry]);
              if (entry.after) Object.keys(entry.after).forEach((k) => seen.add(k));
              if (entry.status === "done") {
                if (entry.tool === "save_contact") setPanel("contact");
                if (entry.tool === "book_visit" || entry.tool === "move_visit") setPanel("calendar");
                if (entry.tool === "hand_off") setPanel("handoffs");
              }
            } else if (event === "done") {
              if (parsed.sb) setSb(parsed.sb);
              else if (parsed.error) setNotice(parsed.error);
              else if (parsed.reply) setNotice(parsed.reply);
              setLiveLog([]);
              setChanged(seen);
            }
          }
        }
      } catch {
        setNotice("That didn't go through. Please try again.");
      } finally {
        setPending(null);
        setBusy(false);
      }
    },
    [busy],
  );

  const reset = useCallback(async () => {
    const res = await api({ reset: true });
    const data = await res.json();
    if (data.sb) setSb(data.sb);
    setLiveLog([]);
    setChanged(new Set());
    setPanel("calendar");
  }, []);

  const conv = sb?.conv;
  const contact = useMemo(() => sb?.contacts.find((c) => c.id === conv?.contactId) ?? null, [sb, conv?.contactId]);
  const log = useMemo(() => {
    const all = [...(sb?.log ?? []), ...liveLog.filter((l) => !(sb?.log ?? []).some((x) => x.seq === l.seq))];
    return all.slice().reverse();
  }, [sb?.log, liveLog]);
  const actions = (sb?.log ?? []).filter((l) => l.status === "done" || l.status === "checked").length + liveLog.filter((l) => l.status === "done").length;

  const replies = useMemo(() => {
    if (!conv?.card || conv.closed) return [] as string[];
    const said = conv.messages.filter((m) => m.from === "customer").map((m) => m.text);
    const open = conv.jobDone ? [] : conv.offers.filter((o) => o.turn === conv.turn).map((o) => `${o.label} please`);
    if (open.length) return open;
    return STARTERS[conv.card as CardId].filter((s) => !said.includes(s)).slice(0, 1);
  }, [conv]);

  const started = Boolean(conv?.contactId);
  const handoffCount = sb?.handoffs.length ?? 0;

  return (
    <div className="dh-app">
      <header className="dh-top">
        <div className="dh-brand">
          <span className="dh-mark" aria-hidden="true" />
          <div>
            <b>Deskhand</b>
            <span>Front desk for {BUSINESS}</span>
          </div>
        </div>
        <p className="dh-clock">Demo time: {CLOCK_LABEL}</p>
        <div className="dh-top-acts">
          <button type="button" className="dh-btn" onClick={reset} disabled={busy}>
            Reset demo
          </button>
          <Link className="dh-btn dh-btn-primary" href="/sample-plan">
            Want one for your business?
          </Link>
        </div>
      </header>
      <p className="dh-note">Demo data, a fictional business. Nothing is really sent.</p>

      <div className="dh-switch" role="tablist" aria-label="View">
        <button type="button" role="tab" aria-selected={view === "customer"} onClick={() => setView("customer")}>
          Customer
        </button>
        <button type="button" role="tab" aria-selected={view === "office"} onClick={() => setView("office")}>
          Back office <span className="dh-count">{actions}</span>
        </button>
      </div>

      <main className="dh-main">
        <section className={`dh-customer ${view === "customer" ? "is-on" : ""}`} aria-label="Customer's text messages">
          <div className="dh-cards" role="group" aria-label="Play a customer">
            {(Object.keys(CARDS) as CardId[]).map((id) => (
              <button key={id} type="button" className={`dh-card ${conv?.card === id ? "is-on" : ""}`} onClick={() => start(id)} disabled={busy}>
                <b>{CARDS[id].name}</b>
                <span>{CARDS[id].suburb}</span>
                <small>{CARDS[id].job}</small>
              </button>
            ))}
            <button type="button" className={`dh-card ${started && !conv?.card ? "is-on" : ""}`} onClick={() => start(null)} disabled={busy}>
              <b>Your own</b>
              <span>Make it up</span>
              <small>Type anything a customer might ask</small>
            </button>
          </div>

          <div className="dh-phone">
            <div className="dh-thread" ref={thread} aria-live="polite">
              {!started && <p className="dh-empty">Pick a customer above. A missed call starts the conversation.</p>}
              {conv?.messages.map((m, i) => (
                <p key={i} className={`dh-msg ${m.from === "customer" ? "from-them" : "from-desk"}`}>
                  {m.text}
                </p>
              ))}
              {pending && <p className="dh-msg from-them">{pending}</p>}
              {busy && <p className="dh-working">Deskhand is working on it</p>}
              {notice && <p className="dh-msg from-desk">{notice}</p>}
            </div>

            {started && (
              <>
                {replies.length > 0 && !busy && (
                  <div className="dh-replies">
                    {replies.map((r) => (
                      <button key={r} type="button" onClick={() => send(r)}>
                        {r}
                      </button>
                    ))}
                  </div>
                )}
                <form
                  className="dh-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(text);
                  }}
                >
                  <label htmlFor="dh-text" className="dh-sr">
                    Your message
                  </label>
                  <input id="dh-text" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Type as the customer" autoComplete="off" disabled={busy} />
                  <button type="submit" className="dh-btn dh-btn-primary" disabled={busy || !text.trim()}>
                    Send
                  </button>
                </form>
                <p className="dh-privacy">Use made-up details. This demo deletes your messages within 48 hours. Our AI provider may keep them for up to 30 days.</p>
              </>
            )}
          </div>
          {busy && <p className="dh-status">{actions} actions so far. See Back office.</p>}
        </section>

        <section className={`dh-office ${view === "office" ? "is-on" : ""}`} aria-label="Back office">
          {conv?.jobDone && <JobDone sb={sb as Sandbox} actions={actions} />}
          <div className="dh-office-grid">
            <div className="dh-log">
              <h2>Work log</h2>
              {log.length === 0 && <p className="dh-empty">What the agent does shows up here as it happens.</p>}
              <ol>
                {log.map((l) => (
                  <li key={l.seq} className={`dh-entry is-${l.status}`}>
                    <span className="dh-pill">{STATUS_LABEL[l.status]}</span>
                    <p>{l.text}</p>
                    <small>{ACTOR_LABEL[l.actor]}</small>
                  </li>
                ))}
              </ol>
            </div>
            <div className="dh-panels">
              <div className="dh-tabs" role="tablist" aria-label="Records">
                {(["calendar", "contact", "handoffs", "rules"] as Panel[]).map((p) => (
                  <button key={p} type="button" role="tab" aria-selected={panel === p} onClick={() => setPanel(p)}>
                    {p === "handoffs" ? `Handoffs${handoffCount ? ` (${handoffCount})` : ""}` : p[0].toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              {sb && panel === "calendar" && <Calendar visits={sb.visits} />}
              {panel === "contact" && <ContactCard contact={contact} changed={changed} />}
              {sb && panel === "handoffs" && <Handoffs sb={sb} />}
              {panel === "rules" && <Rules />}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function JobDone({ sb, actions }: { sb: Sandbox; actions: number }) {
  const handed = sb.handoffs.at(-1);
  const contact = sb.contacts.find((c) => c.id === sb.conv.contactId);
  const visit = sb.visits.filter((v) => v.contactId === sb.conv.contactId && v.isNew).at(-1);
  const ended = handed && HANDOFF_REASONS[handed.reason].ends && !visit;
  return (
    <div className="dh-done">
      <div>
        <h2>{ended ? "Handed to Dana" : "Job done"}</h2>
        <p>
          {ended
            ? `${handed.customer}: ${HANDOFF_REASONS[handed.reason].label}. Dana has the summary and nothing was promised.`
            : visit
              ? `${contact?.firstName}: ${visit.ref}, ${JOB_KIND_LABEL[JOBS[visit.jobKey].kind]}, $${visit.price}. On the calendar with ${TEAMS[visit.team].label}.`
              : "The customer's request is finished."}
        </p>
      </div>
      <dl>
        <div>
          <dt>Actions taken</dt>
          <dd>{actions}</dd>
        </div>
        <div>
          <dt>People involved</dt>
          <dd>0</dd>
        </div>
      </dl>
      <Link className="dh-btn dh-btn-primary" href="/sample-plan">
        Send me your brief
      </Link>
    </div>
  );
}

const THIS_WEEK: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat"];
const NEXT_WEEK: DayKey[] = ["next-mon", "next-tue", "next-wed", "next-thu", "next-fri"];
const short = (day: DayKey) => DAYS[day].label.replace("next ", "").slice(0, 3);
const hhmm = (m: number) => {
  const h = Math.floor(m / 60);
  return `${h > 12 ? h - 12 : h} ${h >= 12 ? "pm" : "am"}`;
};

function Calendar({ visits }: { visits: Visit[] }) {
  const inNext = visits.some((v) => v.isNew && NEXT_WEEK.includes(v.day));
  const [chosen, setWeek] = useState<"this" | "next" | null>(null);
  const week = chosen ?? (inNext ? "next" : "this");
  const days = week === "this" ? THIS_WEEK : NEXT_WEEK;
  return (
    <div className="dh-cal">
      <div className="dh-cal-head">
        <h2>{week === "this" ? "This week" : "Next week"}</h2>
        <div>
          <button type="button" className="dh-btn" disabled={week === "this"} onClick={() => setWeek("this")}>
            This week
          </button>
          <button type="button" className="dh-btn" disabled={week === "next"} onClick={() => setWeek("next")}>
            Next week
          </button>
        </div>
      </div>
      <div className="dh-cal-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Team</th>
              {days.map((d) => (
                <th key={d} scope="col">
                  {short(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(Object.keys(TEAMS) as Team[]).map((t) => (
              <tr key={t}>
                <th scope="row">{TEAMS[t].label}</th>
                {days.map((d) => (
                  <td key={d}>
                    {visits
                      .filter((v) => v.team === t && v.day === d)
                      .sort((a, b) => a.start - b.start)
                      .map((v) => (
                        <div key={v.id} className={`dh-visit ${v.isNew ? "is-new" : ""}`}>
                          <b>{v.customer}</b>
                          <span>
                            {hhmm(v.start)}, {JOB_KIND_LABEL[JOBS[v.jobKey].kind].replace(" clean", "")}, {JOBS[v.jobKey].beds}-bed
                          </span>
                          <small>{v.suburb}</small>
                        </div>
                      ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="dh-cal-note">Arrival windows start at {WINDOWS.map((w) => hhmm(w.start)).join(", ")}.</p>
    </div>
  );
}

const FIELDS: [keyof Contact, string][] = [
  ["firstName", "First name"],
  ["suburb", "Suburb"],
  ["phone", "Mobile"],
  ["bedrooms", "Bedrooms"],
  ["access", "Access"],
  ["frequency", "Wants"],
  ["notes", "Notes"],
];
const STAGES = ["New enquiry", "Details collected", "Booked", "Handed to Dana"];

function ContactCard({ contact, changed }: { contact: Contact | null; changed: Set<string> }) {
  if (!contact) return <p className="dh-empty">No customer yet. A contact is created when the call is missed.</p>;
  return (
    <div className="dh-contact">
      <ol className="dh-stages" aria-label="Pipeline">
        {STAGES.map((s) => (
          <li key={s} className={contact.stage === s ? "is-on" : ""} aria-current={contact.stage === s ? "step" : undefined}>
            {s}
          </li>
        ))}
      </ol>
      <dl>
        {FIELDS.map(([k, label]) => (
          <div key={k} className={changed.has(k) ? "is-changed" : ""}>
            <dt>{label}</dt>
            <dd>{contact[k] === null || contact[k] === "" ? <span className="dh-none">Not yet</span> : String(contact[k])}</dd>
          </div>
        ))}
      </dl>
      <p className="dh-cal-note">Address and access are confirmed by phone, never stored here.</p>
    </div>
  );
}

function Handoffs({ sb }: { sb: Sandbox }) {
  if (!sb.handoffs.length) return <p className="dh-empty">Nothing waiting for Dana. Try Priya&apos;s strata building, or ask for a person.</p>;
  return (
    <ul className="dh-handoffs">
      {sb.handoffs.map((h) => (
        <li key={h.id}>
          <b>{h.customer}</b>
          <p>{HANDOFF_REASONS[h.reason].label}</p>
          {h.aiSummary && (
            <p className="dh-summary">
              <span>AI summary</span> {h.aiSummary}
            </p>
          )}
          {h.refused.length > 0 && <small>Refused earlier: {h.refused.join("; ")}</small>}
        </li>
      ))}
    </ul>
  );
}

function Rules() {
  return (
    <div className="dh-rules">
      <div>
        <h2>Does on its own</h2>
        <ul>
          {RULES.alone.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Must hand to Dana</h2>
        <ul>
          {RULES.asks.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
      <p className="dh-rules-note">A real build starts with you approving each reply, then widens what it does alone as it earns it.</p>
    </div>
  );
}
