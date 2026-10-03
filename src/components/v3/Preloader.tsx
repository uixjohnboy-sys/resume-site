"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { smokeSprites, type SmokeTint } from "./smoke";

// The opening: smoke gathers in the dark, two lines resolve out of it letter
// by letter, then the smoke carries the words away and the page arrives.
// (JB, 2026-10-03: replaced the number counter; same smoke as the cursor
// and the portrait, so the brand reads as one thing from the first second.)
//
//   "Every GoHighLevel build hits a wall."
//   "You just found the one who builds past it."
//
// The lines set up the page's own story (the wall section, then the proof).
// Plays on every load and every refresh (JB, 2026-10-03).
//
// Safety, because a curtain that never lifts is worse than no curtain:
// - It only shows when the head script armed motion (html.fx-on), so with no
//   JS or reduced motion it is display:none from the first paint.
// - An inline script right after it hides it after 6 seconds whatever
//   happens (hidden, not removed, so React still finds the node it rendered
//   when it hydrates).
// - It never waits more than 1.8 seconds for fonts and the portrait.
// When it lifts it sets window.__v3Revealed and fires "v3:revealed": the
// hero intro (V3Motion) and the AI twin (TwinVoice) wait for that.

const LINE_A = "Every GoHighLevel build hits a wall.";
const LINE_B = "You just found the one who";
const LINE_B_EM = "builds past it.";

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

// Letters as spans so each can resolve out of the smoke on its own; words
// stay unbreakable so lines wrap between words, never inside one.
function Chars({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, w) => (
        <span key={w}>
          <span className={`v3-pre-word ${className ?? ""}`}>
            {Array.from(word).map((ch, i) => (
              <span key={i} className="v3-pre-ch">
                {ch}
              </span>
            ))}
          </span>
          {w < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

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

export default function Preloader() {
  const ref = useRef<HTMLDivElement | null>(null);
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const cv = cvRef.current;
    if (!el || !cv || getComputedStyle(el).display === "none") {
      announce();
      Promise.resolve().then(() => setGone(true));
      return;
    }
    // ---- the smoke ----
    const g = cv.getContext("2d");
    const sprites = smokeSprites();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    cv.width = Math.round(vw * dpr);
    cv.height = Math.round(vh * dpr);
    const puffs: Puff[] = [];
    // How much smoke is released per frame; the timelines turn it up and down.
    const flow = { rate: 0.4, burst: 0, rise: 1 };
    const phone = vw < 761;
    const cap = phone ? 90 : 170;
    let raf = 0;
    let running = true;

    const spawn = () => {
      const roll = Math.random();
      const tint: SmokeTint = roll < 0.4 ? "pale" : roll < 0.68 ? "amber" : roll < 0.86 ? "pink" : "violet";
      const spread = phone ? 0.42 : 0.34;
      puffs.push({
        x: vw * (0.5 + (Math.random() - 0.5) * spread * 2),
        y: vh * (0.56 + (Math.random() - 0.5) * 0.18),
        vx: (Math.random() - 0.5) * 0.7,
        vy: -(0.25 + Math.random() * 0.6),
        r: 28 + Math.random() * 46,
        grow: 0.35 + Math.random() * 0.6,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.012,
        life: 0,
        max: 110 + Math.random() * 90,
        a: 0.16 + Math.random() * 0.16,
        tint,
      });
    };

    const loop = () => {
      if (!running || !g) return;
      let n = flow.rate + flow.burst;
      while (n > 0 && puffs.length < cap) {
        if (n >= 1 || Math.random() < n) spawn();
        n -= 1;
      }
      g.clearRect(0, 0, cv.width, cv.height);
      g.globalCompositeOperation = "lighter";
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.life++;
        const k = p.life / p.max;
        if (k >= 1) {
          puffs.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy * flow.rise;
        p.r += p.grow;
        p.rot += p.vr;
        g.globalAlpha = p.a * Math.min(1, k * 4) * Math.pow(1 - k, 1.3);
        const d = p.r * 2 * dpr;
        g.save();
        g.translate(p.x * dpr, p.y * dpr);
        g.rotate(p.rot);
        g.drawImage(sprites[p.tint], -d / 2, -d / 2, d, d);
        g.restore();
      }
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // ---- assets the first screen needs: fonts and the portrait ----
    const img = document.querySelector<HTMLImageElement>(".v3-portrait img");
    const ready = Promise.race([
      Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        img && !img.complete ? new Promise((r) => img.addEventListener("load", r, { once: true })) : Promise.resolve(),
      ]),
      new Promise((r) => window.setTimeout(r, 1800)),
    ]);

    // ---- the words ----
    const a = el.querySelectorAll(".v3-pre-a .v3-pre-ch");
    const b = el.querySelectorAll(".v3-pre-b .v3-pre-ch");
    const eyebrow = el.querySelector(".v3-pre-eyebrow");
    gsap.set([a, b], { opacity: 0, filter: "blur(14px)", y: 14 });
    gsap.set(eyebrow, { opacity: 0 });

    const enter = gsap.timeline();
    enter
      .to(flow, { rate: 2.2, duration: 0.9, ease: "power2.out" }, 0)
      .to(eyebrow, { opacity: 1, duration: 0.6 }, 0.1)
      .to(a, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.7, ease: "power3.out", stagger: 0.016 }, 0.15)
      .to(b, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.7, ease: "power3.out", stagger: 0.016 }, 0.8);

    let killed = false;
    // Long enough to read both lines once.
    const minRead = new Promise((r) => window.setTimeout(r, 2300));

    Promise.all([ready, minRead]).then(() => {
      if (killed) return;
      gsap
        .timeline({
          onComplete: () => {
            running = false;
            cancelAnimationFrame(raf);
            setGone(true);
          },
        })
        // The smoke surges and carries the letters up and away.
        .to(flow, { burst: 4, rise: 2.4, duration: 0.35, ease: "power2.in" }, 0)
        .to(
          [a, b],
          {
            opacity: 0,
            filter: "blur(16px)",
            y: () => -20 - Math.random() * 40,
            x: () => (Math.random() - 0.5) * 40,
            duration: 0.8,
            ease: "power2.in",
            stagger: { each: 0.008, from: "random" },
          },
          0.05
        )
        .to(eyebrow, { opacity: 0, duration: 0.4 }, 0.05)
        .to(flow, { burst: 0, rate: 0, duration: 0.6 }, 0.6)
        .to(el, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, 0.7)
        // The hero starts arriving through the last of the smoke.
        .add(() => announce(), 0.75);
    });

    return () => {
      killed = true;
      running = false;
      cancelAnimationFrame(raf);
      enter.kill();
    };
  }, []);

  if (gone) return null;

  return (
    <>
      <div className="v3-pre" ref={ref} aria-hidden="true" suppressHydrationWarning>
        <canvas className="v3-pre-smoke" ref={cvRef} />
        <div className="v3-pre-mid">
          <p className="v3-pre-eyebrow">John Boy Roxas</p>
          <p className="v3-pre-line v3-pre-a">
            <Chars text={LINE_A} />
          </p>
          <p className="v3-pre-line v3-pre-b">
            <Chars text={LINE_B} /> <Chars text={LINE_B_EM} className="v3-pre-em" />
          </p>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){var p=document.querySelector('.v3-pre');if(!p)return;setTimeout(function(){if(p.style.display!=='none'){p.style.display='none';window.__v3Revealed=true;window.dispatchEvent(new Event('v3:revealed'))}},6000)})()",
        }}
      />
    </>
  );
}
