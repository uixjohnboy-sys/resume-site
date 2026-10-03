"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { setVoiceLevel, voice } from "./voice";
import { FACTS } from "@/lib/twin/facts";

// The chat behind "Talk to my AI" (server: src/app/api/twin/route.ts and
// src/app/api/twin/lead/route.ts).
//
// Opens on the "v3:chat-open" window event that TwinVoice's button sends.
// On wide screens it takes the copy column's place, so the visitor talks
// facing the twin; on phones and tablets it is a bottom sheet. While an
// answer streams, the cyborg half "speaks": the stage switches to
// data-twin="speaking" and each arriving chunk pulses the same voice level
// the intro audio drives, so the eye and particles react to the text.
//
// Cost rules (JB, 2026-10-03):
// - The four suggestion questions are answered right here from written
//   answers built only from the fact sheet: free, instant, no gate.
// - A question of the visitor's own needs a name and email first (the
//   contact gate). The pass from /api/twin/lead is kept in localStorage for
//   its 24 hours, so a returning visitor is not asked twice.
//
// Every answer carries a trace ("See how I answered"): which verified facts
// it used and, for AI answers, the model, timings, tokens and the cost of
// that one answer.

type Trace = {
  canned?: boolean;
  model?: string;
  facts: string[];
  firstTokenMs?: number | null;
  totalMs?: number;
  inputTokens?: number;
  cachedTokens?: number;
  outputTokens?: number;
  costUsd?: number;
};

// The diagnosis shown while an answer is prepared (JB, 2026-10-03: he wanted
// a countdown moment before the solution appears). Every step is real: the
// facts listed are the ones the answer cites, and the answer is already in
// hand before the countdown runs, so nothing is ever faked or delayed past
// about eight seconds.
type Diag = { step: 1 | 2 | 3 | 4; tick: string; facts: string[]; count: number; elapsed: string };

type Msg = { role: "user" | "assistant"; content: string; trace?: Trace; note?: boolean; diag?: Diag; live?: boolean };

// What the scanner is "looking through": the parts of his 58 builds.
const SYSTEMS = [
  "workflows", "pipelines", "webhook handlers", "Stripe lifecycle", "A2P 10DLC", "v2 API calls", "Coach OS",
  "snapshots", "sub-accounts", "Next.js apps", "Firebase rules", "n8n flows", "Zapier zaps", "Make scenarios",
  "calendars", "forms", "email templates", "scheduled jobs", "idempotency keys", "signed contracts",
];

type Answer = { text: string; trace?: Trace; note?: boolean; gate?: boolean };

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

const GREETING =
  "I'm John Boy's AI. He built me, so I only know what he has actually shipped. Ask me anything about his work, or tell me what's broken in yours.";

// Written from src/lib/twin/facts.ts only. Keep them in step with it.
const FAQ: { q: string; a: string; facts: string[] }[] = [
  {
    q: "What can he build in GoHighLevel?",
    a: "Five years and 58 client systems inside GoHighLevel: workflows, pipelines, snapshots, sub-accounts, funnels, calendars and forms, with n8n, Zapier and Make for automation. Where GoHighLevel stops, he keeps building with webhooks, the v2 API, Stripe, A2P 10DLC and full Next.js apps wired back into the CRM. Send him one workflow that isn't firing and he'll tell you what's wrong with it, free: uix.johnboy@gmail.com.",
    facts: ["ghl", "beyond", "offer"],
  },
  {
    q: "My client got charged twice. Can he fix that?",
    a: "That usually means Stripe retried the webhook and the handler wasn't idempotent, so one payment ran twice. In his builds every write path is idempotent, so a payment delivered five times is recorded once. You can watch exactly that in the cards on this page. Send him the workflow or the handler and he'll pinpoint it: uix.johnboy@gmail.com.",
    facts: ["walls", "idempotent", "offer"],
  },
  {
    q: "What is Coach OS?",
    a: "Coach OS is a client-management platform for one-to-one coaches that he built from zero and wired into GoHighLevel in both directions: four lead tools, a passwordless client portal with an AI companion, e-signed agreements and Stripe subscriptions. It's 30,275 lines of code with 36 API endpoints and 10 scheduled jobs, running live on a labelled sample practice. Case study: johnboydesign.com/coach-os. Live tour: coachos.johnboydesign.com/tour.",
    facts: ["coachos", "coachos-parts", "billing"],
  },
  {
    q: "How do I hire him?",
    a: "Easiest start: send him one automation that isn't firing or one funnel that isn't converting, and he'll tell you exactly what's wrong with it, free. Email uix.johnboy@gmail.com or book a call at johnboydesign.com/book. He quotes each project after seeing the scope.",
    facts: ["offer"],
  },
];

