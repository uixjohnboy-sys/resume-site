import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted (src/fonts) since 2026-11-24: Google Fonts fetches during Vercel builds kept failing deploys.
const geistSans = localFont({
  src: [{ path: "../fonts/geist-normal-100-900.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: [{ path: "../fonts/geist-mono-normal-100-900.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-geist-mono",
  display: "swap",
});

const siteTitle = "GoHighLevel Specialist for Hire, GHL Expert | John Boy Roxas";
const siteDescription =
  "GoHighLevel specialist who also ships the custom software beside the CRM: Next.js, Firebase, Stripe, and the Claude API. 5 years in CRM and automation, in GoHighLevel since 2023, with live systems you can open right now.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.johnboydesign.com"),
  title: siteTitle,
  description: siteDescription,
  authors: [{ name: "John Boy Roxas" }],
  robots: { index: true, follow: true },
  // Google Search Console, URL-prefix property https://www.johnboydesign.com/ (2026-11-19). Keep it, or the property unverifies.
  verification: { google: "WMMNUbaJo62SUAKrypU30D8TxBBX3CZ52uO3KCa7KoI" },
  openGraph: {
    title: siteTitle,
    description: "GoHighLevel specialist for agencies and small businesses: workflows, funnels, snapshots, integrations and custom apps.",
    url: "https://www.johnboydesign.com",
    siteName: "John Boy Roxas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: "GoHighLevel specialist for agencies and small businesses: workflows, funnels, snapshots, integrations and custom apps.",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "John Boy Roxas",
  alternateName: "Johnboy Roxas",
  jobTitle: "GoHighLevel Specialist",
  description: siteDescription,
  url: "https://www.johnboydesign.com",
  image: "https://www.johnboydesign.com/johnboy.png",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Paniqui",
    addressRegion: "Tarlac",
    addressCountry: "PH",
  },
  knowsAbout: ["GoHighLevel", "AI Automation", "n8n", "Zapier", "CRM Systems", "Sales Funnels", "Next.js", "Firebase", "Stripe", "Claude API"],
  sameAs: [
    "https://www.linkedin.com/in/john-boy-roxas-gohighlevel-specialist",
    "https://www.instagram.com/uix.johnboy/",
    "https://www.facebook.com/uix.johnboy",
    "https://www.upwork.com/freelancers/~01353626f45076c78f",
    "https://www.onlinejobs.ph/jobseekers/info/4412723",
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
