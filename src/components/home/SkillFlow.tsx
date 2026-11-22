"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// The first section of the homepage (JB 2026-11-22): the kinds of work as a cover-flow of cards, black and white. Since
// the same night each card carries what the old work index row carried (the promise, the strongest real proof with its
// label, and a button to the work page), so the index section is gone. The centre card is in focus; a side card comes
// forward when clicked. It moves on its own every 5 seconds, stops while the pointer is on a card or a card has focus,
// and starts again when the pointer leaves. Two arrows under it move it by hand; arrow keys and swipe work too.

export type FlowCard = {
  n: string;
  slug: string;
  title: string;
  promise: string;
  art: string;
  tag: string;
  line: string;
};

const AUTO_MS = 5000;

export default function SkillFlow({ cards }: { cards: FlowCard[] }) {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [announce, setAnnounce] = useState("");
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const n = cards.length;
  const wrap = useCallback((k: number) => ((k % n) + n) % n, [n]);

  const go = useCallback(
    (k: number) => {
      const next = wrap(k);
      setI(next);
      setAnnounce(`${cards[next].n} of ${String(n).padStart(2, "0")}: ${cards[next].title}`);
    },
    [wrap, cards, n],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  // Every 5 seconds, unless a card is under the pointer or focused, or the visitor asks for less motion.
  useEffect(() => {
    if (hold || reduced) return;
    const t = window.setTimeout(() => setI((k) => wrap(k + 1)), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [i, hold, reduced, wrap]);

  const offsetOf = (k: number) => {
    let d = k - i;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  return (
    <div
      className="sf"
      role="region"
      aria-roledescription="carousel"
      aria-label="What I build"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(i + 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(i - 1);
        }
      }}
    >
      <div
        className="sf-stage"
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, moved: false };
        }}
        onPointerMove={(e) => {
          if (drag.current && Math.abs(e.clientX - drag.current.x) > 12) drag.current.moved = true;
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          if (d && d.moved && Math.abs(e.clientX - d.x) > 40) go(e.clientX < d.x ? i + 1 : i - 1);
          window.setTimeout(() => (drag.current = null), 0);
        }}
      >
        <ol className="sf-ring">
          {cards.map((c, k) => {
            const o = offsetOf(k);
            const abs = Math.abs(o);
            const focus = o === 0;
            return (
              <li
                key={c.slug}
                className={`sf-card${focus ? " is-focus" : ""}`}
                data-off={Math.max(-3, Math.min(3, o))}
                aria-hidden={focus ? undefined : true}
                style={{ zIndex: 10 - abs }}
                onPointerEnter={() => setHold(true)}
                onPointerLeave={() => setHold(false)}
                onFocus={() => setHold(true)}
                onBlur={() => setHold(false)}
                onClick={() => {
                  if (!focus && !drag.current?.moved) go(k);
                }}
              >
                <article className="sf-body" aria-label={focus ? `${c.n} of ${String(n).padStart(2, "0")}: ${c.title}` : undefined}>
                  <span className="sf-art">
                    <Image src={c.art} alt="" width={1200} height={960} sizes="(max-width: 700px) 78vw, 380px" priority={k < 3 || k === n - 1} draggable={false} />
                  </span>
                  <div className="sf-meta">
                    <h3 className="sf-title">{c.title}</h3>
                    <p className="sf-promise">{c.promise}</p>
                    <div className="sf-proof">
                      <p className="sf-tag">{c.tag}</p>
                      <p className="sf-line">{c.line}</p>
                    </div>
                    <Link
                      href={`/work/${c.slug}`}
                      className="sf-cta"
                      tabIndex={focus ? 0 : -1}
                      onClick={(e) => {
                        if (!focus || drag.current?.moved) e.preventDefault();
                      }}
                      draggable={false}
                    >
                      See the work <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="sf-arrows">
        <button type="button" className="sf-arrow" onClick={() => go(i - 1)} aria-label="Previous card">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button type="button" className="sf-arrow" onClick={() => go(i + 1)} aria-label="Next card">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p className="sf-sr" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
