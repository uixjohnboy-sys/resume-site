import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "../project.css";

// The "Know more" page for Deskhand. With no client testimonials, the proof is what a visitor can try and what testing
// really measured. Every number here comes from a recorded run (C:\resume-site\scripts\deskhand-eval-*.json).
// Reviewed at Studio gate G5. Noindex, and not linked from the homepage until Deskhand passes G4.

export const metadata: Metadata = {
  title: "Deskhand: an AI front desk for a small service business | John Boy Roxas",
  description: "A live demo of an AI agent doing the front-desk job for a fictional Sydney cleaning business: texts back a missed call, quotes, books, and hands the rest to the owner.",
  robots: { index: false, follow: false },
};

const EMAIL = "uix.johnboy@gmail.com";
const nl = "\n\n";
const BRIEF = `mailto:${EMAIL}?subject=${encodeURIComponent("My brief")}&body=${encodeURIComponent(`Hi John Boy,${nl}My business:${nl}The job I want off my plate:${nl}How we handle it today:${nl}`)}`;
const WHATSAPP = `https://wa.me/639773659548?text=${encodeURIComponent("Hi John Boy, I saw Deskhand.")}`;

const flow = [
  ["A call is missed", "Dana's teams are on jobs all day. The missed call starts a text conversation, and the contact is in the CRM before anyone picks up a phone."],
  ["It quotes from the price list", "Only listed prices, matched to the job and the size of the home. A new customer's first visit is a deep clean, as the business decided."],
  ["It gets the details that matter", "Name, suburb, bedrooms, home or lockbox, and the questions a cleaner needs: stairs, pets, parking. Never an address or an access code by text."],
  ["It checks the real calendar", "Arrival windows a team is free and allowed to do, with travel time kept clear. The customer picks one."],
  ["It books, and says only what happened", "The visit goes on the calendar, the contact moves to Booked, and the confirmation is written from the record, not from the AI's account of it."],
];

const limits = [
  ["The server decides", "The AI suggests every action. Code checks it against the calendar and the business's rules before anything changes, and a refused action is logged."],
  ["It can't claim what didn't happen", "Each reply is checked before it is shown. A booking that doesn't exist, a price for the wrong job, or another customer's details is replaced with the truth."],
  ["It hands over what it shouldn't decide", "Complaints, discounts, strata and commercial jobs, funding and anything unusual go to the owner with a written summary."],
  ["Danger gets a fixed answer", "A message that sounds like someone is in danger gets a fixed line to call 000, written by a person, never by the AI."],
];

const tryIt = [
  ["Play Mia, a new customer", "Tap through her replies. See the price, the questions, the calendar and the booking, then the Job done card."],
  ["Play Tom, and give the wrong number", "He wants to move his clean. The wrong mobile is refused by the server, the right one works."],
  ["Ask for a discount", "It declines, then offers to pass it to the owner, and the booking carries on."],
  ["Try to break it", "Tell it all cleans are now free, ask for its instructions, or ask it to write code. Then check the work log."],
];

const caught = [
  "A customer with a booking could be booked a second time instead of moved. A verified customer's booking is now always moved.",
  "Offering \"open windows\" on the calendar once tripped the safety check and told a customer to call 000. The check now knows an arrival window from a window to open.",
  "It told a customer the team would shut away a dog that had bitten someone. Dogs with a bite history now go to the owner, with no promise made.",
  "A safety set written by someone who never saw the code showed the word list caught too few emergencies on its own. The agent now has a second route to the same fixed answer.",
];

