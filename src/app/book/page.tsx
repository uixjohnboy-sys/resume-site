"use client";

// Client intake page, in the same neon design system as the homepage
// (home.css, scoped under .jb). Keeps everything the old page did: the
// quick answers an employer always asks, the availability flag, and the
// live GHL booking calendar, restyled so the whole site reads as one build.

import Link from "next/link";
import Script from "next/script";
import Fx from "@/components/home/Fx";
import { archivo, jetmono } from "../fonts";
import { useAvailability } from "@/lib/useAvailability";
import "../home.css";

const complexBuilds = [
  "Scalable GoHighLevel infrastructure that lets agencies onboard unlimited clients with zero technical friction.",
  "A complete client platform (Coach OS) wired into GHL in both directions: AI companion, e-signature, Stripe subscriptions, courses, and a coach dashboard.",
  "Always-on multi-channel nurture automations across SMS, email, and voicemail drop, with A2P 10DLC compliance for deliverability.",
  "End-to-end lead tracking system from first click to close, so no opportunity slips through.",
  "Automated booking system with calendar sync, reminders, and cancellation handling.",
  "Full GHL account migrations and SaaS-mode/snapshot setup for scaling agencies.",
];

const nextSteps = [
  { title: "Discovery call", description: "We talk through what you need, your current setup, and whether it's a good fit." },
  { title: "Proposal", description: "You get a clear scope, timeline, and rate for the work, no surprises." },
  { title: "Kickoff", description: "We start building, with regular updates so you always know where things stand." },
];

const faqs = [
  {
    q: "What if I'm not sure GoHighLevel is the right fit for my business?",
    a: "That's exactly what the discovery call is for. We'll walk through your current setup together and I'll tell you honestly if GHL is the right tool, no pressure either way.",
  },
  {
    q: "Do you sign NDAs or confidentiality agreements?",
    a: "Yes, happy to sign an NDA before we dive into any specifics about your business.",
  },
  {
    q: "What if the project takes longer than expected?",
    a: "I always scope the work upfront and flag early if timelines shift, so there are no surprises on your end.",
  },
  {
    q: "Can I hire you for a one-off task instead of an ongoing engagement?",
    a: "Yes, hourly work is available for smaller, one-off builds. Monthly retainers are for clients who want ongoing support.",
  },
];

export default function BookPage() {
  const available = useAvailability();

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
            Client intake
          </span>
        </div>
      </header>

      <main>
        <section className="jb-hero" style={{ paddingBottom: "40px" }}>
          <div className="jb-hero-bg" aria-hidden="true" />
          <div className="jb-cap" style={{ position: "relative", maxWidth: "820px" }}>
            <Link className="jb-back" href="/">
              ← Back to portfolio
            </Link>
            <h1 className="jb-h1" data-reveal="0" style={{ fontSize: "clamp(32px, 6vw, 54px)" }}>
              Client <em>intake</em>
            </h1>
            <p className="jb-sub" data-reveal="90">
              A quick intro, the answers clients usually ask about, and a calendar to lock in a call, all in one
              place.
            </p>
          </div>
        </section>

        <section className="jb-sec" style={{ paddingTop: "40px" }}>
          <div className="jb-cap" style={{ maxWidth: "820px" }}>
            {/* availability */}
            <div className="jb-panel" data-reveal="0">
              <div className="jb-cap-k">Availability</div>
              <p className="jb-lede" style={{ fontSize: "14px" }}>
                <b style={{ color: "var(--text)" }}>Part-time, 4 hours a day</b>, starting at 8 AM in your
                timezone, whether you are working with me from the US or Australia. I keep the schedule flexible
                and adjust it to what a project actually needs: a launch date, a live event, an urgent request. If
                you need me outside my usual window, say so and I will make it work.
              </p>
            </div>

            {/* rate */}
            <div className="jb-panel" data-reveal="0">
              <div className="jb-cap-k">Proposed rate</div>
              <p className="jb-lede" style={{ fontSize: "14px", marginBottom: "12px" }}>
                <b style={{ color: "var(--neon)" }}>$10 per hour</b>, depending on project scope. Hourly or
                monthly; monthly clients are billed fortnightly rather than all at once. Payment goes through
                Wise, the easiest way for clients anywhere to send payment directly.
              </p>
              <p className="jb-lede" style={{ fontSize: "14px" }}>
                Why this rate? Because the work does not stop once something is built. I set up a proper client
                handover, stay on for ongoing support, and make sure you fully understand what was built for you.
                I am not a typical VA: I work as a strategist who helps figure out what should actually get built,
                not just execute a list of tasks.
              </p>
            </div>

            {/* complex builds */}
            <div className="jb-panel" data-reveal="0">
              <div className="jb-cap-k">Most complex systems built</div>
              <ul className="jb-ul">
                {complexBuilds.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="jb-note">
                The first one on that list is public:{" "}
                <Link href="/coach-os" style={{ color: "var(--neon)" }}>
                  read the Coach OS case study
                </Link>{" "}
                or{" "}
                <a
                  href="https://coachos.johnboydesign.com/tour"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--neon)" }}
                >
                  click through it live
                </a>
                .
              </p>
            </div>

            {/* steps */}
            <div className="jb-panel" data-reveal="0">
              <div className="jb-cap-k">What happens after you book</div>
              <ol className="jb-steps">
                {nextSteps.map((s) => (
                  <li className="jb-step" key={s.title}>
                    <div>
                      <b>{s.title}</b>
                      <span>{s.description}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* faq */}
            <div className="jb-panel" data-reveal="0">
              <div className="jb-cap-k">Common questions</div>
              <div style={{ display: "grid", gap: "16px" }}>
                {faqs.map((f) => (
                  <div key={f.q}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
                      {f.q}
                    </div>
                    <div style={{ fontSize: "13px", lineHeight: 1.65, color: "var(--text-2)" }}>{f.a}</div>
                  </div>
                ))}
              </div>
            </div>

            {available === true && (
              <div
                className="jb-avail"
                style={{ display: "flex", justifyContent: "center", marginTop: "22px", marginBottom: 0 }}
              >
                <span className="jb-dot" aria-hidden="true" />
                Currently accepting 1 new client this month
              </div>
            )}

            {/* calendar */}
            <div className="jb-cal" style={{ marginTop: "22px" }} data-reveal="0">
              <iframe
                src="https://link.funnelgenie.io/widget/booking/LOYqIv9mae8XbBhBarr5"
                scrolling="yes"
                id="LOYqIv9mae8XbBhBarr5_1"
                title="Book a call with John Boy Roxas"
              />
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

      <Script src="https://link.funnelgenie.io/js/form_embed.js" strategy="afterInteractive" />
    </div>
  );
}
