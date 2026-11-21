import type { Metadata } from "next";
import LeadSourcePage from "@/components/leadsource/LeadSourcePage";
import { pageConfig } from "@/lib/leadsource/provider";
import { fontVars } from "./fonts";
import "./lead-source.css";

// Lead-source tracker: a GoHighLevel UTM attribution demo for a made-up Brisbane physio clinic.
// Spec: C:\PortfolioProjects\lead-source-tracker\SPEC.md v0.2, design DESIGN.md v0.3. Noindex until G4, not linked yet.

export const metadata: Metadata = {
  title: { absolute: "Lead-source tracker demo: see which ad brought each booking | John Boy Roxas" },
  description: "Book from a demo Facebook, Instagram or Google ad and watch GoHighLevel save which ad brought the booking, on the contact and on a live report.",
  robots: { index: false, follow: false },
};

export default function LeadSourceDemo() {
  const cfg = pageConfig();
  return (
    <div className={fontVars} style={{ width: "100%" }}>
      <LeadSourcePage variant="demo" paused={cfg.paused} bookingBase={cfg.bookingBase} />
    </div>
  );
}
