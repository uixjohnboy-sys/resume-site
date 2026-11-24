import localFont from "next/font/local";
import { anton, host } from "../../fonts";

// The site's Anton and Host Grotesk, IBM Plex Mono with the 600 the test code uses, and Figtree for Kestrel Physio's
// wordmark and ad creative (the made-up client's own type, DESIGN 0).
// Self-hosted (src/fonts) since 2026-11-24.
const mono = localFont({
  src: [
    { path: "../../../fonts/ibm-plex-mono-normal-400.woff2", weight: "400", style: "normal" },
    { path: "../../../fonts/ibm-plex-mono-normal-500.woff2", weight: "500", style: "normal" },
    { path: "../../../fonts/ibm-plex-mono-normal-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-lsmono",
  display: "swap",
});
const figtree = localFont({
  src: [{ path: "../../../fonts/figtree-normal-300-900.woff2", weight: "300 900", style: "normal" }],
  variable: "--font-figtree",
  display: "swap",
});

export const fontVars = `${anton.variable} ${host.variable} ${mono.variable} ${figtree.variable}`;
