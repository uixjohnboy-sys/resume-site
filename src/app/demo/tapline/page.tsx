import type { Metadata } from "next";
import Board from "@/components/tapline/Board";
import "./tapline.css";

// Tapline: the repairs desk demo for property managers and letting agents.
// Spec: C:\PortfolioProjects\tapline\SPEC.md. Fictional agency and data only.

export const metadata: Metadata = {
  title: "Tapline · Repairs desk demo",
  description: "A live demo of a repairs desk for property managers: tenant reports, AI triage, owner approvals and tradie jobs on one board.",
  robots: { index: false, follow: false },
};

export default function TaplinePage() {
  return <Board />;
}
