"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { onRevealed } from "./Preloader";

// All of v3's movement lives here, layered on top of a page that is already
// complete as plain HTML. Nothing in the markup depends on this running.
//
// What it does:
// - Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger and the
//   scroll position never disagree.
// - Hero intro, held until the preloader's curtain parts: the name rises,
//   the portrait sharpens out of a blur, the headline rises word by word out
//   of masks, the artifacts arrive, the stats count up.
// - Depth: each artifact floats on its own slow loop, follows the pointer by
//   its data-depth (desktop only), and drifts upward at its own rate as the
//   hero scrolls away, so the scene reads as layers in space.
// - The skills band: two rows drifting in opposite directions, pushed faster
//   and skewed by how hard the visitor scrolls.
// - The wall: pinned on desktop, each wall lights up in turn and its real
//   cause types out underneath. On phones it reveals row by row instead.
// - Section headlines rise word by word; the offer's words light up as the
//   visitor scrolls through it; product shots open with a clip reveal.
// - Wide screens: the nine builds run as a horizontal track, pinned while the
//   page scrolls past it.
// - The HUD in the corner names the section in view and shows progress.
// - Desktop: an amber spotlight follows the cursor across the hero, the
//   primary buttons lean toward the cursor, and button labels roll on hover.
// - prefers-reduced-motion: none of the above; the page just shows.

gsap.registerPlugin(ScrollTrigger);

// Wrap every word of an element in a mask, keeping inline markup like <em>.
function splitWords(el: HTMLElement) {
  if (el.dataset.splitDone) return Array.from(el.querySelectorAll<HTMLElement>(".v3-wi"));
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent || "").split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) {
            frag.appendChild(document.createTextNode(p));
            return;
          }
          const w = document.createElement("span");
          w.className = "v3-w";
          const i = document.createElement("span");
          i.className = "v3-wi";
          i.textContent = p;
          w.appendChild(i);
          frag.appendChild(w);
        });
        child.parentNode?.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
  el.dataset.splitDone = "1";
  return Array.from(el.querySelectorAll<HTMLElement>(".v3-wi"));
}

// Give a button label a second copy below it that rolls up on hover.
function rollLabel(btn: HTMLElement) {
  if (btn.querySelector(".v3-roll") || btn.children.length) return;
  const text = btn.textContent?.trim();
  if (!text) return;
  btn.textContent = "";
  const outer = document.createElement("span");
  outer.className = "v3-roll";
  const inner = document.createElement("span");
  inner.textContent = text;
  inner.setAttribute("data-text", text);
  outer.appendChild(inner);
  btn.appendChild(outer);
}

