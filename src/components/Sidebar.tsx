"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  IconUser,
  IconApps,
  IconArticle,
  IconMessageCircle,
  IconRosetteDiscountCheckFilled,
  IconSparkles,
} from "@tabler/icons-react";

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
      style={{ background: "var(--bg-sidebar, #141311)" }}
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
          <div className="rounded-b-2xl p-3" style={{ background: "#1C1A17" }}>
            <div className="mb-1 flex items-center gap-1.5">
              <p className="text-[13px] font-medium" style={{ color: "var(--text-primary, #F5F4F0)" }}>
                John Boy
              </p>
              <IconRosetteDiscountCheckFilled size={13} style={{ color: "var(--accent-1, #EF9F27)" }} />
            </div>
            <p className="mb-2.5 text-[11px] leading-relaxed" style={{ color: "#9A978C" }}>
              GoHighLevel specialist. Automating businesses with Claude, n8n, and Zapier.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[13px] tabular-nums" style={{ color: "#F2F1EE" }}>
                {time ?? "--:--:--"}
              </span>
              <span className="text-[11px]" style={{ color: "#6B6960" }}>
                Philippine Time
              </span>
            </div>
          </div>
        </div>
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
                    color: "#2C1400",
                    boxShadow: "0 2px 16px 0 rgba(216,90,48,0.45)",
                  }
                : { color: "#8A887F" }
            }
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <p className="mb-1.5 mt-4.5 hidden pl-2.5 text-[10px] font-normal tracking-wide lg:block" style={{ color: "#4E4C44" }}>
        OTHER
      </p>
      <nav className="hidden flex-col gap-0.5 lg:flex">
        <button disabled className="flex w-full cursor-default items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs opacity-40" style={{ color: "#8A887F" }}>
          <IconArticle size={16} />
          Blog
        </button>
        <button disabled className="flex w-full cursor-default items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs opacity-40" style={{ color: "#8A887F" }}>
          <IconMessageCircle size={16} />
          Testimonials
        </button>
      </nav>

      <div className="hidden flex-1 lg:block" />

      <div
        className="mobile-cta-bar fixed inset-x-0 bottom-0 z-40 px-4 pt-4 lg:static lg:z-auto lg:mt-0 lg:rounded-[20px] lg:p-3"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          background: "#1C1A17",
          boxShadow:
            "8px 8px 18px rgba(0,0,0,0.55), -6px -6px 16px rgba(255,255,255,0.025), inset 0 1px 0 rgba(255,255,255,0.02)",
        }}
      >
        <p className="mb-1 flex items-center gap-1 text-xs font-medium" style={{ color: "#F2F1EE" }}>
          <IconSparkles size={12} style={{ color: "#EF9F27" }} />
          Available for work
        </p>
        <p className="mb-2.5 text-[11px] leading-relaxed" style={{ color: "#7A7870" }}>
          Freelance GoHighLevel and automation builds, one project at a time.
        </p>
        <button
          className="w-full rounded-lg px-2 py-2 text-xs font-medium hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, #EF9F27, #D85A30)",
            boxShadow: "0 0 16px 0 rgba(216,90,48,0.4)",
            color: "#2C1400",
          }}
        >
          Book a call
        </button>
      </div>
    </div>
  );
}
