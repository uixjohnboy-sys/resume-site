"use client";

import { useEffect, useRef } from "react";

// The floating cards stop being pictures and run as a system.
//
// The story is the one in "the wall": a client pays once, Stripe delivers
// the webhook five times, and exactly one payment is recorded. On a loop:
//   attempt 1: the payload card takes it ("recorded"), a packet goes to the
//              GHL API card (contact.create 201), another moves the pipeline
//              to Won, and the count card reads 1 event / 1 payment;
//   attempts 2 to 5: the payload card answers "duplicate, ignored" and only
//              the event counter moves. Payments stay at 1.
// Then it rests, resets and runs again.
//
// Packets are drawn on one canvas behind the cards (so lines tuck under
// them) and in front of the portrait (so data visibly runs through him).
// Card positions are re-read every frame because the cards float and follow
// the pointer. Wide screens only (below 1001px most cards are hidden), off under
// prefers-reduced-motion, and paused whenever the hero is off screen or the
// tab is hidden: the sequence runs on its own clock, which only advances
// while it is visible.
//
// The server-rendered cards already show the end state (5 events, 1
// payment, Won), so nothing is lost if this never runs.

type Packet = { from: Element; to: Element; start: number; dur: number; bend: number };

const AMBER = "255,178,36";

function setText(root: Element, key: string, value: string) {
  const el = root.querySelector(`[data-live="${key}"]`);
  if (el && el.textContent !== value) el.textContent = value;
}

function setEvents(root: Element, n: number) {
  setText(root, "events", String(n));
  setText(root, "evword", n === 1 ? "event" : "events");
}

function hit(el: Element | null, cls = "v3-hit") {
  if (!el) return;
  el.classList.remove(cls);
  // Restart the CSS animation.
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
}

export default function LiveSystem() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current;
    const stage = cv?.parentElement;
    const hero = cv?.closest(".v3-hero");
    if (!cv || !stage || !hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Below 1001px most of the cards it routes between are hidden.
    if (window.matchMedia("(max-width: 1000px)").matches) return;
    const g = cv.getContext("2d");
    if (!g) return;

    const card = (c: string) => stage.querySelector(`.v3-art-${c}`);
    const payload = card("payload");
    const count = card("count");
    const api = card("api");
    const pipe = card("pipe");
    if (!payload || !count || !api || !pipe) return;
    const won = pipe.querySelector('[data-live="won"]');

    let alive = true;
    let visible = true;
    let raf = 0;
    // The sequence clock: milliseconds of visible running time.
    let clock = 0;
    let last = 0;
    let packets: Packet[] = [];
    const waiters: { at: number; res: () => void }[] = [];

    const wait = (ms: number) => new Promise<void>((res) => waiters.push({ at: clock + ms, res }));
    const send = (from: Element, to: Element, dur = 700, bend = 0.22) => {
      packets.push({ from, to, start: clock, dur, bend });
      return wait(dur);
    };

    let dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
    };
    size();

    const center = (el: Element, base: DOMRect) => {
      const r = el.getBoundingClientRect();
      return { x: (r.left + r.width / 2 - base.left) * dpr, y: (r.top + r.height / 2 - base.top) * dpr };
    };

    const draw = () => {
      const base = cv.getBoundingClientRect();
      g.clearRect(0, 0, cv.width, cv.height);
      packets = packets.filter((p) => clock - p.start < p.dur + 350);
      for (const p of packets) {
        const a = center(p.from, base);
        const b = center(p.to, base);
        // Bend the path sideways so it reads as a route, not a ruler line.
        const mx = (a.x + b.x) / 2 - (b.y - a.y) * p.bend;
        const my = (a.y + b.y) / 2 + (b.x - a.x) * p.bend;
        const life = (clock - p.start) / p.dur;
        const fade = life > 1 ? 1 - (life - 1) / 0.35 : Math.min(1, life * 4);

        g.lineWidth = 1.2 * dpr;
        g.setLineDash([3 * dpr, 5 * dpr]);
        g.strokeStyle = `rgba(${AMBER},${(0.32 * fade).toFixed(3)})`;
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.quadraticCurveTo(mx, my, b.x, b.y);
        g.stroke();
        g.setLineDash([]);

        if (life <= 1) {
          // Ease the packet, and draw a short comet trail behind it.
          for (let k = 6; k >= 0; k--) {
            const tt = Math.max(0, life - k * 0.025);
            const t = tt < 0.5 ? 2 * tt * tt : 1 - Math.pow(-2 * tt + 2, 2) / 2;
            const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x;
            const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * b.y;
            const rad = (k === 0 ? 4.2 : 3 - k * 0.35) * dpr;
            if (k === 0) {
              const glow = g.createRadialGradient(x, y, 0, x, y, rad * 4);
              glow.addColorStop(0, `rgba(${AMBER},0.55)`);
              glow.addColorStop(1, `rgba(${AMBER},0)`);
              g.fillStyle = glow;
              g.beginPath();
              g.arc(x, y, rad * 4, 0, Math.PI * 2);
              g.fill();
              g.fillStyle = "#ffe2a8";
            } else {
              g.fillStyle = `rgba(${AMBER},${(0.5 - k * 0.07).toFixed(2)})`;
            }
            g.beginPath();
            g.arc(x, y, Math.max(0.6, rad), 0, Math.PI * 2);
            g.fill();
          }
        }
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive) return;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      clock += dt;
      for (let i = waiters.length - 1; i >= 0; i--) {
        if (clock >= waiters[i].at) {
          const w = waiters[i];
          waiters.splice(i, 1);
          w.res();
        }
      }
      draw();
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && alive && visible && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(hero);
    const onVis = () => start();
    document.addEventListener("visibilitychange", onVis);
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(size, 150);
    };
    window.addEventListener("resize", onResize);

    const reset = () => {
      setText(payload, "attempt", "1");
      setText(payload, "verdict", "listening");
      payload.classList.remove("v3-dup");
      setEvents(count, 0);
      setText(count, "paid", "0");
      won?.classList.remove("on");
    };

    const run = async () => {
      // Let the hero intro land first.
      await wait(2600);
      while (alive) {
        reset();
        await wait(900);
        for (let k = 1; k <= 5 && alive; k++) {
          setText(payload, "attempt", String(k));
          hit(payload);
          if (k === 1) {
            setText(payload, "verdict", "recorded");
            payload.classList.remove("v3-dup");
            send(payload, count, 650, -0.18).then(() => {
              setEvents(count, 1);
              setText(count, "paid", "1");
              hit(count);
            });
            await send(payload, api, 820, 0.2);
            setText(api, "ms", `${140 + Math.round(Math.random() * 80)}ms`);
            hit(api);
            await send(api, pipe, 620, 0.25);
            won?.classList.add("on");
            hit(pipe);
            await wait(700);
          } else {
            setText(payload, "verdict", "duplicate, ignored");
            payload.classList.add("v3-dup");
            await send(payload, count, 560, -0.18);
            setEvents(count, k);
            hit(count);
            await wait(420);
          }
        }
        await wait(3200);
      }
    };
    run();
    start();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      // Leave the cards on their honest end state.
      setText(payload, "attempt", "5");
      setText(payload, "verdict", "duplicate, ignored");
      setEvents(count, 5);
      setText(count, "paid", "1");
      won?.classList.add("on");
    };
  }, []);

  return <canvas ref={ref} className="v3-live" aria-hidden="true" />;
}
