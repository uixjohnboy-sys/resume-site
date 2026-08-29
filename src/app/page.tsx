import Link from "next/link";
import VideoIntro from "@/components/home/VideoIntro";
import Fx from "@/components/home/Fx";
import SystemLog from "@/components/home/SystemLog";
import SyncDiagram from "@/components/home/SyncDiagram";
import { archivo, jetmono } from "./fonts";
import "./home.css";

// The portfolio homepage. One long page, read top to bottom by someone
// deciding in thirty seconds whether to hire him. Every number on it is
// counted from a real repository, and the featured build is publicly
// clickable, which is the entire sales argument: look first, then talk.
// Design system lives in home.css (scoped under .jb); metadata lives in
// layout.tsx.

const boardCells = [
  { v: "58", count: "58", suffix: "", l: "Client systems delivered" },
  { v: "5 yrs", count: "5", suffix: " yrs", l: "Building professionally" },
  { v: "29,474", count: "29,474", suffix: "", l: "Lines of code in the flagship build" },
  { v: "24", count: "24", suffix: "", l: "GHL webhook events, both directions" },
  { v: "83", count: "83", suffix: "", l: "Automated email templates live" },
  { v: "4", count: "4", suffix: "", l: "Countries served: US, AU, UK, PH" },
];

const capabilities = [
  {
    k: "01 · The engine",
    t: "GoHighLevel, all of it",
    b: "Sub-accounts, snapshots, SaaS mode, pipelines, workflows, A2P 10DLC, calendars, funnels, memberships. Agency-level infrastructure run for clients in three timezones.",
    tags: ["GoHighLevel", "Snapshots", "SaaS mode", "A2P 10DLC"],
  },
  {
    k: "02 · The edge",
    t: "Custom software beside the CRM",
    b: "When a build hits the wall of what GHL does natively, I build the missing piece as a real web application and wire it back in by webhook. This is the part most GHL contractors cannot do.",
    tags: ["Next.js", "Firebase", "Stripe", "Claude API", "Vercel"],
  },
  {
    k: "03 · The glue",
    t: "Integrations that hold",
    b: "Zapier and Make for speed, n8n for real branching, direct REST and webhooks when no-code runs out of room. Idempotent, signature-verified, and alarmed when something stops firing.",
    tags: ["n8n", "Zapier", "Make", "REST APIs", "Webhooks"],
  },
];

const ledger = [
  {
    when: "2026 · AU",
    who: "Jessica Conner Business Consulting",
    role: "GoHighLevel Specialist · Automation",
    what: "Automation for an Australian consultancy: GHL workflows built out with n8n, Zapier, and Claude.",
  },
  {
    when: "2026 · US",
    who: "Chaos to Closing",
    role: "GoHighLevel Systems Builder",
    what: "The client's entire business built inside GHL from scratch, centred on social lead capture and ManyChat nurture.",
  },
  {
    when: "2025-2026",
    who: "Wrldinvsn",
    role: "Lead Flow & Funnel Operations",
    what: "End-to-end lead tracking from click to close, VSL landing pages, and automated booking with calendar sync and cancellation handling.",
  },
  {
    when: "2024-2025 · AU",
    who: "K Australia Design",
    role: "Lead GHL Automation Architect",
    what: "Agency GHL infrastructure for unlimited client onboarding, multi-channel nurture across SMS, email, and voicemail drop, A2P 10DLC compliance.",
  },
  {
    when: "2021-2023 · US",
    who: "Masterpiece Las Vegas",
    role: "Senior Design & Systems Strategist",
    what: "Conversion-focused UI/UX strategy, lead-capture forms wired into automated CRM workflows, funnel optimisation.",
  },
];

const projects = [
  {
    n: "Coach OS",
    s: "Live · case study",
    live: true,
    b: "A complete client platform for coaching practices: AI companion, e-signature, Stripe billing, courses, and a coach dashboard, wired into GHL in both directions.",
    href: "/coach-os",
  },
  {
    n: "Pathwise",
    s: "Live",
    live: true,
    b: "A canvas tool for planning automations before building them: drag-and-drop flows, hotspots pinned on real page screenshots, client share links.",
    href: null,
  },
];

const stackGroups = [
  { k: "Platform", tags: ["GoHighLevel", "n8n", "Zapier", "Make", "ManyChat"] },
  { k: "Code", tags: ["Next.js", "React", "TypeScript", "Firebase Firestore", "Stripe", "Anthropic Claude API", "Vercel", "Git"] },
  { k: "Design", tags: ["Figma", "Photoshop", "Illustrator", "Premiere Pro", "CapCut"] },
  { k: "Ops", tags: ["Slack", "ClickUp", "Written docs in every handoff"] },
];

