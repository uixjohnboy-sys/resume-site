"use client";

import { isChannel, type Channel } from "@/lib/leadsource/links";

// The visitor's test code and last click, kept in this browser only (DESIGN 3): ref- plus 4 capital letters or digits,
// made on first visit. localStorage behind try/catch; if storage fails the code lives for the tab only.

const CODE_KEY = "ls.code";
const CLICK_KEY = "ls.lastClick";
export const CLICK_EVENT = "ls:click";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

let tabCode = "";
let tabClick: Click | null = null;

/** A click on a demo ad, with the test code that link carried (empty for the plain link). After each tagged click the
 *  browser gets a fresh code, so a second test never finds the first booking (G3 v1 QA M1). */
export type Click = { ch: Channel; at: number; code: string };
const REF = /^ref-[A-Z0-9]{4}$/;

function random(n: number): string {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function getCode(): string {
  try {
    const saved = localStorage.getItem(CODE_KEY);
    if (saved && /^ref-[A-Z0-9]{4}$/.test(saved)) return saved;
  } catch {}
  if (!tabCode) tabCode = `ref-${random(4)}`;
  try {
    localStorage.setItem(CODE_KEY, tabCode);
  } catch {}
  return tabCode;
}

/** A click ID stand-in: "demo" plus random letters, the shape fbclid and gclid have. */
export const demoClickId = () => `demo${random(14)}`;

export function readClick(): Click | null {
  try {
    const raw = localStorage.getItem(CLICK_KEY);
    if (raw) {
      const c = JSON.parse(raw) as { ch?: unknown; at?: unknown; code?: unknown };
      if (isChannel(c.ch) && typeof c.at === "number" && Number.isFinite(c.at)) {
        return { ch: c.ch, at: c.at, code: typeof c.code === "string" && REF.test(c.code) ? c.code : "" };
      }
    }
  } catch {}
  return tabClick;
}

// One snapshot string for useSyncExternalStore: "code|clickId|channel:at". A string compares by value, so React only
// re-renders when something really changed. The server snapshot is "", so the first render matches the HTML.
let tabClickId = "";
export function visitorSnapshot(): string {
  if (!tabClickId) tabClickId = demoClickId();
  const c = readClick();
  return `${getCode()}|${tabClickId}|${c ? `${c.ch}:${c.at}:${c.code}` : ""}`;
}
export const serverSnapshot = () => "";

export function subscribe(fn: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith("ls.")) fn();
  };
  window.addEventListener(CLICK_EVENT, fn);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CLICK_EVENT, fn);
    window.removeEventListener("storage", onStorage);
  };
}

export type Visitor = { code: string; clickId: string; click: Click | null };
export function parseVisitor(s: string): Visitor {
  const [code = "", clickId = "", c = ""] = s.split("|");
  const [ch, at, clickCode = ""] = c.split(":");
  return {
    code,
    clickId,
    click: isChannel(ch) && Number.isFinite(Number(at)) ? { ch, at: Number(at), code: REF.test(clickCode) ? clickCode : "" } : null,
  };
}

/** Saves the click with the code its link carried, then gives the next link a new code. The new code is written after
 *  the browser has followed this link (the click handler runs first), so the opened booking page keeps this code. */
export function saveClick(ch: Channel) {
  const code = ch === "plain" ? "" : getCode();
  tabClick = { ch, at: Date.now(), code };
  try {
    localStorage.setItem(CLICK_KEY, JSON.stringify(tabClick));
  } catch {}
  if (ch !== "plain") {
    tabCode = `ref-${random(4)}`;
    try {
      localStorage.setItem(CODE_KEY, tabCode);
    } catch {}
  }
  // Re-render after the navigation has started, so the href of the link being followed is not swapped mid-click.
  setTimeout(() => window.dispatchEvent(new Event(CLICK_EVENT)), 0);
}
