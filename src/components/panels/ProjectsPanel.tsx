"use client";

import { useState } from "react";
import { IconRoute, IconChevronRight } from "@tabler/icons-react";
import Card from "@/components/ui/Card";

export default function ProjectsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <Card className="cursor-pointer" onClick={() => setOpen((v) => !v)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px]"
            style={{ background: "linear-gradient(135deg, #EF9F27, #D85A30)", color: "var(--btn-text-on-gradient)" }}
          >
            <IconRoute size={18} />
          </div>
          <div>
            <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>
              Pathwise
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Workflow and progress-mapping app
            </p>
          </div>
        </div>
        <IconChevronRight size={16} style={{ color: "var(--text-faint)" }} />
      </div>
      {open && (
        <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border-surface)" }}>
          <p className="mb-2.5 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Helps users plan a journey from goal to milestone, with visual node maps and hotspots.
          </p>
          <p className="mb-1.5 text-xs" style={{ color: "var(--text-primary)" }}>
            Highlights
          </p>
          <ul className="list-disc space-y-1 pl-4.5 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <li>Interactive canvas with draggable nodes and edges</li>
            <li>Page map view with clickable hotspots</li>
            <li>Google account restricted access for the owner</li>
          </ul>
        </div>
      )}
    </Card>
  );
}
