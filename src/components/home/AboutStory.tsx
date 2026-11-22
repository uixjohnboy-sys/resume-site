"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// The About section as a scroll story (JB 2026-11-22, on a "folder of three cards" reference, black and white):
// three cards sit in a folder; as the section scrolls to the middle of the screen the cards rise and fan out, the
// folder fades away, and the About text comes up under the cards. All the text is in the page from the start (search
// engines and screen readers read it all); only how it looks changes. Phones and short screens play it as the cards
// scroll by, with no pinning; visitors who ask for less motion get the finished layout.

const BADGES = [
  { img: "/badge-workflow-automation-expert.png", name: "Workflow Automation Expert" },
  { img: "/badge-funnel-building-expert.png", name: "Funnel Building Expert" },
  { img: "/badge-ai-employee-specialist.png", name: "AI Employee Specialist" },
  { img: "/badge-course-community-expert.png", name: "Course and Community Expert" },
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

export default function AboutStory() {
  const track = useRef<HTMLDivElement>(null);
  const [mode, setModeState] = useState<"static" | "pinned" | "flow">("static");

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    // Pinned: big screens, the section holds still while the story plays. Flow: phones and short screens, the story plays
    // as the cards scroll up through the screen, nothing holds. Static: visitors who ask for less motion.
    const mqPin = window.matchMedia("(min-width: 861px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const stage = el.querySelector<HTMLElement>(".ab-stage");
    let raf = 0;
    const set = (rise: number, fold: number, msg: number) => {
      el.style.setProperty("--rise", rise.toFixed(4));
      el.style.setProperty("--fold", fold.toFixed(4));
      el.style.setProperty("--msg", msg.toFixed(4));
    };
    const paint = () => {
      raf = 0;
      const vh = window.innerHeight;
      if (mqPin.matches) {
        // the sticky nav is one row on wide screens and two on narrower ones; the pinned stage sits under it
        const nav = document.querySelector<HTMLElement>(".v4-nav");
        el.style.setProperty("--navh", (nav ? nav.offsetHeight : 70) + "px");
        const r = el.getBoundingClientRect();
        const span = r.height - vh;
        const p = span > 0 ? clamp01(-r.top / span) : 1;
        // 0 to 0.15: the folder as it is. 0.15 to 0.55: the cards rise and fan out. 0.35 to 0.6: the folder fades.
        // 0.55 to 0.85: the text comes up under the cards. The rest: hold, so it can be read before the section moves on.
        set(ease(clamp01((p - 0.15) / 0.4)), clamp01((p - 0.35) / 0.25), ease(clamp01((p - 0.55) / 0.3)));
      } else if (mqMotion.matches && stage) {
        // the folder enters at the bottom of the screen; by the time it reaches a third of the way down, it is done
        const top = stage.getBoundingClientRect().top;
        const p = clamp01((vh * 0.88 - top) / (vh * 0.5));
        set(ease(clamp01(p / 0.6)), clamp01((p - 0.3) / 0.4), ease(clamp01((p - 0.5) / 0.5)));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const setMode = () => {
      const m = mqPin.matches ? "pinned" : mqMotion.matches ? "flow" : "static";
      setModeState(m);
      if (m === "static") set(1, 1, 1);
      else paint();
    };
    setMode();
    mqPin.addEventListener("change", setMode);
    mqMotion.addEventListener("change", setMode);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      mqPin.removeEventListener("change", setMode);
      mqMotion.removeEventListener("change", setMode);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={track} className={`ab-track is-${mode}`}>
      <div className="ab-pin">
        <div className="ab-title">
          <p className="v4-kicker">About</p>
          <h2>I&apos;m John Boy.</h2>
          <p className="ab-pill">GoHighLevel since 2023</p>
        </div>

        <div className="ab-stage" aria-hidden="true">
          <div className="ab-folder-back" />
          <div className="ab-card ab-c1">
            <span className="ab-stat-n">5</span>
            <span className="ab-stat-u">Years</span>
            <span className="ab-stat-l">CRM and automation</span>
            <span className="ab-stat-s">GoHighLevel since 2023</span>
          </div>
          <div className="ab-card ab-c3">
            <span className="ab-cert-h">HighLevel certified</span>
            <span className="ab-cert-grid">
              {BADGES.map((b) => (
                <Image key={b.img} src={b.img} alt="" width={64} height={64} />
              ))}
            </span>
            <span className="ab-cert-s">4 certifications</span>
          </div>
          <div className="ab-card ab-c2">
            <Image src="/jb-portrait.png" alt="" width={1000} height={1000} sizes="240px" />
          </div>
          <div className="ab-folder-front">
            <span className="ab-tab" />
            <dl className="ab-list">
              <div>
                <dt>John Boy Roxas</dt>
                <dd>GoHighLevel specialist</dd>
              </div>
              <div>
                <dt>Paniqui, Tarlac</dt>
                <dd>Philippines, UTC+8</dd>
              </div>
              <div>
                <dt>Part-time</dt>
                <dd>4 to 6 hours a day</dd>
              </div>
            </dl>
            <span className="ab-note">*HighLevel certified</span>
            <a className="ab-play" href="#intro" tabIndex={-1}>
              <svg viewBox="0 0 24 24">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="ab-msg">
          <p className="ab-sub">I build the systems your business runs on.</p>
          <p className="v4-lede">
            From the Philippines, working with past clients in the US and Australia. I work part-time, 4 to 6 hours a day in Australian business hours or US mornings,
            white-label for agencies, inside your tools: Slack, ClickUp, Asana, Loom. I invoice fortnightly, and I will sign an NDA before you share anything about your
            business.
          </p>
          <ul className="v4-facts" aria-label="At a glance">
            <li>
              <b>5 years</b>
              <span>CRM and automation. GoHighLevel since 2023</span>
            </li>
            <li>
              <b>AUD 15</b>
              <span>From, per hour. About £8, or a fixed quote</span>
            </li>
            <li>
              <b>4-6 hours</b>
              <span>A day, AU hours or US mornings</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
