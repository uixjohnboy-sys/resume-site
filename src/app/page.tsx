import type { Metadata } from "next";
import Image from "next/image";
import { anton, host, plex } from "./fonts";
import Reveal from "@/components/v4/Reveal";
import IntroVideo from "@/components/v4/IntroVideo";
import SkillFlow, { type FlowCard } from "@/components/home/SkillFlow";
import { work } from "@/lib/work";
import "./v4/v4.css";
import "./work/work.css";
import "./home-flow.css";
import "./home-dark.css";

// One card per kind of work, art made for each (scripts/home-cards, black and white). Each card carries what the old
// work index row carried: the promise, the strongest real proof with its label, and the link to /work/<slug>.
const flowCards: FlowCard[] = work.map((w) => ({
  n: w.n,
  slug: w.slug,
  title: w.title,
  promise: w.promise,
  art: `/home/cards/${w.slug}.webp`,
  tag: [w.lead.kind, w.lead.name, w.lead.when].filter(Boolean).join(" · "),
  line: w.lead.line,
}));

// Homepage since 2026-11-22 (JB): the hero is the cover-flow of the kinds of work, each card with its promise, proof and a
// button to /work/<slug>; the work index section is gone and the intro video comes right after. The whole page is black.
// From 2026-11-15 to 11-22 the work index sat under the hero, one row per kind of work (PortfolioProjects/work-cards/SPEC.md). Before that, since 2026-11-06: hero,
// intro video with the live builds as its chapters, who he is, and the call to action. The video is the explainer; everything else that used to be here lives in the video, the demos and the CV.
// White poster look on JB's reference (xgensgrowth.com), his own words and proof. Short, direct, confident copy.
//
// Rules: no confidential client is named or described (the NDA client appears only as "Confidential client (NDA)", no country
// or industry). No invented results, quotes or policies. Testimonials render only when real ones exist.

export const metadata: Metadata = {
  title: { absolute: "GoHighLevel Specialist for Hire, GHL Expert | John Boy Roxas" },
  description:
    "HighLevel-certified GoHighLevel specialist in the Philippines, in GHL since 2023. White-label workflows, funnels and snapshots for agencies in Australia and the US.",
  alternates: { canonical: "/" },
};

const EMAIL = "uix.johnboy@gmail.com";
const nl = "\n\n";
const BRIEF_MAIL =
  `mailto:${EMAIL}?subject=` +
  encodeURIComponent("My brief") +
  "&body=" +
  encodeURIComponent(`Hi John Boy,${nl}My business:${nl}The job I want off my plate:${nl}How we handle it today:${nl}`);
const WHATSAPP = "https://wa.me/639773659548?text=" + encodeURIComponent("Hi John Boy, I found you through your portfolio.");
const LINKEDIN = "https://www.linkedin.com/in/john-boy-roxas-gohighlevel-specialist";
const CV = "/John-Boy-Roxas-Resume.pdf";
const BOOK = "/book";

// Set once the intro is recorded and uploaded. Until then the frame says so plainly, and the work above still works.
const INTRO_VIDEO = "";
const INTRO_CAPTIONS = "";

const clients = [
  { name: "K Australia Design", note: "Lead GHL Automation Architect · Sep 2024 to Sep 2025" },
  { name: "Confidential client (NDA)", note: "GoHighLevel Specialist · Apr 2026 to present" },
  { name: "Chaos to Closing", note: "GoHighLevel Systems Builder · Mar 2026 to Sep 2026" },
  { name: "Wrldinvsn", note: "Lead Flow and Funnel Operations · Dec 2025 to Feb 2026" },
  { name: "Masterpiece Las Vegas", note: "US, through Virtualasting" },
  { name: "Virtualasting", note: "Automation and CRM Support · Feb 2021 to Jul 2024" },
];

const badges = [
  { img: "/badge-workflow-automation-expert.png", name: "Workflow Automation Expert" },
  { img: "/badge-funnel-building-expert.png", name: "Funnel Building Expert" },
  { img: "/badge-ai-employee-specialist.png", name: "AI Employee Specialist" },
  { img: "/badge-course-community-expert.png", name: "Course & Community Expert" },
];


