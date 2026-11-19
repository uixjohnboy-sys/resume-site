// Prints the /cv page (redesigned 2026-11-19) to public/John-Boy-Roxas-Resume.pdf (A4) and
// public/John-Boy-Roxas-Resume-Letter.pdf (US Letter), and sets the PDF title, author, subject and keywords.
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
await page.goto(`${BASE}/cv`, { waitUntil: "networkidle2", timeout: 90000 });
await page.emulateMediaType("print");
await page.evaluate((site) => {
  for (const a of document.querySelectorAll("a[href^='/']")) a.href = site + a.getAttribute("href");
}, SITE);

const text = await page.evaluate(() => document.body.innerText);
const lower = text.toLowerCase();
for (const t of terms) if (lower.includes(t)) throw new Error("NDA term on the page. No PDF written.");
if (text.includes("\u2014")) throw new Error("Em dash on the page. No PDF written.");
if (/\b(aud|usd|gbp|php)\s?\d|\$\s?\d/i.test(text)) throw new Error("A price on the page. No PDF written.");

const { PDFDocument } = require("C:/HarperQuinn-CoachOS/node_modules/pdf-lib");
const outs = [["A4", OUT], ["Letter", OUT.replace(".pdf", "-Letter.pdf")]];
const made = [];
for (const [format, file] of outs) {
  const raw = await page.pdf({ format, printBackground: true });
  const doc = await PDFDocument.load(raw);
  const pages = doc.getPageCount();
  if (pages > 2) throw new Error(`The ${format} PDF is ${pages} pages. Keep it to two. No PDF written.`);
  doc.setTitle("John Boy Roxas, GoHighLevel Specialist, CV");
  doc.setAuthor("John Boy Roxas");
  doc.setSubject("CV: HighLevel-certified GoHighLevel (GHL) specialist, automation, API integrations and custom apps");
  doc.setKeywords(["GoHighLevel", "GHL", "HighLevel", "CRM automation", "workflows", "snapshots", "A2P 10DLC", "API integrations", "webhooks", "Next.js"]);
  made.push([file, await doc.save(), pages, format]);
}
await browser.close();
for (const [file, bytes, pages, format] of made) {
  writeFileSync(file, bytes);
  console.log(`Wrote ${file} (${format}): ${pages} pages, ${Math.round(bytes.length / 1024)} KB`);
}