const STORE = "v3-twin-chat";
const PASS_STORE = "v3-twin-pass";
const MAX_CHARS = 800;

const title = (id: string) => FACTS.find((f) => f.id === id)?.title ?? id;

function loadMsgs(): Msg[] | null {
  try {
    const raw = sessionStorage.getItem(STORE);
    const parsed = raw ? (JSON.parse(raw) as Msg[]) : null;
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    // Storage blocked or corrupt: start fresh.
  }
  return null;
}

function loadPass(): string | null {
  try {
    const raw = localStorage.getItem(PASS_STORE);
    if (!raw) return null;
    const { pass, until } = JSON.parse(raw) as { pass: string; until: number };
    return pass && until > Date.now() ? pass : null;
  } catch {
    return null;
  }
}

function savePass(pass: string | null) {
  try {
    if (pass) localStorage.setItem(PASS_STORE, JSON.stringify({ pass, until: Date.now() + 23 * 60 * 60 * 1000 }));
    else localStorage.removeItem(PASS_STORE);
  } catch {
    // Not saved: they will be asked again next visit.
  }
}

function Diagnosis({ d }: { d: Diag }) {
  const st = (n: number) => (d.step > n ? "done" : d.step === n ? "active" : "todo");
  return (
    <div className="v3-diag" data-step={d.step}>
      <p className="v3-diag-head">
        <i className="v3-diag-ring" /> Diagnosing <span>{d.elapsed}</span>
      </p>
      <ol className="v3-diag-steps">
        <li data-s={st(1)}>Reading your message</li>
        <li data-s={st(2)}>
          Scanning 58 client systems
          {d.step === 2 ? <code>{d.tick}</code> : null}
        </li>
        <li data-s={st(3)}>
          Matching verified facts
          {d.step >= 3 ? (
            <span className="v3-diag-facts">
              {d.facts.length ? (
                d.facts.map((id) => (
                  <i key={id} className="v3-trace-fact">
                    {title(id)}
                  </i>
                ))
              ) : (
                <i className="v3-trace-none">general reply</i>
              )}
            </span>
          ) : null}
        </li>
      </ol>
      {d.step === 4 ? (
        <p className="v3-diag-count" key={d.count}>
          {d.count}
        </p>
      ) : null}
    </div>
  );
}

function TraceView({ t }: { t: Trace }) {
  return (
    <dl className="v3-trace">
      <dt>facts used</dt>
      <dd>
        {t.facts.length ? (
          t.facts.map((id) => (
            <span className="v3-trace-fact" key={id}>
              {title(id)}
            </span>
          ))
        ) : (
          <span className="v3-trace-none">none, general reply</span>
        )}
      </dd>
      {t.canned ? (
        <>
          <dt>source</dt>
          <dd>written answer, no AI call</dd>
          <dt>cost</dt>
          <dd>$0</dd>
        </>
      ) : (
        <>
          <dt>model</dt>
          <dd>{t.model}</dd>
          <dt>first word</dt>
          <dd>{t.firstTokenMs != null ? `${(t.firstTokenMs / 1000).toFixed(2)}s` : "n/a"}</dd>
          <dt>full answer</dt>
          <dd>{((t.totalMs ?? 0) / 1000).toFixed(2)}s</dd>
          <dt>tokens</dt>
          <dd>
            {(t.inputTokens ?? 0).toLocaleString("en-US")} in ({(t.cachedTokens ?? 0).toLocaleString("en-US")} from
            cache), {(t.outputTokens ?? 0).toLocaleString("en-US")} out
          </dd>
          <dt>cost</dt>
          <dd>${(t.costUsd ?? 0).toFixed(4)}</dd>
        </>
      )}
    </dl>
  );
}

