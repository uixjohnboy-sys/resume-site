import type { DayKey, HandoffReason, JobKey, Team } from "./pack.ts";

export type Stage = "New enquiry" | "Details collected" | "Booked" | "Handed to Dana";

export type Contact = {
  id: string;
  firstName: string | null;
  suburb: string | null;
  /** A seeded demo number, or a masked token such as "04xx xxx 678". */
  phone: string | null;
  bedrooms: number | null;
  access: "home" | "lockbox" | null;
  frequency: "weekly" | "fortnightly" | null;
  notes: string | null;
  stage: Stage;
  existing: boolean;
};

export type Visit = {
  id: string;
  ref: string;
  contactId: string;
  customer: string;
  suburb: string;
  team: Team;
  day: DayKey;
  start: number;
  jobKey: JobKey;
  minutes: number;
  price: number;
  repeat: boolean;
  isNew?: boolean;
};

export type Offer = {
  id: string;
  day: DayKey;
  start: number;
  team: Team;
  jobKey: JobKey;
  minutes: number;
  price: number;
  label: string;
  turn: number;
};

export type LogStatus = "done" | "checked" | "refused" | "failed" | "flagged";
export type LogEntry = {
  seq: number;
  at: number;
  actor: "ai" | "rules" | "safety" | "server";
  tool: string;
  status: LogStatus;
  code?: string;
  text: string;
  ref?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
};

export type Handoff = {
  id: string;
  contactId: string | null;
  customer: string;
  reason: HandoffReason;
  aiSummary: string;
  refused: string[];
  actor: "ai" | "rules" | "server";
};

export type Message = { from: "customer" | "agent"; text: string };

/** What actually happened this turn. Receipts and the reply guard read this, never the model's account of it. */
export type LedgerEntry =
  | { kind: "booked"; visitId: string }
  | { kind: "moved"; visitId: string; fee: number; fromLabel: string }
  | { kind: "handoff"; reason: HandoffReason }
  | { kind: "slots"; offerIds: string[] }
  | { kind: "refused"; code: string };

export type Conversation = {
  card: string | null;
  contactId: string | null;
  verifiedContactId: string | null;
  wrongPhones: number;
  messages: Message[];
  offers: Offer[];
  turn: number;
  feeNotice: { visitId: string; turn: number } | null;
  feeConsent: { visitId: string; turn: number } | null;
  /** Commitment, link or code trips of the reply guard. Format mismatches do not count. */
  strikes: number;
  noToolTurns: number;
  rulesOnly: boolean;
  jobDone: boolean;
  closed: boolean;
};

export type Sandbox = {
  contacts: Contact[];
  visits: Visit[];
  handoffs: Handoff[];
  log: LogEntry[];
  seq: number;
  nextRef: number;
  nextOffer: number;
  conv: Conversation;
};
