// Brand images for the site, in Sofia Reyes's brand system v2 (C:\StudioHQ\departments\Brand\BRAND-SYSTEM-v2.md):
// - Link previews (1200x630): public/og/home.png and public/og/work-<slug>.png, one per /work page. Series Stamp,
//   Anton headline, End Bar with johnboydesign.com; the home card has his cut-out standing on the bar.
// - Icons from logo option B (the Series Stamp as a square JB): src/app/icon.png (512), src/app/apple-icon.png (180),
//   src/app/favicon.ico (16, 32, 48, each rendered at its own size, PNG inside ICO).
// Facts come only from src/lib/work.ts. No em dashes. Run: node scripts/make-brand-images.mjs
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require("C:/EtsyShop/build/node_modules/puppeteer-core");
const sharp = require("sharp");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = (...a) => join(root, ...a);
mkdirSync(p("public", "og"), { recursive: true });

// Read the work list straight from work.ts (title, n, slug, promise) without a TS build.
const src = readFileSync(p("src", "lib", "work.ts"), "utf8");
const items = [...src.matchAll(/\n\s{4}n: "(\d+)",\n\s{4}slug: "([^"]+)",[\s\S]*?\n\s{4}title: "([^"]+)",\n\s{4}promise: "([^"]+)"/g)].map((m) => ({ n: m[1], slug: m[2], title: m[3], promise: m[4] }));
if (items.length !== 7) throw new Error("expected 7 work items, got " + items.length);
for (const t of items.flatMap((i) => [i.title, i.promise])) if (/[\u2013\u2014]/.test(t)) throw new Error("dash in: " + t);

const INK = "#0a0a0a", PAPER = "#ffffff", INK2 = "#3f3f3f";
const cutout = "data:image/webp;base64," + readFileSync(p("public", "jb-cutout.webp")).toString("base64");
const head = `<!doctype html><link href="https://fonts.googleapis.com/css2?family=Anton&family=Host+Grotesk:wght@400;500&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}body{overflow:hidden;position:relative;color:${INK};background:${PAPER};font-family:"Host Grotesk",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.mono{font-family:"IBM Plex Mono",monospace;font-weight:500;text-transform:uppercase;letter-spacing:.14em}
.display{font-family:Anton,Impact,sans-serif;text-transform:uppercase;line-height:.95;letter-spacing:.005em}.abs{position:absolute}</style>`;
const W = 1200, H = 630, X = 72, BAR = 84, N = 24;
const stamp = (series, n) => `<div class="abs mono" style="left:${X}px;top:56px;height:52px;display:flex;font-size:22px"><span style="display:flex;align-items:center;padding:0 14px 0 17px;background:${INK};color:${PAPER}">${series}</span><span style="display:flex;align-items:center;padding:0 14px 0 17px;border:4px solid ${INK};border-left:0">${n}</span></div>`;
const kicker = `<p class="abs mono" style="right:${X}px;top:56px;height:52px;display:flex;align-items:center;font-size:20px;color:${INK2}">HighLevel certified · GHL since 2023</p>`;
const runLine = (y) => `<span class="abs" style="left:${X}px;top:${y - N / 2}px;width:${N}px;height:${N}px;border:4px solid ${INK};background:${PAPER};z-index:2"></span><span class="abs" style="left:${X + N / 2 - 2}px;top:${y}px;width:4px;height:${H - BAR - y}px;background:${INK}"></span>`;
const bar = (left) => `<div class="abs" style="left:0;top:${H - BAR}px;width:${W}px;height:${BAR}px;background:${INK};color:${PAPER};z-index:3">
<span class="abs" style="left:${X}px;top:${(BAR - N) / 2}px;width:${N}px;height:${N}px;background:${PAPER}"></span>
<p class="abs mono" style="left:${X + N + 30}px;top:0;height:${BAR}px;display:flex;align-items:center;font-size:21px">${left}</p>
<p class="abs mono" style="right:${X}px;top:0;height:${BAR}px;display:flex;align-items:center;font-size:21px;font-weight:600;letter-spacing:.1em">johnboydesign.com</p></div>`;

