"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IconUser, IconApps, IconSparkles, IconQuoteFilled, IconSun, IconMoon } from "@tabler/icons-react";
import { useTheme } from "@/components/ThemeProvider";

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
  const { theme, toggleTheme } = useTheme();

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
          <div className="relative h-64 w-full overflow-hidden rounded-t-2xl lg:h-[150px]">
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

            <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--border-surface)" }}>
              <p className="mb-1 flex items-center gap-1 text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                <IconSparkles size={12} style={{ color: "#EF9F27" }} />
                Available for work
              </p>
              <p className="mb-2.5 text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Freelance GoHighLevel and automation builds, one project at a time.
              </p>
              <button
                className="w-full rounded-lg px-2 py-2 text-xs font-medium hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                  boxShadow: "0 0 16px 0 rgba(216,90,48,0.4)",
                  color: "var(--btn-text-on-gradient)",
                }}
              >
                Book a call
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="flex flex-row items-center gap-1.5 lg:gap-1.5">
        <nav className="flex flex-1 flex-row gap-1.5 lg:flex-col lg:gap-0.5">
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
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full transition-colors lg:h-7 lg:w-7"
          style={{
            background: "var(--bg-surface-2)",
            backdropFilter: "var(--surface-blur)",
            WebkitBackdropFilter: "var(--surface-blur)",
            boxShadow: "var(--surface-shadow-xs)",
            color: "var(--text-tertiary)",
          }}
        >
          {theme === "dark" ? <IconSun size={14} /> : <IconMoon size={14} />}
        </button>
      </div>

      <p className="mb-1.5 mt-4.5 hidden pl-2.5 text-[10px] font-normal tracking-wide lg:block" style={{ color: "var(--text-faint)" }}>
        TESTIMONIAL
      </p>
      <div
        className="hidden overflow-hidden rounded-[20px] lg:block"
        style={{ background: "#F7F5F1", boxShadow: "0 10px 24px rgba(0,0,0,0.28)" }}
      >
        <div className="relative h-[120px] w-full">
          <img
            src="https://randomuser.me/api/portraits/women/68.jpg"
            alt="Martha"
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(247,245,241,0) 45%, #F7F5F1 100%)" }}
          />
        </div>
        <div className="px-4 pb-4 pt-1">
          <IconQuoteFilled size={22} style={{ color: "#D85A30" }} />
          <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: "#2C2A25" }}>
            Impressed by the Professionalism and attention to details in UI design. Highly Recommended!
          </p>
          <p className="mt-2 text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
            — Martha, Unicell
          </p>
        </div>
      </div>

    </div>
  );
}
