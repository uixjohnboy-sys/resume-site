"use client";

// A live-looking system log strip at the foot of the hero status board.
// It types real event lines from the systems described on this page, one
// at a time, on loop. This is the page demonstrating the thing it sells:
// systems that report their own state. Honest by construction: every line
// names a mechanism that actually exists in the flagship build.
// Reduced-motion users get one static line and no timers.

import { useEffect, useRef, useState } from "react";

const LINES = [
  "webhook_in   stripe: checkout.session.completed → access window opened",
  "sync_out     GHL: contact tagged client → pipeline stage moved",
  "cron_run     no-show recovery queued · step 1 of 3",
  "sig_check    stripe signature verified · idempotent write ok",
  "ai_reply     coach companion answered from client history · fallback armed",
  "health       churn score recomputed · zero extra reads",
  "email_out    template 12 of 83 sent · day-2 escalation armed",
  "webhook_out  app → GHL: booking confirmed · calendar synced",
];

const TYPE_MS = 26;
const HOLD_MS = 2100;

export default function SystemLog() {
  const [text, setText] = useState("");
  const [reduced, setReduced] = useState(false);
  const lineIdx = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      setText(LINES[0]);
      return;
    }

    let charIdx = 0;
    let timer: number;

    function tick() {
      const line = LINES[lineIdx.current];
      if (charIdx <= line.length) {
        setText(line.slice(0, charIdx));
        charIdx += 1;
        timer = window.setTimeout(tick, TYPE_MS);
      } else {
        timer = window.setTimeout(() => {
          lineIdx.current = (lineIdx.current + 1) % LINES.length;
          charIdx = 0;
          tick();
        }, HOLD_MS);
      }
    }

    tick();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="jb-log" aria-hidden="true">
      <span className="jb-log-sig">live</span>
      <span className="jb-log-line">
        {text}
        {!reduced && <span className="jb-caret" />}
      </span>
    </div>
  );
}
