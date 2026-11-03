"use client";

import { IconHandFinger, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
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
  spot?: string;
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

/** Where the card goes: beside the spot if it fits, else above or below; a bottom sheet on a phone. */
function placeCard(box: Box | null, cardH: number, vw: number, vh: number): { left: number; top: number; width: number } {
  const width = Math.min(CARD_W, vw - MARGIN * 2);
  if (vw < 640) {
    const inLowerHalf = box && box.y + box.h / 2 > vh / 2;
    return { left: MARGIN, width, top: inLowerHalf ? MARGIN : Math.max(MARGIN, vh - cardH - MARGIN) };
  }
  if (!box) return { left: MARGIN * 2, width, top: Math.max(MARGIN, vh - cardH - MARGIN * 2) };
  const gap = 16;
  const options = [
    { left: box.x + box.w + PAD + gap, top: box.y },
    { left: box.x - PAD - gap - width, top: box.y },
    { left: box.x, top: box.y + box.h + PAD + gap },
    { left: box.x, top: box.y - PAD - gap - cardH },
  ];
  const fits = (o: { left: number; top: number }) => o.left >= MARGIN && o.left + width <= vw - MARGIN && o.top + 40 >= MARGIN && o.top + 40 <= vh - MARGIN;
  const pick = options.find(fits) ?? { left: vw - width - MARGIN, top: vh - cardH - MARGIN };
  return {
    width,
    left: Math.min(Math.max(MARGIN, pick.left), vw - width - MARGIN),
    top: Math.min(Math.max(MARGIN, pick.top), Math.max(MARGIN, vh - cardH - MARGIN)),
  };
}

export default function Guide<C>({ tour, ctx, onClose }: { tour: GuideTour<C>; ctx: C; onClose: () => void }) {
  const [n, setN] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
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

  const next = useCallback(() => setN((x) => Math.min(x + 1, tour.steps.length - 1)), [tour.steps.length]);
  const back = useCallback(() => setN((x) => Math.max(x - 1, 0)), []);

  // Open the step: prepare the screen, then keep the spotlight on its target while the page moves underneath.
  useEffect(() => {
    tour.steps[n].enter?.(ctxRef.current);
    let scrolled = false;
    const name = tour.steps[n].spot;
    const measure = () => {
      const cardH = cardRef.current?.offsetHeight ?? 240;
      setSize((s) => (s.vw === window.innerWidth && s.vh === window.innerHeight && s.cardH === cardH ? s : { vw: window.innerWidth, vh: window.innerHeight, cardH }));
      const el = name ? findSpot(name) : null;
      if (!el) {
        setBox((b) => (b ? null : b));
        return;
      }
      if (!scrolled) {
        scrolled = true;
        el.scrollIntoView({ block: "center", inline: "nearest", behavior: reduced() ? "auto" : "smooth" });
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
    if (!isDone) return;
    const t = setTimeout(next, 900);
    return () => clearTimeout(t);
  }, [isDone, n, next]);

  // Focus follows the tour, unless a dialog the visitor is working in has it.
  useEffect(() => {
    if (!modalOpen()) headRef.current?.focus();
  }, [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !modalOpen()) closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const pos = placeCard(box, size.cardH, size.vw, size.vh);
  const hole = box && { x: box.x - PAD, y: box.y - PAD, w: box.w + PAD * 2, h: box.h + PAD * 2, r: 12 };
  const path =
    `M0 0H${size.vw}V${size.vh}H0Z` +
    (hole
      ? ` M${hole.x + hole.r} ${hole.y}h${hole.w - hole.r * 2}a${hole.r} ${hole.r} 0 0 1 ${hole.r} ${hole.r}v${hole.h - hole.r * 2}a${hole.r} ${hole.r} 0 0 1 -${hole.r} ${hole.r}h-${hole.w - hole.r * 2}a${hole.r} ${hole.r} 0 0 1 -${hole.r} -${hole.r}v-${hole.h - hole.r * 2}a${hole.r} ${hole.r} 0 0 1 ${hole.r} -${hole.r}Z`
      : "");
  const canGo = !step.ready || step.ready(ctx);

  return (
    <div className="gd">
      <svg className="gd-dim" width={size.vw} height={size.vh} aria-hidden="true">
        <path d={path} fillRule="evenodd" />
      </svg>
      {hole && <div className={`gd-ring${step.doIt ? " gd-ring-do" : ""}`} aria-hidden="true" style={{ left: hole.x, top: hole.y, width: hole.w, height: hole.h }} />}
      <div className="gd-card" ref={cardRef} data-guide-card role="region" aria-label={`${tour.title}, step ${Math.min(n + 1, counted)} of ${counted}`} style={{ left: pos.left, top: pos.top, width: pos.width }}>
        <div className="gd-top">
          <span className="gd-count">{step.end ? "Your next step" : `Step ${n + 1} of ${counted}`}</span>
          <button type="button" className="gd-x" onClick={onClose} aria-label="Close the tour">
            <IconX size={16} aria-hidden="true" />
          </button>
        </div>
        <h2 className="gd-h" ref={headRef} tabIndex={-1}>
          {step.title(ctx)}
        </h2>
        <p className="gd-text" aria-live="polite">
          {step.text(ctx)}
        </p>
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
