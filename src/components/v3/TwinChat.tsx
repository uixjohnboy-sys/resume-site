"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { setVoiceLevel, voice } from "./voice";
import { FACTS } from "@/lib/twin/facts";

// The chat behind "Talk to my AI" (server: src/app/api/twin/route.ts).
//
// Opens on the "v3:chat-open" window event that TwinVoice's button sends.
// On wide screens it takes the copy column's place, so the visitor talks
// facing the twin; on phones and tablets it is a bottom sheet. While an
// answer streams, the cyborg half "speaks": the stage switches to
// data-twin="speaking" and each arriving chunk pulses the same voice level
// the intro audio drives, so the eye and particles react to the text.
//
// Every answer carries a trace ("See how I answered"): which verified facts
// it used, the model, timings, tokens and the cost of that one answer. That
// panel is the proof that this is engineered, not a canned widget.
//
// The conversation lives in sessionStorage only (and the server stores
// nothing), so it survives a reload but not a closed tab.

type Trace = {
  model: string;
  facts: string[];
  firstTokenMs: number | null;
  totalMs: number;
  inputTokens: number;
  cachedTokens: number;
  outputTokens: number;
  costUsd: number;
};

type Msg = { role: "user" | "assistant"; content: string; trace?: Trace; note?: boolean };

const GREETING =
  "I'm John Boy's AI. He built me, so I only know what he has actually shipped. Ask me anything about his work, or tell me what's broken in yours.";

const SUGGESTIONS = [
  "What can he build in GoHighLevel?",
  "My client got charged twice. Can he fix that?",
  "What is Coach OS?",
  "How do I hire him?",
];

const STORE = "v3-twin-chat";
const MAX_CHARS = 800;

const title = (id: string) => FACTS.find((f) => f.id === id)?.title ?? id;

function load(): Msg[] {
  try {
    const raw = sessionStorage.getItem(STORE);
    const parsed = raw ? (JSON.parse(raw) as Msg[]) : null;
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    // Storage blocked or corrupt: start fresh.
  }
  return [{ role: "assistant", content: GREETING, note: true }];
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
      <dt>model</dt>
      <dd>{t.model}</dd>
      <dt>first word</dt>
      <dd>{t.firstTokenMs != null ? `${(t.firstTokenMs / 1000).toFixed(2)}s` : "n/a"}</dd>
      <dt>full answer</dt>
      <dd>{(t.totalMs / 1000).toFixed(2)}s</dd>
      <dt>tokens</dt>
      <dd>
        {t.inputTokens.toLocaleString("en-US")} in ({t.cachedTokens.toLocaleString("en-US")} from cache),{" "}
        {t.outputTokens.toLocaleString("en-US")} out
      </dd>
      <dt>cost</dt>
      <dd>${t.costUsd.toFixed(4)}</dd>
    </dl>
  );
}

export default function TwinChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ role: "assistant", content: GREETING, note: true }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [shown, setShown] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const loaded = useRef(false);

  // Restore after hydration (sessionStorage is client-only).
  useEffect(() => {
    const restored = load();
    loaded.current = true;
    if (restored.length > 1) Promise.resolve().then(() => setMsgs(restored));
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

  // Keep the newest message in view.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, open]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim().slice(0, MAX_CHARS);
      if (!q || busy) return;
      setInput("");
      setShown(null);

      // History for the API: real turns only, alternating, ending on the
      // new question. The greeting is a UI note, not a model turn.
      const history = msgs.filter((m) => !m.note);
      const turns = [...history, { role: "user" as const, content: q }]
        .slice(-19)
        .map((m) => ({ role: m.role, content: m.content }));
      while (turns.length && turns[0].role !== "user") turns.shift();

      setMsgs((cur) => [...cur, { role: "user", content: q }, { role: "assistant", content: "" }]);
      setBusy(true);

      // The twin "speaks" while the answer streams.
      const stage = rootRef.current?.closest(".v3-hero")?.querySelector(".v3-stage") as HTMLElement | null;
      const prevTwin = stage?.getAttribute("data-twin") ?? null;
      stage?.setAttribute("data-twin", "speaking");
      let raf = 0;
      let streaming = true;
      const pump = () => {
        setVoiceLevel(voice.level * 0.9);
        stage?.style.setProperty("--vl", voice.level.toFixed(3));
        if (streaming || voice.level > 0.01) raf = requestAnimationFrame(pump);
      };
      raf = requestAnimationFrame(pump);

      const patch = (fn: (m: Msg) => Msg) =>
        setMsgs((cur) => {
          const next = cur.slice();
          next[next.length - 1] = fn(next[next.length - 1]);
          return next;
        });

      try {
        const res = await fetch("/api/twin", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: turns }),
        });
        if (!res.body) throw new Error("no body");
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
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
            if (ev.t === "text" && ev.v) {
              const chunk = ev.v;
              setVoiceLevel(Math.min(1, voice.level + 0.3 + Math.min(0.3, chunk.length / 60)));
              patch((m) => ({ ...m, content: m.content + chunk }));
            } else if (ev.t === "done" && ev.trace) {
              const trace = ev.trace;
              patch((m) => ({ ...m, content: m.content.trim(), trace }));
            } else if ((ev.t === "limit" || ev.t === "error") && ev.v) {
              const v = ev.v;
              patch((m) => ({ ...m, content: m.content ? `${m.content.trim()}\n\n${v}` : v, note: true }));
            }
          }
        }
      } catch {
        patch((m) => ({
          ...m,
          content:
            "I can't answer right now. You can reach John Boy directly at uix.johnboy@gmail.com or book a call at johnboydesign.com/book.",
          note: true,
        }));
      } finally {
        streaming = false;
        setBusy(false);
        window.setTimeout(() => {
          cancelAnimationFrame(raf);
          if (stage) {
            // Back to awake (the cyborg half stays), unless the intro voice
            // is still talking.
            if (stage.getAttribute("data-twin") === "speaking" && !voice.speaking)
              stage.setAttribute("data-twin", prevTwin === "speaking" ? "awake" : prevTwin || "awake");
            stage.style.setProperty("--vl", "0");
          }
          setVoiceLevel(voice.speaking ? voice.level : 0);
        }, 600);
      }
    },
    [busy, msgs]
  );

  const onlyGreeting = msgs.length === 1;

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
          <p className="v3-chat-sub">Claude &middot; answers from verified facts only</p>
        </div>
        <button type="button" className="v3-chat-close" onClick={() => setOpen(false)} aria-label="Close the chat">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="v3-chat-list" ref={listRef} data-lenis-prevent aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`v3-msg v3-msg-${m.role}`}>
            <p className="v3-msg-text">
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
        {onlyGreeting ? (
          <div className="v3-chat-suggest">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} disabled={busy}>
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>

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
      <p className="v3-chat-foot">An AI, so it can be wrong. This chat stays in this browser tab; nothing is stored on the server.</p>
    </div>
  );
}
