"use client";

import { useState } from "react";
import { IconRoute, IconChevronRight } from "@tabler/icons-react";

export default function ProjectsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="cursor-pointer rounded-xl p-4"
      style={{ background: "var(--bg-card, #211F1B)" }}
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px]"
            style={{ background: "linear-gradient(135deg, #EF9F27, #D85A30)", color: "#2C1400" }}
          >
            <IconRoute size={18} />
          </div>
          <div>
            <p className="text-[13px]" style={{ color: "#F2F1EE" }}>
              Pathwise
            </p>
            <p className="text-[11px]" style={{ color: "#6B6960" }}>
              Workflow and progress-mapping app
            </p>
          </div>
        </div>
        <IconChevronRight size={16} style={{ color: "#5A584F" }} />
      </div>
      {open && (
        <div className="mt-3 border-t pt-3" style={{ borderColor: "#2A2822" }}>
          <p className="mb-2.5 text-[13px] leading-relaxed" style={{ color: "#B0AEA4" }}>
            Helps users plan a journey from goal to milestone, with visual node maps and hotspots.
          </p>
          <p className="mb-1.5 text-xs" style={{ color: "#F2F1EE" }}>
            Highlights
          </p>
          <ul className="list-disc space-y-1 pl-4.5 text-xs leading-relaxed" style={{ color: "#B0AEA4" }}>
            <li>Interactive canvas with draggable nodes and edges</li>
            <li>Page map view with clickable hotspots</li>
            <li>Google account restricted access for the owner</li>
          </ul>
        </div>
      )}
    </div>
  );
}
