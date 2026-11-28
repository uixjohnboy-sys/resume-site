// The work index (spec: C:\PortfolioProjects\work-cards\SPEC.md, 2026-11-13). Seven kinds of work since 2026-11-15 (JB:
// add every planned card, planned demos marked Soon), ordered by how often AU and UK job posts ask for them (research\
// Most requested app builds.md), each with its own page at /work/<slug> so an application can link the one that fits.
// Same rules as the CV (src/lib/resume.ts): client work only as written there, demos labelled as demos, no invented
// results, prices or policies, the NDA client never described. JB's GoHighLevel account has no SMS (LC Phone is not
// available to him in the Philippines), so nothing here says or implies that a demo sends real texts.

export type Proof = {
  /** "Client work" for paid work from resume.ts, "My own demo" or "My own product" for his builds. */
  kind: "Client work" | "My own demo" | "My own product";
  name: string;
  line: string;
  href?: string;
  cta?: string;
  /** A planned demo from the job-post research (PortfolioProjects\research\Most requested app builds.md), not public
   * yet. Shown with a "Soon" label and no link; no date is promised. */
  soon?: true;
  /** Screenshot (800 x 500 WebP in public/work/demos) for the category page's cover-flow (JB 2026-11-28 mockup). Only
   * entries with a card appear in the flow; card 1 is always the category itself. */
  card?: string;
  /** The open view under the flow: what was built, and what each piece does for the client. */
  detail?: DemoDetail;
};

/** One built piece of a demo. `img` is a real screenshot; `mail` and `flow` are drawn stand-ins (labelled as drawings
 * on the page) for an email or a workflow until its screenshot is taken. */
export type Piece = {
  what: string;
  title: string;
  benefit: string;
  img?: string;
  phone?: string;
  mail?: { from: string; subject: string; cta?: string };
  flow?: string[];
};

export type DemoDetail = {
  kicker: string;
  /** Who the benefits are for, in "For the clinic:" (default business). */
  audience?: string;
  intro: string;
  url: string;
  hero: { src: string; w: number; h: number; alt: string };
  test?: { label: string; href: string };
  facts: [string, string][];
  pieces: Piece[];
  owner?: { text: string; img: string; href: string };
};

// Kestrel Physio (PortfolioProjects/funnel-studio/kestrel, GHL-BUILD.md): coded front on Vercel, GoHighLevel behind it.
// Counts are from the build log: 6 pages, 5 calendars, 3 published workflows (Booked, Missed visit, Plan email), and
// two reminder emails per booking (1 day and 2 hours before). Emails only; the account sends no texts.
const KESTREL_URL = "https://kestrel.johnboydesign.com";
const KESTREL: DemoDetail = {
  kicker: "Made-up clinic, real system",
  audience: "clinic",
  intro:
    "A physio clinic in Brisbane that doesn't exist, with a booking system that does. Patients answer two questions, see the visit that fits, and book it. GoHighLevel then sends the confirmation, the reminders and the follow-ups on its own.",
  url: "kestrel.johnboydesign.com",
  hero: { src: "/work/demos/kestrel-home-1440.webp", w: 1440, h: 900, alt: "Kestrel Physio home page with the two-question appointment finder" },
  test: { label: "Book a test visit with your email", href: `${KESTREL_URL}/book` },
  facts: [
    ["6", "Pages"],
    ["5", "Live calendars"],
    ["3", "Workflows"],
    ["2", "Reminders per booking"],
  ],
  pieces: [
    {
      what: "Landing page",
      title: "Two questions find the right visit",
      benefit: "Patients choose the right appointment type themselves, so the front desk isn't sorting it out on the phone.",
      img: "/work/demos/kestrel-home-800.webp",
    },
    {
      what: "Live GoHighLevel calendars",
      title: "Book any hour, even for today",
      benefit: "Bookings come in after hours, and the body area and who is paying arrive on the contact before the visit.",
      img: "/work/demos/kestrel-book-800.webp",
    },
    {
      what: "Thank-you page",
      title: "The patient knows what happens next",
      benefit: "Each appointment type gets its own summary, so nobody has to email to ask if the booking went through.",
      img: "/work/demos/kestrel-thanks-800.webp",
    },
    {
      what: "Confirmation and reminders",
      title: "A day before, and two hours before",
      benefit: "Each email has a link to move or cancel, so a visit that can't happen frees its slot for someone else.",
      mail: { from: "Kestrel Physio (demo)", subject: "Reminder: your visit is tomorrow", cta: "Change or cancel" },
    },
    {
      what: "Workflow: missed visit",
      title: "A no-show gets a kind rebook email",
      benefit: "No awkward phone call. The patient gets a way back in, on its own.",
      img: "/work/demos/kestrel-wf-missed-800.webp",
    },
    {
      what: "Workflow: after the visit",
      title: "Patients on a plan book the next visit",
      benefit: "The plan keeps going without staff chasing, and the email stops the moment they book.",
      img: "/work/demos/kestrel-wf-plan-800.webp",
    },
    {
      what: "Staff alert",
      title: "The team sees every booking at once",
      benefit: "Name, time, body area, funding and physio preference, in one email.",
      mail: { from: "Kestrel demo alerts", subject: "New booking: Sports injury consultation" },
    },
    {
      what: "Phone",
      title: "Built for the phone first",
      benefit: "Patients often book from their phone, so every page and the calendar work at phone width.",
      phone: "/work/demos/kestrel-phone-390.webp",
    },
    {
      what: "Fees and first-visit pages",
      title: "Answers before they ask",
      benefit: "Fees, rebates and what to bring are on the site, not in the inbox.",
      img: "/work/demos/kestrel-fees-800.webp",
    },
  ],
  owner: {
    text: "Every page on the live site has an Owner view switch. It shows what each part does behind the scenes and how it's built, so a buyer sees the system, not just the design.",
    img: "/work/demos/kestrel-first-800.webp",
    href: KESTREL_URL,
  },
};

