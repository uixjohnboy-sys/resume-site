import type { Metadata } from "next";
import Link from "next/link";
import Fx from "@/components/home/Fx";
import { archivo, jetmono } from "../fonts";
import "../home.css";

// The Coach OS case study, in the same neon design system as the homepage
// (home.css, scoped under .jb). This page is the single proof link used in
// every job application, so it carries the full argument: the numbers, the
// modules, the genuinely hard decisions, and the live doors.

const title = "Coach OS · Case Study";
const description =
  "A case study on Coach OS, a client-management platform built from zero: 29,474 lines of production code, 24 GoHighLevel webhook events in both directions, 83 automated emails, Stripe subscription billing, and an AI companion trained on each client's own history.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://www.johnboydesign.com/coach-os" },
  openGraph: {
    title,
    description,
    url: "https://www.johnboydesign.com/coach-os",
    siteName: "John Boy Roxas",
    type: "article",
  },
  twitter: { card: "summary_large_image", title, description },
};

const stats = [
  { v: "29,474", count: "29,474", l: "Lines of production code" },
  { v: "24", count: "24", l: "GoHighLevel webhook events" },
  { v: "83", count: "83", l: "Automated email templates" },
  { v: "26", count: "26", l: "Page routes" },
  { v: "34", count: "34", l: "API endpoints" },
  { v: "8", count: "8", l: "Scheduled background jobs" },
];

const modules = [
  {
    k: "The client side",
    t: "What the client sees",
    items: [
      "A private portal they reach by email, with no password to forget and no app to install.",
      "An AI companion that answers using their own history: their intake answers, their plan, their progress, their last session.",
      "A course area with modules, nested lessons, per-lesson completion, and a certificate at the end.",
      "Milestone check-ins that ask how things are actually going, and record the answer.",
      "A service agreement they read and sign in the browser, then download as a real PDF.",
    ],
  },
  {
    k: "The coach side",
    t: "What the coach sees",
    items: [
      "A pipeline board where every lead's quiz answers, payment status, signature, and course progress live on one record.",
      "A health score per client, computed from signals already on the record, so churn shows up before the client goes quiet.",
      "Revenue by source, conversion by stage, and package performance, with attribution carried from first click to closed deal.",
      "A single Client 360 panel: everything the system has ever learned about one person, in one scroll.",
      "Testimonials that turn into branded, downloadable cards without leaving the dashboard.",
    ],
  },
  {
    k: "The automation layer",
    t: "What runs by itself",
    items: [
      "24 distinct webhook events moving in both directions: app to GoHighLevel, and GoHighLevel back to the app.",
      "8 scheduled jobs handling onboarding weeks, check-in reminders, access expiry, no-show recovery, and a weekly digest.",
      "83 email templates, including follow-up sequences that escalate on day 2 and again on day 5 instead of firing once.",
      "Booking and pipeline stage changes sync back from the CRM, so nobody keeps two systems in their head.",
    ],
  },
  {
    k: "The money layer",
    t: "What handles payment",
    items: [
      "Stripe checkout for one-time packages and recurring subscriptions.",
      "The full subscription lifecycle handled: payment succeeded, payment failed, and cancellation, each with its own recovery path.",
      "Webhook signature verification, so nobody can spoof a payment into the system.",
      "Access windows that open on payment and close on expiry, enforced at the data layer and not just in the interface.",
    ],
  },
];

const hardParts = [
  {
    b: "A signed contract that cannot be quietly overwritten",
    s: "Every other collection in the system allows updates. A signed agreement must not. That rule is enforced in the database security rules themselves, not by trusting the app to behave, and each signature stores a permanent snapshot of the exact clause text shown at signing. If the coach edits the template a year later, you can still prove what the client actually agreed to.",
  },
  {
    b: "Retried webhooks that never double-charge",
    s: "Payment providers retry. If your handler is not idempotent, a network hiccup becomes a second charge or a duplicate email. Every write path is built so that running it twice produces the same result as running it once. Invisible when it works, and the reason nobody gets woken up at 2am.",
  },
  {
    b: "AI that degrades instead of breaking",
    s: "Every AI feature has a hard-coded fallback. If the API key is missing, the service is down, or the call times out, the visitor sees a complete, sensible page instead of a spinner or an error. An AI feature that only works when the weather is good is not a feature.",
  },
  {
    b: "Dashboards that add zero extra queries",
    s: "Every aggregate on the dashboard, the health scores, the revenue trend, the referral leaderboard, the compliance alerts, is derived from data already loaded once. No new reads. That discipline keeps the dashboard fast at ten clients and still fast at a thousand.",
  },
  {
    b: "Checked at 320 pixels, not just on a laptop",
    s: "Most of this gets opened on a phone, often from a link in a message. Every public page is verified for horizontal overflow at 375px and 320px before it ships. A page that scrolls sideways on a phone reads as broken, no matter how good it looks on a monitor.",
  },
];

const stack = [
  "Next.js (App Router)",
  "React",
  "Firebase Firestore",
  "Firestore security rules",
  "Stripe (one-time + subscriptions)",
  "Anthropic Claude API",
  "GoHighLevel webhooks + API",
  "Vercel (hosting + cron)",
  "pdf-lib",
  "Canvas rendering",
];

const liveLinks = [
  {
    href: "https://coachos.johnboydesign.com/tour",
    label: "The full tour",
    note: "Every part of the system, in the order a client meets it. Start here.",
  },
  {
    href: "https://coachos.johnboydesign.com/fit-assessment",
    label: "The AI fit assessment",
    note: "A quiz that scores answers and renders a live result. No email gate.",
  },
  {
    href: "https://coachos.johnboydesign.com/mirror",
    label: "The live preview",
    note: "The client portal, running, with nothing to fill in.",
  },
  {
    href: "https://coachos.johnboydesign.com/start",
    label: "The front door",
    note: "The page the whole funnel points at.",
  },
];

