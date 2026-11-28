import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "../project.css";
import { anton, host, plex } from "@/app/fonts";

// The "Explore more" page for Lumiere Aesthetic (JB 2026-11-28): what was built, what each part does for the clinic,
// and how a visitor tests it. Facts come from PortfolioProjects/funnel-studio/LUMIERE-AUDIT.md (status blocks of
// 23 and 24 Nov 2026), LUMIERE-IMAGE-SHORTLIST.md (licensed stock, before/after pairs), work.ts (logo and layout by
// JB, photos stock) and the live site's own copy, read on 28 Nov 2026: two pages, a Pacific-time calendar, a health
// intake form, a Conversation AI front desk in the chat. Email only, no texts. Noindex like the other project pages.

const SITE = "https://lumiereaesthetic.johnboydesign.com";
const BUILD_VIDEO = "https://drive.google.com/file/d/1MfN7JlZdr9jzJutqL36mKz29GjWOKWId/view";

export const metadata: Metadata = {
  title: "Lumiere Aesthetic: a clinic website on GoHighLevel | John Boy Roxas",
  description: "A made-up San Diego aesthetic clinic with a real GoHighLevel website built around one action: book a private assessment on a live calendar, with a health intake form and an AI front desk in the chat.",
  robots: { index: false, follow: false },
};

const built = [
  ["One action on every page", "Every main button reads Book a Private Assessment and opens the booking page, so a visitor never has to work out what to do next."],
  ["Live booking calendar", "A 45-minute private assessment, Monday to Friday, 10 AM to 5 PM Pacific, booked at least a day ahead. Times show in the visitor's own time zone."],
  ["Health intake form", "Before the booking goes through, the form asks about allergies, pregnancy or breastfeeding, blood thinners, previous injectables and the treatment they're interested in."],
  ["AI front desk in the chat", "A GoHighLevel Conversation AI agent answers questions and can book the assessment. It is told to say this is a demo, never to claim to be a person, and never to make up prices or results."],
  ["One before and after slider", "The same drag-to-compare slider on all three treatments, for mouse, touch and keyboard. Every picture is labelled as a simulated result, not a patient."],
  ["Treatment facts in plain words", "Each treatment says how long the visit takes, when results show and how long they last, and that the physician confirms what applies."],
  ["Questions before the visit", "Six answers on the page, from downtime to what to bring, so the usual worries are answered before they book."],
  ["A header that stays in reach", "Once the visitor scrolls past the top, a bar with the sections and a Book button stays in view. On a phone it shrinks to the logo and Book."],
];

const test = [
  ["Drag a before and after", "On the home page, drag the handle across any of the three treatment pictures. It works with a mouse, a finger or the keyboard."],
  ["Book a test assessment with your own email", "Pick any time on the live calendar. The booking page says the confirmation email follows. Tick the demo box, and don't enter real health details."],
  ["Ask the front desk a question", "Open the chat in the corner and ask something, for example whether the clinic is real or what the visit costs."],
  ["Open it on your phone", "The reviews stack, the header shrinks to the logo and a Book button, and the calendar sits near the top of the booking page."],
];

const shots: [string, string][] = [
  ["/work/demos/lumiere-book-800.webp", "The booking page with the live GoHighLevel calendar, shown in Pacific time"],
  ["/work/demos/lumiere-slider-800.webp", "One drag slider for every treatment, labelled as a simulated result"],
  ["/work/demos/lumiere-physician-800.webp", "The physician section, labelled as fictional"],
  ["/work/demos/lumiere-faq-800.webp", "Six questions before the visit, including whether the clinic is real"],
];

export default function LumiereProject() {
  return (
    <main className={`pj ${anton.variable} ${host.variable} ${plex.variable}`}>
      <nav className="pj-nav">
        <Link href="/">John Boy Roxas</Link>
      </nav>

      <header className="pj-hero">
        <p className="pj-kicker">Aesthetic clinics · Website and booking on GoHighLevel</p>
        <h1>A clinic website with one job: book a private assessment</h1>
        <p className="pj-lead">
          Lumiere Aesthetic is a San Diego clinic that doesn&apos;t exist, with a website that works. It&apos;s built in GoHighLevel around one action. Every button leads to the booking page, where a visitor picks a time on a live calendar and fills in a short health form. An AI front desk in the chat answers questions before they book.
        </p>
        <div className="pj-cta">
          <a className="pj-btn" href={`${SITE}/home`} target="_blank" rel="noopener noreferrer">
            Open the site
          </a>
          <a className="pj-btn pj-btn-quiet" href={`${SITE}/bookappointment`} target="_blank" rel="noopener noreferrer">
            Book a test assessment
          </a>
          <a className="pj-btn pj-btn-quiet" href={BUILD_VIDEO} target="_blank" rel="noopener noreferrer">
            Watch how I built it
          </a>
        </div>
        <p className="pj-fine">Made-up clinic: no real appointment, and no one will attend. Email only, no texts. The photos are licensed stock, and I designed the logo and the layout.</p>
        <Image className="pj-shot" src="/work/demos/lumiere-home-1440.webp" alt="Lumiere Aesthetic home page with the demo line at the top and the Book a Private Assessment button" width={1440} height={900} sizes="(max-width: 1100px) 92vw, 1040px" priority />
      </header>

      <section className="pj-sec">
        <h2>What was built</h2>
        <p className="pj-measure">A two-page website in GoHighLevel&apos;s own builder, with custom code where the builder couldn&apos;t reach the design. The calendar, the intake form and the chat agent run in GoHighLevel too.</p>
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
        <p className="pj-measure">Four things you can check yourself in a few minutes.</p>
        <div className="pj-grid">
          {test.map(([t, b]) => (
            <div key={t} className="pj-card">
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
        <div className="pj-cta">
          <a className="pj-btn pj-btn-quiet" href={`${SITE}/bookappointment`} target="_blank" rel="noopener noreferrer">
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
          The website, the calendar, the intake form and the chat agent are real and run in GoHighLevel. The clinic, Dr. Elena Marlowe, the San Diego address and the reviews are made up, and the site says so at the top, under the physician, above the reviews and in the footer. The photos are licensed stock, including the before and after pairs, which are labelled as simulated results. The AI front desk works in the chat only. Nothing on this demo sends a text.
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
