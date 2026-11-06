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

const steps: Step[] = [
  {
    id: "hello",
    title: () => "An AI front desk, at work",
    text: () => "A cleaning business misses calls all day while its teams are on jobs. You'll play a new customer and watch the agent do the whole front-desk job by itself. About two minutes.",
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
    text: () => "The missed call started the conversation. The agent says who it is and offers to sort a price and a booking.",
    spot: "thread",
    enter: (c) => c.go.customer(),
  },
  {
    id: "first",
    title: () => "Ask for a price",
    text: () => "The reply only shows once the server has checked it: prices must match the price list, and nothing can be claimed that didn't happen.",
    spot: "replies",
    enter: (c) => c.go.customer(),
    doIt: () => "Tap Mia's reply.",
    done: (c) => said(c) >= 1 && !c.busy,
  },
  {
    id: "log",
    title: () => "Every action is on the record",
    text: (c) => `So far: ${actions(c)} actions. Each one is in the work log with the time and who did it. Refusals show up here too.`,
    spot: "log",
    enter: (c) => c.go.office(),
  },
  {
    id: "book",
    title: () => "Get Mia booked",
    text: () => "Keep tapping Mia's replies. The agent collects the details, checks the real calendar and offers open arrival windows. Pick one.",
    spot: "replies",
    enter: (c) => c.go.customer(),
    doIt: () => "Tap until Mia picks a window.",
    done: (c) => Boolean(c.sb?.conv.jobDone),
  },
  {
    id: "calendar",
    title: () => "On the calendar",
    text: () => "The visit went to a team that's free and allowed to do the job, with travel time kept clear. The contact moved to Booked.",
    spot: "panels",
    enter: (c) => {
      c.go.office();
      c.go.panel("calendar");
    },
  },
  {
    id: "outcome",
    title: () => "Job done",
    text: (c) => `${actions(c)} actions, and no person involved. The customer was told only what really happened.`,
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
    text: (c) => `That was ${actions(c)} actions with nobody involved. I build agents like this around your own CRM and calendar, and a real build starts with you approving each reply.`,
    end: (c) => (
      <>
        <div className="gd-cta">
          <a className="gd-btn" href={c.contact.brief}>
            Send me your brief
          </a>
          <a className="gd-btn gd-quiet" href={c.contact.book}>
            Book a 15-min call
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
