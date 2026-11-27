import type { Metadata } from "next";
import HomeBody from "@/components/home/HomeBody";
import ProblemGrid from "@/components/home/ProblemGrid";
import "@/app/problem-grid.css";

// Homepage experiment (JB 2026-11-27): the same page with the work section as a problem grid instead of the cover-flow.
// Preview only: noindex, linked from nowhere, scored against "/" by the Buyer Panel and the hiring manager before any swap.
export const metadata: Metadata = {
  title: { absolute: "Homepage preview: problem grid | John Boy Roxas" },
  robots: { index: false, follow: false },
};

export default function HomeGridPreview() {
  return <HomeBody hero={<ProblemGrid />} />;
}
