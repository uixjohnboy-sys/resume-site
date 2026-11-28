"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

// The kinds of work as buttons (JB 2026-11-28): a visitor picks one and only that kind's demo cards show, so the
// homepage stays short. Built as tabs (role=tablist): arrow keys move between them, every panel is in the HTML for
// search engines and readers without JavaScript, only the chosen one is visible. A link to /#work-<slug> opens that tab.

export type WorkTab = { slug: string; n: string; label: string; panel: ReactNode };

export default function WorkTabs({ items }: { items: WorkTab[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const open = () => {
      const m = window.location.hash.match(/^#work-(.+)$/);
      if (!m) return;
      const i = items.findIndex((t) => t.slug === m[1]);
      if (i < 0) return;
      setActive(i);
      root.current?.scrollIntoView();
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [items]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = items.length - 1;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="wt" ref={root} id="work-tabs">
      <div className="wt-tabs" role="tablist" aria-label="Kinds of work" onKeyDown={onKey}>
        {items.map((t, i) => (
          <button
            key={t.slug}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${t.slug}`}
            aria-selected={i === active}
            aria-controls={`work-${t.slug}`}
            tabIndex={i === active ? 0 : -1}
            className="wt-tab"
            onClick={() => setActive(i)}
          >
            <span className="wt-n">{t.n}</span>
            <span className="wt-label">{t.label}</span>
          </button>
        ))}
      </div>
      {items.map((t, i) => (
        <div key={t.slug} role="tabpanel" id={`work-${t.slug}`} aria-labelledby={`tab-${t.slug}`} hidden={i !== active} className="wt-panel">
          {t.panel}
        </div>
      ))}
    </div>
  );
}
