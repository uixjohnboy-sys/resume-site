import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "../project.css";

// The "Explore more" page for the speed-to-lead demo (JB 2026-11-28): what was built, what each part does for a
// trades business, and how a visitor tests it. Facts come from PortfolioProjects/speed-to-lead (SPEC.md, GHL-AUDIT.md
// build log and test log, BUILD-COPY.md, SOP.md), the one-page guide /guides/speed-to-lead-kit.pdf and the live form's
// own copy: form, calendar, pipeline, workflows A, B and C live; text messages built and switched off (the account
// can't send SMS); reply email 4 to 5 seconds after the form in the GoHighLevel log on 14 and 21 Nov 2026.
// Noindex like the other project pages.

const FORM = "https://link.funnelgenie.io/widget/form/VeG0q0l7Gk3CYGlz9HSM";
const GUIDE = "/guides/speed-to-lead-kit.pdf";

export const metadata: Metadata = {
  title: "Speed-to-lead for a trades business: quote follow-up on GoHighLevel | John Boy Roxas",
  description: "A made-up roofing business with a real GoHighLevel follow-up: every quote enquiry gets an email reply with a booking link, then follow-ups on day 1, 3 and 7 until they book.",
  robots: { index: false, follow: false },
};

const built = [
  ["Quote form", "First name, suburb or postcode, the job, how they heard about you, an optional mobile and email. The job type and the source are saved on the contact, so you can see where your work comes from."],
  ["Reply with a booking link", "The customer gets an email straight away. It repeats the job and suburb they entered and links to a free quote visit, while they're still keen."],
  ["Jobs pipeline", "New, Contacted, Booked, Quoted, Won, Lost and No reply. Every enquiry lands in it on its own and moves to Contacted once the reply is out."],
  ["Owner notification", "The owner gets a GoHighLevel notification for each new enquiry, so nothing waits in an inbox nobody checks."],
  ["Follow-ups until they book", "If they don't book, follow-up emails go out on day 1, day 3 and day 7. Two days after the last one, the job moves to No reply, so you know who to ring."],
  ["Booking stops the follow-ups", "The moment a quote visit is booked, the follow-ups stop and the job moves to Booked. Nobody gets chased after they've said yes."],
  ["Free quote visit calendar", "30-minute visits. The booking asks only for first name and email, then sends a confirmation email and a reminder email a day before."],
  ["Text messages, built but switched off", "A text reply is set up in the first workflow, and a missed-call text-back is built as a draft. Both are off because this demo account can't send SMS. In your account, connect a phone number and switch them on."],
];

const test = [
  ["Send the form with your own email", "Pick a job and type any suburb. Leave the mobile blank: nothing is texted. Your reply should arrive within seconds."],
  ["Read the reply", "It names the job and suburb you entered and has the link to book a free quote visit. It comes from Tallowood Roofing (demo)."],
  ["Book, or don't", "Book a time from the link and the follow-ups stop, with a confirmation email instead. Don't book and you get up to 3 follow-up emails over 7 days."],
  ["Read the one-page guide", "It lists every part, the order to build it in, and a five-step test to run before it goes live in your account."],
];

const shots: [string, string][] = [
  ["/work/demos/speed-form-phone-800.webp", "The quote form on a phone, with the made-up business line above the button"],
  ["/work/demos/speed-guide-800.webp", "The one-page guide: every part, how to set it up and how to test it"],
];

export default function SpeedToLeadProject() {
  return (
    <main className="pj">
      <nav className="pj-nav">
        <Link href="/">John Boy Roxas</Link>
      </nav>

      <header className="pj-hero">
        <p className="pj-kicker">Trades · Lead follow-up on GoHighLevel</p>
        <h1>Every quote enquiry gets a reply and a booking link in seconds</h1>
        <p className="pj-lead">
          Tallowood Roofing &amp; Gutters is a roofing business that doesn&apos;t exist, with a follow-up system that does. When someone asks for a quote, GoHighLevel emails them straight away with a link to book a free quote visit. If they don&apos;t book, it follows up on day 1, 3 and 7. The moment they book, the follow-ups stop.
        </p>
        <div className="pj-cta">
          <a className="pj-btn" href={FORM} target="_blank" rel="noopener noreferrer">
            Try the quote form
          </a>
          <a className="pj-btn pj-btn-quiet" href={GUIDE} target="_blank" rel="noopener noreferrer">
            Read the one-page guide
          </a>
        </div>
        <p className="pj-fine">Made-up business: no one will visit, but the emails are real. Email only. The text messages are built but switched off, because this demo account can&apos;t send SMS.</p>
        <Image className="pj-shot" src="/work/demos/speed-form-1440.webp" alt="The Tallowood Roofing quote form with the Send my enquiry button" width={1440} height={900} sizes="(max-width: 1100px) 92vw, 1040px" priority />
      </header>

      <section className="pj-sec">
        <h2>What was built</h2>
        <p className="pj-measure">A form, a calendar, a pipeline and three live workflows, all in GoHighLevel. Everything is named and grouped, so it can be rebuilt in your own account from the one-page guide.</p>
        <div className="pj-grid">
          {built.map(([t, b]) => (
            <div key={t} className="pj-card">
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pj-sec">
        <h2>How to test it</h2>
        <p className="pj-measure">There&apos;s no client testimonial, because this is a demo I built to show how I work. Here are four things you can check yourself in a few minutes.</p>
        <div className="pj-grid">
          {test.map(([t, b]) => (
            <div key={t} className="pj-card">
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
        <div className="pj-cta">
          <a className="pj-btn pj-btn-quiet" href={FORM} target="_blank" rel="noopener noreferrer">
            Send a test enquiry
          </a>
        </div>
      </section>

      <section className="pj-sec">
        <h2>Inside the build</h2>
        <div className="pj-grid">
          {shots.map(([src, alt]) => (
            <figure key={src} className="pj-card" style={{ margin: 0 }}>
              <Image src={src} alt={alt} width={800} height={500} sizes="(max-width: 700px) 92vw, 500px" style={{ width: "100%", height: "auto", display: "block" }} />
              <figcaption style={{ marginTop: 10 }}>{alt}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="pj-sec">
        <h2>What&apos;s real and what&apos;s made up</h2>
        <p className="pj-measure">
          The form, the calendar, the pipeline and the workflows are real and run in GoHighLevel, and the emails reach your inbox. In the tests on 14 and 21 November 2026, the reply went out 4 to 5 seconds after the form, by the GoHighLevel log, and a test booking stopped the follow-ups. Tallowood Roofing &amp; Gutters and Sam, who signs the emails, are made up, and the reply and every follow-up say so at the bottom. No one will visit. The text messages are built but switched off, because this GoHighLevel account can&apos;t send SMS.
        </p>
      </section>

      <section className="pj-end">
        <h2>Want this for your business?</h2>
        <p>Book a 15-minute call and tell me what happens to a new enquiry today. I&apos;ll tell you what I&apos;d build.</p>
        <div className="pj-cta">
          <a className="pj-btn" href="/book">
            Book a 15-min call
          </a>
          <Link className="pj-btn pj-btn-quiet" href="/work/lead-follow-up">
            More lead follow-up work
          </Link>
        </div>
      </section>
    </main>
  );
}
