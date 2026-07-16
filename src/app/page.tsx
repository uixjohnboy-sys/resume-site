"use client";

import { useState } from "react";
import Sidebar, { PanelKey } from "@/components/Sidebar";
import AboutPanel from "@/components/panels/AboutPanel";
import ProjectsPanel from "@/components/panels/ProjectsPanel";

export default function Home() {
  const [active, setActive] = useState<PanelKey>("about");

  return (
    <div
      className="flex min-h-screen w-full flex-col lg:h-screen lg:flex-row"
      style={{ background: "var(--bg-page)" }}
    >
      <Sidebar active={active} onSelect={setActive} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 px-4 py-4 pb-20 lg:overflow-y-auto lg:px-6 lg:py-6 lg:pb-6">
          {active === "about" && <AboutPanel />}
          {active === "projects" && <ProjectsPanel />}
        </div>
      </div>
    </div>
  );
}
