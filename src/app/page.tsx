import type { Metadata } from "next";
import Image from "next/image";
import { anton, host, plex } from "./fonts";
import Reveal from "@/components/v4/Reveal";
import IntroVideo from "@/components/v4/IntroVideo";
import "./v4/v4.css";

// White poster look since 2026-11-05, on JB's reference (xgensgrowth.com): its layout ideas, with his own words and proof.
// Copy rule from JB, same day: short, straight to the point, confident. One line where a paragraph used to be.
// The homepage since 2026-11-04 (head to head: 74.0 against 68.0 for the resume page at /v5, which stays as the CV
// link). Built as "v4" on 2026-10-31 from two research passes
// (C:\CoachOS-ClientHunt\job-hunt\PORTFOLIO-REBUILD-STRATEGY.md): AU/UK
// agency owners and business owners want, in 30 seconds, who he helps, real
// proof, a real face, a rate, hours and an easy next step. Australian spelling.
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
const DEMO = "/demo/tapline?tour=manager";

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
  "Contact created, 9 answers saved",
  "Branch on lead source",
  "Personal result email or 48-email nurture",
  "Booking confirmed, two reminders",
  "Off marketing the moment they book",
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
  "Sub-accounts and snapshots",
  "Workflows that do not double-send",
  "Funnels, forms and surveys",
  "Calendars, reminders and no-show follow-up",
  "Pipelines and reporting",
  "Email nurture and list migrations",
  "SMS and A2P 10DLC registration",
  "Webhooks, the GHL API, Stripe, Zapier, Make, n8n",
  "Client portals and dashboards",
  "AI assistants that answer only from facts you approve",
];

const steps = [
  { t: "Call", d: "15 minutes. You show me. I tell you if I can help." },
  { t: "Access", d: "My own login. Only what the job needs." },
  { t: "Plan", d: "Scope and price in writing." },
  { t: "Build", d: "Built in draft. Tested with test contacts." },
  { t: "Handover", d: "Written notes and a walkthrough." },
];

const faqs = [
  { q: "What hours do you work?", a: "Part-time, 4 hours a day, from 8 AM your time. I am in the Philippines (UTC+8)." },
  { q: "How do invoices work?", a: "Fortnightly, in AUD or GBP, by bank transfer through Wise. No GST or VAT added." },
  { q: "Will you sign an NDA?", a: "Yes. I already work under one." },
  { q: "Can you give me references?", a: "Not yet. Try my live builds instead, or send me one broken workflow and I will check it, free." },
  { q: "Can I start with one small job?", a: "Yes. Normal rate, no retainer." },
  { q: "What if you are sick or we stop working together?", a: "Everything lives in your account, with written notes. Anyone can pick it up. All access goes back to you." },
  { q: "What if something you built breaks?", a: "I fix my own work first, then tell you what happened." },
  { q: "Do you only work in GoHighLevel?", a: "Mostly. Past that, I connect it with webhooks, Zapier, Make or n8n, or build a custom app." },
];

