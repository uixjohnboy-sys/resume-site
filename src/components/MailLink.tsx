"use client";
import { useId, useRef, useState, type ReactNode } from "react";

// Email links (JB 2026-11-26): a plain mailto opens the visitor's default mail app, which on many Windows laptops is
// an Outlook or Mail app nobody set up, so the click does nothing. This keeps the mailto href (it still works with
// JavaScript off, and in the printed CV) but on click asks where to write: Gmail, Outlook, the mail app, or copy.

function parse(href: string) {
  const [addr, query = ""] = href.replace(/^mailto:/i, "").split("?");
  const q = new URLSearchParams(query.replace(/\+/g, "%2B"));
  return { to: decodeURIComponent(addr), subject: q.get("subject") ?? "", body: q.get("body") ?? "" };
}

const enc = encodeURIComponent;

export default function MailLink({ href, className, children, title = "Send me an email" }: { href: string; className?: string; children: ReactNode; title?: string }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const hid = useId();
  const { to, subject, body } = parse(href);
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(to)}${subject ? `&su=${enc(subject)}` : ""}${body ? `&body=${enc(body)}` : ""}`;
  const outlook = `https://outlook.office.com/mail/deeplink/compose?to=${enc(to)}${subject ? `&subject=${enc(subject)}` : ""}${body ? `&body=${enc(body)}` : ""}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(to);
    } catch {
      const t = document.createElement("textarea");
      t.value = to;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <a
        className={className}
        href={href}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || !dlg.current?.showModal) return;
          e.preventDefault();
          setCopied(false);
          dlg.current.showModal();
        }}
      >
        {children}
      </a>
      <dialog
        ref={dlg}
        className="mailpick"
        aria-labelledby={hid}
        onClick={(e) => {
          if (e.target === dlg.current) dlg.current.close(); // a tap outside the card closes it
        }}
      >
        <div className="mailpick-card">
          <p className="mailpick-h" id={hid}>
            {title}
          </p>
          <p className="mailpick-to">{to}</p>
          {subject ? <p className="mailpick-note">{body ? "The subject and a short starter are filled in for you." : "The subject is filled in for you."}</p> : null}
          <div className="mailpick-list">
            <a href={gmail} target="_blank" rel="noopener noreferrer" onClick={() => dlg.current?.close()}>
              Open in Gmail <span aria-hidden="true">↗</span>
            </a>
            <a href={outlook} target="_blank" rel="noopener noreferrer" onClick={() => dlg.current?.close()}>
              Open in Outlook <span aria-hidden="true">↗</span>
            </a>
            <a href={href} onClick={() => dlg.current?.close()}>
              Use my email app
            </a>
            <button type="button" onClick={copy}>
              {copied ? "Copied ✓" : "Copy email address"}
            </button>
          </div>
          <button type="button" className="mailpick-close" onClick={() => dlg.current?.close()}>
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