export default function CoachOsCaseStudy() {
  return (
    <div className={`jb ${archivo.variable} ${jetmono.variable}`}>
      <Fx />
      <header className="jb-top">
        <div className="jb-cap jb-top-in">
          <Link className="jb-mark" href="/">
            Johnboy Roxas
          </Link>
          <span className="jb-status">
            <span className="jb-dot" aria-hidden="true" />
            Case study
          </span>
        </div>
      </header>

      <main>
        {/* header */}
        <section className="jb-hero" style={{ paddingBottom: "48px" }}>
          <div className="jb-hero-bg" aria-hidden="true" />
          <div className="jb-cap" style={{ position: "relative" }}>
            <Link className="jb-back" href="/">
              ← Back to portfolio
            </Link>
            <div className="jb-feat-top" data-reveal="0">
              <span className="jb-pill">Live now</span>
              <span className="jb-pill jb-pill-ghost">Built from zero</span>
              <span className="jb-pill jb-pill-ghost">Sample data, labelled</span>
            </div>
            <h1 className="jb-h1" data-reveal="80" style={{ maxWidth: "18ch" }}>
              Coach <em>OS</em>
            </h1>
            <p className="jb-sub" data-reveal="160">
              A complete client-management platform, designed and built from zero, wired into GoHighLevel in both
              directions. <b>Not a template, a snapshot, or a funnel.</b> A running product, and you can click
              through every page of it before you read another word about me.
            </p>

            <div className="jb-board" data-reveal="240">
              <div className="jb-board-head">
                <span>Build status</span>
                <span>Counted from the repository</span>
              </div>
              <div className="jb-board-grid">
                {stats.map((s) => (
                  <div className="jb-cell" key={s.l}>
                    <div className="jb-cell-v" data-count={s.count}>
                      {s.v}
                    </div>
                    <div className="jb-cell-l">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="jb-board-foot">
                The live demo runs on sample data and is labelled as such on every page that shows it.
              </div>
            </div>
          </div>
        </section>

        {/* why it exists */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/01</i> Why it exists
            </div>
            <h2 className="jb-h2" data-reveal="60">
              Every CRM build hits a wall. This is what I do there.
            </h2>
            <div data-reveal="140" style={{ maxWidth: "66ch" }}>
              <p className="jb-lede" style={{ marginBottom: "14px" }}>
                A one-to-one coach sells a six month engagement, then runs it out of a calendar, a spreadsheet, a
                payment link, and a folder of documents. Nothing talks to anything. The client pays, then waits
                for a welcome email somebody has to remember to send.
              </p>
              <p className="jb-lede" style={{ marginBottom: "14px" }}>
                GoHighLevel solves a large part of that, and I use it for exactly that part. But there is always a
                gap between what the CRM can do natively and what the business actually needs. Most contractors
                stop at the edge of that gap and call it a platform limitation.
              </p>
              <p className="jb-lede" style={{ color: "var(--text)" }}>
                Coach OS is what I build when I do not stop there: a real application on the other side of the
                gap, talking to the CRM in both directions, so the coach keeps one system and the client never
                sees the seam.
              </p>
            </div>
          </div>
        </section>

        {/* inside */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/02</i> What is inside
            </div>
            <div className="jb-caps" data-reveal="80" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {modules.map((m) => (
                <div className="jb-cap-item" key={m.t}>
                  <div className="jb-cap-k">{m.k}</div>
                  <h3 className="jb-cap-t">{m.t}</h3>
                  <ul className="jb-ul">
                    {m.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* hard parts */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/03</i> The parts that were actually hard
            </div>
            <h2 className="jb-h2" data-reveal="60">
              Anyone can list features. These are the decisions underneath.
            </h2>
            <p className="jb-lede" style={{ marginBottom: "34px" }}>
              They are the reason the system still works on a bad day.
            </p>
            <ul className="jb-promises" data-reveal="140">
              {hardParts.map((h) => (
                <li className="jb-promise" key={h.b}>
                  <svg className="jb-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <b>{h.b}</b>
                    <span>{h.s}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* stack */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/04</i> Built with
            </div>
            <div className="jb-tags" data-reveal="60">
              {stack.map((s) => (
                <span className="jb-tag" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* live doors */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/05</i> See it running
            </div>
            <h2 className="jb-h2" data-reveal="60">
              All four doors are public. Nothing to sign up for.
            </h2>
            <div className="jb-projects" data-reveal="140" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: "30px" }}>
              {liveLinks.map((l) => (
                <a className="jb-proj" href={l.href} key={l.href} target="_blank" rel="noopener noreferrer">
                  <div className="jb-proj-head">
                    <span className="jb-proj-n">{l.label}</span>
                    <span className="jb-proj-s live">Live ↗</span>
                  </div>
                  <p className="jb-proj-b">{l.note}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* cta */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-contact" data-reveal="60">
              <h2>If your GoHighLevel build has hit a wall</h2>
              <p>
                That wall is usually where my work starts. Send me one workflow that is broken or one funnel that
                is not converting, and I will tell you what is wrong with it before you spend anything.
              </p>
              <div className="jb-cta-row" style={{ marginBottom: 0 }}>
                <a className="jb-btn jb-btn-primary" href="/book">
                  Book a call
                </a>
                <Link className="jb-btn jb-btn-ghost" href="/">
                  See other work
                </Link>
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
