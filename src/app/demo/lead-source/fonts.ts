import { Figtree, IBM_Plex_Mono } from "next/font/google";
import { anton, host } from "../../fonts";

// The site's Anton and Host Grotesk, IBM Plex Mono with the 600 the test code uses, and Figtree for Kestrel Physio's
// wordmark and ad creative (the made-up client's own type, DESIGN 0).
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-lsmono", weight: ["400", "500", "600"] });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", weight: ["600", "700"] });

export const fontVars = `${anton.variable} ${host.variable} ${mono.variable} ${figtree.variable}`;
