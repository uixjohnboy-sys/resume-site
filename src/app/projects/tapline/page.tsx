import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "../project.css";

// The "Know more" page for Tapline. With no client testimonials yet, the proof is what a
// visitor can try for themselves and what testing really caught.
// Reviewed at Studio gate G5. Noindex until the portfolio launch.

export const metadata: Metadata = {
  title: "Tapline: a repairs desk for property managers | John Boy Roxas",
  description: "A live demo I built for AU property managers and UK letting agents: tenant reports, AI triage, after-hours dispatch, owner approvals and contractor jobs on one board.",
  robots: { index: false, follow: false },
};

const EMAIL = "uix.johnboy@gmail.com";
const MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent("Tapline")}&body=${encodeURIComponent("Hi John Boy, I saw Tapline. Our agency:\n\n")}`;
const WHATSAPP = `https://wa.me/639773659548?text=${encodeURIComponent("Hi John Boy, I saw Tapline.")}`;
const SHOT = "/projects/tapline";

type Step = { n: string; title: string; body: string; img: string; w: number; h: number; alt: string; phone?: boolean; crop?: boolean; wide?: boolean };

const flow: Step[] = [
  {
    n: "1",
    title: "The tenant reports it from a text-message link",
    body: "No app and no login. The form asks what's wrong, how to get in, and whether there are pets. A photo is optional.",
    img: `${SHOT}/report.png`,
    w: 800,
    h: 1560,
    alt: "The tenant's report form with the problem, access, photo and a send button",
    phone: true,
  },
  {
    n: "2",
    title: "AI reads the report and the property's history",
    body: "It suggests the trade and urgency, spots an earlier repair at the same address, and drafts the reply. Nothing routine goes out until a person confirms it.",
    img: `${SHOT}/triage.png`,
    w: 1024,
    h: 1654,
    alt: "The triage panel showing the AI's suggested trade, urgency, emergency steps and reply",
    crop: true,
  },
  {
    n: "3",
    title: "After hours, the urgent ones don't wait for 8:30",
    body: "The tenant gets fixed, checked safety steps and the on-call contractor is paged. If the AI calls it routine but a report contains urgent words, the on-call manager is asked to check instead.",
    img: `${SHOT}/tenant.png`,
    w: 780,
    h: 1768,
    alt: "The tenant's phone showing safety steps and the agency's message",
    phone: true,
  },
  {
    n: "4",
    title: "Owners approve in one tap, within their own limit",
    body: "Routine work goes out capped at each owner's limit. A quote above it reaches the owner's phone with the reason, and a decline comes back to the manager to call them.",
    img: `${SHOT}/owner.png`,
    w: 780,
    h: 1688,
    alt: "The owner's phone showing a quote, the reason and an approve button",
    phone: true,
  },
  {
    n: "5",
    title: "Contractors accept, complete and invoice from their phone",
    body: "Visit times respect the tenant's notice period. An invoice more than 10% over what was approved is held for a manager instead of being paid.",
    img: `${SHOT}/tradie.png`,
    w: 780,
    h: 1688,
    alt: "The contractor's phone showing the job, access notes and visit times",
    phone: true,
  },
  {
    n: "6",
    title: "Compliance and owner statements stay current",
    body: "Each check is listed per property and marked as law or agency policy. Each owner's month fits on one printable page.",
    img: `${SHOT}/compliance.png`,
    w: 2880,
    h: 1240,
    wide: true,
    alt: "The compliance view listing checks per property with due dates",
  },
];

const trust = [
  ["A person decides", "The AI suggests the trade, urgency and reply. A manager can change all three before anything routine is sent."],
  ["Emergency wording is fixed", "Gas, fire, flood and break-in steps are checked text with verified phone numbers. The AI never writes them."],
  ["The AI can't promise", "A reply that gives instructions, promises a time, quotes a price or adds a link is replaced by a fixed reply."],
  ["It still works without the AI", "If the AI is down or over its daily limit, keyword rules take over and the screen says so."],
];

