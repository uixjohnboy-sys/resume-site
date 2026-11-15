import Link from "next/link";
import { work } from "@/lib/work";

/** Hyphenated words never break at the hyphen in the big titles ("Follow-/up" read as two words). */
const nb = (t: string) => t.replace(/-/g, "‑");

// The homepage's work index: the kinds of work as numbered rows, each opening /work/<slug>. Rows, hairlines and type,
// not a grid of rounded cards (DESIGN-STANDARD C2 and C3). One link per row (the service name, stretched over the row);
// demos open from the /work page. Every row carries one real proof line, labelled, and no two rows lead with the same one.
// A planned demo shows as a small "Demo soon" line under the proof, never as the proof itself.

export default function WorkIndex() {
  return (
    <ol className="wk-index">
      {work.map((w) => {
        const soon = w.proof.filter((p) => p.soon).map((p) => p.name);
        return (
        <li key={w.slug} className="wk-row" data-rv>
          <span className="wk-n" aria-hidden="true">
            {w.n}
          </span>
          <div className="wk-what">
            <h3>
              <Link href={`/work/${w.slug}`} className="wk-title">
                {nb(w.title)}
              </Link>
            </h3>
            <p className="wk-promise">{w.promise}</p>
          </div>
          <div className="wk-proof">
            <p className="v4-case-tag wk-tag">
              {w.lead.kind} · {w.lead.name}
              {w.lead.when ? ` · ${w.lead.when}` : ""}
            </p>
            <p>{w.lead.line}</p>
            {soon.length > 0 && (
              <p className="wk-soon">
                <span className="wk-soon-tag">Demo soon</span> {soon.join(", ")}
              </p>
            )}
          </div>
          <span className="wk-arrow" aria-hidden="true">
            →
          </span>
        </li>
        );
      })}
    </ol>
  );
}
