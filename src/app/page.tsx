import type { Metadata } from "next";
import Image from "next/image";
import { archivo, serif } from "./fonts";
import Reveal from "@/components/v4/Reveal";
import IntroVideo from "@/components/v4/IntroVideo";
import PaperRoll, { paperRollBoot } from "@/components/v4/PaperRoll";
import "./v4/v4.css";

// The homepage since 2026-11-04 (head to head: 74.0 against 68.0 for the resume page at /v5, which stays as the CV
// link). Built as "v4" on 2026-10-31 from two research passes
// (C:\CoachOS-ClientHunt\job-hunt\PORTFOLIO-REBUILD-STRATEGY.md): AU/UK
// agency owners and business owners want, in 30 seconds, who he helps, real
// proof, a real face, a rate, hours and an easy next step. Understated,
// light, factual, Australian spelling. No AI look, no hype, no scare tactics.
//
// Rules: no confidential client is named or described (the NDA client appears
// only as "Confidential client (NDA)", no country or industry); capabilities learned on NDA
// work are listed as skills, never attributed. No invented results, quotes or
// policies. Testimonials render only when real ones exist.

export const metadata: Metadata = {
  title: "John Boy Roxas · GoHighLevel specialist for agencies and small businesses",
  description:
    "HighLevel-certified GoHighLevel specialist in the Philippines. Builds and fixes workflows, funnels, calendars and pipelines for Australian and UK agencies and small businesses. From AUD 15/hr.",
};

const EMAIL = "uix.johnboy@gmail.com";
const MAIL =
  `mailto:${EMAIL}?subject=` +
  encodeURIComponent("Enquiry from your portfolio") +
  "&body=" +
  encodeURIComponent("Hi John Boy,\n\n");
const FIX_MAIL =
  `mailto:${EMAIL}?subject=` +
  encodeURIComponent("One broken workflow") +
  "&body=" +
  encodeURIComponent("Hi John Boy, here is the workflow that is not doing what it should:\n\n");
const WHATSAPP = "https://wa.me/639773659548?text=" + encodeURIComponent("Hi John Boy, I found you through your portfolio.");
const LINKEDIN = "https://www.linkedin.com/in/john-boy-roxas-gohighlevel-specialist";
const CV = "/John-Boy-Roxas-Resume.pdf";
const BOOK = "/book";

const clients = [
  { name: "K Australia Design", note: "Australian agency" },
  { name: "Confidential client (NDA)", note: "Remote" },
  { name: "Chaos to Closing", note: "US coaching business" },
  { name: "Wrldinvsn", note: "Lead flow project" },
  { name: "Masterpiece Las Vegas", note: "US, through Virtualasting" },
  { name: "Virtualasting", note: "Full-time, 2021 to 2024" },
];

const badges = [
  { img: "/badge-workflow-automation-expert.png", name: "Workflow Automation Expert" },
  { img: "/badge-funnel-building-expert.png", name: "Funnel Building Expert" },
  { img: "/badge-ai-employee-specialist.png", name: "AI Employee Specialist" },
  { img: "/badge-course-community-expert.png", name: "Course & Community Expert" },
];

// Real ones only: { quote, name, role, country }. The section is hidden while empty.
const testimonials: { quote: string; name: string; role: string; country: string }[] = [];

const funnelSteps = [
  "Form posts to an Inbound Webhook",
  "Contact created, 9 answers saved to custom fields",
  "Branch on lead source",
  "Personal result email, or a 48-email nurture",
  "Booking confirmed, reminders 24 h and 1 h before",
  "Removed from marketing the moment they book",
];

// His own practice designs, labelled as samples. They are not client work.
const samples = [
  { img: "/work/dental-clinic.jpg", name: "Dental clinic", kind: "Website sample" },
  { img: "/work/mindset-coaching.jpg", name: "Mindset coaching", kind: "Funnel sample" },
  { img: "/work/digital-products.jpg", name: "Digital products", kind: "Storefront sample" },
  { img: "/work/words-like-alice.jpg", name: "Author website", kind: "Website sample" },
  { img: "/work/landscaping.jpg", name: "Landscaping", kind: "Website sample" },
];