const promises = [
  {
    b: "I read the whole job post",
    s: "Including the instruction buried in paragraph four that filters out everyone who skims.",
  },
  {
    b: "Tested before handoff",
    s: "If I say it works, I have run it myself, end to end, including the failure paths.",
  },
  {
    b: "Documented so you own it",
    s: "Written docs with every build, so your team can operate the system without me in the loop.",
  },
  {
    b: "Status without chasing",
    s: "You hear about a slipping timeline early, not on the day it was due. Your hours, your timezone.",
  },
];

function CheckIcon() {
  return (
    <svg className="jb-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className={`jb ${archivo.variable} ${jetmono.variable}`}>
      <Fx />
      {/* top bar */}
      <header className="jb-top">
        <div className="jb-cap jb-top-in">
          <a className="jb-mark" href="#top">
            JB<b>·</b>ROXAS
          </a>
          <span className="jb-status">
            <span className="jb-dot" aria-hidden="true" />
            Available for part-time · PHT
          </span>
        </div>
      </header>

      <main id="top">
        {/* hero */}
        <section className="jb-hero">
          <div className="jb-hero-bg" aria-hidden="true" />
          <div className="jb-cap jb-hero-in">
            <div>
              <span className="jb-avail" data-reveal="0">
                <span className="jb-dot" aria-hidden="true" />
                Open to new builds
              </span>
              <h1 className="jb-h1" data-reveal="90">
                I build the systems <em>GoHighLevel</em>{" "}can{"’"}t build alone.
              </h1>
              <p className="jb-sub" data-reveal="180">
                GoHighLevel for the engine. <b>Custom code for everything past its walls</b>: Next.js, Firebase,
                Stripe, and the Claude API, wired back into the CRM by webhook. 5 years, 58 client builds, and one
                flagship platform you can click through before you ever message me.
              </p>
              <div className="jb-cta-row" data-reveal="260">
                <a className="jb-btn jb-btn-primary" href="/coach-os">
                  See the flagship build
                </a>
                <a className="jb-btn jb-btn-ghost" href="/book">
                  Book a call
                </a>
              </div>

              {/* status board */}
              <div className="jb-board" data-reveal="340">
                <div className="jb-board-head">
                  <span>System status</span>
                  <span>Counted, not estimated</span>
                </div>
                <div className="jb-board-grid">
                  {boardCells.map((c) => (
                    <div className="jb-cell" key={c.l}>
                      <div className="jb-cell-v" data-count={c.count} data-suffix={c.suffix}>
                        {c.v}
                      </div>
                      <div className="jb-cell-l">{c.l}</div>
                    </div>
                  ))}
                </div>
                <SystemLog />
              </div>
            </div>

            <div data-reveal="200">
              <VideoIntro />
            </div>
          </div>
        </section>

        {/* marquee */}
        <div className="jb-marquee" aria-hidden="true">
          <div className="jb-marquee-track">
            {[0, 1].map((i) => (
              <span key={"m" + i} style={{ display: "contents" }}>
                <span>SYSTEMS</span>
                <span className="solid">·</span>
                <span>GOHIGHLEVEL</span>
                <span className="solid">·</span>
                <span>AUTOMATION</span>
                <span className="solid">·</span>
                <span>CUSTOM APPS</span>
                <span className="solid">·</span>
                <span>AI</span>
                <span className="solid">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* capabilities */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/01</i> What I do
            </div>
            <h2 className="jb-h2" data-reveal="60">Three layers, one person.</h2>
            <p className="jb-lede" style={{ marginBottom: "34px" }}>
              Most hires give you one of these. The reason to hire me is the second one.
            </p>
            <div data-reveal="100">
              <SyncDiagram />
            </div>
            <div className="jb-caps" data-reveal="140">
              {capabilities.map((c) => (
                <div className="jb-cap-item" key={c.k}>
                  <div className="jb-cap-k">{c.k}</div>
                  <h3 className="jb-cap-t">{c.t}</h3>
                  <p className="jb-cap-b">{c.b}</p>
                  <div className="jb-tags">
                    {c.tags.map((t) => (
                      <span className="jb-tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* featured build */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/02</i> Flagship build
            </div>
            <div className="jb-feat" data-reveal="60">
              <div className="jb-feat-top">
                <span className="jb-pill">Live now</span>
                <span className="jb-pill jb-pill-ghost">Built from zero</span>
                <span className="jb-pill jb-pill-ghost">Sample data, labelled</span>
              </div>
              <h2 className="jb-feat-t">Coach OS</h2>
              <p className="jb-feat-b">
                A complete client-management platform for one-to-one coaching practices. The client gets a portal
                with an AI companion trained on their own history, a course area, and in-browser contract signing.
                The coach gets a pipeline where payment, signature, and progress live on one record, with churn
                risk computed before the client goes quiet. GoHighLevel stays the engine; the app and the CRM sync
                in both directions and nobody retypes anything.
              </p>
              <div className="jb-mini">
                <div>
                  <div className="jb-mini-v" data-count="29,474">29,474</div>
                  <div className="jb-mini-l">lines of production code</div>
                </div>
                <div>
                  <div className="jb-mini-v">26 + 34</div>
                  <div className="jb-mini-l">page routes + API endpoints</div>
                </div>
                <div>
                  <div className="jb-mini-v" data-count="24">24</div>
                  <div className="jb-mini-l">GHL webhook events</div>
                </div>
                <div>
                  <div className="jb-mini-v" data-count="8">8</div>
                  <div className="jb-mini-l">scheduled background jobs</div>
                </div>
              </div>
              <div className="jb-cta-row" style={{ marginBottom: 0 }}>
                <a className="jb-btn jb-btn-primary" href="https://coachos.johnboydesign.com/tour" target="_blank" rel="noopener noreferrer">
                  Open the live tour
                </a>
                <Link className="jb-btn jb-btn-ghost" href="/coach-os">
                  Read the case study
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* track record */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/03</i> Track record
            </div>
            <h2 className="jb-h2" data-reveal="60">Where this has already worked.</h2>
            <div className="jb-ledger" style={{ marginTop: "30px" }} data-reveal="140">
              {ledger.map((r) => (
                <div className="jb-row" key={r.who}>
                  <div className="jb-row-when">{r.when}</div>
                  <div>
                    <div className="jb-row-who">{r.who}</div>
                    <div className="jb-row-role">{r.role}</div>
                    <p className="jb-row-what">{r.what}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* projects */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/04</i> Own products
            </div>
            <h2 className="jb-h2" data-reveal="60">Built for myself, shipped like client work.</h2>
            <p className="jb-lede" style={{ marginBottom: "34px" }}>
              The fastest way to judge a builder is what they build when nobody is paying them to.
            </p>
            <div className="jb-projects" data-reveal="140" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              {projects.map((p) =>
                p.href ? (
                  <Link className="jb-proj" href={p.href} key={p.n}>
                    <div className="jb-proj-head">
                      <span className="jb-proj-n">{p.n}</span>
                      <span className={`jb-proj-s${p.live ? " live" : ""}`}>{p.s}</span>
                    </div>
                    <p className="jb-proj-b">{p.b}</p>
                    <span className="jb-proj-more">Case study →</span>
                  </Link>
                ) : (
                  <div className="jb-proj" key={p.n}>
                    <div className="jb-proj-head">
                      <span className="jb-proj-n">{p.n}</span>
                      <span className={`jb-proj-s${p.live ? " live" : ""}`}>{p.s}</span>
                    </div>
                    <p className="jb-proj-b">{p.b}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* stack */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/05</i> Stack
            </div>
            {stackGroups.map((g) => (
              <div className="jb-stack-group" key={g.k}>
                <div className="jb-stack-k">{g.k}</div>
                <div className="jb-tags">
                  {g.tags.map((t) => (
                    <span className="jb-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* how i work */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-label" data-reveal="0">
              <i>/06</i> How I work
            </div>
            <ul className="jb-promises" data-reveal="80">
              {promises.map((p) => (
                <li className="jb-promise" key={p.b}>
                  <CheckIcon />
                  <div>
                    <b>{p.b}</b>
                    <span>{p.s}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* contact */}
        <section className="jb-sec">
          <div className="jb-cap">
            <div className="jb-contact" data-reveal="60">
              <h2>Send me one broken workflow.</h2>
              <p>
                Before you hire anyone, me included: send one workflow that is not firing or one funnel that is
                not converting. I will tell you exactly what is wrong with it, free, before you spend anything.
                That is a better interview than any resume, mine included.
              </p>
              <div className="jb-cta-row" style={{ marginBottom: 0 }}>
                <a className="jb-btn jb-btn-primary" href="/book">
                  Book a call
                </a>
                <a className="jb-btn jb-btn-ghost" href="mailto:uix.johnboy@gmail.com">
                  uix.johnboy@gmail.com
                </a>
              </div>
              <div className="jb-links">
                <a className="jb-link" href="https://coachos.johnboydesign.com/tour" target="_blank" rel="noopener noreferrer">
                  Coach OS live
                </a>
                <a className="jb-link" href="/coach-os">
                  Case study
                </a>
                <a className="jb-link" href="/Johnboy-Roxas-CV.pdf">
                  CV (PDF)
                </a>
                <a className="jb-link" href="https://www.onlinejobs.ph/jobseekers/info/4412723" target="_blank" rel="noopener noreferrer">
                  OnlineJobs.ph
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="jb-foot">
        <div className="jb-cap" style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", justifyContent: "space-between" }}>
          <span>© 2026 John Boy Roxas · Tarlac, Philippines</span>
          <span>Built by hand, like everything else here</span>
        </div>
      </footer>
    </div>
  );
}
