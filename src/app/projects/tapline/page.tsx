import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "../project.css";

// The "Know more" page for Tapline. With no client testimonials yet, the live demo
// and how it was tested are the proof, so every claim here can be checked in the demo.
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

const flow = [
  {
    n: "1",
    title: "The tenant reports it from a text-message link",
    body: "No app and no login. The form asks what's wrong, how to get in, and whether there are pets. A photo is optional.",
    img: `${SHOT}/report.png`,
    w: 1440,
    h: 900,
    alt: "The tenant's report form open over the repairs board",
  },
  {
    n: "2",
    title: "AI reads the report and the property's history",
    body: "It suggests the trade and urgency, spots an earlier repair at the same address, and drafts the reply. Nothing routine goes out until a person confirms it.",
    img: `${SHOT}/triage.png`,
    w: 1440,
    h: 900,
    alt: "The job drawer showing the AI's suggested trade, urgency, emergency steps and reply",
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
    w: 1440,
    h: 900,
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

const tests = [
  ["121", "emergency and everyday reports run through the keyword rules"],
  ["168", "hours of the week the sample data is checked at, against the product's own rules"],
  ["62", "steps through the live system, end to end, in every order that matters"],
  ["8", "specialist review roles, each run as a separate AI reviewer with no knowledge of the build"],
];

export default function TaplineProject() {
  return (
    <main className="pj">
      <nav className="pj-nav">
        <Link href="/">John Boy Roxas</Link>
      </nav>

      <header className="pj-hero">
        <p className="pj-kicker">Property management · Australia and UK</p>
        <h1>A repairs desk that keeps moving after the office closes</h1>
        <p className="pj-lead">
          Tapline takes a repair from the tenant&apos;s report to the bill: triage, after-hours dispatch, owner approval, contractor visit and invoice check, all on one board. I built it as a live demo with a fictional agency, so you can try it instead of reading about it.
        </p>
        <div className="pj-cta">
          <a className="pj-btn" href="/demo/tapline?tour=manager">
            Take the 2-minute guided tour
          </a>
          <a className="pj-btn pj-btn-quiet" href="/demo/tapline">
            Open the live demo
          </a>
        </div>
        <p className="pj-fine">No sign-up. Fictional data. Your changes are private to you and reset after 48 hours.</p>
        <Image className="pj-shot" src={`${SHOT}/board.png`} alt="The Tapline repairs board with jobs in columns from New to Bill entered" width={1440} height={900} sizes="(max-width: 1100px) 92vw, 1040px" priority />
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
            <li key={f.n} className={f.phone ? "pj-step pj-step-phone" : "pj-step"}>
              <div className="pj-step-text">
                <span className="pj-n" aria-hidden="true">
                  {f.n}
                </span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
              <Image className="pj-shot" src={f.img} alt={f.alt} width={f.w} height={f.h} sizes={f.phone ? "280px" : "(max-width: 1100px) 92vw, 640px"} />
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
        <h2>How it was tested</h2>
        <p className="pj-measure">I don&apos;t have a client quote for this one yet, because it&apos;s a demo I built to show how I work. So here is the testing behind it, which you can check against the demo itself.</p>
        <dl className="pj-tests">
          {tests.map(([n, t]) => (
            <div key={t}>
              <dt>{n}</dt>
              <dd>{t}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pj-sec">
        <h2>What&apos;s simulated</h2>
        <p className="pj-measure">The agency, the people and the jobs are fictional. Text messages appear on the phone pages rather than being sent. Bills are marked as entered in PropertyMe or Alto but aren&apos;t connected to either. A real build connects to your own systems and your own rules.</p>
      </section>

      <section className="pj-end">
        <h2>Could your agency use something like this?</h2>
        <p>Tell me how repairs run at your agency today. I&apos;ll tell you what I&apos;d build first and what I wouldn&apos;t.</p>
        <div className="pj-cta">
          <a className="pj-btn" href={MAIL}>
            Email John Boy
          </a>
          <a className="pj-btn pj-btn-quiet" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
            Message on WhatsApp
          </a>
          <a className="pj-btn pj-btn-quiet" href="/demo/tapline?tour=owner">
            Tour for agency owners
          </a>
        </div>
      </section>
    </main>
  );
}
