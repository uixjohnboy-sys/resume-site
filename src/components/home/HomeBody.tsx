import type { ReactNode } from "react";
import MailLink from "@/components/MailLink";
import Image from "next/image";
import { anton, host, plex } from "@/app/fonts";
import Reveal from "@/components/v4/Reveal";
import AboutStory from "@/components/home/AboutStory";
import ContactBlob from "@/components/home/ContactBlob";
import IntroPlayer from "@/components/home/IntroPlayer";
import IntroChip from "@/components/home/IntroChip";
import { clients } from "@/lib/about";
import "@/app/v4/v4.css";
import "@/app/work/work.css";
import "@/app/home-flow.css";
import "@/app/home-dark.css";
import "@/app/about-story.css";
import "@/app/contact-blob.css";


// Homepage since 2026-11-22 (JB): the hero is the cover-flow of the kinds of work, each card with its promise, proof and a
// button to /work/<slug>; the work index section is gone and the intro video comes right after. The whole page is black.
// From 2026-11-15 to 11-22 the work index sat under the hero, one row per kind of work (PortfolioProjects/work-cards/SPEC.md). Before that, since 2026-11-06: hero,
// intro video with the live builds as its chapters, who he is, and the call to action. The video is the explainer; everything else that used to be here lives in the video, the demos and the CV.
// White poster look on JB's reference (xgensgrowth.com), his own words and proof. Short, direct, confident copy.
//
// Rules: no confidential client is named or described (the NDA client appears only as "Confidential client (NDA)", no country
// or industry). No invented results, quotes or policies. Testimonials render only when real ones exist.


const EMAIL = "uix.johnboy@gmail.com";
const nl = "\n\n";
const BRIEF_MAIL =
  `mailto:${EMAIL}?subject=` +
  encodeURIComponent("My brief") +
  "&body=" +
  encodeURIComponent(`Hi John Boy,${nl}My business:${nl}The job I want off my plate:${nl}How we handle it today:${nl}`);
const WHATSAPP = "https://wa.me/639773659548?text=" + encodeURIComponent("Hi John Boy, I found you through your portfolio.");
const LINKEDIN = "https://www.linkedin.com/in/john-boy-roxas-gohighlevel-specialist";
const CV = "/John-Boy-Roxas-Resume.pdf";
const BOOK = "/book";

// The intro (recorded 2026-11-23, edited in C:\PortfolioProjects\intro-video\edit). Voice only, no music, so no
// Content ID claims; the captions are burned into the picture, so no separate caption track is needed.
const INTRO_VIDEO = "/intro/john-boy-roxas-intro.mp4";
const INTRO_POSTER = "/intro/poster-v2.webp";


