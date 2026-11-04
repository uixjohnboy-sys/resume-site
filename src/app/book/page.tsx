import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { archivo } from "../fonts";
import "../v5/v5.css";

// Booking page, in the same black and white as the resume at /v5. The calendar comes first, because that is what the
// visitor came for; the answers people usually want sit underneath it. The calendar itself is a GoHighLevel widget.

export const metadata: Metadata = {
  title: "Book a call · John Boy Roxas",
  description: "Book a free 15-minute call with John Boy Roxas, a HighLevel-certified GoHighLevel specialist in the Philippines.",
};

const nextSteps = [
  ["We talk", "We go through what you need and your current setup, and whether I am the right fit."],
  ["You get a written scope", "A clear scope, timeline and price for the work, agreed before I start."],
  ["I build", "With regular updates, tested before handover and documented so your team can run it."],
];

const faqs = [
  ["What if I'm not sure GoHighLevel is right for my business?", "That is what the call is for. I will tell you honestly if it is the right tool, with no pressure either way."],
  ["Do you sign NDAs?", "Yes. I am happy to sign one before you share anything about your business."],
  ["What if the work takes longer than expected?", "I scope the work upfront and tell you early if a timeline shifts."],
  ["Can I hire you for a one-off task?", "Yes. Hourly work suits smaller jobs, and a monthly block of hours suits ongoing support."],
];

export default function BookPage() {
  return (
    <div className={`r ${archivo.variable}`}>
      <main className="r-sheet">
        <header className="r-book-head">
          <Link className="r-book-back" href="/">
            John Boy Roxas
          </Link>
          <h1>Book a call</h1>
          <p>A free 15-minute call. Pick a time below and tell me a little about what you need.</p>
        </header>

        <div className="r-cal">
          <iframe src="https://link.funnelgenie.io/widget/booking/LOYqIv9mae8XbBhBarr5" scrolling="yes" id="LOYqIv9mae8XbBhBarr5_1" title="Book a call with John Boy Roxas" />
        </div>

        <section className="r-sec">
          <h2>After you book</h2>
          <dl className="r-skills">
            {nextSteps.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="r-sec">
          <h2>Hours and rate</h2>
          <dl className="r-skills">
            <div>
              <dt>Hours</dt>
              <dd>Part-time, 4 hours a day, starting at 8 AM in your timezone. If a launch or an urgent job needs me outside that, say so and we will work it out.</dd>
            </div>
            <div>
              <dt>Rate</dt>
              <dd>From AUD 15/hr, a monthly block of hours, or a fixed quote for a defined build. Agreed before I start and billed fortnightly.</dd>
            </div>
          </dl>
        </section>

        <section className="r-sec">
          <h2>Questions</h2>
          <dl className="r-skills">
            {faqs.map(([q, a]) => (
              <div key={q}>
                <dt>{q}</dt>
                <dd>{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="r-sec">
          <h2>See the work</h2>
          <p className="r-links">
            <Link href="/projects/tapline">Tapline, a repairs desk you can try</Link>
            <Link href="/coach-os">Coach OS case study</Link>
            <Link href="/v5">Resume</Link>
            <Link href="/">Home</Link>
          </p>
        </section>
      </main>

      <Script src="https://link.funnelgenie.io/js/form_embed.js" strategy="afterInteractive" />
    </div>
  );
}
