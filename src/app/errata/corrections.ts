// The public corrections log for the Built Before Machines channel.
// This file is the whole record. The page at /errata renders it.
//
// How to add a row:
//
// 1. Add a new object at the END of the corrections array. Never delete a
//    row and never reorder rows. A row's number on the page ("No. 1",
//    "No. 2") is its position in this file counting from 1, and people may
//    cite that number, so it must never change.
// 2. date is the day the correction was logged, written as 'YYYY-MM-DD'.
// 3. episode is the episode title as published. episodeUrl is optional,
//    the YouTube link to that episode.
// 4. said is what the episode said. correct is what is right. One or two
//    plain sentences each. No explanation, no apology.
// 5. source is the published source that showed it. label names the work
//    and the exact page or line, url is where to read it.
// 6. readOnScreen is optional. Fill it in once the correction card has run,
//    with the title of the episode that carried it.
// 7. If a correction is itself corrected, do not edit the old row. Add the
//    new row at the end, then set supersededBy on the old row to the new
//    row's number. The old row stays on the page, struck through, with the
//    new row directly below it.
// 8. Save, then commit and push. The page rebuilds on the next deploy.
//
// Shape of a row. Every value here is a placeholder, not a real correction:
//
//   {
//     date: 'YYYY-MM-DD',
//     episode: 'Episode title as published',
//     episodeUrl: 'https://www.youtube.com/watch?v=VIDEO_ID',
//     said: 'What the episode said.',
//     correct: 'What is right.',
//     source: {
//       label: 'Author, Title, year, page or line',
//       url: 'https://link-to-the-source',
//     },
//     readOnScreen: 'Title of the episode that read it on screen',
//   },

export type Correction = {
  /** Day the correction was logged, 'YYYY-MM-DD'. */
  date: string;
  /** Episode title as published. */
  episode: string;
  /** Optional YouTube link to the episode. */
  episodeUrl?: string;
  /** What the episode said. */
  said: string;
  /** What is right. */
  correct: string;
  /** The published source that showed it. */
  source: { label: string; url: string };
  /** Title of the episode whose on-screen card read this correction. */
  readOnScreen?: string;
  /** Row number (1 based) of the later row that corrects this one. */
  supersededBy?: number;
};

/** Shown in place of the log while it has no rows. */
export const EMPTY_STATE = [
  "No corrections yet.",
  "The first episode has not been published.",
];

export const corrections: Correction[] = [];
