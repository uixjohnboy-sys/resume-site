"use client";

import { useEffect, useRef } from "react";

// The site is one sheet of paper. On a first visit a closed roll appears on plain paper with his name on it, then
// unrolls down the screen into the hero and stays at the bottom edge. Scrolling feeds the sheet out of it: the roll turns
// and gets thinner until the end of the paper shows. Only transforms and opacity move, so it stays smooth on a phone.

const SEEN = "jb-paper-roll-seen";
const ROLL_CLOSED = 148;

// Runs before first paint, so the page never flashes before the intro. The timeout means the page can't stay
// covered if the script bundle fails to load.
export const paperRollBoot = `(function(){try{var r=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(r||location.hash||sessionStorage.getItem("${SEEN}"))return;var d=document.documentElement;d.classList.add("pr-intro");setTimeout(function(){d.classList.remove("pr-intro")},7000)}catch(e){}})();`;

export default function PaperRoll() {
  const rollRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const roll = rollRef.current!;
    const cover = coverRef.current!;
    const label = labelRef.current!;
    const cap = capRef.current!;
    const floor = floorRef.current!;
    const lines = linesRef.current!;
    const html = document.documentElement;
    const rest = () => (window.innerWidth < 640 ? 44 : 64);
    const place = (y: number, h: number) => `translate3d(0, ${y}px, 0) scaleY(${h / ROLL_CLOSED})`;

    let intro = html.classList.contains("pr-intro");
    let frame = 0;

    // Scrolling: the roll thins as the sheet feeds out, and leaves at the very end to show the paper's edge.
    const draw = () => {
      frame = 0;
      if (intro) return;
      const max = Math.max(1, html.scrollHeight - window.innerHeight);
      const p = Math.min(1, window.scrollY / max);
      const h = rest() * (1 - 0.6 * p);
      const leaving = Math.max(0, (p - 0.97) / 0.03);
      roll.style.transform = place(window.innerHeight - h + leaving * (h + 48), h);
      lines.style.transform = `translate3d(0, ${(window.scrollY * 0.5) % 22}px, 0)`;
    };
    const ask = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", ask, { passive: true });

    const running: Animation[] = [];
    const run = (el: HTMLElement, keys: Keyframe[], ms: number, easing: string, delay = 0) => {
      const a = el.animate(keys, { duration: ms, easing, delay, fill: "forwards" });
      running.push(a);
      return a.finished;
    };
    const finish = () => {
      if (!intro) return;
      intro = false;
      running.forEach((a) => a.cancel());
      html.classList.remove("pr-intro");
      try {
        sessionStorage.setItem(SEEN, "1");
      } catch {}
      skipOn.forEach((t) => window.removeEventListener(t, finish));
      draw();
    };
    const skipOn = ["wheel", "touchstart", "keydown", "pointerdown"];

    if (intro) {
      skipOn.forEach((t) => window.addEventListener(t, finish, { passive: true }));
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const closedW = Math.min(860, vw * 0.88);
      const side = (vw - closedW) / 2;
      const middle = vh / 2 - ROLL_CLOSED / 2;
      // The ends are ellipses, so the closed roll reads as a cylinder; the right one shows the spiral of the paper.
      const inset = (x: number) => (x ? `inset(0 ${x - 24}px 0 ${x}px round 24px / 74px)` : "inset(0px 0px 0px 0px round 0px / 0px)");
      cap.style.right = `${side - 24}px`;
      floor.style.top = `${middle + ROLL_CLOSED - 26}px`;
      const soft = "cubic-bezier(.22,.8,.2,1)";
      const glide = "cubic-bezier(.7,0,.16,1)";
      const end = vh - rest();

      (async () => {
        await run(roll, [{ opacity: 0, clipPath: inset(side), transform: `translate3d(0, ${middle + 26}px, 0)` }, { opacity: 1, clipPath: inset(side), transform: `translate3d(0, ${middle}px, 0)` }], 800, soft);
        await new Promise((r) => setTimeout(r, 900));
        if (!intro) return;
        run(label, [{ opacity: 1 }, { opacity: 0 }], 260, "ease-out");
        run(cap, [{ opacity: 1 }, { opacity: 0 }], 260, "ease-out");
        run(floor, [{ opacity: 1 }, { opacity: 0 }], 260, "ease-out");
        await run(roll, [{ opacity: 1, clipPath: inset(side), transform: `translate3d(0, ${middle}px, 0)` }, { opacity: 1, clipPath: inset(0), transform: "translate3d(0, 0, 0)" }], 720, glide);
        if (!intro) return;
        const turning = lines.animate([{ transform: "translate3d(0, 0, 0)" }, { transform: "translate3d(0, 264px, 0)" }], { duration: 1400, easing: glide, fill: "forwards" });
        running.push(turning);
        run(cover, [{ transform: `translate3d(0, ${ROLL_CLOSED}px, 0)` }, { transform: `translate3d(0, ${vh}px, 0)` }], 1400, glide);
        await run(roll, [{ transform: place(0, ROLL_CLOSED) }, { transform: place(end, rest()) }], 1400, glide);
        finish();
      })().catch(() => {});
    } else {
      draw();
    }

    return () => {
      window.removeEventListener("scroll", ask);
      window.removeEventListener("resize", ask);
      skipOn.forEach((t) => window.removeEventListener(t, finish));
      running.forEach((a) => a.cancel());
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="pr" aria-hidden="true">
      <div className="pr-cover" ref={coverRef} />
      <div className="pr-floor" ref={floorRef} />
      <div className="pr-roll" ref={rollRef}>
        <div className="pr-turn">
          <div className="pr-lines" ref={linesRef} />
        </div>
        <div className="pr-cap" ref={capRef} />
        <div className="pr-label" ref={labelRef}>
          <b>John Boy Roxas</b>
          <span>Portfolio 2026</span>
        </div>
      </div>
    </div>
  );
}
