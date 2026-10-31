"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Action } from "@/lib/tapline/actions";
import type { Region, Sandbox } from "@/lib/tapline/types";

// The visitor's private demo. The id lives in the URL (?sb=) when a phone
// page is opened from a link, otherwise in localStorage, otherwise it is made
// fresh. The board polls every few seconds while visible, so a report sent
// from a real phone appears on the desktop board without a refresh.

const STORE = "tapline-sb";

function makeId() {
  const a = crypto.getRandomValues(new Uint8Array(9));
  return Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 14);
}

export function resolveId(): string {
  const fromUrl = new URL(window.location.href).searchParams.get("sb");
  if (fromUrl && /^[a-z0-9]{8,20}$/.test(fromUrl)) {
    try {
      localStorage.setItem(STORE, fromUrl);
    } catch {}
    return fromUrl;
  }
  try {
    const saved = localStorage.getItem(STORE);
    if (saved && /^[a-z0-9]{8,20}$/.test(saved)) return saved;
  } catch {}
  const id = makeId();
  try {
    localStorage.setItem(STORE, id);
  } catch {}
  return id;
}

export function useSandbox(poll = true) {
  const [id, setId] = useState<string | null>(null);
  const [sb, setSb] = useState<Sandbox | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const skew = useRef(0);

  const take = useCallback((d: { sb: Sandbox; now: number }) => {
    skew.current = d.now - Date.now();
    setSb(d.sb);
    setNow(d.now);
  }, []);

  const load = useCallback(
    async (sid: string) => {
      const r = await fetch(`/api/tapline?sb=${sid}`, { cache: "no-store" });
      const d = await r.json();
      if (r.ok) {
        take(d);
        setError(null);
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

  // Poll while the tab is visible, and tick the clock every 15 s so timers move.
  useEffect(() => {
    if (!id) return;
    const tick = setInterval(() => setNow(Date.now() + skew.current), 15000);
    const p = poll
      ? setInterval(() => {
          if (document.visibilityState === "visible") load(id);
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
      try {
        const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sb: id, ...body }) });
        const d = await r.json();
        if (!r.ok) {
          setError(d.error ?? "Something went wrong.");
          return null;
        }
        take(d);
        setError(null);
        return d as { sb: Sandbox; jobId?: string };
      } finally {
        setBusy(false);
      }
    },
    [id, take]
  );

  const act = useCallback((action: Action) => post("/api/tapline", { action }), [post]);
  const reset = useCallback((region: Region) => post("/api/tapline", { reset: region }), [post]);
  const triage = useCallback((jobId: string) => post("/api/tapline/triage", { jobId }), [post]);

  return { id, sb, now, error, busy, act, reset, triage, setError };
}