export default function V3Motion() {
  useEffect(() => {
    const root = document.getElementById("v3-root");
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.setAttribute("data-motion", "off");
      return;
    }

    // ---- smooth scroll ----
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let offReveal = () => {};

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const arts = q(".v3-art");
      const lines = q('.v3-hero [data-v3="line"]');
      const heroWords = q('[data-split="intro"]').flatMap((h) => splitWords(h as HTMLElement));

      // Hidden start states are set here, in the same frame the page is
      // released, so there is never a flash of visible-then-hidden content.
      gsap.set(q(".v3-name"), { opacity: 0, y: 60 });
      gsap.set(q(".v3-portrait"), { opacity: 0, y: 40, filter: "blur(14px)" });
      gsap.set(arts, { opacity: 0, y: 24, scale: 0.92 });
      gsap.set(lines, { opacity: 0, y: 26 });
      gsap.set(heroWords, { yPercent: 115 });
      root.setAttribute("data-motion", "on");

      // ---- hero intro (waits for the curtain) ----
      const intro = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      intro
        .to(q(".v3-name"), { opacity: 1, y: 0, duration: 1.4 }, 0)
        .to(q(".v3-portrait"), { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.3 }, 0.1)
        .to(heroWords, { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.045 }, 0.25)
        .to(arts, { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12 }, 0.7)
        .to(lines, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.5);

      // ---- stats count up ----
      q(".v3-stats b").forEach((el, i) => {
        const final = el.textContent || "";
        const n = parseInt(final.replace(/,/g, ""), 10);
        if (!Number.isFinite(n)) return;
        const o = { v: 0 };
        el.textContent = "0";
        intro.to(
          o,
          {
            v: n,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = Math.round(o.v).toLocaleString("en-US");
            },
            onComplete: () => {
              el.textContent = final;
            },
          },
          1.05 + i * 0.08
        );
      });

      offReveal = onRevealed(() => intro.play());

      // ---- artifacts: idle float ----
      arts.forEach((el, i) => {
        gsap.to(el, {
          y: `+=${8 + (i % 3) * 4}`,
          duration: 3 + (i % 4) * 0.7,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.6 + i * 0.2,
        });
      });

      // ---- depth on scroll: layers leave at different speeds ----
      const depthEls = q("[data-depth]");
      depthEls.forEach((el) => {
        const d = parseFloat(el.getAttribute("data-depth") || "0.5");
        gsap.to(el, {
          yPercent: -18 * d,
          ease: "none",
          scrollTrigger: { trigger: q(".v3-hero")[0], start: "top top", end: "bottom top", scrub: true },
        });
      });

      // ---- skills band: drift, pushed and skewed by scroll speed ----
      const bandRows = q(".v3-band-row");
      const bandState = bandRows.map((row, i) => {
        const track = row.querySelector<HTMLElement>(".v3-band-track");
        return { track, x: 0, dir: i === 0 ? -1 : 1 };
      });
      const bandSkew = gsap.quickTo(bandRows, "skewX", { duration: 0.5, ease: "power3.out" });
      const bandTick = () => {
        const v = lenis.velocity || 0;
        bandState.forEach((b) => {
          if (!b.track) return;
          const half = b.track.scrollWidth / 2;
          if (!half) return;
          b.x += b.dir * (0.6 + Math.min(Math.abs(v) * 0.35, 14));
          if (b.x <= -half) b.x += half;
          if (b.x >= 0) b.x -= half;
          b.track.style.transform = `translate3d(${b.x}px,0,0)`;
        });
        bandSkew(gsap.utils.clamp(-10, 10, v * -0.6));
      };
      bandState.forEach((b) => {
        if (b.dir > 0 && b.track) b.x = -b.track.scrollWidth / 4;
      });
      gsap.ticker.add(bandTick);

      // ---- section headlines: words rise out of masks ----
      q('[data-split="scroll"]').forEach((h) => {
        const words = splitWords(h as HTMLElement);
        gsap.set(words, { yPercent: 115 });
        ScrollTrigger.create({
          trigger: h,
          start: "top 88%",
          once: true,
          onEnter: () => gsap.to(words, { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.04 }),
        });
      });

      // ---- the offer: words light up as the visitor scrolls through ----
      q('[data-split="scrub"]').forEach((h) => {
        const words = splitWords(h as HTMLElement);
        gsap.set(words, { opacity: 0.12 });
        gsap.to(words, {
          opacity: 1,
          stagger: 0.12,
          ease: "none",
          scrollTrigger: { trigger: h, start: "top 85%", end: "bottom 45%", scrub: 0.5 },
        });
      });

      // ---- product shots: clip reveal ----
      q("[data-clip]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(18% 8% 18% 8% round 14px)", opacity: 0.4 },
          {
            clipPath: "inset(0% 0% 0% 0% round 14px)",
            opacity: 1,
            duration: 1.2,
            delay: i * 0.08,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }
        );
      });

      // ---- the rest of the sections: rise in as they enter ----
      // Hidden only here, so with no JS or reduced motion they just show.
      const reveals = q('[data-v3="reveal"]');
      if (reveals.length) {
        gsap.set(reveals, { opacity: 0, y: 34 });
        ScrollTrigger.batch(reveals, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, overwrite: true }),
        });
      }

      // ---- HUD: which section, and how far down the page ----
      const hudN = q(".v3-hud-n")[0];
      const hudT = q(".v3-hud-t")[0];
      const hudBar = q(".v3-hud-bar i")[0];
      q("[data-hud]").forEach((sec) => {
        const [n, t] = (sec.getAttribute("data-hud") || "").split("|");
        ScrollTrigger.create({
          trigger: sec,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (!self.isActive || !hudN || !hudT) return;
            if (hudN.textContent === n) return;
            // Text first, then the flourish, so the label is right even if
            // the animation never gets a frame.
            hudN.textContent = n;
            hudT.textContent = t;
            gsap.fromTo([hudN, hudT], { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "power3.out", overwrite: true });
          },
        });
      });
      // Progress straight from Lenis: it already knows the full scroll
      // length, pin spacing included.
      if (hudBar) {
        const bar = hudBar as HTMLElement;
        lenis.on("scroll", (l: Lenis) => {
          bar.style.transform = `scaleX(${l.progress.toFixed(4)})`;
        });
      }

      // ---- button labels roll on hover ----
      // Static links only: React-managed buttons change their own text.
      q(".v3-btn, .v3-links-cta").forEach((b) => rollLabel(b as HTMLElement));

      const mm = gsap.matchMedia();

      // ---- desktop: pointer parallax, spotlight, magnets, pinned wall ----
      mm.add("(min-width: 761px)", () => {
        const movers = depthEls.map((el) => {
          const d = parseFloat(el.getAttribute("data-depth") || "0.5");
          return {
            d,
            x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
            r: gsap.quickTo(el, "rotation", { duration: 1.2, ease: "power3.out" }),
          };
        });
        const hero = q(".v3-hero")[0] as HTMLElement | undefined;
        const magnets = q(".v3-btn-primary").map((el) => ({
          el: el as HTMLElement,
          x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }),
        }));

        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          movers.forEach((m) => {
            m.x(nx * 36 * m.d);
            m.r(nx * 1.2 * m.d);
          });
          if (hero) {
            const r = hero.getBoundingClientRect();
            hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
            hero.style.setProperty("--my", `${e.clientY - r.top}px`);
          }
          magnets.forEach((m) => {
            const r = m.el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const near = Math.hypot(dx, dy) < 130;
            m.x(near ? dx * 0.22 : 0);
            m.y(near ? dy * 0.3 : 0);
          });
        };
        window.addEventListener("pointermove", onMove);

        const rows = q('[data-v3="wallrow"]');
        const traces = q(".v3-walltrace");
        gsap.set(rows, { opacity: 0.14 });
        gsap.set(traces, { clipPath: "inset(0 100% 0 0)" });
        gsap.set(q('[data-v3="wallclose"]'), { opacity: 0, y: 30 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: q(".v3-wall")[0],
            start: "top top",
            end: "+=" + window.innerHeight * 2.4,
            pin: true,
            scrub: 0.6,
          },
        });
        rows.forEach((row, i) => {
          tl.to(row, { opacity: 1, duration: 0.5 }, i)
            .to(traces[i], { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "none" }, i + 0.25)
            .to(row, { opacity: 0.35, duration: 0.4 }, i + 0.95);
        });
        tl.to(rows, { opacity: 0.55, duration: 0.4 }, rows.length + 0.1).to(
          q('[data-v3="wallclose"]'),
          { opacity: 1, y: 0, duration: 0.6 },
          rows.length + 0.1
        );

        return () => window.removeEventListener("pointermove", onMove);
      });

      // ---- wide screens: the builds run sideways ----
      mm.add("(min-width: 1181px)", () => {
        const wrap = q(".v3-hwrap")[0] as HTMLElement | undefined;
        const track = q(".v3-works")[0] as HTMLElement | undefined;
        if (!wrap || !track) return;
        const distance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
        const cards = q(".v3-workcard");
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "center center",
            end: () => "+=" + distance(),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        // Each card tilts in as it crosses the screen.
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { rotate: 4, y: 40, opacity: 0.35 },
            {
              rotate: 0,
              y: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: "left 95%",
                end: "left 60%",
                scrub: true,
              },
            }
          );
        });
      });

      // ---- phones: simple row reveals, no pinning ----
      mm.add("(max-width: 760px)", () => {
        q('[data-v3="wallrow"], [data-v3="wallclose"]').forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
        });
      });

      // Triggers above were created before the pinned sections below them
      // existed, so their positions ignore the pin spacing. Re-order every
      // trigger by its place on the page and measure again.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();

      return () => gsap.ticker.remove(bandTick);
    }, root);

    return () => {
      offReveal();
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
