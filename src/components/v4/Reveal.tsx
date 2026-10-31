"use client";

import { useEffect } from "react";

// Sections fade up as they enter the viewport. Everything is visible by
// default: only once this runs (JavaScript on, motion allowed) does the root
// get `data-rv="on"`, which arms the hidden state in v4.css. Anything already
// on screen is revealed immediately, so nothing ever flashes empty.
export default function Reveal() {
  useEffect(() => {
    const root = document.getElementById("v4-root");
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-rv]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    root.setAttribute("data-rv", "on");
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95) el.classList.add("in");
      else io.observe(el);
    }
    return () => io.disconnect();
  }, []);
  return null;
}
