// Run against a running server (fixture mode): node scripts/leadsource-browser.mjs [baseUrl] [outDir]
// Headless Chrome checks for the Lead-source tracker demo (DESIGN 1 and 9, G2 FIXES):
//   reflow at 320, 390, 720, 1024 and 1440 (no sideways scroll, header keeps ALL WORK and CV), full-page screenshots;
//   every report state from DESIGN 5 at 390 and 1440; "Jump to it" by keyboard at every width (focus lands on the
//   visible Yours item, on screen, hit by elementFromPoint); skip link; row headers; only the four ad links open a new
//   tab and say so; 44 px targets; no em or en dash in the rendered text; the status region is in the HTML before any
//   data and announces once per state; the shell's font sizes against the design scale.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const puppeteer = require("C:/EtsyShop/build/node_modules/puppeteer-core");
const BASE = process.argv[2] || "http://localhost:3200";
const OUT = process.argv[3] || "C:/PortfolioProjects/lead-source-tracker/build/shots";
mkdirSync(OUT, { recursive: true });

const WIDTHS = [320, 390, 720, 1024, 1440];
const HEIGHT = { 320: 640, 390: 844, 720: 900, 1024: 900, 1440: 900 };
const results = [];
let fail = 0;
const check = (ok, msg, extra) => {
  if (!ok) fail++;
  results.push({ ok, msg, ...(extra ? { extra } : {}) });
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}${extra && !ok ? ` ${JSON.stringify(extra)}` : ""}`);
};

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--no-first-run", "--disable-extensions"],
});

/** A page with the visitor's storage set before any script runs. click: [channel, secondsAgo] or null. */
async function open(path, width, { click = null, code = "ref-K7Q2" } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: HEIGHT[width] ?? 900 });
  await page.evaluateOnNewDocument(
    (code, click) => {
      try {
        localStorage.clear();
        localStorage.setItem("ls.code", code);
        if (click) localStorage.setItem("ls.lastClick", JSON.stringify({ ch: click[0], at: Date.now() - click[1] * 1000 }));
      } catch {}
    },
    code,
    click,
  );
  await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => !document.querySelector("#report")?.innerText.includes("Loading the report"), { timeout: 15000 }).catch(() => {});
  return page;
}

const settle = (page, ms = 600) => page.evaluate((ms) => new Promise((r) => setTimeout(r, ms)), ms);

// ---------- 1. Reflow and full-page screenshots ----------
for (const w of WIDTHS) {
  for (const [name, path] of [
    ["demo", "/demo/lead-source"],
    ["report", "/demo/lead-source/report"],
  ]) {
    const page = await open(path, w, { click: ["fb", 60] });
    await settle(page);
    const m = await page.evaluate(() => {
      const nav = [...document.querySelectorAll(".top nav a")].map((a) => {
        const r = a.getBoundingClientRect();
        return { t: a.textContent, w: r.width, h: r.height, right: r.right };
      });
      // overflow-x: clip hides a sideways scroll, so also look for any visible element past the right edge.
      const over = [...document.querySelectorAll(".ls *")]
        .filter((el) => !el.closest(".sr") && el.getClientRects().length && el.getBoundingClientRect().right > innerWidth + 1)
        .map((el) => `${el.tagName}.${el.className}: ${el.textContent.trim().slice(0, 30)}`)
        .slice(0, 5);
      return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, nav, over, h1: getComputedStyle(document.querySelector("h1")).fontFamily };
    });
    check(m.sw <= w, `${name} ${w}: no sideways scroll (scrollWidth ${m.sw})`);
    check(m.over.length === 0, `${name} ${w}: nothing runs past the right edge`, m.over);
    check(m.nav.length === 2 && m.nav.every((n) => n.w > 0 && n.h >= 44 && n.right <= w), `${name} ${w}: header keeps ALL WORK and CV, 44 px high, on screen`, m.nav);
    check(/Anton/i.test(m.h1), `${name} ${w}: H1 in Anton`, m.h1);
    await page.screenshot({ path: join(OUT, `${name}-${w}.png`), fullPage: true });
    await page.close();
  }
}

// ---------- 2. Report states at 390 and 1440 ----------
const STATES = [
  ["found", { click: ["fb", 60] }, "", /Found test code ref-K7Q2\. GoHighLevel saved it as Facebook, paid_social, campaign kp-initial-consult\./],
  ["waiting", { click: ["fb", 1] }, "", /Waiting for test code ref-K7Q2 to appear in GoHighLevel\./],
  ["still-waiting", { click: ["fb", 1] }, "stillwaiting", /Still no booking with test code ref-K7Q2\./],
  ["plain-link", { click: ["plain", 60] }, "", /Your last click was the plain link, so there is no code to look for\./],
  ["pushed-out", { click: ["fb", 60] }, "pushed", /Newer bookings have pushed it out of the latest 10\./],
  ["stale", { click: ["fb", 60] }, "stale", /Showing the report from .*GoHighLevel did not answer just now\. We will try again shortly\./],
  ["error", {}, "error", /The report cannot reach GoHighLevel right now\. If you booked, your booking is still saved there\./],
  ["empty", {}, "empty", /No bookings in the last 4 weeks\. Book from a demo ad and yours will be the first\./],
  ["rate-limited", {}, "limited", /This connection has asked for the report too often\. It will update again in 10 minutes\./],
  ["never-clicked", {}, "", /Sample data\./],
];
for (const w of [390, 1440]) {
  for (const [name, opts, fx, want] of STATES) {
    const page = await open(`/demo/lead-source/report${fx ? `?fx=${fx}` : ""}`, w, opts);
    await settle(page);
    const text = await page.evaluate(() => document.querySelector("#report").innerText.replace(/\s+/g, " "));
    check(want.test(text), `state ${name} at ${w}`);
    if (name === "never-clicked") check(!(await page.$(".yours")), `state ${name} at ${w}: no Your booking box`);
    if (name === "pushed-out") check(!(await page.$("[data-yours]")) && !text.includes("Jump to it"), `state ${name} at ${w}: no Jump to it, no marked row`);
    const el = await page.$("#report");
    await el.screenshot({ path: join(OUT, `state-${name}-${w}.png`) });
    await page.close();
  }
}
// Loading (first visit): the API is held back 2.5 s.
for (const w of [390, 1440]) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: HEIGHT[w] });
  await page.goto(`${BASE}/demo/lead-source/report?fx=slow`, { waitUntil: "domcontentloaded" });
  await settle(page, 800);
  const text = await page.evaluate(() => document.querySelector("#report").innerText);
  check(text.includes("Loading the report from GoHighLevel"), `state loading at ${w}`);
  await (await page.$("#report")).screenshot({ path: join(OUT, `state-loading-${w}.png`) });
  await page.close();
}

// ---------- 3. "Jump to it" by keyboard at every width ----------
for (const w of WIDTHS) {
  const page = await open("/demo/lead-source", w, { click: ["fb", 60] });
  await settle(page);
  let stops = 0;
  let onJump = false;
  for (; stops < 120 && !onJump; stops++) {
    await page.keyboard.press("Tab");
    onJump = await page.evaluate(() => document.activeElement?.textContent === "Jump to it");
  }
  check(onJump, `Jump to it at ${w}: reached by Tab (stop ${stops})`);
  if (onJump) {
    await page.keyboard.press("Enter");
    await settle(page, 300);
    const r = await page.evaluate(() => {
      const a = document.activeElement;
      const b = a.getBoundingClientRect();
      const hit = document.elementFromPoint(b.left + Math.min(20, b.width / 2), b.top + b.height / 2);
      return {
        tag: a.tagName,
        yours: a.hasAttribute("data-yours"),
        inView: b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth,
        hit: !!hit && a.contains(hit),
        outline: getComputedStyle(a).outlineStyle,
        text: a.innerText.replace(/\s+/g, " ").slice(0, 60),
      };
    });
    const want = w <= 760 ? "LI" : "TR";
    check(r.tag === want && r.yours, `Jump to it at ${w}: focus on the visible Yours ${want}`, r);
    check(r.inView && r.hit, `Jump to it at ${w}: focused item on screen and hit by elementFromPoint`, r);
    check(r.outline !== "none", `Jump to it at ${w}: focus ring drawn`, r);
    await page.keyboard.press("Tab");
    const next = await page.evaluate(() => document.activeElement?.tagName);
    check(next === "A" || next === "BUTTON", `Jump to it at ${w}: Tab order goes on after the jump (${next})`);
    await page.screenshot({ path: join(OUT, `jump-${w}.png`) });
  }
  await page.close();
}

// ---------- 4. Skip link, row headers, new tabs, targets, dashes, font scale (1440 and 390) ----------
for (const w of [1440, 390]) {
  const page = await open("/demo/lead-source", w, { click: ["fb", 60] });
  await settle(page);
  await page.keyboard.press("Tab");
  const first = await page.evaluate(() => ({ t: document.activeElement.textContent, top: document.activeElement.getBoundingClientRect().top }));
  check(first.t === "Skip to the demo" && first.top >= 0, `skip link is the first stop and shows on focus at ${w}`, first);
  await page.keyboard.press("Enter");
  const afterSkip = await page.evaluate(() => ({ id: document.activeElement.id, outline: getComputedStyle(document.activeElement).outlineStyle }));
  check(afterSkip.id === "main" && afterSkip.outline === "none", `skip link moves focus to main, no outline, at ${w}`, afterSkip);

  const a11y = await page.evaluate(() => {
    const visible = (el) => el.getClientRects().length > 0;
    const blank = [...document.querySelectorAll("a[target=_blank]")];
    const rowHeads = [...document.querySelectorAll("table.wide tbody tr")].filter((tr) => !tr.classList.contains("loading") && tr.getAttribute("aria-hidden") !== "true").every((tr) => tr.firstElementChild.tagName === "TH" && tr.firstElementChild.getAttribute("scope") === "row");
    const colHeads = [...document.querySelectorAll("table.wide thead th")].every((th) => th.getAttribute("scope") === "col");
    const captions = [...document.querySelectorAll("table.wide")].every((t) => t.querySelector("caption"));
    const inline = (el) => !!el.closest("p.crumb, .privacy p, .state p, .notes, .secsub");
    const small = [...document.querySelectorAll(".ls a, .ls button")]
      .filter((el) => visible(el) && !el.classList.contains("skip") && !inline(el))
      .map((el) => ({ t: el.textContent.trim().slice(0, 40), h: Math.round(el.getBoundingClientRect().height) }))
      .filter((x) => x.h < 44);
    const text = document.body.innerText;
    const sizes = new Set();
    for (const el of document.querySelectorAll(".ls *")) {
      if (!visible(el) || el.closest(".ad") || !el.childNodes.length) continue;
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      sizes.add(parseFloat(getComputedStyle(el).fontSize));
    }
    return {
      blank: blank.map((a) => ({ name: a.textContent.trim(), rel: a.rel })),
      rowHeads,
      colHeads,
      captions,
      small,
      dashes: (text.match(/[\u2013\u2014]/g) || []).length,
      sizes: [...sizes].sort((a, b) => a - b),
      h1: document.querySelectorAll("h1").length,
      sections: [...document.querySelectorAll("main section")].every((s) => s.getAttribute("aria-labelledby") && document.getElementById(s.getAttribute("aria-labelledby"))),
    };
  });
  check(a11y.blank.length === 4 && a11y.blank.every((b) => /opens a new tab/.test(b.name) && /noopener/.test(b.rel)), `only the four ad links open a new tab, and say so, at ${w}`, a11y.blank);
  check(a11y.rowHeads && a11y.colHeads && a11y.captions, `tables: caption, col headers, row headers at ${w}`);
  check(a11y.small.length === 0, `targets at least 44 px (inline sentence links excepted) at ${w}`, a11y.small);
  check(a11y.dashes === 0, `no em or en dash in the rendered text at ${w}`);
  check(a11y.h1 === 1 && a11y.sections, `one H1, every section labelled at ${w}`);
  const allowed = w === 1440 ? [9.5, 12, 12.5, 13, 14, 15, 17, 19, 23, 24, 40, 86] : [9.5, 12, 12.5, 13, 14, 15, 17, 19, 23, 24, 32, 48];
  const off = a11y.sizes.filter((s) => !allowed.includes(s));
  check(off.length === 0, `shell font sizes on the design scale at ${w} (${a11y.sizes.join(", ")})`, off);
  // Spaces survive the render (STUDIO 2026-11-03: read the DOM, not the source). textContent, so CSS case does not matter.
  const phrases = [
    "johnboydesign.com). Unknown means no tags",
    "(Showed or No show). A workflow then moves the booking. In this demo",
    "Found test code ref-K7Q2. GoHighLevel saved it as Facebook, paid_social, campaign kp-initial-consult.",
    "Your test code ref-K7Q2",
    "Here's the physio I mentioned, you can book online",
    "Upcoming means the booking",
    "Questions or deletion sooner: uix.johnboy@gmail.com",
    "Work / Integrations and tracking / Lead-source tracker",
    " · Checks GoHighLevel again every 30 seconds",
    "kestrelphysio Initial consultations",
    "Google, cpc measured at G3",
    "Ads rows count bookings",
    "Attended and No-show come from",
  ];
  const textAll = await page.evaluate(() => document.querySelector(".ls").textContent.replace(/\s+/g, " "));
  const missing = phrases.filter((p) => !textAll.includes(p));
  check(missing.length === 0, `no glued words in the rendered text at ${w}`, missing);
  await page.close();
}

// ---------- 5. The status region: in the HTML before any data, one announcement per state ----------
{
  const html = await (await fetch(`${BASE}/demo/lead-source`)).text();
  check(/<div role="status" class="yours-live"><\/div>/.test(html), "status region is in the server HTML, empty");
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.clear();
      localStorage.setItem("ls.code", "ref-K7Q2");
    } catch {}
    window.__log = [];
    document.addEventListener("DOMContentLoaded", () => {
      const box = document.querySelector('[role="status"]');
      window.__log.push({ at: "ready", present: !!box, text: box ? box.innerText : null });
      let last = box.innerText;
      new MutationObserver(() => {
        const t = box.innerText;
        if (t !== last) {
          window.__log.push({ at: Date.now(), text: t.replace(/\s+/g, " ").slice(0, 70), focus: document.activeElement.tagName });
          last = t;
        }
      }).observe(box, { childList: true, subtree: true, characterData: true });
    });
  });
  await page.goto(`${BASE}/demo/lead-source`, { waitUntil: "networkidle0" });
  // Click the Facebook demo ad (it opens a new tab: close that tab), then wait for the booking to land.
  const pagesBefore = (await browser.pages()).length;
  await page.click(".platbtn");
  await settle(page, 1500);
  for (const p of (await browser.pages()).slice(pagesBefore)) await p.close();
  await page.waitForFunction(() => /Found test code/.test(document.querySelector('[role="status"]').innerText), { timeout: 45000 }).catch(() => {});
  await settle(page, 16000); // one more poll window: checking must have stopped, nothing more is announced
  const log = await page.evaluate(() => window.__log);
  const changes = log.filter((x) => x.at !== "ready");
  check(log[0]?.present && log[0]?.text === "", "status region present and empty at DOMContentLoaded", log[0]);
  check(changes.length === 2 && /^Your booking Waiting/i.test(changes[0].text) && /^Your booking Found/i.test(changes[1].text), "one announcement per state: Waiting, then Found", changes);
  check(changes.every((c) => c.focus !== "TR" && c.focus !== "LI"), "no state change moves focus", changes);
  const lag = changes.length === 2 ? Math.round((changes[1].at - changes[0].at) / 1000) : null;
  results.push({ ok: true, msg: `fixture: Waiting to Found took ${lag} s (fixture lag 12 s, poll 15 s; not the live GHL lag)` });
  await page.close();
}

await browser.close();
writeFileSync(join(OUT, "checks.json"), JSON.stringify({ base: BASE, at: new Date().toISOString(), fail, results }, null, 2));
console.log(fail ? `${fail} FAILED` : "all pass");
process.exitCode = fail ? 1 : 0;
