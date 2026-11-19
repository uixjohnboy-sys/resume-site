import { readFileSync } from "fs";
import { join } from "path";
import { work } from "@/lib/work";

// Each /work page gets its own share card (WORK 01 to 07), so a link dropped in a post or comment previews like his
// posts. Rendered by scripts/make-brand-images.mjs to public/og/work-<slug>.png from the same work.ts titles.

export const runtime = "nodejs";
export const alt = "John Boy Roxas · GoHighLevel work";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return work.map((w) => ({ slug: w.slug }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const known = work.some((w) => w.slug === slug);
  const png = readFileSync(join(process.cwd(), "public", "og", known ? `work-${slug}.png` : "home.png"));
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
}
