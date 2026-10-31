"use client";

import { IconCheck, IconMoon } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { earliestVisit, noticeHours } from "@/lib/tapline/actions";
import { REGION, money, slots, stageLabel, taxIn, terms, tradeLabel, when } from "@/lib/tapline/rules";
import { DEMO_PROPERTY } from "@/lib/tapline/seed";
import type { Access, Job, Sandbox } from "@/lib/tapline/types";
import { PhotoPick } from "./PhonePieces";
import { AmountInput, parseAmount, useAnnouncer } from "./ui";
import { useSandbox } from "./useSandbox";

// What the tenant, the owner and the contractor see on their own phones,
// opened from a text-message link. No logins: the link is the key (here, the
// demo id plus the job id). The desktop board polls, so every tap here moves
// the card there within a few seconds.

export type PhoneRole = "tenant" | "owner" | "tradie";
const H = 3600_000;
type S = ReturnType<typeof useSandbox>;

function jobFromUrl(sb: Sandbox | null): Job | null {
  if (!sb || typeof window === "undefined") return null;
  const id = new URL(window.location.href).searchParams.get("job");
  return sb.jobs.find((j) => j.id === id) ?? null;
}

export default function PhoneView({ role }: { role: PhoneRole }) {
  const s = useSandbox();
  const [jobId, setJobId] = useState<string | null>(null);
  const sb = s.sb;
  const announce = useAnnouncer(sb);

  if (!sb) {
    return (
      <div className="tl-m">
        <p className="tl-m-wait" role="status">
          {s.error ?? "Opening..."}
        </p>
      </div>
    );
  }
  // One status region, mounted from the first render, so every change after a tap is announced.
  const status = (
    <p className="tl-sr" role="status">
      {announce}
    </p>
  );

  const c = terms(sb.region);
  const job = (jobId && sb.jobs.find((j) => j.id === jobId)) || jobFromUrl(sb);
  const who = role === "tenant" ? "Repairs" : role === "owner" ? `${cap(c.owner)} approvals` : `Job for you`;

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
          <span>{who}</span>
        </div>
      </header>
      <p className="tl-m-demo">Demo with fictional data.</p>
      {s.error && (
        <p className="tl-m-error" role="alert">
          {s.error}
        </p>
      )}
      <main>
        {role === "tenant" &&
          (job ? (
            <TenantStatus s={s} j={job} />
          ) : (
            <TenantForm
              s={s}
              onSent={(id) => {
                setJobId(id);
                const u = new URL(window.location.href);
                u.searchParams.set("job", id);
                window.history.replaceState(null, "", u);
                s.triage(id);
              }}
            />
          ))}
        {role === "owner" && (job ? <OwnerView s={s} j={job} /> : <Missing />)}
        {role === "tradie" && (job ? <ContractorView s={s} j={job} /> : <Missing />)}
      </main>
      {status}
    </div>
  );
}

const cap = (x: string) => x[0].toUpperCase() + x.slice(1);

function Missing() {
  return <p className="tl-m-card">This link has no job attached. Open it from the board.</p>;
}

