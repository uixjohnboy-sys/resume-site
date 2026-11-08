"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BUSINESS, CLOCK_LABEL, DAYS, EXTRAS_Q, HANDOFF_REASONS, JOBS, JOB_KIND_LABEL, MOVE_OUT_Q, RULES, TEAMS, WINDOWS, type DayKey, type Team } from "@/lib/deskhand/pack";
import { CARDS, type CardId } from "@/lib/deskhand/seed";
import type { Contact, Conversation, LogEntry, Offer, Sandbox, Visit } from "@/lib/deskhand/types";
import Guide from "@/components/guide/Guide";
import { TOUR, type TourCtx } from "./tour";

// The demo's one screen. The left pane is the customer's text thread; the right pane is what the agent is doing about it.
// Everything shown comes from the server's record, and the reply only appears once the server has checked it.

type Panel = "calendar" | "contact" | "handoffs" | "rules";
type View = "customer" | "office";
type Reply = { label: string; send: string };

const STATUS_LABEL: Record<LogEntry["status"], string> = { done: "Done", checked: "Checked", refused: "Refused", failed: "Failed", flagged: "Flagged" };
const ACTOR_LABEL: Record<LogEntry["actor"], string> = { ai: "Agent", rules: "Fixed rules", safety: "Safety", server: "System" };
const WEIGHTY = new Set(["book_visit", "move_visit", "hand_off"]);

const shortDay = (o: Offer) => DAYS[o.day].label.replace("next ", "Next ").replace(/(Next )?(\w{3})\w*/, "$1$2");
const shortSlot = (o: Offer) => {
  const w = WINDOWS.find((x) => x.start === o.start)?.label.replace(" and ", " to ") ?? "";
  return `${shortDay(o)}, ${w}`;
};

/** The next thing the customer could say, chosen from what has really happened, so a tap can never be out of step. */
function nextReplies(conv: Conversation, contact: Contact | null): Reply[] {
  const said = conv.messages.filter((m) => m.from === "customer").map((m) => m.text);
  const lastAgent = [...conv.messages].reverse().find((m) => m.from === "agent")?.text ?? "";
  const one = (send: string): Reply[] => (said.includes(send) ? [] : [{ label: send, send }]);
  // The windows on offer now: the latest set, if it came after the job was done (a second change) or the job is still open.
  const latest = conv.offers.at(-1)?.turn;
  const slots = latest === undefined || (conv.jobDone && (conv.doneTurn === undefined || latest <= conv.doneTurn)) ? [] : conv.offers.filter((o) => o.turn === latest);
  if (slots.length) {
    const windows = slots.map((o) => ({ label: shortSlot(o), send: `${o.label} please` }));
    // A pick can't book while home or lockbox is missing, so the answer to that comes first, or the pick loops (G4 DD, M1).
    const needAccess = contact && !contact.access && !conv.verifiedContactId;
    return needAccess ? [{ label: "I'll be home on the day", send: "I'll be home on the day" }, { label: "I'll leave a key in a lockbox", send: "I'll leave a key in a lockbox" }, ...windows] : windows;
  }
  // The fixed rules ask two questions of their own; their answers are taps for every customer, typed or carded.
  if (!conv.jobDone && lastAgent.includes(MOVE_OUT_Q)) return [{ label: "No, a regular home clean", send: "No, a regular home clean" }, { label: "Yes, an end of lease clean", send: "Yes, an end of lease clean" }];
  if (!conv.jobDone && lastAgent.includes(EXTRAS_Q)) return [{ label: "No extras", send: "No extras" }, { label: "The oven", send: "The oven please" }, { label: "Inside the fridge", send: "Inside the fridge please" }, { label: "Both", send: "Both, the oven and fridge" }];
  if (!conv.card) return [];
  if (conv.card === "mia") {
    if (conv.jobDone) return [];
    // Access rides on the second message, so the beat takes one AI turn fewer (G4 Product Lead, M2).
    const script = [
      "Hi, how much for a fortnightly clean? 3 bed in Marrickville",
      "I'm Mia. 2 bathrooms, a house, no stairs, no pets. Last cleaned about two months ago. Street parking is fine, and I'll be home on the day.",
      "Can you check what's open?",
    ];
    const next = script.find((s) => !said.includes(s));
    return next ? one(next) : [{ label: "Any day is fine. What's open?", send: "Any day is fine. What's open?" }];
  }
  if (conv.card === "tom") {
    if (conv.jobDone) {
      if (/pass/i.test(lastAgent) && !said.includes("Yes please, pass it on")) return one("Yes please, pass it on");
      return one("Any chance of a discount? I've been with you a while");
    }
    if (conv.verifiedContactId) return [{ label: "What's open?", send: "What's open? Any day is fine." }];
    const script = ["Hi it's Tom, can I move my Thursday clean?", "It's under 0491 570 159", "Sorry, it's 0491 570 313"];
    return one(script.find((s) => !said.includes(s)) ?? script[2]);
  }
  if (conv.card === "priya") {
    return conv.jobDone ? one("It's 40 units and we'd want it weekly. I'm Priya.") : one("Hi, do you clean the common areas of a strata building in Glebe?");
  }
  return [];
}

