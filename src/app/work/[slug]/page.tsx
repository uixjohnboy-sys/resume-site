import type { Metadata } from "next";
import MailLink from "@/components/MailLink";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { anton, host, plex } from "../../fonts";
import Reveal from "@/components/v4/Reveal";
import DemoFlow from "@/components/work/DemoFlow";
import { work, workBySlug, SHOW_SOON } from "@/lib/work";
import "../../v4/v4.css";
import "../work.css";
import "../../home-dark.css";
import "../demo-flow.css";

// One kind of work: what it usually covers, the proof (client work first, demos labelled), and how a job starts. Each
// page has its own link so an application can point at the one that fits the job post. Public and indexed since
// 2026-11-15, when the work index moved to the homepage (spec C:\PortfolioProjects\work-cards\SPEC.md).

export const dynamicParams = false;
export function generateStaticParams() {
  return work.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const w = workBySlug((await params).slug);
  if (!w) return {};
  const title = w.seoTitle;
  const description = w.seoDescription;
  const url = `/work/${w.slug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "John Boy Roxas", type: "website" },
    twitter: { card: "summary_large_image", title, description },
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
  // Demos with a screenshot go in the cover-flow (JB 2026-11-28); card 1 is this kind of work, art from the old home cards.
  const demos = w.proof.filter((p) => p.card && (SHOW_SOON || !p.soon));
  // The list below keeps what the flow does not show (client work, guides, videos), so no line appears twice (G3 M3).
  const rest = w.proof.filter((p) => !p.card && (SHOW_SOON || !p.soon));

  return (
    <div className={`v4 v4-dark ${anton.variable} ${host.variable} ${plex.variable}`}>
      <Reveal />
      <header className="v4-nav">
        <div className="v4-nav-in">
          <Link className="v4-mark" href="/">
            <b>John Boy Roxas</b>
            <span>Systems and automation</span>
          </Link>
          <nav className="v4-links" aria-label="Sections">
            <Link href="/#work">All work</Link>
            <a href="/John-Boy-Roxas-Resume.pdf">CV</a>
          </nav>
          <a className="v4-btn v4-btn-dark v4-nav-cta" href={BOOK}>
            Book a 15-min call
          </a>
        </div>
      </header>

      <main className="wk-page">
        <section className="v4-in wk-head wk-center">
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

        {demos.length > 0 && <DemoFlow n={w.n} title={w.title} art={`/home/cards/${w.slug}.webp`} demos={demos} />}

        <section className="v4-in wk-more">
          <p className="df-mono">More on this kind of work</p>
          <h2>{rest.some((p) => p.kind === "Client work") ? "What it covers, and the client work behind it" : "What it usually covers"}</h2>
        </section>

        <section className={`v4-in wk-body${rest.length ? "" : " wk-body-one"}`}>
          <div className="wk-covers">
            <h2 className="wk-h">What this usually covers</h2>
            <ul>
              {w.covers.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          {rest.length > 0 && (
          <div className="wk-list">
            <h2 className="wk-h">{demos.length ? "More of the work" : "The work"}</h2>
            <ol>
              {rest.map((p) => (
                <li key={p.name + p.kind} data-rv>
                  <p className="v4-case-tag">
                    {p.kind} · {p.name}
                    {p.soon && <span className="wk-soon-tag">Soon</span>}
                  </p>
                  <p>{p.line}</p>
                  {p.href && !p.soon && (
                    <a
                      href={p.href}
                      className="wk-live"
                      {...(p.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
                    >
                      {p.cta ?? "Open"}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </div>
          )}
        </section>

        {w.shot && demos.length === 0 && (
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

        <section className="v4-in wk-end">
          <h2>Want this for your business?</h2>
          <p>I build it for your business, with your services and your wording.</p>
          <div className="v4-ctas">
            <a className="v4-btn v4-btn-dark" href={BOOK}>
              Book a 15-min call
            </a>
            <MailLink className="v4-btn v4-btn-line" href={BRIEF_MAIL} title="Send me your brief">
              Send me your brief
            </MailLink>
          </div>
        </section>
      </main>
    </div>
  );
}
