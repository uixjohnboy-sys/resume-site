import type { Metadata } from "next";
import Image from "next/image";
import { archivo, jetmono, serif } from "../fonts";
import V3Motion from "@/components/v3/V3Motion";
import PortraitDissolve from "@/components/v3/PortraitDissolve";
import TwinVoice from "@/components/v3/TwinVoice";
import "./v3.css";

// Portfolio v3, in progress beside the live homepage. Nothing links here and
// search engines are told to stay out until John Boy approves it and it
// replaces `/`.
//
// Built in passes. This pass: the hero (an "AI world" with the systems he
// actually builds floating around him) and the first scroll story (the walls
// every GoHighLevel build hits, each with the real cause underneath).
//
// Rules this page keeps:
// - Every artifact on screen is a real pattern from his own work, written
//   generically. No client names, no NDA projects, no invented results.
// - Content is fully visible with JavaScript off or reduced motion on;
//   V3Motion only adds movement on top of a finished static page.

export const metadata: Metadata = {
  title: "John Boy Roxas · v3 preview",
  robots: { index: false, follow: false },
};

const MAIL =
  "mailto:uix.johnboy@gmail.com?subject=" +
  encodeURIComponent("One broken workflow") +
  "&body=" +
  encodeURIComponent("Hi John Boy, here is the workflow that is not doing what it should:\n\n");

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
      <V3Motion />

      <header className="v3-nav" data-v3="nav">
        <a className="v3-mark" href="#top">
          John Boy Roxas
        </a>
        <nav className="v3-links" aria-label="Sections">
          <a href="#wall">The wall</a>
          <a href="#top">Proof</a>
          <a href="#top">Work</a>
          <a className="v3-links-cta" href={MAIL}>
            Send a workflow
          </a>
        </nav>
      </header>

      <main id="top">
        {/* ---------- HERO: the AI world ---------- */}
        <section className="v3-hero" data-v3="hero">
          <div className="v3-glow v3-glow-a" aria-hidden="true" />
          <div className="v3-glow v3-glow-b" aria-hidden="true" />
          <div className="v3-grid" aria-hidden="true" />

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
            </div>

            {/* Floating artifacts. Each is a real pattern from his builds. */}
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
                <dd>3 of 3</dd>
              </dl>
              <div className="v3-art-foot">duplicate, ignored</div>
            </div>

            <div className="v3-art v3-art-count" data-depth="1.2" data-float="1">
              <b>5</b> events in <span>/</span> <b className="v3-neon">1</b> payment recorded
            </div>

            <div className="v3-art v3-art-pipe" data-depth="0.7" data-float="2">
              <div className="v3-art-head">pipeline</div>
              <ol>
                <li className="on">New lead</li>
                <li className="on">Contacted</li>
                <li className="on">Booked</li>
                <li>Won</li>
              </ol>
            </div>

            <div className="v3-art v3-art-api" data-depth="1.05" data-float="3">
              GHL v2 <span>/</span> contact.create <span>/</span> <b className="v3-neon">201</b> <span>/</span> 182ms
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
                <dt>tools</dt>
                <dd>GHL v2, calendar</dd>
                <dt>voice</dt>
                <dd>ElevenLabs</dd>
                <dt>fallback</dt>
                <dd>armed</dd>
              </dl>
              <div className="v3-art-foot">voice live, chat wiring up</div>
            </div>

            <TwinVoice />
          </div>

          <div className="v3-copy">
            <p className="v3-eyebrow" data-v3="line">
              GoHighLevel architect <span>/</span> AI automation <span>/</span> Philippines
            </p>
            <h1 className="v3-h1">
              <span className="v3-line" data-v3="line">
                GoHighLevel specialist.
              </span>
              <span className="v3-line" data-v3="line">
                And the part that <em>leaves</em> GoHighLevel.
              </span>
            </h1>
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

          <div className="v3-scrollcue" aria-hidden="true">
            scroll
          </div>
        </section>

        {/* ---------- THE WALL: pinned scroll story ---------- */}
        <section className="v3-wall" id="wall" data-v3="wall">
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

        <section className="v3-next">
          <p>
            Next pass: the live proof demos, the work, the AI twin. <a href="#top">Back to top</a>
          </p>
        </section>
      </main>
    </div>
  );
}
