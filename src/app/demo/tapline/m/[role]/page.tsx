import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PhoneView, { type PhoneRole } from "@/components/tapline/PhoneView";
import "../../tapline.css";

// The tenant, owner and tradie phone pages, opened from a link or a QR code
// on the Tapline board.

export const metadata: Metadata = {
  title: "Tapline · Demo",
  robots: { index: false, follow: false },
};

const ROLES: PhoneRole[] = ["tenant", "owner", "tradie"];

export default async function TaplinePhone({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!ROLES.includes(role as PhoneRole)) notFound();
  return <PhoneView role={role as PhoneRole} />;
}
