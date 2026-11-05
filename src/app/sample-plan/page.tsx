import type { Metadata } from "next";
import { anton, host, plex } from "../fonts";
import "../v4/v4.css";
import "./sample-plan.css";

// What a visitor gets back for their brief, so "a free written plan" is something they can judge before asking.
// The business is made up and the page says so. No results, prices or client names.

export const metadata: Metadata = {
  title: "Sample system plan | John Boy Roxas",
  description: "What you get back when you send John Boy a brief: a written plan for the full system. This sample uses a made-up business.",
};

const EMAIL = "uix.johnboy@gmail.com";
const nl = "\n\n";
const BRIEF_MAIL =
  `mailto:${EMAIL}?subject=` +
  encodeURIComponent("My brief") +
  "&body=" +
  encodeURIComponent(`Hi John Boy,${nl}My business:${nl}The job I want off my plate:${nl}How we handle it today:${nl}`);

const agents = [
  {
    name: "Front-desk agent",
    does: "Answers enquiries by text and web chat from facts you approve. Gets the details, books the visit, updates the CRM and sends the confirmation.",
    asks: "Hands you a written summary for complaints, unusual jobs, and any price not on your list. Sends fixed safety wording and pages your on-call person for emergencies.",
  },
  {
    name: "Follow-up agent",
    does: "Chases quotes that have gone quiet, on a schedule you set, and stops the moment someone replies or books.",
    asks: "Never changes a price or offers a discount. Passes any question about the quote to you.",
  },
];

const workflows = [
  "New enquiry: contact created, source recorded, front-desk agent starts",
  "Booking: confirmation, reminder the day before, reminder on the morning",
  "Quote sent: follow-ups on days 2, 5 and 10, stopped by any reply",
  "Job done: invoice sent, then a review request a day later",
  "Missed call: a text back within a minute, then the front-desk agent",
];

const links = [
  "GoHighLevel as the CRM, pipeline, calendar and message history",
  "Your job software, by webhook, so a booked visit appears as a job",
  "Your accounting software, so a finished job raises the invoice",
  "An on-call alert to one phone number, outside business hours",
];

const stages = [
  { t: "CRM and workflows", d: "The pipeline, booking and follow-ups, working with no AI. You can check every message before it goes live." },
  { t: "Front-desk agent, supervised", d: "It drafts every reply and you approve it. You see what it gets wrong while nothing can go out unchecked." },
  { t: "Front-desk agent, on its own", d: "It sends without approval for the jobs it has handled well. Anything else still comes to you." },
  { t: "Follow-up agent and handover", d: "The second agent, written notes and a walkthrough, so your team can run it without me." },
];

export default function SamplePlan() {
  return (
    <div id="v4-root" className={`v4 ${anton.variable} ${host.variable} ${plex.variable}`}>
      <p className="v4-bar">Sample only. The business below is made up. This is not client work.</p>
      <header className="v4-nav">
        <div className="v4-nav-in">
          <a className="v4-mark" href="/">
            <b>John Boy Roxas</b>
            <span>Systems and automation</span>
          </a>
          <a className="v4-btn v4-btn-dark v4-nav-cta" href={BRIEF_MAIL}>
            Send me your brief
          </a>
        </div>
      </header>

      <main className="sp">
        <div className="sp-in">
          <p className="v4-kicker">Sample plan</p>
          <h1>What you get back for your brief.</h1>

          <section className="sp-brief" aria-label="The brief">
            <p className="v4-kicker">The brief, from a made-up electrician in Sydney</p>
            <blockquote>
              We&apos;re six people. Calls get missed when we&apos;re on site, quotes go out and nobody chases them, and my partner spends her
              evenings answering texts. I want that off her plate.
            </blockquote>
          </section>

          <section>
            <h2>The agents</h2>
            <div className="sp-agents">
              {agents.map((a) => (
                <article key={a.name}>
                  <h3>{a.name}</h3>
                  <p>
                    <b>Does on its own.</b> {a.does}
                  </p>
                  <p>
                    <b>Hands back to you.</b> {a.asks}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="sp-two">
            <div>
              <h2>The workflows</h2>
              <ul>
                {workflows.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2>What connects</h2>
              <ul>
                {links.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2>The build order</h2>
            <ol className="sp-stages">
              {stages.map((s, i) => (
                <li key={s.t}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="sp-end">
            <h2>Then you decide.</h2>
            <p className="v4-lede">A real plan ends with a fixed quote. The plan is free. You pay only if you want it built.</p>
            <div className="v4-ctas">
              <a className="v4-btn v4-btn-dark" href={BRIEF_MAIL}>
                Send me your brief
              </a>
              <a className="v4-btn v4-btn-line" href="/">
                Back to the portfolio
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
