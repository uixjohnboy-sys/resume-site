"use client";

import { useEffect, useState } from "react";
import { IconLock, IconCheck } from "@tabler/icons-react";

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => {
        setAuthed(d.authed);
        setChecking(false);
      });
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/availability")
      .then((r) => r.json())
      .then((d) => setAvailable(d.available));
  }, [authed]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      const d = await res.json();
      setLoginError(d.error || "Login failed");
    }
  }

  async function toggleAvailability() {
    if (available === null) return;
    setSaving(true);
    const next = !available;
    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: next }),
    });
    if (res.ok) setAvailable(next);
    setSaving(false);
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg-page)" }} />
    );
  }

  if (!authed) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{ background: "var(--bg-page, #1A1917)" }}
      >
        <form
          onSubmit={handleLogin}
          className="flex w-full max-w-xs flex-col gap-4 rounded-[24px] p-6"
          style={{ background: "var(--bg-surface)", boxShadow: "var(--surface-shadow)" }}
        >
          <div
            className="flex h-11 w-11 items-center justify-center rounded-[12px]"
            style={{ background: "linear-gradient(135deg, #EF9F27, #D85A30)", color: "var(--btn-text-on-gradient)" }}
          >
            <IconLock size={18} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Admin Access
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              Enter the admin password to continue.
            </p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: "var(--bg-surface-2)", color: "var(--text-primary)", border: "1px solid var(--border-surface)" }}
          />
          {loginError && (
            <p className="text-xs" style={{ color: "#D85A30" }}>
              {loginError}
            </p>
          )}
          <button
            type="submit"
            className="rounded-lg px-3 py-2 text-xs font-medium hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #EF9F27, #D85A30)",
              color: "var(--btn-text-on-gradient)",
            }}
          >
            Log In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "var(--bg-page, #1A1917)" }}
    >
      <div
        className="flex w-full max-w-sm flex-col gap-4 rounded-[24px] p-6"
        style={{ background: "var(--bg-surface)", boxShadow: "var(--surface-shadow)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Availability Status
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          This controls what visitors see on your live site. Changes apply instantly.
        </p>

        {available === null ? (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Loading current status…
          </p>
        ) : (
          <button
            onClick={toggleAvailability}
            disabled={saving}
            className="flex items-center justify-between rounded-[16px] p-4 text-left transition-opacity disabled:opacity-60"
            style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-surface)" }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {available ? "Available for Work" : "Not Available for Work"}
              </p>
              <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                Tap to switch to {available ? '"Not Available"' : '"Available"'}
              </p>
            </div>
            <span
              className="flex h-9 w-16 flex-none items-center rounded-full p-1 transition-colors"
              style={{ background: available ? "linear-gradient(135deg, #EF9F27, #D85A30)" : "var(--border-surface-2)" }}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white transition-transform"
                style={{ transform: available ? "translateX(28px)" : "translateX(0)" }}
              >
                {available && <IconCheck size={14} color="#D85A30" />}
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
