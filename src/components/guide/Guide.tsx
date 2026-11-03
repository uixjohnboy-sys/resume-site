"use client";

import { IconHandFinger, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "./guide.css";

// The Guided Demo engine, shared by every portfolio project. A tour is plain data.
// The visitor keeps driving the real app: the overlay never blocks a click, and a
// "your turn" step moves on by itself when the visitor has really done the thing.
// Targets are data-spot attributes, so a tour survives layout changes. Captions
// are the card text; voice, if ever added, is one audio file per step on top.

export type GuideStep<C> = {
  id: string;
  title: (c: C) => string;
  text: (c: C) => string;
  /** The data-spot to light up. No spot: the card sits alone. */
  spot?: string | ((c: C) => string | undefined);
  /** Prepare the screen when the step opens (switch a view, open or close a dialog). */
  enter?: (c: C) => void;
  /** "Your turn": the instruction, shown apart from the text. */
  doIt?: (c: C) => string;
  /** Moves on by itself once this turns true. */
  done?: (c: C) => boolean;
  /** Holds Next back until this is true (for example while the AI is still reading). */
  ready?: (c: C) => boolean;
  /** The last card: what the visitor can do next. */
  end?: (c: C) => ReactNode;
};

export type GuideTour<C> = { id: string; title: string; steps: GuideStep<C>[] };

type Box = { x: number; y: number; w: number; h: number };
const PAD = 8;
const MARGIN = 16;
const CARD_W = 360;

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const modalOpen = () => !!document.querySelector('[aria-modal="true"]');

function findSpot(name: string): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-spot="${name}"]`));
  return all.find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }) ?? null;
}

const COMPACT_H = 500;

/** Where the card goes: beside the spot if it fits, else above or below; a sheet on a phone or a short screen (zoom). */
function placeCard(box: Box | null, cardH: number, vw: number, vh: number): { left: number; top: number; width: number } {
  const width = Math.min(CARD_W, vw - MARGIN * 2);
  if (vw < 640 || vh < COMPACT_H) {
    // A sheet at the top or bottom, whichever hides least of the target. A short, wide screen also picks a side.
    const bottom = Math.max(MARGIN, vh - cardH - MARGIN);
    const right = vw - width - MARGIN;
    const roomRight = box ? vw - (box.x + box.w) >= box.x : true;
    const sides = vw >= 640 ? (roomRight ? [right, MARGIN] : [MARGIN, right]) : [MARGIN];
    const spots = sides.flatMap((left) => [{ left, top: bottom }, { left, top: MARGIN }]);
    const hides = (o: { left: number; top: number }) =>
      box ? Math.max(0, Math.min(o.left + width, box.x + box.w) - Math.max(o.left, box.x)) * Math.max(0, Math.min(o.top + cardH, box.y + box.h) - Math.max(o.top, box.y)) : 0;
    const pick = spots.reduce((best, o) => (hides(o) < hides(best) ? o : best));
    return { width, left: pick.left, top: pick.top };
  }
  if (!box) return { left: MARGIN * 2, width, top: Math.max(MARGIN, vh - cardH - MARGIN * 2) };
  const gap = 16;
  const maxX = vw - width - MARGIN;
  const maxY = Math.max(MARGIN, vh - cardH - MARGIN);
  const clamp = (v: number, hi: number) => Math.min(Math.max(MARGIN, v), hi);
  const hole = { l: box.x - PAD, t: box.y - PAD, r: box.x + box.w + PAD, b: box.y + box.h + PAD };
  // Clear of the target with room to spare: the card is never moved back on top of what it points at.
  const clear = (o: { left: number; top: number }) => o.left + width <= hole.l || o.left >= hole.r || o.top + cardH <= hole.t || o.top >= hole.b;
  const onScreen = (o: { left: number; top: number }) => o.left >= MARGIN && o.left <= maxX && o.top >= MARGIN && o.top <= maxY;
  const beside = [
    { left: hole.r + gap, top: clamp(box.y, maxY) },
    { left: hole.l - gap - width, top: clamp(box.y, maxY) },
    { left: clamp(box.x, maxX), top: hole.b + gap },
    { left: clamp(box.x, maxX), top: hole.t - gap - cardH },
  ];
  const corners = [
    { left: maxX, top: MARGIN },
    { left: MARGIN, top: MARGIN },
    { left: maxX, top: maxY },
    { left: MARGIN, top: maxY },
  ];
  const pick = [...beside, ...corners].find((o) => onScreen(o) && clear(o)) ?? corners[2];
  return { width, left: pick.left, top: pick.top };
}

export default function Guide<C>({ tour, ctx, onClose }: { tour: GuideTour<C>; ctx: C; onClose: () => void }) {
  const [n, setN] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [focusBox, setFocusBox] = useState<Box | null>(null);
  const [moreAt, setMoreAt] = useState(-1);
  const [size, setSize] = useState({ vw: 1280, vh: 800, cardH: 240 });
  const cardRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const ctxRef = useRef(ctx);
  const closeRef = useRef(onClose);
  useEffect(() => {
    ctxRef.current = ctx;
    closeRef.current = onClose;
  });

  const step = tour.steps[n];
  const last = n === tour.steps.length - 1;
  const counted = tour.steps.filter((s) => !s.end).length;

  // Going back to a step already done must stay there, not bounce forward again.
  const cameBack = useRef(false);
  const next = useCallback(() => {
    cameBack.current = false;
    setN((x) => Math.min(x + 1, tour.steps.length - 1));
  }, [tour.steps.length]);
  const back = useCallback(() => {
    cameBack.current = true;
    setN((x) => Math.max(x - 1, 0));
  }, []);

  // Open the step: prepare the screen, then keep the spotlight on its target while the page moves underneath.
  useEffect(() => {
    tour.steps[n].enter?.(ctxRef.current);
    let scrolledTo: string | null = null;
    const measure = () => {
      const spot = tour.steps[n].spot;
      const name = typeof spot === "function" ? spot(ctxRef.current) : spot;
      const cardH = cardRef.current?.offsetHeight ?? 240;
      setSize((s) => (s.vw === window.innerWidth && s.vh === window.innerHeight && s.cardH === cardH ? s : { vw: window.innerWidth, vh: window.innerHeight, cardH }));
      // Keep clear of the field the visitor is tabbing through (WCAG 2.4.11: focus never hidden by the card).
      const active = document.activeElement as HTMLElement | null;
      const typing = active && active !== document.body && !active.closest("[data-guide-card]") && active.matches("a, button, input, select, textarea");
      const fr = typing ? active.getBoundingClientRect() : null;
      const nextFocus = fr ? { x: Math.round(fr.left), y: Math.round(fr.top), w: Math.round(fr.width), h: Math.round(fr.height) } : null;
      setFocusBox((b) => (b?.x === nextFocus?.x && b?.y === nextFocus?.y && b?.w === nextFocus?.w && b?.h === nextFocus?.h ? b : nextFocus));
      const el = name ? findSpot(name) : null;
      if (!el) {
        setBox((b) => (b ? null : b));
        return;
      }
      if (scrolledTo !== name) {
        scrolledTo = name ?? null;
        // A tall target or a phone: show its top, where the words are. Clear of any sticky bar.
        const tall = el.getBoundingClientRect().height > window.innerHeight * 0.55 || window.innerWidth < 640;
        el.style.scrollMarginTop = "72px";
        el.scrollIntoView({ block: tall ? "start" : "center", inline: "nearest", behavior: reduced() ? "auto" : "smooth" });
      }
      const r = el.getBoundingClientRect();
      const nextBox = { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
      setBox((b) => (b && b.x === nextBox.x && b.y === nextBox.y && b.w === nextBox.w && b.h === nextBox.h ? b : nextBox));
    };
    measure();
    const timer = setInterval(measure, 200);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [n, tour.steps]);

  // A step the visitor has really done moves on by itself, after a beat so they see it happen.
  const isDone = !!step.done?.(ctx);
  useEffect(() => {
    if (!isDone || cameBack.current) return;
    const t = setTimeout(next, 900);
    return () => clearTimeout(t);
  }, [isDone, n, next]);

  // Focus follows the tour, unless a dialog the visitor is working in has it. A button that just went disabled
  // (Back on the first step) would otherwise drop focus to the page.
  useEffect(() => {
    const a = document.activeElement;
    if (!modalOpen() || !a || a === document.body || a.closest("[data-guide-card]")) headRef.current?.focus();
  }, [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !modalOpen()) closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Ending the tour hands focus back to whatever can start it again.
      const a = document.activeElement;
      if (!a || a === document.body || a.closest("[data-guide-card]")) {
        // Into the open dialog if there is one (the page behind it is inert), else whatever can start the tour again.
        const dialogHead = document.querySelector<HTMLElement>('[aria-modal="true"] h2, [aria-modal="true"] h1');
        const home = Array.from(document.querySelectorAll<HTMLElement>("[data-guide-return]")).find((x) => x.offsetParent !== null);
        setTimeout(() => (dialogHead ?? home)?.focus(), 0);
      }
    };
  }, []);

  // Announced where a screen reader is listening: a dialog that holds the focus hides everything outside it.
  const [liveHost, setLiveHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const t = setInterval(() => {
      const host = document.querySelector<HTMLElement>('[aria-modal="true"]');
      setLiveHost((h) => (h === host ? h : host));
    }, 300);
    return () => clearInterval(t);
  }, []);

  const focusOutsideSpot = focusBox && !(box && focusBox.x >= box.x - 2 && focusBox.y >= box.y - 2 && focusBox.x + focusBox.w <= box.x + box.w + 2 && focusBox.y + focusBox.h <= box.y + box.h + 2);
  const pos = placeCard(focusOutsideSpot ? focusBox : box, size.cardH, size.vw, size.vh);
  const more = moreAt === n;
  // The hole stays on screen even when its target is taller than the screen.
  const holeTop = box ? Math.max(4, box.y - PAD) : 0;
  const holeBottom = box ? Math.min(size.vh - 4, box.y + box.h + PAD) : 0;
  const hole = box && holeBottom - holeTop > 24 ? { x: box.x - PAD, y: holeTop, w: box.w + PAD * 2, h: holeBottom - holeTop, r: 12 } : null;
  const path =
    `M0 0H${size.vw}V${size.vh}H0Z` +
    (hole
      ? ` M${hole.x + hole.r} ${hole.y}h${hole.w - hole.r * 2}a${hole.r} ${hole.r} 0 0 1 ${hole.r} ${hole.r}v${hole.h - hole.r * 2}a${hole.r} ${hole.r} 0 0 1 -${hole.r} ${hole.r}h-${hole.w - hole.r * 2}a${hole.r} ${hole.r} 0 0 1 -${hole.r} -${hole.r}v-${hole.h - hole.r * 2}a${hole.r} ${hole.r} 0 0 1 ${hole.r} -${hole.r}Z`
      : "");
  const canGo = !step.ready || step.ready(ctx);
  const compact = size.vh < COMPACT_H;
  const spoken = `${step.end ? "Your next step" : `Step ${n + 1} of ${counted}`}. ${step.title(ctx)}. ${step.text(ctx)} ${step.doIt && !isDone ? step.doIt(ctx) : ""}`;
  const live = (
    <p className="gd-sr" role="status">
      {spoken}
    </p>
  );

  return (
    <div className="gd">
      {liveHost ? createPortal(live, liveHost) : live}
      <svg className="gd-dim" width={size.vw} height={size.vh} aria-hidden="true">
        <path d={path} fillRule="evenodd" />
      </svg>
      {hole && <div className={`gd-ring${step.doIt ? " gd-ring-do" : ""}`} aria-hidden="true" style={{ left: hole.x, top: hole.y, width: hole.w, height: hole.h }} />}
      <div className={`gd-card${compact ? " gd-compact" : ""}${compact && more ? " gd-more" : ""}`} ref={cardRef} data-guide-card role="region" aria-label={`${tour.title}, step ${Math.min(n + 1, counted)} of ${counted}`} style={{ left: pos.left, top: pos.top, width: pos.width }}>
        <div className="gd-top">
          <span className="gd-count">{step.end ? "Your next step" : `Step ${n + 1} of ${counted}`}</span>
          <button type="button" className="gd-x" onClick={onClose} aria-label="Close the tour">
            <IconX size={16} aria-hidden="true" />
          </button>
        </div>
        <h2 className="gd-h" ref={headRef} tabIndex={-1}>
          {step.title(ctx)}
        </h2>
        <p className="gd-text">{step.text(ctx)}</p>
        {compact && (
          <button type="button" className="gd-more-btn" aria-expanded={more} onClick={() => setMoreAt(more ? -1 : n)}>
            {more ? "Show less" : "Read this step"}
          </button>
        )}
        {step.doIt && !isDone && (
          <p className="gd-do">
            <IconHandFinger size={16} aria-hidden="true" /> {step.doIt(ctx)}
          </p>
        )}
        {step.end?.(ctx)}
        <div className="gd-row">
          <button type="button" className="gd-btn gd-quiet" onClick={back} disabled={n === 0}>
            Back
          </button>
          {last ? (
            <button type="button" className="gd-btn" onClick={onClose}>
              Keep exploring
            </button>
          ) : (
            <button type="button" className="gd-btn" onClick={next} disabled={!canGo}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
