import { TARGET_HOURS } from "./rules";
import type { Job, Sandbox, Trade } from "./types";

// Everything on the KPI strip is computed from the sandbox, never typed in.

const H = 3600_000;
const D = 24 * H;

export function stageClock(j: Job, now: number) {
  // How long the job has sat in its current stage: from its last event.
  const since = j.events.length ? j.events[j.events.length - 1].at : j.createdAt;
  const target = TARGET_HOURS[j.urgency][j.stage];
  const hours = (now - since) / H;
  const state: "ok" | "warn" | "late" | "none" =
    !target || j.stage === "invoiced" || j.stage === "done" ? "none" : hours > target ? "late" : hours > target * 0.75 ? "warn" : "ok";
  return { since, hours, target, state };
}

// Faults that often share a cause: water through a ceiling can be the roof or
// the plumbing, so a roofer job after a plumber job still counts as a repeat.
const FAMILY: Record<Trade, string> = {
  plumber: "water",
  roofer: "water",
  electrician: "power",
  locksmith: "security",
  glazier: "security",
  handyman: "general",
  hvac: "heating",
  pest: "pest",
};

export function priorJobs(sb: Sandbox, j: Job) {
  return sb.jobs
    .filter((x) => x.id !== j.id && x.propertyId === j.propertyId && j.createdAt > x.createdAt && j.createdAt - x.createdAt < 90 * D)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function isRepeat(sb: Sandbox, j: Job, trade = j.trade) {
  return priorJobs(sb, j).some((x) => FAMILY[x.trade] === FAMILY[trade]);
}

function median(xs: number[]) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function kpis(sb: Sandbox, now: number) {
  const open = sb.jobs.filter((j) => j.stage !== "invoiced");
  const ackHours = sb.jobs.filter((j) => j.triage?.confirmedAt).map((j) => (j.triage!.confirmedAt! - j.createdAt) / H);
  const urgent = sb.jobs.filter((j) => j.urgency === "urgent" && j.bookedFor);
  const urgentOnTime = urgent.filter((j) => {
    const sent = j.events.find((e) => e.text.startsWith("Urgent: sent"));
    return sent && (sent.at - j.createdAt) / H <= TARGET_HOURS.urgent.new!;
  });
  const waitingOwner = sb.jobs.filter((j) => j.stage === "owner");
  const oldestOwner = waitingOwner.reduce((m, j) => Math.max(m, now - stageClock(j, now).since), 0);
  const monthStart = now - 30 * D;
  const spend = sb.jobs.filter((j) => j.invoice && j.invoice.at >= monthStart).reduce((s, j) => s + j.invoice!.amount, 0);
  const late = open.filter((j) => stageClock(j, now).state === "late").length;
  const repeats = new Set(sb.jobs.filter((j) => isRepeat(sb, j)).map((j) => j.propertyId)).size;
  // Hours saved: every job routed through the board avoids, by the agency's own
  // estimate, about 25 minutes of calls and emails (shown on the page as an estimate).
  const routed = sb.jobs.filter((j) => j.triage?.confirmedAt).length;
  return {
    open: open.length,
    late,
    medianAckHours: median(ackHours),
    urgentOnTimePct: urgent.length ? Math.round((urgentOnTime.length / urgent.length) * 100) : 100,
    waitingOwner: waitingOwner.length,
    oldestOwnerHours: oldestOwner / H,
    spend30: spend,
    repeatProperties: repeats,
    hoursSaved: Math.round((routed * 25) / 60),
  };
}
