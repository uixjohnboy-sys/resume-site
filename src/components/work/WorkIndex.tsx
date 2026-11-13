import Link from "next/link";
import { work } from "@/lib/work";

/** Hyphenated words never break at the hyphen in the big titles ("Follow-/up" read as two words). */
const nb = (t: string) => t.replace(/-/g, "‑");

// The homepage's work index: four kinds of work as numbered rows, each opening /work/<slug>. Rows, hairlines and type,
// not a grid of rounded cards (DESIGN-STANDARD C2 and C3). One link per row (the service name, stretched over the row);
// demos open from the /work page. Every row carries one real proof line, labelled, and no two rows lead with the same one.

export default function WorkIndex() {
  return (
    <ol className="wk-index">
      {work.map((w) => (
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
          </div>
          <span className="wk-arrow" aria-hidden="true">
            →
          </span>
        </li>
      ))}
    </ol>
  );
}
