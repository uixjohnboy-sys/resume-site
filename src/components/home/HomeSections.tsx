import Image from "next/image";
import Link from "next/link";
import { work, type Proof } from "@/lib/work";
import AskTile from "./AskTile";
import SwipeRow from "./SwipeRow";
import { liveDemoCount } from "./ProblemGrid";

// Homepage, section by section (JB 2026-11-28, v2): each kind of work gets a centred section with the category as a
// bold display title, the buyer's problem under it, and a row of demo cards to swipe. Every card ends in "Explore more",
// which opens the page that explains the demo and how to test it. Client work is named under the title (it has no demo
// to test). Planned (soon) entries are not shown.

const PROBLEM: Record<string, string> = {
  "lead-follow-up": "New leads go cold before anyone replies",
  "ai-agents": "Messages pile up after hours",
  funnels: "Ads get clicks, the page gets no enquiries",
  integrations: "Your tools don't talk to each other",
  "fixes-and-audits": "A workflow does something it shouldn't",
  "agency-snapshots": "Every new client account takes days to set up",
  "custom-apps": "GoHighLevel can't do what you need",
};

// Where "Explore more" goes: the page that explains each demo and says how to test it.
const KIT = "/guides/speed-to-lead-kit.pdf";
const LUMIERE_GUIDE = "https://drive.google.com/file/d/1MfN7JlZdr9jzJutqL36mKz29GjWOKWId/view";
const EXPLORE: Record<string, string> = {
  "Kestrel Physio": "/projects/kestrel",
  Deskhand: "/projects/deskhand",
  Tapline: "/projects/tapline",
  "Coach OS": "/coach-os",
  "Follow-up teardown": "/demo/followup-teardown",
  "Lumiere Aesthetic": LUMIERE_GUIDE,
  "Speed-to-lead for a trades business": KIT,
  "Quote form for a trades business": KIT,
  "Speed-to-lead kit for trades": KIT,
};
// Guides that are already the explanation of a card shown beside them.
const FOLDED = new Set(["How I built Lumiere"]);

const external = (h: string) => /^https?:/.test(h) || /\.pdf$/i.test(h);

function Card({ p }: { p: Proof }) {
  const href = EXPLORE[p.name] ?? p.href ?? "/book";
  const ext = external(href);
  const body = (
    <>
      <span className="hs-shot">
        {p.card ? (
          <Image src={p.card} alt="" width={800} height={500} sizes="(max-width: 700px) 80vw, 320px" />
        ) : (
          <span className="hs-noshot" aria-hidden="true">
            PDF guide
          </span>
        )}
      </span>
      <span className="hs-cbody">
        <span className="hs-kind">{p.kind}</span>
        <span className="hs-name">{p.name}</span>
        <span className="hs-line">{p.line}</span>
        <span className="hs-cta">Explore more →</span>
      </span>
    </>
  );
  return (
    <li className="hs-card">
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
      <h2 className="pg-h hs-h">What&apos;s going wrong in your business?</h2>

      {work.map((w) => {
        const shown = w.proof.filter((p) => !p.soon);
        const clients = [...new Set(shown.filter((p) => p.kind === "Client work").map((p) => p.name))];
        const rank = (p: Proof) => (p.detail ? 0 : p.card ? 1 : 2);
        const cards = shown.filter((p) => p.kind !== "Client work" && !FOLDED.has(p.name)).sort((a, b) => rank(a) - rank(b));
        return (
          <section key={w.slug} className="hs-sec" aria-labelledby={`hs-${w.slug}`}>
            <header className="hs-head">
              <span className="hs-num">{w.n}</span>
              <h3 id={`hs-${w.slug}`} className="hs-title">
                {w.title}
              </h3>
              <p className="hs-problem">{PROBLEM[w.slug] ?? w.promise}</p>
              <p className="hs-promise">{w.promise}</p>
              {clients.length ? <p className="hs-clients">Built for clients: {clients.join(", ")}</p> : null}
            </header>
            <SwipeRow label={w.title}>
              {cards.map((p, i) => (
                <Card key={`${p.name}-${i}`} p={p} />
              ))}
            </SwipeRow>
            <p className="hs-all">
              <Link href={`/work/${w.slug}`}>More on this kind of work →</Link>
            </p>
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
