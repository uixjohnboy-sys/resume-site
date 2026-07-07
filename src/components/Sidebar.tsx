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
      className="flex w-[230px] flex-none flex-col overflow-visible pt-10 px-3.5 pb-5"
      style={{ background: "var(--bg-sidebar, #141311)" }}
    >
      {/* Profile card */}
      <div className="relative mb-4">
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(239,159,39,0.45)]">
          <div className="relative h-[150px] w-full overflow-hidden rounded-t-2xl">
            <Image
              src="/johnboy.png"
              alt="John Boy"
              fill
              className="object-cover"
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
              Product designer. Helping brands build with sleek dashboards.
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
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-normal transition-colors"
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

      <p className="mb-1.5 mt-4.5 pl-2.5 text-[10px] font-normal tracking-wide" style={{ color: "#4E4C44" }}>
        OTHER
      </p>
      <nav className="flex flex-col gap-0.5">
        <button disabled className="flex w-full cursor-default items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs opacity-40" style={{ color: "#8A887F" }}>
          <IconArticle size={16} />
          Blog
        </button>
        <button disabled className="flex w-full cursor-default items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs opacity-40" style={{ color: "#8A887F" }}>
          <IconMessageCircle size={16} />
          Testimonials
        </button>
      </nav>

      <div className="flex-1" />

      <div
        className="rounded-[20px] p-3"
        style={{
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
          Freelance product design and app builds, one project at a time.
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