function Photo({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="tl-job-photo" src={src} alt={alt} />;
}

function TenantForm({ s, onSent }: { s: S; onSent: (id: string) => void }) {
  const sb = s.sb!;
  const p = sb.properties.find((x) => x.id === DEMO_PROPERTY)!;
  const c = terms(sb.region);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [access, setAccess] = useState<Access>({ mode: "home", note: "", pets: false });
  const [afterHours, setAfterHours] = useState(true);
  return (
    <form
      className="tl-m-card"
      onSubmit={async (e) => {
        e.preventDefault();
        const d = await s.act({ type: "report", propertyId: p.id, title, description: desc, photo, access, afterHours });
        if (d?.jobId) onSent(d.jobId);
      }}
    >
      <h1>Report a repair</h1>
      <p className="tl-m-sub">
        {p.address}, {p.suburb}
        <br />
        Hi {p.tenant.split(" ")[0]}, tell us what&apos;s wrong. A photo helps us send the right {c.contractor}.
      </p>
      <label className="tl-field">
        <span>What&apos;s the problem?</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="For example: water through the ceiling" required />
      </label>
      <label className="tl-field">
        <span>Tell us more</span>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} maxLength={600} placeholder="Where is it, when did it start, is it getting worse?" />
      </label>
      <fieldset className="tl-field tl-radios">
        <legend>Access</legend>
        {(
          [
            ["home", "I'll be home"],
            ["keys", "Use the office keys"],
            ["times", "Only at certain times"],
          ] as const
        ).map(([m, l]) => (
          <label key={m} className="tl-radio">
            <input type="radio" name="tl-m-access" checked={access.mode === m} onChange={() => setAccess({ ...access, mode: m })} /> {l}
          </label>
        ))}
        {access.mode === "times" && <input aria-label="When are you available?" placeholder="For example weekday mornings" value={access.note} onChange={(e) => setAccess({ ...access, note: e.target.value })} maxLength={160} />}
        <label className="tl-check">
          <input type="checkbox" checked={access.pets} onChange={(e) => setAccess({ ...access, pets: e.target.checked })} /> There are pets at home
        </label>
      </fieldset>
      <PhotoPick label="Add a photo" onPick={setPhoto} />
      <label className="tl-check tl-afterhours">
        <input type="checkbox" checked={afterHours} onChange={(e) => setAfterHours(e.target.checked)} />
        <IconMoon size={15} aria-hidden="true" /> Demo: pretend it&apos;s 9:47 pm
      </label>
      <button type="submit" className="tl-btn tl-btn-primary tl-wide" disabled={s.busy || title.trim().length < 3}>
        {s.busy ? "Sending..." : "Send report"}
      </button>
      {title.trim().length < 3 && <p className="tl-hint">Describe the problem in a few words to send it.</p>}
      <p className="tl-m-fine">If anyone is in danger, call {sb.region === "AU" ? "000" : "999"} first.</p>
    </form>
  );
}

