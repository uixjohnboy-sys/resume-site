import { REGION, money, TRADE_LABEL } from "./rules";
import type { Job, Sandbox, Trade, Triage, Urgency } from "./types";

// Every change to a sandbox goes through apply(). Pure: takes a sandbox and an
// action, returns the new sandbox or an error message. The API route loads,
// applies and saves; nothing else writes.

export type Action =
  | { type: "report"; propertyId: string; title: string; description: string; photo?: string }
  | { type: "triage"; jobId: string; triage: Triage }
  | { type: "confirm"; jobId: string; trade: Trade; urgency: Urgency; reply: string }
  | { type: "quote"; jobId: string; amount: number; note: string; earliest: number }
  | { type: "owner"; jobId: string; decision: "approved" | "declined" }
  | { type: "complete"; jobId: string; photo?: string }
  | { type: "invoice"; jobId: string; amount: number }
  | { type: "complianceJob"; complianceId: string };

type Result = { ok: true; sb: Sandbox; jobId?: string } | { ok: false; error: string };

const H = 3600_000;

function clean(s: unknown, max: number) {
  return String(s ?? "")
    .replace(/[\u0000-\u001f]+/g, " ")
    .trim()
    .slice(0, max);
}

// Photos are small JPEG data URLs made in the browser (photo.ts). Anything
// else is dropped. A sandbox keeps only the newest few, so it never grows past
// what Redis comfortably stores.
const PHOTO_MAX = 100_000;
const PHOTOS_KEPT = 6;

function okPhoto(p: unknown): string | undefined {
  return typeof p === "string" && p.startsWith("data:image/jpeg;base64,") && p.length <= PHOTO_MAX && /^[A-Za-z0-9+/=]+$/.test(p.slice(23)) ? p : undefined;
}

function trimPhotos(sb: Sandbox) {
  const slots: { j: Job; k: "photo" | "donePhoto"; at: number }[] = [];
  for (const j of sb.jobs) {
    if (j.photo?.startsWith("data:")) slots.push({ j, k: "photo", at: j.createdAt });
    if (j.donePhoto?.startsWith("data:")) slots.push({ j, k: "donePhoto", at: j.completedAt ?? j.createdAt });
  }
  slots.sort((a, b) => b.at - a.at);
  for (const s of slots.slice(PHOTOS_KEPT)) delete s.j[s.k];
}

function findJob(sb: Sandbox, id: string) {
  return sb.jobs.find((j) => j.id === id);
}

function onCall(sb: Sandbox, trade: Trade) {
  return sb.tradies.find((t) => t.trade === trade && t.onCall) ?? sb.tradies.find((t) => t.trade === trade) ?? sb.tradies[0];
}

function nextRef(sb: Sandbox) {
  const prefix = sb.region === "AU" ? "HL" : "NG";
  const max = sb.jobs.reduce((m, j) => Math.max(m, Number(j.ref.split("-")[1]) || 0), 4100);
  return `${prefix}-${max + 1}`;
}

