"use client";

import { useState } from "react";
import Sidebar, { PanelKey } from "@/components/Sidebar";
import OverviewPanel from "@/components/panels/OverviewPanel";
import AboutPanel from "@/components/panels/AboutPanel";
import ProjectsPanel from "@/components/panels/ProjectsPanel";

const crumbs: Record<PanelKey, string> = {
  overview: "Overview",
  about: "About me",
  projects: "Projects",
};

export default function Home() {
  const [active, setActive] = useState<PanelKey>("overview");

  return (
    <div className="flex h-screen w-screen" style={{ background: "var(--bg-page, #1A1917)" }}>
      <Sidebar active={active} onSelect={setActive} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-none px-6 py-3">
          <p className="text-[11px]" style={{ color: "#6B6960" }}>
            {crumbs[active]}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {active === "overview" && <OverviewPanel onNavigate={setActive} />}
          {active === "about" && <AboutPanel />}
          {active === "projects" && <ProjectsPanel />}
        </div>
      </div>
    </div>
  );
}