const capabilities = [
  "Sub-accounts and snapshots, set up so new clients start from a tested base",
  "Workflows, triggers, waits and branches that do not double-send",
  "Funnels, landing pages, forms and surveys",
  "Booking calendars with confirmations, reminders and no-show follow-up",
  "Pipelines your team can actually read, with clean reporting",
  "Email nurture sequences and list migrations (for example Mailchimp to GHL)",
  "SMS set up properly, including the A2P 10DLC registration US carriers require",
  "Integrations: webhooks, the GHL API, Stripe, Zapier, Make, n8n",
  "Client portals and internal dashboards connected to the tools you already use",
  "AI assistants that answer only from facts you approve",
];

const steps = [
  { t: "15-minute call", d: "You show me what is happening. I tell you honestly whether I can help and how." },
  { t: "Access, done safely", d: "You add me as a user with only the permissions the job needs. No shared passwords." },
  { t: "A clear plan", d: "Hourly or a fixed quote, with the scope in writing before I start." },
  { t: "Build and test", d: "Built in draft, tested with test contacts, with a short Loom update so you see progress." },
  { t: "Handover", d: "A written note and a walkthrough, so your team can run it without me." },
];

const faqs = [
  {
    q: "What hours do you work?",
    a: "I am in the Philippines (UTC+8): the same time as Perth, and two to three hours behind Sydney and Melbourne depending on daylight saving. I work part-time, 4 hours a day, starting at 8 AM in your timezone.",
  },
  {
    q: "How do invoices and payment work?",
    a: "I invoice fortnightly in AUD (or GBP for UK clients) as an overseas contractor, payable by bank transfer through Wise. Australian clients: I do not charge GST, and I can provide a Statement by a Supplier for your records. UK clients: I am not VAT registered, so no VAT is added; VAT-registered businesses account for it under the reverse charge.",
  },
  {
    q: "Will you sign an NDA or a data processing agreement?",
    a: "Yes. I already work under NDA for a current client, and I am happy to sign yours before you share anything.",
  },
  {
    q: "Can you give me references?",
    a: "Not yet. Instead of asking you to take someone's word for it, I show live systems you can use yourself. You can also send me one broken workflow and I will tell you what is wrong with it, free.",
  },
  {
    q: "Can I start with one small job?",
    a: "Yes. Start with one small job at the normal rate, with no retainer, and decide from there.",
  },
  {
    q: "What happens if you are sick or we stop working together?",
    a: "Everything I build lives in your account, with written notes, so your team or another specialist can pick it up. I tell you as early as I can if I will be away, and I hand back all access when the work ends.",
  },
  {
    q: "What if something you built stops working?",
    a: "Tell me and I fix my own work first, then explain exactly what happened and what I changed so it does not repeat.",
  },
  {
    q: "Do you only work in GoHighLevel?",
    a: "Mostly. Where GoHighLevel stops, I connect it to other tools with webhooks, Zapier, Make or n8n, and I can build custom apps that sync back into the CRM.",
  },
];

