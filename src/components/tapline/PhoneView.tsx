"use client";

import { useState } from "react";
import { REGION, STAGES, TRADE_LABEL, money, when } from "@/lib/tapline/rules";
import { DEMO_PROPERTY } from "@/lib/tapline/seed";
import type { Job, Sandbox } from "@/lib/tapline/types";
import { shrinkPhoto } from "./photo";
import { useSandbox } from "./useSandbox";

// What the tenant, the owner and the tradie see on their own phones, opened
// from a text-message link. No logins: the link itself is the key (here, the
// demo id plus the job id). The desktop board polls, so every tap here moves
// the card there within a few seconds.

export type PhoneRole = "tenant" | "owner" | "tradie";
const H = 3600_000;

function jobFromUrl(sb: Sandbox | null): Job | null {
  if (!sb || typeof window === "undefined") return null;
  const id = new URL(window.location.href).searchParams.get("job");
  return sb.jobs.find((j) => j.id === id) ?? null;
}

export default function PhoneView({ role }: { role: PhoneRole }) {
  const { sb, now, error, busy, act, triage } = useSandbox();
  const [jobId, setJobId] = useState<string | null>(null);

  if (!sb) {
    return (
      <div className="tl-m">
        <p className="tl-m-wait">{error ?? "Opening..."}</p>
      </div>
    );
  }

  const job = (jobId && sb.jobs.find((j) => j.id === jobId)) || jobFromUrl(sb);

  return (
    <div className="tl-m">
      <header className="tl-m-top">
        <span className="tl-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M12 2.5c3 4 6 7.3 6 10.7a6 6 0 1 1-12 0c0-3.4 3-6.7 6-10.7Z" fill="currentColor" />
          </svg>
        </span>
        <div>
          <b>{sb.agency}</b>
          <span>{role === "tenant" ? "Repairs" : role === "owner" ? "Owner approvals" : "Job for you"}</span>
        </div>
      </header>
      <p className="tl-m-demo">Demo: fictional agency and data.</p>
      {error && (
        <p className="tl-m-error" role="alert">
          {error}
        </p>
      )}

      {role === "tenant" &&
        (job ? (
          <TenantStatus sb={sb} j={job} />
        ) : (
          <TenantForm
            sb={sb}
            busy={busy}
            onSend={async (title, description, photo) => {
              const d = await act({ type: "report", propertyId: DEMO_PROPERTY, title, description, photo });
              if (d?.jobId) {
                setJobId(d.jobId);
                const u = new URL(window.location.href);
                u.searchParams.set("job", d.jobId);
                window.history.replaceState(null, "", u);
                triage(d.jobId);
              }
            }}
          />
        ))}

      {role === "owner" && (job ? <OwnerView sb={sb} j={job} busy={busy} act={act} /> : <Missing />)}
      {role === "tradie" && (job ? <TradieView sb={sb} j={job} now={now} busy={busy} act={act} /> : <Missing />)}
    </div>
  );
}

function Missing() {
  return <p className="tl-m-card">This link has no job attached. Open it from the board.</p>;
}

function Photo({ src, alt }: { src?: string; alt: string }) {
  if (!src?.startsWith("data:image/")) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="tl-m-photo" src={src} alt={alt} />;
}

function PhotoPick({ onPick, label }: { onPick: (url: string | undefined) => void; label: string }) {
  const [note, setNote] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | undefined>();
  return (
    <div className="tl-m-photopick">
      <label className="tl-m-filebtn">
        {preview ? "Change photo" : label}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              setNote("Preparing photo...");
              const url = await shrinkPhoto(f);
              setPreview(url);
              onPick(url);
              setNote(null);
            } catch (err) {
              setNote(err instanceof Error ? err.message : "Could not use that photo.");
            }
          }}
        />
      </label>
      {note && <span className="tl-m-note">{note}</span>}
      <Photo src={preview} alt="Your photo" />
    </div>
  );
}