export default function Home() {
  return (
    <div id="v4-root" className={`v4 v4-dark ${anton.variable} ${host.variable} ${plex.variable}`}>
      <Reveal />

      <p className="v4-bar">
        Available now. Part-time, contract or project. <a href="#about">See my rate</a>
      </p>
      <header className="v4-nav">
        <div className="v4-nav-in">
          <a className="v4-mark" href="#top">
            <b>John Boy Roxas</b>
            <span>Systems and automation</span>
          </a>
          <nav className="v4-links" aria-label="Sections">
            <a href="#work">Work</a>
            <a href="#intro">Intro</a>
            <a href="#about">About</a>
            <a href={CV}>CV</a>
          </nav>
          <a className="v4-btn v4-btn-dark v4-nav-cta" href={BOOK}>
            Book a 15-min call
          </a>
        </div>
      </header>

      <main id="top">
        {/* ---------- 1. HERO: what I build, as a cover-flow of cards (JB 2026-11-22), black and white ---------- */}
        <section className="sf-hero" id="work" aria-labelledby="hero-h">
          <div className="sf-head">
            <p className="v4-kicker">GoHighLevel specialist · HighLevel certified</p>
            <h1 id="hero-h">I build what your CRM can&apos;t.</h1>
            <p className="v4-lede">
              GoHighLevel workflows, funnels and booking for agencies and small businesses, plus custom apps and AI agents when the CRM runs out. Part-time, from AUD 15/hr.
            </p>
          </div>
          {/* No buttons under the cards (JB 2026-11-22): Book a call is in the nav, and the intro video is the next section. */}
          <SkillFlow cards={flowCards} />
        </section>

        {/* ---------- 2. INTRO VIDEO ---------- */}
        <section className="v4-sec v4-intro" id="intro">
          <div className="v4-in">
            <div className="v4-film" data-rv>
              {INTRO_VIDEO ? (
                <video controls preload="metadata" playsInline poster="/projects/tapline/board.png">
                  <source src={INTRO_VIDEO} />
                  {INTRO_CAPTIONS && <track kind="captions" src={INTRO_CAPTIONS} srcLang="en" label="English" default />}
                </video>
              ) : (
                <div className="v4-film-wait">
                  <Image className="v4-film-still" src="/projects/tapline/board.png" alt="" width={2880} height={1800} sizes="(max-width: 860px) 100vw, 1040px" />
                  <span className="v4-film-play" aria-hidden="true" />
                  <div>
                    <p className="v4-kicker">Intro video · being recorded</p>
                    <p>A short walk-through of this work, from me. Until it&apos;s up, open any row above and use the demos yourself.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ---------- 3. WHO I AM ---------- */}
        <section className="v4-statement v4-about" id="about">
          <div className="v4-in">
            <div className="v4-about-photo" data-rv>
              <IntroVideo />
            </div>
            <p className="v4-kicker" data-rv>
              About
            </p>
            <h2 data-rv>I&apos;m John Boy. I build the systems your business runs on.</h2>
            <p className="v4-lede" data-rv>
              From the Philippines, working with past clients in the US and Australia. I work part-time, 4 to 6 hours a day in Australian business hours or US mornings,
              white-label for agencies, inside your tools: Slack, ClickUp, Asana, Loom. I invoice fortnightly, and I will sign an NDA before you share anything about
              your business.
            </p>
            <ul className="v4-facts" aria-label="At a glance" data-rv>
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
          <div className="v4-strip v4-strip-flat" aria-label="Clients and certifications">
            <p className="v4-strip-h">Worked with</p>
            <ul className="v4-clients v4-clients-grid">
              {clients.map((c) => (
                <li key={c.name}>
                  <b>{c.name}</b>
                  <span>{c.note}</span>
                </li>
              ))}
            </ul>
            <ul className="v4-badges" aria-label="HighLevel certifications">
              {badges.map((b) => (
                <li key={b.name}>
                  <Image src={b.img} alt="" width={64} height={64} />
                  <span>{b.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- 4. CALL TO ACTION ---------- */}
        <section className="v4-sec v4-contact" id="contact">
          <div className="v4-in" data-rv>
            <h2>Tell me what you need built or fixed.</h2>
            <p className="v4-lede">15 minutes, and a straight answer. Or send your brief and get a written plan back, free.</p>
            <div className="v4-ctas">
              <a className="v4-btn v4-btn-dark" href={BOOK}>
                Book a 15-min call
              </a>
              <a className="v4-btn v4-btn-line" href={BRIEF_MAIL}>
                Send me your brief
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="v4-foot">
        <div className="v4-foot-mark" aria-hidden="true">
          JB
        </div>
        <div className="v4-foot-in">
          <div className="v4-foot-cols">
            <div>
              <a className="v4-mark" href="#top">
                <b>John Boy Roxas</b>
                <span>Systems and automation</span>
              </a>
              <p>I build what your CRM can&apos;t.</p>
            </div>
            <div>
              <p className="v4-foot-h">Try</p>
              <ul>
                <li><a href="/demo/tapline?tour=manager">Tapline repairs desk</a></li>
                <li><a href="https://coachos.johnboydesign.com/tour">Coach OS tour</a></li>
                <li><a href="/sample-plan">Sample plan</a></li>
              </ul>
            </div>
            <div>
              <p className="v4-foot-h">Start</p>
              <ul>
                <li><a href={BOOK}>Book a 15-min call</a></li>
                <li><a href={BRIEF_MAIL}>Send me your brief</a></li>
                <li><a href={CV}>CV (PDF)</a></li>
              </ul>
            </div>
            <div>
              <p className="v4-foot-h">Contact</p>
              <ul>
                <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
                <li><a href={WHATSAPP}>WhatsApp</a></li>
                <li><a href={LINKEDIN}>LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="v4-foot-end">
            <span>&copy; 2026 John Boy Roxas · Paniqui, Tarlac, Philippines</span>
            <span>HighLevel certified · For Australian and US businesses</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
