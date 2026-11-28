import type { Metadata } from "next";
import HomeBody from "@/components/home/HomeBody";
import HomeSections from "@/components/home/HomeSections";
import "../../problem-grid.css";
import "../../home-sections.css";

// Preview for JB's approval (2026-11-28): the homepage section by section, one swipe row per kind of work.
export const metadata: Metadata = {
  title: { absolute: "Preview: homepage sections" },
  robots: { index: false, follow: false },
};

export default function HomeSectionsPreview() {
  return <HomeBody hero={<HomeSections />} />;
}
