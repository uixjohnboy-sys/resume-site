// Builds C:\resume-site\public\Johnboy-Roxas-CV.pdf (two pages, US Letter).
// Run: node scripts/make-cv.cjs   (uses pdf-lib from the Coach OS
// node_modules, and needs the local, gitignored scripts/.nda-terms)
//
// Rules: numbers match johnboydesign.com (Coach OS counted 2026-09-29);
// the NDA client is "Confidential client (NDA)" with no name, country,
// industry or project detail; no em dashes; no prices; no testimonials.
const path = require("path");
const fs = require("fs");
const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = require(
  path.join("C:", "HarperQuinn-CoachOS", "node_modules", "pdf-lib")
);

const OUT = path.join("C:", "resume-site", "public", "Johnboy-Roxas-CV.pdf");

const W = 612, H = 792, M = 56, CW = W - M * 2;
const INK = rgb(0.1, 0.1, 0.12);
const GRAY = rgb(0.42, 0.42, 0.46);
const RULE = rgb(0.85, 0.85, 0.87);
const ACC = rgb(0.6, 0.36, 0.0); // dark amber: the site's accent, readable on white

const header = {
  name: "JOHN BOY BARTOLOME ROXAS",
  title: "GoHighLevel Systems Builder  |  Automation & Custom App Development",
  line1: [
    { t: "Paniqui, Tarlac, Philippines (UTC+8)" },
    { t: "uix.johnboy@gmail.com", url: "mailto:uix.johnboy@gmail.com" },
    { t: "WhatsApp +63 977 365 9548", url: "https://wa.me/639773659548" },
  ],
  line2: [
    { t: "www.johnboydesign.com", url: "https://www.johnboydesign.com" },
    { t: "linkedin.com/in/john-boy-roxas-gohighlevel-specialist", url: "https://www.linkedin.com/in/john-boy-roxas-gohighlevel-specialist" },
    { t: "OnlineJobs.ph profile 4412723", url: "https://www.onlinejobs.ph/jobseekers/info/4412723" },
  ],
};

const summary =
  "GoHighLevel systems builder with 5 years of professional experience and 58 delivered client systems for businesses in the United States, Australia, and the United Kingdom. Beyond standard CRM implementation, I build the custom software most GHL contractors cannot: production web applications on Next.js, Firebase, Stripe, and the Anthropic Claude API, wired back into GoHighLevel by webhook so the CRM and the application stay in sync automatically. My flagship platform, Coach OS, is live and open to review before any interview, and my portfolio runs an AI twin that answers questions about my work.";

const availability =
  "Available for remote part-time roles, contracts and fixed-scope builds, with flexible hours that overlap Australian business hours.";

const competencies = [
  ["GoHighLevel", "Sub-accounts, snapshot engineering, SaaS mode, pipeline and workflow architecture, A2P 10DLC registration and compliance, calendars, forms, funnels, memberships, two-way webhook sync."],
  ["Automation & Integration", "n8n, Zapier, Make, the GoHighLevel v2 API, direct REST APIs and webhooks; idempotent handlers, signature verification, and failure-path design so automations survive real users."],
  ["Custom Development", "Next.js (App Router), React, TypeScript, Firebase Firestore with security rules, Stripe one-time and subscription billing, Vercel hosting and cron, Upstash Redis."],
  ["AI", "Anthropic Claude API for streaming chat, prompt caching, answers grounded in a fixed fact sheet, and a fallback on every call so an outage never shows a broken page."],
  ["Design & Conversion", "Figma to live build, conversion-focused landing pages and funnels, mobile-first layouts verified at 375px and 320px before ship."],
  ["Delivery & Operations", "Slack, ClickUp, GitHub, scoped milestones, end-to-end testing before handoff, written documentation with every build."],
];

