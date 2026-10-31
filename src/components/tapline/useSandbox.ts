"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicAction } from "@/lib/tapline/actions";
import type { Region, Sandbox } from "@/lib/tapline/types";

// The visitor's private demo. The id comes from ?sb= when a phone page is
// opened from a link (used for that page only, never saved over the visitor's
// own demo), otherwise from localStorage, otherwise it is made fresh.
// Polls send the current version and get "unchanged" back when nothing moved,
// so an idle board costs a few bytes. A sequence guard stops an old poll from
// overwriting a newer write.

const STORE = "tapline-sb";
const ID = /^[a-z0-9]{8,20}$/;

function makeId() {
  const a = crypto.getRandomValues(new Uint8Array(9));
  return Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 14);
}

export function resolveId(): string {
  const fromUrl = new URL(window.location.href).searchParams.get("sb");
  if (fromUrl && ID.test(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORE);
    if (saved && ID.test(saved)) return saved;
  } catch {}
  const id = makeId();
  try {
    localStorage.setItem(STORE, id);
  } catch {}
  return id;
}

export function forgetId() {
  try {
    localStorage.removeItem(STORE);
  } catch {}
}

type Resp = { sb?: Sandbox; v?: number; now: number; unchanged?: boolean; jobId?: string; error?: string; pending?: boolean };

export function useSandbox(poll = true) {
  const [id, setId] = useState<string | null>(null);
  const [sb, setSb] = useState<Sandbox | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const skew = useRef(0);
  const ver = useRef(-1);
  const region = useRef<Region>("AU");
  const writeSeq = useRef(0);

  const take = useCallback((d: Resp) => {
    skew.current = d.now - Date.now();
    setNow(d.now);
    if (d.sb && typeof d.v === "number") {
      ver.current = d.v;
      region.current = d.sb.region;
      setSb(d.sb);
    }
  }, []);

  const load = useCallback(
    async (sid: string) => {
      const seqAtStart = writeSeq.current;
      const r = await fetch(`/api/tapline?sb=${sid}&region=${region.current}&v=${ver.current}`, { cache: "no-store" });
      const d = (await r.json()) as Resp;
      if (seqAtStart !== writeSeq.current) return; // a write landed while this poll was in flight
      if (r.ok) {
        take(d);
      } else setError(d.error ?? "Could not load the demo.");
    },
    [take]
  );

  useEffect(() => {
    const sid = resolveId();
    Promise.resolve().then(() => {
      setId(sid);
      load(sid);
    });
  }, [load]);

  useEffect(() => {
    if (!id) return;
    const tick = setInterval(() => setNow(Date.now() + skew.current), 15000);
    const p = poll
      ? setInterval(() => {
          if (document.visibilityState === "visible") load(id).catch(() => {});
        }, 4000)
      : null;
    return () => {
      clearInterval(tick);
      if (p) clearInterval(p);
    };
  }, [id, poll, load]);

  const post = useCallback(
    async (path: string, body: object) => {
      if (!id) return null;
      setBusy(true);
      const seq = ++writeSeq.current;
      try {
        const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sb: id, region: region.current, ...body }) });
        const d = (await r.json()) as Resp;
        if (seq !== writeSeq.current) return d; // a later write owns the screen
        if (!r.ok) {
          setError(d.error ?? "Something went wrong. Reload the page and try again.");
          if (r.status === 409) load(id).catch(() => {});
          return null;
        }
        take(d);
        setError(null);
        return d;
      } catch {
        setError("You seem to be offline. Check your connection and try again.");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [id, take, load]
  );

  const act = useCallback((action: PublicAction) => post("/api/tapline", { action }), [post]);
  const reset = useCallback((r: Region) => post("/api/tapline", { reset: r }), [post]);
  const triage = useCallback((jobId: string) => post("/api/tapline/triage", { jobId }), [post]);
  const photoUrl = useCallback((ph?: string) => (ph && id ? `/api/tapline/photo?sb=${id}&ph=${ph}` : undefined), [id]);

  return { id, sb, now, error, busy, act, reset, triage, setError, photoUrl };
}
