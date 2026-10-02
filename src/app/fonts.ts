// Shared fonts for the neon design system (see home.css).
//
// Archivo is loaded as a VARIABLE font with its width axis exposed, so
// display headings can run expanded (wdth ~122) for the industrial-poster
// look while body text stays at normal width. One family, two voices,
// zero extra font weight on the wire.
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";

export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
});

// v3 only: a single italic serif voice for the one word per headline that
// carries the turn ("leaves", "past"). Contrast against the wide Archivo is
// what gives the editorial feel; used anywhere else it would turn to noise.
export const serif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
});

export const jetmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});