const regions = [
  ["Words", "Owner, tradie, work order, GST, PropertyMe", "Landlord, contractor, works order, VAT, Alto"],
  ["Entry notice for routine visits", "2 days in NSW, unless the tenant agrees", "24 hours in England, unless the tenant agrees"],
  ["Gas work", "Licensed gasfitter", "Gas Safe engineer, including boilers"],
  ["Common property", "Referred to the strata manager", "Referred to the block's managing agent"],
  ["Checks tracked", "Smoke alarms, pool barriers, gas services", "Gas Safety certificates, EICRs, smoke and CO alarms"],
  ["Emergency numbers", "000, Jemena 131 909, Police 131 444", "999, gas emergency 0800 111 999, Police 101"],
];

const tryIt = [
  ["Report a leak at 9:47 pm", "See who gets contacted, what the tenant is told, and what waits for a person."],
  ["Accept the job on your own phone", "Scan the code in the job and press accept. The board moves by itself."],
  ["Try to break the webhook", "On the Integrations tab, change a signed request, replay it, or take the receiver down. Nothing is lost or applied twice."],
  ["Report something small", "Replace the sample report with a wardrobe door off its track. It stays routine: nobody gets paged and no emergency text goes out."],
  ["Switch to Manchester", "Watch the trades, words, notice periods and emergency numbers change."],
];

const caught = [
  "A report about a pilot flame told the tenant to call 999 and paged a contractor. An everyday word now can't do that unless the AI sees the same danger.",
  "A job the contractor finished overnight still told the tenant \"we're arranging a tradie\" the next morning. Replies now follow where the job is.",
  "Work on a strata building's common property was going to the lot owner to approve. It now goes to the strata manager.",
  "A sample smoke alarm visit was booked after its legal due date. The sample data is now checked against the product's own rules, at every hour of the week.",
];