const KESTREL_PROOF: Proof = {
  kind: "My own demo",
  name: "Kestrel Physio",
  line: "A booking site for a made-up physio clinic: patients find the right visit in two questions, then book it on a live GoHighLevel calendar that sends the confirmation and reminders by email.",
  href: KESTREL_URL,
  cta: "Open the site",
  card: "/work/demos/kestrel-home-800.webp",
  detail: KESTREL,
};

export type Work = {
  n: string;
  slug: string;
  title: string;
  promise: string;
  /** Search title (50 to 60 characters) and description (about 150), from C:\StudioHQ\seo\SEO-AUDIT-2026-11-18.md. */
  seoTitle: string;
  seoDescription: string;
  /** The one proof line the home index shows: the strongest real fact, client work first. */
  lead: { kind: Proof["kind"]; name: string; when?: string; line: string };
  /** The one thing to open from the index row. */
  live?: { label: string; href: string };
  covers: string[];
  proof: Proof[];
  shot?: { src: string; alt: string; w: number; h: number };
};

export const work: Work[] = [
  {
    n: "01",
    slug: "lead-follow-up",
    seoTitle: "GoHighLevel Lead Follow-Up and Booking | John Boy Roxas",
    seoDescription: "GoHighLevel lead follow-up that runs itself: an instant reply, a booking link, reminders and follow-ups until they book. For agencies and small businesses.",
    title: "Lead follow-up and booking",
    promise: "Every new enquiry gets an automatic reply and a link to book. If they don't book, the follow-up keeps going.",
    lead: { kind: "Client work", name: "K Australia Design", when: "Sep 2024 to Sep 2025", line: "One-click booking and CRM triggers that turned enquiries into confirmed appointments." },
    live: { label: "Book a call on my GoHighLevel calendar", href: "/book" },
    covers: [
      "Forms and landing pages that put the lead straight into your pipeline",
      "A first reply, then follow-ups by email, and by SMS where your account sends it",
      "Self-booking calendars with reminders, reschedules and cancellations",
      "Pipeline stages that move on their own as the lead books, shows or goes quiet",
      "The source of every lead saved on the contact",
    ],
    proof: [
      {
        kind: "Client work",
        name: "K Australia Design",
        line: "Integrated one-click booking and CRM triggers that turned enquiries into confirmed appointments automatically. Built always-on nurture across SMS, email and voicemail drop, and managed A2P 10DLC registration (US SMS registration).",
      },
      {
        kind: "Client work",
        name: "Wrldinvsn",
        line: "Built an automated booking system with calendar sync, reminders and cancellation handling, and lead tracking from first click to close.",
      },
      {
        kind: "Client work",
        name: "Chaos to Closing",
        line: "Built the client's entire business inside GoHighLevel from scratch, centred on social media lead capture and ManyChat nurture sequences.",
      },
      {
        kind: "My own demo",
        name: "Deskhand",
        line: "An AI front desk that takes a cleaning job from first message to a booked visit, in a chat on the page. It's a simulation; no texts or emails are sent.",
        href: "/demo/deskhand",
        cta: "Try it",
        card: "/work/demos/deskhand-800.webp",
      },
      {
        kind: "My own demo",
        name: "Speed-to-lead for a trades business",
        line: "A quote enquiry gets an email reply with a booking link within seconds, then follow-ups on day 1, 3 and 7 until they book. Built in GoHighLevel for a made-up roofing business. Try it with your own email; the text messages are built but switched off.",
        href: "https://link.funnelgenie.io/widget/form/VeG0q0l7Gk3CYGlz9HSM",
        cta: "Try it",
        card: "/work/demos/speed-form-800.webp",
      },
      KESTREL_PROOF,
    ],
  },
  {
    n: "02",
    slug: "ai-agents",
    seoTitle: "GoHighLevel AI Agents on the Claude API | John Boy Roxas",
    seoDescription: "AI agents for GoHighLevel that answer customer messages from your own prices and rules, book simple jobs in your calendar and hand the rest to a person.",
    title: "AI agents",
    promise: "An AI that answers customer messages from your prices and rules. It books the simple jobs and passes the rest to you.",
    lead: { kind: "My own demo", name: "Deskhand", line: "Books and moves cleaning jobs, and passes the rest to the owner. Prices come from the price list, never the AI. A simulation with fictional data." },
    live: { label: "Try Deskhand", href: "/demo/deskhand" },
    covers: [
      "Answers from your own facts and price list, never made up",
      "Books and moves appointments in your real calendar",
      "Hands complaints, odd jobs and anything risky to a person, with a summary",
      "A work log of every action, so you can see what it did and why",
      "Runs on the Claude API, connected to GoHighLevel or your own system",
    ],
    proof: [
      {
        kind: "My own demo",
        name: "Deskhand",
        line: "An AI front desk for a home cleaning business, in a chat on the page. It books and moves jobs and passes complaints and odd jobs to the owner with a summary. Prices come from the price list, never the AI, and an emergency gets a fixed safety message, not an AI answer. It's a simulation; no texts or emails are sent.",
        href: "/demo/deskhand",
        cta: "Try it",
        card: "/work/demos/deskhand-800.webp",
      },
      {
        kind: "My own demo",
        name: "Tapline",
        line: "AI triage of tenant repair reports, using the property's history. The AI suggests and a person decides.",
        href: "/demo/tapline?tour=manager",
        cta: "Try it",
        card: "/work/demos/tapline-800.webp",
      },
      {
        kind: "My own product",
        name: "Coach OS",
        line: "An AI client companion on the Claude API, inside a coaching platform.",
        href: "/coach-os",
        cta: "Case study",
        card: "/work/demos/coachos-800.webp",
      },
      {
        kind: "My own demo",
        name: "AI inbox to CRM",
        line: "AI reads each enquiry email, sorts it, and creates the contact and the right task in GoHighLevel.",
        soon: true,
      },
    ],
    shot: { src: "/projects/tapline/board.png", alt: "Tapline's repairs board with AI triage", w: 2880, h: 1800 },
  },
  {
    n: "03",
    slug: "funnels",
    seoTitle: "GoHighLevel Funnels and Landing Pages | John Boy Roxas",
    seoDescription: "GoHighLevel funnels, landing pages and VSL pages wired to your follow-up from the first click. Built by a HighLevel-certified Funnel Building Expert.",
    title: "Funnels and landing pages",
    promise: "Pages that turn visitors into enquiries, built in GoHighLevel and wired to your follow-up from the first click.",
    lead: { kind: "Client work", name: "Wrldinvsn", when: "Dec 2025 to Feb 2026", line: "Landing pages and VSL pages for lead capture, wired to an automated booking system." },
    live: { label: "Open the Kestrel Physio demo site", href: "https://kestrel.johnboydesign.com" },
    covers: [
      "Funnels, landing pages and websites built in GoHighLevel",
      "Forms and surveys that tag the lead and start the right follow-up",
      "Booking and payment steps inside the funnel",
      "Tracking on every page, so you know which one brings the enquiries",
      "Built from your design, or a clean layout if you don't have one",
    ],
    proof: [
      {
        kind: "Client work",
        name: "Wrldinvsn",
        line: "Designed landing pages and VSL pages for lead capture, and an automated booking system with calendar sync, reminders and cancellation handling.",
      },
      {
        kind: "Client work",
        name: "Chaos to Closing",
        line: "Built the client's entire business inside GoHighLevel from scratch, centred on social media lead capture and ManyChat nurture sequences.",
      },
      {
        kind: "Client work",
        name: "Virtualasting",
        line: "On the Masterpiece Las Vegas account: conversion-focused page design, with lead-capture forms connected to automated CRM workflows.",
      },
      KESTREL_PROOF,
      {
        kind: "My own demo",
        name: "Lumiere Aesthetic",
        line: "A booking website for a made-up aesthetic clinic, built in GoHighLevel around one action: book a private assessment. I designed the logo and the layout; the photos are stock.",
        href: "https://lumiereaesthetic.johnboydesign.com/home",
        cta: "Open the site",
        card: "/work/demos/lumiere-800.webp",
      },
      {
        kind: "My own demo",
        name: "How I built Lumiere",
        line: "A screen recording where I walk through the Lumiere build in GoHighLevel, page by page.",
        href: "https://drive.google.com/file/d/1MfN7JlZdr9jzJutqL36mKz29GjWOKWId/view",
        cta: "Watch",
      },
      {
        kind: "My own demo",
        name: "Quote form for a trades business",
        line: "A quote form for a made-up roofing business that saves the job type and where the lead heard about you, then starts the follow-up.",
        href: "https://link.funnelgenie.io/widget/form/VeG0q0l7Gk3CYGlz9HSM",
        cta: "Try it",
        card: "/work/demos/speed-form-800.webp",
      },
    ],
  },
  {
    n: "04",
    slug: "integrations",
    seoTitle: "GoHighLevel API and Webhook Integrations | John Boy Roxas",
    seoDescription: "Connect GoHighLevel to your other tools with the v2 API, webhooks, n8n, Zapier or Make. Signed webhooks, no duplicate events, and a log for failed updates.",
    title: "Integrations and tracking",
    promise: "A change in one tool reaches your CRM. If an update fails, it waits in a log instead of going missing.",
    lead: { kind: "Client work", name: "Wrldinvsn", when: "Dec 2025 to Feb 2026", line: "Lead tracking from first click to close, so no opportunity was lost between tools." },
    live: { label: "Break Tapline's webhook", href: "/projects/tapline" },
    covers: [
      "GoHighLevel connected to the other tools you pay for, through their APIs and webhooks",
      "Payments that update the contact, so follow-ups stop once someone has paid",
      "Webhooks that check signatures and never apply the same event twice",
      "A log of failed events, so nothing is lost quietly",
      "Lead source tracking from first click to close",
    ],
    proof: [
      {
        kind: "My own product",
        name: "Coach OS",
        line: "Synced with GoHighLevel in both directions across 25 webhook events, with Stripe subscriptions handled from sign-up to cancel and every webhook signature checked.",
        href: "/coach-os",
        cta: "Case study",
        card: "/work/demos/coachos-800.webp",
      },
      {
        kind: "My own demo",
        name: "Tapline",
        line: "A real signed webhook you can try to break: forged and replayed requests are rejected, retries are never applied twice, and failed events wait in a log.",
        href: "/projects/tapline",
        cta: "How it works",
        card: "/work/demos/tapline-800.webp",
      },
      {
        kind: "Client work",
        name: "Wrldinvsn",
        line: "Built end-to-end lead tracking from first click to close, so no opportunity was lost between tools.",
      },
      {
        kind: "My own demo",
        name: "Lead-source tracker",
        line: "Every booking shows which ad or channel it came from.",
        soon: true,
      },
      {
        kind: "My own demo",
        name: "Paid-invoice sync",
        line: "When a customer pays, GoHighLevel stops chasing and sends a thank-you.",
        soon: true,
      },
    ],
  },
  {
    n: "05",
    slug: "fixes-and-audits",
    seoTitle: "GoHighLevel Audit and Workflow Fixes | John Boy Roxas",
    seoDescription: "GoHighLevel audit and fixes: workflows that misfire, triggers, calendars, forms and A2P 10DLC registration. You get a written list of every change I make.",
    title: "GoHighLevel fixes and audits",
    promise: "I find what's broken in your GoHighLevel account, fix it, and give you a written list of every change.",
    lead: { kind: "Client work", name: "K Australia Design", when: "Sep 2024 to Sep 2025", line: "Managed A2P 10DLC registration (US SMS registration) to protect deliverability." },
    covers: [
      "Workflows that misfire, loop or send twice",
      "Calendars, forms and pipelines that don't connect",
      "Triggers that fire for the wrong contacts",
      "Email and SMS deliverability: sending domains and A2P registration",
      "A written list of every change, before and after",
    ],
    proof: [
      {
        kind: "Client work",
        name: "K Australia Design",
        line: "Built always-on nurture automation across SMS, email and voicemail drop, and managed A2P 10DLC registration (US SMS registration) to protect deliverability.",
      },
      {
        kind: "My own demo",
        name: "Follow-up teardown",
        line: "A clinic's enquiry follow-up that kept emailing people after they booked: the cause found in the logs, every change with how to undo it, and five tests with times. Built broken on purpose in my own GoHighLevel account.",
        href: "/demo/followup-teardown",
        cta: "Read the teardown",
        card: "/work/demos/teardown-800.webp",
      },
    ],
  },
  {
    n: "06",
    slug: "agency-snapshots",
    seoTitle: "White Label GoHighLevel Snapshots | John Boy Roxas",
    seoDescription: "White-label GoHighLevel setup for agencies: a niche sub-account built once and saved as a snapshot, with SaaS mode, custom values and a setup guide.",
    title: "Agency setup and snapshots",
    promise: "A sub-account set up once and saved as a snapshot, so each new client starts ready to run.",
    lead: { kind: "Client work", name: "K Australia Design", when: "Sep 2024 to Sep 2025", line: "GoHighLevel infrastructure that let the agency onboard new clients without technical work each time." },
    covers: [
      "A sub-account built for one niche, saved as a snapshot",
      "Pipelines, calendars, forms and workflows named so your team can find them",
      "Custom fields and values, so one snapshot fits many clients",
      "A setup guide and a test checklist with every snapshot",
      "SaaS mode and white-label setup for agencies",
    ],
    proof: [
      {
        kind: "Client work",
        name: "K Australia Design",
        line: "Engineered scalable GoHighLevel infrastructure that let the agency onboard new clients without technical work each time.",
      },
      {
        kind: "My own demo",
        name: "Speed-to-lead kit for trades",
        line: "The live Tallowood Roofing build (form, calendar, pipeline and three follow-up workflows) with a one-page guide to set it up in any sub-account.",
        href: "/guides/speed-to-lead-kit.pdf",
        cta: "Read the guide",
      },
    ],
  },
  {
    n: "07",
    slug: "custom-apps",
    seoTitle: "Custom Apps Connected to GoHighLevel | John Boy Roxas",
    seoDescription: "When GoHighLevel can't do the job, I build the web app on Next.js, Firebase and Stripe and sync it back to your CRM. See Coach OS: 25 GHL webhook events.",
    title: "Custom apps",
    promise: "When GoHighLevel can't do the job, I build the app you need and connect it back to GoHighLevel.",
    lead: { kind: "My own product", name: "Coach OS", line: "A platform where coaches run clients, agreements, payments and an AI companion, synced with GoHighLevel. Demo data." },
    live: { label: "Open the Coach OS tour", href: "https://coachos.johnboydesign.com/tour" },
    covers: [
      "Web apps on Next.js, Firebase and Stripe, hosted on Vercel",
      "Client portals, dashboards and booking tools your customers log into",
      "Connected to GoHighLevel, so the CRM and the app stay in step",
      "Tested before handover, with written notes on how it works",
    ],
    proof: [
      {
        kind: "My own product",
        name: "Coach OS",
        line: "A client-management platform for one-to-one coaches: 29,709 lines of code, 26 pages, 35 API endpoints, 10 scheduled jobs and 84 email templates (counted Nov 2026).",
        href: "/coach-os",
        cta: "Case study",
        card: "/work/demos/coachos-800.webp",
      },
      {
        kind: "My own demo",
        name: "Tapline",
        line: "A repairs desk for Australian property managers and UK letting agents, from the tenant's report to the bill. Fictional data.",
        href: "/demo/tapline?tour=manager",
        cta: "Try it",
        card: "/work/demos/tapline-800.webp",
      },
      {
        kind: "My own demo",
        name: "Deskhand",
        line: "An AI front desk for a home cleaning business, with a work log and a calendar you can watch it fill. A simulation with fictional data.",
        href: "/demo/deskhand",
        cta: "Try it",
        card: "/work/demos/deskhand-800.webp",
      },
    ],
    shot: { src: "/coach-os-shots/app-dash-kanban.jpg", alt: "Coach OS owner pipeline", w: 1440, h: 760 },
  },
];

/** Planned demos (soon: true) stay in the data but are hidden on the site until they ship (JB 2026-11-22, after the
 *  hiring-manager review said four Demo soon cards read as unfinished work). Set true to show them again. */
export const SHOW_SOON = false;

export const workBySlug = (slug: string) => work.find((w) => w.slug === slug);
