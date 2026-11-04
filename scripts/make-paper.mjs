// Draws the paper for the homepage: public/paper.webp, a seamless tile of crumpled paper with real crease lines, and
// from the same folds, public/paper-map.webp, which bends the ink along those creases (R, G), and public/paper-wear.webp,
// whose alpha thins the ink on them.
// Run: node scripts/make-paper.mjs
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require("C:/EtsyShop/build/node_modules/puppeteer-core");
const here = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

// A height map of folds: each crease is a long line with the sheet sloping away from it, then light falls across the
// result. Sharp lines with soft planes between them is what makes crumpled paper read as paper.
const paper = (S) => {
  let seed = 20261104;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const h = new Float32Array(S * S);
  const bend = new Float32Array(S * S);
  const fold = (len, reach, height, weight) => {
    const x0 = rnd() * S, y0 = rnd() * S, ang = rnd() * Math.PI * 2;
    const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
    const sign = rnd() < 0.5 ? -1 : 1;
    const lx = x1 - x0, ly = y1 - y0, l2 = lx * lx + ly * ly;
    const minX = Math.floor(Math.min(x0, x1) - reach), maxX = Math.ceil(Math.max(x0, x1) + reach);
    const minY = Math.floor(Math.min(y0, y1) - reach), maxY = Math.ceil(Math.max(y0, y1) + reach);
    for (let y = minY; y <= maxY; y++) {
      const yi = ((y % S) + S) % S;
      for (let x = minX; x <= maxX; x++) {
        const t = Math.max(0, Math.min(1, ((x - x0) * lx + (y - y0) * ly) / l2));
        const d = Math.hypot(x - (x0 + t * lx), y - (y0 + t * ly));
        if (d >= reach) continue;
        const fall = 1 - d / reach;
        const xi = ((x % S) + S) % S;
        const lift = sign * height * fall * Math.sqrt(fall);
        h[yi * S + xi] += lift;
        bend[yi * S + xi] += lift * weight;
      }
    }
  };
  for (let i = 0; i < 16; i++) fold(420 + rnd() * 520, 150 + rnd() * 130, 6 + rnd() * 5, 1);
  for (let i = 0; i < 70; i++) fold(120 + rnd() * 300, 45 + rnd() * 70, 2 + rnd() * 2.4, 1.15);
  for (let i = 0; i < 210; i++) fold(30 + rnd() * 110, 10 + rnd() * 24, 0.45 + rnd() * 0.8, 0.8);
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  const img = g.createImageData(S, S);
  const at = (x, y) => h[((y + S) % S) * S + ((x + S) % S)];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = at(x + 1, y) - at(x - 1, y);
      const dy = at(x, y + 1) - at(x, y - 1);
      const light = (dx * -0.62 + dy * -0.78) * 0.05;
      const v = 1 + Math.max(-0.095, Math.min(0.03, light - 0.012)) + (rnd() - 0.5) * 0.009;
      const i = (y * S + x) * 4;
      img.data[i] = 248 * v;
      img.data[i + 1] = 246 * v;
      img.data[i + 2] = 240 * v;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  document.body.appendChild(c);

  // The ink sits on the sheet, so it moves with the sheet's height and thins where a crease is sharp.
  // Softened first, so a line of type curves instead of stepping, and small creases cannot break a letter.
  const soften = (v, r) => {
    const out = new Float32Array(S * S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) sum += v[y * S + ((x + k + S) % S)];
      out[x * S + y] = sum / (2 * r + 1);
    }
    return out;
  };
  const smooth = soften(soften(soften(soften(bend, 5), 5), 5), 5);
  bend.set(smooth);
  const mean = bend.reduce((a, b) => a + b, 0) / bend.length;
  const most = bend.reduce((a, b) => Math.max(a, Math.abs(b - mean)), 0);
  const m = document.createElement("canvas");
  m.width = m.height = S;
  const mg = m.getContext("2d");
  const map = mg.createImageData(S, S);
  const w = document.createElement("canvas");
  w.width = w.height = S;
  const wg = w.getContext("2d");
  const worn = wg.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const lift = (bend[y * S + x] - mean) / most;
      const sharp = Math.abs(at(x + 2, y) + at(x - 2, y) + at(x, y + 2) + at(x, y - 2) - 4 * at(x, y));
      const wear = Math.min(1, sharp * 1.6);
      const i = (y * S + x) * 4;
      map.data[i] = 127.5 * (1 + 0.62 * lift);
      map.data[i + 1] = 127.5 * (1 + 0.78 * lift);
      map.data[i + 2] = 128;
      worn.data[i + 3] = 255 * (1 - 0.07 * wear);
      map.data[i + 3] = 255;
    }
  }
  mg.putImageData(map, 0, 0);
  wg.putImageData(worn, 0, 0);
  const half = document.createElement("canvas");
  half.width = half.height = S / 2;
  const hg = half.getContext("2d");
  hg.imageSmoothingQuality = "high";
  hg.drawImage(m, 0, 0, S / 2, S / 2);
  for (const extra of [half, w]) {
    extra.style.display = "none";
    document.body.appendChild(extra);
  }
};

const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-first-run", "--disable-extensions"] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 1200 });
await page.setContent(`<!doctype html><style>*{margin:0}canvas{display:block}body{background:transparent}</style>`);
await page.evaluate(paper, 1200);
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: join(here, "paper.webp"), type: "webp", quality: 86 });
const show = (i) => page.evaluate((n) => document.querySelectorAll("canvas").forEach((c, k) => { c.style.display = k === n ? "block" : "none"; }), i);
await show(1);
await page.screenshot({ path: join(here, "paper-map.webp"), type: "webp", quality: 94, clip: { x: 0, y: 0, width: 600, height: 600 } });
await show(2);
await page.screenshot({ path: join(here, "paper-wear.webp"), type: "webp", quality: 60, omitBackground: true });
await browser.close();
console.log("ok");
