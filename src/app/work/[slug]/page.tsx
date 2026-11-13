import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { anton, host, plex } from "../../fonts";
import Reveal from "@/components/v4/Reveal";
import { work, workBySlug } from "@/lib/work";
import "../../v4/v4.css";
import "../work.css";

// One kind of work: what it usually covers, the proof (client work first, demos labelled), and how a job starts. Each
// page has its own link so an application can point at the one that fits the job post. Preview: noindex until JB signs
// off (spec C:\PortfolioProjects\work-cards\SPEC.md).

export const dynamicParams = false;
export function generateStaticParams() {
  return work.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const w = workBySlug((await params).slug);
  if (!w) return {};
  return {
    title: `${w.title} · John Boy Roxas`,
    description: w.promise,
    robots: { index: false, follow: false },
  };
}

const BOOK = "/book";
const BRIEF_MAIL =
  "mailto:uix.johnboy@gmail.com?subject=" +
  encodeURIComponent("My brief") +
  "&body=" +
  encodeURIComponent("Hi John Boy,\n\nMy business:\n\nThe job I want off my plate:\n\nHow we handle it today:\n\n");

// The same three steps the booking page already promises, word for word in substance.
const steps = [
  ["We talk", "15 minutes on what you need and how you handle it today, and whether I am the right fit."],
  ["You get a written scope", "Scope, timeline and price, agreed before I start."],
  ["I build", "With regular updates, tested before handover and documented so your team can run it."],
];

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const w = workBySlug((await params).slug);
  if (!w) notFound();
  const others = work.filter((x) => x.slug !== w.slug);

  return (
    <div className={`v4 ${anton.variable} ${host.variable} ${plex.variable}`}>
      <Reveal />
      <header className="v4-nav">
        <div className="v4-nav-in">
          <Link className="v4-mark" href="/v6">
            <b>John Boy Roxas</b>
            <span>Systems and automation</span>
          </Link>
          <nav className="v4-links" aria-label="Sections">
            <Link href="/v6#work">All work</Link>
            <a href="/John-Boy-Roxas-Resume.pdf">CV</a>
          </nav>
          <a className="v4-btn v4-btn-dark v4-nav-cta" href={BOOK}>
            Book a 15-min call
          </a>
        </div>
      </header>

      <main className="wk-page">
        <section className="v4-in wk-head">
          <p className="v4-kicker">What I build · {w.n}</p>
          <h1>{w.title.replace(/-/g, "‑")}</h1>
          <p className="v4-lede">{w.promise}</p>
          {w.live && (
            <div className="v4-ctas">
              <a className="v4-btn v4-btn-dark" href={w.live.href}>
                {w.live.label}
              </a>
            </div>
          )}
        </section>

        <section className="v4-in wk-body">
          <div className="wk-covers">
            <h2 className="wk-h">What this usually covers</h2>
            <ul>
              {w.covers.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="wk-list">
            <h2 className="wk-h">The work</h2>
            <ol>
              {w.proof.map((p) => (
                <li key={p.name + p.kind} data-rv>
                  <p className="v4-case-tag">
                    {p.kind} · {p.name}
                  </p>
                  <p>{p.line}</p>
                  {p.href && (
                    <a href={p.href} className="wk-live">
                      {p.cta ?? "Open"}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {w.shot && (
          <section className="v4-in wk-shot" data-rv>
            <Image src={w.shot.src} alt={w.shot.alt} width={w.shot.w} height={w.shot.h} sizes="(max-width: 860px) 100vw, 1176px" />
          </section>
        )}

        <section className="v4-in wk-steps">
          <h2 className="wk-h">How a job starts</h2>
          <ol>
            {steps.map(([t, d], i) => (
              <li key={t}>
                <span className="wk-n" aria-hidden="true">
                  0{i + 1}
                </span>
                <b>{t}</b>
                <p>{d}</p>
              </li>
            ))}
          </ol>
          <div className="v4-ctas">
            <a className="v4-btn v4-btn-dark" href={BOOK}>
              Book a 15-min call
            </a>
            <a className="v4-btn v4-btn-line" href={BRIEF_MAIL}>
              Send me your brief
            </a>
          </div>
        </section>

        <section className="v4-in wk-others">
          <h2 className="wk-h">Other work</h2>
          <ul>
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/work/${o.slug}`}>
                  <span className="wk-n" aria-hidden="true">
                    {o.n}
                  </span>
                  {o.title.replace(/-/g, "‑")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
