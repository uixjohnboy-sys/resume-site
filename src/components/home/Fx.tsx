"use client";

// Motion layer for the v2 portfolio. Three effects, all cheap:
//   1. Scroll reveals: elements with [data-reveal] fade/rise when they
//      enter the viewport, staggered by their data-reveal value (ms).
//   2. Count-up: .jb-cell-v / .jb-mini-v elements with [data-count]
//      animate from 0 to their number the first time they appear.
//   3. Respects prefers-reduced-motion by doing nothing at all.
// No library, one IntersectionObserver, disconnects when done.

import { useEffect } from "react";

function animateCount(el: HTMLElement) {
  const raw = el.dataset.count || "";
  const target = parseFloat(raw.replace(/,/g, ""));
  if (!isFinite(target)) return;
  const suffix = el.dataset.suffix || "";
  const useComma = raw.includes(",");
  const dur = 1100;
  const t0 = performance.now();

  function frame(t: number) {
    const p = Math.min(1, (t - t0) / dur);
    // ease-out cubic, the readout "settles" instead of stopping dead
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(target * eased);
    el.textContent = (useComma ? val.toLocaleString("en-US") : String(val)) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Neon spotlight that trails the cursor. Desktop pointer only, one fixed
// element, rAF with lerp so it glides instead of sticking to the pointer.
// It never intercepts clicks and is removed on unmount.
function attachGlow(): (() => void) | undefined {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  const glow = document.createElement("div");
  glow.className = "jb-glow";
  document.body.appendChild(glow);

  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 3;
  let x = tx;
  let y = ty;
  let raf = 0;
  let live = true;

  function onMove(e: PointerEvent) {
    tx = e.clientX;
    ty = e.clientY;
    glow.style.opacity = "1";
  }

  function frame() {
    if (!live) return;
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    glow.style.transform = `translate(${x}px, ${y}px)`;
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener("pointermove", onMove, { passive: true });
  raf = requestAnimationFrame(frame);

  return () => {
    live = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
    glow.remove();
  };
}

export default function Fx() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Show everything immediately, no observers.
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        el.classList.add("is-in");
      });
      return;
    }

    // The boot script in layout.tsx <head> normally sets this before first
    // paint; assert it here too so client-side navigations are covered.
    document.documentElement.classList.add("fx-on");

    const detachGlow = attachGlow();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          const delay = parseInt(el.dataset.reveal || "0", 10);
          window.setTimeout(() => el.classList.add("is-in"), delay);
          el.querySelectorAll<HTMLElement>("[data-count]").forEach(animateCount);
          if (el.dataset.count) animateCount(el);
          io.unobserve(el);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => io.observe(el));

    // Safety net: if the observer is throttled or never fires (background
    // tab, odd embedder), reveal whatever is already inside the viewport
    // after 2s so nothing can be left permanently invisible.
    const safety = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add("is-in");
          el.querySelectorAll<HTMLElement>("[data-count]").forEach(animateCount);
        }
      });
    }, 2000);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
      if (detachGlow) detachGlow();
    };
  }, []);

  return null;
}
