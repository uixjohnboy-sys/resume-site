"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// A two-part cursor: a dot that follows exactly and a ring that trails it.
// Over anything clickable the ring opens up; over an element with a
// data-cursor attribute it also shows that word ("View", "Try", "Talk").
//
// Only for a fine pointer (mouse or trackpad) with motion allowed. The
// system cursor is hidden only while this one is running, and text fields
// keep their text caret.

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    const root = document.getElementById("v3-root");
    if (!dot || !ring || !label || !root) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    root.setAttribute("data-cursor", "on");
    const dx = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    let shown = false;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!shown) {
        shown = true;
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    const over = (e: PointerEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      const field = t?.closest("input, textarea, select");
      const tagged = t?.closest<HTMLElement>("[data-cursor]");
      const hot = t?.closest("a, button, label, [role='tab']");
      const word = tagged?.dataset.cursor || "";
      ring.dataset.state = field ? "text" : word ? "label" : hot ? "hot" : "";
      label.textContent = word;
    };

    const leave = () => {
      shown = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    };
    const down = () => ring.classList.add("is-down");
    const up = () => ring.classList.remove("is-down");

    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      root.removeAttribute("data-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <>
      <div className="v3-cur-dot" ref={dotRef} aria-hidden="true" />
      <div className="v3-cur-ring" ref={ringRef} aria-hidden="true">
        <span ref={labelRef} />
      </div>
    </>
  );
}
