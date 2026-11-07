"use client";

import type { GuideStep, GuideTour } from "@/components/guide/Guide";
import type { CardId } from "@/lib/deskhand/seed";
import type { LogEntry, Sandbox } from "@/lib/deskhand/types";

// Deskhand's guided tour. The visitor plays Mia and does the taps themselves; the tour points at what the agent is doing about it.
// Every number on the end card comes from the visitor's own conversation.

export type TourCtx = {
  sb: Sandbox | null;
  busy: boolean;
  /** This conversation's log, newest first. */
  log: LogEntry[];
  go: {
    customer: () => void;
    office: () => void;
    panel: (p: "calendar" | "contact" | "handoffs" | "rules") => void;
    start: (card: CardId | null) => void;
  };
  contact: { book: string; brief: string };
};

type Step = GuideStep<TourCtx>;
const said = (c: TourCtx) => c.sb?.conv.messages.filter((m) => m.from === "customer").length ?? 0;
const actions = (c: TourCtx) => c.log.filter((l) => l.status === "done" || l.status === "checked").length;
const booked = (c: TourCtx) => Boolean(c.sb?.conv.jobDone);
/** A person was pulled in for this customer: the card and the end card must not claim nobody was. */
const handedOff = (c: TourCtx) => Boolean(c.sb && c.sb.handoffs.some((h) => h.contactId && h.contactId === c.sb!.conv.contactId));
const plural = (n: number) => `${n} ${n === 1 ? "action" : "actions"}`;
// Every card that reports a result reads the visitor's own state, so pressing only Next never shows a job that didn't happen.

const steps: Step[] = [
  {
    id: "hello",
    title: () => "An AI front desk, at work",
    text: () => "A cleaning business misses calls all day while its teams are on jobs. You'll play a new customer and watch the agent do the whole front-desk job by itself. About three minutes.",
  },
  {
    id: "pick",
    title: () => "Play Mia",
    text: () => "Mia called about a fortnightly clean and nobody could answer.",
    spot: "cards",
    enter: (c) => c.go.customer(),
    doIt: () => "Tap Mia's card.",
    done: (c) => c.sb?.conv.card === "mia",
  },
  {
    id: "texted",
    title: () => "It texted back first",
    text: (c) => (c.sb?.conv.card === "mia" ? "The missed call started the conversation. The agent says who it is and offers to sort a price and a booking." : "Tap Mia's card first. The missed call starts the conversation, and the agent texts first."),
    spot: "thread",
    enter: (c) => c.go.customer(),
  },
  {
    id: "first",
    title: () => "Ask for a price",
    text: () => "The reply only shows once the server has checked it: prices must match the price list, and nothing can be claimed that didn't happen.",
    spot: "replies",
    enter: (c) => c.go.customer(),
    doIt: (c) => (c.sb?.conv.card === "mia" ? "Tap Mia's reply." : "Tap Mia's card first, then her reply."),
    done: (c) => said(c) >= 1 && !c.busy,
  },
  {
    id: "log",
    title: () => "Every action is on the record",
    text: (c) =>
      actions(c)
        ? `So far: ${plural(actions(c))}. Each one is in the work log with the time and who did it. Refusals show up here too.`
        : "Nothing yet. Once Mia has said something, each action the agent takes lands here with the time and who did it. Refusals too.",
    spot: "log",
    enter: (c) => c.go.office(),
  },
  {
    id: "book",
    title: () => "Get Mia booked",
    text: () => "Keep tapping Mia's replies. The agent collects the details, checks the real calendar and offers open arrival windows. Pick one.",
    spot: "replies",
    enter: (c) => c.go.customer(),
    doIt: (c) => (c.sb?.conv.card === "mia" ? "Tap until Mia picks a window." : "Tap Mia's card first, then her replies until she picks a window."),
    done: (c) => Boolean(c.sb?.conv.jobDone),
  },
  {
    id: "calendar",
    title: () => "On the calendar",
    text: (c) =>
      booked(c)
        ? "The visit went to a team that's free and allowed to do the job, with travel time kept clear. The contact moved to Booked."
        : "Mia isn't booked yet. When she picks a window, her visit lands here, on a team that's free and allowed to do the job.",
    spot: "panels",
    enter: (c) => {
      c.go.office();
      c.go.panel("calendar");
    },
  },
  {
    id: "outcome",
    title: (c) => (booked(c) ? "Job done" : "Where the result shows"),
    text: (c) =>
      !booked(c)
        ? "When the job is finished, this card shows what the agent did and whether a person was needed. Mia's job isn't finished yet."
        : handedOff(c)
          ? `${plural(actions(c))}, and one thing passed to Dana with a summary. The customer was told only what really happened.`
          : `${plural(actions(c))}, and no person involved. The customer was told only what really happened.`,
    spot: "outcome",
    enter: (c) => c.go.office(),
  },
  {
    id: "rules",
    title: () => "Inside the owner's limits",
    text: () => "It quotes only listed prices and books only open windows. Complaints, discounts and odd jobs go to the owner with a summary.",
    spot: "panels",
    enter: (c) => {
      c.go.office();
      c.go.panel("rules");
    },
  },
  {
    id: "end",
    title: () => "Want one for your business?",
    text: (c) =>
      (booked(c)
        ? handedOff(c)
          ? `That was ${plural(actions(c))}, with only the odd question passed to the owner. `
          : `That was ${plural(actions(c))} with nobody involved. `
        : "Close this and tap through Mia's replies to see the whole job. ") +
      "I'm John Boy, and I build agents like this around your own CRM and calendar. A real build starts with you approving each reply.",
    end: (c) => (
      <>
        <div className="gd-cta">
          <a className="gd-btn" href={c.contact.book}>
            Book a 15-min call
          </a>
          <a className="gd-btn gd-quiet" href={c.contact.brief}>
            See what a plan looks like
          </a>
          <button type="button" className="gd-btn gd-quiet" onClick={() => c.go.start("tom")}>
            Now try Tom moving a booking
          </button>
        </div>
        <p className="gd-note">A demo with a fictional business. Nothing was really sent.</p>
      </>
    ),
  },
];

export const TOUR: GuideTour<TourCtx> = { id: "deskhand", title: "Deskhand tour", steps };
