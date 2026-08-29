// Shared display fonts for the neon design system (see home.css).
// Loaded once here so the homepage, /coach-os, and /book stay in step.
import { Archivo, JetBrains_Mono } from "next/font/google";

export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700", "800"],
});

export const jetmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});