export default function TaplineProject() {
  return (
    <main className="pj">
      <nav className="pj-nav">
        <Link href="/">John Boy Roxas</Link>
      </nav>

      <header className="pj-hero">
        <p className="pj-kicker">Property managers in Australia · Letting agents in the UK</p>
        <h1>A repairs desk that keeps moving after the office closes</h1>
        <p className="pj-lead">
          Tapline takes a repair from the tenant&apos;s report to the bill: triage, after-hours dispatch, owner approval, contractor visit and invoice check, all on one board. I built it as a live demo with a fictional agency, so you can try it instead of reading about it.
        </p>
        <div className="pj-cta">
          <a className="pj-btn" href="/demo/tapline?tour=manager">
            Take the 2-minute guided tour
          </a>
          <a className="pj-btn pj-btn-quiet" href="/demo/tapline?tour=manager&region=UK">
            UK tour for letting agents
          </a>
          <a className="pj-btn pj-btn-quiet" href="/demo/tapline">
            Open the live demo
          </a>
        </div>
        <p className="pj-fine">No sign-up. Fictional data. Your changes are private to you and reset after 48 hours.</p>
        <Image className="pj-shot" src={`${SHOT}/board.png`} alt="The Tapline repairs board with jobs in columns from New to Bill entered" width={2880} height={1800} sizes="(max-width: 1100px) 92vw, 1040px" priority />
      </header>

      <section className="pj-sec">
        <h2>The problem</h2>
        <p className="pj-measure">
          A tenant emails about water coming through the ceiling at 9:47 pm. The property manager sees it at 8:30 the next morning, rings three plumbers, emails the owner for approval, then waits and chases. The invoice disappears into an inbox. Nobody can see which jobs are overdue, which owner is sitting on an approval, or which property keeps having the same fault.
        </p>
      </section>

      <section className="pj-sec">
        <h2>How one repair moves</h2>
        <ol className="pj-flow">
          {flow.map((f) => (
            <li key={f.n} className={f.phone ? "pj-step pj-step-phone" : f.crop ? "pj-step pj-step-crop" : f.wide ? "pj-step pj-step-wide" : "pj-step"}>
              <div className="pj-step-text">
                <span className="pj-n" aria-hidden="true">
                  {f.n}
                </span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
              <Image className="pj-shot" src={f.img} alt={f.alt} width={f.w} height={f.h} sizes={f.phone ? "280px" : f.crop ? "(max-width: 860px) 92vw, 460px" : "(max-width: 1100px) 92vw, 1040px"} />
            </li>
          ))}
        </ol>
      </section>

      <section className="pj-sec">
        <h2>Where the AI stops and people start</h2>
        <div className="pj-grid">
          {trust.map(([t, b]) => (
            <div key={t} className="pj-card">
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pj-sec">
        <h2>Built for each market, not translated</h2>
        <p className="pj-measure">Switch the demo between a Sydney agency and a Manchester agency and more than the currency changes.</p>
        <div className="pj-table-wrap" tabIndex={0} role="region" aria-label="Differences between the Australian and UK versions">
          <table className="pj-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="pj-sr">What changes</span>
                </th>
                <th scope="col">Sydney</th>
                <th scope="col">Manchester</th>
              </tr>
            </thead>
            <tbody>
              {regions.map(([what, au, uk]) => (
                <tr key={what}>
                  <th scope="row">{what}</th>
                  <td>{au}</td>
                  <td>{uk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="pj-fine">General information for a demo, not legal advice.</p>
      </section>

      <section className="pj-sec">
        <h2>Don&apos;t take my word for it</h2>
        <p className="pj-measure">I don&apos;t have a client testimonial for this one, because it&apos;s a demo I built to show how I work. So here are four things you can check yourself in a few minutes.</p>
        <div className="pj-grid">
          {tryIt.map(([t, b]) => (
            <div key={t} className="pj-card">
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
        <div className="pj-cta">
          <a className="pj-btn pj-btn-quiet" href="/demo/tapline">
            Try them in the demo
          </a>
        </div>
      </section>

      <section className="pj-sec">
        <h2>What testing caught</h2>
        <p className="pj-measure">I build with AI coding tools and I check the results. Automated tests run through the live system, and eight separate AI reviewers, each with no hand in the build, went through it as a property manager, a designer, a security engineer and so on. Some of what they found:</p>
        <ul className="pj-list">
          {caught.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      <section className="pj-sec">
        <h2>What&apos;s real and what&apos;s simulated</h2>
        <p className="pj-measure">The Integrations tab is real: signed requests, duplicate protection and a failed-event log with retries, through a public endpoint. The agency, the people and the jobs are fictional. Text messages appear on the phone pages rather than being sent. Bills are marked as entered in PropertyMe or Alto but aren&apos;t connected to either. A real build connects to your own systems and your own rules.</p>
      </section>

      <section className="pj-sec pj-who">
        <Image src="/v3/jb-hero.webp" alt="John Boy Roxas" width={160} height={160} />
        <div>
          <h2>Who built this</h2>
          <p className="pj-measure">
            I&apos;m John Boy Roxas, a HighLevel-certified GoHighLevel specialist in the Philippines (UTC+8). I&apos;ve spent five years building workflows, funnels and client portals for marketing agencies and small businesses. Part-time, 4 hours a day, starting at 8 AM in your timezone. From AUD 15/hr.
          </p>
        </div>
      </section>

      <section className="pj-end">
        <h2>Could your agency use something like this?</h2>
        <p>Tell me how repairs run at your agency today. I&apos;ll tell you what I&apos;d build first and what I wouldn&apos;t.</p>
        <div className="pj-cta">
          <a className="pj-btn" href="/book">
            Book a call
          </a>
          <a className="pj-btn pj-btn-quiet" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
            Message on WhatsApp
          </a>
          <a className="pj-btn pj-btn-quiet" href="/demo/tapline?tour=owner">
            Tour for agency owners
          </a>
          <a className="pj-btn pj-btn-quiet" href="/demo/tapline?tour=owner&region=UK">
            UK version
          </a>
        </div>
        <p className="pj-end-mail">
          Or email <a href={MAIL}>{EMAIL}</a>
        </p>
      </section>
    </main>
  );
}
