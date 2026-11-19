import type { Metadata } from "next";
import { anton, host, plex } from "../fonts";
import { certifications, contact, cvAvailability, cvJobs, cvProjects, cvSummary, cvTitle, education, person, skills, type Role } from "@/lib/cv";
import "./cv.css";

// The printed CV, black and white in the brand fonts. scripts/make-resume-pdf.mjs prints this page to the PDF that
// job applications attach. Plain section names an ATS expects; every link is also printed as text.

export const metadata: Metadata = {
  title: "John Boy Roxas · GoHighLevel Specialist · CV",
  description: "CV of John Boy Roxas, HighLevel-certified GoHighLevel specialist in the Philippines.",
  robots: { index: false, follow: false },
};

function RoleBlock({ r, sub }: { r: Role; sub?: boolean }) {
  return (
    <article className={sub ? "cv-role cv-sub" : "cv-role"}>
      <div className="cv-role-head">
        <h3>
          <b>{r.role}</b>, {r.org}
        </h3>
        <p className="cv-when">{r.when}</p>
      </div>
      {r.where && <p className="cv-where">{r.where}</p>}
      <ul>
        {r.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </article>
  );
}

export default function CV() {
  return (
    <div className={`cv ${anton.variable} ${host.variable} ${plex.variable}`}>
      <main className="cv-sheet">
        <header className="cv-head">
          <h1>{person.name}</h1>
          <p className="cv-title">{cvTitle}</p>
          <p className="cv-contact">
            {contact.map((c) =>
              c.href ? (
                <a key={c.label} href={c.href}>
                  {c.label}
                </a>
              ) : (
                <span key={c.label}>{c.label}</span>
              ),
            )}
          </p>
        </header>

        <section className="cv-sec">
          <h2>Summary</h2>
          <div>
            <p>{cvSummary}</p>
            <p className="cv-muted">{cvAvailability}</p>
          </div>
        </section>

        <section className="cv-sec">
          <h2>Certifications</h2>
          <p>HighLevel: {certifications.join(" · ")}</p>
        </section>

        <section className="cv-sec">
          <h2>Experience</h2>
          <div>
            {cvJobs.map((j) => (
              <div key={j.org + j.when} className="cv-job">
                <RoleBlock r={j} />
                {j.clients?.map((c) => (
                  <RoleBlock key={c.org} r={c} sub />
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="cv-sec">
          <h2>Projects</h2>
          <div>
            {cvProjects.map((p) => (
              <article key={p.name} className="cv-role">
                <div className="cv-role-head">
                  <h3>
                    <b>{p.name}</b>
                  </h3>
                </div>
                <p className="cv-where">{p.kind}</p>
                <ul>
                  {p.points.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                {p.stats && <p className="cv-stats">{p.stats}</p>}
                <p className="cv-link">
                  {p.cta}:{" "}
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href}>
                      {l.label}
                    </a>
                  ))}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="cv-sec">
          <h2>Skills</h2>
          <dl className="cv-skills">
            {skills.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="cv-sec">
          <h2>Education</h2>
          <div className="cv-role-head">
            <h3>
              <b>{education.degree}</b>, {education.place}
            </h3>
            <p className="cv-when">{education.when}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