export default function V4() {
  return (
    <div id="v4-root" className={`v4 ${archivo.variable} ${serif.variable}`}>
      <script dangerouslySetInnerHTML={{ __html: paperRollBoot }} />
      <PaperRoll />
      <Reveal />

      <header className="v4-nav">
        <a className="v4-mark" href="#top">
          John Boy Roxas
        </a>
        <nav className="v4-links" aria-label="Sections">
          <a href="#builds">Builds</a>
          <a href="#work">Work</a>
          <a href="#rates">Rates</a>
          <a href="#process">How I work</a>
          <a href={CV}>CV</a>
        </nav>
        <a className="v4-btn v4-btn-dark v4-nav-cta" href={BOOK}>
          Book a 15-min call
        </a>
      </header>

      <main id="top">
        {/* ---------- HERO ---------- */}
        <section className="v4-hero">
          <div className="v4-hero-copy" data-rv>
            <p className="v4-kicker">GoHighLevel specialist · HighLevel certified</p>
            <h1>GoHighLevel systems you can try right now.</h1>
            <p className="v4-lede">
              I&apos;m John Boy. I build and fix GoHighLevel for agencies and small businesses, so every enquiry gets captured and followed up. Past clients in the US and Australia. UK businesses are welcome too. Don&apos;t take my word for it: open a live build below and use it yourself.
            </p>
            <div className="v4-ctas">
              <a className="v4-btn v4-btn-dark" href="/demo/tapline?tour=manager">
                Try the live repairs desk
              </a>
              <a className="v4-btn v4-btn-line" href={BOOK}>
                Book a 15-min call
              </a>
            </div>
            <p className="v4-hero-free">
              <a href={FIX_MAIL}>Or send me one broken workflow, and I&apos;ll tell you what&apos;s wrong with it, free.</a>
            </p>
          </div>
          <div className="v4-hero-media" data-rv>
            <IntroVideo />
          </div>
        </section>

        {/* ---------- LIVE BUILDS: the first thing after the promise ---------- */}
        <section className="v4-sec v4-builds" id="builds">
          <div className="v4-in">
            <p className="v4-kicker" data-rv>
              Live builds
            </p>
            <h2 data-rv>Open them. Try to break them.</h2>
            <article className="v4-case" data-rv>
              <div className="v4-case-copy">
                <p className="v4-case-tag">My own demo · Fictional data · Try it live</p>
                <h3>Tapline, a repairs desk you can use right now</h3>
                <p>
                  A working repairs desk for property managers and letting agents: tenant reports, AI triage a person confirms, after-hours dispatch, owner approvals and contractors. Nothing to sign up for.
                </p>
                <p>
                  Its Integrations tab is a real signed webhook. Change a request, replay it, or take the receiver down, and watch nothing get lost or applied twice.
                </p>
                <div className="v4-ctas">
                  <a className="v4-btn v4-btn-dark" href="/demo/tapline?tour=manager">
                    Take the guided tour
                  </a>
                  <a className="v4-link" href="/demo/tapline?tour=manager&region=UK">
                    UK version
                  </a>
                  <a className="v4-link" href="/projects/tapline">
                    How it works
                  </a>
                </div>
              </div>
              <div className="v4-shots v4-shots-2">
                <div className="v4-shot v4-shot-wide">
                  <Image src="/projects/tapline/triage.png" alt="Tapline's AI triage panel, with the suggested trade, urgency and reply" width={1024} height={1654} sizes="(max-width: 900px) 90vw, 420px" />
                </div>
                <div className="v4-shot v4-shot-wide">
                  <Image src="/projects/tapline/tenant.png" alt="What the tenant sees on their phone after reporting a repair" width={780} height={1768} sizes="(max-width: 900px) 90vw, 420px" />
                </div>
              </div>
            </article>

            <article className="v4-case v4-case-coach" data-rv>
              <div className="v4-case-copy">
                <p className="v4-case-tag">Coach OS · my own product · runs on demo data</p>
                <h3>When GoHighLevel is not enough, I build the app around it</h3>
                <p>
                  A client platform for one-to-one coaches, built from zero and connected to GoHighLevel both ways: a
                  client portal with an AI companion, e-signed agreements, Stripe subscriptions and an owner dashboard.
                  It runs on a sample practice you can click through.
                </p>
                <div className="v4-ctas">
                  <a className="v4-btn v4-btn-line" href="https://coachos.johnboydesign.com/tour">
                    Open the live tour
                  </a>
                  <a className="v4-link" href="/coach-os">
                    Read the case study
                  </a>
                </div>
              </div>
              <div className="v4-shots v4-shots-2">
                {[
                  { img: "/coach-os-shots/app-portal.jpg", alt: "Coach OS client portal" },
                  { img: "/coach-os-shots/app-dash-kanban.jpg", alt: "Coach OS owner pipeline" },
                ].map((s) => (
                  <div className="v4-shot v4-shot-wide" key={s.img}>
                    <Image src={s.img} alt={s.alt} width={1440} height={760} sizes="(max-width: 900px) 90vw, 420px" />
                  </div>
                ))}
              </div>
            </article>

            <ul className="v4-facts v4-facts-wide" aria-label="At a glance">
              <li>
                <b>Available now</b>
                <span>Part-time, contract or project</span>
              </li>
              <li>
                <b>From AUD 15/hr</b>
                <span>About £8, or a fixed quote</span>
              </li>
              <li>
                <b>4 hours a day</b>
                <span>Starting at 8 AM your time</span>
              </li>
              <li>
                <b>5 years in CRM and automation</b>
                <span>GoHighLevel since 2023, past work in AU and US</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ---------- PROOF STRIP ---------- */}
        <section className="v4-strip" aria-label="Clients and certifications">
          <div className="v4-in">
            <p className="v4-strip-h">Worked with</p>
            <ul className="v4-clients">
              {clients.map((c) => (
                <li key={c.name}>
                  <b>{c.name}</b>
                  <span>{c.note}</span>
                </li>
              ))}
            </ul>
            <ul className="v4-badges" aria-label="HighLevel certifications">
              {badges.map((b) => (
                <li key={b.name}>
                  <Image src={b.img} alt="" width={64} height={64} />
                  <span>{b.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- TWO DOORS ---------- */}
        <section className="v4-sec" id="who">
          <div className="v4-in">
            <p className="v4-kicker" data-rv>
              Who I help
            </p>
            <h2 data-rv>Two kinds of clients, one standard of work.</h2>
            <div className="v4-doors">
              <article className="v4-door" data-rv>
                <h3>For agencies</h3>
                <p className="v4-door-lede">An extra pair of hands inside your GoHighLevel, white-label.</p>
                <ul>
                  <li>Client sub-accounts built from your snapshot and your standards</li>
                  <li>Workflow builds, fixes and clean-ups when your team is full</li>
                  <li>Your tools and your process: Slack, ClickUp, Asana, time tracking</li>
                  <li>Loom updates and handover notes your clients never see me in</li>
                </ul>
                <p className="v4-door-price">From AUD 15/hr, or a monthly block of hours.</p>
              </article>
              <article className="v4-door" data-rv>
                <h3>For business owners</h3>
                <p className="v4-door-lede">Clinics, coaches, trades and real estate: every enquiry captured and followed up.</p>
                <ul>
                  <li>Website and form enquiries that land in your CRM, not an inbox</li>
                  <li>Online booking with confirmations and reminders</li>
                  <li>Follow-up emails that stop the moment someone books</li>
                  <li>A pipeline that shows where every lead is, at a glance</li>
                </ul>
                <p className="v4-door-price">A fixed quote after a free 15-minute call.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ---------- WORK ---------- */}
        <section className="v4-sec v4-work" id="work">
          <div className="v4-in">
            <p className="v4-kicker" data-rv>
              Past work
            </p>
            <h2 data-rv>Client work, and why it was built that way.</h2>

            <article className="v4-case" data-rv>
              <div className="v4-case-copy">
                <p className="v4-case-tag">My own sales funnel · GoHighLevel</p>
                <h3>A lead funnel that knows the prospect before the call</h3>
                <p>
                  <b>The problem.</b> Prospects arrived from messages and forms, their answers sat in another tool, and
                  people who had already booked kept receiving marketing emails.
                </p>
                <p>
                  <b>What I built.</b> Four connected workflows instead of one giant one, so each part can change
                  without breaking the others. Re-entry is switched off so nobody gets the same series twice.
                </p>
                <p>
                  <b>The result.</b>{" "}Every prospect&apos;s answers are on their contact before we speak, and nobody who
                  has booked gets another sales email. Tested end to end with real submissions.
                </p>
              </div>
              <ol className="v4-flow" aria-label="How the workflows connect">
                {funnelSteps.map((s, i) => (
                  <li key={s}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </article>

            <article className="v4-case" data-rv>
              <div className="v4-case-copy">
                <p className="v4-case-tag">Chaos to Closing · US coaching business · 2026</p>
                <h3>A whole coaching business, built inside GoHighLevel</h3>
                <p>
                  <b>The brief.</b> Move the business into one system: website, sales page, an AI-assisted funnel, and
                  lead capture from social media.
                </p>
                <p>
                  <b>What I built.</b> The site and funnels in GoHighLevel, social lead capture with ManyChat, and the
                  nurture sequences behind them.
                </p>
              </div>
              <div className="v4-shots v4-shots-3">
                {[
                  { img: "/work/chaos-to-closing.jpg", alt: "Chaos to Closing website" },
                  { img: "/work/chaos-sales-page.jpg", alt: "Chaos to Closing sales page" },
                  { img: "/work/chaos-ai-funnel.jpg", alt: "Chaos to Closing AI funnel" },
                ].map((s) => (
                  <div className="v4-shot" key={s.img}>
                    <Image src={s.img} alt={s.alt} width={900} height={2000} sizes="(max-width: 900px) 30vw, 220px" />
                  </div>
                ))}
              </div>
            </article>

            <article className="v4-case" data-rv>
              <div className="v4-case-copy">
                <p className="v4-case-tag">K Australia Design · Australian agency · Sep 2024 to Sep 2025</p>
                <h3>Lead GoHighLevel automation for an agency&apos;s client accounts</h3>
                <p>
                  <b>The role.</b>{" "}I built the agency&apos;s GoHighLevel base so new client accounts could be set up
                  from a tested starting point instead of from scratch.
                </p>
                <p>
                  <b>What I built.</b> Multi-channel nurture across SMS, email and voicemail drop, A2P 10DLC
                  registration (the sign-up US carriers require before a business can text customers), and booking triggers that turned enquiries into confirmed
                  appointments.
                </p>
              </div>
              <ul className="v4-case-points">
                <li>Snapshot-based setup for new sub-accounts</li>
                <li>Nurture across three channels</li>
                <li>A2P 10DLC handled for deliverability</li>
                <li>Enquiry to booked appointment, automatically</li>
              </ul>
            </article>

            <h3 className="v4-more-h" data-rv>
              Sample builds
            </h3>
            <p data-rv>My own practice designs, not client work.</p>
            <ul className="v4-more" data-rv>
              {samples.map((w) => (
                <li key={w.img}>
                  <div className="v4-more-frame">
                    <Image src={w.img} alt={`${w.name}, ${w.kind}`} width={900} height={2000} sizes="(max-width: 700px) 45vw, 260px" />
                  </div>
                  <b>{w.name}</b>
                  <span>{w.kind}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- TESTIMONIALS (real ones only) ---------- */}
        {testimonials.length > 0 && (
          <section className="v4-sec">
            <div className="v4-in">
              <p className="v4-kicker" data-rv>
                What clients say
              </p>
              <ul className="v4-quotes">
                {testimonials.map((t) => (
                  <li key={t.name} data-rv>
                    <blockquote>{t.quote}</blockquote>
                    <p>
                      <b>{t.name}</b> · {t.role} · {t.country}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ---------- CAPABILITIES ---------- */}
        <section className="v4-sec v4-cap">
          <div className="v4-in v4-cap-in">
            <div data-rv>
              <p className="v4-kicker">What I can take off your plate</p>
              <h2>Inside GoHighLevel, and where it connects to everything else.</h2>
            </div>
            <ul className="v4-cap-list" data-rv>
              {capabilities.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- RATES ---------- */}
        <section className="v4-sec v4-rates" id="rates">
          <div className="v4-in">
            <p className="v4-kicker" data-rv>
              Rates and ways to work
            </p>
            <h2 data-rv>Simple pricing, agreed before I start.</h2>
            <div className="v4-plans">
              <article className="v4-plan" data-rv>
                <h3>Hourly</h3>
                <p className="v4-plan-price">
                  AUD 15<small>/hr · about £8</small>
                </p>
                <p>For agencies and ongoing support. Time tracked in your tool or mine, invoiced fortnightly.</p>
              </article>
              <article className="v4-plan" data-rv>
                <h3>Monthly hours</h3>
                <p className="v4-plan-price">
                  AUD 15<small>/hr · about £8</small>
                </p>
                <p>A set block of hours each month, so your work has a reserved place in my week.</p>
              </article>
              <article className="v4-plan" data-rv>
                <h3>Fixed-scope project</h3>
                <p className="v4-plan-price">
                  Fixed <small>quote</small>
                </p>
                <p>For a defined build, such as booking and reminders or a migration. Quoted after a free 15-minute call.</p>
              </article>
            </div>
            <p className="v4-free" data-rv>
              Not ready to commit? <a href={FIX_MAIL}>Send me one broken workflow</a> and I will tell you exactly what is
              wrong with it, free.
            </p>
          </div>
        </section>

        {/* ---------- PROCESS ---------- */}
        <section className="v4-sec" id="process">
          <div className="v4-in">
            <p className="v4-kicker" data-rv>
              How I work
            </p>
            <h2 data-rv>Five steps, no surprises.</h2>
            <ol className="v4-steps">
              {steps.map((s, i) => (
                <li key={s.t} data-rv>
                  <span className="v4-step-n">{i + 1}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- DATA ---------- */}
        <section className="v4-sec v4-data">
          <div className="v4-in v4-data-in" data-rv>
            <div>
              <p className="v4-kicker">Your data</p>
              <h2>Handled the way your clients would expect.</h2>
            </div>
            <ul>
              <li>My own login on your platforms, with only the access the job needs</li>
              <li>No shared passwords, and two-factor sign-in where the platform offers it</li>
              <li>Test contacts for testing, never your real customers</li>
              <li>NDA or data processing agreement signed before you share anything</li>
              <li>Access removed and handed back when the work ends</li>
              <li>For clinics: patient health information stays in your practice software, not the CRM, in line with the Australian Privacy Principles</li>
              <li>For UK clients: a UK GDPR data processing agreement on request</li>
            </ul>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="v4-sec" id="faq">
          <div className="v4-in v4-faq-in">
            <div data-rv>
              <p className="v4-kicker">Questions</p>
              <h2>The things people ask before hiring me.</h2>
            </div>
            <div className="v4-faq" data-rv>
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- CONTACT ---------- */}
        <section className="v4-sec v4-contact" id="contact">
          <div className="v4-in" data-rv>
            <h2>Tell me what you need built or fixed.</h2>
            <p className="v4-lede">
              A 15-minute call is the fastest way to find out whether I am the right fit. I reply to every email within
              one business day.
            </p>
            <div className="v4-ctas">
              <a className="v4-btn v4-btn-light" href={BOOK}>
                Book a 15-min call
              </a>
              <a className="v4-btn v4-btn-ghost" href={MAIL}>
                {EMAIL}
              </a>
            </div>
            <p className="v4-contact-links">
              <a href={WHATSAPP}>WhatsApp</a>
              <a href={LINKEDIN}>LinkedIn</a>
              <a href={CV}>CV (PDF)</a>
              <a href="/coach-os">Coach OS case study</a>
            </p>
          </div>
        </section>
      </main>

      <footer className="v4-foot">
        <span>&copy; 2026 John Boy Roxas · Paniqui, Tarlac, Philippines</span>
        <span>HighLevel certified · For Australian and UK businesses</span>
      </footer>
      <div className="pr-end" aria-hidden="true" />
    </div>
  );
}