export default function TwinChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ role: "assistant", content: GREETING, note: true }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [shown, setShown] = useState<number | null>(null);
  const [pass, setPass] = useState<string | null>(null);
  const [gate, setGate] = useState<{ pending: string } | null>(null);
  const [gateErr, setGateErr] = useState("");
  const [gateBusy, setGateBusy] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const loaded = useRef(false);

  // Restore after hydration (storage is client-only).
  useEffect(() => {
    const restored = loadMsgs();
    const p = loadPass();
    loaded.current = true;
    Promise.resolve().then(() => {
      if (restored) setMsgs(restored);
      if (p) setPass(p);
    });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      sessionStorage.setItem(STORE, JSON.stringify(msgs));
    } catch {
      // Not saved; harmless.
    }
  }, [msgs]);

  // Open on the button's event; mark the page so CSS can swap the copy out.
  useEffect(() => {
    const root = document.getElementById("v3-root");
    const onOpen = () => setOpen(true);
    window.addEventListener("v3:chat-open", onOpen);
    return () => {
      window.removeEventListener("v3:chat-open", onOpen);
      root?.removeAttribute("data-chat");
    };
  }, []);

  useEffect(() => {
    const root = document.getElementById("v3-root");
    if (open) {
      root?.setAttribute("data-chat", "open");
      window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 250);
    } else {
      root?.removeAttribute("data-chat");
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Keep the newest message (or the gate) in view.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, open, gate]);

  useEffect(() => {
    if (gate) window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 50);
  }, [gate]);

  const patchLast = (fn: (m: Msg) => Msg) =>
    setMsgs((cur) => {
      const next = cur.slice();
      next[next.length - 1] = fn(next[next.length - 1]);
      return next;
    });

  // The diagnosis, then the answer typed out live. "answer" is already being
  // fetched; the steps run in parallel and never finish before it arrives.
  const dramatize = useCallback(
    async (answer: Promise<Answer>, canned: boolean) => {
      const stage = rootRef.current?.closest(".v3-hero")?.querySelector(".v3-stage") as HTMLElement | null;
      const t0 = performance.now();
      const elapsed = () => {
        const ms = performance.now() - t0;
        return `0:${String(Math.floor(ms / 1000)).padStart(2, "0")}.${Math.floor((ms % 1000) / 100)}`;
      };
      const diag: Diag = { step: 1, tick: SYSTEMS[0], facts: [], count: 3, elapsed: "0:00.0" };
      const show = () => patchLast((m) => ({ ...m, diag: { ...diag } }));
      show();

      // The twin scans: the eye and smoke pulse, a scan line crosses the face.
      stage?.setAttribute("data-twin", "scanning");
      let mode: "scan" | "speak" | "off" = "scan";
      let raf = 0;
      const pump = () => {
        if (mode === "scan") setVoiceLevel(0.3 + 0.22 * Math.sin(performance.now() / 160));
        else setVoiceLevel(voice.level * 0.9);
        stage?.style.setProperty("--vl", voice.level.toFixed(3));
        if (mode !== "off" || voice.level > 0.01) raf = requestAnimationFrame(pump);
      };
      raf = requestAnimationFrame(pump);

      const speed = canned ? 0.55 : 1;
      let tickId = 0;
      try {
        await wait(1100 * speed);
        diag.step = 2;
        let i = 0;
        tickId = window.setInterval(() => {
          i = (i + 1) % SYSTEMS.length;
          diag.tick = SYSTEMS[i];
          diag.elapsed = elapsed();
          show();
        }, 85);
        // Scan at least this long, and until the answer is in hand.
        const [res] = await Promise.all([answer, wait(2900 * speed)]);
        window.clearInterval(tickId);

        if (res.gate) return res;
        if (res.note) {
          // A cap or a failure: no theatre, say it plainly.
          patchLast((m) => ({ ...m, content: res.text, note: true, diag: undefined }));
          return res;
        }

        diag.step = 3;
        diag.facts = res.trace?.facts ?? [];
        diag.elapsed = elapsed();
        show();
        await wait(1400 * speed);

        diag.step = 4;
        for (const n of [3, 2, 1]) {
          diag.count = n as 3 | 2 | 1;
          diag.elapsed = elapsed();
          show();
          await wait(canned ? 420 : 650);
        }

        // The answer, typed out as the twin speaks it.
        mode = "speak";
        stage?.setAttribute("data-twin", "speaking");
        patchLast((m) => ({ ...m, diag: undefined, live: true, content: "" }));
        const words = res.text.split(/(\s+)/);
        const per = Math.min(42, 2600 / Math.max(1, words.length));
        let out = "";
        for (const w of words) {
          out += w;
          if (w.trim()) {
            setVoiceLevel(Math.min(1, voice.level + 0.25 + Math.min(0.3, w.length / 20)));
            patchLast((m) => ({ ...m, content: out }));
            await wait(per);
          }
        }
        patchLast((m) => ({ ...m, content: res.text, live: false, trace: res.trace }));
        return res;
      } finally {
        window.clearInterval(tickId);
        mode = "off";
        window.setTimeout(() => {
          cancelAnimationFrame(raf);
          if (stage) {
            // Back to awake (the cyborg half stays), unless the intro voice
            // is still talking.
            const cur = stage.getAttribute("data-twin");
            if ((cur === "speaking" || cur === "scanning") && !voice.speaking) stage.setAttribute("data-twin", "awake");
            stage.style.setProperty("--vl", "0");
          }
          setVoiceLevel(voice.speaking ? voice.level : 0);
        }, 600);
      }
    },
    []
  );

  const askFaq = async (f: (typeof FAQ)[number]) => {
    if (busy) return;
    setShown(null);
    setMsgs((cur) => [...cur, { role: "user", content: f.q }, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      await dramatize(Promise.resolve({ text: f.a, trace: { canned: true, facts: f.facts } }), true);
    } finally {
      setBusy(false);
    }
  };

  const ask = useCallback(
    async (q: string, usePass: string) => {
      setShown(null);

      // History for the API: real turns only (FAQ answers included, they are
      // true and give context), alternating, ending on the new question.
      const history = msgs.filter((m) => !m.note);
      const turns = [...history, { role: "user" as const, content: q }]
        .slice(-19)
        .map((m) => ({ role: m.role, content: m.content }));
      while (turns.length && turns[0].role !== "user") turns.shift();

      setMsgs((cur) => [...cur, { role: "user", content: q }, { role: "assistant", content: "" }]);
      setBusy(true);

      // Fetch the whole answer; the diagnosis plays while it streams in.
      const fetchAnswer = async (): Promise<Answer> => {
        try {
          const res = await fetch("/api/twin", {
            method: "POST",
            headers: { "content-type": "application/json", "x-twin-pass": usePass },
            body: JSON.stringify({ messages: turns }),
          });
          if (!res.body) throw new Error("no body");
          const reader = res.body.getReader();
          const dec = new TextDecoder();
          let buf = "";
          let text = "";
          let trace: Trace | undefined;
          let note: string | null = null;
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            let nl: number;
            while ((nl = buf.indexOf("\n")) >= 0) {
              const raw = buf.slice(0, nl);
              buf = buf.slice(nl + 1);
              if (!raw.trim()) continue;
              const ev = JSON.parse(raw) as { t: string; v?: string; trace?: Trace };
              if (ev.t === "text" && ev.v) text += ev.v;
              else if (ev.t === "done" && ev.trace) trace = ev.trace;
              else if (ev.t === "gate") return { text: "", gate: true };
              else if ((ev.t === "limit" || ev.t === "error") && ev.v) note = ev.v;
            }
          }
          if (note) return { text: text ? `${text.trim()}\n\n${note}` : note, note: true };
          return { text: text.trim(), trace };
        } catch {
          return {
            text: "I can't answer right now. You can reach John Boy directly at uix.johnboy@gmail.com or book a call at johnboydesign.com/book.",
            note: true,
          };
        }
      };

      try {
        const res = await dramatize(fetchAnswer(), false);
        if (res.gate) {
          // The pass expired or was refused: take the question back and ask
          // for the details again.
          savePass(null);
          setPass(null);
          setMsgs((cur) => cur.slice(0, -2));
          setGate({ pending: q });
        }
      } finally {
        setBusy(false);
      }
    },
    [msgs, dramatize]
  );

  const send = (text: string) => {
    const q = text.trim().slice(0, MAX_CHARS);
    if (!q || busy) return;
    const faq = FAQ.find((f) => f.q.toLowerCase() === q.toLowerCase());
    setInput("");
    if (faq) return askFaq(faq);
    if (!pass) {
      setGate({ pending: q });
      return;
    }
    ask(q, pass);
  };

  const submitGate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!gate || gateBusy) return;
    const fd = new FormData(e.currentTarget);
    setGateErr("");
    setGateBusy(true);
    try {
      const res = await fetch("/api/twin/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), website: fd.get("website") }),
      });
      const d = (await res.json()) as { ok: boolean; pass?: string; error?: string };
      if (!d.ok || !d.pass) {
        setGateErr(d.error || "Something went wrong. Please try again.");
        return;
      }
      savePass(d.pass);
      setPass(d.pass);
      const pending = gate.pending;
      setGate(null);
      ask(pending, d.pass);
    } catch {
      setGateErr("Something went wrong. Please try again.");
    } finally {
      setGateBusy(false);
    }
  };

  const asked = new Set(msgs.filter((m) => m.role === "user").map((m) => m.content));
  const unused = FAQ.filter((f) => !asked.has(f.q));

  return (
    <div
      ref={rootRef}
      className="v3-chat"
      data-open={open ? "true" : "false"}
      role="dialog"
      aria-label="Chat with John Boy's AI twin"
      aria-hidden={!open}
      inert={!open}
    >
      <div className="v3-chat-head">
        <div>
          <p className="v3-chat-title">
            <i className="v3-dot v3-dot-live" /> John Boy&apos;s AI twin
          </p>
          <p className="v3-chat-sub">answers from verified facts only</p>
        </div>
        <button type="button" className="v3-chat-close" onClick={() => setOpen(false)} aria-label="Close the chat">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="v3-chat-list" ref={listRef} data-lenis-prevent aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`v3-msg v3-msg-${m.role}`} data-live={m.live ? "true" : undefined}>
            {m.diag ? <Diagnosis d={m.diag} /> : null}
            <p className="v3-msg-text" hidden={!!m.diag}>
              {m.content ||
                (busy && i === msgs.length - 1 ? (
                  <span className="v3-typing" aria-label="Thinking">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : null)}
            </p>
            {m.trace ? (
              <div className="v3-msg-trace">
                <button
                  type="button"
                  className="v3-trace-toggle"
                  aria-expanded={shown === i}
                  onClick={() => setShown(shown === i ? null : i)}
                >
                  {shown === i ? "Hide the trace" : "See how I answered"}
                </button>
                {shown === i ? <TraceView t={m.trace} /> : null}
              </div>
            ) : null}
          </div>
        ))}
        {!busy && !gate && unused.length ? (
          <div className="v3-chat-suggest">
            {unused.map((f) => (
              <button key={f.q} type="button" onClick={() => askFaq(f)}>
                {f.q}
              </button>
            ))}
          </div>
        ) : null}
        {gate ? (
          <form className="v3-gate" onSubmit={submitGate}>
            <p className="v3-gate-title">Before I answer that: who am I talking to?</p>
            <p className="v3-gate-q">&ldquo;{gate.pending}&rdquo;</p>
            <label>
              <span>Name</span>
              <input ref={nameRef} name="name" autoComplete="name" maxLength={80} required />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" maxLength={120} required />
            </label>
            {/* Honeypot: hidden from people, filled by bots. */}
            <input className="v3-gate-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            {gateErr ? <p className="v3-gate-err">{gateErr}</p> : null}
            <div className="v3-gate-row">
              <button type="submit" disabled={gateBusy}>
                {gateBusy ? "One moment" : "Ask my question"}
              </button>
              <button type="button" className="v3-gate-cancel" onClick={() => setGate(null)}>
                Cancel
              </button>
            </div>
            <p className="v3-gate-note">
              Your name, email and questions go to John Boy so he can follow up. No newsletter, no spam.
            </p>
          </form>
        ) : null}
      </div>

      {gate ? null : (
        <form
          className="v3-chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            rows={1}
            maxLength={MAX_CHARS}
            placeholder="Ask about his work, or describe what's broken"
            aria-label="Your question"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2.5 8h10M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      )}
      <p className="v3-chat-foot">An AI, so it can be wrong. The suggested questions are free and need no sign-in.</p>
    </div>
  );
}
