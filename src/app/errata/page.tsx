import type { Metadata } from "next";
import { IBM_Plex_Mono, Old_Standard_TT, Source_Serif_4 } from "next/font/google";
import { corrections, EMPTY_STATE, type Correction } from "./corrections";
import styles from "./errata.module.css";

// The corrections record for the Built Before Machines YouTube channel.
//
// This page belongs to the channel, not to the portfolio that shares the
// domain. It is deliberately stripped: no site nav, no links into the rest
// of johnboydesign.com, no contact or sales prompts. The one link out is
// back to the channel (plus the episode and source links inside the log).
// The root layout adds no visible chrome, and everything visual here lives
// in errata.module.css so no other route is touched.
//
// A server component with no client code, so the whole record renders with
// JavaScript off.

const CHANNEL_NAME = "Built Before Machines";
const CHANNEL_URL = "https://www.youtube.com/@BuiltBeforeMachinesHistory";

// The site is served from www (the bare domain 308 redirects there), so the
// canonical uses www to point at the address that actually answers.
const CANONICAL = "https://www.johnboydesign.com/errata";

const TITLE = `Corrections, ${CHANNEL_NAME}`;
const DESCRIPTION =
  "The public corrections record for the Built Before Machines history channel. Each correction is logged with its date, the episode, what we said, what is right, and the source that showed it.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  // Clear the portfolio values the root layout would otherwise pass down.
  keywords: null,
  authors: null,
  robots: { index: true, follow: true },
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    siteName: CHANNEL_NAME,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const display = Old_Standard_TT({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--errata-display",
});

const text = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--errata-text",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--errata-mono",
});

type Row = Correction & { no: number };

/**
 * Checks the data file so a typo fails the build instead of shipping a
 * broken record, then groups rows for display. A row that was itself
 * corrected is shown directly above the row that replaced it. Groups are
 * ordered newest first by the date of their latest row.
 */
function buildLog(entries: Correction[]): Row[][] {
  const rows: Row[] = entries.map((entry, i) => ({ ...entry, no: i + 1 }));

  for (const row of rows) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || Number.isNaN(Date.parse(row.date))) {
      throw new Error(`errata No. ${row.no}: date must be YYYY-MM-DD, got "${row.date}"`);
    }
    if (row.supersededBy !== undefined) {
      const target = row.supersededBy;
      if (!Number.isInteger(target) || target <= row.no || target > rows.length) {
        throw new Error(
          `errata No. ${row.no}: supersededBy must be the number of a later row, got ${target}`,
        );
      }
    }
  }

  const latest = (row: Row): Row => {
    let current = row;
    while (current.supersededBy !== undefined) current = rows[current.supersededBy - 1];
    return current;
  };

  const groups = new Map<number, Row[]>();
  for (const row of rows) {
    const head = latest(row).no;
    const group = groups.get(head) ?? [];
    group.push(row);
    groups.set(head, group);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => {
      const byDate = rows[b - 1].date.localeCompare(rows[a - 1].date);
      return byDate !== 0 ? byDate : b - a;
    })
    .map(([, group]) => group.sort((x, y) => x.no - y.no));
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={styles.link} rel="noopener noreferrer">
      {children}
    </a>
  );
}

function LogRow({ row }: { row: Row }) {
  const superseded = row.supersededBy !== undefined;
  // <s> marks text that is no longer accurate but stays on the record.
  const Strike = superseded ? "s" : "span";

  return (
    <tr id={`no-${row.no}`} className={superseded ? styles.superseded : undefined}>
      <td className={styles.cellNo} data-label="No.">
        <a href={`#no-${row.no}`} className={styles.anchor} aria-label={`Correction number ${row.no}`}>
          No.&nbsp;{row.no}
        </a>
        {superseded && (
          <span className={styles.flag}>
            Superseded by{" "}
            <a href={`#no-${row.supersededBy}`} className={styles.anchor}>
              No.&nbsp;{row.supersededBy}
            </a>
          </span>
        )}
      </td>
      <td className={styles.cellDate} data-label="Date">
        <time dateTime={row.date}>{row.date}</time>
      </td>
      <td data-label="Episode">
        <Strike className={styles.value}>
          {row.episodeUrl ? <ExternalLink href={row.episodeUrl}>{row.episode}</ExternalLink> : row.episode}
        </Strike>
      </td>
      <td data-label="What we said">
        <Strike className={styles.value}>{row.said}</Strike>
      </td>
      <td data-label="What is right">
        <Strike className={styles.value}>{row.correct}</Strike>
        {row.readOnScreen && (
          <span className={styles.note}>Read on screen in {row.readOnScreen}</span>
        )}
      </td>
      <td data-label="Source">
        <Strike className={styles.value}>
          <ExternalLink href={row.source.url}>{row.source.label}</ExternalLink>
        </Strike>
      </td>
    </tr>
  );
}

export default function ErrataPage() {
  const log = buildLog(corrections);
  const newest = corrections.reduce<string | null>(
    (max, entry) => (max === null || entry.date > max ? entry.date : max),
    null,
  );
  // With no rows yet, the page reports the day it was built.
  const lastUpdated = newest ?? new Date().toISOString().slice(0, 10);

  return (
    <div className={`${styles.page} ${display.variable} ${text.variable} ${mono.variable}`}>
      <main className={styles.plate}>
        <header className={styles.header}>
          <p className={styles.kicker}>{CHANNEL_NAME}</p>
          <h1 className={styles.title}>Corrections</h1>
          <div className={styles.rule} aria-hidden="true">
            <span />
          </div>
        </header>

        <section className={styles.intro} aria-label="About this record">
          <p>
            {`This is the public corrections record for the ${CHANNEL_NAME} channel. `}
            Every episode&apos;s sources are listed in its description.
          </p>
          <p>
            When we get something wrong and someone shows us a better source, the correction is logged
            here with the date, the episode, what we said, what is right, and the source that showed it.
            Important corrections are also read on screen in an upcoming episode.
          </p>
          <p>
            Nothing is quietly deleted. If a correction is itself corrected, the old line stays, struck
            through, with the new one below it.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="send">
          <h2 id="send" className={styles.heading}>
            How to send a correction
          </h2>
          <p>
            Reply to the pinned comment under the episode. Give the exact page or line of a published
            source.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="log">
          <h2 id="log" className={styles.heading}>
            The log
          </h2>

          {log.length === 0 ? (
            <div className={styles.empty}>
              {EMPTY_STATE.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.caption}>
                  Newest first. A struck line was later corrected by the row below it.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">No.</th>
                    <th scope="col">Date</th>
                    <th scope="col">Episode</th>
                    <th scope="col">What we said</th>
                    <th scope="col">What is right</th>
                    <th scope="col">Source</th>
                  </tr>
                </thead>
                {log.map((group) => (
                  <tbody key={group[group.length - 1].no} className={styles.group}>
                    {group.map((row) => (
                      <LogRow key={row.no} row={row} />
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
          )}
        </section>

        <footer className={styles.footer}>
          <a href={CHANNEL_URL} className={styles.channelLink} rel="noopener">
            {`${CHANNEL_NAME} on YouTube`}
          </a>
          <p className={styles.updated}>
            Last updated <time dateTime={lastUpdated}>{lastUpdated}</time>
          </p>
        </footer>
      </main>
    </div>
  );
}
