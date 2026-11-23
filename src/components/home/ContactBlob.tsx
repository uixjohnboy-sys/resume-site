"use client";
import { useEffect, useRef, useState } from "react";

// No name tags under the circles (JB 2026-11-22): the figure says YOU on its body, and John Boy's face needs no label.
// The contact section's slider (JB 2026-11-22, on a "gooey blob" reference, black and white): the visitor's circle ("You")
// on the left, John Boy's photo on the right, and a handle stuck to the left circle. Drag (or tap) the handle across: it
// stretches like liquid, lets go of "You", joins John Boy, and the four ways to reach him come up underneath.
// The liquid look is an SVG "goo" filter (blur, then a hard alpha cut) on plain white shapes; the photos sit on top, unfiltered.
// Motion is a spring on one number, t (0 = with You, 1 = with John Boy), written straight to the SVG each frame.

type Props = { book: string; brief: string; email: string; whatsapp: string };

const W = 460;
const CY = 85;
const LX = 85;
const RX = 375;
const R = 78;
const INNER = 66;
const H0 = 183; // handle centre when it sits with You
const TRAVEL = 94; // to 277, where it sits with John Boy
const PILL_W = 120;
const PILL_H = 96;

export default function ContactBlob({ book, brief, email, whatsapp }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pillRef = useRef<SVGRectElement>(null);
  const knobRef = useRef<SVGGElement>(null);
  const [open, setOpen] = useState(false);
  const s = useRef({ t: 0, v: 0, target: 0, raf: 0, last: 0, touched: false, reduce: false });

  const draw = () => {
    const { t } = s.current;
    const hx = H0 + TRAVEL * t;
    // the handle stretches a little mid-way, like a drop pulled between two pools
    const w = PILL_W + 26 * Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
    pillRef.current?.setAttribute("x", (hx - w / 2).toFixed(2));
    pillRef.current?.setAttribute("width", w.toFixed(2));
    knobRef.current?.setAttribute("transform", `translate(${hx.toFixed(2)} ${CY})`);
  };

  const step = (now: number) => {
    const st = s.current;
    const dt = Math.min(0.032, (now - (st.last || now)) / 1000) || 1 / 60;
    st.last = now;
    // a spring that settles with one small bounce
    const k = 240;
    const c = 2 * Math.sqrt(k) * 0.78;
    st.v += (k * (st.target - st.t) - c * st.v) * dt;
    st.t += st.v * dt;
    draw();
    if (Math.abs(st.target - st.t) < 0.0008 && Math.abs(st.v) < 0.002) {
      st.t = st.target;
      st.v = 0;
      st.raf = 0;
      st.last = 0;
      draw();
      return;
    }
    st.raf = requestAnimationFrame(step);
  };

  const go = (target: number) => {
    const st = s.current;
    st.target = target;
    if (target === 1 || target === 0) setOpen(target === 1);
    if (st.reduce) {
      st.t = target;
      st.v = 0;
      draw();
      return;
    }
    if (!st.raf) st.raf = requestAnimationFrame(step);
  };

  useEffect(() => {
    const st = s.current;
    st.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    draw();
    // once, when the slider first comes into view, the handle leans toward John Boy and back: "this moves"
    const svg = svgRef.current;
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        if (st.reduce || st.touched) return;
        timer = window.setTimeout(() => {
          if (st.touched) return;
          st.target = 0.22;
          if (!st.raf) st.raf = requestAnimationFrame(step);
          timer = window.setTimeout(() => {
            if (!st.touched) go(0);
          }, 520);
        }, 350);
      },
      { threshold: 0.7 },
    );
    if (svg) io.observe(svg);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      if (st.raf) cancelAnimationFrame(st.raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // dragging: the handle follows the finger or mouse; on release it goes where it was heading
  const drag = useRef<{ id: number; x0: number; t0: number; moved: boolean; vx: number; lx: number; lt: number } | null>(null);
  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const st = s.current;
    st.touched = true;
    if (st.raf) cancelAnimationFrame(st.raf);
    st.raf = 0;
    st.last = 0;
    st.v = 0;
    drag.current = { id: e.pointerId, x0: e.clientX, t0: st.t, moved: false, vx: 0, lx: e.clientX, lt: performance.now() };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* the pointer already ended; the move and up events still arrive */
    }
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    const svg = svgRef.current;
    if (!d || d.id !== e.pointerId || !svg) return;
    const unitsPerPx = W / svg.getBoundingClientRect().width;
    const dx = e.clientX - d.x0;
    if (Math.abs(dx) > 4) d.moved = true;
    const now = performance.now();
    if (now > d.lt) d.vx = (e.clientX - d.lx) / (now - d.lt);
    d.lx = e.clientX;
    d.lt = now;
    let t = d.t0 + (dx * unitsPerPx) / TRAVEL;
    // a little give past either end, like a rubber band
    if (t < 0) t = t / 3;
    if (t > 1) t = 1 + (t - 1) / 3;
    s.current.t = Math.max(-0.12, Math.min(1.12, t));
    draw();
  };
  const onUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const st = s.current;
    if (!d.moved) return go(st.target === 1 ? 0 : 1);
    // a quick flick decides; otherwise the side it is nearer
    if (d.vx > 0.35) return go(1);
    if (d.vx < -0.35) return go(0);
    go(st.t > 0.5 ? 1 : 0);
  };
  const onKey = (e: React.KeyboardEvent) => {
    s.current.touched = true;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go(s.current.target === 1 ? 0 : 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(0);
    }
  };

  return (
    <div className={`cb${open ? " is-open" : ""}`}>
      <div className="cb-stage">
        <svg
          ref={svgRef}
          className="cb-svg"
          viewBox={`0 0 ${W} 170`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <defs>
            <filter id="cb-goo" x="-10%" y="-30%" width="120%" height="160%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b" />
              <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
            </filter>
            <filter id="cb-mono">
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <clipPath id="cb-clip-l">
              <circle cx={LX} cy={CY} r={INNER} />
            </clipPath>
            <clipPath id="cb-clip-r">
              <circle cx={RX} cy={CY} r={INNER} />
            </clipPath>
            <radialGradient id="cb-you" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#3a3a38" />
              <stop offset="100%" stopColor="#151515" />
            </radialGradient>
          </defs>

          {/* the liquid: two rings and the handle, all one white shape once filtered */}
          <g filter="url(#cb-goo)" fill="#f2f2ef">
            <circle cx={LX} cy={CY} r={R} />
            <circle cx={RX} cy={CY} r={R} />
            <rect ref={pillRef} x={H0 - PILL_W / 2} y={CY - PILL_H / 2} width={PILL_W} height={PILL_H} rx={PILL_H / 2} />
          </g>

          {/* You: a plain figure, since the visitor is whoever is reading */}
          <g clipPath="url(#cb-clip-l)" aria-hidden="true">
            <circle cx={LX} cy={CY} r={INNER} fill="url(#cb-you)" />
            <circle cx={LX} cy={CY - 14} r={21} fill="#8a8a86" />
            <ellipse cx={LX} cy={CY + 52} rx={44} ry={38} fill="#8a8a86" />
            <text className="cb-you" x={LX} y={CY + 47} textAnchor="middle">
              YOU
            </text>
          </g>

          {/* John Boy */}
          <g clipPath="url(#cb-clip-r)" aria-hidden="true">
            <rect x={RX - INNER} y={CY - INNER} width={INNER * 2} height={INNER * 2} fill="#e9e9e6" />
            <image
              href="/jb-portrait.png"
              x={RX - INNER - 14}
              y={CY - INNER - 4}
              width={INNER * 2 + 28}
              height={INNER * 2 + 28}
              preserveAspectRatio="xMidYMid slice"
              filter="url(#cb-mono)"
            />
          </g>

          {/* the handle's dot and arrow ride on top of the liquid */}
          <g
            ref={knobRef}
            className="cb-knob"
            transform={`translate(${H0} ${CY})`}
            role="button"
            tabIndex={0}
            aria-label={open ? "Hide the ways to reach me" : "Show the ways to reach me"}
            aria-expanded={open}
            aria-controls="cb-actions"
            onKeyDown={onKey}
          >
            <circle className="cb-ring" r={40} fill="transparent" />
            <g className="cb-arrow">
              <circle cx={-16} cy={0} r={5} fill="#0a0a0a" />
              <path d="M-2 0 H18 M11 -7 L18 0 L11 7" fill="none" stroke="#0a0a0a" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        </svg>

      </div>

      <p className="cb-hint" aria-hidden={open}>
        Drag or swipe right to contact me <span aria-hidden="true">→</span>
      </p>

      <div className="cb-actions" id="cb-actions" inert={!open}>
        <a className="v4-btn v4-btn-dark" href={book}>
          Book a 15-min call
        </a>
        <a className="v4-btn v4-btn-line" href={brief}>
          Send me your brief
        </a>
        <a className="v4-btn v4-btn-line" href={email}>
          Email me
        </a>
        <a className="v4-btn v4-btn-line" href={whatsapp}>
          WhatsApp
        </a>
      </div>
    </div>
  );
}
