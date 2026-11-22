"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// The first section of the homepage (JB 2026-11-22: "umpisa palang highlighted na mga kaya kong gawin, card style na
// na-sscroll", reference: a cover-flow music player, in black and white). One card per kind of work from src/lib/work.ts;
// the centre card is the one in focus, the side cards turn away. Click a side card to bring it forward; click the centre
// card (or Open) to read that work. Arrow keys, swipe and the control bar move it. It advances on its own every few
// seconds until the visitor touches it, hovers it, or asks for less motion. Without JavaScript the centre card still links
// to its work, and the full list sits right below in the work index.

export type FlowCard = { n: string; slug: string; title: string; promise: string; art: string };

const AUTO_MS = 4800;

export default function SkillFlow({ cards }: { cards: FlowCard[] }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [announce, setAnnounce] = useState("");
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const n = cards.length;
  const wrap = useCallback((k: number) => ((k % n) + n) % n, [n]);

  const go = useCallback(
    (k: number, user = true) => {
      const next = wrap(k);
      setI(next);
      if (user) {
        setPlaying(false);
        setAnnounce(`${cards[next].n} of 0${n}: ${cards[next].title}`);
      }
    },
    [wrap, cards, n],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => {
      setReduced(mq.matches);
      if (mq.matches) setPlaying(false);
    };
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    if (!playing || hover || reduced) return;
    const t = window.setTimeout(() => setI((k) => wrap(k + 1)), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [i, playing, hover, reduced, wrap]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(i + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(i - 1);
    }
  };

  // The shortest way round the ring, so card 07 sits to the left of card 01.
  const offsetOf = (k: number) => {
    let d = k - i;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  const cur = cards[i];

  return (
    <div
      className="sf"
      role="region"
      aria-roledescription="carousel"
      aria-label="What I build"
      onKeyDown={onKey}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
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
          drag.current = null;
          if (!d || !d.moved) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
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
                aria-hidden={abs > 2 ? true : undefined}
                style={{ zIndex: 10 - abs }}
              >
                <Link
                  href={`/work/${c.slug}`}
                  className="sf-link"
                  tabIndex={focus ? 0 : -1}
                  aria-label={`${c.n} of 0${n}: ${c.title}. ${c.promise}`}
                  onClick={(e) => {
                    // A side card (or the end of a swipe) brings that card forward instead of leaving the page.
                    if (!focus || drag.current?.moved) {
                      e.preventDefault();
                      if (!focus) go(k);
                    }
                  }}
                  draggable={false}
                >
                  <span className="sf-art">
                    <Image src={c.art} alt="" width={1200} height={960} sizes="(max-width: 700px) 78vw, 400px" priority={k < 3} draggable={false} />
                  </span>
                  <span className="sf-meta">
                    <span className="sf-n">{c.n}</span>
                    <span className="sf-title">{c.title}</span>
                    <span className="sf-promise">{c.promise}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="sf-bar">
        <div className="sf-ctrl">
          <button type="button" className="sf-btn" onClick={() => go(i - 1)} aria-label="Previous">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 6 5 12l6 6M19 6l-6 6 6 6" /></svg>
          </button>
          <button
            type="button"
            className="sf-btn"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing && !reduced ? "Pause the slides" : "Play the slides"}
            aria-pressed={!(playing && !reduced)}
            disabled={reduced}
          >
            {playing && !reduced ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5l12 7-12 7z" /></svg>
            )}
          </button>
          <button type="button" className="sf-btn" onClick={() => go(i + 1)} aria-label="Next">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 6l6 6-6 6M5 6l6 6-6 6" /></svg>
          </button>
        </div>

        <Link href={`/work/${cur.slug}`} className="sf-now">
          <span className="sf-now-thumb">
            <Image src={cur.art} alt="" width={120} height={96} sizes="56px" />
          </span>
          <span className="sf-now-text">
            <b>{cur.title}</b>
            <span>Open the work and the demos</span>
          </span>
          <span className="sf-now-go" aria-hidden="true">
            →
          </span>
          <span className="sf-progress" aria-hidden="true">
            <span key={`${i}-${playing && !hover && !reduced}`} className={playing && !hover && !reduced ? "is-run" : ""} style={{ animationDuration: `${AUTO_MS}ms` }} />
          </span>
        </Link>

        <div className="sf-dots" role="tablist" aria-label="Choose a card">
          {cards.map((c, k) => (
            <button
              key={c.slug}
              type="button"
              role="tab"
              aria-selected={k === i}
              aria-label={`${c.n}: ${c.title}`}
              className={k === i ? "is-on" : ""}
              onClick={() => go(k)}
            />
          ))}
          <span className="sf-count">
            {cur.n} / 0{n}
          </span>
        </div>
      </div>

      <p className="sf-sr" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
