"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconUser, IconApps, IconSparkles } from "@tabler/icons-react";

export type PanelKey = "about" | "projects";

const navItems: { key: PanelKey; label: string; icon: React.ReactNode }[] = [
  { key: "about", label: "About me", icon: <IconUser size={16} /> },
  { key: "projects", label: "Projects", icon: <IconApps size={16} /> },
];

export default function Sidebar({
  active,
  onSelect,
}: {
  active: PanelKey;
  onSelect: (key: PanelKey) => void;
}) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Manila",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex w-full flex-none flex-col overflow-visible px-3.5 pt-5 pb-4 lg:w-[230px] lg:pb-5"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Profile card */}
      <div className="relative mb-4">
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(239,159,39,0.45)]">
          <div
            className="relative h-64 w-full overflow-hidden rounded-t-2xl lg:h-[150px]"
            style={{ background: "var(--bg-surface)" }}
          >
            <Image
              src="/johnboy.png"
              alt="John Boy"
              fill
              className="profile-photo-img object-cover"
              style={{ objectPosition: "center top", transform: "scale(1.2)", transformOrigin: "top center" }}
              sizes="230px"
              priority
            />
          </div>
          <div
            className="rounded-b-2xl p-4"
            style={{
              background: "var(--bg-surface)",
              backdropFilter: "var(--surface-blur)",
              WebkitBackdropFilter: "var(--surface-blur)",
            }}
          >
            <p className="text-[26px] font-medium leading-[1.1]" style={{ color: "var(--text-primary, #F5F4F0)" }}>
              Johnboy
            </p>
            <p className="text-[26px] font-medium leading-[1.1]" style={{ color: "var(--text-primary, #F5F4F0)" }}>
              Roxas
            </p>
            <p className="mt-1.5 text-[12px]" style={{ color: "var(--text-muted)" }}>
              @uix.johnboy
            </p>

            <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              GoHighLevel specialist. Automating businesses with Claude, n8n, and Zapier.
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[13px] tabular-nums" style={{ color: "var(--text-primary)" }}>
                {time ?? "--:--:--"}
              </span>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Philippine Time
              </span>
            </div>

            <div className="mt-4 hidden border-t pt-3 lg:block" style={{ borderColor: "var(--border-surface)" }}>
              <p className="mb-1 flex items-center gap-1 text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                <IconSparkles size={12} style={{ color: "#EF9F27" }} />
                Available for work
              </p>
              <p className="mb-2.5 text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Freelance GoHighLevel and automation builds, one project at a time.
              </p>
              <Link
                href="/book"
                className="block w-full rounded-lg px-2 py-2 text-center text-xs font-medium hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                  boxShadow: "0 0 16px 0 rgba(216,90,48,0.4)",
                  color: "var(--btn-text-on-gradient)",
                }}
              >
                Book a call
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 px-4 py-3 lg:hidden"
        style={{
          background: "var(--bg-surface)",
          backdropFilter: "var(--surface-blur)",
          WebkitBackdropFilter: "var(--surface-blur)",
          borderTop: "1px solid var(--border-surface)",
          boxShadow: "0 -8px 24px rgba(0,0,0,0.35)",
        }}
      >
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--text-primary)" }}>
            <IconSparkles size={12} style={{ color: "#EF9F27" }} />
            Available for work
          </p>
          <p className="truncate text-[10px]" style={{ color: "var(--text-muted)" }}>
            Freelance GoHighLevel and automation builds.
          </p>
        </div>
        <Link
          href="/book"
          className="flex-none rounded-lg px-4 py-2 text-xs font-medium"
          style={{
            background: "linear-gradient(135deg, #EF9F27, #D85A30)",
            boxShadow: "0 0 16px 0 rgba(216,90,48,0.4)",
            color: "var(--btn-text-on-gradient)",
          }}
        >
          Book a call
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex flex-row gap-1.5 lg:flex-col lg:gap-0.5">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-normal transition-colors lg:flex-none lg:justify-start lg:py-1.5"
            style={
              active === item.key
                ? {
                    background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                    color: "var(--btn-text-on-gradient)",
                    boxShadow: "0 2px 16px 0 rgba(216,90,48,0.45)",
                  }
                : { color: "var(--text-tertiary)" }
            }
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div
        className="relative mt-3 overflow-hidden rounded-[12px] px-3 py-2 lg:mt-auto"
        style={{
          background: "linear-gradient(135deg, rgba(239,159,39,0.16), rgba(216,90,48,0.07))",
          border: "1px solid rgba(239,159,39,0.28)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(239,159,39,0.5), transparent 70%)", filter: "blur(6px)" }}
        />
        <p className="relative flex items-center gap-1 text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
          GHL Pro <span>🚀</span>
        </p>
        <p className="relative mt-0.5 text-[10px] leading-snug" style={{ color: "var(--text-secondary)" }}>
          Certified GoHighLevel Professional. Trusted to build full client-generating business systems.
        </p>
      </div>
    </div>
  );
}
