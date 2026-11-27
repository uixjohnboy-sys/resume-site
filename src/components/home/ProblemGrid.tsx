import Image from "next/image";
import Link from "next/link";
import { work } from "@/lib/work";

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

/** My own demos and products with a working link (not PDFs or files), counted once by name. */
export function liveBuildCount(): number {
  const names = new Set<string>();
  for (const w of work)
    for (const p of w.proof)
      if (p.kind !== "Client work" && p.href && !p.soon && !/\.pdf$|drive\.google\.com/i.test(p.href)) names.add(p.name);
  return names.size;
}

export default function ProblemGrid() {
  const live = liveBuildCount();
  return (
    <div className="pg">
      <ul className="pg-strip" aria-label="Why hire me">
        <li>
          <b>HighLevel certified</b>
          <span>Workflows, funnels, calendars and the v2 API</span>
        </li>
        <li>
          <b>{live} live builds</b>
          <span>You can open and test them, not just read about them</span>
        </li>
        <li>
          <b>Every change written down</b>
          <span>Tested on test contacts, with how to undo it</span>
        </li>
      </ul>
      <h2 className="pg-h">What&apos;s going wrong in your business?</h2>
      <ul className="pg-grid">
        {work.map((w) => {
          const hasLive = w.proof.some((p) => p.kind !== "Client work" && p.href && !p.soon && !/\.pdf$|drive\.google\.com/i.test(p.href));
          const proof = [w.lead.kind, w.lead.name].filter(Boolean).join(" · ");
          return (
            <li key={w.slug} className="pg-tile">
              <Link href={`/work/${w.slug}`} className="pg-link">
                <span className="pg-art">
                  <Image src={`/home/cards/${w.slug}.webp`} alt="" width={640} height={400} sizes="(max-width: 700px) 96px, 320px" />
                </span>
                <span className="pg-body">
                  <span className="pg-n">
                    {w.n} · {w.title}
                  </span>
                  <span className="pg-problem">{PROBLEM[w.slug] ?? w.title}</span>
                  <span className="pg-what">{w.promise}</span>
                  <span className="pg-proof">
                    <span>{proof}</span>
                    {hasLive ? <span className="pg-live">Live demo</span> : null}
                  </span>
                  <span className="pg-cta" aria-hidden="true">
                    See how it works →
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
        <li className="pg-tile pg-ask">
          <Link href="/book" className="pg-link">
            <span className="pg-body">
              <span className="pg-n">Not on the list?</span>
              <span className="pg-problem">Tell me the problem. 15 minutes, a straight answer.</span>
              <span className="pg-cta" aria-hidden="true">
                Book a 15-min call →
              </span>
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
