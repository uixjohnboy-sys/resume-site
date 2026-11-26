import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MailLink from "@/components/MailLink";
import { anton, host, plex } from "../../fonts";
import "../../v4/v4.css";
import "../../work/work.css";
import "./teardown.css";

// Sample teardown "the follow-up that never stops" (spec C:\PortfolioProjects\ghl-rescue\TEARDOWN-SPEC.md v0.2).
// Every time, count and test below comes from TEARDOWN-WRITEUP.md and ASSET-REGISTER.md (the GoHighLevel logs).
// Noindex and unlinked until it passes G2 and G4; then linked from /work/fixes-and-audits.

export const metadata: Metadata = {
  title: { absolute: "Sample GoHighLevel teardown: a follow-up that kept emailing people who booked | John Boy Roxas" },
  description: "A sample GoHighLevel workflow teardown: the cause found in the logs, the change list with how to undo each change, and five tests with times.",
  robots: { index: false, follow: false },
};

const BOOK = "/book";
const ASK =
  "mailto:uix.johnboy@gmail.com?subject=" +
  encodeURIComponent("A workflow that misbehaves") +
  "&body=" +
  encodeURIComponent("Hi John Boy,\n\nThe workflow:\n\nWhat it does that it should not:\n\nScreenshots attached (no passwords).\n\n");
const IMG = "/demo/followup-teardown/";

function Shot({ src, w, h, alt, cap }: { src: string; w: number; h: number; alt: string; cap: string }) {
  return (
    <figure className="td-shot">
      <Image src={IMG + src} alt={alt} width={w} height={h} sizes="(max-width: 860px) 100vw, 900px" />
      <figcaption>{cap}</figcaption>
    </figure>
  );
}

const timeline: [string, string, boolean?][] = [
  ["12:21 PM", "Thanks for your enquiry (reply)"],
  ["12:24 PM", "Still thinking about your assessment? (nudge 1)"],
  ["about 12:25 PM", "They book an assessment"],
  ["12:25 PM", "Your private assessment is booked (confirmation)"],
  ["12:27 PM", "A time that suits you (nudge 2, after booking)", true],
  ["12:30 PM", "Our last note about your assessment (nudge 3, after booking)", true],
];

const checked: [string, string, ("in" | "out" | "kept")?][] = [
  ["No goal step at all", "Ruled out. A goal \"booked an assessment\" exists."],
  ["Goal watches the wrong calendar", "Ruled in. The goal watches \"Private assessment\"; bookings arrive on the newer calendar.", "in"],
  ["Goal placed where it cannot end the sequence", "Ruled out. A goal jumps the contact to it from any step."],
  ["Goal status list misses \"confirmed\"", "Ruled out. New and confirmed are both selected; bookings arrive as confirmed."],
  ["Booking confirmation removes the contact from the follow-up", "Not present. It sends the confirmation only, which is why it looked handled."],
  ["Stop on response off", "Ruled in (minor). A reply does not stop the nudges.", "in"],
  ["Allow re-entry on", "Kept on, on purpose: a returning patient who enquires again should get the reply.", "kept"],
  ["Replies reach GoHighLevel", "Checked: no forwarding or reply-to override, so a reply lands in the conversation."],
  ["Another workflow also catches the booking", "Checked all 14 booking-status workflows: each is filtered to its own calendar."],
];

const changes = [
  ["Goal calendar", "Enquiry follow-up > Goal: booked an assessment > Select calendar", "Private assessment", "the test calendar bookings land on", "set it back"],
  ["Stop on response", "Enquiry follow-up > Settings", "Off", "On", "toggle off"],
  ["Contacts mid-sequence", "Enquiry follow-up > Enrollment history", "1 waiting for nudge 2", "removed from this workflow only", "re-add to the fixed workflow, or leave out"],
  ["Old version", "Workflows list", "Published", "kept as \u201c(as found)\u201d, Draft", "publish it again"],
];

const tests = [
  ["A, as found", "Enquiry, then book after nudge 1 (inside GoHighLevel)", "Shows the fault", "Nudges 2 and 3 sent after booking. Failed as found, as expected.", false],
  ["D, mid-sequence", "Still in the old version when the fix goes live", "Found, counted, removed", "1 found, removed at 12:32:26; no nudge 2 at 12:33:42. Pass.", true],
  ["E, fixed", "Enquiry, then book after nudge 1 (inside GoHighLevel)", "Goal fires, no more nudges", "Booked about 12:38; goal executed 12:38:15; removed by end of workflow 12:38:17; nothing after. Pass.", true],
  ["B, fixed", "Book on the public booking page", "Same as E", "Goal executed 1:24:59 PM, before nudge 1 was due; nothing sent after. Pass.", true],
  ["C, fixed", "Reply to the first email instead of booking", "Reply lands, nudges stop", "First email 11:01 PM, reply 11:03 PM landed on the contact; nudges due about 11:04, 11:07 and 11:10 never sent. Pass.", true],
] as const;