function TenantStatus({ s, j }: { s: S; j: Job }) {
  const sb = s.sb!;
  const c = terms(sb.region);
  const h1 = useRef<HTMLHeadingElement>(null);
  // The form has just been replaced by this view: move focus to its heading.
  useEffect(() => h1.current?.focus(), []);
  const booked = ["booked", "done", "billed"].includes(j.stage);
  const steps = ["Received", `${cap(c.contractor)} ${booked ? "arranged" : "contacted"}`, "Visit booked", "Fixed"];
  const at = j.stage === "new" ? 0 : j.stage === "sent" || j.stage === "owner" ? 1 : j.stage === "booked" ? 2 : 3;
  const con = sb.contractors.find((t) => t.id === j.contractorId);
  const t = j.triage;
  const autoSafety = j.afterHours && j.stage !== "new" && t && !t.confirmedAt;
  return (
    <div className="tl-m-card">
      <h1 ref={h1} tabIndex={-1}>
        {j.title}
      </h1>
      <p className="tl-m-sub">Reference {j.ref}</p>
      <p className="tl-sr">
        Step {at + 1} of 4: {steps[at]}.
      </p>
      <ol className="tl-m-steps" aria-hidden="true">
        {steps.map((x, i) => (
          <li key={x} className={i <= at ? "on" : ""}>
            {i < at && <IconCheck size={14} aria-hidden="true" />} {x}
          </li>
        ))}
      </ol>
      {t && (t.confirmedAt || autoSafety) && t.emergency.length > 0 && t.urgency === "urgent" && (
        <div className="tl-emergency" role="status">
          <p className="tl-emergency-h">Safety first</p>
          <ul>
            {t.emergency.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      )}
      {t?.confirmedAt ? (
        <div className="tl-m-msg">
          <b>Message from {sb.agency}</b>
          <p className="tl-pre">{t.reply}</p>
          {t.safety.length > 0 && (
            <>
              <b>While you wait</b>
              <ul>
                {t.safety.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : autoSafety ? (
        <p className="tl-m-wait">We&apos;ve contacted our on-call {c.contractor}. Your {c.manager} will follow up during office hours.</p>
      ) : (
        <p className="tl-m-wait">Thanks, your {c.manager} has your report. You&apos;ll get a reply here and by text.</p>
      )}
      {j.bookedFor && j.stage === "booked" && (
        <p>
          {con?.business} is booked for <b>{when(sb.region, j.bookedFor)}</b>.
        </p>
      )}
      <Photo src={s.photoUrl(j.photo)} alt="The photo you sent" />
    </div>
  );
}

function OwnerView({ s, j }: { s: S; j: Job }) {
  const sb = s.sb!;
  const c = terms(sb.region);
  const p = sb.properties.find((x) => x.id === j.propertyId)!;
  const o = sb.owners.find((x) => x.id === p.ownerId)!;
  const con = sb.contractors.find((t) => t.id === j.contractorId);
  const [ask, setAsk] = useState(false);
  const [question, setQuestion] = useState("");
  return (
    <div className="tl-m-card">
      <p className="tl-m-sub">Hi {o.name.split(" ")[0]}, a repair at your property needs your OK.</p>
      <h1>{j.title}</h1>
      <p className="tl-m-sub">
        {p.address}, {p.suburb}
      </p>
      <Photo src={s.photoUrl(j.photo)} alt="The tenant's photo" />
      <dl className="tl-m-dl">
        <dt>Quote</dt>
        <dd>{j.quote ? `${money(sb.region, j.quote.amount)} incl. ${c.tax}` : "Not yet received"}</dd>
        {j.quote?.note && (
          <>
            <dt>Details</dt>
            <dd>{j.quote.note}</dd>
          </>
        )}
        <dt>{cap(c.contractor)}</dt>
        <dd>
          {con?.business} ({tradeLabel(sb.region, j.trade)})
        </dd>
        <dt>Your approval limit</dt>
        <dd>{money(sb.region, o.approvalLimit)}</dd>
      </dl>
      {j.stage === "owner" ? (
        <div className="tl-m-actions">
          <button type="button" className="tl-btn tl-btn-primary tl-wide" disabled={s.busy} onClick={() => s.act({ type: "owner", jobId: j.id, decision: "approved" })}>
            Approve {j.quote ? money(sb.region, j.quote.amount) : ""}
          </button>
          <button type="button" className="tl-btn tl-btn-quiet tl-wide" disabled={s.busy} onClick={() => s.act({ type: "owner", jobId: j.id, decision: "declined", note: "Please call me first" })}>
            Decline
          </button>
          {!ask ? (
            <button type="button" className="tl-btn tl-btn-ghost tl-wide" onClick={() => setAsk(true)}>
              Ask a question
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                s.act({ type: "ownerQuestion", jobId: j.id, text: question }).then((d) => d && setAsk(false));
              }}
            >
              <label className="tl-field">
                <span>Your question for the {c.manager}</span>
                <textarea rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={300} autoFocus />
              </label>
              <button type="submit" className="tl-btn tl-btn-primary tl-wide" disabled={s.busy || !question.trim()}>
                Send question
              </button>
            </form>
          )}
          <p className="tl-m-fine">If you decline, your {c.manager} will call you: the repair still needs doing.</p>
        </div>
      ) : (
        <p className="tl-m-done" role="status">
          {j.ownerDecision?.decision === "declined" ? `Declined. Your ${c.manager} will call you.` : j.ownerDecision ? "Thanks, approved." : `Status: ${stageLabel(sb.region, j.stage)}.`}
        </p>
      )}
      {j.ownerQuestion && j.stage === "owner" && <p className="tl-m-fine">You asked: &ldquo;{j.ownerQuestion}&rdquo;</p>}
    </div>
  );
}

function ContractorView({ s, j }: { s: S; j: Job }) {
  const sb = s.sb!;
  const c = terms(sb.region);
  const R = REGION[sb.region];
  const p = sb.properties.find((x) => x.id === j.propertyId)!;
  const con = sb.contractors.find((t) => t.id === j.contractorId);
  const urgent = j.urgency === "urgent";
  const [agreed, setAgreed] = useState(false);
  const notice = noticeHours(sb, j);
  const options = urgent ? [0.5, 1, 2].map((h) => s.now + h * H) : slots(sb.region, earliestVisit(sb, j, s.now, agreed), 3, 0);
  const [slot, setSlot] = useState(0);
  const [mode, setMode] = useState<"accept" | "quote">("accept");
  const [amount, setAmount] = useState(String(j.cap ? Math.round(j.cap * 1.4) : 520));
  const [note, setNote] = useState("");
  const [inv, setInv] = useState(String(j.quote?.amount ?? Math.min(j.cap ?? 380, 380)));
  const [photo, setPhoto] = useState<string | undefined>();
  const access = j.access?.mode === "keys" ? "Collect keys from the office" : j.access?.mode === "times" ? `Tenant available: ${j.access.note || "call first"}` : "Tenant will be home";

  return (
    <div className="tl-m-card">
      <p className="tl-m-sub">
        {con?.business}
        {urgent && (
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
      <p className="tl-pre">&ldquo;{j.description}&rdquo;</p>
      <Photo src={s.photoUrl(j.photo)} alt="The tenant's photo" />
      <dl className="tl-m-dl">
        <dt>Access</dt>
        <dd>
          {access}
          {j.access?.pets ? ". Pets at home." : ""}
        </dd>
        {j.cap && !urgent && (
          <>
            <dt>{cap(c.workOrder)} limit</dt>
            <dd>{money(sb.region, j.cap)} incl. {c.tax}. Quote first if it will cost more.</dd>
          </>
        )}
        {j.triage?.chargeTo === "tenant" && (
          <>
            <dt>Charge to</dt>
            <dd>The tenant</dd>
          </>
        )}
      </dl>

      {j.stage === "sent" && (
        <>
          {!urgent && (
            <div className="tl-seg tl-wide-seg" role="group" aria-label="Your response">
              <button type="button" aria-pressed={mode === "accept"} onClick={() => setMode("accept")}>
                Accept and book
              </button>
              <button type="button" aria-pressed={mode === "quote"} onClick={() => setMode("quote")}>
                It will cost more
              </button>
            </div>
          )}
          {mode === "accept" || urgent ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                s.act({ type: "accept", jobId: j.id, slot: options[slot], tenantAgreed: agreed });
              }}
            >
              <fieldset className="tl-field tl-radios">
                <legend>{urgent ? "How soon can you be there?" : "Pick a visit time"}</legend>
                {options.map((t, i) => (
                  <label key={t} className="tl-radio">
                    <input type="radio" name="tl-slot" checked={slot === i} onChange={() => setSlot(i)} /> {urgent ? `Within ${[30, 60, 120][i]} minutes` : when(sb.region, t)}
                  </label>
                ))}
              </fieldset>
              {!urgent && notice > 1 && (
                <label className="tl-check tl-agree">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      setSlot(0);
                    }}
                  />{" "}
                  The tenant agreed to an earlier time
                </label>
              )}
              <button type="submit" className="tl-btn tl-btn-primary tl-wide" disabled={s.busy}>
                Accept and book
              </button>
              {!urgent && <p className="tl-m-fine">{R.entryNote} The tenant is told the time once you accept.</p>}
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                s.act({ type: "quote", jobId: j.id, amount: parseAmount(amount), note: note || "Labour and parts", earliest: options[0] });
              }}
            >
              <AmountInput label="Your quote" value={amount} onChange={setAmount} currency={R.currency} tax={c.tax} />
              <label className="tl-field">
                <span>What it covers</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="For example: replace the cartridge, 2 hours labour" />
              </label>
              <button type="submit" className="tl-btn tl-btn-primary tl-wide" disabled={s.busy || Number.isNaN(parseAmount(amount))}>
                Send quote
              </button>
            </form>
          )}
        </>
      )}

      {j.stage === "owner" && <p className="tl-m-wait">Quote sent. Waiting for the {c.owner} to approve.</p>}

      {j.stage === "booked" && (
        <div>
          <p>
            Booked for <b>{j.bookedFor ? when(sb.region, j.bookedFor) : "a time to confirm"}</b>.
          </p>
          <PhotoPick label="Add a completion photo" onPick={setPhoto} />
          <button type="button" className="tl-btn tl-btn-primary tl-wide" disabled={s.busy} onClick={() => s.act({ type: "complete", jobId: j.id, photo })}>
            Mark job complete
          </button>
        </div>
      )}

      {j.stage === "done" && !j.invoice && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            s.act({ type: "invoice", jobId: j.id, amount: parseAmount(inv) });
          }}
        >
          <AmountInput label="Invoice amount" value={inv} onChange={setInv} currency={R.currency} tax={c.tax} />
          {!Number.isNaN(parseAmount(inv)) && (
            <p className="tl-m-fine">
              Includes {money(sb.region, taxIn(sb.region, parseAmount(inv)))} {c.tax}.
            </p>
          )}
          <button type="submit" className="tl-btn tl-btn-primary tl-wide" disabled={s.busy || Number.isNaN(parseAmount(inv))}>
            Upload invoice
          </button>
        </form>
      )}
      {j.stage === "done" && j.invoice?.overApproved && <p className="tl-m-wait">Invoice received. It is above the approved amount, so the {c.manager} will check it with you.</p>}
      {(j.stage === "billed" || j.stage === "new") && (
        <p className="tl-m-done" role="status">
          {j.stage === "billed" ? "Invoice received and entered. Thanks for the job." : `This job is back with the ${c.manager}.`}
        </p>
      )}
    </div>
  );
}
