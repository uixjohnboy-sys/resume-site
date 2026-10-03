"use client";

import { useEffect, useRef } from "react";
import { smokeSprites } from "./smoke";

// Smoke that trails the mouse (JB, 2026-10-03: no custom cursor icon, he
// wanted a smoke effect instead). The system cursor stays as it is; this
// only paints soft puffs behind it.
//
// How: one full-screen canvas, never in the way of clicks. Each mouse move
// releases puffs along the path, more for faster moves. A puff is a
// pre-rendered soft sprite (amber, violet-pink or a pale white) that drifts
// with the hand's momentum, rises, swells, turns slowly and fades. Painted
// with "lighter" at low alpha so overlapping puffs glow like lit smoke.
//
// Costs nothing at rest: the loop only runs while puffs are alive. Only for
// a fine pointer (mouse or trackpad) with motion allowed, capped at 160 puffs
// and 1.5x pixel density.

type Puff = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  grow: number;
  rot: number;
  vr: number;
  life: number;
  max: number;
  a: number;
  s: number;
};

const MAX = 160;
export default function Cursor() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    const g = cv.getContext("2d");
    if (!g) return;

    const all = smokeSprites();
    const sprites = [all.amber, all.pink, all.violet, all.pale];
    let dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
    };
    size();

    const puffs: Puff[] = [];
    let raf = 0;
    let last: { x: number; y: number } | null = null;

    const add = (x: number, y: number, vx: number, vy: number, speed: number) => {
      if (puffs.length >= MAX) puffs.shift();
      // Mostly amber, with pink and violet threads and a little pale smoke.
      const roll = Math.random();
      const s = roll < 0.45 ? 0 : roll < 0.65 ? 1 : roll < 0.85 ? 2 : 3;
      puffs.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: vx * 0.06 + (Math.random() - 0.5) * 0.6,
        vy: vy * 0.06 + (Math.random() - 0.5) * 0.6 - 0.2,
        r: 14 + Math.random() * 14 + Math.min(speed, 40) * 0.35,
        grow: 0.45 + Math.random() * 0.55,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.02,
        life: 0,
        max: 55 + Math.random() * 45,
        a: 0.32 + Math.random() * 0.18,
        s,
      });
    };

    const frame = () => {
      raf = 0;
      g.clearRect(0, 0, cv.width, cv.height);
      g.globalCompositeOperation = "lighter";
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.life++;
        const t = p.life / p.max;
        if (t >= 1) {
          puffs.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.955;
        p.vy = p.vy * 0.955 - 0.035;
        p.r += p.grow;
        p.rot += p.vr;
        const alpha = p.a * Math.min(1, t * 6) * Math.pow(1 - t, 1.6);
        const d = p.r * 2 * dpr;
        g.save();
        g.globalAlpha = alpha;
        g.translate(p.x * dpr, p.y * dpr);
        g.rotate(p.rot);
        g.drawImage(sprites[p.s], -d / 2, -d / 2, d, d);
        g.restore();
      }
      g.globalCompositeOperation = "source-over";
      if (puffs.length) raf = requestAnimationFrame(frame);
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX;
      const y = e.clientY;
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        const n = Math.min(5, Math.ceil(dist / 14));
        for (let k = 1; k <= n; k++) add(last.x + (dx * k) / n, last.y + (dy * k) / n, dx, dy, dist);
      } else {
        add(x, y, 0, 0, 0);
      }
      last = { x, y };
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const leave = () => {
      last = null;
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(size, 150);
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas className="v3-smoke" ref={ref} aria-hidden="true" />;
}
