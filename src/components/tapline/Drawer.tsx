"use client";

import { IconAlertTriangle, IconBuilding, IconPaw, IconPlus, IconRepeat, IconShieldCheck, IconTrash, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { earliestVisit, noticeHours } from "@/lib/tapline/actions";
import { stageClock } from "@/lib/tapline/metrics";
import { CHARGE_LABEL, REGION, TRADE_IDS, TRADES, day, money, slots, taxIn, tenantReply, terms, tradeLabel, tradeWho, when } from "@/lib/tapline/rules";
import type { ChargeTo, Job, Sandbox, Trade, Urgency } from "@/lib/tapline/types";
import { AmountInput, InlineError, StageChip, TimerChip, TradeIcon, TryOnPhone, parseAmount, phoneLink } from "./ui";
import { useDialog } from "./useDialog";
import type { useSandbox } from "./useSandbox";

type S = ReturnType<typeof useSandbox>;
const H = 3600_000;

export default function Drawer({ id, s, j, onClose }: { id: string; s: S; j: Job; onClose: () => void }) {
  const sb = s.sb!;
  const backToCard = useCallback(() => document.querySelector<HTMLElement>(`[data-job="${j.id}"]`), [j.id]);
  const ref = useDialog(true, onClose, backToCard);
  const c = terms(sb.region);
  // After an action the button that was pressed is often gone: put focus back on the drawer's heading.
  useEffect(() => {
    const el = ref.current;
    if (el && !el.contains(document.activeElement)) el.querySelector<HTMLElement>("#tl-drawer-h")?.focus();
  }, [ref, j.stage, j.hold, j.triage?.confirmedAt, j.triage?.at, j.invoice?.at, j.ownerQuestion]);
  const p = sb.properties.find((x) => x.id === j.propertyId)!;
  const owner = sb.owners.find((o) => o.id === p.ownerId)!;
  const manager = sb.managers.find((m) => m.id === p.managerId)!;
  const con = sb.contractors.find((x) => x.id === j.contractorId);
  const clock = stageClock(j, s.now, sb.region);
  const photo = s.photoUrl(j.photo);
  const done = s.photoUrl(j.donePhoto);

  return (
    <div className="tl-drawer-wrap" role="dialog" aria-modal="true" aria-labelledby="tl-drawer-h">
      <div className="tl-scrim" aria-hidden="true" onClick={onClose} />
      <aside className="tl-drawer" ref={ref}>
        <header className="tl-drawer-head">
          <div className="tl-drawer-chips">
            <span className="tl-ref">{j.ref}</span>
            <StageChip region={sb.region} stage={j.stage} />
            {clock.state !== "none" && <TimerChip state={clock.state} hours={clock.hours} office={clock.office} />}
            {j.urgency === "urgent" && j.triage && !["done", "billed"].includes(j.stage) && <span className="tl-pill tl-pill-urgent">Urgent</span>}
          </div>
          <button type="button" className="tl-icon-btn" onClick={onClose} aria-label="Close">
            <IconX size={18} aria-hidden="true" />
          </button>
          <h2 id="tl-drawer-h">{j.title}</h2>
          <p className="tl-meta">
            <span className="tl-nowrap">
              {p.address}, {p.suburb} {p.postcode}
            </span>{" "}
            · <span className="tl-nowrap">Tenant {p.tenant}</span> ·{" "}
            <span className="tl-nowrap">
              {cap(c.owner)} {owner.name}
            </span>{" "}
            · <span className="tl-nowrap">Manager {manager.name}</span>
            {con && (
              <>
                {" "}
                · <span className="tl-nowrap">{con.business}</span>
              </>
            )}
          </p>
        </header>

        <div className="tl-drawer-body">
          <section className="tl-sec">
            <p className="tl-desc">{j.description || "No details given."}</p>
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="tl-job-photo" src={photo} alt="Photo from the tenant" />
            )}
            <Access sb={sb} j={j} />
          </section>

          {((j.stage === "new" && !j.hold) || awaitingConfirm(j)) && <TriageEditor key={`${j.id}-${j.triage?.at ?? 0}`} s={s} j={j} />}

          {j.hold === "strata" && (
            <section className="tl-sec tl-callout">
              <h3>With {p.strata?.manager ?? `the ${c.strataBody}`}</h3>
              <p>
                {`${sb.region === "AU" ? "Common property: the owners corporation arranges and pays for this repair" : "Part of the building: the block's managing agent arranges the repair, paid through the service charge"}. Follow up if it isn't fixed within 10 working days${p.strata ? ` (${p.strata.phone})` : ""}.`}
              </p>
            </section>
          )}

          {j.hold === "ownerDeclined" && (
            <section className="tl-sec tl-callout tl-callout-warn">
              <h3>{cap(c.owner)} declined the quote</h3>
              <p>{j.ownerDecision?.note ? `"${j.ownerDecision.note}" ` : ""}The repair is still needed. Call the {c.owner}, then ask for a second quote.</p>
            </section>
          )}

          {j.triage?.confirmedAt && j.triage.reply && (
            <section className="tl-sec">
              <h3>Sent to the tenant</h3>
              <p className="tl-sent">{j.triage.reply}</p>
            </section>
          )}

          {con && <ContractorCard sb={sb} conId={con.id} now={s.now} />}

          {j.stage === "sent" && <TryOnPhone url={phoneLink(id, "tradie", j.id)} who={c.contractor} />}
          {j.stage === "owner" && (
            <section className="tl-sec">
              <h3>Quote waiting on the {c.owner}</h3>
              <dl className="tl-dl">
                <dt>Quote</dt>
                <dd>{money(sb.region, j.quote?.amount ?? 0)}</dd>
                <dt>Note</dt>
                <dd>{j.quote?.note}</dd>
                <dt>{cap(c.owner)}&apos;s limit</dt>
                <dd>{money(sb.region, owner.approvalLimit)}</dd>
                {clock.hours > 24 && (
                  <>
                    <dt>Reminder</dt>
                    <dd>Automatic reminder sent to the {c.owner} after 24 hours (GoHighLevel workflow)</dd>
                  </>
                )}
                {j.ownerQuestion && (
                  <>
                    <dt>{cap(c.owner)} asked</dt>
                    <dd>&ldquo;{j.ownerQuestion}&rdquo;</dd>
                  </>
                )}
              </dl>
              <TryOnPhone url={phoneLink(id, "owner", j.id)} who={c.owner} />
            </section>
          )}
          {(j.stage === "booked" || j.stage === "done") && j.contractorId && (
            <section className="tl-sec">
              <h3>Visit</h3>
              <p>
                {j.bookedFor ? `Booked for ${when(sb.region, j.bookedFor)}` : "Time to be confirmed"}
                {j.access?.mode === "times" && j.access.note ? `. Tenant's times: ${j.access.note}` : ""}
              </p>
              {done && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="tl-job-photo" src={done} alt={`Completion photo from the ${c.contractor}`} />
              )}
              {j.invoice && (
                <p>
                  Invoice {money(sb.region, j.invoice.amount)} incl. {money(sb.region, taxIn(sb.region, j.invoice.amount))} {c.tax}
                  {j.invoice.overApproved && <b className="tl-warn-t"> · over the approved amount</b>}
                </p>
              )}
              {j.stage === "booked" && <TryOnPhone url={phoneLink(id, "tradie", j.id)} who={c.contractor} />}
            </section>
          )}
          {j.dueBy && !["done", "billed"].includes(j.stage) && (
            <p className="tl-callout">
              Smoke alarm repair: due by {when(sb.region, j.dueBy)} (NSW law, 2 business days). No {c.owner} approval needed.
            </p>
          )}

          <section className="tl-sec tl-timeline">
            <h3>Activity</h3>
            <ol>
              {[...j.events].reverse().map((e, i) => (
                <li key={i}>
                  <span className="tl-tl-time">{when(sb.region, e.at)}</span>
                  <span>
                    <b>{e.by === "tapline" ? "Tapline" : e.by === "contractor" ? cap(c.contractor) : e.by === "owner" ? cap(c.owner) : cap(e.by)}</b> {e.text}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="tl-drawer-err">
          <InlineError error={s.error} seq={s.errorSeq} onDismiss={() => s.setError(null)} />
        </div>
        <Footer key={`${j.id}-${j.stage}-${j.invoice?.at ?? 0}`} s={s} j={j} />
      </aside>
    </div>
  );
}

const cap = (x: string) => x[0].toUpperCase() + x.slice(1);

/** After hours the on-call contractor may have been paged (or have accepted) before a manager confirmed the reply. */
const awaitingConfirm = (j: Job) => j.afterHours === true && !j.triage?.confirmedAt && !!j.triage && j.stage !== "new";

function Access({ sb, j }: { sb: Sandbox; j: Job }) {
  const p = sb.properties.find((x) => x.id === j.propertyId)!;
  const a = j.access;
  const R = REGION[sb.region];
  return (
    <dl className="tl-dl tl-dl-tight">
      <dt>Access</dt>
      <dd>
        {a?.mode === "keys" ? "Use the office keys" : a?.mode === "times" ? `Tenant available: ${a.note || "times to confirm"}` : "Tenant will be home"}
        {a?.pets && (
          <span className="tl-inline-note">
            <IconPaw size={14} aria-hidden="true" /> Pets at the property
          </span>
        )}
      </dd>
      {p.strata && (
        <>
          <dt>Building</dt>
          <dd>
            <IconBuilding size={14} aria-hidden="true" /> {p.strata.manager}, <span className="tl-nowrap">{p.strata.phone}</span>
          </dd>
        </>
      )}
      <dt>Entry</dt>
      <dd>
        {j.urgency === "urgent"
          ? "Urgent repair: entry without the usual notice"
          : sb.region === "AU" && j.dueBy
            ? "Smoke alarm repair: at least 1 hour's notice to the tenant."
            : R.entryNote}
      </dd>
    </dl>
  );
}

function ContractorCard({ sb, conId, now }: { sb: Sandbox; conId: string; now: number }) {
  const con = sb.contractors.find((x) => x.id === conId)!;
  const insuranceOk = con.insuranceExpires > now;
  const licenceOk = con.licenceExpires > now;
  return (
    <section className="tl-sec tl-con">
      <h3>
        <TradeIcon trade={con.trade} size={16} /> {con.business}
      </h3>
      <p className="tl-meta">
        {con.name}
        {con.licence ? ` · ${con.licence}` : ""}
        {con.onCall ? " · On call" : ""}
      </p>
      <p className={insuranceOk && licenceOk ? "tl-ok-t" : "tl-late-t"}>
        <IconShieldCheck size={14} aria-hidden="true" /> {con.licence ? (licenceOk ? `${con.licence.startsWith("Gas Safe") ? "Gas Safe registration" : "Licence"} current · ` : "Licence expired · ") : ""}
        {insuranceOk ? `Insured until ${day(sb.region, con.insuranceExpires)}` : "Insurance expired"}
      </p>
    </section>
  );
}

/** The triage form. Keyed on the job and the suggestion's time, so polls never reset what the manager typed. */
function TriageEditor({ s, j }: { s: S; j: Job }) {
  const sb = s.sb!;
  const c = terms(sb.region);
  const p = sb.properties.find((x) => x.id === j.propertyId)!;
  const owner = sb.owners.find((o) => o.id === p.ownerId)!;
  const t = j.triage;
  const [trade, setTrade] = useState<Trade>(t?.trade ?? j.trade);
  const [urg, setUrg] = useState<Urgency>(t?.urgency ?? "routine");
  // The reply written at night describes the job as it was then. If the on-call contractor has since booked or
  // finished it, the morning reply starts from where the job is now.
  const [reply, setReply] = useState(() => {
    const con = sb.contractors.find((x) => x.id === j.contractorId);
    if (awaitingConfirm(j) && j.stage !== "sent" && con)
      return tenantReply(sb.region, sb.agency, p.tenant.split(" ")[0], j, { business: con.business, at: j.bookedFor, now: s.now });
    return t?.reply ?? "";
  });
  const [safety, setSafety] = useState<string[]>(t?.safety ?? []);
  // The suggestion as first shown, so a change of payer can swap it while the manager has not edited it.
  const suggested = useRef(reply);
  const strataReply = `Hi ${p.tenant.split(" ")[0]}, thanks for reporting this. It's part of the building's shared property, so we've passed it to ${p.strata?.manager ?? `the ${c.strataBody}`}, who will arrange the repair. We'll keep you updated.\n\n${sb.agency}`;
  const [charge, setCharge] = useState<ChargeTo>(t?.chargeTo ?? "owner");
  const [strata, setStrata] = useState(!!t?.strataReferral);
  const [ins, setIns] = useState(!!t?.insuranceClaim);
  const dispatched = awaitingConfirm(j);
  const workDone = j.stage === "done" || j.stage === "billed";
  const restands = dispatched && !workDone && (trade !== j.trade || urg !== j.urgency);

  if (!t) {
    const fresh = s.now - j.createdAt < 10 * 60_000;
    return (
      <section className="tl-sec">
        <h3>Triage</h3>
        {fresh && s.busy ? (
          <p className="tl-thinking" role="status">
            <span className="tl-dot" aria-hidden="true" /> Reading the report and this property&apos;s history...
          </p>
        ) : (
          <>
            <p>Let Tapline suggest the trade and urgency, then check it before anything is sent.</p>
            <button type="button" className="tl-btn tl-btn-primary" disabled={s.busy} onClick={() => s.triage(j.id)}>
              Suggest triage
            </button>
          </>
        )}
      </section>
    );
  }

  return (
    <section className="tl-sec tl-triage" aria-labelledby="tl-triage-h">
      <h3 id="tl-triage-h">Triage</h3>
      <p className="tl-source">{t.source === "ai" ? "Suggested by AI." : "Suggested by keyword rules (AI unavailable)."} You confirm before anything is sent.</p>
      {t.repeatOf && (
        <p className="tl-callout">
          <IconRepeat size={14} aria-hidden="true" /> Repeat fault: {t.repeatOf.ref} {t.repeatOf.title} ({TRADES[sb.region][t.repeatOf.trade].work}), {t.repeatOf.daysAgo} days ago. Ask the{" "}
          {c.contractor} to check the earlier repair.
        </p>
      )}
      {t.reason && <p className="tl-reason">{t.reason}</p>}

      <div className="tl-grid2">
        <label className="tl-field">
          <span>Trade</span>
          <select value={trade} onChange={(e) => setTrade(e.target.value as Trade)} disabled={workDone && dispatched}>
            {TRADE_IDS.map((x) => (
              <option key={x} value={x}>
                {tradeLabel(sb.region, x)}
              </option>
            ))}
          </select>
        </label>
        <div className="tl-field">
          <span id="tl-urg">Urgency</span>
          <div className="tl-seg" role="group" aria-labelledby="tl-urg">
            {(["urgent", "routine"] as const).map((u) => (
              <button
                key={u}
                type="button"
                aria-pressed={urg === u}
                disabled={workDone && dispatched}
                onClick={() => {
                  setUrg(u);
                  if (u === "routine") setSafety([]);
                  else if (!safety.length) setSafety(t.safety);
                  // An untouched reply follows the path: routine strata work is passed to the building.
                  if (charge === "strata" && (reply === suggested.current || reply === strataReply)) setReply(u === "routine" ? strataReply : suggested.current);
                }}
              >
                {u === "urgent" ? "Urgent" : "Routine"}
              </button>
            ))}
          </div>
        </div>
        <label className="tl-field">
          <span>Who pays</span>
          <select
            value={charge}
            onChange={(e) => {
              const next = e.target.value as ChargeTo;
              setCharge(next);
              // An untouched suggestion follows the payer: strata work is passed to the building, not to a tradie.
              if (reply === suggested.current || reply === strataReply) setReply(next === "strata" && urg === "routine" ? strataReply : suggested.current);
            }}
          >
            {(["owner", "tenant", ...(p.strata ? ["strata"] : [])] as ChargeTo[]).map((x) => (
              <option key={x} value={x}>
                {CHARGE_LABEL(sb.region)[x]}
              </option>
            ))}
          </select>
        </label>
        <div className="tl-field tl-checks">
          {p.strata && (
            <label className="tl-check">
              <input type="checkbox" checked={strata} onChange={(e) => setStrata(e.target.checked)} /> Refer to the {c.strataBody}
            </label>
          )}
          <label className="tl-check">
            <input type="checkbox" checked={ins} onChange={(e) => setIns(e.target.checked)} /> Possible insurance claim
          </label>
        </div>
      </div>

      {urg === "urgent" && t.emergency.length > 0 && (
        <div className="tl-emergency">
          <p className="tl-emergency-h">
            <IconAlertTriangle size={15} aria-hidden="true" /> Emergency steps (verified text, always included)
          </p>
          <ul>
            {t.emergency.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      )}

      {urg === "urgent" && (
        <fieldset className="tl-safety">
          <legend>While you wait (you can edit these)</legend>
          {safety.map((x, i) => (
            <div key={i} className="tl-safety-row">
              <label className="tl-sr" htmlFor={`tl-s-${i}`}>
                Step {i + 1}
              </label>
              <input id={`tl-s-${i}`} value={x} onChange={(e) => setSafety(safety.map((y, k) => (k === i ? e.target.value : y)))} maxLength={200} />
              <button type="button" className="tl-icon-btn" aria-label={`Remove step ${i + 1}`} onClick={() => setSafety(safety.filter((_, k) => k !== i))}>
                <IconTrash size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
          {safety.length < 4 && (
            <button type="button" className="tl-btn tl-btn-ghost tl-btn-sm" onClick={() => setSafety([...safety, ""])}>
              <IconPlus size={14} aria-hidden="true" /> Add a step
            </button>
          )}
        </fieldset>
      )}

      <label className="tl-field">
        <span>Reply to the tenant</span>
        <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={5} maxLength={900} />
      </label>
      <p className="tl-next">
        {charge === "strata" && urg === "routine" && !workDone
          ? `Confirming refers this to ${p.strata?.manager ?? `the ${c.strataBody}`}: ${sb.region === "AU" ? "common property, so the owners corporation arranges and pays" : "part of the building, so the block's managing agent arranges it through the service charge"}.${j.contractorId ? ` The on-call ${c.contractor} is stood down.` : ""} No ${c.workOrder} is sent and the ${c.owner} is not asked to approve.`
          : workDone && dispatched
          ? `The on-call ${c.contractor} has already done the work. Confirming sends this reply to ${p.tenant.split(" ")[0]}.`
          : dispatched && !restands
          ? `Confirming sends this reply to ${p.tenant.split(" ")[0]}. The on-call ${c.contractor} stays on the job.`
          : restands
            ? `Confirming sends this reply, stands down the on-call ${c.contractor} and sends the job again as ${urg === "urgent" ? `urgent to the on-call ${tradeWho(sb.region, trade)}` : `a ${c.workOrder} to ${TRADES[sb.region][trade].noun}`}.`
            : urg === "urgent"
          ? `Confirming sends this to the on-call ${tradeWho(sb.region, trade)} straight away and tells the ${c.owner}.`
          : charge === "tenant"
            ? `Confirming sends a ${c.workOrder} to ${TRADES[sb.region][trade].noun}, charged to the tenant.`
            : `Confirming sends a ${c.workOrder} to ${TRADES[sb.region][trade].noun} for up to ${money(sb.region, owner.approvalLimit)}, the ${c.owner}'s limit. Anything above it comes back as a quote.`}
      </p>
      <div className="tl-footer-slot" data-slot="triage">
        <button
          type="button"
          className="tl-btn tl-btn-primary"
          disabled={s.busy || !reply.trim()}
          onClick={() => s.act({ type: "confirm", jobId: j.id, trade, urgency: urg, reply, safety: safety.filter((x) => x.trim()), chargeTo: charge, strataReferral: strata, insuranceClaim: ins })}
        >
          Confirm and send
        </button>
        {!reply.trim() && <span className="tl-hint">Write a reply to the tenant first.</span>}
      </div>
    </section>
  );
}

/** The action for the current stage, pinned to the bottom of the drawer. */
function Footer({ s, j }: { s: S; j: Job }) {
  const sb = s.sb!;
  const c = terms(sb.region);
  const R = REGION[sb.region];
  const [agreed, setAgreed] = useState(false);
  const options = j.urgency === "urgent" ? [0.5, 1, 2].map((h) => s.now + h * H) : slots(sb.region, earliestVisit(sb, j, s.now, agreed), 3, 0);
  const notice = noticeHours(sb, j);
  const [slot, setSlot] = useState(0);
  const [mode, setMode] = useState<"accept" | "quote">("accept");
  const [amount, setAmount] = useState(String(j.cap ? Math.round(j.cap * 1.4) : 520));
  const [inv, setInv] = useState(String(j.quote?.amount ?? Math.min(j.cap ?? 380, 380)));

  let body: React.ReactNode = null;
  if (j.stage === "sent" && !awaitingConfirm(j)) {
    body = (
      <>
        <p className="tl-acting">Acting as the {c.contractor}. In real life this happens on their phone from a text message.</p>
        {j.urgency !== "urgent" && (
          <div className="tl-seg" role="group" aria-label="Response">
            <button type="button" aria-pressed={mode === "accept"} onClick={() => setMode("accept")}>
              Accept and book
            </button>
            <button type="button" aria-pressed={mode === "quote"} onClick={() => setMode("quote")}>
              Quote above {money(sb.region, j.cap ?? 0)}
            </button>
          </div>
        )}
        {(mode === "accept" || j.urgency === "urgent") && j.urgency !== "urgent" && notice > 1 && (
          <label className="tl-check tl-agree">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setSlot(0);
              }}
            />{" "}
            The tenant agreed to a visit sooner than the {notice === 48 ? "2 days'" : `${notice} hours'`} notice
          </label>
        )}
        {mode === "accept" || j.urgency === "urgent" ? (
          <div className="tl-row">
            <label className="tl-field">
              <span>Visit time</span>
              <select value={slot} onChange={(e) => setSlot(Number(e.target.value))}>
                {options.map((t, i) => (
                  <option key={t} value={i}>
                    {j.urgency === "urgent" ? `Within ${[30, 60, 120][i]} minutes` : when(sb.region, t)}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="tl-btn tl-btn-primary" disabled={s.busy} onClick={() => s.act({ type: "accept", jobId: j.id, slot: options[slot], tenantAgreed: agreed })}>
              Accept and book
            </button>
          </div>
        ) : (
          <div className="tl-row">
            <AmountInput label="Quote" value={amount} onChange={setAmount} currency={R.currency} tax={c.tax} />
            <button
              type="button"
              className="tl-btn tl-btn-primary"
              disabled={s.busy || Number.isNaN(parseAmount(amount))}
              onClick={() => s.act({ type: "quote", jobId: j.id, amount: parseAmount(amount), note: "Labour and parts", earliest: options[0] })}
            >
              Send quote
            </button>
          </div>
        )}
      </>
    );
  } else if (j.stage === "sent") {
    body = <p className="tl-acting">After hours: the on-call {c.contractor} has been paged. Check the reply above and send it.</p>;
  } else if (j.stage === "owner") {
    body = (
      <>
        <p className="tl-acting">Acting as the {c.owner}. In real life this is one tap from a text message.</p>
        <div className="tl-row">
          <button type="button" className="tl-btn tl-btn-primary" disabled={s.busy} onClick={() => s.act({ type: "owner", jobId: j.id, decision: "approved" })}>
            Approve {money(sb.region, j.quote?.amount ?? 0)}
          </button>
          <button type="button" className="tl-btn tl-btn-quiet" disabled={s.busy} onClick={() => s.act({ type: "owner", jobId: j.id, decision: "declined", note: "Please get a second quote" })}>
            Decline
          </button>
        </div>
      </>
    );
  } else if (j.hold === "strata") {
    body = (
      <button type="button" className="tl-btn tl-btn-primary" disabled={s.busy} onClick={() => s.act({ type: "strataResolved", jobId: j.id })}>
        {sb.region === "AU" ? "The strata has fixed it" : "The block agent has fixed it"}
      </button>
    );
  } else if (j.hold === "ownerDeclined") {
    body = (
      <button type="button" className="tl-btn tl-btn-primary" disabled={s.busy} onClick={() => s.act({ type: "requote", jobId: j.id })}>
        Ask for a second quote
      </button>
    );
  } else if (j.stage === "booked") {
    body = (
      <>
        <p className="tl-acting">Acting as the {c.contractor}.</p>
        <button type="button" className="tl-btn tl-btn-primary" disabled={s.busy} onClick={() => s.act({ type: "complete", jobId: j.id })}>
          Mark job complete
        </button>
      </>
    );
  } else if (j.stage === "done" && j.triage?.chargeTo === "strata" && !j.contractorId) {
    body = <p className="tl-acting">{sb.region === "AU" ? "Repaired by the strata." : "Repaired by the block agent."} Nothing to bill.</p>;
  } else if (j.stage === "done" && !j.invoice) {
    body = (
      <>
        <p className="tl-acting">Acting as the {c.contractor}.</p>
        <div className="tl-row">
          <AmountInput label="Invoice" value={inv} onChange={setInv} currency={R.currency} tax={c.tax} />
          <button type="button" className="tl-btn tl-btn-primary" disabled={s.busy || Number.isNaN(parseAmount(inv))} onClick={() => s.act({ type: "invoice", jobId: j.id, amount: parseAmount(inv) })}>
            Upload invoice
          </button>
        </div>
      </>
    );
  } else if (j.stage === "done" && j.invoice?.overApproved) {
    body = (
      <>
        <p className="tl-acting">The invoice is above what was approved. Check it with the {c.contractor} before it goes to {c.accounts}.</p>
        <button type="button" className="tl-btn tl-btn-primary" disabled={s.busy} onClick={() => s.act({ type: "approveInvoice", jobId: j.id })}>
          Approve the invoice
        </button>
      </>
    );
  } else if (j.stage === "billed") {
    body = (
      <p className="tl-acting">
        Bill entered in {c.accounts} (simulated)
        {j.triage?.chargeTo === "tenant" ? ", charged to the tenant" : `, paid from ${sb.region === "AU" ? "trust" : "the client account"} and shown on the ${c.owner}'s statement`}.
      </p>
    );
  }
  if (!body || (j.stage === "new" && !j.hold)) return null;
  return <footer className="tl-drawer-foot">{body}</footer>;
}