async function api(body: unknown) {
  return fetch("/api/deskhand", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
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
  const [pending, setPending] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const [touring, setTouring] = useState(false);
  const thread = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const replyBox = useRef<HTMLDivElement>(null);

  const start = useCallback(async (card: CardId | null) => {
    setNotice(null);
    setChanged(new Set());
    setBusy(true);
    try {
      const res = await api({ start: card });
      const data = await res.json();
      if (data.sb) setSb(data.sb);
      else setNotice(data.error ?? "Please try again.");
    } catch {
      setNotice("Please try again.");
    } finally {
      setBusy(false);
    }
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
  }, [sb?.conv.messages.length, pending, notice]);

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
          setPending(null);
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
              if (entry.status === "done" && WEIGHTY.has(entry.tool)) setAnnounce(entry.text);
            } else if (event === "done") {
              // The record and the end of the pending bubble land in one update, so the customer's message is never on screen twice
              // (G4 Accessibility recheck, M5).
              setPending(null);
              setBusy(false);
              if (parsed.sb) setSb(parsed.sb);
              else if (parsed.error) setNotice(parsed.error);
              else if (parsed.reply) setNotice(parsed.reply);
              setLiveLog([]);
              setChanged(seen);
            }
          }
        }
      } catch {
        // The server may have finished the turn even though the answer never arrived, so show what the record says.
        setNotice("That didn't go through. Please try again.");
        fetch("/api/deskhand")
          .then((r) => r.json())
          .then((d) => {
            if (d.sb) setSb(d.sb);
          })
          .catch(() => {});
      } finally {
        setPending(null);
        setBusy(false);
      }
    },
    [busy],
  );

  // The tapped button is gone and the field was disabled, so focus has to be put somewhere on purpose. A reply button on any device;
  // the text field only on a fine pointer, where focusing it does not pop a keyboard.
  const wasBusy = useRef(false);
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (wasBusy.current && !busy) {
      const next = replyBox.current?.querySelector("button") ?? (coarse ? null : input.current);
      next?.focus({ preventScroll: true });
      // At 200% and 400% zoom the reply sits below the fold: bring it into view without jumping the page (G4 Accessibility, M3).
      next?.scrollIntoView({ block: "nearest" });
    }
    wasBusy.current = busy;
  }, [busy]);

  // The inline "See Back office" hides the pane focus was in, so focus goes to the result card's heading (G4 Accessibility, M2).
  const outcomeHead = useRef<HTMLHeadingElement>(null);
  const toOffice = useCallback(() => {
    setView("office");
    requestAnimationFrame(() => outcomeHead.current?.focus());
  }, []);

  const reset = useCallback(async () => {
    const res = await api({ reset: true });
    const data = await res.json();
    if (data.sb) setSb(data.sb);
    setLiveLog([]);
    setChanged(new Set());
    setPanel("calendar");
    setNotice(null);
    setAnnounce("Demo reset.");
  }, []);

  const conv = sb?.conv;
  const contact = useMemo(() => sb?.contacts.find((c) => c.id === conv?.contactId) ?? null, [sb, conv?.contactId]);
  const log = useMemo(() => {
    const saved = (sb?.log ?? []).filter((l) => l.conv === sb?.convNo);
    return [...saved, ...liveLog.filter((l) => !saved.some((x) => x.seq === l.seq))].reverse();
  }, [sb?.log, sb?.convNo, liveLog]);
  const actions = log.filter((l) => l.status === "done" || l.status === "checked").length;
  const replies = useMemo(() => (conv ? nextReplies(conv, contact) : []), [conv, contact]);
  const started = Boolean(conv?.contactId);
  const handoffs = sb?.handoffs ?? [];
  const waiting = handoffs.filter((h) => h.contactId === conv?.contactId).length;

  const tourCtx: TourCtx = useMemo(
    () => ({
      sb,
      busy,
      log,
      go: {
        customer: () => setView("customer"),
        office: () => setView("office"),
        panel: (p) => setPanel(p),
        start: (card) => {
          // Back to the thread, so the new customer and their first reply are on screen and take the focus (G4 A11y recheck, M1).
          setView("customer");
          setTouring(false);
          void start(card);
        },
      },
      contact: { book: "/book", brief: "/sample-plan" },
    }),
    [sb, busy, log, start],
  );

  return (
    <div className={`dh-app ${started ? "is-started" : ""}`}>
      <header className="dh-top">
        <div className="dh-brand">
          <span className="dh-mark" aria-hidden="true">
            <i />
          </span>
          <div>
            <b>Deskhand</b>
            <span>Front desk for {BUSINESS}</span>
          </div>
        </div>
        <p className="dh-clock">Demo time: {CLOCK_LABEL}</p>
        <p className="dh-note">Demo data, a fictional business. Nothing is really sent.</p>
        <div className="dh-top-acts">
          {/* Always on the page, so closing the tour can hand focus back to it (G4 Accessibility, M1). */}
          <button type="button" className="dh-btn dh-btn-primary" data-guide-return onClick={() => setTouring(true)} disabled={busy || touring}>
            Take the tour
          </button>
          <button type="button" className="dh-btn" onClick={reset} disabled={busy}>
            Reset demo
          </button>
          <Link className="dh-btn dh-only-wide" href="/book">
            Want one for your business?
          </Link>
        </div>
      </header>

      <div className="dh-switch">
        <button type="button" aria-pressed={view === "customer"} onClick={() => setView("customer")}>
          Customer
        </button>
        <button type="button" aria-pressed={view === "office"} onClick={() => setView("office")}>
          Back office <span className="dh-count">{actions}</span>
        </button>
      </div>

      <p className="dh-sr" role="status">
        {announce}
      </p>

      <main className="dh-main">
        <section className={`dh-customer ${view === "customer" ? "is-on" : ""}`} aria-label="Customer's text messages">
          <div className="dh-cards" role="group" aria-label="Play a customer" data-spot="cards">
            {(Object.keys(CARDS) as CardId[]).map((id) => (
              <button key={id} type="button" className={`dh-card ${conv?.card === id ? "is-on" : ""}`} aria-pressed={conv?.card === id} onClick={() => start(id)} disabled={busy}>
                <b>{CARDS[id].name}</b>
                <span>{CARDS[id].suburb}</span>
                <small>{CARDS[id].job}</small>
              </button>
            ))}
            <button type="button" className={`dh-card ${started && !conv?.card ? "is-on" : ""}`} aria-pressed={started && !conv?.card} onClick={() => start(null)} disabled={busy}>
              <b>Your own</b>
              <span>Make it up</span>
              <small>Type anything a customer might ask</small>
            </button>
          </div>

          <div className="dh-phone">
            {started && (
              <p className="dh-thread-head">
                <b>{contact?.firstName ?? "New customer"}</b> {contact?.phone}
              </p>
            )}
            <div className="dh-thread" data-spot="thread" ref={thread} role="log" aria-label="Messages" aria-live="polite" tabIndex={0}>
              {!started && <p className="dh-empty">Pick a customer above. A missed call starts the conversation.</p>}
              {/* The message being sent keeps its place and its node when the server's copy arrives, so it is announced once (G4 A11y, M5). */}
              {[...(conv?.messages ?? []), ...(pending ? [{ from: "customer" as const, text: pending }] : [])].map((m, i) => (
                <p key={i} className={`dh-msg ${m.from === "customer" ? "from-them" : "from-desk"}`}>
                  <span className="dh-sr">{m.from === "customer" ? "Customer: " : "Larkfield: "}</span>
                  {m.text}
                </p>
              ))}
              {busy && (
                <p className="dh-working" aria-hidden="true">
                  Deskhand is working on it
                </p>
              )}
              {notice && <p className="dh-msg from-desk">{notice}</p>}
            </div>

            {started && (
              <div className="dh-compose">
                <p className="dh-status">
                  {conv?.jobDone ? "Job done. " : ""}
                  {actions} {actions === 1 ? "action" : "actions"}.{" "}
                  <button type="button" onClick={toOffice}>
                    See Back office
                  </button>
                </p>
                {replies.length > 0 && (
                  <div className={`dh-replies ${replies.length > 1 ? "is-grid" : ""}`} ref={replyBox} data-spot="replies">
                    {replies.map((r) => (
                      <button key={r.send} type="button" onClick={() => send(r.send)} disabled={busy}>
                        {r.label}
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
                    Your message, as the customer
                  </label>
                  <input ref={input} id="dh-text" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Type as the customer" autoComplete="off" disabled={busy} />
                  <button type="submit" className="dh-send" disabled={busy || !text.trim()}>
                    Send
                  </button>
                </form>
                <p className="dh-privacy">Use made-up details. This demo deletes your messages within 48 hours. They are processed in the US, and our AI provider deletes them within 30 days unless they are flagged for misuse.</p>
              </div>
            )}
          </div>
        </section>

        <section className={`dh-office ${view === "office" ? "is-on" : ""}`} aria-label="Back office">
          <Outcome log={log} jobDone={Boolean(conv?.jobDone)} started={started} actions={actions} waiting={waiting} headRef={outcomeHead} />
          <div className="dh-office-grid">
            <div className="dh-log" data-spot="log">
              <h2>Work log{contact?.firstName ? `: ${contact.firstName}` : ""}</h2>
              <div className="dh-scroll">
                {log.length === 0 && <p className="dh-empty">What the agent does shows up here as it happens.</p>}
                <ol>
                  {log.map((l) => (
                    <li key={l.seq} className={`dh-entry is-${l.status} ${WEIGHTY.has(l.tool) && l.status === "done" ? "is-big" : ""}`}>
                      <span className="dh-pill">{STATUS_LABEL[l.status]}</span>
                      <p>{l.text}</p>
                      <small>
                        {l.clock}, {ACTOR_LABEL[l.actor]}
                      </small>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="dh-panels" data-spot="panels">
              <div className="dh-tabs" role="group" aria-label="Records">
                {(["calendar", "contact", "handoffs", "rules"] as Panel[]).map((p) => (
                  <button key={p} type="button" aria-pressed={panel === p} onClick={() => setPanel(p)}>
                    {p === "handoffs" ? `Handoffs${handoffs.length ? ` (${handoffs.length})` : ""}` : p[0].toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <div className="dh-scroll">
                {sb && panel === "calendar" && <Calendar visits={sb.visits} />}
                {panel === "contact" && <ContactCard contact={contact} changed={changed} />}
                {sb && panel === "handoffs" && <Handoffs sb={sb} />}
                {panel === "rules" && <Rules />}
              </div>
            </div>
          </div>
        </section>
      </main>
      {touring && <Guide tour={TOUR} ctx={tourCtx} onClose={() => setTouring(false)} />}
    </div>
  );
}

/** Always the same height, so the moment a job finishes nothing on the screen jumps. */
function Outcome({ log, jobDone, started, actions, waiting, headRef }: { log: LogEntry[]; jobDone: boolean; started: boolean; actions: number; waiting: number; headRef: React.RefObject<HTMLHeadingElement | null> }) {
  // What the customer came for comes first: a booking moved and a discount passed on is still a job done.
  // The hand-off headline is the first one made (the job), not a later "Added to Dana's card" row (G4 PL m8).
  const big = log.find((l) => (l.tool === "book_visit" || l.tool === "move_visit") && l.status === "done") ?? [...log].reverse().find((l) => l.tool === "hand_off" && l.status === "done");
  const handedOnly = big?.tool === "hand_off";
  return (
    <div className={`dh-done ${jobDone ? "is-on" : ""} ${handedOnly && jobDone ? "is-handed" : ""}`} data-spot="outcome">
      <div>
        <h2 ref={headRef} tabIndex={-1}>
          {jobDone ? (handedOnly ? "Handed to Dana" : "Job done") : started ? "In progress" : "Waiting for a call"}
        </h2>
        <p>{jobDone && big ? big.text : started ? "The agent is working through this with the customer." : "Pick a customer to start."}</p>
      </div>
      <dl>
        <div>
          <dt>Actions taken</dt>
          <dd>{actions}</dd>
        </div>
        {waiting > 0 ? (
          <div>
            <dt>Waiting on Dana</dt>
            <dd>{waiting}</dd>
          </div>
        ) : (
          <div>
            <dt>People involved</dt>
            <dd>0</dd>
          </div>
        )}
      </dl>
      {/* The next step is a real one: a call booked on John Boy's calendar, with the sample plan as a quiet second (G4 PL, M1). */}
      <div className="dh-done-acts">
        <Link className={`dh-btn ${jobDone ? "dh-btn-primary" : ""}`} href="/book">
          Book a 15-min call
        </Link>
        <Link className="dh-done-link" href="/sample-plan">
          See what a plan looks like
        </Link>
      </div>
    </div>
  );
}

const THIS_WEEK: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat"];
const NEXT_WEEK: DayKey[] = ["next-mon", "next-tue", "next-wed", "next-thu", "next-fri", "next-sat"];
const short = (day: DayKey) => DAYS[day].label.replace("next ", "").slice(0, 3);
const hour = (m: number) => {
  const h = Math.floor(m / 60);
  return `${h > 12 ? h - 12 : h} ${h >= 12 ? "pm" : "am"}`;
};

function Calendar({ visits }: { visits: Visit[] }) {
  const inNext = visits.some((v) => v.isNew && NEXT_WEEK.includes(v.day));
  const [chosen, setWeek] = useState<"this" | "next" | null>(null);
  const week = chosen ?? (inNext ? "next" : "this");
  const days = week === "this" ? THIS_WEEK : NEXT_WEEK;
  const fresh = useRef<HTMLDivElement>(null);
  const newest = visits.filter((v) => v.isNew).at(-1)?.id;
  useEffect(() => {
    fresh.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [newest, week]);
  return (
    <div className="dh-cal">
      <div className="dh-cal-head" role="group" aria-label="Week">
        <button type="button" className="dh-btn" aria-pressed={week === "this"} onClick={() => setWeek("this")}>
          This week
        </button>
        <button type="button" className="dh-btn" aria-pressed={week === "next"} onClick={() => setWeek("next")}>
          Next week
        </button>
      </div>
      <div className="dh-cal-scroll" tabIndex={0} role="region" aria-label="Calendar">
        <table>
          <thead>
            <tr>
              <th scope="col">Team</th>
              {days.map((d) => (
                <th key={d} scope="col">
                  {short(d)}
                  {d === "tue" ? " (today)" : ""}
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
                        <div key={v.id} ref={v.id === newest ? fresh : undefined} className={`dh-visit ${v.isNew ? "is-new" : ""}`}>
                          <b>{v.customer}</b>
                          <span>{hour(v.start)}</span>
                          <span>
                            {JOB_KIND_LABEL[JOBS[v.jobKey].kind].replace(" clean", "")}, {JOBS[v.jobKey].beds}&#8209;bed
                          </span>
                          <span className="dh-sub">{v.suburb}</span>
                        </div>
                      ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="dh-cal-note">Times are the start of the arrival window. The full job and travel are blocked out.</p>
    </div>
  );
}

const FIELDS: [keyof Contact, string][] = [
  ["firstName", "First name"],
  ["suburb", "Suburb"],
  ["phone", "Mobile"],
  ["bedrooms", "Bedrooms"],
  ["access", "Access"],
  ["frequency", "How often"],
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
          <div key={k}>
            <dt>{label}</dt>
            <dd>
              {contact[k] === null || contact[k] === "" ? <span className="dh-none">Not yet</span> : String(contact[k])}
              {changed.has(k) && <span className="dh-updated"> Updated</span>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="dh-cal-note">Address and access come through a secure link, never this chat, and are not stored here.</p>
    </div>
  );
}

function Handoffs({ sb }: { sb: Sandbox }) {
  if (!sb.handoffs.length) return <p className="dh-empty">Nothing waiting for Dana. Try Priya&apos;s strata building, or ask for a person.</p>;
  return (
    <ul className="dh-handoffs">
      {[...sb.handoffs].reverse().map((h) => (
        <li key={h.id}>
          <div className="dh-handoff-head">
            <b>{h.customer}</b>
            <span>{h.phone}</span>
            <span className="dh-promise">{h.promised}</span>
          </div>
          <p>{HANDOFF_REASONS[h.reason].label}</p>
          {h.items.length > 0 && (
            <div className="dh-summary">
              <span>{h.actor === "ai" ? "AI summary" : "From the customer"}</span>
              <ul>
                {h.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
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
