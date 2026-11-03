// One source for the resume: the /v5 page renders this, and the downloadable PDF is printed from that page, so
// the site and the PDF can't drift apart. Same rules as the CV: the NDA client appears only as "Confidential
// client (NDA)" with no country, industry or project detail; no prices; no invented results; no em dashes.
// Numbers match johnboydesign.com (Coach OS counted 2026-09-29).

export const person = {
  name: "John Boy Roxas",
  title: "GoHighLevel Specialist · Automation and Custom App Development",
  location: "Paniqui, Tarlac, Philippines (UTC+8)",
  email: "uix.johnboy@gmail.com",
  phone: "+63 977 365 9548",
  whatsapp: "https://wa.me/639773659548?text=" + encodeURIComponent("Hi John Boy, I found you through your portfolio."),
  linkedin: "https://www.linkedin.com/in/john-boy-roxas-gohighlevel-specialist",
  onlinejobs: "https://www.onlinejobs.ph/jobseekers/info/4412723",
  site: "https://www.johnboydesign.com",
  pdf: "/John-Boy-Roxas-Resume.pdf",
  book: "/book",
  photo: "/v3/jb-hero.webp",
};

export const summary =
  "HighLevel-certified GoHighLevel specialist with 5 years of professional experience and 58 client systems delivered for businesses in the United States and Australia. I also build what most GHL contractors can't: production web apps on Next.js, Firebase, Stripe and the Claude API, wired back into GoHighLevel so the CRM and the app stay in sync.";

export const availability =
  "Available for remote part-time roles, contracts and fixed-scope builds. Part-time, 4 hours a day, starting at 8 AM in your timezone.";

export type LiveProject = {
  name: string;
  kind: string;
  points: string[];
  stats?: string;
  img: string;
  imgAlt: string;
  /** The first link is the one to press. */
  links: { label: string; href: string }[];
};

// Every project here is running right now. New demos join this list as they pass review.
export const projects: LiveProject[] = [
  {
    name: "Tapline",
    kind: "Repairs desk for Australian property managers and UK letting agents. My own demo, with fictional data.",
    points: [
      "Takes a repair from the tenant's report to the bill: AI triage with the property's history, after-hours dispatch, owner approval and invoice checks.",
      "The AI suggests and a person decides. Emergency wording is fixed and checked, and each market has its own trades, notice periods and compliance rules.",
    ],
    img: "/projects/tapline/board.png",
    imgAlt: "The Tapline repairs board",
    links: [
      { label: "Try the guided tour", href: "/demo/tapline?tour=manager" },
      { label: "How it works", href: "/projects/tapline" },
    ],
  },
  {
    name: "Coach OS",
    kind: "Client-management platform for one-to-one coaches, built from zero and wired into GoHighLevel in both directions.",
    points: [
      "Full Stripe subscription lifecycle with webhook signature checks, in-browser e-signature with write-once records, and an AI client companion on the Claude API.",
    ],
    stats: "30,275 lines of code · 26 pages · 36 API endpoints · 10 scheduled jobs · 84 email templates · 26 GHL webhook events",
    img: "/coach-os-shots/app-dash-overview.jpg",
    imgAlt: "The Coach OS dashboard",
    links: [
      { label: "Open the live tour", href: "https://coachos.johnboydesign.com/tour" },
      { label: "Case study", href: "/coach-os" },
    ],
  },
];

export const jobs: { role: string; org: string; where: string; when: string; points: string[] }[] = [
  {
    role: "GoHighLevel Specialist, Automation",
    org: "Confidential client (NDA)",
    where: "Remote",
    when: "Apr 2026 to present",
    points: ["Build and maintain GoHighLevel workflow automation, extended with n8n, Zapier and Claude."],
  },
  {
    role: "GoHighLevel Systems Builder",
    org: "Chaos to Closing",
    where: "Remote, United States",
    when: "Mar 2026 to present",
    points: ["Built the client's entire business inside GoHighLevel from scratch, centred on social media lead capture and ManyChat nurture sequences."],
  },
  {
    role: "Lead Flow and Funnel Operations Specialist",
    org: "Wrldinvsn",
    where: "Remote, project engagement",
    when: "Dec 2025 to Feb 2026",
    points: [
      "Built end-to-end lead tracking from first click to close, so no opportunity was lost between tools.",
      "Designed landing pages and VSL pages for lead capture, and an automated booking system with calendar sync, reminders and cancellation handling.",
    ],
  },
  {
    role: "Lead GHL Automation Architect",
    org: "K Australia Design",
    where: "Remote, Australia",
    when: "Sep 2024 to Oct 2025",
    points: [
      "Engineered scalable GoHighLevel infrastructure that let the agency onboard unlimited clients with zero technical friction.",
      "Built always-on nurture automation across SMS, email and voicemail drop, and managed A2P 10DLC registration to protect deliverability.",
      "Integrated one-click booking and CRM triggers that turned inquiries into confirmed appointments automatically.",
    ],
  },
  {
    role: "Freelance CRM and Automation Consultant",
    org: "Independent",
    where: "Remote, US and AU clients",
    when: "Jan 2024 to present",
    points: [
      "Delivered 13+ systems in GoHighLevel for med spas, real estate teams, coaches and chiropractors.",
      "Specialised in full GHL migrations, snapshot creation and SaaS-mode setup for scaling agencies.",
    ],
  },
  {
    role: "Senior Design and Systems Strategist",
    org: "Masterpiece Las Vegas",
    where: "Remote, United States",
    when: "Feb 2021 to Jun 2023",
    points: [
      "Developed conversion-focused UI/UX strategies and connected lead-capture forms to automated CRM workflows.",
      "Optimised marketing funnels by pairing visual design with data logic to lower lead costs.",
    ],
  },
];

export const skills: [string, string][] = [
  ["GoHighLevel", "Sub-accounts, snapshots, SaaS mode, pipelines and workflows, A2P 10DLC, calendars, forms, funnels, memberships, two-way webhook sync."],
  ["Automation and integration", "n8n, Zapier, Make, the GoHighLevel v2 API, REST APIs and webhooks; idempotent handlers, signature verification and failure-path design."],
  ["Custom development", "Next.js, React, TypeScript, Firebase Firestore with security rules, Stripe billing, Vercel hosting and cron, Upstash Redis."],
  ["AI", "Anthropic Claude API: streaming chat, prompt caching, answers grounded in fixed facts, and a fallback on every call."],
  ["Design and delivery", "Figma to live build, mobile-first layouts, Slack, ClickUp, GitHub, end-to-end testing and written documentation with every build."],
];

export const certifications = ["Workflow Automation Expert", "Funnel Building Expert", "AI Employee Specialist", "Course and Community Expert"];

export const education = { degree: "Bachelor's Degree in Computer Science", place: "Manila, Philippines", when: "2013 to 2018" };
