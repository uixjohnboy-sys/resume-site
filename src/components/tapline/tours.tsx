"use client";

import type { GuideStep, GuideTour } from "@/components/guide/Guide";
import type { kpis } from "@/lib/tapline/metrics";
import { REGION, stageLabel, terms, tradeWho } from "@/lib/tapline/rules";
import type { Job, Sandbox } from "@/lib/tapline/types";
import { dur } from "./ui";

// Tapline's two guided tours, one for each person who buys it. The manager lives one repair
// from the tenant's report to the bill; the agency owner sees control, proof and risk. Every
// number on the end card comes from the demo's own board.

export type TourCtx = {
  sb: Sandbox;
  k: ReturnType<typeof kpis>;
  /** The repair the visitor reported during this tour. */
  job: Job | null;
  tenantOpen: boolean;
  /** An after-hours urgent job with a full history, for the owner's tour. */
  sampleJobId: string | null;
  go: {
    board: () => void;
    compliance: () => void;
    owners: () => void;
    open: (id: string | null) => void;
    tenant: () => void;
  };
  contact: { mail: string; whatsapp: string; emailSelf: string };
};

type Step = GuideStep<TourCtx>;
const cap = (x: string) => x[0].toUpperCase() + x.slice(1);
const words = (c: TourCtx) => terms(c.sb.region);
const AU = (c: TourCtx) => c.sb.region === "AU";

const endCard = (id: string, title: string, text: string): Step => ({
  id,
  title: () => title,
  text: () => text,
  enter: (c) => {
    c.go.open(null);
    c.go.board();
  },
  end: (c) => (
    <>
      <dl className="gd-stats">
        <div>
          <dt>Median time to acknowledge</dt>
          <dd>{dur(c.k.medianAckHours)}</dd>
        </div>
        <div>
          <dt>Urgent jobs on target</dt>
          <dd>
            {c.k.urgentOnTime} of {c.k.urgentTotal}
          </dd>
        </div>
        <div>
          <dt>Manager hours saved</dt>
          <dd>~{c.k.hoursSaved}h</dd>
        </div>
      </dl>
      <p className="gd-note">From this fictional agency&apos;s board. The hours saved are an estimate of 25 minutes a job.</p>
      <div className="gd-cta">
        <a className="gd-btn" href={c.contact.mail}>
          Talk to John Boy about your agency
        </a>
        <a className="gd-btn gd-quiet" href={c.contact.whatsapp} target="_blank" rel="noopener noreferrer">
          Message on WhatsApp
        </a>
        <a className="gd-btn gd-quiet" href={c.contact.emailSelf}>
          Email this demo to myself
        </a>
      </div>
    </>
  ),
});

const compliance: Step = {
  id: "compliance",
  spot: "compliance",
  title: () => "What's due, and why",
  text: (c) =>
    AU(c)
      ? "Smoke alarms, pool barriers and gas services for every property, each marked as law or agency policy. One click creates the job."
      : "Gas Safety certificates, EICRs and alarm checks for every property, each marked as law or agency policy. One click creates the job.",
  enter: (c) => {
    c.go.open(null);
    c.go.compliance();
  },
};

