// Tapline: the repairs desk demo. Every record here is fictional.

export type Region = "AU" | "UK";
export type Trade = "plumber" | "electrician" | "locksmith" | "handyman" | "roofer" | "hvac" | "pest" | "glazier";
export type Urgency = "urgent" | "routine";
export type Stage = "new" | "quote" | "owner" | "booked" | "done" | "invoiced";

export type Manager = { id: string; name: string; initials: string };
export type Owner = { id: string; name: string; email: string; approvalLimit: number };
export type Tradie = { id: string; name: string; business: string; trade: Trade; onCall: boolean };
export type Property = {
  id: string;
  address: string;
  suburb: string;
  ownerId: string;
  managerId: string;
  tenant: string;
  beds: number;
};

export type TriageSource = "ai" | "rules";
export type Triage = {
  source: TriageSource;
  trade: Trade;
  urgency: Urgency;
  reason: string;
  safety: string[];
  reply: string;
  repeat: boolean;
  confirmedAt?: number;
};

export type JobEvent = { at: number; by: "tenant" | "manager" | "owner" | "tradie" | "system"; text: string };

export type Job = {
  id: string;
  ref: string;
  propertyId: string;
  createdAt: number;
  title: string;
  description: string;
  photo?: string;
  trade: Trade;
  urgency: Urgency;
  stage: Stage;
  triage?: Triage;
  tradieId?: string;
  quote?: { amount: number; note: string; at: number };
  ownerDecision?: { decision: "approved" | "declined" | "auto"; at: number };
  bookedFor?: number;
  completedAt?: number;
  invoice?: { amount: number; at: number };
  events: JobEvent[];
};

export type ComplianceItem = {
  id: string;
  propertyId: string;
  item: string;
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
  tradies: Tradie[];
  properties: Property[];
  jobs: Job[];
  compliance: ComplianceItem[];
};
