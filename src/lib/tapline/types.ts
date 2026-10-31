// Tapline: the repairs desk demo. Every record here is fictional.

export type Region = "AU" | "UK";
export type Trade = "plumber" | "gas" | "electrician" | "locksmith" | "handyman" | "roofer" | "hvac" | "pest" | "glazier" | "damp";
export type Urgency = "urgent" | "routine";
/** new: reported · sent: with the contractor (work order or quote request) · owner: over-limit quote waiting on
 * the owner · booked: visit booked · done: work complete · billed: bill entered in the trust accounting system */
export type Stage = "new" | "sent" | "owner" | "booked" | "done" | "billed";
export type ChargeTo = "owner" | "tenant" | "strata";
export type Actor = "tenant" | "manager" | "owner" | "contractor" | "tapline";

export type Manager = { id: string; name: string; initials: string };
export type Owner = { id: string; name: string; email: string; approvalLimit: number };
export type Contractor = {
  id: string;
  name: string;
  business: string;
  trade: Trade;
  onCall: boolean;
  /** Empty when the trade needs no licence (most UK trades); the card then shows insurance only. */
  licence: string;
  licenceExpires: number;
  insuranceExpires: number;
};
export type Property = {
  id: string;
  address: string;
  suburb: string;
  postcode: string;
  ownerId: string;
  managerId: string;
  tenant: string;
  beds: number;
  hasGas: boolean;
  hasPool: boolean;
  /** Strata title (AU) or leasehold flat in a managed block (UK). */
  strata?: { manager: string; phone: string };
  keysAtOffice: boolean;
};

export type Access = { mode: "home" | "keys" | "times"; note: string; pets: boolean };

export type Triage = {
  source: "ai" | "rules";
  /** When this suggestion was made; the drawer keys its editable fields on it. */
  at: number;
  trade: Trade;
  urgency: Urgency;
  reason: string;
  safety: string[];
  /** Fixed, pre-approved emergency text added by code for the hazard found (never written by the AI). */
  emergency: string[];
  reply: string;
  chargeTo: ChargeTo;
  strataReferral: boolean;
  insuranceClaim: boolean;
  repeatOf?: { ref: string; title: string; trade: Trade; daysAgo: number };
  confirmedAt?: number;
  /** Words the keyword rules raised it on, when the AI said routine (shown in the log, never hidden). */
  raisedBy?: string[];
};

export type JobEvent = { at: number; by: Actor; text: string };

export type Job = {
  id: string;
  ref: string;
  propertyId: string;
  createdAt: number;
  stageEnteredAt: number;
  title: string;
  description: string;
  /** Photo ids (stored separately); the sandbox only keeps the reference. */
  photo?: string;
  donePhoto?: string;
  access?: Access;
  afterHours?: boolean;
  trade: Trade;
  urgency: Urgency;
  stage: Stage;
  triage?: Triage;
  contractorId?: string;
  /** Not-to-exceed amount: the owner's limit for routine work, the agency's urgent limit for urgent or tenant-charged work. */
  cap?: number;
  /** A deadline set by law (NSW smoke alarms: 2 business days); the timer counts against it. */
  dueBy?: number;
  quote?: { amount: number; note: string; at: number };
  ownerDecision?: { decision: "approved" | "declined" | "auto" | "urgent"; at: number; note?: string };
  ownerQuestion?: string;
  /** ownerDeclined: waiting on a call to the owner. strata: common property, referred to the strata or block manager, who arranges and pays. */
  hold?: "ownerDeclined" | "strata";
  bookedFor?: number;
  completedAt?: number;
  invoice?: { amount: number; at: number; overApproved: boolean };
  billedAt?: number;
  /** Compliance check this job services, if any. */
  complianceId?: string;
  events: JobEvent[];
};

export type ComplianceItem = {
  id: string;
  propertyId: string;
  kind: string;
  lastDoneAt: number;
  dueAt: number;
};

export type Sandbox = {
  id: string;
  region: Region;
  createdAt: number;
  agency: string;
  managers: Manager[];
  owners: Owner[];
  contractors: Contractor[];
  properties: Property[];
  jobs: Job[];
  compliance: ComplianceItem[];
};
