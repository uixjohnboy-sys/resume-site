import type { Metadata } from "next";
import LeadSourcePage from "@/components/leadsource/LeadSourcePage";
import { pageConfig } from "@/lib/leadsource/provider";
import { fontVars } from "../fonts";
import "../lead-source.css";

// The booking confirmation redirect lands here (SPEC 6.2): the same page, the report first.

export const metadata: Metadata = {
  title: { absolute: "Your booking and the live report | Lead-source tracker demo" },
  description: "The live lead-source report for the Kestrel Physio demo: bookings by source and the latest bookings, by test code only.",
  robots: { index: false, follow: false },
};

export default function LeadSourceReport() {
  const cfg = pageConfig();
  return (
    <div className={fontVars} style={{ width: "100%" }}>
      <LeadSourcePage variant="report" paused={cfg.paused} bookingBase={cfg.bookingBase} />
    </div>
  );
}
