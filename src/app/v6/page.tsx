import type { Metadata } from "next";
import Image from "next/image";
import { anton, host, plex } from "../fonts";
import Reveal from "@/components/v4/Reveal";
import IntroVideo from "@/components/v4/IntroVideo";
import WorkIndex from "@/components/work/WorkIndex";
import "../v4/v4.css";
import "../work/work.css";

// PREVIEW of the work index (spec in PortfolioProjects/work-cards/SPEC.md, 2026-11-13), noindex until JB signs off.
// Four sections since 2026-11-06, at JB's request: hero, intro video with the live builds as its chapters, who he is, and the
// call to action. The video is the explainer; everything else that used to be here lives in the video, the demos and the CV.
// White poster look on JB's reference (xgensgrowth.com), his own words and proof. Short, direct, confident copy.
//
// Rules: no confidential client is named or described (the NDA client appears only as "Confidential client (NDA)", no country
// or industry). No invented results, quotes or policies. Testimonials render only when real ones exist.

export const metadata: Metadata = {
  title: "John Boy Roxas · I build what your CRM can't",
  robots: { index: false, follow: false },
  description:
    "HighLevel-certified builder in the Philippines. GoHighLevel systems, custom apps and AI agents for Australian and UK agencies and small businesses. Try live builds with no sign-up. From AUD 15/hr.",
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
  { name: "Chaos to Closing", note: "GoHighLevel Systems Builder · Ended Mar 2026" },
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
    <div id="v4-root" className={`v4 ${anton.variable} ${host.variable} ${plex.variable}`}>
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
        {/* ---------- 1. HERO ---------- */}
        <section className="v4-hero v4-hero-center">
          <div className="v4-hero-in">
            <div className="v4-hero-copy" data-rv>
              <p className="v4-kicker">Systems builder · HighLevel certified</p>
              <h1>
                I build what{" "}
                <br className="v4-br" />
                your CRM can&apos;t.
              </h1>
              <p className="v4-lede">GoHighLevel workflows, funnels and booking for agencies and small businesses, plus custom apps and AI agents when the CRM runs out. Part-time, from AUD 15/hr.</p>
              <div className="v4-ctas">
                <a className="v4-btn v4-btn-dark" href="#work">
                  See what I build
                </a>
                <a className="v4-btn v4-btn-line" href={BOOK}>
                  Book a 15-min call
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- 2. WHAT I BUILD: the work index, one row per kind of work, each with its own page ---------- */}
        <section className="v4-sec wk-home" id="work">
          <div className="v4-in">
            <p className="v4-kicker" data-rv>
              What I build
            </p>
            <h2 data-rv>Pick the job you need done.</h2>
            <WorkIndex />
          </div>
        </section>

        {/* ---------- 2b. INTRO VIDEO ---------- */}
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
              From the Philippines, working with past clients in the US and Australia. UK businesses welcome. I work part-time, 4 hours a day from 8 AM your time,
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
                <b>4 hours</b>
                <span>A day, from 8 AM your time</span>
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
            <span>HighLevel certified · For Australian and UK businesses</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
