import { readFileSync } from "fs";
import { join } from "path";

// Share card for the site, in the brand system v2 (C:\StudioHQ\departments\Brand\BRAND-SYSTEM-v2.md): Series Stamp,
// Anton headline, his cut-out standing on the End Bar. Rendered by scripts/make-brand-images.mjs to public/og/home.png.

export const runtime = "nodejs";
export const alt = "John Boy Roxas · GoHighLevel, built and fixed. HighLevel certified, GHL since 2023.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const png = readFileSync(join(process.cwd(), "public", "og", "home.png"));
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
}
