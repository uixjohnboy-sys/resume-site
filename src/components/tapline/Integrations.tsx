"use client";

import { useEffect, useState } from "react";
import type { Region } from "@/lib/tapline/types";
import type { Counts, LogRow, SendKind, SendResult, WebhookStatus } from "@/lib/tapline/webhook";

// The part of a repairs desk that breaks quietly: events moving between systems. Every button here sends a real
// signed request through the same checks as the public endpoint, so a technical buyer can see each failure handled.

const ACTIONS: { kind: SendKind; label: string; shows: string }[] = [
  { kind: "send", label: "Send an event", shows: "A repair update, signed and applied once." },
  { kind: "replay", label: "Send it again", shows: "A provider retrying the same event. It is not applied twice." },
  { kind: "tamper", label: "Change it after signing", shows: "Someone edits the urgency in transit. The signature no longer matches." },
  { kind: "stale", label: "Send an old signed copy", shows: "A real signature from an hour ago, copied and replayed." },
  { kind: "outage", label: "Take the receiver down", shows: "The event fails and waits in the log instead of being lost." },
  { kind: "retry", label: "Bring it back and retry", shows: "The waiting event goes through, once." },
];

const PILL: Record<WebhookStatus, { text: string; cls: string }> = {
  delivered: { text: "Applied", cls: "tl-chip-ok" },
  duplicate: { text: "Duplicate blocked", cls: "tl-chip-soon" },
  rejected: { text: "Rejected", cls: "tl-chip-late" },
  failed: { text: "Failed, waiting", cls: "tl-chip-late" },
};

const OOPS = "That didn't go through. Please try again.";

export default function Integrations({ id, region }: { id: string; region: Region }) {
  const [log, setLog] = useState<LogRow[]>([]);
  const [counts, setCounts] = useState<Counts>({ applied: 0, duplicates: 0, rejected: 0, waiting: 0 });
  const [last, setLast] = useState<SendResult | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`/api/tapline/webhook/send?sb=${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (live && d.log) {
          setLog(d.log);
          setCounts(d.counts);
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [id]);

  async function press(kind: SendKind) {
    setBusy(true);
    try {
      const r = await fetch("/api/tapline/webhook/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sb: id, kind, region }),
      });
      const d = await r.json();
      if (!r.ok || !d.result) {
        setMessage(d.error ?? OOPS);
        return;
      }
      setLog(d.log);
      setCounts(d.counts);
      if (d.result.message) {
        setMessage(d.result.message);
      } else {
        setLast(d.result);
        setMessage(`${d.result.http}. ${d.result.note}`);
      }
    } catch {
      setMessage(OOPS);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tl-view" aria-labelledby="tl-int-h" data-spot="integrations">
      <div className="tl-view-head">
        <div>
          <h2 id="tl-int-h">Integrations</h2>
          <p>
            <b>{counts.applied} applied</b>, {counts.duplicates} {counts.duplicates === 1 ? "duplicate" : "duplicates"} blocked, {counts.rejected} rejected, {counts.waiting} waiting for a retry
          </p>
        </div>
      </div>
      <p className="tl-fine">
        These are real signed requests through real checks. The events are from this fictional agency, and the receiver here is my own endpoint. A client build sends them to or from GoHighLevel the same way.
      </p>

      <ul className="tl-int-actions">
        {ACTIONS.map((a) => (
          <li key={a.kind}>
            <button type="button" className="tl-btn tl-btn-ghost tl-btn-sm" disabled={busy} onClick={() => press(a.kind)}>
              {a.label}
            </button>
            <span>{a.shows}</span>
          </li>
        ))}
      </ul>
      <p className="tl-int-result" role="status">
        {message}
      </p>

      {last && (
        <details className="tl-int-request">
          <summary>The last request</summary>
          <dl>
            <dt>Signature header</dt>
            <dd>
              <code>x-tapline-signature: {last.signature}</code>
            </dd>
            <dt>Body</dt>
            <dd>
              <code>{last.body}</code>
            </dd>
          </dl>
        </details>
      )}

      <div className="tl-table-wrap">
        <table className="tl-table">
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Event</th>
              <th scope="col">Attempt</th>
              <th scope="col">HTTP</th>
              <th scope="col">Result</th>
              <th scope="col">What happened</th>
            </tr>
          </thead>
          <tbody>
            {log.map((r) => (
              <tr key={r.key}>
                <td>{new Date(r.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}</td>
                <td>
                  <code>{r.event.slice(0, 12)}</code>
                </td>
                <td>{r.attempt}</td>
                <td>{r.http}</td>
                <td>
                  <span className={`tl-chip ${PILL[r.status].cls}`}>{PILL[r.status].text}</span>
                </td>
                <td>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {log.length === 0 && <p className="tl-empty">Nothing sent yet. Press Send an event to start.</p>}
      </div>
    </section>
  );
}