export default function V4() {
  return (
    <div id="v4-root" className={`v4 ${anton.variable} ${host.variable} ${plex.variable}`}>
      <Reveal />

      <p className="v4-bar">
        Available now. Part-time, contract or project. <a href="#rates">See my rates</a>
      </p>
      <header className="v4-nav">
        <div className="v4-nav-in">
          <a className="v4-mark" href="#top">
            <b>John Boy Roxas</b>
            <span>GoHighLevel specialist</span>
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
        </div>
      </header>

      <main id="top">
        {/* ---------- HERO ---------- */}
        <section className="v4-hero">
          <div className="v4-hero-in">
            <div className="v4-hero-copy" data-rv>
              <p className="v4-kicker">GoHighLevel specialist · HighLevel certified</p>
              <h1>GoHighLevel, built right.</h1>
              <div className="v4-ctas">
                <a className="v4-btn v4-btn-dark" href={DEMO}>
                  Try a live build
                </a>
                <a className="v4-btn v4-btn-line" href={BOOK}>
                  Book a 15-min call
                </a>
              </div>
              <p className="v4-hero-free">
                <a href={FIX_MAIL}>Send me one broken workflow. I&apos;ll tell you what&apos;s wrong, free.</a>
              </p>
            </div>
            <div className="v4-hero-media" data-rv>
              <IntroVideo />
            </div>
          </div>
        </section>

        {/* ---------- WHAT I DO, IN NUMBERS ---------- */}
        <section className="v4-statement">
          <div className="v4-in">
            <h2 data-rv>I build and fix GoHighLevel for agencies and small businesses.</h2>
            <p className="v4-lede" data-rv>
              Past clients in the US and Australia. UK businesses welcome.
            </p>
            <ul className="v4-facts" aria-label="At a glance" data-rv>
              <li>
                <b>5 years</b>
                <span>CRM and automation. GoHighLevel since 2023</span>
              </li>
              <li>
                <b>AUD 15</b>
                <span>From, per hour. About £8</span>
              </li>
              <li>
                <b>4 hours</b>
                <span>A day, from 8 AM your time</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ---------- LIVE BUILDS ---------- */}
        <section className="v4-sec v4-builds" id="builds">
          <div className="v4-in">
            <div className="v4-center">
              <p className="v4-kicker" data-rv>
                Live builds
              </p>
              <h2 data-rv>Open them. Try to break them.</h2>
            </div>
            <article className="v4-case" data-rv>
              <div className="v4-case-copy">
                <p className="v4-case-tag">My own demo · Fictional data</p>
                <h3>Tapline. A repairs desk you can use now.</h3>
                <p>AI triage a person confirms. After-hours dispatch. Owner approvals. A real signed webhook. No sign-up.</p>
                <div className="v4-ctas">
                  <a className="v4-btn v4-btn-dark" href={DEMO}>
                    Take the tour
                  </a>
                  <a className="v4-link" href="/demo/tapline?tour=manager&region=UK">
                    UK version
                  </a>
                  <a className="v4-link" href="/projects/tapline">
                    How it works
                  </a>
                </div>
              </div>
              <div className="v4-shot v4-shot-wide">
                <Image src="/projects/tapline/board.png" alt="Tapline's repairs board, with open jobs moving from new report to bill entered" width={2880} height={1800} sizes="(max-width: 860px) 90vw, 560px" />
              </div>
            </article>

            <article className="v4-case" data-rv>
              <div className="v4-case-copy">
                <p className="v4-case-tag">Coach OS · My own product · Demo data</p>
                <h3>When GoHighLevel is not enough, I build the app.</h3>
                <p>Client portal. AI companion. E-signed agreements. Stripe subscriptions. Connected to GoHighLevel both ways.</p>
                <div className="v4-ctas">
                  <a className="v4-btn v4-btn-dark" href="https://coachos.johnboydesign.com/tour">
                    Open the tour
                  </a>
                  <a className="v4-link" href="/coach-os">
                    Case study
                  </a>
                </div>
              </div>
              <div className="v4-shot v4-shot-wide">
                <Image src="/coach-os-shots/app-dash-kanban.jpg" alt="Coach OS owner pipeline" width={1440} height={760} sizes="(max-width: 860px) 90vw, 560px" />
              </div>
            </article>
          </div>
        </section>

        {/* ---------- PROOF STRIP ---------- */}
        <section className="v4-strip" aria-label="Clients and certifications">
          <p className="v4-strip-h">Worked with</p>
          <div className="v4-marquee">
            <ul className="v4-clients">
              {clients.map((c) => (
                <li key={c.name}>
                  <b>{c.name}</b>
                  <span>{c.note}</span>
                </li>
              ))}
            </ul>
            <ul className="v4-clients" aria-hidden="true">
              {clients.map((c) => (
                <li key={c.name}>
                  <b>{c.name}</b>
                  <span>{c.note}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul className="v4-badges" aria-label="HighLevel certifications">
            {badges.map((b) => (
              <li key={b.name}>
                <Image src={b.img} alt="" width={64} height={64} />
                <span>{b.name}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- TWO DOORS ---------- */}
        <section className="v4-sec" id="who">
          <div className="v4-in">
            <div className="v4-doors">
              <article className="v4-door" data-rv>
                <h3>For agencies</h3>
                <p className="v4-door-lede">Extra hands inside your GoHighLevel. White-label.</p>
                <ul>
                  <li>Sub-accounts from your snapshot</li>
                  <li>Workflow builds and fixes</li>
                  <li>Your tools. Your clients never see me.</li>
                </ul>
                <p className="v4-door-price">From AUD 15/hr.</p>
              </article>
              <article className="v4-door" data-rv>
                <h3>For business owners</h3>
                <p className="v4-door-lede">Every enquiry captured and followed up.</p>
                <ul>
                  <li>Enquiries land in your CRM</li>
                  <li>Online booking with reminders</li>
                  <li>Follow-ups stop when someone books</li>
                </ul>
                <p className="v4-door-price">A fixed quote after a free call.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ---------- WORK ---------- */}
        <section className="v4-sec v4-work" id="work">
          <div className="v4-in">
            <div className="v4-center">
              <p className="v4-kicker" data-rv>
                Past work
              </p>
              <h2 data-rv>What I have built.</h2>
            </div>

            <article className="v4-case" data-rv>
              <div className="v4-case-copy">
                <p className="v4-case-tag">Chaos to Closing · US coaching business · 2026</p>
                <h3>A whole coaching business, inside GoHighLevel.</h3>
                <p>Website, sales page, AI-assisted funnel, social lead capture and nurture. One system.</p>
              </div>
              <div className="v4-shots v4-shots-3">
                {[
                  { img: "/work/chaos-to-closing.jpg", alt: "Chaos to Closing website" },
                  { img: "/work/chaos-sales-page.jpg", alt: "Chaos to Closing sales page" },
                  { img: "/work/chaos-ai-funnel.jpg", alt: "Chaos to Closing AI funnel" },
                ].map((s) => (
                  <div className="v4-shot" key={s.img}>
                    <Image src={s.img} alt={s.alt} width={900} height={2000} sizes="(max-width: 860px) 30vw, 180px" />
                  </div>
                ))}
              </div>
            </article>

            <article className="v4-case" data-rv>
              <div className="v4-case-copy">
                <p className="v4-case-tag">K Australia Design · Australian agency · Sep 2024 to Sep 2025</p>
                <h3>Lead automation for an agency&apos;s client accounts.</h3>
                <p>A tested base, so new accounts never start from scratch.</p>
              </div>
              <ul className="v4-case-points">
                <li>Snapshot-based setup for new sub-accounts</li>
                <li>Nurture across SMS, email and voicemail drop</li>
                <li>A2P 10DLC registration</li>
                <li>Enquiry to booked appointment, automatically</li>
              </ul>
            </article>

            <article className="v4-case" data-rv>
              <div className="v4-case-copy">
                <p className="v4-case-tag">My own sales funnel · GoHighLevel</p>
                <h3>A funnel that knows the prospect before the call.</h3>
                <p>Four connected workflows. Answers on the contact before we speak. Tested end to end.</p>
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

            <h3 className="v4-more-h" data-rv>
              Sample builds
            </h3>
            <p className="v4-more-note" data-rv>My own practice designs, not client work.</p>
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
              <p className="v4-kicker">What I do</p>
              <h2>Inside GoHighLevel, and everything it connects to.</h2>
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
            <div className="v4-center">
              <p className="v4-kicker" data-rv>
                Rates
              </p>
              <h2 data-rv>Simple pricing.</h2>
            </div>
            <div className="v4-plans">
              <article className="v4-plan" data-rv>
                <h3>Hourly</h3>
                <p className="v4-plan-price">
                  AUD 15<small>/hr · about £8</small>
                </p>
                <p>Time tracked. Invoiced fortnightly.</p>
              </article>
              <article className="v4-plan" data-rv>
                <h3>Monthly hours</h3>
                <p className="v4-plan-price">
                  AUD 15<small>/hr · about £8</small>
                </p>
                <p>A reserved block of hours each month.</p>
              </article>
              <article className="v4-plan" data-rv>
                <h3>Fixed project</h3>
                <p className="v4-plan-price">
                  Fixed <small>quote</small>
                </p>
                <p>Quoted after a free 15-minute call.</p>
              </article>
            </div>
            <p className="v4-free v4-center" data-rv>
              Not ready? <a href={FIX_MAIL}>Send me one broken workflow.</a>{" "}I&apos;ll tell you what&apos;s wrong, free.
            </p>
          </div>
        </section>

        {/* ---------- PROCESS ---------- */}
        <section className="v4-sec" id="process">
          <div className="v4-in">
            <div className="v4-center">
              <p className="v4-kicker" data-rv>
                How I work
              </p>
              <h2 data-rv>Five steps. No surprises.</h2>
            </div>
            <ol className="v4-steps">
              {steps.map((s, i) => (
                <li key={s.t} data-rv>
                  <span className="v4-step-n">{String(i + 1).padStart(2, "0")}</span>
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
              <h2>Handled properly.</h2>
            </div>
            <ul>
              <li>My own login, with only the access the job needs</li>
              <li>No shared passwords</li>
              <li>Test contacts only, never your real customers</li>
              <li>NDA or data processing agreement signed first</li>
              <li>All access handed back when the work ends</li>
            </ul>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="v4-sec" id="faq">
          <div className="v4-in v4-faq-in">
            <div data-rv>
              <p className="v4-kicker">Questions</p>
              <h2>Before you hire me.</h2>
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
            <p className="v4-lede">15 minutes. A straight answer. Emails answered within one business day.</p>
            <div className="v4-ctas">
              <a className="v4-btn v4-btn-dark" href={BOOK}>
                Book a 15-min call
              </a>
              <a className="v4-btn v4-btn-line v4-btn-mail" href={MAIL}>
                {EMAIL}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="v4-foot">
        <div className="v4-foot-mark" aria-hidden="true">
          JB
        </div>
        <div className="v4-foot-in">
          <div className="v4-foot-cols">
            <div>
              <a className="v4-mark" href="#top">
                <b>John Boy Roxas</b>
                <span>GoHighLevel specialist</span>
              </a>
              <p>GoHighLevel, built right.</p>
            </div>
            <div>
              <p className="v4-foot-h">Explore</p>
              <ul>
                <li><a href="#builds">Live builds</a></li>
                <li><a href="#work">Past work</a></li>
                <li><a href="#rates">Rates</a></li>
                <li><a href="#process">How I work</a></li>
                <li><a href="#faq">Questions</a></li>
              </ul>
            </div>
            <div>
              <p className="v4-foot-h">Start</p>
              <ul>
                <li><a href={BOOK}>Book a 15-min call</a></li>
                <li><a href={DEMO}>Try the repairs desk</a></li>
                <li><a href={CV}>CV (PDF)</a></li>
              </ul>
            </div>
            <div>
              <p className="v4-foot-h">Contact</p>
              <ul>
                <li><a href={MAIL}>{EMAIL}</a></li>
                <li><a href={WHATSAPP}>WhatsApp</a></li>
                <li><a href={LINKEDIN}>LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="v4-foot-end">
            <span>&copy; 2026 John Boy Roxas · Paniqui, Tarlac, Philippines</span>
            <span>HighLevel certified · For Australian and UK businesses</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
