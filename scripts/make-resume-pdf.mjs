// Prints the /v5 resume page to public/John-Boy-Roxas-Resume.pdf, so the PDF always matches the site.
// Run with the site up: node scripts/make-resume-pdf.mjs [baseUrl]
// Refuses to write if the page contains an NDA term (local, gitignored scripts/.nda-terms), a price or an em dash,
// or if the PDF runs past two pages. Web paths become full URLs so every link in the PDF works.
import { createRequire } from "node:module";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require("C:/EtsyShop/build/node_modules/puppeteer-core");
const here = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || "http://localhost:3200";
const SITE = "https://www.johnboydesign.com";
const OUT = join(here, "..", "public", "John-Boy-Roxas-Resume.pdf");

const ndaFile = join(here, ".nda-terms");
if (!existsSync(ndaFile)) throw new Error("Missing scripts/.nda-terms: the NDA check cannot run.");
const terms = readFileSync(ndaFile, "utf8").split(/\r?\n/).map((x) => x.trim().toLowerCase()).filter(Boolean);

const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-first-run", "--disable-extensions"] });
const page = await browser.newPage();
await page.goto(`${BASE}/v5`, { waitUntil: "networkidle2", timeout: 90000 });
await page.emulateMediaType("print");
await page.evaluate((site) => {
  for (const a of document.querySelectorAll("a[href^='/']")) a.href = site + a.getAttribute("href");
}, SITE);

const text = await page.evaluate(() => document.body.innerText);
const lower = text.toLowerCase();
for (const t of terms) if (lower.includes(t)) throw new Error("NDA term on the page. No PDF written.");
if (text.includes("\u2014")) throw new Error("Em dash on the page. No PDF written.");
if (/\b(aud|usd|gbp|php)\s?\d|\$\s?\d/i.test(text)) throw new Error("A price on the page. No PDF written.");

const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
const pages = (Buffer.from(pdf).toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
await browser.close();
if (pages > 2) throw new Error(`The PDF is ${pages} pages. Keep it to two. No PDF written.`);
writeFileSync(OUT, pdf);
console.log(`Wrote ${OUT}: ${pages} pages, ${Math.round(pdf.length / 1024)} KB`);
