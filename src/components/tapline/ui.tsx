"use client";

import {
  IconAirConditioning,
  IconBolt,
  IconBug,
  IconDroplet,
  IconDropletHalf2,
  IconFlame,
  IconHome,
  IconKey,
  IconTool,
  IconWindow,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { stageLabel } from "@/lib/tapline/rules";
import type { ClockState } from "@/lib/tapline/metrics";
import type { Region, Sandbox, Trade } from "@/lib/tapline/types";
import Qr from "./Qr";
import { useDialog } from "./useDialog";

export function dur(hours: number) {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m && h < 10 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${Math.round(hours / 24)}d`;
}

const ICONS: Record<Trade, typeof IconTool> = {
  plumber: IconDroplet,
  gas: IconFlame,
  electrician: IconBolt,
  locksmith: IconKey,
  handyman: IconTool,
  roofer: IconHome,
  hvac: IconAirConditioning,
  pest: IconBug,
  glazier: IconWindow,
  damp: IconDropletHalf2,
};

export function TradeIcon({ trade, size = 14 }: { trade: Trade; size?: number }) {
  const I = ICONS[trade];
  return <I size={size} stroke={1.75} aria-hidden="true" />;
}

export function TimerChip({ state, hours }: { state: ClockState; hours: number }) {
  const word = state === "late" ? "Overdue" : state === "soon" ? "Due soon" : null;
  return (
    <span className={`tl-chip tl-chip-${state}`} title="Time in this stage">
      {word ? (
        <>
          <span className="tl-chip-word">{word}</span>&nbsp;({dur(hours)})
        </>
      ) : (
        dur(hours)
      )}
    </span>
  );
}

export function StageChip({ region, stage }: { region: Region; stage: Parameters<typeof stageLabel>[1] }) {
  return <span className="tl-chip tl-chip-stage">{stageLabel(region, stage)}</span>;
}

export function Avatar({ initials, name }: { initials: string; name: string }) {
  return (
    <span className="tl-avatar" title={name} aria-label={`Manager ${name}`}>
      {initials}
    </span>
  );
}

/** Link to a phone page for this visitor's sandbox (and job, for owner/contractor). */
export function phoneLink(id: string, role: "tenant" | "owner" | "tradie", jobId?: string) {
  return `${window.location.origin}/demo/tapline/m/${role}?sb=${id}${jobId ? "&job=" + jobId : ""}`;
}

export function TryOnPhone({ url, who }: { url: string; who: string }) {
  return (
    <div className="tl-try">
      <Qr value={url} size={104} label={`QR code: open the ${who}'s view on your phone`} />
      <div>
        <p>
          <b>Try it on your phone.</b> Scan to open what the {who} sees from their text message, then watch this board update.
        </p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          Open the {who}&apos;s view in a new tab
        </a>
      </div>
    </div>
  );
}

/** Money entry that keeps decimals: "380", "380.5", "380.50". */
export function AmountInput({ label, value, onChange, currency }: { label: string; value: string; onChange: (v: string) => void; currency: string }) {
  return (
    <label className="tl-field">
      <span>
        {label} ({currency}, incl. tax)
      </span>
      <input
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9.]/g, "");
          if (/^\d{0,6}(\.\d{0,2})?$/.test(v)) onChange(v);
        }}
      />
    </label>
  );
}

export const parseAmount = (v: string) => (/^\d+(\.\d{1,2})?$/.test(v) ? Number(v) : NaN);

export function ConfirmDialog({ title, body, confirm, onConfirm, onClose }: { title: string; body: string; confirm: string; onConfirm: () => void; onClose: () => void }) {
  const ref = useDialog(true, onClose);
  return (
    <div className="tl-modal-wrap" role="dialog" aria-modal="true" aria-labelledby="tl-confirm-h">
      <div className="tl-scrim" aria-hidden="true" onClick={onClose} />
      <div className="tl-confirm" ref={ref}>
        <h2 id="tl-confirm-h">{title}</h2>
        <p>{body}</p>
        <div className="tl-row tl-row-end">
          <button type="button" className="tl-btn tl-btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="tl-btn tl-btn-primary"
            data-autofocus
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Polite announcements for screen readers when the board changes. */
export function useAnnouncer(sb: Sandbox | null) {
  const prev = useRef<Map<string, string> | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!sb) return;
    const nowMap = new Map(sb.jobs.map((j) => [j.id, j.stage]));
    const was = prev.current;
    prev.current = nowMap;
    if (!was) return;
    const lines: string[] = [];
    for (const j of sb.jobs) {
      const before = was.get(j.id);
      if (!before) lines.push(`New report ${j.ref}: ${j.title}.`);
      else if (before !== j.stage) lines.push(`${j.ref} moved to ${stageLabel(sb.region, j.stage)}.`);
    }
    if (lines.length) Promise.resolve().then(() => setMsg(lines.slice(0, 3).join(" ")));
  }, [sb]);
  return msg;
}
