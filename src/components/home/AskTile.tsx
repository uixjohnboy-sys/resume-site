"use client";
import { useEffect, useRef, useState } from "react";

// The last tile of the homepage problem grid (JB 2026-11-27): a two-step message. Step 1 the problem, step 2 name and
// email, then it goes to John Boy's GoHighLevel, which sends the visitor an instant confirmation (the same speed-to-lead
// he builds for clients) and alerts him. Without JavaScript the mailto link still works.

const MAILTO =
  "mailto:uix.johnboy@gmail.com?subject=" + encodeURIComponent("Not on the list: a problem to fix") + "&body=" + encodeURIComponent("Hi John Boy,\n\nWhat I want fixed or built:\n\n");
const DRAFT = "jb-ask-draft";

export default function AskTile() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const head = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const d = sessionStorage.getItem(DRAFT);
      if (d) setMessage(d);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (message) sessionStorage.setItem(DRAFT, message);
    } catch {}
  }, [message]);

  const next = () => {
    if (message.trim().length < 10) {
      setErr("Tell me a little more, one or two sentences is enough.");
      return;
    }
    setErr("");
    setStep(2);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const send = async () => {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, name, email, website: trap }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) {
        setErr(j.error || "Something went wrong. Please try again.");
        return;
      }
      setSaved(j.note === "saved");
      setStep(3);
      try {
        sessionStorage.removeItem(DRAFT);
      } catch {}
      setTimeout(() => head.current?.focus(), 0);
    } catch {
      setErr("No connection. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const first = name.trim().split(" ")[0];
  return (
    <div className="pg-body pg-askbody">
      <p className="pg-n">Not on the list?</p>
      <p className="pg-problem" ref={head} tabIndex={-1}>
        {step === 3 ? `Sent${first ? `, ${first}` : ""}.` : "Tell me what's broken. I'll reply with how I'd fix it."}
      </p>

      {step === 1 ? (
        <form
          className="ask-form"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          <label className="ask-label" htmlFor="ask-msg">
            What do you want fixed or built?
          </label>
          <textarea
            id="ask-msg"
            className="ask-input"
            rows={4}
            maxLength={2000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) next();
            }}
            placeholder="For example: our booking reminders stopped sending last week."
            aria-describedby={err ? "ask-err" : undefined}
          />
          <div className="ask-row">
            <span className="ask-step">Step 1 of 2</span>
            <button className="ask-btn" type="submit">
              Next →
            </button>
          </div>
        </form>
      ) : null}

      {step === 2 ? (
        <form
          className="ask-form"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label className="ask-label" htmlFor="ask-name">
            Your name
          </label>
          <input id="ask-name" ref={nameRef} className="ask-input" autoComplete="name" maxLength={80} required value={name} onChange={(e) => setName(e.target.value)} />
          <label className="ask-label" htmlFor="ask-email">
            Your email
          </label>
          <input id="ask-email" className="ask-input" type="email" autoComplete="email" maxLength={120} required value={email} onChange={(e) => setEmail(e.target.value)} />
          {/* honeypot: hidden from people and screen readers */}
          <input className="ask-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} name="website" />
          <p className="ask-note">Only so I can reply to you. No newsletter, no sales sequence.</p>
          <div className="ask-row">
            <button className="ask-back" type="button" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button className="ask-btn" type="submit" disabled={busy}>
              {busy ? "Sending" : "Send"}
            </button>
          </div>
        </form>
      ) : null}

      {step === 3 ? (
        <p className="ask-done" role="status">
          {saved
            ? `I have your message and will reply to ${email} within one working day.`
            : `A confirmation from my GoHighLevel is on its way to ${email}, and my reply follows within one working day.`}
        </p>
      ) : null}

      {err ? (
        <p className="ask-err" id="ask-err" role="alert">
          {err}
        </p>
      ) : null}
      <noscript>
        <a className="pg-cta" href={MAILTO}>
          Email me instead →
        </a>
      </noscript>
    </div>
  );
}
