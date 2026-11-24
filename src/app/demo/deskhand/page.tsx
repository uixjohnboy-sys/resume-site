import type { Metadata } from "next";
import localFont from "next/font/local";
import Desk from "@/components/deskhand/Desk";
import "./deskhand.css";

const font = localFont({
  src: [{ path: "../../../fonts/public-sans-normal-100-900.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-desk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deskhand demo: an AI front desk for a cleaning business",
  description: "Play a customer and watch an AI agent do the front-desk job for a fictional Sydney cleaning business.",
  robots: { index: false, follow: false },
};

export default function DeskhandDemo() {
  return (
    <div className={`dh ${font.variable}`}>
      <Desk />
    </div>
  );
}
