import type { Metadata } from "next";
import Image from "next/image";
import { archivo, jetmono, serif } from "./fonts";
import V3Motion from "@/components/v3/V3Motion";
import PortraitDissolve from "@/components/v3/PortraitDissolve";
import TwinVoice from "@/components/v3/TwinVoice";
import LiveSystem from "@/components/v3/LiveSystem";
import TwinChat from "@/components/v3/TwinChat";
import ProofLab from "@/components/v3/ProofLab";
import Preloader from "@/components/v3/Preloader";
import Cursor from "@/components/v3/Cursor";
import LocalTime from "@/components/v3/LocalTime";
import "./v3.css";

// The homepage (johnboydesign.com). Built as "v3" beside the old neon
// one-pager and promoted to `/` on 2026-10-07, when John Boy started using it
// for job applications; /v3 redirects here. The old page is in git history.
//
// Two readers, one page: a business owner deciding whether to hire him for a
// build, and a recruiter or agency checking him for a role. The hero, the
// wall, the proof lab and the work serve both; the experience section and the
// contact row exist for the second (dates, roles, hours, CV, LinkedIn).
//
// Rules this page keeps:
// - Every artifact on screen is a real pattern from his own work, written
//   generically. No NDA projects, no invented results, no testimonials (the
//   old ones were never re-verified with the clients).
// - The experience list matches the CV PDF. The current Australian
//   consultancy is described, not named, on this page.
// - Content is fully visible with JavaScript off or reduced motion on;
//   V3Motion only adds movement on top of a finished static page.

export const metadata: Metadata = {
  alternates: { canonical: "https://www.johnboydesign.com" },
};

const EMAIL = "uix.johnboy@gmail.com";

const MAIL =
  `mailto:${EMAIL}?subject=` +
  encodeURIComponent("One broken workflow") +
  "&body=" +
  encodeURIComponent("Hi John Boy, here is the workflow that is not doing what it should:\n\n");

const HIRE_MAIL =
  `mailto:${EMAIL}?subject=` +
  encodeURIComponent("A role for you") +
  "&body=" +
  encodeURIComponent("Hi John Boy, I found you through your portfolio.\n\n");

const WHATSAPP =
  "https://wa.me/639773659548?text=" + encodeURIComponent("Hi John Boy, I found you through your portfolio.");
const LINKEDIN = "https://www.linkedin.com/in/john-boy-roxas-gohighlevel-specialist";
const OLJ = "https://www.onlinejobs.ph/jobseekers/info/4412723";
const CV = "/Johnboy-Roxas-CV.pdf";

// Same entries, dates and roles as the CV, newest first.
const experience = [
  {
    when: "Apr 2026 - now",
    where: "Australia",
    who: "Business consultancy",
    role: "GoHighLevel Specialist, Automation",
    did: "Builds and maintains the firm's GoHighLevel workflow automation, extended with n8n, Zapier and Claude.",
  },
  {
    when: "Mar 2026 - now",
    where: "United States",
    who: "Chaos to Closing",
    role: "GoHighLevel Systems Builder",
    did: "Built the client's whole business inside GoHighLevel from scratch: social lead capture and ManyChat nurture.",
  },
  {
    when: "Dec 2025 - Feb 2026",
    where: "Project",
    who: "Wrldinvsn",
    role: "Lead Flow & Funnel Operations",
    did: "Lead tracking from first click to close, landing and VSL pages, and a booking system with reminders and cancellations.",
  },
  {
    when: "Sep 2024 - Oct 2025",
    where: "Australia",
    who: "K Australia Design",
    role: "Lead GHL Automation Architect",
    did: "Agency infrastructure for onboarding new sub-accounts, multi-channel nurture, and A2P 10DLC registration.",
  },
  {
    when: "Jan 2024 - now",
    where: "US, AU, UK",
    who: "Freelance",
    role: "CRM & Automation Consultant",
    did: "13+ GoHighLevel systems for med spas, real estate teams, coaches and chiropractors, including full migrations and snapshots.",
  },
  {
    when: "Feb 2021 - Jun 2023",
    where: "United States",
    who: "Masterpiece Las Vegas",
    role: "Senior Design & Systems Strategist",
    did: "Conversion-focused UI and funnels, with lead-capture forms connected to automated CRM workflows.",
  },
];