export default function FollowUpTeardown() {
  return (
    <div className={`v4 ${anton.variable} ${host.variable} ${plex.variable}`}>
      <header className="v4-nav">
        <div className="v4-nav-in">
          <Link className="v4-mark" href="/">
            <b>John Boy Roxas</b>
            <span>Systems and automation</span>
          </Link>
          <nav className="v4-links" aria-label="Sections">
            <Link href="/work/fixes-and-audits">Fixes and audits</Link>
            <a href="/John-Boy-Roxas-Resume.pdf">CV</a>
          </nav>
          <a className="v4-btn v4-btn-dark v4-nav-cta" href={BOOK}>
            Book a 15-min call
          </a>
        </div>
      </header>

      <main className="wk-page td-page">
        <section className="v4-in wk-head">
          <p className="v4-kicker">Sample teardown · GoHighLevel</p>
          <h1>Booked, and still getting &ldquo;still thinking?&rdquo; emails</h1>
          <p className="v4-lede">
            A demo clinic&apos;s enquiry follow-up kept emailing people after they had booked. Here is how I found why, what I changed, and the tests that
            prove it stopped.
          </p>
          <p className="td-frame">
            <b>Sample, not client work.</b> Lumiere Aesthetic is a made-up clinic I built inside my own GoHighLevel account. I set this workflow up broken on
            purpose, then audited, fixed and tested it like a client job. Wait times were shortened to 3 minutes so the test fits in one sitting. Times are
            Manila (GMT+8), from the GoHighLevel logs.
          </p>
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">The top line</h2>
          <p className="td-p">
            The follow-up has a &ldquo;booked&rdquo; goal, but the goal watches the old calendar while bookings now land on a different one. So the goal is
            never met, and a person who books still gets every &ldquo;still thinking?&rdquo; email. I pointed the goal at the calendar people actually book on
            and turned on Stop on response. Tested: the next person who booked got no more nudges (the goal fired within seconds), and the 1 contact who was
            mid-sequence was found and removed.
          </p>
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">What the customer saw</h2>
          <ol className="td-time">
            {timeline.map(([t, what, bad]) => (
              <li key={t + what} className={bad ? "bad" : ""}>
                <span className="td-t">{t}</span>
                <span>{what}</span>
              </li>
            ))}
          </ol>
          <p className="td-p">For a clinic this reads as pushy, and careless with consent: the person has already said yes.</p>
          <Shot src="01-as-found-thread.webp" w={725} h={525} alt="The test contact's email thread: the booking at 12:25 PM, then nudges at 12:27 PM and 12:30 PM." cap="Test contact A's thread, as found. The booking, then two more nudges." />
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">The log, not a guess</h2>
          <p className="td-p">The execution log shows the nudges running after the booking. The goal only took the contact out after the last email had gone.</p>
          <Shot src="04-as-found-log.webp" w={1047} h={499} alt="Execution log of the as-found workflow: N3 nudge executed at 12:30:46 PM, removed by the goal at 12:30:47 PM." cap="As found: nudge 3 at 12:30:46 PM, after the booking." />
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">The cause</h2>
          <p className="td-p">The goal step was there, with the right statuses. It was watching the wrong calendar.</p>
          <div className="td-pair">
            <Shot src="05-goal-before.webp" w={438} h={505} alt="Goal settings before: Select calendar is Private assessment." cap={"Before: the goal watches \u201cPrivate assessment\u201d."} />
            <Shot src="07-goal-after.webp" w={438} h={505} alt="Goal settings after: Select calendar is the test calendar bookings land on." cap="After: the calendar people actually book on." />
          </div>
          <div className="td-pair td-pair-wide">
            <Shot src="06-settings-before.webp" w={1047} h={300} alt="Workflow settings before: Stop on response is off." cap="Before: Stop on response off, so a reply did not stop the nudges." />
            <Shot src="08-settings-after.webp" w={1047} h={300} alt="Workflow settings after: Stop on response is on." cap="After: Stop on response on." />
          </div>
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">What I checked</h2>
          <div className="td-table" role="region" aria-label="What I checked" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Possible cause</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {checked.map(([c, r, k]) => (
                  <tr key={c} className={k ?? ""}>
                    <td>{c}</td>
                    <td>{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">The people already inside</h2>
          <p className="td-p">
            Fixing the workflow is half the job. Before switching over, I opened the old workflow&apos;s Enrollment history: 1 test contact was still waiting,
            with nudge 2 due at 12:33:42. I removed them from that workflow only at 12:32. Nudge 2 never went out.
          </p>
          <Shot src="02-enrollment-before-fix.webp" w={1046} h={170} alt="Enrollment history of the old workflow: test contact D waiting for time, next execution 12:33:42 PM." cap="The old workflow at 12:32 PM: contact D still waiting." />
          <ul className="td-list">
            <li>Already through the sequence: 1 (got every nudge; an apology email is optional).</li>
            <li>Mid-sequence when the fix went live: 1, found and removed from this workflow only.</li>
            <li>Total enrolled before the fix: 2.</li>
          </ul>
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">Change list</h2>
          <p className="td-p">Every change, where it is, and how to undo it. Nothing deleted.</p>
          <div className="td-table" role="region" aria-label="Change list" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th scope="col">What</th>
                  <th scope="col">Where in GoHighLevel</th>
                  <th scope="col">Before</th>
                  <th scope="col">After</th>
                  <th scope="col">How to undo</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((r) => (
                  <tr key={r[0]}>
                    {r.map((c, i) => (
                      <td key={i}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">Five tests, with times</h2>
          <div className="td-table" role="region" aria-label="Tests" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Test</th>
                  <th scope="col">Setup</th>
                  <th scope="col">Expected</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(([t, s, e, r, pass]) => (
                  <tr key={t} className={pass ? "pass" : "fail"}>
                    <td>{t}</td>
                    <td>{s}</td>
                    <td>{e}</td>
                    <td>{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="td-pair">
            <Shot src="03-fixed-log-test-e.webp" w={1047} h={499} alt="Fixed workflow log, test E: goal executed 12:38:15 PM, removed by end of workflow 12:38:17 PM." cap="Test E: the goal fires seconds after the booking." />
            <Shot src="10-fixed-log-test-b.webp" w={1047} h={499} alt="Fixed workflow log, test B: goal executed 1:24:59 PM after a booking on the public page." cap="Test B: a booking on the public page ends it before nudge 1." />
          </div>
          <div className="td-pair">
            <Shot src="09-fixed-thread-test-e.webp" w={740} h={375} alt="Test contact E's thread: one nudge, the booking, the confirmation, and nothing after." cap="Test E's thread: nothing after the confirmation." />
            <Shot src="11-fixed-thread-test-c.webp" w={725} h={525} alt="Test contact C's thread: the first email at 11:01 PM, the reply at 11:03 PM, and no nudge after." cap="Test C: a reply stops the nudges. (The first run's nudges above were a different try.)" />
          </div>
          <p className="td-note">
            <b>Worth knowing:</b> a reply only stops the nudges when it comes from the address the contact is saved under. In the first try of test C the reply
            came from a different address, GoHighLevel filed it on another contact, and the nudges kept going. Worth checking with any client whose customers
            reply from a second inbox.
          </p>
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">What a client also gets</h2>
          <ul className="td-list">
            <li>
              <b>Needs your decision:</b> real wait times (I would suggest 2, 4 and 7 days); whether a reply should also alert the owner; whether the booking
              confirmation should also remove the contact (one step, left out so the test proves the goal alone); and an apology for the 1 person nudged after
              booking.
            </li>
            <li>
              <b>A 7-day re-check:</b>{" "}on day 7 I open Enrollment history and the execution logs, check that everyone who booked shows &ldquo;Goal
              executed&rdquo; and no nudge after their booking, and send you the result in two lines.
            </li>
            <li>
              <b>White label:</b>{" "}the write-up can go to your client under your agency&apos;s name. I do not need to be named.
            </li>
          </ul>
        </section>

        <section className="v4-in td-sec td-offer">
          <h2 className="wk-h">Send me one workflow that misbehaves</h2>
          <p className="td-p">
            Send screenshots of one GoHighLevel workflow that does something it should not. I find the cause and send you a written fix list, free, within 2
            business days. Least access first: never a password.
          </p>
          <div className="v4-ctas">
            <MailLink className="v4-btn v4-btn-dark" href={ASK} title="Send me a workflow">
              Send me a workflow
            </MailLink>
            <a className="v4-btn v4-btn-line" href={BOOK}>
              Book a 15-min call
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
