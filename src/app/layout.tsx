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

const siteTitle = "Johnboy Roxas — GoHighLevel Specialist & AI Automation Expert";
const siteDescription =
  "Johnboy Roxas is a GoHighLevel Specialist and AI Automation Expert based in Manila, Philippines, building funnels, CRM systems, and automations with GoHighLevel, n8n, Zapier, and Claude.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.johnboydesign.com"),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "Johnboy Roxas",
    "GoHighLevel Specialist",
    "AI Automation Expert",
    "GoHighLevel Expert",
    "GHL Automation",
    "n8n Automation",
    "Zapier Expert",
    "CRM Automation",
    "Sales Funnel Builder",
    "Manila Philippines",
  ],
  authors: [{ name: "Johnboy Roxas" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.johnboydesign.com" },
  openGraph: {
    title: siteTitle,
    description: "Automating businesses with Claude, n8n, and Zapier.",
    url: "https://www.johnboydesign.com",
    siteName: "Johnboy Roxas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: "Automating businesses with Claude, n8n, and Zapier.",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Johnboy Roxas",
  jobTitle: "GoHighLevel Specialist & AI Automation Expert",
  description: siteDescription,
  url: "https://www.johnboydesign.com",
  image: "https://www.johnboydesign.com/johnboy.png",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Manila",
    addressCountry: "PH",
  },
  knowsAbout: ["GoHighLevel", "AI Automation", "n8n", "Zapier", "CRM Systems", "Sales Funnels"],
  sameAs: [
    "https://www.linkedin.com/in/john-boy-roxas-gohighlevel-specialist",
    "https://www.instagram.com/uix.johnboy/",
    "https://www.facebook.com/uix.johnboy",
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
