import Link from "next/link";
import VideoIntro from "@/components/home/VideoIntro";
import Fx from "@/components/home/Fx";
import SystemLog from "@/components/home/SystemLog";
import LiveClock from "@/components/home/LiveClock";
import { archivo, jetmono } from "./fonts";
import "./home.css";

// The one-pager finale. A hiring manager gives a portfolio thirty seconds;
// this page is built to win inside that window and be finished inside a
// minute. Five blocks, nothing that repeats itself: hook, numbers, one
// piece of living proof, the certifications, the track record in six
// lines, and one way to test him for free. Everything cut from the longer
// version still exists one click away in /coach-os and the CV.

const stats = [
  { v: "58", count: "58", l: "client systems" },
  { v: "5", count: "5", l: "years building" },
  { v: "29,474", count: "29,474", l: "lines in the flagship" },
  { v: "24", count: "24", l: "GHL webhook events" },
];

const certs = [
  { img: "/badge-workflow-automation-expert.png", t: "Workflow Automation Expert" },
  { img: "/badge-funnel-building-expert.png", t: "Funnel Building Expert" },
  { img: "/badge-ai-employee-specialist.png", t: "AI Employee Specialist" },
  { img: "/badge-course-community-expert.png", t: "Course & Community Expert" },
];

const ledger = [
  { when: "2026 · AU", who: "Jessica Conner Business Consulting", role: "GHL Specialist, Automation" },
  { when: "2026 · US", who: "Chaos to Closing", role: "GHL Systems Builder" },
  { when: "2025-26", who: "Wrldinvsn", role: "Lead Flow & Funnel Operations" },
  { when: "2024-25 · AU", who: "K Australia Design", role: "Lead GHL Automation Architect" },
  { when: "2024-now", who: "Freelance, 13+ projects", role: "CRM & Automation Consultant" },
  { when: "2021-23 · US", who: "Masterpiece Las Vegas", role: "Senior Design & Systems Strategist" },
];

export default function Home() {
  return (
    <div className={`jb ${archivo.variable} ${jetmono.variable}`}>
      <Fx />
      <header className="jb-top">
        <div className="jb-cap jb-top-in">
          <a className="jb-mark" href="#top">
            Johnboy Roxas
          </a>
          <span className="jb-status">
            <span className="jb-dot" aria-hidden="true" />
            Available part-time · <LiveClock /> PHT
          </span>
        </div>
      </header>

      <main id="top">
        {/* hero: the whole pitch in one screen */}
        <section className="jb-hero">
          <div className="jb-hero-bg" aria-hidden="true" />
          <div className="jb-cap jb-hero-center">
            <div className="jb-video-wrap" data-reveal="0">
              <VideoIntro />
            </div>
            <h1 className="jb-h1" data-reveal="120">
              I build the systems <em>GoHighLevel</em>{" "}can{"’"}t build alone.
            </h1>
            <p className="jb-sub" data-reveal="200">
              GoHighLevel, n8n, Zapier, and Make for the engine. <b>Next.js, Firebase, Stripe, and the Claude
              API for everything past its walls</b>, wired back in by webhook.
            </p>
            <div className="jb-cta-row jb-cta-center" data-reveal="280">
              <a className="jb-btn jb-btn-primary" href="/coach-os">
                See the proof
              </a>
              <a className="jb-btn jb-btn-ghost" href="/book">
                Book a call
              </a>
            </div>

            <div className="jb-logbar" data-reveal="360">
              <div className="jb-statline">
                {stats.map((s) => (
                  <span className="jb-stat" key={s.l}>
                    <b data-count={s.count}>{s.v}</b> {s.l}
                  </span>
                ))}
              </div>
              <SystemLog />
            </div>
          </div>
        </section>

        {/* the one piece of proof */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/01</i> The proof
            </div>
            <h2 className="jb-h2" data-reveal="60">
              Coach OS. Built from zero, running live.
            </h2>
            <p className="jb-lede" style={{ marginBottom: "26px" }}>
              A complete client platform wired into GoHighLevel in both directions: AI companion, e-signature,
              Stripe subscriptions, courses, and the owner{"’"}s dashboard. Click through every page of it before
              you ever message me.
            </p>
            <figure className="jb-shot" data-reveal="140" style={{ margin: 0 }}>
              <div className="jb-shot-bar">
                <span className="jb-shot-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="jb-shot-url">the client portal, logged in as a demo client</span>
                <span className="jb-shot-tag">Live</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/coach-os-shots/app-portal.jpg" alt="The Coach OS client portal: AI companion chat, commitment strip, courses, and agreements" loading="lazy" />
            </figure>
            <div className="jb-cta-row" data-reveal="0" style={{ marginTop: "22px", marginBottom: 0 }}>
              <Link className="jb-btn jb-btn-primary" href="/coach-os">
                Read the case study
              </Link>
              <a className="jb-btn jb-btn-ghost" href="https://coachos.johnboydesign.com/tour" target="_blank" rel="noopener noreferrer">
                Open the live tour
              </a>
            </div>
          </div>
        </section>

        {/* certifications, compact */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/02</i> Certified by HighLevel
            </div>
            <div className="jb-certs-mini" data-reveal="80">
              {certs.map((c) => (
                <div className="jb-cert-mini" key={c.t}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.img} alt={"HighLevel " + c.t + " certification badge"} />
                  <span>{c.t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* track record, six lines */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/03</i> Track record
            </div>
            <div className="jb-ledger" data-reveal="80">
              {ledger.map((r) => (
                <div className="jb-row jb-row-min" key={r.who}>
                  <div className="jb-row-when">{r.when}</div>
                  <div className="jb-row-min-main">
                    <span className="jb-row-who">{r.who}</span>
                    <span className="jb-row-role">{r.role}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="jb-note">
              Full detail in the{" "}
              <a href="/Johnboy-Roxas-CV.pdf" style={{ color: "var(--neon)" }}>
                two-page CV
              </a>
              .
            </p>
          </div>
        </section>

        {/* contact */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-contact" data-reveal="60">
              <h2>Send me one broken workflow.</h2>
              <p>
                Before you hire anyone, me included: send one automation that is not firing or one funnel that is
                not converting. I will tell you exactly what is wrong with it, free. That is a better interview
                than any resume.
              </p>
              <div className="jb-cta-row" style={{ marginBottom: 0 }}>
                <a className="jb-btn jb-btn-primary" href="/book">
                  Book a call
                </a>
                <a className="jb-btn jb-btn-ghost" href="mailto:uix.johnboy@gmail.com">
                  uix.johnboy@gmail.com
                </a>
              </div>
              <div className="jb-links">
                <a className="jb-link" href="https://coachos.johnboydesign.com/tour" target="_blank" rel="noopener noreferrer">
                  Coach OS live
                </a>
                <a className="jb-link" href="/coach-os">
                  Case study
                </a>
                <a className="jb-link" href="/Johnboy-Roxas-CV.pdf">
                  CV (PDF)
                </a>
                <a className="jb-link" href="https://www.onlinejobs.ph/jobseekers/info/4412723" target="_blank" rel="noopener noreferrer">
                  OnlineJobs.ph
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="jb-foot">
        <div className="jb-cap" style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", justifyContent: "space-between" }}>
          <span>© 2026 John Boy Roxas · Tarlac, Philippines</span>
          <span>Built by hand, like everything else here</span>
        </div>
      </footer>
    </div>
  );
}
