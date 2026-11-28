import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "../project.css";

// The "Explore more" page for Kestrel Physio (JB 2026-11-28): what was built, what each part does for the clinic, and
// how a visitor tests it. Facts come from the build log (PortfolioProjects/funnel-studio/kestrel/GHL-BUILD.md) and the
// live site's own copy: 6 pages, 5 calendars, 3 workflows, reminders 1 day and 2 hours before, email only (no texts),
// confirmation and alert within 3 seconds in the GoHighLevel log of the 28 Nov 2026 test booking. Noindex like the
// other project pages.

const SITE = "https://kestrel.johnboydesign.com";

export const metadata: Metadata = {
  title: "Kestrel Physio: a clinic booking site on GoHighLevel | John Boy Roxas",
  description: "A made-up Brisbane physio clinic with a real booking system: two questions find the right visit, live GoHighLevel calendars, confirmation and reminder emails, follow-up workflows.",
  robots: { index: false, follow: false },
};

const built = [
  ["Landing page with a two-question finder", "Patients choose the right appointment type themselves, so the front desk isn't sorting it out on the phone."],
  ["Five live GoHighLevel calendars", "Bookings come in after hours, and the body area and who is paying arrive on the contact before the visit."],
  ["A thank-you page for each visit type", "The patient knows what happens next, so nobody emails to ask if the booking went through."],
  ["Confirmation and two reminders", "Sent 1 day and 2 hours before, each with a link to move or cancel, so a visit that can't happen frees its slot."],
  ["Workflow: missed visit", "A no-show gets a kind rebook email instead of an awkward phone call."],
  ["Workflow: after the visit", "Patients on a plan get an email to book the next visit, and it stops the moment they book."],
  ["Staff alert", "The team sees name, time, appointment type, body area, funding and physio preference in one email."],
  ["Fees and first-visit pages", "Fees, rebates and what to bring are on the site, not in the inbox."],
];

const test = [
  ["Answer the two questions", "On the home page, pick what brings you in and whether you have been before. It suggests the visit, its length and its fee."],
  ["Book a test visit with your own email", "Pick a time on the live calendar (Brisbane time). The confirmation reaches your inbox within seconds."],
  ["Watch for the reminders", "If your visit is more than a day away, a reminder comes 1 day before and another 2 hours before, each with a change or cancel link."],
  ["Turn on Owner view", "Every page has an Owner view switch. It shows what each part does behind the scenes, with screenshots of the live workflows."],
];

const shots: [string, string][] = [
  ["/work/demos/kestrel-book-800.webp", "The booking page with the live GoHighLevel calendar in Brisbane time"],
  ["/work/demos/kestrel-thanks-800.webp", "The thank-you page with the visit summary"],
  ["/work/demos/kestrel-wf-missed-800.webp", "The missed-visit workflow in GoHighLevel"],
  ["/work/demos/kestrel-owner-800.webp", "Owner view switched on, showing what happens behind the page"],
];

export default function KestrelProject() {
  return (
    <main className="pj">
      <nav className="pj-nav">
        <Link href="/">John Boy Roxas</Link>
      </nav>

      <header className="pj-hero">
        <p className="pj-kicker">Clinics · Booking site on GoHighLevel</p>
        <h1>Patients find the right visit and book it themselves</h1>
        <p className="pj-lead">
          Kestrel Physio is a Brisbane clinic that doesn&apos;t exist, with a booking system that does. Patients answer two questions, see the visit that fits, and book it on a live GoHighLevel calendar. GoHighLevel then sends the confirmation, the reminders and the follow-ups on its own.
        </p>
        <div className="pj-cta">
          <a className="pj-btn" href={`${SITE}/book`} target="_blank" rel="noopener noreferrer">
            Book a test visit
          </a>
          <a className="pj-btn pj-btn-quiet" href={SITE} target="_blank" rel="noopener noreferrer">
            Open the site
          </a>
        </div>
        <p className="pj-fine">Made-up clinic: no real appointment, but the emails are real. Email only, no texts. The people photos are licensed stock.</p>
        <Image className="pj-shot" src="/work/demos/kestrel-home-1440.webp" alt="Kestrel Physio home page with the two-question appointment finder" width={1440} height={900} sizes="(max-width: 1100px) 92vw, 1040px" priority />
      </header>

      <section className="pj-sec">
        <h2>What was built</h2>
        <p className="pj-measure">6 pages, 5 live calendars, 3 workflows and 2 reminder times. A coded front end on Vercel, with GoHighLevel doing the booking and the follow-up behind it.</p>
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
          <a className="pj-btn pj-btn-quiet" href={`${SITE}/book`} target="_blank" rel="noopener noreferrer">
            Start the test booking
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
          The calendars, the workflows and the emails are real and run in GoHighLevel. In the test booking on 28 November 2026, the confirmation and the staff alert went out within 3 seconds, by the GoHighLevel log. The clinic, its physios and its reviews are made up, and the reviews are labelled as samples. The missed-visit and after-visit emails are started by the clinic team, so a visitor sees them in Owner view rather than in their inbox.
        </p>
      </section>

      <section className="pj-end">
        <h2>Want this for your clinic?</h2>
        <p>Book a 15-minute call and tell me how bookings work for you today. I&apos;ll tell you what I&apos;d build.</p>
        <div className="pj-cta">
          <a className="pj-btn" href="/book">
            Book a 15-min call
          </a>
          <Link className="pj-btn pj-btn-quiet" href="/work/funnels">
            More funnels and landing pages
          </Link>
        </div>
      </section>
    </main>
  );
}
