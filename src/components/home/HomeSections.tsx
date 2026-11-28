import Image from "next/image";
import Link from "next/link";
import { work, type Proof, type Work } from "@/lib/work";
import AskTile from "./AskTile";
import SwipeRow from "./SwipeRow";
import { liveDemoCount } from "./ProblemGrid";

// Homepage, section by section (JB 2026-11-28): each kind of work gets its own section, headed by the category and the
// buyer's problem, with a row of cards to swipe: my demos with their screenshots first, then the client work as written
// in work.ts, then a card to the category page where the full explanation is. Planned (soon) entries are not shown.

const PROBLEM: Record<string, string> = {
  "lead-follow-up": "New leads go cold before anyone replies",
  "ai-agents": "Messages pile up after hours",
  funnels: "Ads get clicks, the page gets no enquiries",
  integrations: "Your tools don't talk to each other",
  "fixes-and-audits": "A workflow does something it shouldn't",
  "agency-snapshots": "Every new client account takes days to set up",
  "custom-apps": "GoHighLevel can't do what you need",
};

const external = (h: string) => /^https?:/.test(h);

function cardLink(w: Work, p: Proof): { href: string; cta: string } {
  if (p.detail || !p.href) return { href: `/work/${w.slug}`, cta: p.detail ? "See what was built →" : "Read more →" };
  return { href: p.href, cta: `${p.cta ?? "Open"} →` };
}

function Card({ w, p }: { w: Work; p: Proof }) {
  const { href, cta } = cardLink(w, p);
  const ext = external(href);
  const client = p.kind === "Client work";
  const body = (
    <>
      {p.card ? (
        <span className="hs-shot">
          <Image src={p.card} alt="" width={800} height={500} sizes="(max-width: 700px) 80vw, 320px" />
        </span>
      ) : (
        <span className="hs-quote" aria-hidden="true">
          {client ? "Client" : "Guide"}
        </span>
      )}
      <span className="hs-cbody">
        <span className="hs-kind">{client ? "Built for a client" : p.kind}</span>
        <span className="hs-name">{p.name}</span>
        <span className="hs-line">{p.line}</span>
        <span className="hs-cta">{cta}</span>
      </span>
    </>
  );
  return (
    <li className={`hs-card${client ? " hs-card-client" : ""}`}>
      {ext ? (
        <a href={href} className="hs-clink" target="_blank" rel="noopener noreferrer">
          {body}
        </a>
      ) : (
        <Link href={href} className="hs-clink">
          {body}
        </Link>
      )}
    </li>
  );
}

export default function HomeSections() {
  const live = liveDemoCount();
  return (
    <div className="pg hs">
      <ul className="pg-strip" aria-label="Why hire me">
        <li>
          <b>HighLevel certified</b>
          <span>Workflows, funnels, calendars and the v2 API</span>
        </li>
        <li>
          <b>{live} live demos</b>
          <span>Open them and use them, not just read about them</span>
        </li>
        <li>
          <b>Every change written down</b>
          <span>Tested on test contacts, with how to undo it</span>
        </li>
      </ul>
      <h2 className="pg-h">What&apos;s going wrong in your business?</h2>

      {work.map((w) => {
        const shown = w.proof.filter((p) => !p.soon);
        // A demo with a full write-up (Kestrel) leads, then the other demos with screenshots, then the text cards.
        const rank = (p: Proof) => (p.detail ? 0 : p.card ? 1 : 2);
        const cards = [...shown].sort((a, b) => rank(a) - rank(b));
        return (
          <section key={w.slug} className="hs-sec" aria-labelledby={`hs-${w.slug}`}>
            <div className="hs-head">
              <div className="hs-title">
                <span className="pg-n">
                  <span className="pg-num">{w.n}</span>
                  <span className="pg-cat">{w.title}</span>
                </span>
                <h3 id={`hs-${w.slug}`} className="hs-problem">
                  {PROBLEM[w.slug] ?? w.title}
                </h3>
              </div>
              <div className="hs-side">
                <p className="hs-promise">{w.promise}</p>
                <Link href={`/work/${w.slug}`} className="hs-more">
                  See how it works →
                </Link>
              </div>
            </div>
            <SwipeRow label={w.title}>
              {cards.map((p, i) => (
                <Card key={`${p.name}-${i}`} w={w} p={p} />
              ))}
              <li className="hs-card hs-card-all">
                <Link href={`/work/${w.slug}`} className="hs-clink">
                  <span className="hs-cbody">
                    <span className="hs-kind">{w.title}</span>
                    <span className="hs-name">Everything I build for this, step by step</span>
                    <span className="hs-cta">Open the page →</span>
                  </span>
                </Link>
              </li>
            </SwipeRow>
          </section>
        );
      })}

      <section className="hs-sec hs-asksec" aria-label="Not on the list?">
        <div className="pg-ask hs-ask">
          {process.env.ASK_GHL_WEBHOOK_URL ? (
            <AskTile />
          ) : (
            <Link href="/book" className="pg-link">
              <span className="pg-body">
                <span className="pg-n">Not on the list?</span>
                <span className="pg-problem">Tell me the problem. 15 minutes, a straight answer.</span>
                <span className="pg-cta" aria-hidden="true">
                  Book a 15-min call →
                </span>
              </span>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
