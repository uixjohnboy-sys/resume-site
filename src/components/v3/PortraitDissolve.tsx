"use client";

import { useEffect, useRef } from "react";
import { voice } from "./voice";

// The portrait, dissolving into data.
//
// Why this exists: the leather-jacket portrait is an upscaled source and goes
// soft at size. Rather than hide that with a smaller image, the edges of the
// figure break into pixel blocks that drift away, and a fine scanline grain
// runs over the body. The face stays solid; everything soft reads as
// intentional texture instead of blur. It is also the brand story: a person
// made of systems.
//
// Layers, drawn into the existing .v3-portrait box over the <Image> fallback:
//   1. base canvas, drawn once per size: the photo with a blocky dissolve that
//      is zero around the face and rises toward the sides and the bottom,
//      a magenta "burn" on the dissolving edge, cells breaking off upward,
//      and scanlines + grain clipped to the figure.
//   2. particle canvas, animated: blocks sampled from the dissolved cells,
//      rising and fading. Paused off-screen and when the tab is hidden; not
//      drawn at all under prefers-reduced-motion.
// While the AI twin speaks (TwinVoice), voice.level lifts the particle count
// and speed and turns some of them amber, so the figure visibly "talks".
// If anything fails, the plain <Image> underneath stays visible.

type Cell = { x: number; y: number; r: number; g: number; b: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; c: string };

const SRC = "/v3/jb-hero.webp";

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function smooth(a: number, b: number, t: number) {
  const v = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return v * v * (3 - 2 * v);
}

// 0 inside the face/upper-chest core, rising to 1 toward the frame edges and
// the bottom. Tuned to this portrait: face centre near (0.52, 0.30).
function dissolveAt(nx: number, ny: number) {
  const e = Math.hypot((nx - 0.52) / 0.36, (ny - 0.42) / 0.55);
  return Math.max(smooth(0.82, 1.32, e), smooth(0.64, 0.99, ny));
}

