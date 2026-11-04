// Draws the paper for the homepage: public/paper.webp, a seamless tile of crumpled paper with real crease lines, and
// public/roll-cap.png, the spiral end of the roll. Run: node scripts/make-paper.mjs
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
  const fold = (len, reach, height) => {
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
        h[yi * S + xi] += sign * height * fall * Math.sqrt(fall);
      }
    }
  };
  for (let i = 0; i < 16; i++) fold(420 + rnd() * 520, 150 + rnd() * 130, 6 + rnd() * 5);
  for (let i = 0; i < 70; i++) fold(120 + rnd() * 300, 45 + rnd() * 70, 2 + rnd() * 2.4);
  for (let i = 0; i < 210; i++) fold(30 + rnd() * 110, 10 + rnd() * 24, 0.45 + rnd() * 0.8);
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  const img = g.createImageData(S, S);
  const at = (x, y) => h[((y + S) % S) * S + ((x + S) % S)];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = at(x + 1, y) - at(x - 1, y);
      const dy = at(x, y + 1) - at(x, y - 1);
      const light = (dx * -0.62 + dy * -0.78) * 0.085;
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
};

const cap = (W, H) => {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  let seed = 77;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  g.beginPath();
  g.ellipse(W / 2, H / 2, W / 2 - 1, H / 2 - 1, 0, 0, Math.PI * 2);
  const face = g.createLinearGradient(0, 0, W, 0);
  face.addColorStop(0, "#d8d5ca");
  face.addColorStop(0.55, "#f6f4ec");
  face.addColorStop(1, "#ece9df");
  g.fillStyle = face;
  g.fill();
  g.save();
  g.clip();
  const turns = 13;
  for (let pass = 0; pass < 2; pass++) {
    g.beginPath();
    for (let a = 0; a < turns * Math.PI * 2; a += 0.04) {
      const t = a / (turns * Math.PI * 2);
      const wob = 1 + Math.sin(a * 0.37) * 0.018 + Math.sin(a * 1.3) * 0.006;
      const r = (0.1 + 0.9 * t) * wob + (pass ? 0.009 : 0);
      const x = W / 2 + Math.cos(a) * r * (W / 2 - 1);
      const y = H / 2 + Math.sin(a) * r * (H / 2 - 1);
      a === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.strokeStyle = pass ? "rgba(255,255,255,.75)" : "rgba(92,86,74,.5)";
    g.lineWidth = pass ? 0.8 : 1.1;
    g.stroke();
  }
  void rnd;
  g.beginPath();
  g.ellipse(W / 2, H / 2, W * 0.048, H * 0.048, 0, 0, Math.PI * 2);
  g.fillStyle = "#5c574c";
  g.fill();
  const edge = g.createLinearGradient(0, 0, W, 0);
  edge.addColorStop(0, "rgba(40,36,28,.3)");
  edge.addColorStop(0.3, "rgba(40,36,28,0)");
  g.fillStyle = edge;
  g.fillRect(0, 0, W, H);
  g.restore();
  document.body.appendChild(c);
};

const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-first-run", "--disable-extensions"] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 1200 });
await page.setContent(`<!doctype html><style>*{margin:0}canvas{display:block}body{background:transparent}</style>`);
await page.evaluate(paper, 1200);
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: join(here, "paper.webp"), type: "webp", quality: 86 });
const p2 = await browser.newPage();
await p2.setViewport({ width: 96, height: 296 });
await p2.setContent(`<!doctype html><style>*{margin:0}canvas{display:block}html,body{background:transparent}</style>`);
await p2.evaluate(cap, 96, 296);
await p2.screenshot({ path: join(here, "roll-cap.png"), omitBackground: true });
await browser.close();
console.log("ok");
