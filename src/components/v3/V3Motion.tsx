"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// All of v3's movement lives here, layered on top of a page that is already
// complete as plain HTML. Nothing in the markup depends on this running.
//
// What it does:
// - Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger and the
//   scroll position never disagree.
// - Hero intro: the name rises, the portrait sharpens out of a blur, the
//   artifacts arrive one by one, then the copy lines.
// - Depth: each artifact floats on its own slow loop, follows the pointer by
//   its data-depth (desktop only), and drifts upward at its own rate as the
//   hero scrolls away, so the scene reads as layers in space.
// - The wall: pinned on desktop, each wall lights up in turn and its real
//   cause types out underneath. On phones it reveals row by row instead.
// - prefers-reduced-motion: none of the above; the page just shows.

gsap.registerPlugin(ScrollTrigger);

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

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const arts = q(".v3-art");
      const lines = q('.v3-hero [data-v3="line"]');

      // Hidden start states are set here, in the same frame the page is
      // released, so there is never a flash of visible-then-hidden content.
      gsap.set(q(".v3-name"), { opacity: 0, y: 60 });
      gsap.set(q(".v3-portrait"), { opacity: 0, y: 40, filter: "blur(14px)" });
      gsap.set(arts, { opacity: 0, y: 24, scale: 0.92 });
      gsap.set(lines, { opacity: 0, y: 26 });
      root.setAttribute("data-motion", "on");

      // ---- hero intro ----
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(q(".v3-name"), { opacity: 1, y: 0, duration: 1.4 }, 0)
        .to(q(".v3-portrait"), { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.3 }, 0.15)
        .to(arts, { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12 }, 0.7)
        .to(lines, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.45);

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

      const mm = gsap.matchMedia();

      // ---- desktop: pointer parallax + pinned wall ----
      mm.add("(min-width: 761px)", () => {
        const movers = depthEls.map((el) => {
          const d = parseFloat(el.getAttribute("data-depth") || "0.5");
          return {
            d,
            x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
            r: gsap.quickTo(el, "rotation", { duration: 1.2, ease: "power3.out" }),
          };
        });
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          movers.forEach((m) => {
            m.x(nx * 36 * m.d);
            m.r(nx * 1.2 * m.d);
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
    }, root);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