export default function PortraitDissolve() {
  const baseRef = useRef<HTMLCanvasElement | null>(null);
  const partRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const base = baseRef.current;
    const part = partRef.current;
    const box = base?.parentElement;
    if (!base || !part || !box) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const img = new Image();
    img.decoding = "async";
    img.src = SRC;

    let cells: Cell[] = [];
    let particles: Particle[] = [];
    let raf = 0;
    let visible = true;
    let cellPx = 8;
    let W = 0;
    let H = 0;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const css = box.getBoundingClientRect().width;
      if (!css) return;
      W = H = Math.round(css * dpr);
      for (const c of [base, part]) {
        c.width = W;
        c.height = H;
      }
      cellPx = Math.max(4, Math.round(W / 120));

      // Source at render size, kept off-screen for sampling and break-offs.
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const o = off.getContext("2d", { willReadFrequently: true });
      const ctx = base.getContext("2d");
      if (!o || !ctx) return;
      o.drawImage(img, 0, 0, W, H);
      const px = o.getImageData(0, 0, W, H).data;

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(off, 0, 0);

      cells = [];
      const glow: [number, number][] = [];
      const breaks: [number, number, number][] = [];
      for (let y = 0; y < H; y += cellPx) {
        for (let x = 0; x < W; x += cellPx) {
          const cx = Math.min(W - 1, x + (cellPx >> 1));
          const cy = Math.min(H - 1, y + (cellPx >> 1));
          const i = (cy * W + cx) * 4;
          if (px[i + 3] < 40) continue; // empty background
          const v = dissolveAt(cx / W, cy / H);
          if (v <= 0.001) continue;
          const n = hash(x / cellPx, y / cellPx);
          if (n < v) {
            ctx.clearRect(x, y, cellPx, cellPx);
            if (n > v - 0.14) breaks.push([x, y, v - n]);
            cells.push({ x, y, r: px[i], g: px[i + 1], b: px[i + 2] });
          } else if (n - v < 0.07) {
            glow.push([x, y]);
          }
        }
      }

      // Cells breaking off: drawn back a little higher and fainter, as if
      // just lifting away from the body.
      for (const [x, y, k] of breaks) {
        ctx.globalAlpha = 0.85 - k * 4;
        ctx.drawImage(off, x, y, cellPx, cellPx, x + k * cellPx * 3, y - k * cellPx * 14, cellPx, cellPx);
      }
      ctx.globalAlpha = 1;

      // Texture clipped to the figure: magenta burn on the dissolve edge,
      // scanlines, and a light grain. This is what hides the softness.
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "rgba(255, 45, 111, 0.42)";
      for (const [x, y] of glow) ctx.fillRect(x, y, cellPx, cellPx);

      const step = Math.max(2, Math.round(3 * dpr));
      ctx.fillStyle = "rgba(8, 6, 18, 0.1)";
      for (let y = 0; y < H; y += step) ctx.fillRect(0, y, W, Math.max(1, Math.round(dpr)));

      const tile = document.createElement("canvas");
      tile.width = tile.height = 96;
      const t = tile.getContext("2d");
      if (t) {
        const d = t.createImageData(96, 96);
        for (let k = 0; k < d.data.length; k += 4) {
          const g = Math.random() * 255;
          d.data[k] = d.data[k + 1] = d.data[k + 2] = g;
          d.data[k + 3] = 22;
        }
        t.putImageData(d, 0, 0);
        const pat = ctx.createPattern(tile, "repeat");
        if (pat) {
          ctx.fillStyle = pat;
          ctx.fillRect(0, 0, W, H);
        }
      }
      ctx.globalCompositeOperation = "source-over";

      box.setAttribute("data-dissolve", "on");
      particles = [];
    };

    const spawn = (): Particle | null => {
      if (!cells.length) return null;
      const c = cells[(Math.random() * cells.length) | 0];
      const amber = Math.random() < voice.level * 0.7;
      const tint = !amber && Math.random() < 0.28;
      const max = 120 + Math.random() * 180;
      return {
        x: c.x,
        y: c.y,
        vx: (Math.random() - 0.35) * 0.5 * (W / 640),
        vy: -(0.25 + Math.random() * 0.9) * (W / 640),
        life: 0,
        max,
        s: cellPx * (0.45 + Math.random() * 0.6),
        c: amber ? "255,178,36" : tint ? "255,45,111" : `${c.r},${c.g},${c.b}`,
      };
    };

    const target = () => Math.round((window.innerWidth < 761 ? 60 : 150) * (1 + voice.level * 0.9));

    const frame = () => {
      raf = 0;
      if (!visible || document.hidden) return;
      const ctx = part.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      while (particles.length < target()) {
        const p = spawn();
        if (!p) break;
        p.life = Math.random() * p.max; // stagger the first batch
        particles.push(p);
      }
      const boost = 1 + voice.level * 2.6;
      for (let k = 0; k < particles.length; k++) {
        const p = particles[k];
        p.life += boost > 1.05 ? 1.4 : 1;
        p.x += p.vx * boost;
        p.y += p.vy * boost;
        const t = p.life / p.max;
        if (t >= 1) {
          // Shed the extra particles once the voice goes quiet again.
          if (particles.length > target()) {
            particles.splice(k, 1);
            k--;
            continue;
          }
          const n = spawn();
          if (n) particles[k] = n;
          continue;
        }
        const a = Math.sin(Math.PI * t) * 0.85;
        ctx.fillStyle = `rgba(${p.c},${a.toFixed(3)})`;
        const s = p.s * (1 - t * 0.5);
        ctx.fillRect(p.x, p.y, s, s);
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!reduced && !raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(draw, 180);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      },
      { rootMargin: "120px" }
    );
    const onVis = () => start();

    img.onload = () => {
      try {
        draw();
        io.observe(box);
        start();
      } catch {
        box.removeAttribute("data-dissolve");
      }
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      window.clearTimeout(resizeTimer);
      box.removeAttribute("data-dissolve");
    };
  }, []);

  return (
    <>
      <canvas ref={baseRef} className="v3-dissolve" aria-hidden="true" />
      <canvas ref={partRef} className="v3-dissolve v3-dissolve-particles" aria-hidden="true" />
    </>
  );
}
