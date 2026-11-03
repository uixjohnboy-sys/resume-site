import type { Metadata } from "next";
import Image from "next/image";
import { availability, certifications, education, jobs, person, projects, skills, summary } from "@/lib/resume";
import { archivo } from "../fonts";
import "./v5.css";

// Portfolio v5: the resume you can click. It reads as a clean black and white resume, and every project line opens the
// live product. The downloadable PDF is printed from this same page (scripts/make-resume-pdf.mjs), so the two
// always match. Prototype for JB to compare with /v4: noindex and unlinked until he picks.

export const metadata: Metadata = {
  title: "John Boy Roxas · GoHighLevel specialist · Resume",
  description: "The resume you can click. HighLevel-certified GoHighLevel specialist in the Philippines, available to Australian and UK agencies and small businesses.",
  robots: { index: false, follow: false },
};

const mail = `mailto:${person.email}?subject=${encodeURIComponent("Enquiry from your resume")}&body=${encodeURIComponent("Hi John Boy,\n\n")}`;

export default function V5() {
  return (
    <div className={`r ${archivo.variable}`}>
      <main className="r-sheet">
        <header className="r-head">
          <Image className="r-photo" src={person.photo} alt="John Boy Roxas" width={176} height={176} priority />
          <div className="r-id">
            <h1>{person.name}</h1>
            <p className="r-title">{person.title}</p>
            <p className="r-contact">
              <span>{person.location}</span>
              <a href={mail}>{person.email}</a>
              <a href={person.whatsapp}>WhatsApp {person.phone}</a>
              <a href={person.linkedin}>LinkedIn</a>
              <a href={person.onlinejobs}>OnlineJobs.ph</a>
              <a className="r-print-only" href={person.site}>
                www.johnboydesign.com
              </a>
            </p>
          </div>
          <div className="r-actions r-no-print">
            <a className="r-btn" href={person.book}>
              Book a call
            </a>
            <a className="r-btn r-quiet" href={person.pdf} download>
              Download PDF
            </a>
          </div>
        </header>

        <section className="r-sec">
          <h2>Summary</h2>
          <div>
            <p>{summary}</p>
            <p className="r-muted">{availability}</p>
          </div>
        </section>

        <section className="r-sec" aria-labelledby="r-live">
          <h2 id="r-live">Live projects</h2>
          <div>
            <p className="r-hook r-no-print">This resume runs. Everything below is live, so press a link and use it yourself.</p>
            {projects.map((p) => (
              <article key={p.name} className="r-project">
                <div>
                  <h3>{p.name}</h3>
                  <p className="r-kind">{p.kind}</p>
                  <ul>
                    {p.points.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  {p.stats && <p className="r-stats">{p.stats}</p>}
                  <p className="r-links">
                    {p.links.map((l, i) => (
                      <a key={l.href} className={i === 0 ? "r-try" : undefined} href={l.href}>
                        {l.label}
                        {i === 0 && <span aria-hidden="true"> →</span>}
                      </a>
                    ))}
                  </p>
                </div>
                <a className="r-thumb r-no-print" href={p.links[0].href} aria-label={`${p.links[0].label}: ${p.name}`}>
                  <Image src={p.img} alt={p.imgAlt} width={720} height={450} sizes="(max-width: 760px) 92vw, 220px" />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="r-sec">
          <h2>Experience</h2>
          <div>
            {jobs.map((j) => (
              <article key={`${j.org}${j.when}`} className="r-job">
                <div className="r-job-head">
                  <h3>
                    {j.role}, <span>{j.org}</span>
                  </h3>
                  <p className="r-when">{j.when}</p>
                </div>
                <p className="r-kind">{j.where}</p>
                <ul>
                  {j.points.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="r-sec r-no-print">
          <h2>How I work</h2>
          <dl className="r-skills">
            <div>
              <dt>Rate</dt>
              <dd>From AUD 15/hr, a monthly block of hours, or a fixed quote for a defined build. Agreed before I start and invoiced monthly in AUD.</dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>Part-time, 4 hours a day, starting at 8 AM in your timezone. I am in the Philippines (UTC+8).</dd>
            </div>
            <div>
              <dt>Your data</dt>
              <dd>My own login with only the access the job needs, no shared passwords, and test contacts for testing. I sign your NDA or data processing agreement before you share anything, and hand access back when the work ends.</dd>
            </div>
            <div>
              <dt>If something breaks</dt>
              <dd>I fix my own work first, then tell you what happened and what I changed so it does not repeat.</dd>
            </div>
          </dl>
        </section>

        <section className="r-sec">
          <h2>Skills</h2>
          <dl className="r-skills">
            {skills.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="r-sec">
          <h2>Certified</h2>
          <p>HighLevel: {certifications.join(" · ")}</p>
        </section>

        <section className="r-sec">
          <h2>Education</h2>
          <div className="r-job-head">
            <p>
              {education.degree}, {education.place}
            </p>
            <p className="r-when">{education.when}</p>
          </div>
        </section>

        <footer className="r-end r-no-print">
          <p>Tell me what you need built or fixed. I reply to every email within one business day.</p>
          <div className="r-actions">
            <a className="r-btn" href={person.book}>
              Book a call
            </a>
            <a className="r-btn r-quiet" href={mail}>
              Email me
            </a>
            <a className="r-btn r-quiet" href={person.pdf} download>
              Download PDF
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
