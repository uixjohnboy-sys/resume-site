import Link from "next/link";
import Ads from "./Ads";
import Report from "./Report";
import { MEASURED } from "@/lib/leadsource/config";

// The Lead-source tracker demo page (DESIGN.md v0.3). One component, two entry points: /demo/lead-source (hero first)
// and /demo/lead-source/report (the booking confirmation redirect: one line instead of the hero, the report first).
// Kestrel Physio is a made-up clinic. Only the four demo ad links open a new tab.

const BOOK = "/book";
// Shown only once they exist (G3 v1 Design Director: a dashed or grey placeholder must not go live).
const SHOTS_READY = false;

type Props = { variant: "demo" | "report"; paused: boolean; bookingBase: string };

export default function LeadSourcePage({ variant, paused, bookingBase }: Props) {
  const reportFirst = variant === "report";

  const privacy = (
    <div className="privacy" role="note" aria-labelledby="priv-h">
      <p className="lbl" id="priv-h">
        Before you book
      </p>
      <div>
        <p>This is a demo by John Boy Roxas. Kestrel Physio is made up and no appointment will happen.</p>
        <p>
          If you book, we keep your first name, your email, the time you pick and the link you clicked, only to show this demo. They are stored in HighLevel
          (GoHighLevel), a service based outside Australia. You will get a booking confirmation email. We delete your details and booking within 30 days. The
          report never shows your name or email.
        </p>
        <p>
          Questions or deletion sooner: <a href="mailto:uix.johnboy@gmail.com">uix.johnboy@gmail.com</a>
        </p>
      </div>
    </div>
  );

  const ads = (
    <section className={`blk${reportFirst ? "" : " first"}`} id="ads" aria-labelledby="ads-h">
      <div className="sechead">
        <span className="secno lbl">{reportFirst ? "02" : "01"}</span>
        <div>
          <h2 id="ads-h">Pick a demo ad</h2>
          <p className="secsub">
            Three demo ads carry the tags a real Facebook, Instagram or Google ad would. The fourth link carries nothing, to show what you lose without tags.
          </p>
        </div>
      </div>
      <Ads paused={paused} bookingBase={bookingBase} />
    </section>
  );

  const report = (
    <section className={`blk${reportFirst ? " first" : ""}`} id="report" aria-labelledby="rep-h">
      <div className="sechead">
        <span className="secno lbl">{reportFirst ? "01" : "02"}</span>
        <div>
          <h2 id="rep-h">The live report</h2>
          <p className="secsub">
            Read live from John Boy&apos;s GoHighLevel demo account. Last 4 weeks, plus John Boy&apos;s own test bookings so it is never empty. Times are
            Brisbane time (AEST).
          </p>
        </div>
      </div>
      <Report />
      {MEASURED.recording ? (
        <div className="watch" id="watch">
          <p>Rather not book?</p>
          <p className="small">
            <a className="textlink" href={MEASURED.recording.href}>
              Watch the recording ({MEASURED.recording.length})
            </a>
            {" · "}
            <a className="textlink" href={MEASURED.recording.transcript}>
              Transcript
            </a>
          </p>
        </div>
      ) : null}
    </section>
  );

  return (
    <div className="ls">
      <a className="skip" href="#main">
        Skip to the demo
      </a>

      <header className="top">
        <div className="wrap">
          <Link className="name" href="/">
            <b>JOHN BOY ROXAS</b>
            <span>Systems and automation</span>
          </Link>
          <div className="right">
            <nav aria-label="Site">
              <Link href="/#work">All work</Link>
              <a href="/John-Boy-Roxas-Resume.pdf">CV</a>
            </nav>
            <a className="pill hdr" href={BOOK}>
              Book a 15-min call
            </a>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <div className="wrap">
          <p className="crumb">
            <Link href="/#work">Work</Link>{" / "}<Link href="/work/integrations">Integrations and tracking</Link>{" / "}Lead-source tracker
          </p>

          {reportFirst ? (
            <div className="hero lite">
              <div>
                <p className="kick lbl">Live demo · GoHighLevel</p>
                <h1>Your booking</h1>
                <a className="textlink" href="/demo/lead-source#ads">
                  Back to the demo ads
                </a>
              </div>
            </div>
          ) : (
            <div className="hero">
              <div>
                <p className="kick lbl">Live demo · GoHighLevel</p>
                <h1>Which ad brought this booking?</h1>
                <p className="lead">Each new booking shows which ad or channel it came from, saved on the contact in GoHighLevel and on a live report.</p>
                <p className="madeup">
                  <span className="tag">Made-up clinic</span>
                  <span>Kestrel Physio is a made-up Brisbane clinic. The booking page, the GoHighLevel account and the report are real.</span>
                </p>
                <div className="acts">
                  {paused ? (
                    <a className="pill" href="#report">
                      See the report
                    </a>
                  ) : (
                    <a className="pill" href="#ads">
                      Try a demo ad
                    </a>
                  )}
                  {MEASURED.recording ? (
                    <a className="textlink" href="#watch">
                      Rather watch? See the recording
                    </a>
                  ) : null}
                </div>
              </div>
              <aside className="howto" aria-labelledby="howto-h">
                <h2 id="howto-h">How the demo works</h2>
                <ol className="run">
                  <li>
                    <span className="lbl">Step 1</span>
                    <b>Pick a demo ad</b>
                    <p>Each one opens Kestrel Physio&apos;s real GoHighLevel booking page in a new tab, with its own tracking tags.</p>
                  </li>
                  <li>
                    <span className="lbl">Step 2</span>
                    <b>Book a time</b>
                    <p>First name and email only. Times are Brisbane time. The page may run a Cloudflare check to confirm you are a person.</p>
                  </li>
                  <li className="out">
                    <span className="lbl">Result</span>
                    <b>See your booking on the report</b>
                    <p>
                      GoHighLevel saves the source on the contact, alerts the clinic&apos;s team (here, John Boy) and emails you a confirmation. Then it brings you
                      back here.
                    </p>
                  </li>
                </ol>
              </aside>
            </div>
          )}

          {reportFirst ? (
            <>
              {report}
              {privacy}
              {ads}
            </>
          ) : (
            <>
              {privacy}
              {ads}
              {report}
            </>
          )}

          <section className="blk" aria-labelledby="ghl-h">
            <div className="sechead">
              <span className="secno lbl">03</span>
              <div>
                <h2 id="ghl-h">What the agency sees in GoHighLevel</h2>
                <p className="secsub">
                  The same booking inside GoHighLevel, as the clinic&apos;s team would see it{SHOTS_READY ? ". Screenshots from the demo account, test contacts only." : ": the fields it saves and where they sit."}
                </p>
              </div>
            </div>
            <p className="install">
              Installs as a GoHighLevel snapshot into any sub-account. Per clinic you set the calendar, the alert recipient and the mapping list, then book once
              through each channel&apos;s link to check the source before the ads go live.
            </p>
            {SHOTS_READY ? (
            <div className="shots">
              <figure>
                <div className="shot">
                  <span>Screenshot at G3: a test contact, Lead source folder open</span>
                </div>
                <figcaption>A test contact with its lead source fields.</figcaption>
              </figure>
              <figure>
                <div className="shot">
                  <span>Screenshot at G3: pipeline DEMO Kestrel Physio, Source on each card</span>
                </div>
                <figcaption>The pipeline: Booked (Upcoming on the report), Attended, No-show, Cancelled, with the source on every card.</figcaption>
              </figure>
              <figure>
                <div className="shot">
                  <span>Screenshot at G3: Smart List &quot;Bookings by source&quot;</span>
                </div>
                <figcaption>The Smart List the snapshot adds, with the eight fields as columns.</figcaption>
              </figure>
              <figure>
                <div className="shot">
                  <span>Screenshot at G3: the booking alert email, test contact</span>
                </div>
                <figcaption>The alert the clinic&apos;s team gets: first name, time, source and campaign.</figcaption>
              </figure>
            </div>
            ) : null}
            <div className="fields">
              <div>
                <h3>First touch (saved once, never overwritten)</h3>
                <ul>
                  <li>
                    Lead source <span>Facebook</span>
                  </li>
                  <li>
                    Lead medium <span>paid_social</span>
                  </li>
                  <li>
                    Lead campaign <span>kp-initial-consult</span>
                  </li>
                  <li>
                    First touch date <span>17 Nov 2026</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3>Last touch (updated on every booking)</h3>
                <ul>
                  <li>
                    Last source <span>Google</span>
                  </li>
                  <li>
                    Last medium <span>cpc</span>
                  </li>
                  <li>
                    Last campaign <span>Not set</span>
                  </li>
                  <li>
                    Last touch date <span>19 Nov 2026</span>
                  </li>
                </ul>
              </div>
              <p className="foot">
                Example values for a returning test contact. GoHighLevel also keeps the gclid or fbclid on the contact, ready for offline conversions later.
              </p>
            </div>
          </section>

          <section className="blk" aria-labelledby="ny-h">
            <div className="sechead">
              <span className="secno lbl">04</span>
              <div>
                <h2 id="ny-h">Not in this demo</h2>
                <p className="secsub">Next steps for a real clinic. Named here so nothing is claimed that is not built.</p>
              </div>
            </div>
            <ul className="notyet">
              <li>
                <b>Google Ads offline conversions</b>
                <span>Send attended visits back to Google Ads.</span>
              </li>
              <li>
                <b>Meta Conversions API</b>
                <span>Send bookings back to Meta, after a privacy check.</span>
              </li>
              <li>
                <b>Facebook lead forms</b>
                <span>Instant Form leads carry the form and ad, not link tags. Mapped in a later step.</span>
              </li>
              <li>
                <b>TikTok events</b>
                <span>Send bookings back to TikTok. The mapping is written for TikTok click IDs, not yet tested.</span>
              </li>
              <li>
                <b>Cost per patient</b>
                <span>Needs ad spend from each platform.</span>
              </li>
              <li>
                <b>Bookings and arrivals in practice software</b>
                <span>Bookings or arrivals marked in tools like Cliniko need a sync.</span>
              </li>
              <li>
                <b>Phone bookings and call tracking</b>
                <span>Needs tracked phone numbers, which this demo account does not have.</span>
              </li>
            </ul>
          </section>

          <div className="cta">
            <h2>Want this in your clients&apos; accounts?</h2>
            <a className="pill" href={BOOK}>
              Book a 15-min call
            </a>
          </div>
        </div>
      </main>
      <footer>
        <div className="wrap">johnboydesign.com · Kestrel Physio is made up</div>
      </footer>
    </div>
  );
}
