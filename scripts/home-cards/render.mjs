// Renders the 7 homepage cover-flow card artworks from card.html with headless Chrome.
// Output: public/home/cards/<slug>.png and <slug>.webp (1200 x 960, pure greyscale, WebP under 120 KB).
// Optional: node scripts/home-cards/render.mjs --sheet <out.png>  also writes a contact sheet
// (all 7 at 300 px wide, then all 7 at 55% of that, on #111) for the quality check.
// No em dashes, no colour: the script fails if a card contains a dash or the raw render has any chroma.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "file:///C:/EtsyShop/build/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const outDir = join(root, "public", "home", "cards");
mkdirSync(outDir, { recursive: true });

const SLUGS = ["lead-follow-up", "ai-agents", "funnels", "integrations", "fixes-and-audits", "agency-snapshots", "custom-apps"];
const only = process.argv.includes("--card") ? process.argv[process.argv.indexOf("--card") + 1] : null;
const sheetOut = process.argv.includes("--sheet") ? process.argv[process.argv.indexOf("--sheet") + 1] : null;
const MAX_WEBP = 120 * 1024;

// headless: true is Chrome's "new" headless mode in puppeteer 23.
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--force-color-profile=srgb", "--disable-lcd-text", "--font-render-hinting=none"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 960, deviceScaleFactor: 1 });

const results = [];
for (const slug of SLUGS) {
  if (only && slug !== only) continue;
  const url = pathToFileURL(join(here, "card.html")).href + "?card=" + slug;
  await page.goto(url, { waitUntil: "networkidle0" });
  const info = await page.evaluate(async () => { await document.fonts.ready; return await window.__cardReady; });
  if (info.slug !== slug) throw new Error("card did not load: " + slug);
  if (info.dash) throw new Error("em or en dash in " + slug);
  if (info.fonts.includes(false)) throw new Error("font missing in " + slug + ": " + JSON.stringify(info.fonts));
  await new Promise((r) => setTimeout(r, 150));
  const raw = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 1200, height: 960 } });

  // Colour gate on the raw render: largest channel difference in any pixel.
  const { data, info: im } = await sharp(raw).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let chroma = 0;
  for (let i = 0; i < data.length; i += im.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    chroma = Math.max(chroma, Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  }
  if (chroma > 2) throw new Error(`colour found in ${slug}: max channel difference ${chroma}`);

  // Store as pure grey (r = g = b) so nothing downstream can add a tint.
  const grey = sharp(raw).removeAlpha().grayscale();
  const png = await grey.clone().png({ compressionLevel: 9 }).toBuffer();
  let q = 85, webp;
  do { webp = await grey.clone().toColourspace("srgb").webp({ quality: q, effort: 6 }).toBuffer(); q -= 3; } while (webp.length > MAX_WEBP && q >= 60);
  if (webp.length > MAX_WEBP) throw new Error(`${slug}.webp is ${webp.length} bytes`);
  writeFileSync(join(outDir, slug + ".png"), png);
  writeFileSync(join(outDir, slug + ".webp"), webp);
  results.push({ slug, chroma, png: Math.round(png.length / 1024) + " KB", webp: Math.round(webp.length / 1024) + " KB", q: q + 3 });
}
await browser.close();
console.table(results);

if (sheetOut) {
  const big = 300, small = Math.round(big * 0.55), gap = 24, pad = 40;
  const bh = big * 0.8, sh = small * 0.8;
  const width = pad * 2 + big * 7 + gap * 6;
  const height = pad * 3 + bh + sh;
  const layers = [];
  for (let i = 0; i < SLUGS.length; i++) {
    const src = join(outDir, SLUGS[i] + ".png");
    layers.push({ input: await sharp(src).resize(big).png().toBuffer(), left: pad + i * (big + gap), top: pad });
    const smallLeft = Math.round(pad + i * (big + gap) + (big - small) / 2);
    layers.push({ input: await sharp(src).resize(small).png().toBuffer(), left: smallLeft, top: Math.round(pad * 2 + bh) });
  }
  await sharp({ create: { width, height: Math.round(height), channels: 3, background: "#111111" } }).composite(layers).png().toFile(sheetOut);
  console.log("contact sheet:", sheetOut);
}
