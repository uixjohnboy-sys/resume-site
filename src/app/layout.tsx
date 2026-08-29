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

const siteTitle = "John Boy Roxas · GoHighLevel Systems Builder";
const siteDescription =
  "GoHighLevel systems builder who also ships the custom software beside the CRM: Next.js, Firebase, Stripe, and the Claude API. 5 years, 58 client builds, and one flagship platform you can open right now.";

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
    description: "I build the systems GoHighLevel cannot build alone.",
    url: "https://www.johnboydesign.com",
    siteName: "Johnboy Roxas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: "I build the systems GoHighLevel cannot build alone.",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Johnboy Roxas",
  jobTitle: "GoHighLevel Systems Builder",
  description: siteDescription,
  url: "https://www.johnboydesign.com",
  image: "https://www.johnboydesign.com/johnboy.png",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tarlac",
    addressCountry: "PH",
  },
  knowsAbout: ["GoHighLevel", "AI Automation", "n8n", "Zapier", "CRM Systems", "Sales Funnels", "Next.js", "Firebase", "Stripe", "Claude API"],
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
      suppressHydrationWarning
    >
      <head>
        {/* Arms the scroll-reveal styling before first paint, and only when
            JavaScript is actually executing: a no-JS visit sees the whole
            page instead of a blank one. Fx.tsx re-asserts it on client-side
            navigations; suppressHydrationWarning on <html> covers the class
            being present before React hydrates. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('fx-on')}catch(e){}",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