// The practical answers a hiring manager looks for before a first call.
const workingFacts = [
  { k: "Based in", v: "Tarlac, Philippines (UTC+8)" },
  { k: "Hours", v: "Flexible, overlapping Australian business hours" },
  { k: "Engagement", v: "Remote: part-time role, contract or fixed-scope build" },
  { k: "Tools", v: "Slack, ClickUp, GitHub, written docs with every build" },
  { k: "Education", v: "BS Computer Science, 2013 - 2018" },
];

const stats = [
  { v: "58", l: "client systems" },
  { v: "5", l: "years in GHL" },
  { v: "30,275", l: "lines in the flagship" },
  { v: "26", l: "GHL events wired" },
];

// The walls. Buyer's words on top, the real mechanism underneath in mono,
// because naming the cause is what separates a builder from a button-pusher.
const walls = [
  {
    say: "Your client got charged twice.",
    trace: "stripe retried the webhook. the handler was not idempotent.",
  },
  {
    say: "Your dashboard says 40 leads. Your CRM says 27.",
    trace: "pipelines count opportunities, not contacts.",
  },
  {
    say: "The launch slipped two weeks.",
    trace: "A2P 10DLC was submitted on day nine instead of day one.",
  },
  {
    say: "You sold something you no longer had.",
    trace: "inventory was tracked per price, not per product.",
  },
];

// The builds already public on johnboydesign.com, same names and labels.
// Tall full-page captures: the frame pans down them on hover.
const works = [
  { img: "/work/chaos-to-closing.jpg", name: "Chaos to Closing", kind: "Coaching business site", tags: ["GoHighLevel", "Site", "US"] },
  { img: "/work/chaos-ai-funnel.jpg", name: "Chaos to Closing", kind: "AI funnel", tags: ["GoHighLevel", "Funnel", "AI"] },
  { img: "/work/chaos-sales-page.jpg", name: "Chaos to Closing", kind: "Sales page", tags: ["GoHighLevel", "Funnel"] },
  { img: "/work/mindset-coaching.jpg", name: "Mindset Coaching", kind: "Coaching funnel", tags: ["GoHighLevel", "Funnel"] },
  { img: "/work/melbourne-chiropractic.jpg", name: "Melbourne Chiropractic", kind: "Clinic site", tags: ["Site", "AU"] },
  { img: "/work/dental-clinic.jpg", name: "Dental Clinic", kind: "Clinic site", tags: ["Site"] },
  { img: "/work/words-like-alice.jpg", name: "Words Like Alice", kind: "Author site", tags: ["Site"] },
  { img: "/work/digital-products.jpg", name: "Digital Products", kind: "Storefront funnel", tags: ["GoHighLevel", "Funnel"] },
  { img: "/work/landscaping.jpg", name: "Landscaping", kind: "Local service site", tags: ["Site"] },
];

// Coach OS, counted from the repository (recounted 2026-09-29).
const coachStats = [
  { v: "30,275", l: "lines of code" },
  { v: "36", l: "API endpoints" },
  { v: "10", l: "scheduled jobs" },
  { v: "84", l: "email templates" },
  { v: "26", l: "GHL events sent" },
  { v: "26", l: "pages" },
];

const coachShots = [
  { img: "/coach-os-shots/app-portal.jpg", cap: "Client portal with an AI companion that answers from the client's own history" },
  { img: "/coach-os-shots/app-dash-kanban.jpg", cap: "One pipeline for every lead from every tool" },
  { img: "/coach-os-shots/app-diagnostic.jpg", cap: "A scored diagnostic quiz that writes into the CRM and books the call" },
];