const managerSteps: Step[] = [
  {
    id: "welcome",
    title: () => "One repair, start to finish",
    text: (c) => `This is ${c.sb.agency}, a fictional agency with ${c.sb.properties.length} properties. Everything works and your changes are private to you. Two minutes.`,
    enter: (c) => c.go.board(),
  },
  {
    id: "morning",
    spot: "kpis",
    title: () => "The start of your day",
    text: (c) => `What's late, what's urgent and what's waiting on ${words(c).owners}. Every number comes from the jobs below, none is typed in.`,
  },
  {
    id: "report",
    spot: "report",
    title: () => "It's 9:47 pm and a tenant has a leak",
    text: () => "Be the tenant for a moment.",
    doIt: () => "Press Report a repair.",
    done: (c) => c.tenantOpen || !!c.job,
  },
  {
    id: "send",
    spot: "tenant-send",
    title: () => "The report is filled in for you",
    text: () => "A real tenant types this on their phone from a text-message link, with no app and no login.",
    doIt: () => "Press Send report.",
    enter: (c) => {
      if (!c.job && !c.tenantOpen) c.go.tenant();
    },
    done: (c) => !!c.job,
  },
  {
    id: "triage",
    spot: "triage",
    title: (c) => (c.job?.triage ? "Read and routed in seconds" : "The AI is reading it now"),
    text: (c) => {
      const t = c.job?.triage;
      if (!t) return "It reads the report and this property's repair history.";
      const who = tradeWho(c.sb.region, t.trade);
      const repeat = t.repeatOf ? ` It also found the earlier repair, ${t.repeatOf.ref}.` : "";
      return c.job?.stage === "sent"
        ? `It chose the ${who} and marked it ${t.urgency}.${repeat} Because it's after hours, the on-call ${words(c).contractor} is already paged and the tenant has the fixed safety steps. Your reply waits for you.`
        : `It chose the ${who} and marked it ${t.urgency}.${repeat} Nothing goes out until you check it.`;
    },
    enter: (c) => {
      if (c.job) c.go.open(c.job.id);
    },
    ready: (c) => !!c.job?.triage,
  },
  {
    id: "confirm",
    spot: "confirm",
    title: () => "You stay in charge",
    text: () => "Change the trade, edit the reply, or send it as it is. The AI suggests; a person decides.",
    doIt: () => "Press Confirm and send.",
    enter: (c) => {
      if (c.job) c.go.open(c.job.id);
    },
    done: (c) => !!c.job?.triage?.confirmedAt,
  },
  {
    id: "phone",
    spot: "try-phone",
    title: (c) => `Now be the ${words(c).contractor}`,
    text: (c) => `The job reaches the ${words(c).contractor} by text message. Accept it on your own phone and watch this card move by itself.`,
    doIt: () => "Scan the code, or press Next to keep going.",
    enter: (c) => {
      if (c.job) c.go.open(c.job.id);
    },
    done: (c) => !!c.job && ["booked", "done", "billed"].includes(c.job.stage),
  },
  {
    id: "owner",
    spot: "col-owner",
    title: (c) => `Over the ${words(c).owner}'s limit`,
    text: (c) => `Routine work goes out capped at each ${words(c).owner}'s limit. A quote above it waits here for one tap from the ${words(c).owner}, and reminders chase it for you.`,
    enter: (c) => {
      c.go.open(null);
      c.go.board();
    },
  },
  compliance,
  endCard("end", "That's one repair, start to finish", "This desk can be built around your agency's rules, your trades and your accounting software."),
];

const ownerSteps: Step[] = [
  {
    id: "welcome",
    title: () => "What an agency owner needs to see",
    text: (c) => `This is ${c.sb.agency}, a fictional agency with ${c.sb.properties.length} properties. Are we on top of it, are we exposed, and can we prove it? One minute.`,
    enter: (c) => c.go.board(),
  },
  {
    id: "numbers",
    spot: "kpis",
    title: () => "The whole desk at a glance",
    text: (c) => `Late jobs, urgent work against target, what's waiting on ${words(c).owners} and what you've spent. All computed from the jobs, none typed in.`,
  },
  {
    id: "team",
    spot: "filters",
    title: () => "Who's stretched",
    text: () => "Filter by manager, trade or urgency. Routine targets count office hours, so a weekend never turns the board red.",
  },
  {
    id: "proof",
    spot: "activity",
    title: () => "Every step is on the record",
    text: (c) => {
      const j = c.sb.jobs.find((x) => x.id === c.sampleJobId);
      return j
        ? `${j.ref} came in after hours and is now "${stageLabel(c.sb.region, j.stage)}". Who did what and when is logged, so you can prove it the next morning.`
        : "Who did what and when is logged on every job, so you can prove it the next morning.";
    },
    enter: (c) => {
      c.go.board();
      c.go.open(c.sampleJobId);
    },
  },
  compliance,
  {
    id: "statements",
    spot: "owner-report",
    title: (c) => `${cap(words(c).owner)} statements`,
    text: (c) => `Each ${words(c).owner}'s month on one page, with costs and ${words(c).tax}, ready to print. Fewer "what did you spend?" calls.`,
    enter: (c) => {
      c.go.open(null);
      c.go.owners();
    },
  },
  {
    id: "regions",
    spot: "regions",
    title: () => "Sydney or Manchester",
    text: (c) => `The same product speaks each market: its words, trades, money and rules. ${REGION[c.sb.region].city} is on now. Try the other one after the tour.`,
    enter: (c) => c.go.board(),
  },
  endCard("end", "That's the view from the top", "This desk can be built around your agency's rules, your trades and your accounting software."),
];

export const TOURS: Record<"manager" | "owner", GuideTour<TourCtx>> = {
  manager: { id: "manager", title: "Guided tour for property managers", steps: managerSteps },
  owner: { id: "owner", title: "Guided tour for agency owners", steps: ownerSteps },
};