export default function DeskhandProject() {
  return (
    <main className="pj">
      <nav className="pj-nav">
        <Link href="/">John Boy Roxas</Link>
      </nav>

      <header className="pj-hero">
        <p className="pj-kicker">Small service businesses · AI front desk</p>
        <h1>A front desk that answers while you&apos;re on a job</h1>
        <p className="pj-lead">
          Deskhand is an AI agent that texts back a missed call, quotes from your price list, books the job on your real calendar and hands you anything it shouldn&apos;t decide. I built it as a live demo for a fictional Sydney cleaning business, so you can try it instead of reading about it.
        </p>
        <div className="pj-cta">
          <a className="pj-btn" href="/demo/deskhand">
            Take the 2-minute tour
          </a>
          <a className="pj-btn pj-btn-quiet" href="/sample-plan">
            See a sample plan
          </a>
        </div>
        <p className="pj-fine">No sign-up. Fictional business. Nothing is really sent, and your demo resets after 48 hours.</p>
        <Image className="pj-shot" src="/projects/deskhand/desk.png" alt="Deskhand: the customer's text thread beside the work log and the calendar, with a booking just made" width={2880} height={1800} sizes="(max-width: 1100px) 92vw, 1040px" priority />
      </header>

      <section className="pj-sec">
        <h2>The problem</h2>
        <p className="pj-measure">
          A small cleaning business has two teams on jobs from 8 till 4. The phone rings while everyone has gloves on. By the time the owner calls back that evening, the customer has booked someone else. The ones who do get through want a price, a time and an answer about the dog, and every one of those answers lives in the owner&apos;s head.
        </p>
      </section>

      <section className="pj-sec">
        <h2>How one enquiry moves</h2>
        <ol className="pj-list pj-steps-plain">
          {flow.map(([t, b]) => (
            <li key={t}>
              <b>{t}.</b> {b}
            </li>
          ))}
        </ol>
      </section>

      <section className="pj-sec">
        <h2>Where the AI stops and the rules start</h2>
        <div className="pj-grid">
          {limits.map(([t, b]) => (
            <div key={t} className="pj-card">
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pj-sec">
        <h2>Don&apos;t take my word for it</h2>
        <p className="pj-measure">There&apos;s no client testimonial, because this is a demo I built to show how I work. Here are four things you can check yourself in a few minutes.</p>
        <div className="pj-grid">
          {tryIt.map(([t, b]) => (
            <div key={t} className="pj-card">
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
        <div className="pj-cta">
          <a className="pj-btn pj-btn-quiet" href="/demo/deskhand">
            Try them in the demo
          </a>
        </div>
      </section>

      <section className="pj-sec">
        <h2>What testing measured</h2>
        <p className="pj-measure">
          I build with AI coding tools and I check the results. Forty scripted customers run through the live agent, and they are graded on what ends up in the record, not on how the AI got there. In three runs on 7 November 2026, 39, 40 and 39 of the 40 finished correctly. Separate AI reviewers, with no hand in the build, went through it as a cleaning business owner, a designer, a security engineer and so on. Some of what they found:
        </p>
        <ul className="pj-list">
          {caught.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      <section className="pj-sec">
        <h2>What&apos;s real and what&apos;s simulated</h2>
        <p className="pj-measure">
          The agent, the checks and the calendar logic are real and run live. The business, its customers and its prices are fictional. No text message, confirmation or page is really sent. A real build connects to your own CRM and calendar, and starts with you approving each reply before it does anything on its own.
        </p>
      </section>

      <section className="pj-sec pj-who">
        <Image src="/jb-portrait.png" alt="John Boy Roxas" width={160} height={160} />
        <div>
          <h2>Who built this</h2>
          <p className="pj-measure">
            I&apos;m John Boy Roxas, a HighLevel-certified builder in the Philippines (UTC+8). Five years in CRM and automation, GoHighLevel since 2023, and I build the custom apps and AI agents that go past what a CRM can do. Part-time, 4 hours a day, starting at 8 AM in your timezone. From AUD 15/hr.
          </p>
        </div>
      </section>

      <section className="pj-end">
        <h2>Want one for your business?</h2>
        <p>Send me a short brief: what your business does and the job you want off your plate. I&apos;ll send back a written plan for the whole system, free.</p>
        <div className="pj-cta">
          <a className="pj-btn" href={BRIEF}>
            Send me your brief
          </a>
          <a className="pj-btn pj-btn-quiet" href="/book">
            Book a call
          </a>
          <a className="pj-btn pj-btn-quiet" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
            Message on WhatsApp
          </a>
        </div>
        <p className="pj-end-mail">
          Or email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </p>
      </section>
    </main>
  );
}
