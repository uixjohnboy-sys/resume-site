// Shared fonts for the neon design system (see home.css).
//
// Archivo is loaded as a VARIABLE font with its width axis exposed, so
// display headings can run expanded (wdth ~122) for the industrial-poster
// look while body text stays at normal width. One family, two voices,
// zero extra font weight on the wire.
import { Archivo, JetBrains_Mono } from "next/font/google";

export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
});

export const jetmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});
