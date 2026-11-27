import type { Metadata } from "next";
import HomeBody from "@/components/home/HomeBody";
import ProblemGrid from "@/components/home/ProblemGrid";
import "./problem-grid.css";

// Homepage. Since 2026-11-27 the work section is the problem grid (every kind of work in one look, headed by the buyer's
// problem; A/B by the hiring manager: grid 81.8 vs cover-flow 79.4, hiring\runs\2026-11-27-ab-home-grid.md), after the
// live-demo count was made true and client work was labelled apart from fictional demos. The cover-flow
// (components/home/SkillFlow.tsx) is kept for a rollback: render <SkillFlow cards={...}> as the hero instead.

export const metadata: Metadata = {
  title: { absolute: "GoHighLevel Specialist for Hire, GHL Expert | John Boy Roxas" },
  description:
    "HighLevel-certified GoHighLevel specialist in the Philippines, in GHL since 2023. White-label workflows, funnels and snapshots for agencies in Australia and the US.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomeBody hero={<ProblemGrid />} />;
}
