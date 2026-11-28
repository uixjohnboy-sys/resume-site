import Image from "next/image";
import Link from "next/link";
import { work, type Proof } from "@/lib/work";
import AskTile from "./AskTile";
import SwipeRow from "./SwipeRow";
import WorkTabs from "./WorkTabs";
import { liveDemoCount } from "./ProblemGrid";

// Homepage work section (JB 2026-11-28, v3): the seven kinds of work as buttons (4 over 3, components WorkTabs).
// The chosen one shows a centred display title, the buyer's problem, a "Built for clients" line and a row of demo
// cards; every card ends in "Explore more", which opens the page that explains the demo and how to test it. Client
// work has no demo to test, so it is named, not carded. Planned (soon) entries are not shown.

const PROBLEM: Record<string, string> = {
  "lead-follow-up": "New leads go cold before anyone replies",
  "ai-agents": "Messages pile up after hours",
  funnels: "Ads get clicks, the page gets no enquiries",
  integrations: "Your tools don't talk to each other",
  "fixes-and-audits": "A workflow does something it shouldn't",
  "agency-snapshots": "Every new client account takes days to set up",
  "custom-apps": "GoHighLevel can't do what you need",
};

// Button labels (JB 2026-11-28: the kinds of work as buttons, 4 over 3); the full title heads the panel.
const SHORT: Record<string, string> = {
  "lead-follow-up": "Lead follow-up",
  "ai-agents": "AI agents",
  funnels: "Funnels",
  integrations: "Integrations",
  "fixes-and-audits": "Fixes and audits",
  "agency-snapshots": "Agency snapshots",
  "custom-apps": "Custom apps",
};

// Where "Explore more" goes: the page that explains each demo and says how to test it.
const EXPLORE: Record<string, string> = {
  "Kestrel Physio": "/projects/kestrel",
  Deskhand: "/projects/deskhand",
  Tapline: "/projects/tapline",
  "Coach OS": "/coach-os",
  "Follow-up teardown": "/demo/followup-teardown",
  "Lumiere Aesthetic": "/projects/lumiere",
  "Speed-to-lead for a trades business": "/projects/speed-to-lead",
  "Quote form for a trades business": "/projects/speed-to-lead",
  "Speed-to-lead kit for trades": "/projects/speed-to-lead",
};
// The build walkthrough is linked from the Lumiere page, so it is not a card of its own.
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
      <p className="hs-pick">Pick one to see the demos you can try.</p>

      <WorkTabs
        items={work.map((w) => {
          const shown = w.proof.filter((p) => !p.soon);
          const clients = [...new Set(shown.filter((p) => p.kind === "Client work").map((p) => p.name))];
          const rank = (p: Proof) => (p.detail ? 0 : p.card ? 1 : 2);
          const cards = shown.filter((p) => p.kind !== "Client work" && !FOLDED.has(p.name)).sort((a, b) => rank(a) - rank(b));
          return {
            slug: w.slug,
            n: w.n,
            label: SHORT[w.slug] ?? w.title,
            panel: (
              <>
                <header className="hs-head">
                  <h3 className="hs-title">{w.title}</h3>
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
              </>
            ),
          };
        })}
      />

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
