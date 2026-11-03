"use client";

import { useEffect, useRef } from "react";

// Dialog behaviour for the drawer, the tenant modal and confirmations: focus
// moves to the dialog's heading on open, Tab stays inside, Escape closes, the
// rest of the page is inert while it is open, and focus returns to whatever
// opened it, or to `returnTo()` when the opener is gone (a card that moved
// column, a menu that closed).
export function useDialog(open: boolean, onClose: () => void, returnTo?: () => HTMLElement | null) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const returnRef = useRef(returnTo);
  useEffect(() => {
    closeRef.current = onClose;
    returnRef.current = returnTo;
  }, [onClose, returnTo]);

  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    const opener = document.activeElement as HTMLElement | null;
    const root = document.getElementById("tl-app");
    root?.setAttribute("inert", "");
    const first = el.querySelector<HTMLElement>("[data-autofocus]") ?? el.querySelector<HTMLElement>("h2, h1");
    if (first) {
      if (!first.hasAttribute("tabindex")) first.setAttribute("tabindex", "-1");
      first.focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      // The guided tour's card stays reachable by keyboard while a dialog holds the focus.
      const guide = document.querySelector("[data-guide-card]");
      const items = [...Array.from(el.querySelectorAll<HTMLElement>(focusable)), ...(guide ? Array.from(guide.querySelectorAll<HTMLElement>(focusable)) : [])].filter((x) => x.offsetParent !== null);
      if (!items.length) return;
      // Tab moves through the dialog and the tour's card as one loop, in both directions.
      const at = items.indexOf(document.activeElement as HTMLElement);
      const to = at === -1 ? (e.shiftKey ? items.length - 1 : 0) : (at + (e.shiftKey ? -1 : 1) + items.length) % items.length;
      e.preventDefault();
      items[to].focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root?.removeAttribute("inert");
      if (opener && document.contains(opener) && opener !== document.body) opener.focus();
      else returnRef.current?.()?.focus();
    };
  }, [open]);

  return ref;
}
