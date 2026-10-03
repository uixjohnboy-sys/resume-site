"use client";

import { useState } from "react";

// The Proof Lab: each wall from "The wall" section, as something the visitor
// can break with their own hands. Four small, self-contained simulations,
// no network, no randomness, so they behave the same for everyone:
//   1. Charged twice: retry a Stripe webhook against a naive handler and an
//      idempotent one.
//   2. 40 vs 27: count the same pipeline by opportunities and by contacts.
//   3. A2P on day nine: move the day the registration is submitted and watch
//      the launch move (illustrative; real review times vary, and it says so).
//   4. Sold out twice: sell a two-price ticket with stock tracked per price
//      versus per product.
// All of it is generic: no client names, no real data.

const LABS = [
  { id: "charge", tab: "Charged twice" },
  { id: "report", tab: "40 vs 27" },
  { id: "a2p", tab: "A2P late" },
  { id: "stock", tab: "Sold out twice" },
] as const;

type LabId = (typeof LABS)[number]["id"];

/* ---------- 1. idempotency ---------- */

function ChargeLab() {
  const [deliveries, setDeliveries] = useState(0);
  const naiveCharges = deliveries;
  const safeCharges = deliveries > 0 ? 1 : 0;
  const amount = 497;

  return (
    <div className="v3-lab-body">
      <p className="v3-lab-lede">
        A client pays <b>${amount}</b> once. Stripe sends the <code>invoice.paid</code> webhook, and when the
        connection hiccups it sends it again. Press retry and see what each handler does.
      </p>
      <div className="v3-lab-cols">
        <div className="v3-lab-col v3-lab-bad">
          <p className="v3-lab-col-h">A typical handler</p>
          <p className="v3-lab-big">${(naiveCharges * amount).toLocaleString("en-US")}</p>
          <p className="v3-lab-small">
            recorded from {naiveCharges} {naiveCharges === 1 ? "delivery" : "deliveries"}
            {naiveCharges > 1 ? `, ${naiveCharges} welcome emails sent` : ""}
          </p>
          <ol className="v3-lab-log">
            {Array.from({ length: Math.min(deliveries, 6) }, (_, i) => (
              <li key={i}>
                attempt {i + 1} <span>&rarr; charge recorded</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="v3-lab-col v3-lab-good">
          <p className="v3-lab-col-h">How John Boy builds it</p>
          <p className="v3-lab-big">${(safeCharges * amount).toLocaleString("en-US")}</p>
          <p className="v3-lab-small">recorded once, keyed on in_1Q8fK2</p>
          <ol className="v3-lab-log">
            {Array.from({ length: Math.min(deliveries, 6) }, (_, i) => (
              <li key={i}>
                attempt {i + 1} <span>{i === 0 ? "→ recorded" : "→ duplicate, ignored"}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="v3-lab-actions">
        <button type="button" className="v3-lab-btn" onClick={() => setDeliveries((d) => Math.min(d + 1, 9))}>
          {deliveries === 0 ? "Deliver the webhook" : "Stripe retries the webhook"}
        </button>
        {deliveries > 0 ? (
          <button type="button" className="v3-lab-ghost" onClick={() => setDeliveries(0)}>
            Reset
          </button>
        ) : null}
      </div>
      <p className="v3-lab-fix">
        <b>The fix:</b> every write path is idempotent. Running it twice gives the same result as running it once.
      </p>
    </div>
  );
}

/* ---------- 2. reporting ---------- */

// 27 people, 40 opportunities: 17 with one, 7 with two, 3 with three.
const PEOPLE = Array.from({ length: 27 }, (_, i) => (i < 17 ? 1 : i < 24 ? 2 : 3));

function ReportLab() {
  const [by, setBy] = useState<"opps" | "contacts">("opps");
  const total = by === "opps" ? PEOPLE.reduce((a, b) => a + b, 0) : PEOPLE.length;

  return (
    <div className="v3-lab-body">
      <p className="v3-lab-lede">
        Same pipeline, same week. The dashboard and the CRM disagree, and both are &ldquo;right.&rdquo; Switch what
        is being counted.
      </p>
      <div className="v3-lab-toggle" role="group" aria-label="What to count">
        <button type="button" aria-pressed={by === "opps"} onClick={() => setBy("opps")}>
          Count opportunities
        </button>
        <button type="button" aria-pressed={by === "contacts"} onClick={() => setBy("contacts")}>
          Count people
        </button>
      </div>
      <div className="v3-lab-report">
        <p className="v3-lab-big">
          {total} <span>{by === "opps" ? "leads on the dashboard" : "people in the CRM"}</span>
        </p>
        <div className="v3-lab-people" aria-hidden="true">
          {PEOPLE.map((n, i) => (
            <span key={i} className="v3-lab-person" data-n={n}>
              {by === "opps" ? Array.from({ length: n }, (_, k) => <i key={k} />) : <i />}
            </span>
          ))}
        </div>
      </div>
      <p className="v3-lab-fix">
        <b>The cause:</b> pipelines count opportunities, not contacts. One person who booked twice and bought once is
        three. <b>The fix:</b> report on the number the business actually means, and label it.
      </p>
    </div>
  );
}

/* ---------- 3. A2P ---------- */

const BUILD_DAYS = 14;
const REVIEW_DAYS = 10;

function A2PLab() {
  const [day, setDay] = useState(9);
  const textsReady = day + REVIEW_DAYS;
  const launch = Math.max(BUILD_DAYS, textsReady);
  const slip = launch - BUILD_DAYS;

  return (
    <div className="v3-lab-body">
      <p className="v3-lab-lede">
        The build takes {BUILD_DAYS} days. US text messaging cannot go live until the A2P 10DLC registration is
        approved. Choose the day it gets submitted.
      </p>
      <label className="v3-lab-range">
        <span>
          Submitted on day <b>{day}</b>
        </span>
        <input type="range" min={1} max={14} value={day} onChange={(e) => setDay(Number(e.target.value))} />
      </label>
      <div className="v3-lab-track" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => {
          const d = i + 1;
          const cls =
            d <= BUILD_DAYS ? "build" : d <= launch ? "wait" : "live";
          return (
            <span key={d} className={`v3-lab-day ${cls}`} data-sub={d === day ? "1" : undefined}>
              {d === day ? <em>A2P</em> : null}
            </span>
          );
        })}
      </div>
      <p className="v3-lab-big">
        {slip === 0 ? (
          <>
            Launches on day {launch} <span>on time</span>
          </>
        ) : (
          <>
            Launches on day {launch} <span className="v3-lab-late">{slip} days late</span>
          </>
        )}
      </p>
      <p className="v3-lab-fix">
        <b>The fix:</b> submit A2P on day one, in parallel with the build. Illustrative: review here is set to{" "}
        {REVIEW_DAYS} days, and real review times vary.
      </p>
    </div>
  );
}

/* ---------- 4. inventory ---------- */

const STOCK = 10;

function StockLab() {
  const [early, setEarly] = useState(0);
  const [standard, setStandard] = useState(0);
  const sold = early + standard;
  // Per price: each price believes it owns all the stock.
  const perPriceLeft = { early: STOCK - early, standard: STOCK - standard };
  const oversold = Math.max(0, sold - STOCK);
  const productLeft = Math.max(0, STOCK - sold);

  const sell = (which: "early" | "standard") => {
    if (which === "early" && perPriceLeft.early > 0) setEarly((n) => n + 1);
    if (which === "standard" && perPriceLeft.standard > 0) setStandard((n) => n + 1);
  };

  return (
    <div className="v3-lab-body">
      <p className="v3-lab-lede">
        A workshop has {STOCK} seats and two prices, early bird and standard. Sell some of each.
      </p>
      <div className="v3-lab-actions">
        <button type="button" className="v3-lab-btn" onClick={() => sell("early")}>
          Sell early bird
        </button>
        <button type="button" className="v3-lab-btn" onClick={() => sell("standard")}>
          Sell standard
        </button>
        {sold ? (
          <button
            type="button"
            className="v3-lab-ghost"
            onClick={() => {
              setEarly(0);
              setStandard(0);
            }}
          >
            Reset
          </button>
        ) : null}
      </div>
      <div className="v3-lab-cols">
        <div className="v3-lab-col v3-lab-bad">
          <p className="v3-lab-col-h">Stock tracked per price</p>
          <p className="v3-lab-big">{sold} sold</p>
          <p className="v3-lab-small">
            early bird shows {perPriceLeft.early} left, standard shows {perPriceLeft.standard} left
          </p>
          {oversold ? <p className="v3-lab-alarm">{oversold} seats sold that do not exist</p> : null}
        </div>
        <div className="v3-lab-col v3-lab-good">
          <p className="v3-lab-col-h">Stock tracked per product</p>
          <p className="v3-lab-big">{Math.min(sold, STOCK)} sold</p>
          <p className="v3-lab-small">{productLeft} seats left across both prices</p>
          {sold >= STOCK ? <p className="v3-lab-okay">sold out, checkout closed</p> : null}
        </div>
      </div>
      <p className="v3-lab-fix">
        <b>The fix:</b> one stock count per product, shared by every price, checked again at payment.
      </p>
    </div>
  );
}

export default function ProofLab() {
  const [lab, setLab] = useState<LabId>("charge");
  return (
    <div className="v3-lab">
      <div className="v3-lab-tabs" role="tablist" aria-label="Proof lab">
        {LABS.map((l, i) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            id={`lab-tab-${l.id}`}
            aria-selected={lab === l.id}
            aria-controls={`lab-panel-${l.id}`}
            onClick={() => setLab(l.id)}
          >
            <span>0{i + 1}</span> {l.tab}
          </button>
        ))}
      </div>
      <div className="v3-lab-panel" role="tabpanel" id={`lab-panel-${lab}`} aria-labelledby={`lab-tab-${lab}`}>
        {lab === "charge" ? <ChargeLab /> : null}
        {lab === "report" ? <ReportLab /> : null}
        {lab === "a2p" ? <A2PLab /> : null}
        {lab === "stock" ? <StockLab /> : null}
      </div>
    </div>
  );
}
