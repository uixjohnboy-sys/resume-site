"use client";

import { useEffect, useRef } from "react";
import { voice } from "./voice";
import { scene } from "./scene";
import { smokeSprites, type SmokeTint } from "./smoke";

// The portrait, turning to smoke at its edges (JB, 2026-10-03: the old pixel
// dissolve became smoke, to match the cursor's smoke trail).
//
// Why this exists: the leather-jacket portrait is an upscaled source and goes
// soft at size. Rather than show a hard, soft-focus cut-out, the figure's
// sides and bottom thin out into moving smoke and puffs rise off the body.
// The face and chest stay solid; everything soft reads as intentional.
//
// Layers, drawn into the existing .v3-portrait box over the <Image> fallback:
//   1. base canvas: the photo through a living mask. The mask is fractal
//      value noise pushed by the same "how far from the face" field the old
//      dissolve used, so it is fully opaque around the face and frays toward
//      the sides and the bottom; the noise drifts upward over time, so the
//      edges billow like smoke instead of sitting still. A faint grain is
//      clipped to the figure.
//   2. smoke canvas: puffs (the shared sprites from smoke.ts) released along
//      the fraying band, drifting outward and up, swelling and fading,
//      painted additively and screened over the photo.
// While the AI twin speaks (TwinVoice), voice.level releases more smoke,
// faster and warmer, so the figure visibly "talks". As the hero scrolls
// away, scene.erode (set by V3Motion) eats the mask inward until the whole
// figure has gone to smoke, and the smoke rises faster to carry him off.
// Paused off-screen and in hidden tabs; with prefers-reduced-motion the mask
// is drawn once and no smoke moves. If anything fails, the plain <Image>
// underneath stays visible.

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
  tint: SmokeTint;
};

const SRC = "/v3/jb-hero.webp";

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

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function vnoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number) {
  return vnoise(x, y) * 0.55 + vnoise(x * 2.03 + 17.1, y * 2.03 + 9.3) * 0.3 + vnoise(x * 4.1 + 3.7, y * 4.1 + 31.2) * 0.15;
}

// How much of the photo survives at (nx, ny) at time t: 1 at the core, 0 in
// the smoke. The noise is sampled lower as time passes, so its shapes rise.
function maskAt(nx: number, ny: number, t: number) {
  // Scrolling away pushes the whole field up, so the smoke reaches the face
  // last and takes everything by the time the hero has left.
  const d = dissolveAt(nx, ny) + scene.erode * 1.35;
  if (d <= 0.001) return 1;
  const n = fbm(nx * 3.4 + t * 0.004, ny * 3.4 + t * 0.016);
  return 1 - smooth(0.42, 0.86, d * 1.35 + (n - 0.5) * 0.95);
}

