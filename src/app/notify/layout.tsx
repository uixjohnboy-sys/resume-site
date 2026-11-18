import type { Metadata } from "next";

// Not for search: kept out of the index (SEO audit 2026-11-18, P1.5).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
