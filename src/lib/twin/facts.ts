// Everything John Boy's AI twin is allowed to know. Nothing else.
//
// Rules for this file (read before adding anything):
// - Only facts that are already public on johnboydesign.com or counted from
//   the Coach OS repository. Numbers recounted 2026-09-29.
// - NEVER add NDA work: no client names, no portals or dashboards built for a
//   named client, nothing from any confidential client build, in any form. The old homepage testimonials are not here either: they were never
//   re-verified with the clients, so the twin must not quote them.
// - No prices. He quotes per project after seeing the scope.
// - Every fact has a stable id; the twin cites the ids it used and the chat
//   shows them under "See how I answered".

export type Fact = { id: string; title: string; text: string };

export const FACTS: Fact[] = [
  {
    id: "who",
    title: "Who he is",
    text: "John Boy Roxas is a GoHighLevel systems builder and AI automation developer based in Tarlac, Philippines (Philippine time, UTC+8). He works remotely with businesses in the US and Australia and is currently open for new builds and part-time roles.",
  },
  {
    id: "ghl",
    title: "GoHighLevel depth",
    text: "Five years inside GoHighLevel and 58 client systems built: workflows, pipelines, snapshots, sub-accounts, funnels, calendars and forms. For the automation engine he also uses n8n, Zapier and Make.",
  },
  {
    id: "beyond",
    title: "The part that leaves GoHighLevel",
    text: "Where GoHighLevel stops, he keeps building: webhooks, the GoHighLevel v2 API, Stripe, A2P 10DLC registration, Firebase, the Claude API, and full Next.js applications, all wired back into the CRM by webhook so the business keeps one system.",
  },
  {
    id: "experience",
    title: "Work history",
    text: "Roles from his CV, newest first: GoHighLevel Systems Builder for Chaos to Closing (US, March 2026 to now), building the client's business inside GoHighLevel from scratch with social lead capture and ManyChat nurture. Lead Flow and Funnel Operations for Wrldinvsn (December 2025 to February 2026): lead tracking from first click to close, landing and VSL pages, and a booking system. Lead GHL Automation Architect at K Australia Design (Australia, September 2024 to October 2025): agency infrastructure, multi-channel nurture and A2P 10DLC registration. Freelance CRM and Automation Consultant since January 2024: 13+ GoHighLevel systems for med spas, real estate teams, coaches and chiropractors, including migrations and snapshots. Senior Design and Systems Strategist at Masterpiece Las Vegas (US, February 2021 to June 2023). Education: Bachelor's degree in Computer Science, 2013 to 2018. The full CV is at johnboydesign.com/Johnboy-Roxas-CV.pdf.",
  },
  {
    id: "hiring",
    title: "Availability for roles",
    text: "He is open to remote part-time roles, contracts and fixed-scope builds, with flexible hours that overlap Australian business hours. He works in Slack and ClickUp and writes documentation with every build. For a role, email uix.johnboy@gmail.com; his LinkedIn is linkedin.com/in/john-boy-roxas-gohighlevel-specialist.",
  },
  {
    id: "certs",
    title: "HighLevel certifications",
    text: "Certified by HighLevel as Workflow Automation Expert, Funnel Building Expert, AI Employee Specialist, and Course & Community Expert.",
  },
  {
    id: "work",
    title: "Selected work",
    text: "His portfolio shows nine shipped builds: funnels, client websites and sales pages for coaches, clinics and local businesses in the US and Australia, built inside GoHighLevel and in code. They are on the homepage at johnboydesign.com.",
  },
  {
    id: "coachos",
    title: "Coach OS, the flagship",
    text: "Coach OS is a complete client-management platform for one-to-one coaches that he designed and built from zero, wired into GoHighLevel in both directions. It runs live on a labelled sample practice (the Harper Quinn demo). Counted from the repository: 30,275 lines of code, 26 pages, 36 API endpoints, 10 scheduled background jobs, 84 automated email templates, and 26 GoHighLevel webhook events sent from the app. Case study: johnboydesign.com/coach-os. Live tour: coachos.johnboydesign.com/tour.",
  },
  {
    id: "coachos-parts",
    title: "What is inside Coach OS",
    text: "Four lead-generation tools (a scored diagnostic quiz, a 3-day challenge with its own email drip, an AI-personalised 90-day plan, and an AI front desk that qualifies leads and tags the CRM while it talks); a passwordless client portal with an AI companion that answers from the client's own history, check-ins, weekly booking, a course area and e-signed agreements downloadable as PDF; and an owner dashboard with a unified pipeline, a per-client health score, revenue by source and a Client 360 view.",
  },
  {
    id: "idempotent",
    title: "Payments that never double-charge",
    text: "Payment providers like Stripe retry webhooks. If the handler is not idempotent, a network hiccup becomes a second charge or a duplicate email. In his builds every write path is idempotent: running it twice gives the same result as running it once. The hero of this site shows it live: five deliveries of one payment, one payment recorded.",
  },
  {
    id: "billing",
    title: "Stripe billing",
    text: "Stripe checkout for one-time packages and recurring subscriptions, with the full lifecycle handled (payment succeeded, payment failed, cancellation, each with its own recovery path), webhook signature verification so nobody can spoof a payment, and access windows that open on payment and close on expiry, enforced at the data layer.",
  },
  {
    id: "contracts",
    title: "Contracts that cannot be overwritten",
    text: "Signed agreements are write-once, enforced in the database security rules rather than by trusting the app, and each signature stores a snapshot of the exact clause text shown at signing, so what the client agreed to can always be proven.",
  },
  {
    id: "fallbacks",
    title: "AI with a fallback",
    text: "Every AI call he ships has a fallback: if the AI provider is down, the visitor sees a working page, never an error.",
  },
  {
    id: "walls",
    title: "Walls GoHighLevel builds hit, and the real causes",
    text: "Client charged twice: the Stripe webhook was retried and the handler was not idempotent. Dashboard says 40 leads but the CRM says 27: pipelines count opportunities, not contacts. Launch slipped two weeks: A2P 10DLC was submitted on day nine instead of day one. Sold something no longer in stock: inventory was tracked per price, not per product. Naming the real cause is how he fixes these.",
  },
  {
    id: "offer",
    title: "How to work with him",
    text: "Before hiring anyone, send him one automation that is not firing or one funnel that is not converting, and he will tell you exactly what is wrong with it, free. Email: uix.johnboy@gmail.com. Book a call: johnboydesign.com/book. He quotes each project after seeing the scope, so there is no price list.",
  },
  {
    id: "twin",
    title: "About this AI",
    text: "This chat is John Boy's AI twin, built by him. It runs on Claude by Anthropic and answers only from a fixed sheet of verified facts about his work. The voice in the intro is an ElevenLabs voice, not his, and the robot half of the portrait is an AI edit. It cannot book meetings or see his calendar yet. The visitor's name, email and questions are kept so John Boy can follow up; the AI's answers are not stored.",
  },
  {
    id: "nda",
    title: "Confidential work",
    text: "Some of his client work is under NDA. The AI never names those clients or describes those builds.",
  },
];

export const FACT_IDS = new Set(FACTS.map((f) => f.id));

export function factTitle(id: string) {
  return FACTS.find((f) => f.id === id)?.title ?? id;
}
