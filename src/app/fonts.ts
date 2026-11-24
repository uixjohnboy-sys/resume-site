// Shared fonts for the neon design system (see home.css).
//
// Archivo is loaded as a VARIABLE font with its width axis exposed, so
// display headings can run expanded (wdth ~122) for the industrial-poster
// look while body text stays at normal width. One family, two voices,
// zero extra font weight on the wire.
//
// Self-hosted since 2026-11-24 (latin subset, woff2 from Google Fonts, in src/fonts/): next/font/google fetched the
// files from Google during every Vercel build, and that fetch failed often enough to break deploys.
import localFont from "next/font/local";

export const archivo = localFont({
  src: [{ path: "../fonts/archivo-normal-100-900.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

// v3 only: a single italic serif voice for the one word per headline that
// carries the turn ("leaves", "past"). Contrast against the wide Archivo is
// what gives the editorial feel; used anywhere else it would turn to noise.
export const serif = localFont({
  src: [
    { path: "../fonts/instrument-serif-normal-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/instrument-serif-italic-400.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

// The homepage: tall condensed headlines, a clean body face and mono labels.
export const anton = localFont({
  src: [{ path: "../fonts/anton-normal-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-anton",
  display: "swap",
});

export const host = localFont({
  src: [{ path: "../fonts/host-grotesk-normal-300-800.woff2", weight: "300 800", style: "normal" }],
  variable: "--font-host",
  display: "swap",
});

export const plex = localFont({
  src: [
    { path: "../fonts/ibm-plex-mono-normal-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-mono-normal-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex",
  display: "swap",
});

export const jetmono = localFont({
  src: [{ path: "../fonts/jetbrains-mono-normal-100-800.woff2", weight: "100 800", style: "normal" }],
  variable: "--font-mono",
  display: "swap",
});
