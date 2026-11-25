// The printed CV (/cv, printed to public/John-Boy-Roxas-Resume.pdf by scripts/make-resume-pdf.mjs).
// Redesigned 2026-11-19 after three expert reviews (C:\StudioHQ\reviews\2026-11-19-cv): GoHighLevel first, standard
// section names an ATS expects, visible links, the freelance clients grouped under one entry, no overlap counting.
// Facts come only from resume.ts and work.ts. Rules: the NDA client is only "Confidential client (NDA)"; no UK
// clients; no prices; no invented results; no em dashes; nothing implying SMS from his own account.
import { certifications, education, person, skills as baseSkills } from "./resume";

export { certifications, education, person };

// Same skills as the site; shorter labels so they never wrap in the print column (ATS round 2).
export const skills: [string, string][] = baseSkills.map(([k, v]) => [k === "Automation and integration" ? "Integrations" : k, v.replace("failure-path design", "failure handling")]);

export const cvTitle = "GoHighLevel (GHL) Specialist · AI Specialist · Full Stack Developer · Integration Engineer · Graphic Designer · HighLevel Certified";

export const contact = [
  { label: "Paniqui, Tarlac, Philippines (UTC+8)" },
  { label: person.email, href: `mailto:${person.email}` },
  { label: "WhatsApp " + person.phone, href: person.whatsapp },
  { label: "johnboydesign.com", href: person.site },
  { label: "linkedin.com/in/john-boy-roxas-gohighlevel-specialist", href: person.linkedin },
  { label: "onlinejobs.ph/jobseekers/info/4412723", href: person.onlinejobs },
];

export const cvSummary =
  "HighLevel-certified GoHighLevel specialist with 5 years in CRM and automation and GoHighLevel since 2023, for agencies and small businesses in Australia and the United States. I build and fix sub-accounts, snapshots, workflows, calendars, pipelines and A2P 10DLC registration, and connect GoHighLevel to other tools through the v2 API and webhooks. When the CRM can't do the job, I build the missing piece as a web app and sync it back.";

export const cvAvailability = "Part-time, 4 to 6 hours a day: Australian business hours, or US mornings (about 7 AM to 1 PM US Eastern). Remote roles, contracts and fixed-scope builds.";

export type Role = { role: string; org: string; where?: string; when: string; points: string[] };
export type Job = Role & { clients?: Role[] };

export const cvJobs: Job[] = [
  {
    role: "GoHighLevel Automation Specialist",
    org: "Confidential client (NDA)",
    where: "Remote",
    when: "Apr 2026 to present",
    points: ["Ongoing GoHighLevel and automation work. Details under NDA."],
  },
  {
    role: "Freelance GoHighLevel Specialist",
    org: "Independent",
    where: "Remote, US and AU clients",
    when: "Jan 2022 to present",
    points: ["Client engagements:"],
    clients: [
      {
        role: "GoHighLevel Systems Builder",
        org: "Chaos to Closing",
        where: "United States",
        when: "Mar 2026 to Sep 2026",
        points: ["Built the client's GoHighLevel account from scratch: social media lead capture and ManyChat nurture sequences."],
      },
      {
        role: "Lead Flow and Funnel Operations Specialist",
        org: "Wrldinvsn",
        where: "Remote",
        when: "Dec 2025 to Feb 2026",
        points: [
          "Built lead tracking from first click to close, so no opportunity was lost between tools.",
          "Designed landing pages and VSL pages for lead capture, and an automated booking system with calendar sync, reminders and cancellation handling.",
        ],
      },
      {
        role: "Lead GHL Automation Architect",
        org: "K Australia Design",
        where: "Australia",
        when: "Sep 2024 to Sep 2025",
        points: [
          "Managed A2P 10DLC registration for deliverability, and built always-on nurture across SMS, email and voicemail drop.",
          "Set up the agency's GoHighLevel so new clients could be onboarded without technical work each time.",
          "Connected one-click booking and CRM triggers that turned enquiries into confirmed appointments automatically.",
        ],
      },
    ],
  },
  {
    role: "Automation and CRM Support",
    org: "Virtualasting",
    where: "Full-time, Manila",
    when: "Feb 2021 to Jul 2024",
    points: [
      "Lead on the Masterpiece Las Vegas account as Senior Design and Systems Strategist, Feb 2021 to Jun 2023.",
      "Designed conversion-focused pages and connected lead-capture forms to automated CRM workflows.",
    ],
  },
];

export type CvProject = { name: string; kind: string; points: string[]; stats?: string; cta: string; links: { label: string; href: string }[] };

export const cvProjects: CvProject[] = [
  {
    name: "Speed-to-lead for a trades business",
    kind: "GoHighLevel build for a made-up roofing business. My own demo, live.",
    points: [
      "A quote enquiry gets an email reply with a booking link within seconds, then follow-ups on day 1, 3 and 7 until they book. Booking stops the follow-ups. The text messages are built but switched off.",
    ],
    cta: "Try it",
    links: [{ label: "johnboydesign.com/work/lead-follow-up", href: "https://www.johnboydesign.com/work/lead-follow-up" }],
  },
  {
    name: "Coach OS",
    kind: "Client-management platform for one-to-one coaches, built from zero and synced with GoHighLevel both ways. My own product.",
    points: ["Stripe subscription lifecycle with webhook signature checks, in-browser e-signature with write-once records, and an AI client companion on the Claude API."],
    stats: "25 GoHighLevel webhook events · 84 email templates · 10 scheduled jobs · 35 API endpoints",
    cta: "Live tour",
    links: [{ label: "coachos.johnboydesign.com/tour", href: "https://coachos.johnboydesign.com/tour" }],
  },
  {
    name: "Tapline",
    kind: "Repairs desk demo for property managers, with fictional data. My own demo.",
    points: ["AI triage with the property's history, owner approval and invoice checks, and a signed webhook that rejects forged and replayed requests."],
    cta: "Live demo",
    links: [{ label: "johnboydesign.com/demo/tapline", href: "https://www.johnboydesign.com/demo/tapline" }],
  },
];
