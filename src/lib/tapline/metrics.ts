import { TARGET_HOURS, officeHours, ruleTriage } from "./rules";
import type { Job, Region, Sandbox } from "./types";

// Everything on the KPI strip is computed from the sandbox, never typed in,
// and from the same fields the cards show (so the numbers and the pills agree).

const H = 3600_000;
const D = 24 * H;

export type ClockState = "ok" | "soon" | "late" | "none";

/** Time in the current stage, against the agency's target for it: wall-clock hours for urgent work, office
 * hours for routine work (`office` tells the chip which it is). */
export function stageClock(j: Job, now: number, region: Region) {
  // A legal deadline (NSW smoke alarms) runs from the report, across stages, until the work is done.
  if (j.dueBy && !["done", "billed"].includes(j.stage)) {
    const hours = Math.max(0, (now - j.createdAt) / H);
    const target = (j.dueBy - j.createdAt) / H;
    const state: ClockState = now > j.dueBy ? "late" : hours > target * 0.75 ? "soon" : "ok";
    return { since: j.createdAt, hours, target, state, office: false };
  }
  const since = j.stageEnteredAt ?? j.createdAt;
  // Before triage, a report the keyword rules call urgent is held to the urgent target; any other to the routine one.
  const urgency = j.stage === "new" && !j.triage ? ruleTriage(`${j.title}. ${j.description}`, region).urgency : j.urgency;
  const target = j.stage === "new" && j.hold ? TARGET_HOURS.routine.new : TARGET_HOURS[urgency][j.stage];
  const office = urgency === "routine";
  const hours = !target ? Math.max(0, (now - since) / H) : office ? officeHours(region, since, now) : Math.max(0, (now - since) / H);
  const state: ClockState = !target ? "none" : hours > target ? "late" : hours > target * 0.75 ? "soon" : "ok";
  return { since, hours, target, state, office };
}

function median(xs: number[]) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function kpis(sb: Sandbox, now: number) {
  const open = sb.jobs.filter((j) => !["done", "billed"].includes(j.stage));
  const ackHours = sb.jobs.filter((j) => j.triage?.confirmedAt && !j.complianceId).map((j) => (j.triage!.confirmedAt! - j.createdAt) / H);
  // Urgent on target: dispatched to a contractor within the urgent target of being reported.
  const urgent = sb.jobs.filter((j) => j.urgency === "urgent" && j.triage);
  const dispatchedOnTime = urgent.filter((j) => {
    const sent = j.events.find((e) => e.by === "tapline" && /^(Urgent: sent|After hours: on-call)/.test(e.text));
    return sent && (sent.at - j.createdAt) / H <= TARGET_HOURS.urgent.new! + TARGET_HOURS.urgent.sent!;
  });
  const waitingOwner = sb.jobs.filter((j) => j.stage === "owner");
  const oldestOwner = waitingOwner.reduce((m, j) => Math.max(m, now - (j.stageEnteredAt ?? j.createdAt)), 0);
  const spend = sb.jobs.filter((j) => j.invoice && j.billedAt && j.billedAt >= now - 30 * D && j.triage?.chargeTo !== "tenant").reduce((s, j) => s + j.invoice!.amount, 0);
  const late = open.filter((j) => stageClock(j, now, sb.region).state === "late").length;
  const repeats = sb.jobs.filter((j) => j.triage?.repeatOf && !["billed"].includes(j.stage)).length;
  // Hours saved: an estimate of 25 minutes of calls and emails per job routed through the board.
  const routed = sb.jobs.filter((j) => j.triage?.confirmedAt).length;
  return {
    open: open.length,
    late,
    medianAckHours: median(ackHours),
    urgentTotal: urgent.length,
    urgentOnTime: dispatchedOnTime.length,
    urgentOnTimePct: urgent.length ? Math.round((dispatchedOnTime.length / urgent.length) * 100) : 100,
    waitingOwner: waitingOwner.length,
    oldestOwnerHours: oldestOwner / H,
    spend30: Math.round(spend * 100) / 100,
    repeatOpen: repeats,
    hoursSaved: Math.round((routed * 25) / 60),
  };
}
