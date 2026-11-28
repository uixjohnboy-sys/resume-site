import type { Metadata } from "next";
import HomeBody from "@/components/home/HomeBody";
import HomeSections from "@/components/home/HomeSections";
import "./problem-grid.css";
import "./home-sections.css";

// Homepage. Since 2026-11-28 (JB approved the preview) the work section is section by section: one centred section
// per kind of work, a swipe row of demo cards, "Explore more" on each card to the page that explains the demo and how
// to test it. Before that it was the problem grid (components/home/ProblemGrid.tsx, 2026-11-27); render
// <ProblemGrid /> as the hero instead to roll back. The older cover-flow (components/home/SkillFlow.tsx) is also kept.

export const metadata: Metadata = {
  title: { absolute: "GoHighLevel Specialist for Hire, GHL Expert | John Boy Roxas" },
  description:
    "HighLevel-certified GoHighLevel specialist in the Philippines, in GHL since 2023. White-label workflows, funnels and snapshots for agencies in Australia and the US.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomeBody hero={<HomeSections />} />;
}
