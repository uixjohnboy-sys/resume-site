// The work index (spec: C:\PortfolioProjects\work-cards\SPEC.md, 2026-11-13). Four kinds of work, ordered by how often
// AU and UK job posts ask for them, each with its own page at /work/<slug> so an application can link the one that fits.
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
};

export type Work = {
  n: string;
  slug: string;
  title: string;
  promise: string;
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
      },
    ],
  },
  {
    n: "02",
    slug: "ai-agents",
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
      },
      {
        kind: "My own demo",
        name: "Tapline",
        line: "AI triage of tenant repair reports, using the property's history. The AI suggests and a person decides.",
        href: "/demo/tapline?tour=manager",
        cta: "Try it",
      },
      {
        kind: "My own product",
        name: "Coach OS",
        line: "An AI client companion on the Claude API, inside a coaching platform.",
        href: "/coach-os",
        cta: "Case study",
      },
    ],
    shot: { src: "/projects/tapline/board.png", alt: "Tapline's repairs board with AI triage", w: 2880, h: 1800 },
  },
  {
    n: "03",
    slug: "integrations",
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
        line: "Synced with GoHighLevel in both directions across 26 webhook events, with Stripe subscriptions handled from sign-up to cancel and every webhook signature checked.",
        href: "/coach-os",
        cta: "Case study",
      },
      {
        kind: "My own demo",
        name: "Tapline",
        line: "A real signed webhook you can try to break: forged and replayed requests are rejected, retries are never applied twice, and failed events wait in a log.",
        href: "/projects/tapline",
        cta: "How it works",
      },
      {
        kind: "Client work",
        name: "Wrldinvsn",
        line: "Built end-to-end lead tracking from first click to close, so no opportunity was lost between tools.",
      },
    ],
  },
  {
    n: "04",
    slug: "custom-apps",
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
        line: "A client-management platform for one-to-one coaches: 30,275 lines of code, 26 pages, 36 API endpoints, 10 scheduled jobs and 84 email templates (counted Sept 2026).",
        href: "/coach-os",
        cta: "Case study",
      },
      {
        kind: "My own demo",
        name: "Tapline",
        line: "A repairs desk for Australian property managers and UK letting agents, from the tenant's report to the bill. Fictional data.",
        href: "/demo/tapline?tour=manager",
        cta: "Try it",
      },
      {
        kind: "My own demo",
        name: "Deskhand",
        line: "An AI front desk for a home cleaning business, with a work log and a calendar you can watch it fill. A simulation with fictional data.",
        href: "/demo/deskhand",
        cta: "Try it",
      },
    ],
    shot: { src: "/coach-os-shots/app-dash-kanban.jpg", alt: "Coach OS owner pipeline", w: 1440, h: 760 },
  },
];

export const workBySlug = (slug: string) => work.find((w) => w.slug === slug);