const coach = {
  intro:
    "A complete client-management platform for one-to-one coaching practices, designed and built from zero and wired into GoHighLevel in both directions. Live tour at coachos.johnboydesign.com/tour, written case study at johnboydesign.com/coach-os.",
  stats: "30,275 lines of code · 26 pages · 36 API endpoints · 10 scheduled jobs · 84 email templates · 26 GHL webhook events",
  bullets: [
    "Full Stripe subscription lifecycle: payment succeeded, payment failed, and cancellation, each with its own recovery path and webhook signature verification.",
    "In-browser e-signature with permanent clause snapshots, enforced write-once at the database security-rule layer, with branded PDF output.",
    "AI client companion on the Claude API that answers from each client's own history, with hard-coded fallbacks so a failed API call never shows a broken page.",
    "Coach dashboard with per-client health scoring and revenue attribution, computed from already-loaded data with zero additional queries.",
  ],
};

const twin = {
  intro: "The chat on johnboydesign.com, built on the Claude API, with a voice intro and an animated portrait.",
  bullets: [
    "Answers only from a fixed sheet of verified facts, cites the facts it used, and never names confidential clients.",
    "Contact gate with signed 24-hour passes, daily caps per email, per connection and site-wide, and a hard spend ceiling.",
    "Every failure path returns a working message with a way to reach me, never a broken chat.",
  ],
};

const jobs = [
  {
    role: "GoHighLevel Specialist, Automation",
    org: "Confidential client (NDA)",
    where: "Remote",
    when: "Apr 2026 - Present",
    bullets: ["Build and maintain GoHighLevel workflow automation, extended with n8n, Zapier, and Claude."],
  },
  {
    role: "GoHighLevel Systems Builder",
    org: "Chaos to Closing",
    where: "Remote, United States",
    when: "Mar 2026 - Present",
    bullets: ["Built the client's entire business inside GoHighLevel from scratch, centred on social media lead capture and ManyChat nurture sequences."],
  },
  {
    role: "Lead Flow & Funnel Operations Specialist",
    org: "Wrldinvsn",
    where: "Remote, project engagement",
    when: "Dec 2025 - Feb 2026",
    bullets: [
      "Built end-to-end lead tracking from first click to close, so no opportunity was lost between tools.",
      "Designed high-converting landing pages and VSL pages optimised for lead capture.",
      "Engineered an automated booking system with calendar sync, reminders, and cancellation handling.",
    ],
  },
  {
    role: "Lead GHL Automation Architect",
    org: "K Australia Design",
    where: "Remote, Australia",
    when: "Sep 2024 - Oct 2025",
    bullets: [
      "Engineered scalable GoHighLevel infrastructure that let the agency onboard unlimited clients with zero technical friction.",
      "Built always-on multi-channel nurture automation across SMS, email, and voicemail drop.",
      "Managed A2P 10DLC registration and messaging logic to protect deliverability.",
      "Integrated one-click booking and CRM triggers that turned inquiries into confirmed appointments automatically.",
    ],
  },
  {
    role: "Freelance CRM & Automation Consultant",
    org: "Independent",
    where: "Remote, US, AU and UK clients",
    when: "Jan 2024 - Present",
    bullets: [
      "Delivered 13+ GoHighLevel systems for med spas, real estate teams, coaches, and chiropractors.",
      "Specialised in full GHL migrations, snapshot creation, and SaaS-mode setup for scaling agencies.",
    ],
  },
  {
    role: "Senior Design & Systems Strategist",
    org: "Masterpiece Las Vegas",
    where: "Remote, United States",
    when: "Feb 2021 - Jun 2023",
    bullets: [
      "Developed conversion-focused UI/UX strategies and connected lead-capture forms to automated CRM workflows.",
      "Optimised marketing funnels by pairing visual design with data logic to lower lead costs.",
    ],
  },
];

// ---------- guards: rules that must hold before anything is written ----------
const allText = JSON.stringify({ header, summary, availability, competencies, coach, twin, jobs });
const banned = [/\u2014/, /\$\s?\d/];
// Names covered by an NDA live in scripts/.nda-terms (one per line,
// gitignored), so this public repo never carries them. No file, no CV.
const ndaFile = path.join(__dirname, ".nda-terms");
if (!fs.existsSync(ndaFile)) throw new Error("Missing scripts/.nda-terms: the NDA check cannot run.");
const lower = allText.toLowerCase();
for (const term of fs.readFileSync(ndaFile, "utf8").split(/\r?\n/).map((t) => t.trim().toLowerCase()).filter(Boolean))
  if (lower.includes(term)) throw new Error("CV text contains an NDA term from scripts/.nda-terms");
