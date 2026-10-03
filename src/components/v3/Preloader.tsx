"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// The curtain: a counter runs to 100 while the hero's assets settle, then
// two panels part and the page arrives. First visit of a session only.
//
// Safety, because a curtain that never lifts is worse than no curtain:
// - It only shows when the head script armed motion (html.fx-on), so with no
//   JS or reduced motion it is display:none from the first paint.
// - An inline script right after it hides it at once on repeat visits in
//   the session, and hides it after 4 seconds whatever happens (hidden, not
//   removed, so React still finds the node it rendered when it hydrates).
// - The counter never waits more than 1.6 seconds for assets.
// When it lifts it sets window.__v3Revealed and fires "v3:revealed": the
// hero intro (V3Motion) and the AI twin (TwinVoice) wait for that.

const SEEN = "v3-pre-seen";

export function revealed() {
  return (window as unknown as { __v3Revealed?: boolean }).__v3Revealed === true || !document.querySelector(".v3-pre");
}

export function onRevealed(fn: () => void) {
  if (revealed()) {
    fn();
    return () => {};
  }
  const h = () => fn();
  window.addEventListener("v3:revealed", h, { once: true });
  return () => window.removeEventListener("v3:revealed", h);
}

function announce() {
  (window as unknown as { __v3Revealed?: boolean }).__v3Revealed = true;
  window.dispatchEvent(new Event("v3:revealed"));
}

export default function Preloader() {
  const ref = useRef<HTMLDivElement | null>(null);
  const numRef = useRef<HTMLSpanElement | null>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || getComputedStyle(el).display === "none") {
      announce();
      Promise.resolve().then(() => setGone(true));
      return;
    }
    try {
      sessionStorage.setItem(SEEN, "1");
    } catch {
      // Not remembered: it plays again next time, harmless.
    }

    // Assets the first screen needs: fonts and the portrait.
    const img = document.querySelector<HTMLImageElement>(".v3-portrait img");
    const ready = Promise.race([
      Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        img && !img.complete ? new Promise((r) => img.addEventListener("load", r, { once: true })) : Promise.resolve(),
      ]),
      new Promise((r) => window.setTimeout(r, 1600)),
    ]);

    const o = { v: 0 };
    const set = () => {
      if (numRef.current) numRef.current.textContent = String(Math.round(o.v)).padStart(3, "0");
    };
    const tl = gsap.timeline();
    tl.to(o, { v: 86, duration: 0.75, ease: "power2.out", onUpdate: set });
    let killed = false;

    ready.then(() => {
      if (killed) return;
      gsap
        .timeline({
          onComplete: () => {
            announce();
            setGone(true);
          },
        })
        .to(o, { v: 100, duration: 0.3, ease: "power1.out", onUpdate: set })
        .to(el.querySelectorAll(".v3-pre-line"), { yPercent: -110, opacity: 0, duration: 0.45, ease: "power3.in", stagger: 0.05 }, "+=0.08")
        .to(el.querySelector(".v3-pre-top"), { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "-=0.1")
        .to(el.querySelector(".v3-pre-bot"), { yPercent: 100, duration: 0.8, ease: "expo.inOut" }, "<")
        // The intro starts as the panels part, not after.
        .add(() => announce(), "-=0.45");
    });

    return () => {
      killed = true;
      tl.kill();
    };
  }, []);

  if (gone) return null;

  return (
    <>
      <div className="v3-pre" ref={ref} aria-hidden="true" suppressHydrationWarning>
        <div className="v3-pre-top" />
        <div className="v3-pre-bot" />
        <div className="v3-pre-mid">
          <span className="v3-pre-line v3-pre-name">John Boy Roxas</span>
          <span className="v3-pre-line v3-pre-count">
            <span ref={numRef}>000</span>
          </span>
          <span className="v3-pre-line v3-pre-tag">systems loading</span>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){var p=document.querySelector('.v3-pre');if(!p)return;try{if(sessionStorage.getItem('" +
            SEEN +
            "')==='1'){p.style.display='none';window.__v3Revealed=true;return}}catch(e){}setTimeout(function(){if(p.style.display!=='none'){p.style.display='none';window.__v3Revealed=true;window.dispatchEvent(new Event('v3:revealed'))}},4000)})()",
        }}
      />
    </>
  );
}