export function apply(sb: Sandbox, a: Action, now = Date.now()): Result {
  const next: Sandbox = structuredClone(sb);
  const owner = (j: Job) => {
    const p = next.properties.find((x) => x.id === j.propertyId);
    return next.owners.find((o) => o.id === p?.ownerId);
  };

  switch (a.type) {
    case "report": {
      const prop = next.properties.find((p) => p.id === a.propertyId);
      const title = clean(a.title, 80);
      const description = clean(a.description, 600);
      if (!prop) return { ok: false, error: "Unknown property." };
      if (title.length < 3) return { ok: false, error: "Please describe the problem in a few words." };
      if (next.jobs.length > 400) return { ok: false, error: "This demo is full. Reset it to start again." };
      const job: Job = {
        id: `j${now.toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
        ref: nextRef(next),
        propertyId: prop.id,
        createdAt: now,
        title,
        description,
        photo: okPhoto(a.photo),
        trade: "handyman",
        urgency: "routine",
        stage: "new",
        events: [{ at: now, by: "tenant", text: "Reported by the tenant" }],
      };
      next.jobs.push(job);
      trimPhotos(next);
      return { ok: true, sb: next, jobId: job.id };
    }

    case "triage": {
      const j = findJob(next, a.jobId);
      if (!j || j.stage !== "new") return { ok: false, error: "Job is not waiting for triage." };
      j.triage = a.triage;
      j.trade = a.triage.trade;
      j.urgency = a.triage.urgency;
      j.events.push({
        at: now,
        by: "system",
        text: `${a.triage.source === "ai" ? "AI" : "Rules"} suggested ${TRADE_LABEL[a.triage.trade]}, ${a.triage.urgency}${a.triage.repeat ? ", repeat fault" : ""}`,
      });
      return { ok: true, sb: next };
    }

    case "confirm": {
      const j = findJob(next, a.jobId);
      if (!j || j.stage !== "new") return { ok: false, error: "Job is not waiting for triage." };
      const tradie = onCall(next, a.trade);
      j.trade = a.trade;
      j.urgency = a.urgency;
      j.tradieId = tradie.id;
      if (j.triage) {
        j.triage.confirmedAt = now;
        // The manager may have edited the AI's draft: the tenant gets their version.
        const reply = clean(a.reply, 600);
        if (reply) j.triage.reply = reply;
      }
      j.events.push({ at: now, by: "manager", text: "Triage confirmed, reply sent to the tenant" });
      if (a.urgency === "urgent") {
        j.stage = "booked";
        j.bookedFor = now + 2 * H;
        j.events.push({ at: now, by: "system", text: `Urgent: sent to on-call ${tradie.business}, owner notified` });
      } else {
        j.stage = "quote";
        j.events.push({ at: now, by: "system", text: `Quote requested from ${tradie.business}` });
      }
      return { ok: true, sb: next };
    }

    case "quote": {
      const j = findJob(next, a.jobId);
      if (!j || j.stage !== "quote") return { ok: false, error: "Job is not waiting for a quote." };
      const amount = Math.round(Number(a.amount));
      if (!Number.isFinite(amount) || amount <= 0 || amount > 50000) return { ok: false, error: "Enter a quote amount." };
      j.quote = { amount, note: clean(a.note, 200) || "Labour and parts", at: now };
      j.events.push({ at: now, by: "tradie", text: `Quote sent: ${money(next.region, amount)}` });
      const o = owner(j);
      const limit = o?.approvalLimit ?? REGION[next.region].approvalLimit;
      const earliest = Number.isFinite(a.earliest) && a.earliest > now ? a.earliest : now + 24 * H;
      if (amount <= limit) {
        j.ownerDecision = { decision: "auto", at: now };
        j.stage = "booked";
        j.bookedFor = earliest;
        j.events.push({ at: now, by: "system", text: `Auto-approved under the owner's ${money(next.region, limit)} limit, booked` });
      } else {
        j.stage = "owner";
        j.bookedFor = earliest;
        j.events.push({ at: now, by: "system", text: "Sent to the owner for approval" });
      }
      return { ok: true, sb: next };
    }

    case "owner": {
      const j = findJob(next, a.jobId);
      if (!j || j.stage !== "owner") return { ok: false, error: "Job is not waiting for the owner." };
      j.ownerDecision = { decision: a.decision, at: now };
      if (a.decision === "approved") {
        j.stage = "booked";
        j.events.push({ at: now, by: "owner", text: "Approved by the owner, tradie booked" });
      } else {
        j.stage = "new";
        j.events.push({ at: now, by: "owner", text: "Declined by the owner, back to the manager to discuss" });
      }
      return { ok: true, sb: next };
    }

    case "complete": {
      const j = findJob(next, a.jobId);
      if (!j || j.stage !== "booked") return { ok: false, error: "Job is not booked." };
      j.stage = "done";
      j.completedAt = now;
      j.donePhoto = okPhoto(a.photo);
      j.events.push({ at: now, by: "tradie", text: j.donePhoto ? "Marked complete with a photo" : "Marked complete" });
      trimPhotos(next);
      return { ok: true, sb: next };
    }

    case "invoice": {
      const j = findJob(next, a.jobId);
      if (!j || j.stage !== "done") return { ok: false, error: "Job is not complete yet." };
      const amount = Math.round(Number(a.amount));
      if (!Number.isFinite(amount) || amount <= 0 || amount > 50000) return { ok: false, error: "Enter the invoice amount." };
      j.stage = "invoiced";
      j.invoice = { amount, at: now };
      j.events.push({ at: now, by: "tradie", text: `Invoice uploaded: ${money(next.region, amount)}` });
      return { ok: true, sb: next };
    }

    case "complianceJob": {
      const c = next.compliance.find((x) => x.id === a.complianceId);
      if (!c) return { ok: false, error: "Unknown compliance item." };
      const exists = next.jobs.some((j) => j.propertyId === c.propertyId && j.title === c.item && j.stage !== "invoiced");
      if (exists) return { ok: false, error: "A job for this check is already open." };
      const trade: Trade = /gas|boiler/i.test(c.item) ? "plumber" : /electric|eicr/i.test(c.item) ? "electrician" : "electrician";
      const tradie = onCall(next, trade);
      const job: Job = {
        id: `j${now.toString(36)}c`,
        ref: nextRef(next),
        propertyId: c.propertyId,
        createdAt: now,
        title: c.item,
        description: `Scheduled compliance check, last done ${new Date(c.lastDoneAt).toLocaleDateString(REGION[next.region].locale)}.`,
        trade,
        urgency: "routine",
        stage: "quote",
        tradieId: tradie.id,
        events: [
          { at: now, by: "manager", text: "Created from the compliance view" },
          { at: now, by: "system", text: `Quote requested from ${tradie.business}` },
        ],
      };
      next.jobs.push(job);
      return { ok: true, sb: next, jobId: job.id };
    }
  }
}
