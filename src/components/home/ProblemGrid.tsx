import Image from "next/image";
import Link from "next/link";
import { work } from "@/lib/work";
import AskTile from "./AskTile";

// Homepage experiment (JB 2026-11-27, preview only at /preview/home-grid): the kinds of work as a grid a buyer scans in
// one look, each tile headed by the buyer's problem in their own words, instead of the cover-flow that shows one card at
// a time. The count of live builds is computed from work.ts (my own demos and products with a working link), never typed.

const PROBLEM: Record<string, string> = {
  "lead-follow-up": "New leads go cold before anyone replies",
  "ai-agents": "Messages pile up after hours",
  funnels: "Ads get clicks, the page gets no enquiries",
  integrations: "Your tools don't talk to each other",
  "fixes-and-audits": "A workflow does something it shouldn't",
  "agency-snapshots": "Every new client account takes days to set up",
  "custom-apps": "GoHighLevel can't do what you need",
};

// Demos a visitor can open and use (checked 2026-11-27). A page you only read (the teardown) or a PDF guide is not one.
// Add a demo here only after it is live and testable; the strip's count is this list's length.
const LIVE_DEMOS: { name: string; match: RegExp }[] = [
  { name: "Deskhand", match: /\/demo\/deskhand/ },
  { name: "Tapline", match: /\/(demo|projects)\/tapline/ },
  { name: "Lumiere Aesthetic", match: /lumiereaesthetic\.johnboydesign\.com/ },
  { name: "Coach OS tour", match: /coachos\.johnboydesign\.com\/tour|^\/coach-os/ },
  { name: "Speed-to-lead quote form", match: /link\.funnelgenie\.io\/widget\/form\// },
  { name: "Kestrel Physio", match: /kestrel\.johnboydesign\.com/ },
];
export const liveDemoCount = () => LIVE_DEMOS.length;

function tagFor(w: (typeof work)[number]): string | null {
  const hrefs = [w.live?.href, ...w.proof.filter((p) => !p.soon).map((p) => p.href)].filter(Boolean) as string[];
  if (hrefs.some((h) => LIVE_DEMOS.some((d) => d.match.test(h)))) return "Try a demo";
  if (hrefs.some((h) => /followup-teardown/.test(h))) return "Sample teardown";
  if (hrefs.some((h) => /\.pdf$/i.test(h))) return "Setup guide";
  return null;
}

export default function ProblemGrid() {
  const live = liveDemoCount();
  return (
    <div className="pg">
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
      <ul className="pg-grid">
        {work.map((w) => {
          // Hiring review 11-28: next to a client name, "Try a demo" read as if the demo were that client's work.
          const raw = tagFor(w);
          const own: Record<string, string> = { "Try a demo": "Plus my own demo to try", "Sample teardown": "Plus my own sample teardown", "Setup guide": "Plus my own setup guide" };
          const tag = raw && w.lead.kind === "Client work" ? (own[raw] ?? raw) : raw;
          const proof = w.lead.kind === "Client work" ? `Built for a client: ${w.lead.name}` : `${w.lead.kind}: ${w.lead.name}`;
          return (
            <li key={w.slug} className="pg-tile">
              <Link href={`/work/${w.slug}`} className="pg-link">
                <span className="pg-art">
                  <Image src={`/home/cards/${w.slug}.webp`} alt="" width={640} height={400} sizes="(max-width: 700px) 96px, 320px" />
                </span>
                <span className="pg-body">
                  {/* JB 11-28: the kind of work stands out as a badge; the buyer's problem stays the headline. */}
                  <span className="pg-n">
                    <span className="pg-num">{w.n}</span>
                    <span className="pg-cat">{w.title}</span>
                  </span>
                  <span className="pg-problem">{PROBLEM[w.slug] ?? w.title}</span>
                  <span className="pg-what">{w.promise}</span>
                  <span className="pg-proof">
                    <span>{proof}</span>
                    {tag ? <span className="pg-live">{tag}</span> : null}
                  </span>
                  <span className="pg-cta" aria-hidden="true">
                    {w.proof.some((p) => p.card && p.href && LIVE_DEMOS.some((d) => d.match.test(p.href as string))) ?"See the demos and how it works →" : "See how it works →"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
        <li className="pg-tile pg-ask">
          {/* The message form shows only once the GoHighLevel webhook is set, so no message lands where nobody sees it. */}
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
        </li>
      </ul>
    </div>
  );
}
