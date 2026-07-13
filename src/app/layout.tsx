import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.johnboydesign.com"),
  title: "Johnboy Roxas — GoHighLevel Specialist",
  description: "Automating businesses with Claude, n8n, and Zapier. Dashboard-style portfolio and resume for Johnboy Roxas.",
  openGraph: {
    title: "Johnboy Roxas — GoHighLevel Specialist",
    description: "Automating businesses with Claude, n8n, and Zapier.",
    url: "https://www.johnboydesign.com",
    siteName: "Johnboy Roxas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Johnboy Roxas — GoHighLevel Specialist",
    description: "Automating businesses with Claude, n8n, and Zapier.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