for (const b of banned) if (b.test(allText)) throw new Error("CV text breaks a rule: " + b);

(async () => {
  const doc = await PDFDocument.create();
  doc.setTitle("John Boy Roxas, CV");
  doc.setAuthor("John Boy Roxas");
  doc.setSubject("GoHighLevel Systems Builder, Automation & Custom App Development");
  doc.setKeywords(["GoHighLevel", "Automation", "Next.js", "Stripe", "Claude API"]);
  doc.setCreator("johnboydesign.com");
  doc.setProducer("johnboydesign.com");

  const R = await doc.embedFont(StandardFonts.Helvetica);
  const B = await doc.embedFont(StandardFonts.HelveticaBold);
  const I = await doc.embedFont(StandardFonts.HelveticaOblique);

  let page = doc.addPage([W, H]);
  let y = H - M;

  const ensure = (need) => {
    if (y - need < M) {
      page = doc.addPage([W, H]);
      y = H - M;
    }
  };

  const link = (x, yy, w, h, url) => {
    const annot = doc.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [x, yy - 2, x + w, yy + h],
      Border: [0, 0, 0],
      A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
    });
    const ref = doc.context.register(annot);
    const annots = page.node.lookup(PDFName.of("Annots"));
    if (annots) annots.push(ref);
    else page.node.set(PDFName.of("Annots"), doc.context.obj([ref]));
  };

  // Inline layout: runs of {t, font, color} wrapped to width. Returns lines.
  const wrapRuns = (runs, size, width, indent = 0) => {
    const words = [];
    for (const r of runs) {
      const parts = r.t.split(/(\s+)/).filter((p) => p.length);
      for (const p of parts) words.push({ ...r, t: p });
    }
    const lines = [];
    let line = [], lw = 0, first = true;
    for (const w of words) {
      const ww = w.font.widthOfTextAtSize(w.t, size);
      const avail = width - (first ? 0 : indent);
      if (/^\s+$/.test(w.t)) {
        if (line.length) { line.push(w); lw += ww; }
        continue;
      }
      if (lw + ww > avail && line.length) {
        while (line.length && /^\s+$/.test(line[line.length - 1].t)) line.pop();
        lines.push({ items: line, indent: first ? 0 : indent });
        line = []; lw = 0; first = false;
      }
      line.push(w); lw += ww;
    }
    if (line.length) lines.push({ items: line, indent: first ? 0 : indent });
    return lines;
  };

  const drawRuns = (runs, size, lead, x0 = M, width = CW, indent = 0) => {
    const lines = wrapRuns(runs, size, width - (x0 - M), indent);
    for (const ln of lines) {
      ensure(lead);
      let x = x0 + ln.indent;
      for (const it of ln.items) {
        page.drawText(it.t, { x, y: y - size, size, font: it.font, color: it.color });
        x += it.font.widthOfTextAtSize(it.t, size);
      }
      y -= lead;
    }
  };

  const para = (t, size = 9.6, lead = 13.6, font = R, color = INK) => drawRuns([{ t, font, color }], size, lead);

  const section = (t) => {
    ensure(40);
    y -= 12;
    page.drawText(t, { x: M, y: y - 9.5, size: 9.5, font: B, color: ACC });
    y -= 15;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: RULE });
    y -= 9;
  };

  const bullet = (t, size = 9.6, lead = 13.4) => {
    const lines = wrapRuns([{ t, font: R, color: INK }], size, CW - 14);
    ensure(lead * Math.min(lines.length, 2));
    page.drawText("\u2022", { x: M + 2, y: y - size, size, font: B, color: ACC });
    for (const ln of lines) {
      ensure(lead);
      let x = M + 14;
      for (const it of ln.items) {
        page.drawText(it.t, { x, y: y - size, size, font: it.font, color: it.color });
        x += it.font.widthOfTextAtSize(it.t, size);
      }
      y -= lead;
    }
  };

  const contactLine = (items, size = 8.6) => {
    const sep = "   \u00b7   ";
    let x = M;
    items.forEach((it, i) => {
      if (i) {
        page.drawText(sep, { x, y: y - size, size, font: R, color: GRAY });
        x += R.widthOfTextAtSize(sep, size);
      }
      const w = R.widthOfTextAtSize(it.t, size);
      page.drawText(it.t, { x, y: y - size, size, font: R, color: it.url ? INK : GRAY });
      if (it.url) link(x, y - size, w, size, it.url);
      x += w;
    });
    if (x > W - M + 0.5) throw new Error("Contact line overflows: " + items.map((i) => i.t).join(" | "));
    y -= size + 5;
  };

  // ---------- header ----------
  page.drawText(header.name, { x: M, y: y - 22, size: 22, font: B, color: INK });
  y -= 30;
  page.drawText(header.title, { x: M, y: y - 11.5, size: 11.5, font: R, color: ACC });
  y -= 19;
  contactLine(header.line1);
  contactLine(header.line2);
  y -= 4;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1.2, color: ACC });
  y -= 4;

  // ---------- summary ----------
  section("PROFESSIONAL SUMMARY");
  para(summary);
  y -= 4;
  drawRuns([{ t: "Availability: ", font: B, color: INK }, { t: availability, font: R, color: INK }], 9.6, 13.6);

  // ---------- competencies ----------
  section("CORE COMPETENCIES");
  for (const [k, v] of competencies) {
    drawRuns([{ t: k + ":  ", font: B, color: INK }, { t: v, font: R, color: INK }], 9.6, 13.4, M, CW, 0);
    y -= 2.5;
  }

  // ---------- flagship ----------
  section("FLAGSHIP BUILD: COACH OS");
  para(coach.intro);
  y -= 3;
  drawRuns([{ t: coach.stats, font: B, color: ACC }], 8.8, 12.6);
  y -= 3;
  for (const b of coach.bullets) bullet(b);

  // ---------- AI twin ----------
  section("PORTFOLIO AI TWIN (2026)");
  para(twin.intro);
  y -= 3;
  for (const b of twin.bullets) bullet(b);

  // ---------- experience ----------
  section("PROFESSIONAL EXPERIENCE");
  for (const j of jobs) {
    ensure(13 * 2 + 13.4 * Math.min(j.bullets.length, 2) + 8);
    page.drawText(j.role, { x: M, y: y - 10.5, size: 10.5, font: B, color: INK });
    const ww = R.widthOfTextAtSize(j.when, 9);
    page.drawText(j.when, { x: W - M - ww, y: y - 10.5, size: 9, font: R, color: GRAY });
    y -= 14.5;
    const orgW = I.widthOfTextAtSize(j.org, 9.4);
    page.drawText(j.org, { x: M, y: y - 9.4, size: 9.4, font: I, color: ACC });
    page.drawText("   \u00b7   " + j.where, { x: M + orgW, y: y - 9.4, size: 9, font: R, color: GRAY });
    y -= 14;
    for (const b of j.bullets) bullet(b);
    y -= 6;
  }

  // ---------- education ----------
  section("EDUCATION");
  ensure(30);
  page.drawText("Bachelor's Degree in Computer Science", { x: M, y: y - 10.5, size: 10.5, font: B, color: INK });
  const ew = R.widthOfTextAtSize("2013 - 2018", 9);
  page.drawText("2013 - 2018", { x: W - M - ew, y: y - 10.5, size: 9, font: R, color: GRAY });
  y -= 14.5;
  page.drawText("Manila, Philippines", { x: M, y: y - 9.4, size: 9.4, font: R, color: GRAY });
  y -= 24;

  ensure(24);
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: RULE });
  y -= 14;
  page.drawText("References and a live walkthrough of any system listed above are available on request.", {
    x: M, y: y - 8.6, size: 8.6, font: I, color: GRAY,
  });

  // page numbers
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const t = `John Boy Roxas  \u00b7  CV  \u00b7  ${i + 1} of ${pages.length}`;
    p.drawText(t, { x: W - M - R.widthOfTextAtSize(t, 7.5), y: 30, size: 7.5, font: R, color: GRAY });
  });

  const bytes = await doc.save();
  fs.writeFileSync(OUT, bytes);
  console.log("wrote", OUT, bytes.length, "bytes,", pages.length, "pages");
})();
