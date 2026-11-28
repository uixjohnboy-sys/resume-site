"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// A row of cards a visitor swipes on a phone (native scroll with snap) and steps through with arrows on a desktop.
export default function SwipeRow({ label, children }: { label: string; children: ReactNode }) {
  const row = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const read = () => setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    read();
    el.addEventListener("scroll", read, { passive: true });
    // A row inside a hidden tab measures 0 wide; the observer re-reads it when the tab is shown or the window resizes.
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", read);
      ro.disconnect();
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    const card = el.querySelector("li");
    const w = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  return (
    <div className="hs-swipe">
      <ul ref={row} className="hs-row" aria-label={label} data-fit={edge.start && edge.end ? "" : undefined}>
        {children}
      </ul>
      <div className="hs-arrows" hidden={edge.start && edge.end}>
        <button type="button" className="hs-arrow" onClick={() => step(-1)} disabled={edge.start} aria-label={`Previous in ${label}`}>
          ←
        </button>
        <button type="button" className="hs-arrow" onClick={() => step(1)} disabled={edge.end} aria-label={`Next in ${label}`}>
          →
        </button>
      </div>
    </div>
  );
}