const badges = [
  { img: "/badge-workflow-automation-expert.png", name: "Workflow Automation Expert" },
  { img: "/badge-funnel-building-expert.png", name: "Funnel Building Expert" },
  { img: "/badge-ai-employee-specialist.png", name: "AI Employee Specialist" },
  { img: "/badge-course-community-expert.png", name: "Course & Community Expert" },
];

const skills = [
  "GoHighLevel",
  "Webhooks",
  "v2 API",
  "Stripe",
  "A2P 10DLC",
  "Next.js",
  "Firebase",
  "Claude API",
  "n8n",
  "Zapier",
  "Make",
];

export default function V3() {
  return (
    <div
      id="v3-root"
      data-motion="pending"
      suppressHydrationWarning
      className={`v3 ${archivo.variable} ${jetmono.variable} ${serif.variable}`}
    >
      {/* Failsafe: if the motion script never mounts, show everything. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "setTimeout(function(){var r=document.getElementById('v3-root');if(r&&r.getAttribute('data-motion')==='pending')r.setAttribute('data-motion','off')},2500)",
        }}
      />
      <Preloader />
      <V3Motion />
      <Cursor />
      <div className="v3-grain" aria-hidden="true" />
      <div className="v3-hud" aria-hidden="true">
        <span className="v3-hud-n">01</span>
        <span className="v3-hud-bar">
          <i />
        </span>
        <span className="v3-hud-t">Intro</span>
      </div>

      <header className="v3-nav" data-v3="nav">
        <a className="v3-mark" href="#top">
          John Boy Roxas
        </a>
        {/* True while he is taking on work; change when he is full. */}
        <span className="v3-avail">
          <i className="v3-dot v3-dot-live" /> Available, flexible hours
        </span>
        <nav className="v3-links" aria-label="Sections">
          <a href="#proof">Proof</a>
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href={CV}>CV</a>
          <a className="v3-links-cta" href="#contact">
            Contact
          </a>
        </nav>
      </header>

      <main id="top">
        {/* ---------- HERO: the AI world ---------- */}
        <section className="v3-hero" data-v3="hero" data-hud="01|Intro">
          <div className="v3-glow v3-glow-a" aria-hidden="true" />
          <div className="v3-glow v3-glow-b" aria-hidden="true" />
          <div className="v3-grid" aria-hidden="true" />
          <div className="v3-spot" aria-hidden="true" />

          <div className="v3-name" aria-hidden="true" data-depth="0.15">
            <span>JOHN</span>
            <span>BOY</span>
          </div>

          <div className="v3-stage">
            {/* Amber glow behind the figure, driven by the twin's voice (--vl). */}
            <div className="v3-voiceglow" aria-hidden="true" />
            <div className="v3-portrait" data-depth="0.35">
              <Image
                src="/v3/jb-hero.webp"
                alt="John Boy Roxas"
                width={2000}
                height={2000}
                preload
                quality={90}
                sizes="(max-width: 760px) 92vw, 640px"
              />
              <PortraitDissolve />
              {/* The AI half. Hidden until the twin speaks (TwinVoice sets
                  data-twin on the stage), then it glitches in over the right
                  side of the face. Pre-masked, so only the cyborg half has
                  pixels; framing matches jb-hero.webp. */}
              {/* A plain img on purpose: 33KB, pre-sized, invisible on load,
                  and it must match the portrait's box exactly. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="v3-cyborg" src="/v3/jb-cyborg.webp" alt="" aria-hidden="true" decoding="async" />
              <span className="v3-cyborg-eye" aria-hidden="true" />
              {/* Sweeps the face while the twin diagnoses a question (TwinChat). */}
              <span className="v3-scan" aria-hidden="true" />
            </div>

            {/* Data packets between the cards: the idempotency story, live. */}
            <LiveSystem />

            {/* Floating artifacts. Each is a real pattern from his builds.
                data-live marks what LiveSystem animates; the markup holds the
                end state (5 deliveries, 1 payment, Won) for no-JS. */}
            <div className="v3-art v3-art-payload" data-depth="0.9" data-float="0">
              <div className="v3-art-head">
                <i className="v3-dot" /> POST /webhooks/stripe
              </div>
              <dl>
                <dt>event</dt>
                <dd>invoice.paid</dd>
                <dt>id</dt>
                <dd>in_1Q8fK2</dd>
                <dt>attempt</dt>
                <dd>
                  #<b data-live="attempt">5</b>
                </dd>
              </dl>
              <div className="v3-art-foot" data-live="verdict">
                duplicate, ignored
              </div>
            </div>

            <div className="v3-art v3-art-count" data-depth="1.2" data-float="1">
              <b data-live="events">5</b> <i data-live="evword">events</i> in <span>/</span>{" "}
              <b className="v3-neon" data-live="paid">
                1
              </b>{" "}
              payment recorded
            </div>

            <div className="v3-art v3-art-pipe" data-depth="0.7" data-float="2">
              <div className="v3-art-head">pipeline</div>
              <ol>
                <li className="on">New lead</li>
                <li className="on">Contacted</li>
                <li className="on">Booked</li>
                <li className="on" data-live="won">
                  Won
                </li>
              </ol>
            </div>

            <div className="v3-art v3-art-api" data-depth="1.05" data-float="3">
              GHL v2 <span>/</span> contact.create <span>/</span> <b className="v3-neon">201</b> <span>/</span>{" "}
              <b className="v3-ms" data-live="ms">
                182ms
              </b>
            </div>

            <div className="v3-art v3-art-cron" data-depth="0.55" data-float="4">
              <span>02:00 UTC</span> checkin-reminder <b className="v3-neon">ok</b> 12 sent
            </div>

            <div className="v3-art v3-art-twin" data-depth="0.8" data-float="5">
              <div className="v3-art-head">
                <i className="v3-dot v3-dot-live" /> AI twin
              </div>
              <dl>
                <dt>model</dt>
                <dd>Claude</dd>
                <dt>answers</dt>
                <dd>verified facts</dd>
                <dt>voice</dt>
                <dd>ElevenLabs</dd>
                <dt>fallback</dt>
                <dd>armed</dd>
              </dl>
              <div className="v3-art-foot">voice and chat live</div>
            </div>

            <TwinVoice />
          </div>

          {/* Wide screens: the twin stands in the centre, the headline on its
              left and the details on its right (JB, 2026-10-03). Narrower
              screens stack them under the portrait. */}
          <div className="v3-copy v3-copy-l">
            <p className="v3-eyebrow" data-v3="line">
              GoHighLevel architect <span>/</span> AI automation <span>/</span> Philippines
            </p>
            <h1 className="v3-h1" data-split="intro">
              <span className="v3-line">
                GoHighLevel specialist.
              </span>
              <span className="v3-line">
                And the part that <em>leaves</em> GoHighLevel.
              </span>
            </h1>
          </div>

          <div className="v3-copy v3-copy-r">
            <p className="v3-sub" data-v3="line">
              Five years and 58 client systems inside GHL: workflows, pipelines, snapshots and sub-accounts. Then
              the part most people hand to a developer. Webhooks, the v2 API, Stripe, A2P and full Next.js apps,
              wired back into the CRM.
            </p>
            <div className="v3-ctas" data-v3="line">
              <a className="v3-btn v3-btn-primary" href={MAIL}>
                Send me one broken workflow
              </a>
              <a className="v3-btn v3-btn-ghost" href="#wall">
                See what breaks
              </a>
            </div>
            <ul className="v3-stats" data-v3="line">
              {stats.map((s) => (
                <li key={s.l}>
                  <b>{s.v}</b>
                  {s.l}
                </li>
              ))}
            </ul>
          </div>

          {/* "Talk to my AI" opens this; on wide screens it takes the copy column. */}
          <TwinChat />

          <div className="v3-scrollcue" aria-hidden="true">
            scroll
          </div>
        </section>

        {/* ---------- THE WALL: pinned scroll story ---------- */}
        <section className="v3-band" aria-label="Tools he wires together">
          {[0, 1].map((row) => (
            <div key={row} className="v3-band-row" data-row={row} aria-hidden={row === 1}>
              <div className="v3-band-track">
                {[...skills, ...skills].map((k, i) => (
                  <span key={i} className="v3-band-item">
                    {k}
                    <i className="v3-band-dot" />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="v3-wall" id="wall" data-v3="wall" data-hud="02|The wall">
          <div className="v3-wall-in">
            <p className="v3-eyebrow">Every GoHighLevel build hits a wall</p>
            <ol className="v3-walls">
              {walls.map((w, i) => (
                <li className="v3-wallrow" key={w.say} data-v3="wallrow">
                  <span className="v3-wallnum">0{i + 1}</span>
                  <span className="v3-wallsay">{w.say}</span>
                  <code className="v3-walltrace">
                    <span className="v3-caret">&gt;</span> {w.trace}
                  </code>
                </li>
              ))}
            </ol>
            <p className="v3-wallclose" data-v3="wallclose">
              Most builders stop at the wall. <em>I build past it.</em>
            </p>
          </div>
        </section>

        {/* ---------- PROOF LAB: break the walls yourself ---------- */}
        <section className="v3-section v3-proof" id="proof" data-hud="03|Proof lab">
          <div className="v3-section-in">
            <p className="v3-eyebrow" data-v3="reveal">
              Proof lab <span>/</span> try it yourself
            </p>
            <h2 className="v3-h2" data-split="scroll">
              Don&apos;t take my word for it. <em>Break it.</em>
            </h2>
            <p className="v3-section-sub" data-v3="reveal">
              The four walls above, as small simulations. Press the buttons and watch the difference between a build
              that looks done and one that survives a bad day.
            </p>
            <div data-v3="reveal">
              <ProofLab />
            </div>
          </div>
        </section>

        {/* ---------- WORK ---------- */}
        <section className="v3-section v3-work" id="work" data-hud="04|Work">
          <div className="v3-section-in">
            <p className="v3-eyebrow" data-v3="reveal">
              Work <span>/</span> shipped, running
            </p>
            <h2 className="v3-h2" data-split="scroll">
              The flagship, then the <em>funnels.</em>
            </h2>

            <article className="v3-coach" data-v3="reveal">
              <div className="v3-coach-copy">
                <p className="v3-coach-kicker">
                  <i className="v3-dot v3-dot-live" /> Coach OS <span>/</span> live on sample data
                </p>
                <h3 className="v3-h3">A client-management platform, built from zero, wired into GoHighLevel both ways.</h3>
                <p className="v3-coach-text">
                  Four lead tools, a passwordless client portal with an AI companion, e-signed agreements, Stripe
                  subscriptions and an owner dashboard with a health score per client. Not a template or a snapshot: a
                  running product you can click through before you read another word.
                </p>
                <ul className="v3-coach-stats">
                  {coachStats.map((c) => (
                    <li key={c.l}>
                      <b>{c.v}</b>
                      {c.l}
                    </li>
                  ))}
                </ul>
                <div className="v3-ctas">
                  <a className="v3-btn v3-btn-primary" href="https://coachos.johnboydesign.com/tour" data-cursor="Open">
                    Open the live tour
                  </a>
                  <a className="v3-btn v3-btn-ghost" href="/coach-os">
                    Read the case study
                  </a>
                </div>
              </div>
              <div className="v3-coach-shots">
                {coachShots.map((c, i) => (
                  <figure key={c.img} className="v3-coach-shot" data-i={i} data-clip>
                    <Image src={c.img} alt={c.cap} width={1440} height={760} sizes="(max-width: 760px) 92vw, 560px" />
                    <figcaption>{c.cap}</figcaption>
                  </figure>
                ))}
              </div>
            </article>

            <div className="v3-hwrap">
            <ul className="v3-works">
              {works.map((w) => (
                <li key={w.img} className="v3-workcard" data-cursor="Look">
                  <div className="v3-workframe">
                    <Image src={w.img} alt={`${w.name}, ${w.kind}`} width={900} height={2000} sizes="(max-width: 760px) 92vw, 380px" />
                  </div>
                  <div className="v3-workcap">
                    <b>{w.name}</b>
                    <span>{w.kind}</span>
                  </div>
                  <p className="v3-worktags">
                    {w.tags.map((t) => (
                      <i key={t}>{t}</i>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </section>

        {/* ---------- EXPERIENCE: what a recruiter checks ---------- */}
        <section className="v3-section v3-exp" id="experience" data-hud="05|Experience">
          <div className="v3-section-in">
            <p className="v3-eyebrow" data-v3="reveal">
              Experience <span>/</span> five years, remote
            </p>
            <h2 className="v3-h2" data-split="scroll">
              Where the 58 systems <em>came from.</em>
            </h2>
            <div className="v3-exp-grid">
              <ol className="v3-exp-list" data-v3="reveal">
                {experience.map((e) => (
                  <li key={e.who + e.when} className="v3-exp-row">
                    <p className="v3-exp-when">
                      {e.when}
                      <span>{e.where}</span>
                    </p>
                    <div className="v3-exp-main">
                      <p className="v3-exp-role">
                        {e.role} <span>/</span> <b>{e.who}</b>
                      </p>
                      <p className="v3-exp-did">{e.did}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <aside className="v3-exp-card" data-v3="reveal">
                <p className="v3-exp-card-h">
                  <i className="v3-dot v3-dot-live" /> Working with me
                </p>
                <dl>
                  {workingFacts.map((f) => (
                    <div key={f.k}>
                      <dt>{f.k}</dt>
                      <dd>{f.v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="v3-exp-card-ctas">
                  <a className="v3-btn v3-btn-primary" href={CV} data-cursor="Open">
                    Download the CV
                  </a>
                  <a className="v3-btn v3-btn-ghost" href={LINKEDIN} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ---------- CERTIFIED ---------- */}
        <section className="v3-section v3-certs" data-hud="06|Certified">
          <div className="v3-section-in">
            <p className="v3-eyebrow" data-v3="reveal">
              Certified by HighLevel
            </p>
            <ul className="v3-badges" data-v3="reveal">
              {badges.map((b) => (
                <li key={b.name}>
                  <Image src={b.img} alt="" width={160} height={160} />
                  <span>{b.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- THE OFFER ---------- */}
        <section className="v3-section v3-offer" id="contact" data-hud="07|Contact">
          <div className="v3-section-in">
            <h2 className="v3-offer-h" data-split="scrub">
              Send me one <em>broken</em> workflow.
            </h2>
            <p className="v3-offer-text" data-v3="reveal">
              Before you hire anyone, me included: send one automation that is not firing or one funnel that is not
              converting. I will tell you exactly what is wrong with it, free. That is a better interview than any
              resume.
            </p>
            <div className="v3-ctas v3-offer-ctas" data-v3="reveal">
              <a className="v3-btn v3-btn-primary" href={MAIL}>
                Email the workflow
              </a>
              <a className="v3-btn v3-btn-ghost" href="/book">
                Book a call
              </a>
            </div>
            <div className="v3-hire" data-v3="reveal">
              <p className="v3-hire-h">Hiring for a role instead?</p>
              <p className="v3-hire-text">
                Part-time, contract or a full build: email is the fastest way to reach me, and the CV has the detail.
              </p>
              <a className="v3-hire-mail" href={HIRE_MAIL}>
                {EMAIL}
              </a>
            </div>
            <p className="v3-offer-links" data-v3="reveal">
              <a href={CV}>CV (PDF)</a>
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              <a href={OLJ} target="_blank" rel="noopener noreferrer">
                OnlineJobs.ph
              </a>
              <a href="/coach-os">Coach OS case study</a>
            </p>
          </div>
        </section>

        <footer className="v3-foot">
          <span>&copy; 2026 John Boy Roxas &middot; Tarlac, Philippines</span>
          <LocalTime />
          <span>Built by hand, AI twin included.</span>
        </footer>
      </main>
    </div>
  );
}