/** The homepage body; the hero's work section is passed in (live: cover-flow; preview: grid). */
export default function HomeBody({ hero }: { hero: ReactNode }) {
  return (
    <div id="v4-root" className={`v4 v4-dark ${anton.variable} ${host.variable} ${plex.variable}`}>
      <Reveal />

      <p className="v4-bar">
        Available now. Part-time, contract or project. <a href="#about">See my hours</a>
      </p>
      <header className="v4-nav">
        <div className="v4-nav-in">
          <a className="v4-mark" href="#top">
            <b>John Boy Roxas</b>
            <span>Systems and automation</span>
          </a>
          <nav className="v4-links" aria-label="Sections">
            <a href="#work">Work</a>
            <a href="#intro">Intro</a>
            <a href="#about">About</a>
            <a href={CV}>CV</a>
          </nav>
          <a className="v4-btn v4-btn-dark v4-nav-cta" href={BOOK}>
            Book a 15-min call
          </a>
        </div>
      </header>

      <main id="top">
        {/* ---------- 1. HERO: what I build, as a cover-flow of cards (JB 2026-11-22), black and white ---------- */}
        <section className="sf-hero" id="work" aria-labelledby="hero-h">
          <div className="sf-head">
            {/* No-break spaces: on a phone the label breaks at the dot, not before "certified" alone. */}
            <p className="v4-kicker">GoHighLevel specialist&nbsp;· HighLevel&nbsp;certified</p>
            <h1 id="hero-h">I build what your CRM can&apos;t.</h1>
            <p className="v4-lede">
              Leads go cold when nobody replies. I&nbsp;set&nbsp;up GoHighLevel or fix yours, so&nbsp;new leads get an email reply in seconds and follow-ups that stop when&nbsp;they&nbsp;book. Nothing goes live until it works on test&nbsp;contacts.
            </p>
            {/* JB 2026-11-29: the lede picked by three blind reader panels (AU clinic owner, UK agency owner, US trades owner,
                OnlineJobs.ph employer). "Email" on purpose: the account sends no texts. "Part-time" lives in the top bar.
                Last sentence (same four readers, blind A/B/C, 11-29): "Nothing goes live until it works on test contacts"
                picked 4 of 4, 57/80, over "I check it all on test contacts..." 48 and the old "I test it all on test
                contacts..." 41, which every reader flagged for saying test twice. The &nbsp;s keep "I", "so" and
                "when they book" from breaking badly on a phone (see home-flow.css). */}
            <p className="sf-who">
              <span>Owners hand me the problem.</span> <span>Agencies hand me the build.</span>
            </p>
            {/* Face on the first screen + how client data is handled (hiring review 2026-11-24). */}
            <IntroChip length="1:21" />
            {/* The trust line (NDA, own login, test contacts) was removed by JB on 2026-11-28: he explains it on the call. */}
            {/* The "Sample work" line that sat here (hiring review 2026-11-27) was removed by JB on 2026-11-28; the teardown
                is still a card under Fixes and audits. */}
          </div>
          {/* No buttons under the cards (JB 2026-11-22): Book a call is in the nav, and the intro video is the next section. */}
          {hero}
        </section>

        {/* ---------- 2. INTRO VIDEO ---------- */}
        <section className="v4-sec v4-intro" id="intro">
          <div className="v4-in">
            <div className="v4-film" data-rv>
              {INTRO_VIDEO ? (
                <IntroPlayer src={INTRO_VIDEO} poster={INTRO_POSTER} length="1:21" />
              ) : (
                <div className="v4-film-wait">
                  <Image className="v4-film-still" src="/projects/tapline/board.png" alt="" width={2880} height={1800} sizes="(max-width: 860px) 100vw, 1040px" />
                  <span className="v4-film-play" aria-hidden="true" />
                  <div>
                    <p className="v4-kicker">Intro video · being recorded</p>
                    <p>A short walk-through of this work, from me. Until it&apos;s up, open any row above and use the demos yourself.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ---------- 3. WHO I AM ---------- */}
        <section className="v4-statement v4-about" id="about">
          {/* Three cards in a folder; on scroll they rise, the folder fades and the text comes up (JB 2026-11-22). */}
          <AboutStory />
          {/* The certification badges strip is gone (JB 2026-11-22): the certificates card's Know more shows them. */}
          <div className="v4-strip v4-strip-flat" aria-label="Clients">
            <p className="v4-strip-h">Worked with</p>
            <ul className="v4-clients v4-clients-grid">
              {clients.map((c) => (
                <li key={c.name}>
                  <b>{c.name}</b>
                  <span>{c.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- 4. CALL TO ACTION ---------- */}
        <section className="v4-sec v4-contact" id="contact">
          <div className="v4-in" data-rv>
            <h2>Tell me what you need built or fixed.</h2>
            <p className="v4-lede">15 minutes, and a straight answer. Or send your brief and get a written plan back, free.</p>
            {/* No buttons here (JB 2026-11-22): slide from You to me and the four ways to reach me come up. */}
            <ContactBlob book={BOOK} brief={BRIEF_MAIL} email={`mailto:${EMAIL}`} whatsapp={WHATSAPP} />
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
                <span>Systems and automation</span>
              </a>
              <p>I build what your CRM can&apos;t.</p>
            </div>
            <div>
              <p className="v4-foot-h">Try</p>
              <ul>
                <li><a href="/demo/tapline?tour=manager">Tapline repairs desk</a></li>
                <li><a href="https://coachos.johnboydesign.com/tour">Coach OS tour</a></li>
                <li><a href="/sample-plan">Sample plan</a></li>
              </ul>
            </div>
            <div>
              <p className="v4-foot-h">Start</p>
              <ul>
                <li><a href={BOOK}>Book a 15-min call</a></li>
                <li><MailLink href={BRIEF_MAIL} title="Send me your brief">Send me your brief</MailLink></li>
                <li><a href={CV}>CV (PDF)</a></li>
              </ul>
            </div>
            <div>
              <p className="v4-foot-h">Contact</p>
              <ul>
                <li><MailLink href={`mailto:${EMAIL}`} title="Email John Boy">{EMAIL}</MailLink></li>
                <li><a href={WHATSAPP}>WhatsApp</a></li>
                <li><a href={LINKEDIN}>LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="v4-foot-end">
            <span>&copy; 2026 John Boy Roxas · Paniqui, Tarlac, Philippines</span>
            <span>HighLevel certified · For Australian and US businesses</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