function TenantForm({ sb, busy, onSend }: { sb: Sandbox; busy: boolean; onSend: (t: string, d: string, p?: string) => void }) {
  const p = sb.properties.find((x) => x.id === DEMO_PROPERTY)!;
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  return (
    <form
      className="tl-m-card"
      onSubmit={(e) => {
        e.preventDefault();
        onSend(title, desc, photo);
      }}
    >
      <h1>Report a repair</h1>
      <p className="tl-m-sub">
        {p.address}, {p.suburb}
        <br />
        Hi {p.tenant.split(" ")[0]}, tell us what is wrong. A photo helps us send the right tradie.
      </p>
      <label>
        What&apos;s the problem?
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="For example: water through the ceiling" required />
      </label>
      <label>
        Tell us more
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} maxLength={600} placeholder="Where is it, when did it start, is it getting worse?" />
      </label>
      <PhotoPick label="Add a photo" onPick={setPhoto} />
      <button type="submit" className="tl-btn tl-btn-primary tl-wide" disabled={busy || title.trim().length < 3}>
        {busy ? "Sending..." : "Send report"}
      </button>
      <p className="tl-m-fine">If anyone is in danger, call emergency services first.</p>
    </form>
  );
}

function TenantStatus({ sb, j }: { sb: Sandbox; j: Job }) {
  const steps: { id: string; label: string }[] = [
    { id: "new", label: "Received" },
    { id: "assigned", label: "Tradie arranged" },
    { id: "booked", label: "Visit booked" },
    { id: "done", label: "Fixed" },
  ];
  const at = j.stage === "new" ? 0 : j.stage === "quote" || j.stage === "owner" ? 1 : j.stage === "booked" ? 2 : 3;
  const tradie = sb.tradies.find((t) => t.id === j.tradieId);
  return (
    <div className="tl-m-card">
      <h1>{j.title}</h1>
      <p className="tl-m-sub">Reference {j.ref}</p>
      <ol className="tl-m-steps">
        {steps.map((s, i) => (
          <li key={s.id} className={i <= at ? "on" : ""}>
            {s.label}
          </li>
        ))}
      </ol>
      {j.triage?.confirmedAt ? (
        <div className="tl-m-msg">
          <b>Message from {sb.agency}</b>
          <p>{j.triage.reply || "Thanks, we have this in hand."}</p>
          {j.triage.safety.length > 0 && (
            <ul>
              {j.triage.safety.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="tl-m-wait">Thanks, your property manager has your report. You will get a reply here and by text.</p>
      )}
      {j.bookedFor && j.stage === "booked" && (
        <p>
          {tradie?.business} is booked for <b>{when(sb.region, j.bookedFor)}</b>.
        </p>
      )}
      <Photo src={j.photo} alt="The photo you sent" />
    </div>
  );
}

function OwnerView({ sb, j, busy, act }: { sb: Sandbox; j: Job; busy: boolean; act: ReturnType<typeof useSandbox>["act"] }) {
  const p = sb.properties.find((x) => x.id === j.propertyId)!;
  const o = sb.owners.find((x) => x.id === p.ownerId)!;
  const tradie = sb.tradies.find((t) => t.id === j.tradieId);
  return (
    <div className="tl-m-card">
      <p className="tl-m-sub">Hi {o.name.split(" ")[0]}, a repair at your property needs your OK.</p>
      <h1>{j.title}</h1>
      <p className="tl-m-sub">
        {p.address}, {p.suburb}
      </p>
      <Photo src={j.photo} alt="Tenant's photo" />
      <dl className="tl-m-dl">
        <dt>Quote</dt>
        <dd>{j.quote ? money(sb.region, j.quote.amount) : "Not yet received"}</dd>
        <dt>Tradie</dt>
        <dd>
          {tradie?.business} ({TRADE_LABEL[j.trade]})
        </dd>
        <dt>Your auto-approve limit</dt>
        <dd>{money(sb.region, o.approvalLimit)}</dd>
      </dl>
      {j.stage === "owner" ? (
        <div className="tl-m-actions">
          <button type="button" className="tl-btn tl-btn-primary tl-wide" disabled={busy} onClick={() => act({ type: "owner", jobId: j.id, decision: "approved" })}>
            Approve {j.quote ? money(sb.region, j.quote.amount) : ""}
          </button>
          <button type="button" className="tl-btn tl-btn-quiet tl-wide" disabled={busy} onClick={() => act({ type: "owner", jobId: j.id, decision: "declined" })}>
            Decline and talk to my manager
          </button>
        </div>
      ) : (
        <p className="tl-m-done">{j.ownerDecision ? `Thanks, ${j.ownerDecision.decision === "declined" ? "declined" : "approved"}.` : `Status: ${STAGES.find((s) => s.id === j.stage)?.label}.`}</p>
      )}
    </div>
  );
}

function TradieView({ sb, j, now, busy, act }: { sb: Sandbox; j: Job; now: number; busy: boolean; act: ReturnType<typeof useSandbox>["act"] }) {
  const p = sb.properties.find((x) => x.id === j.propertyId)!;
  const tradie = sb.tradies.find((t) => t.id === j.tradieId);
  const [amount, setAmount] = useState("380");
  const [slot, setSlot] = useState(0);
  const [inv, setInv] = useState(String(j.quote?.amount ?? 380));
  const [photo, setPhoto] = useState<string | undefined>();
  const slots = [18, 24, 42].map((h) => now + h * H);
  return (
    <div className="tl-m-card">
      <p className="tl-m-sub">
        {tradie?.business}
        {j.urgency === "urgent" && (
          <>
            {" "}
            <span className="tl-pill tl-pill-urgent">Urgent</span>
          </>
        )}
      </p>
      <h1>{j.title}</h1>
      <p className="tl-m-sub">
        {p.address}, {p.suburb} · Tenant {p.tenant}
      </p>
      <p>&ldquo;{j.description}&rdquo;</p>
      <Photo src={j.photo} alt="Tenant's photo" />

      {j.stage === "quote" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            act({ type: "quote", jobId: j.id, amount: Number(amount), note: "Labour and parts", earliest: slots[slot] });
          }}
        >
          <label>
            Your quote ({REGION[sb.region].currency})
            <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} />
          </label>
          <fieldset className="tl-m-slots">
            <legend>Earliest time you can attend</legend>
            {slots.map((t, i) => (
              <label key={t} className="tl-m-radio">
                <input type="radio" name="slot" checked={slot === i} onChange={() => setSlot(i)} /> {when(sb.region, t)}
              </label>
            ))}
          </fieldset>
          <button type="submit" className="tl-btn tl-btn-primary tl-wide" disabled={busy}>
            Send quote
          </button>
        </form>
      )}

      {j.stage === "owner" && <p className="tl-m-wait">Quote sent. Waiting for the owner to approve.</p>}

      {j.stage === "booked" && (
        <div>
          <p>
            Booked for <b>{j.bookedFor ? when(sb.region, j.bookedFor) : "a time to confirm"}</b>.
          </p>
          <PhotoPick label="Add a completion photo" onPick={setPhoto} />
          <button type="button" className="tl-btn tl-btn-primary tl-wide" disabled={busy} onClick={() => act({ type: "complete", jobId: j.id, photo })}>
            Mark job complete
          </button>
        </div>
      )}

      {j.stage === "done" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            act({ type: "invoice", jobId: j.id, amount: Number(inv) });
          }}
        >
          <label>
            Invoice amount ({REGION[sb.region].currency})
            <input inputMode="numeric" value={inv} onChange={(e) => setInv(e.target.value.replace(/[^0-9]/g, ""))} />
          </label>
          <button type="submit" className="tl-btn tl-btn-primary tl-wide" disabled={busy}>
            Send invoice
          </button>
        </form>
      )}

      {(j.stage === "invoiced" || j.stage === "new") && <p className="tl-m-done">{j.stage === "invoiced" ? "Invoiced. Thanks for the job." : "This job is back with the property manager."}</p>}
    </div>
  );
}
