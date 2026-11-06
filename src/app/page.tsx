import type { Metadata } from "next";
import Image from "next/image";
import { anton, host, plex } from "./fonts";
import Reveal from "@/components/v4/Reveal";
import IntroVideo from "@/components/v4/IntroVideo";
import "./v4/v4.css";

// Four sections since 2026-11-06, at JB's request: hero, intro video with the live builds as its chapters, who he is, and the
// call to action. The video is the explainer; everything else that used to be here lives in the video, the demos and the CV.
// White poster look on JB's reference (xgensgrowth.com), his own words and proof. Short, direct, confident copy.
//
// Rules: no confidential client is named or described (the NDA client appears only as "Confidential client (NDA)", no country
// or industry). No invented results, quotes or policies. Testimonials render only when real ones exist.

export const metadata: Metadata = {
  title: "John Boy Roxas · GoHighLevel, custom apps and AI agents",
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

// Set once the intro is recorded and uploaded. Until then the frame says so plainly, and the chapters below still work.
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

// The video's chapters. Each one is something a visitor can open and use, not a picture of it.
const chapters = [
  {
    n: "01",
    tag: "My own demo · Fictional data",
    title: "Tapline, a repairs desk",
    line: "AI triage a person confirms, after-hours dispatch, owner approvals and a real signed webhook.",
    img: "/projects/tapline/board.png",
    alt: "Tapline's repairs board",
    w: 2880,
    h: 1800,
    href: "/demo/tapline?tour=manager",
    cta: "Try it live",
  },
  {
    n: "02",
    tag: "My own product · Demo data",
    title: "Coach OS, built around GoHighLevel",
    line: "Client portal, AI companion, e-signed agreements and Stripe, synced with GoHighLevel both ways.",
    img: "/coach-os-shots/app-dash-kanban.jpg",
    alt: "Coach OS owner pipeline",
    w: 1440,
    h: 760,
    href: "https://coachos.johnboydesign.com/tour",
    cta: "Open the tour",
  },
  {
    n: "03",
    tag: "What you get for a brief",
    title: "A plan for your whole system",
    line: "Send me what you need. I send back a written plan: agents, workflows and integrations. Free.",
    img: null,
    alt: "",
    w: 0,
    h: 0,
    href: "/sample-plan",
    cta: "See a sample plan",
  },
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
        <section className="v4-hero">
          <div className="v4-hero-in">
            <div className="v4-hero-copy" data-rv>
              <p className="v4-kicker">Systems builder · HighLevel certified</p>
              <h1>
                Try what I build{" "}
                <br className="v4-br" />
                before you{" "}
                <br className="v4-br" />
                hire me.
              </h1>
              <p className="v4-lede">GoHighLevel, custom apps and AI agents for agencies and small businesses.</p>
              <div className="v4-ctas">
                <a className="v4-btn v4-btn-dark" href="#intro">
                  Watch the intro
                </a>
                <a className="v4-btn v4-btn-line" href={BOOK}>
                  Book a 15-min call
                </a>
              </div>
            </div>
            <div className="v4-hero-media" data-rv>
              <IntroVideo />
            </div>
          </div>
        </section>

        {/* ---------- 2. INTRO VIDEO, WITH THE LIVE BUILDS AS ITS CHAPTERS ---------- */}
        <section className="v4-sec v4-intro" id="intro">
          <div className="v4-in">
            <div className="v4-center">
              <p className="v4-kicker" data-rv>
                Intro
              </p>
              <h2 data-rv>See what I build, then use it.</h2>
            </div>
            <div className="v4-film" data-rv>
              {INTRO_VIDEO ? (
                <video controls preload="metadata" playsInline poster="/projects/tapline/board.png">
                  <source src={INTRO_VIDEO} />
                  {INTRO_CAPTIONS && <track kind="captions" src={INTRO_CAPTIONS} srcLang="en" label="English" default />}
                </video>
              ) : (
                <div className="v4-film-wait">
                  <p className="v4-kicker">Intro video</p>
                  <p>I&apos;m recording a short walk-through of these builds. Until it&apos;s up, you can open each one below and use it yourself.</p>
                </div>
              )}
            </div>
            <ol className="v4-chapters">
              {chapters.map((c) => (
                <li key={c.n} data-rv>
                  <a href={c.href} className="v4-chapter">
                    <div className="v4-chapter-shot">
                      {c.img ? (
                        <Image src={c.img} alt={c.alt} width={c.w} height={c.h} sizes="(max-width: 860px) 90vw, 380px" />
                      ) : (
                        <span className="v4-chapter-plan" aria-hidden="true">
                          <b>Your brief</b>
                          <i />
                          <i />
                          <i />
                          <b>Your plan</b>
                        </span>
                      )}
                    </div>
                    <span className="v4-chapter-n">{c.n}</span>
                    <span className="v4-case-tag">{c.tag}</span>
                    <h3>{c.title}</h3>
                    <p>{c.line}</p>
                    <span className="v4-chapter-cta">{c.cta}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- 3. WHO I AM ---------- */}
        <section className="v4-statement v4-about" id="about">
          <div className="v4-in">
            <p className="v4-kicker" data-rv>
              About
            </p>
            <h2 data-rv>I&apos;m John Boy. I build the systems your business runs on.</h2>
            <p className="v4-lede" data-rv>
              From the Philippines, working with past clients in the US and Australia. UK businesses welcome. I work part-time, 4 hours a day from 8 AM your time,
              white-label for agencies, and I invoice fortnightly.
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
            <div className="v4-marquee">
              <ul className="v4-clients">
                {clients.map((c) => (
                  <li key={c.name}>
                    <b>{c.name}</b>
                    <span>{c.note}</span>
                  </li>
                ))}
              </ul>
              <ul className="v4-clients" aria-hidden="true">
                {clients.map((c) => (
                  <li key={c.name}>
                    <b>{c.name}</b>
                    <span>{c.note}</span>
                  </li>
                ))}
              </ul>
            </div>
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
              <p>Try what I build before you hire me.</p>
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
