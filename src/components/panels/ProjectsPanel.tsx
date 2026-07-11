"use client";

import { useState } from "react";
import { IconRoute, IconCompass, IconCommand, IconClock, IconX } from "@tabler/icons-react";

const apps = [
  {
    name: "Pathwise",
    tagline: "Workflow and progress-mapping app",
    status: "Live",
    icon: IconRoute,
    description: "Helps users plan a journey from goal to milestone, with visual node maps and hotspots.",
    highlights: [
      "Interactive canvas with draggable nodes and edges",
      "Page map view with clickable hotspots",
      "Google account restricted access for the owner",
    ],
  },
  {
    name: "Compass",
    tagline: "Client and project navigation tool",
    status: "In progress",
    icon: IconCompass,
    description: "A dashboard for tracking client engagements end to end, from first call to delivered system.",
    highlights: ["Currently in active development", "Details coming as the build progresses"],
  },
  {
    name: "Command",
    tagline: "Automation control center",
    status: "In progress",
    icon: IconCommand,
    description: "A central place to monitor and manage automations running across client accounts.",
    highlights: ["Currently in active development", "Details coming as the build progresses"],
  },
];

const totalTiles = 16;
const placeholderCount = totalTiles - apps.length;

export default function ProjectsPanel() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openApp = openIndex !== null ? apps[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {apps.map((app, i) => {
          const Icon = app.icon;
          return (
            <button
              key={app.name}
              onClick={() => setOpenIndex(i)}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-[20px] p-3 text-center transition-transform hover:scale-[1.03]"
              style={{
                background: "var(--bg-surface)",
                backdropFilter: "var(--surface-blur)",
                WebkitBackdropFilter: "var(--surface-blur)",
                boxShadow: "var(--surface-shadow-sm)",
              }}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-[12px]"
                style={{ background: "linear-gradient(135deg, #EF9F27, #D85A30)", color: "var(--btn-text-on-gradient)" }}
              >
                <Icon size={20} />
              </div>
              <p className="text-[12px]" style={{ color: "var(--text-primary)" }}>
                {app.name}
              </p>
              <p className="text-[9px]" style={{ color: "#EF9F27" }}>
                {app.status}
              </p>
            </button>
          );
        })}

        {Array.from({ length: placeholderCount }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="flex aspect-square cursor-default flex-col items-center justify-center gap-2 rounded-[20px] p-3 text-center opacity-40"
            style={{ background: "var(--bg-surface-2)" }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-[12px]"
              style={{ background: "var(--bg-surface)", color: "var(--text-faint)" }}
            >
              <IconClock size={18} />
            </div>
            <p className="text-[10px] leading-tight" style={{ color: "var(--text-faint)" }}>
              More Apps Coming Soon
            </p>
          </div>
        ))}
      </div>

      {openApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain p-4 lg:p-6"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setOpenIndex(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[24px] p-5"
            style={{
              background: "var(--bg-surface)",
              backdropFilter: "var(--surface-blur)",
              WebkitBackdropFilter: "var(--surface-blur)",
              boxShadow: "var(--surface-shadow)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px]"
                  style={{ background: "linear-gradient(135deg, #EF9F27, #D85A30)", color: "var(--btn-text-on-gradient)" }}
                >
                  <openApp.icon size={18} />
                </div>
                <div>
                  <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                    {openApp.name}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {openApp.tagline}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpenIndex(null)}
                aria-label="Close"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full"
                style={{ background: "var(--bg-surface-2)", color: "var(--text-tertiary)" }}
              >
                <IconX size={16} />
              </button>
            </div>
            <p className="mb-2.5 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {openApp.description}
            </p>
            <p className="mb-1.5 text-xs" style={{ color: "var(--text-primary)" }}>
              Highlights
            </p>
            <ul className="list-disc space-y-1 pl-4.5 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {openApp.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