const home = `${head}<body style="width:${W}px;height:${H}px">${stamp("Intro", "00")}
<h1 class="abs display" style="left:${X}px;top:140px;font-size:112px">GoHighLevel,<br>built and fixed.</h1>
<p class="abs" style="left:${X + N + 30}px;top:410px;font-size:28px;color:${INK2};width:540px;line-height:1.3">White-label for agencies. Lead follow-up and booking for small businesses.</p>
${runLine(428)}
<img src="${cutout}" class="abs" style="right:40px;bottom:${BAR}px;height:500px;filter:grayscale(1) contrast(1.05);z-index:2">
${bar("HighLevel certified · GHL since 2023")}</body>`;

const workCard = (w) => `${head}<body style="width:${W}px;height:${H}px">${stamp("Work", w.n)}${kicker}
<h1 class="abs display" style="left:${X}px;top:138px;width:${W - 2 * X}px;font-size:${w.title.length > 22 ? 96 : 112}px">${w.title}</h1>
${runLine(406)}
<p class="abs" style="left:${X + N + 30}px;top:388px;font-size:29px;color:${INK2};width:${W - 2 * X - N - 30}px;line-height:1.32">${w.promise}</p>
${bar("GoHighLevel · John Boy Roxas")}</body>`;

const stampIcon = (px) => {
  const b = Math.max(1, Math.round(px * 0.078)), jw = Math.round((px - 2 * b) * 0.46), fs = Math.round(px * 0.6);
  return `${head}<body style="width:${px}px;height:${px}px"><div style="display:flex;width:${px}px;height:${px}px;border:${b}px solid ${INK}">
<div style="width:${jw}px;background:${INK};display:flex;align-items:center;justify-content:center"><span class="display" style="color:${PAPER};font-size:${fs}px;line-height:1;margin-top:${Math.round(px * 0.035)}px">J</span></div>
<div style="flex:1;display:flex;align-items:center;justify-content:center"><span class="display" style="font-size:${fs}px;line-height:1;margin-top:${Math.round(px * 0.035)}px">B</span></div></div></body>`;
};

const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--disable-lcd-text", "--font-render-hinting=none"] });
const page = await browser.newPage();
async function shot(html, w, h, file) {
  await page.setViewport({ width: w, height: h });
  await page.setContent(html, { waitUntil: "load", timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  const over = await page.evaluate(() => [...document.querySelectorAll("h1,p")].filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 || r.bottom > innerHeight - 84 + 1 && !e.closest("div.abs"); }).map((e) => e.textContent.slice(0, 40)));
  const buf = await page.screenshot({ path: file, type: "png" });
  console.log(file.replace(root, "."), over.length ? "OVERFLOW " + over.join(" | ") : "fits");
  return buf;
}
await shot(home, W, H, p("public", "og", "home.png"));
for (const w of items) await shot(workCard(w), W, H, p("public", "og", `work-${w.slug}.png`));
await shot(stampIcon(512), 512, 512, p("src", "app", "icon.png"));
await shot(stampIcon(180), 180, 180, p("src", "app", "apple-icon.png"));
// favicon.ico: ICONDIR + entries + PNG payloads (PNG-in-ICO, supported by every current browser).
const sizes = [16, 32, 48], pngs = [];
for (const s of sizes) { await page.setViewport({ width: s, height: s, deviceScaleFactor: 1 }); await page.setContent(stampIcon(s), { waitUntil: "load", timeout: 120000 }); await page.evaluate(() => document.fonts.ready); pngs.push(await sharp(await page.screenshot({ type: "png" })).ensureAlpha().png().toBuffer()); } // ICO decoders want RGBA
const hdr = Buffer.alloc(6 + 16 * sizes.length);
hdr.writeUInt16LE(0, 0); hdr.writeUInt16LE(1, 2); hdr.writeUInt16LE(sizes.length, 4);
let off = hdr.length;
sizes.forEach((s, i) => { const e = 6 + 16 * i; hdr.writeUInt8(s, e); hdr.writeUInt8(s, e + 1); hdr.writeUInt8(0, e + 2); hdr.writeUInt8(0, e + 3); hdr.writeUInt16LE(1, e + 4); hdr.writeUInt16LE(32, e + 6); hdr.writeUInt32LE(pngs[i].length, e + 8); hdr.writeUInt32LE(off, e + 12); off += pngs[i].length; });
writeFileSync(p("src", "app", "favicon.ico"), Buffer.concat([hdr, ...pngs]));
sizes.forEach((s, i) => writeFileSync(p("scripts", `.favicon-check-${s}.png`), pngs[i]));
console.log("favicon.ico", sizes.join(","));
await browser.close();