export default function PortraitDissolve() {
  const baseRef = useRef<HTMLCanvasElement | null>(null);
  const partRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const base = baseRef.current;
    const part = partRef.current;
    const box = base?.parentElement;
    if (!base || !part || !box) return;
    const bctx = base.getContext("2d");
    const pctx = part.getContext("2d");
    if (!bctx || !pctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = () => window.innerWidth < 761;
    const img = new Image();
    img.decoding = "async";
    img.src = SRC;

    const sprites = smokeSprites();
    let W = 0;
    // The smoke canvas reaches 15% past the photo on every side, so puffs
    // drifting off the figure are not cut by the box edge.
    const PAD = 0.15;
    let P = 0;
    let off = 0;
    let M = 128;
    let src: HTMLCanvasElement | null = null;
    let mask: HTMLCanvasElement | null = null;
    let mctx: CanvasRenderingContext2D | null = null;
    let maskData: ImageData | null = null;
    let fig = new Float32Array(0);
    let emitters: number[] = [];
    let grain: CanvasPattern | null = null;
    let puffs: Puff[] = [];
    let raf = 0;
    let visible = true;
    let t = 0;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, phone() ? 1.5 : 2);
      const css = box.getBoundingClientRect().width;
      if (!css) return false;
      W = Math.round(css * dpr);
      M = phone() ? 96 : 128;
      base.width = base.height = W;
      off = Math.round(W * PAD);
      P = W + off * 2;
      part.width = part.height = P;

      src = document.createElement("canvas");
      src.width = src.height = W;
      src.getContext("2d")?.drawImage(img, 0, 0, W, W);

      // Where the figure is (the photo's own cut-out), at mask resolution.
      const small = document.createElement("canvas");
      small.width = small.height = M;
      const sctx = small.getContext("2d", { willReadFrequently: true });
      if (!sctx) return false;
      sctx.drawImage(img, 0, 0, M, M);
      const px = sctx.getImageData(0, 0, M, M).data;
      fig = new Float32Array(M * M);
      for (let i = 0; i < M * M; i++) fig[i] = px[i * 4 + 3] / 255;

      mask = document.createElement("canvas");
      mask.width = mask.height = M;
      mctx = mask.getContext("2d");
      maskData = mctx ? mctx.createImageData(M, M) : null;

      const tile = document.createElement("canvas");
      tile.width = tile.height = 96;
      const tg = tile.getContext("2d");
      if (tg) {
        const d = tg.createImageData(96, 96);
        for (let k = 0; k < d.data.length; k += 4) {
          const v = Math.random() * 255;
          d.data[k] = d.data[k + 1] = d.data[k + 2] = v;
          d.data[k + 3] = 18;
        }
        tg.putImageData(d, 0, 0);
        grain = bctx.createPattern(tile, "repeat");
      }
      puffs = [];
      return true;
    };

    const buildMask = (collect: boolean) => {
      if (!mctx || !maskData) return;
      const data = maskData.data;
      if (collect) emitters = [];
      for (let y = 0; y < M; y++) {
        const ny = (y + 0.5) / M;
        for (let x = 0; x < M; x++) {
          const nx = (x + 0.5) / M;
          const a = maskAt(nx, ny, t);
          data[(y * M + x) * 4 + 3] = a * 255;
          // Smoke leaves from the fraying band, where there is figure.
          if (collect && fig[y * M + x] > 0.4 && a > 0.12 && a < 0.8) emitters.push(nx, ny);
        }
      }
      mctx.putImageData(maskData, 0, 0);
    };

    const drawBase = () => {
      if (!src || !mask) return;
      bctx.globalCompositeOperation = "source-over";
      bctx.clearRect(0, 0, W, W);
      bctx.drawImage(src, 0, 0);
      bctx.globalCompositeOperation = "destination-in";
      bctx.imageSmoothingEnabled = true;
      bctx.imageSmoothingQuality = "high";
      bctx.drawImage(mask, 0, 0, W, W);
      if (grain) {
        bctx.globalCompositeOperation = "source-atop";
        bctx.fillStyle = grain;
        bctx.fillRect(0, 0, W, W);
      }
      bctx.globalCompositeOperation = "source-over";
    };

    const spawn = () => {
      if (!emitters.length) return;
      const k = ((Math.random() * emitters.length) / 2) | 0;
      const nx = emitters[k * 2];
      const ny = emitters[k * 2 + 1];
      const s = W / 640;
      const lv = voice.level;
      const roll = Math.random();
      const warm = 0.25 + lv * 0.45;
      const tint: SmokeTint = roll < warm ? "amber" : roll < warm + 0.2 ? "pink" : roll < warm + 0.32 ? "violet" : "pale";
      const speed = 1 + lv * 2;
      puffs.push({
        x: off + nx * W + (Math.random() - 0.5) * 10 * s,
        y: off + ny * W + (Math.random() - 0.5) * 10 * s,
        vx: ((nx - 0.52) * 0.9 + (Math.random() - 0.5) * 0.4) * s * speed,
        vy: -(0.25 + Math.random() * 0.55) * s * speed,
        r: (10 + Math.random() * 18) * s,
        grow: (0.22 + Math.random() * 0.4) * s,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.015,
        life: 0,
        max: 100 + Math.random() * 90,
        a: 0.2 + Math.random() * 0.16,
        tint,
      });
    };

    const drawSmoke = () => {
      pctx.clearRect(0, 0, P, P);
      pctx.globalCompositeOperation = "lighter";
      const target = Math.round((phone() ? 45 : 110) * (1 + voice.level * 1.5 + scene.erode * 0.9));
      // Release a few per frame until the room is full.
      for (let n = 0; n < 3 && puffs.length < target; n++) spawn();
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.life++;
        const k = p.life / p.max;
        if (k >= 1) {
          puffs.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy * (1 + scene.erode * 2.2);
        p.vx *= 0.99;
        p.vy *= 0.995;
        p.r += p.grow;
        p.rot += p.vr;
        pctx.globalAlpha = p.a * Math.min(1, k * 5) * Math.pow(1 - k, 1.4);
        const d = p.r * 2;
        pctx.save();
        pctx.translate(p.x, p.y);
        pctx.rotate(p.rot);
        pctx.drawImage(sprites[p.tint], -d / 2, -d / 2, d, d);
        pctx.restore();
      }
      pctx.globalAlpha = 1;
      pctx.globalCompositeOperation = "source-over";
    };

    const frame = () => {
      raf = 0;
      if (!visible || document.hidden) return;
      t++;
      // The mask breathes at half the frame rate: smooth enough, half the cost.
      if (t % 2 === 0) {
        buildMask(t % 30 === 0);
        drawBase();
      }
      drawSmoke();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!reduced && !raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const init = () => {
      if (!setup()) return;
      buildMask(true);
      drawBase();
      box.setAttribute("data-dissolve", "on");
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        try {
          init();
        } catch {
          box.removeAttribute("data-dissolve");
        }
      }, 180);
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
        init();
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
