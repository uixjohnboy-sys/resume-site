"use client";

import { IconMoon, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { DEMO_PROPERTY } from "@/lib/tapline/seed";
import type { Access, Sandbox } from "@/lib/tapline/types";
import { PhotoPick } from "./PhonePieces";
import { InlineError, TryOnPhone, phoneLink } from "./ui";
import { useDialog } from "./useDialog";
import type { useSandbox } from "./useSandbox";

/** The tenant's report form on the desktop board, framed like a phone. */
export default function TenantReport({
  id,
  sb,
  busy,
  api,
  onClose,
  onSent,
}: {
  id: string;
  sb: Sandbox;
  busy: boolean;
  api: ReturnType<typeof useSandbox>;
  onClose: () => void;
  onSent: (jobId: string) => void;
}) {
  const ref = useDialog(true, onClose);
  const p = sb.properties.find((x) => x.id === DEMO_PROPERTY)!;
  const UK = sb.region === "UK";
  const [title, setTitle] = useState("Water coming through the ceiling");
  const [desc, setDesc] = useState(
    UK
      ? "There's a brown stain on the living room ceiling and water is dripping onto the floor. It started tonight and it's getting worse."
      : "There's a brown stain on the living room ceiling and water is dripping onto the floor. Started tonight and getting worse."
  );
  const [access, setAccess] = useState<Access>({ mode: "home", note: "", pets: false });
  const [photo, setPhoto] = useState<string | undefined>();
  const [afterHours, setAfterHours] = useState(true);

  return (
    <div className="tl-modal-wrap" role="dialog" aria-modal="true" aria-labelledby="tl-tenant-h">
      <div className="tl-scrim" aria-hidden="true" onClick={onClose} />
      <div className="tl-phone" ref={ref}>
        <div className="tl-phone-bar">
          <b>{sb.agency}</b>
          <button type="button" className="tl-icon-btn" onClick={onClose} aria-label="Close">
            <IconX size={18} aria-hidden="true" />
          </button>
        </div>
        <h2 id="tl-tenant-h">Report a repair</h2>
        <p className="tl-meta">
          {p.address}, {p.suburb} · Tenant {p.tenant}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const d = await api.act({ type: "report", propertyId: p.id, title, description: desc, photo, access, afterHours });
            if (d?.jobId) onSent(d.jobId);
          }}
        >
          <label className="tl-field">
            <span>What&apos;s the problem?</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required />
          </label>
          <label className="tl-field">
            <span>Tell us more</span>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} maxLength={600} />
          </label>
          <fieldset className="tl-field tl-radios">
            <legend>Access for the {UK ? "contractor" : "tradie"}</legend>
            {(
              [
                ["home", "I'll be home"],
                ["keys", "Use the office keys"],
                ["times", "Only at certain times"],
              ] as const
            ).map(([m, l]) => (
              <label key={m} className="tl-radio">
                <input type="radio" name="tl-access" checked={access.mode === m} onChange={() => setAccess({ ...access, mode: m })} /> {l}
              </label>
            ))}
            {access.mode === "times" && (
              <input aria-label="When are you available?" placeholder="For example weekday mornings" value={access.note} onChange={(e) => setAccess({ ...access, note: e.target.value })} maxLength={160} />
            )}
            <label className="tl-check">
              <input type="checkbox" checked={access.pets} onChange={(e) => setAccess({ ...access, pets: e.target.checked })} /> There are pets at home
            </label>
          </fieldset>
          <PhotoPick label="Add a photo" onPick={setPhoto} />
          <label className="tl-check tl-afterhours">
            <input type="checkbox" checked={afterHours} onChange={(e) => setAfterHours(e.target.checked)} />
            <IconMoon size={15} aria-hidden="true" /> Demo: pretend it&apos;s 9:47 pm, after office hours
          </label>
          <button type="submit" className="tl-btn tl-btn-primary tl-wide" disabled={busy || title.trim().length < 3}>
            {busy ? "Sending..." : "Send report"}
          </button>
          {title.trim().length < 3 && <p className="tl-hint">Describe the problem in a few words to send it.</p>}
          <InlineError error={api.error} seq={api.errorSeq} onDismiss={() => api.setError(null)} />
        </form>
        <TryOnPhone url={phoneLink(id, "tenant")} who="tenant" />
      </div>
    </div>
  );
}
