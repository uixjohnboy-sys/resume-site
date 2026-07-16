"use client";

import { useState } from "react";

export default function NotifyForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/availability/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="text-[11px]" style={{ color: "var(--text-primary)" }}>
        Thanks! I&apos;ll email you the moment I&apos;m available.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "flex gap-1.5" : "flex flex-col gap-1.5"}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="min-w-0 flex-1 rounded-lg px-2.5 py-2 text-[11px] outline-none"
        style={{ background: "var(--bg-surface-2)", color: "var(--text-primary)", border: "1px solid var(--border-surface)" }}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="flex-none rounded-lg px-3 py-2 text-[11px] font-medium disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #EF9F27, #D85A30)",
          color: "var(--btn-text-on-gradient)",
        }}
      >
        {status === "sending" ? "Sending…" : "Notify Me"}
      </button>
      {status === "error" && (
        <p className="text-[10px]" style={{ color: "#D85A30" }}>
          Something went wrong, please try again.
        </p>
      )}
    </form>
  );
}
