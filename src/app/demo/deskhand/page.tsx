import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import Desk from "@/components/deskhand/Desk";
import "./deskhand.css";

const font = Public_Sans({ subsets: ["latin"], variable: "--font-desk" });

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
