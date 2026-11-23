"use client";

import { useSyncExternalStore } from "react";
import { MEASURED } from "@/lib/leadsource/config";
import { adHref, adSends, type Channel } from "@/lib/leadsource/links";
import { parseVisitor, saveClick, serverSnapshot, subscribe, visitorSnapshot } from "./visitor";

// 01 Pick a demo ad (DESIGN 3). Each ad's own call to action is the only control in its card, a real link that opens
// the booking page in a new tab and says so in its accessible name. The test code rides in utm_content.

const PLAIN_TEXT = {
  Referral: "Referral. Your browser tells GoHighLevel you came from this site.",
  Unknown: "Unknown. No tags and no click ID, so nothing says where it came from.",
} as const;

export default function Ads({ paused, bookingBase }: { paused: boolean; bookingBase: string }) {
  const v = parseVisitor(useSyncExternalStore(subscribe, visitorSnapshot, serverSnapshot));
  const code = v.code;
  const clickId = v.clickId || "demo";

  if (paused) {
    return (
      <div className="paused">
        <p>
          <b>Demo paused.</b>{" "}The demo ads are switched off for now. The report and the recording still work.
        </p>
      </div>
    );
  }

  const href = (ch: Channel) => adHref(bookingBase, ch, ch === "plain" ? "" : code, clickId);
  const link = (ch: Channel) => ({
    href: href(ch),
    target: "_blank",
    rel: "noopener",
    onClick: () => saveClick(ch),
    onAuxClick: (e: React.MouseEvent) => {
      if (e.button === 1) saveClick(ch);
    },
  });

  return (
    <>
      <p className="refline">
        <span>
          Your test code <code>{code || "ref-"}</code>
        </span>
        <span>It rides in the demo ad links so the report can find your booking. It is random, and the report shows only the code, never your name or email.</span>
      </p>

      <div className="ads">
        <div className="adcol">
          <div className="adhead">
            <span className="lbl">Facebook feed</span>
            <span className="tag solid">Demo ad</span>
          </div>
          <article className="ad" aria-label="Demo Facebook ad for Kestrel Physio">
            <div className="who">
              <span className="kmark" aria-hidden="true"></span>
              <div>
                <b>Kestrel Physio</b>
                <small>Sponsored · Demo ad</small>
              </div>
            </div>
            <div className="body">Initial physio consultations in Brisbane. 45 minutes with a physiotherapist. No referral needed. Choose a time online.</div>
            <div className="creative" aria-hidden="true">
              <span className="wm">Kestrel Physio</span>
              <span className="big">Initial consultation</span>
              <span className="sm">45 minutes · Brisbane</span>
            </div>
            <div className="linkbar">
              <div>
                <small>Booking page</small>
                <b>Book an initial consultation</b>
              </div>
              <a className="platbtn" {...link("fb")}>
                Book now<span className="sr"> from the Facebook demo ad (opens a new tab)</span>
              </a>
            </div>
          </article>
          <div className="kv">
            <span className="lbl">This link sends</span>
            <code>{adSends("fb", code)}</code>
            <p className="note">In a live ad, utm_content carries the ad name. The demo puts your test code there.</p>
          </div>
          <div className="kv">
            <span className="lbl">Should show as</span>
            <p>Facebook, paid_social</p>
          </div>
        </div>

        <div className="adcol">
          <div className="adhead">
            <span className="lbl">Instagram feed</span>
            <span className="tag solid">Demo ad</span>
          </div>
          <article className="ad" aria-label="Demo Instagram ad for Kestrel Physio">
            <div className="who">
              <span className="kmark ig" aria-hidden="true"></span>
              <div>
                <b>kestrelphysio</b>
                <small>Sponsored · Demo ad</small>
              </div>
            </div>
            <div className="creative sq" aria-hidden="true">
              <span className="wm">Kestrel Physio</span>
              <span className="big">
                Initial consultation
                <br />
                45 minutes
              </span>
              <span className="sm">Brisbane · Book online</span>
            </div>
            <a className="igbar" {...link("ig")}>
              Book now
              <svg viewBox="0 0 8 14" aria-hidden="true">
                <path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="sr"> from the Instagram demo ad (opens a new tab)</span>
            </a>
            <div className="cap">
              <b>kestrelphysio</b>{" "}Initial consultations with a physiotherapist, 45 minutes. Choose a time online.
            </div>
          </article>
          <div className="kv">
            <span className="lbl">This link sends</span>
            <code>{adSends("ig", code)}</code>
          </div>
          <div className="kv">
            <span className="lbl">Should show as</span>
            <p>Instagram, paid_social</p>
          </div>
        </div>

        <div className="adcol">
          <div className="adhead">
            <span className="lbl">Google search</span>
            <span className="tag solid">Demo ad</span>
          </div>
          <article className="ad gad" aria-label="Demo Google search ad for Kestrel Physio">
            <div className="spons">Sponsored · Demo ad</div>
            <div className="site">
              <span className="kmark sq" aria-hidden="true"></span>
              <div>
                <b>Kestrel Physio</b>
                <small>Demo booking page</small>
              </div>
            </div>
            <a className="h" {...link("google")}>
              Kestrel Physio Brisbane | Initial Consultation | Book Online<span className="sr"> (Google demo ad, opens a new tab)</span>
            </a>
            <p>45 minute initial consultations with a physiotherapist. No referral needed. Choose a time on our booking page.</p>
          </article>
          <div className="kv">
            <span className="lbl">This link sends</span>
            <code>{adSends("google", code)}</code>
            <p className="note">Google&apos;s auto-tagging style: a click ID only. The mapping reads the click ID as Google.</p>
          </div>
          <div className="kv">
            <span className="lbl">Should show as</span>
            {MEASURED.googleResult ? (
              <p>{MEASURED.googleResult}</p>
            ) : (
              <p>
                <span className="ph">Google, cpc</span>{" "}measured at G3
              </p>
            )}
          </div>
        </div>

        <div className="adcol">
          <div className="adhead">
            <span className="lbl">No tracking tags</span>
            <span className="tag">Plain link</span>
          </div>
          <article className="ad plain" aria-label="A plain link with no tracking tags">
            <div className="bubble">
              Here&apos;s the physio I mentioned, you can book online
              <a {...link("plain")}>
                Kestrel Physio booking page<span className="sr"> (plain link, opens a new tab)</span>
              </a>
            </div>
            <p>Like a link shared in a group chat, typed in by hand, or an ad with its tags left off.</p>
          </article>
          <div className="kv">
            <span className="lbl">This link sends</span>
            <p>Nothing. No tags, no test code.</p>
          </div>
          <div className="kv">
            <span className="lbl">Should show as</span>
            {MEASURED.plainResult ? (
              <p>{PLAIN_TEXT[MEASURED.plainResult]}</p>
            ) : (
              <p>
                <span className="ph">Referral</span>{" "}measured at G3
              </p>
            )}
            <p className="note">This booking cannot be marked as yours. No tags, so the report cannot tell which one is yours. That is the point.</p>
          </div>
        </div>
      </div>
    </>
  );
}
