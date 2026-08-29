import Link from "next/link";
import VideoIntro from "@/components/home/VideoIntro";
import Fx from "@/components/home/Fx";
import SystemLog from "@/components/home/SystemLog";
import LiveClock from "@/components/home/LiveClock";
import Connect from "@/components/home/Connect";
import BookPill from "@/components/home/BookPill";
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

const proofShots = [
  {
    img: "/coach-os-shots/app-portal.jpg",
    url: "the client portal, logged in as a demo client",
    wide: true,
  },
  {
    img: "/coach-os-shots/app-dash-kanban.jpg",
    url: "the owner's pipeline, every lead from every tool",
    wide: false,
  },
  {
    img: "/coach-os-shots/app-diagnostic.jpg",
    url: "one of four lead-gen tools, in the client's brand",
    wide: false,
  },
];

const hardParts = [
  "Idempotent webhooks: a retried payment can never double-charge a client.",
  "Contracts are write-once at the database-rules layer, not by trusting the app.",
  "Every AI call has a fallback: an outage shows a working page, never an error.",
];

const works = [
  { img: "/work/chaos-to-closing.jpg", name: "Chaos to Closing", kind: "Coaching business site · US" },
  { img: "/work/mindset-coaching.jpg", name: "Mindset Coaching", kind: "Coaching funnel" },
  { img: "/work/words-like-alice.jpg", name: "Words Like Alice", kind: "Author site" },
  { img: "/work/chaos-sales-page.jpg", name: "Chaos to Closing", kind: "Sales page" },
  { img: "/work/dental-clinic.jpg", name: "Dental Clinic", kind: "Clinic site" },
  { img: "/work/chaos-ai-funnel.jpg", name: "Chaos to Closing", kind: "AI funnel" },
  { img: "/work/melbourne-chiropractic.jpg", name: "Melbourne Chiropractic", kind: "Clinic site · AU" },
  { img: "/work/digital-products.jpg", name: "Digital Products", kind: "Storefront funnel" },
  { img: "/work/landscaping.jpg", name: "Landscaping", kind: "Local service site" },
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
      <div className="jb-grain" aria-hidden="true" />
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
            <div className="jb-shots" data-reveal="140">
              {proofShots.map((sh) => (
                <figure className="jb-shot" key={sh.img} style={sh.wide ? { gridColumn: "1 / -1", margin: 0 } : { margin: 0 }}>
                  <div className="jb-shot-bar">
                    <span className="jb-shot-dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="jb-shot-url">{sh.url}</span>
                    <span className="jb-shot-tag">Live</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sh.img} alt={sh.url} loading="lazy" />
                </figure>
              ))}
            </div>
            <ul className="jb-hardline" data-reveal="0">
              {hardParts.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
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

        {/* selected work */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/02</i> Selected work
            </div>
            <h2 className="jb-h2" data-reveal="60">
              Nine builds. Hover one and the page walks itself.
            </h2>
            <p className="jb-lede" style={{ marginBottom: "30px" }}>
              Funnels, client sites, and sales pages shipped inside GoHighLevel and in code, for coaches,
              clinics, and local businesses in the US and Australia.
            </p>
            <div className="jb-works" data-reveal="140">
              {works.map((w, i) => (
                <figure className="jb-work" key={w.img}>
                  <div className="jb-shot-bar">
                    <span className="jb-shot-dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="jb-shot-url">{w.name.toLowerCase().replace(/s+/g, "")}.com</span>
                    <span className="jb-shot-tag">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="jb-work-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.img} alt={w.name + ", " + w.kind} loading="lazy" />
                  </div>
                  <figcaption className="jb-work-cap">
                    <b>{w.name}</b>
                    <span>{w.kind}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* certifications, compact */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/03</i> Certified by HighLevel
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
              <i>/04</i> Track record
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
              </div>
              <Connect />
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

      <BookPill />

      <footer className="jb-foot">
        <div className="jb-cap" style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", justifyContent: "space-between" }}>
          <span>© 2026 John Boy Roxas · Tarlac, Philippines</span>
          <span>Built by hand, like everything else here</span>
        </div>
      </footer>
    </div>
  );
}
