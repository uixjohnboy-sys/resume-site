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
// G2 and G4 closed 2026-11-27 (ghl-rescue/review/TD-G4-v1/FIXES.md): linked from /work/fixes-and-audits and indexed since then.
// Note: plain text that holds an HTML entity loses its leading space after a tag, so curly quotes are typed as
// characters, and a bold label is followed by {" "}.

export const metadata: Metadata = {
  title: { absolute: "GoHighLevel teardown: a follow-up that emailed people who booked | John Boy Roxas" },
  description: "A sample GoHighLevel workflow teardown: the cause found in the logs, the change list with how to undo each change, and five tests with times.",
  alternates: { canonical: "https://www.johnboydesign.com/demo/followup-teardown" },
  openGraph: {
    type: "article",
    url: "https://www.johnboydesign.com/demo/followup-teardown",
    title: "GoHighLevel teardown: a follow-up that emailed people who booked",
    description: "The cause found in the logs, the change list with how to undo each change, and five tests with times.",
    images: [{ url: "https://www.johnboydesign.com/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoHighLevel teardown: a follow-up that emailed people who booked",
    description: "The cause found in the logs, the change list with how to undo each change, and five tests with times.",
  },
};

const BOOK = "/book";
const ASK =
  "mailto:uix.johnboy@gmail.com?subject=" +
  encodeURIComponent("A workflow that misbehaves") +
  "&body=" +
  encodeURIComponent(
    "Hi John Boy,\n\nThe workflow:\n\nWhat it does that it should not:\n\nScreenshots attached: the workflow canvas, its Settings, one execution log (no passwords).\n\n"
  );
const IMG = "/demo/followup-teardown/";

// Screenshots never show wider than their file (no upscaling); wide ones keep their size on a phone and scroll sideways
// instead of shrinking to unreadable, and every one links to the full-size file.
function Shot({ src, w, h, alt, cap }: { src: string; w: number; h: number; alt: string; cap: string }) {
  const wide = w > 600;
  return (
    <figure className={`td-shot${wide ? " wide" : ""}`} style={{ maxWidth: w, ["--w" as string]: w + "px" }}>
      <div className="td-shot-img" {...(wide ? { role: "group", "aria-label": "Screenshot, scrolls sideways", tabIndex: 0 } : {})}>
        <Image src={IMG + src} alt={alt} width={w} height={h} sizes={`(max-width: 860px) ${wide ? w + "px" : "100vw"}, ${w}px`} />
      </div>
      <figcaption>
        {wide ? <span className="td-swipe" aria-hidden="true">Swipe the image to see the rest. </span> : null}
        {cap}{" "}
        <a className="td-full-link" href={IMG + src} target="_blank" rel="noopener">
          Open full size<span className="td-sr"> (opens in a new tab)</span>
        </a>
      </figcaption>
    </figure>
  );
}

// Tables: named by their section heading, first cell a row header, each cell carries its column name so the table can
// stack into labelled blocks on a phone. The status mark is a span with a text alternative, not a CSS glyph.
function Table({ id, cols, rows, mark }: { id: string; cols: string[]; rows: { cells: string[]; mark?: "in" | "found" | "kept" | "pass" | "fail" }[]; mark?: boolean }) {
  const label: Record<string, string> = { in: "Ruled in", found: "Found", kept: "Kept", pass: "Pass", fail: "Fail" };
  return (
    <div className="td-table" role="region" aria-labelledby={id}>
      <table aria-labelledby={id}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.cells[0]} className={r.mark ?? ""}>
              {r.cells.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row" data-label={cols[0]}>
                    {mark && r.mark ? (
                      <span className={`td-mark ${r.mark}`} role="img" aria-label={label[r.mark]} />
                    ) : null}
                    {c}
                  </th>
                ) : (
                  <td key={i} data-label={cols[i]}>
                    {c}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Offer({ again }: { again?: boolean }) {
  return (
    <section className={`v4-in td-sec td-offer${again ? " again" : ""}`} aria-labelledby={again ? "offer-2" : "offer-1"}>
      <h2 className="wk-h" id={again ? "offer-2" : "offer-1"}>
        {again ? "Send me a workflow, or book a call" : "Send me one workflow that misbehaves. The fix list is free."}
      </h2>
      {again ? (
        <p className="td-p">One workflow, a written fix list, free, within 2 working days. Never a password.</p>
      ) : (
        <>
          <p className="td-p">
            Send screenshots of one GoHighLevel workflow that does something it should not: the canvas, its Settings and one execution log. I look for the
            cause and send you a written fix list like the change list above, free, within 2 working days. I take 3 a week. Screenshots are usually enough; if
            I need more, I ask for a limited user invite. Never a password. If you want me to make the change and test it too, I quote a fixed price for that
            one workflow before I start.
          </p>
          <p className="td-p">
            Blur names, emails and phone numbers before you send, or ask me to sign your NDA first. Not sure where the canvas, Settings or execution log are?
            Book the 15-minute call and I will show you on screen.
          </p>
        </>
      )}
      <div className="v4-ctas">
        <MailLink className="v4-btn v4-btn-dark" href={ASK} title="Send me a workflow">
          Send me a workflow
        </MailLink>
        <a className="v4-btn v4-btn-line" href={BOOK}>
          Book a 15-min call
        </a>
      </div>
    </section>
  );
}

const timeline: [string, string, boolean?][] = [
  ["12:21 PM", "Thanks for your enquiry (first email)"],
  ["12:24 PM", "Still thinking about your assessment? (nudge 1)"],
  ["12:25 PM", "They book an assessment"],
  ["12:25 PM", "Your private assessment is booked (confirmation)"],
  ["12:27 PM", "A time that suits you (nudge 2, after booking)", true],
  ["12:30 PM", "Our last note about your assessment (nudge 3, after booking)", true],
];

const flow = ["Tag added", "Test-contact check", "First email", "Wait", "Nudge 1", "Wait", "Nudge 2", "Wait", "Nudge 3", "Goal: booked an assessment"];

const changes = [
  [
    "Live workflow",
    "Workflows list",
    "“Enquiry follow-up (as found)” published",
    "“Enquiry follow-up (fixed)”, a duplicate with the two changes below, published; the old one set to Draft",
    "set “(fixed)” to Draft, then publish “(as found)”",
  ],
  ["Goal calendar", "Enquiry follow-up (fixed) > Goal: booked an assessment > Select calendar", "Private assessment (the old calendar)", "the new calendar (test only)", "set it back"],
  ["Stop on response", "Enquiry follow-up (fixed) > Settings", "Off", "On", "toggle off"],
  ["Contact still in the old version", "Enquiry follow-up (as found) > Enrollment history", "1 waiting for nudge 2, not booked", "taken out of the old version only", "add them back by hand; a re-add starts at the first email"],
];

const tests = [
  ["A, as found", "Enquiry, then book after nudge 1 (inside GoHighLevel)", "Shows the fault", "Nudges 2 and 3 sent after booking. Failed as found, as expected.", false],
  [
    "D, mid-sequence",
    "Still in the old version when the fix goes live, not booked",
    "Found, counted, out of the old version",
    "1 found, out of the old version at 12:32:26 PM; nothing more from it (nudge 2 was due 12:33:42 PM). Pass.",
    true,
  ],
  ["E, fixed", "Enquiry, then book after nudge 1 (inside GoHighLevel)", "Goal fires, no more nudges", "Booked about 12:38 PM; goal executed 12:38:15 PM; removed by end of workflow 12:38:17 PM; nothing after. Pass.", true],
  ["B, fixed", "Book on the public booking page", "Same as E", "Goal executed 1:24:59 PM, before nudge 1 was due; nothing sent after. Pass.", true],
  [
    "C, fixed",
    "Reply to the first email instead of booking",
    "Reply lands, nudges stop",
    "Next evening. First email 11:01 PM, reply 11:03 PM landed on the contact; nudges due about 11:04, 11:07 and 11:10 PM never sent. Pass.",
    true,
  ],
] as const;

const checked: [string, string, ("in" | "found" | "kept")?][] = [
  ["No goal step at all", "Ruled out. A goal “booked an assessment” exists."],
  ["Goal watches the wrong calendar", "Ruled in (High). The goal watches “Private assessment”; bookings arrive on the new calendar.", "in"],
  ["Where the gap came from", "The booking link in the nudges sends people to the new calendar, while the goal still watches the old one.", "in"],
  ["Goal placed where it cannot end the sequence", "Ruled out. A goal pulls the contact to it from any step once it is met."],
  ["Goal status list misses “confirmed”", "Ruled out. New and confirmed are both selected; bookings arrive as confirmed."],
  ["Booking confirmation removes the contact from the follow-up", "Not present. It sends the confirmation only, which is why it looked handled."],
  ["Stop on response off", "Ruled in (Medium), from the setting: a reply does not stop the nudges. Shown fixed in test C.", "in"],
  ["Allow re-entry on", "Kept on, on purpose: a returning patient who enquires again should get the first email again.", "kept"],
  ["Replies reach GoHighLevel", "Checked: no forwarding or reply-to override, so a reply lands in the conversation."],
  ["Another workflow also catches the booking", "Checked all 14 booking workflows: each is filtered to a calendar, and a booking on the new calendar enters none of them."],
  [
    "Other workflows still on the old calendar",
    "Found 4 (new lead, booked, showed, no-show). After a real calendar move each would go quiet too. Listed for your decision, not changed in this sample.",
    "found",
  ],
  [
    "Sender name",
    "Found: each email step is set to send as the clinic, but the emails arrive under a different name and address (Johnboydesign, as in the screenshots). Not planted: I found this while testing, and the cause is not traced yet. On a client account this is the first thing I trace and fix.",
    "found",
  ],
  ["Calendar location", "Checked: the booking calendar has its own location, not a default video link that would send patients to the wrong meeting."],
];

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
            <Link href="/#work">All work</Link>
            <a href="/John-Boy-Roxas-Resume.pdf">CV</a>
          </nav>
          <a className="v4-btn v4-btn-dark v4-nav-cta" href={BOOK}>
            Book a 15-min call
          </a>
        </div>
      </header>

      <main className="wk-page td-page">
        <section className="v4-in wk-head">
          <p className="v4-kicker">
            <Link href="/work/fixes-and-audits">Fixes and audits</Link> · Sample teardown
          </p>
          <h1>Booked, and still getting “still thinking?” emails</h1>
          <p className="v4-lede">
            A demo clinic’s enquiry follow-up kept emailing people after they had booked. Here is how I found the cause, what I changed, and the tests that
            show it stopped.
          </p>
          <dl className="td-sum">
            <div>
              <dt>Cause</dt>
              <dd>The “booked” goal watched the old calendar, so it was never met.</dd>
            </div>
            <div>
              <dt>Fix</dt>
              <dd>Goal pointed at the new calendar; Stop on response turned on.</dd>
            </div>
            <div>
              <dt>Proof</dt>
              <dd>Five timed tests: the fault shown before the fix, then four passes after it.</dd>
            </div>
          </dl>
          <p className="td-early">
            Seeing this in your own account? <a href="#who">Send me the workflow for a free fix list</a>.
          </p>
          <p className="td-frame">
            <b>Sample, not client work.</b>{" "}Lumiere Aesthetic is a made-up clinic I built inside my own GoHighLevel account. I set this workflow up broken
            on purpose, then audited, fixed and tested it like a client job.
          </p>
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">The short version</h2>
          <p className="td-p">
            The follow-up has a “booked” goal, but the goal watches the old calendar while bookings now land on the new one. So the goal is never met, and a
            person who books still gets every “still thinking?” email. I pointed the goal at the new calendar and turned on Stop on response. Tested: the next
            person who booked got no more follow-up emails (the goal fired within seconds), and the 1 contact still in the old version was found and taken out
            of it.
          </p>
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">What the person who booked saw</h2>
          <ol className="td-time">
            {timeline.map(([t, what, bad]) => (
              <li key={t + what} className={bad ? "bad" : ""}>
                <span className="td-t">{t}</span>
                <span>
                  {what}
                  {bad ? <span className="td-sr"> (sent after booking: the fault)</span> : null}
                </span>
              </li>
            ))}
          </ol>
          <p className="td-p">For a clinic this reads as pushy and careless: the person has already booked.</p>
          <p className="td-small">
            How the test was set up: the clinic moved its bookings to a new calendar, and the follow-up’s goal still watched the old one. Here the new calendar
            is a test-only copy, so my test bookings could not set off the clinic’s real booking workflows. Wait times were shortened to 3 minutes, so a full run
            takes about 10 minutes. Times are Manila time (GMT+8, shown as CST +08:00 in GoHighLevel).
          </p>
          <Shot
            src="01-as-found-thread-v2.webp"
            w={725}
            h={525}
            alt="Test contact A's email thread: first email 12:21 PM, nudge 1 12:24 PM, the booking, the confirmation 12:25 PM, then nudge 2 at 12:27 PM and nudge 3 at 12:30 PM (both outlined)."
            cap="Test contact A’s thread, as found. Booked at 12:25 PM (the “Appointment ... created” line shows the 12:30 PM slot), then two more nudges. The sender shows my account name, Johnboydesign: a separate fault I found while testing (see Sender name under What I checked)."
          />
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">The log: nudge 3 five minutes after booking</h2>
          <p className="td-p">
            Contact A booked at 12:25 PM. The execution log still shows nudge 3 going out at 12:30:46 PM. The “Removed by Goal Action” a second later is not
            the goal being met: A reached the goal step at the end of the sequence, unmet, and its “End this workflow” fallback closed the run.
          </p>
          <Shot
            src="04-as-found-log-v2.webp"
            w={807}
            h={201}
            alt="Execution log of the as-found workflow: N3 nudge executed at 12:30:46 PM (outlined), then removed by Goal Action at 12:30:47 PM."
            cap="As found: nudge 3 at 12:30:46 PM, five minutes after the booking."
          />
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">The cause: the goal watched the old calendar</h2>
          <p className="td-p td-flow-label">The workflow, as found:</p>
          <ol className="td-flow">
            {flow.map((s, i) => (
              <li key={i} className={i === flow.length - 1 ? "goal" : s === "Wait" ? "wait" : ""}>
                {s}
              </li>
            ))}
          </ol>
          <p className="td-p">
            The goal step was there, with the right statuses. It was watching the old calendar, while the booking link in the nudges sends people to the new
            one. That is how the gap opened.
          </p>
          <div className="td-pair">
            <Shot src="05-goal-before-v2.webp" w={438} h={364} alt="Goal settings before: Select calendar is Private assessment (outlined); if the goal is not met, End this workflow." cap="Before: the goal watches “Private assessment”, the old calendar." />
            <Shot
              src="07-goal-after-v2.webp"
              w={438}
              h={364}
              alt="Goal settings after: Select calendar is DEMO Teardown · Private assessment (test only) (outlined)."
              cap="After: the new calendar, where the booking link sends people (here the test-only copy)."
            />
          </div>
          <Shot src="06-settings-before-v2.webp" w={640} h={50} alt="Workflow settings before: the Stop on response toggle is off (outlined)." cap="Before: Stop on response off, so a reply would not stop the nudges." />
          <Shot src="08-settings-after-v2.webp" w={640} h={50} alt="Workflow settings after: the Stop on response toggle is on (outlined)." cap="After: Stop on response on." />

        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h" id="h-changes">
            What I changed, and how to undo it
          </h2>
          <p className="td-p">Every change, where it is, and how to undo it. Nothing deleted.</p>
          <Table id="h-changes" cols={["What", "Where in GoHighLevel", "Before", "After", "How to undo"]} rows={changes.map((c) => ({ cells: c }))} />
          <p className="td-small">
            For a client I would usually edit the live workflow in place, after saving a Draft copy as the backup, so contacts already inside keep their timing
            and anything that points at the workflow keeps working. Here I duplicated it so the broken version stays on show.
          </p>
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h" id="h-tests">
            Five tests: the fault, then four passes
          </h2>
          <p className="td-result">Result: the fault showed on A as found; D, E, B and C all passed after the fix.</p>
          <p className="td-small">Letters match my test log, in the order the tests ran.</p>
          <Table
            id="h-tests"
            mark
            cols={["Test", "Setup", "Expected", "Result"]}
            rows={tests.map(([t, s, e, r, pass]) => ({ cells: [t, s, e, r], mark: pass ? "pass" : "fail" }))}
          />
          <Shot
            src="03-fixed-log-test-e-v2.webp"
            w={807}
            h={201}
            alt="Fixed workflow log, test E: goal executed 12:38:15 PM, then removed by end of workflow at 12:38:17 PM. The goal row is outlined."
            cap="Test E: the goal fires seconds after the booking, and the workflow ends."
          />
          <Shot
            src="10-fixed-log-test-b-v2.webp"
            w={807}
            h={201}
            alt="Fixed workflow log, test B: goal executed 1:24:59 PM after a booking on the public page, removed by end of workflow at 1:25:00 PM. The goal row is outlined."
            cap="Test B: a booking on the public page ends it before nudge 1."
          />
          <Shot src="09-fixed-thread-test-e-v2.webp" w={740} h={375} alt="Test contact E's thread: one nudge, the booking, the confirmation, and nothing after." cap="Test E’s thread: nothing after the confirmation." />
          <Shot
            src="11-fixed-thread-test-c-v2.webp"
            w={728}
            h={128}
            alt="Test contact C's thread, second try: the reply at 11:03 PM, and nothing after it."
            cap="Test C, second try (the next evening): the reply at 11:03 PM lands on the contact and the workflow ends; no nudge followed by 11:10 PM. Reply address masked."
          />
          <p className="td-note">
            <b>Worth knowing:</b>{" "}a reply only stops the nudges when it comes from the address the contact is saved under. In the first try of test C the
            reply came from a different address, GoHighLevel filed it on another contact, and the nudges kept going. Check this with any client whose customers
            reply from a second inbox. Stop on response can also fire on an auto-reply such as an out-of-office, so an away message can end the follow-up too.
          </p>
        </section>

        <section className="v4-in td-sec" aria-labelledby="who">
          <h2 className="wk-h" id="who">
            Who did the work
          </h2>
          <p className="td-p td-who">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/intro/face-chip.webp" alt="John Boy Roxas" width={48} height={48} />
            John Boy Roxas, HighLevel certified. I am in the Philippines (GMT+8) and work part-time, 4 to 6 hours a day, in Australian business hours, UK
            afternoons or US mornings. <a href="/#intro">Watch my 1:21 intro</a>.
          </p>
        </section>

        <Offer />

        <div className="v4-in td-full">
          <p className="v4-kicker">The full write-up</p>
          <p className="td-p">Everything I checked, the contacts the fix touched, and what you get when I make the fix.</p>
        </div>

        <section className="v4-in td-sec">
          <h2 className="wk-h" id="h-checked">
            What I checked
          </h2>
          <Table id="h-checked" mark cols={["Possible cause or risk", "Result"]} rows={checked.map(([c, r, k]) => ({ cells: [c, r], mark: k }))} />
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">Contacts already in the old version</h2>
          <p className="td-p">
            Fixing the workflow is half the job. Before switching over, I opened the old version’s Enrollment history: 1 test contact, D, was still waiting,
            with nudge 2 due at 12:33:42 PM, and had not booked. I took D out of the old version only, at 12:32 PM, so the old version could not email D again. Nudge 2 never
            went out.
          </p>
          <Shot
            src="02-enrollment-before-fix-v2.webp"
            w={889}
            h={110}
            alt="Enrollment history of the old workflow: test contact D (outlined) waiting for time, next execution 12:33:42 PM."
            cap="The old version at 12:32 PM: contact D still waiting."
          />
          <p className="td-p">In this sample that is two test contacts. On a live clinic this is the list the owner needs most:</p>
          <ul className="td-list">
            <li>Already through the sequence: 1, contact A (got every nudge; an apology email is optional).</li>
            <li>
              Still in the old version when the fix went live: 1, contact D, not booked, taken out of the old version only. On a client account, where I fix the
              live workflow in place, an unbooked contact like D just carries on. Anyone who has already booked is taken out.
            </li>
            <li>Total enrolled before the fix: 2.</li>
          </ul>
        </section>

        <section className="v4-in td-sec">
          <h2 className="wk-h">What you also get when I make the fix</h2>
          <ul className="td-list">
            <li>
              <b>Needs your decision:</b>
              <ul className="td-sublist">
                <li>Real wait times. I would suggest nudges on day 2, 4 and 7.</li>
                <li>Whether a reply should also alert the owner.</li>
                <li>Whether the booking confirmation should also remove the contact (one step, left out so the test proves the goal alone).</li>
                <li>Pointing the goal at every calendar the nudges can send people to, so the next new calendar does not break it again.</li>
                <li>The 4 other workflows still on the old calendar.</li>
                <li>Whether someone who books and then cancels should go back into the follow-up.</li>
                <li>An apology for the 1 person nudged after booking.</li>
              </ul>
            </li>
            <li>
              <b>A 7-day re-check:</b>{" "}on day 7 I open Enrollment history and the execution logs, check that everyone who booked shows “Goal executed” and
              no nudge after their booking, and send you the result in two lines.
            </li>
            <li>
              <b>White label:</b>{" "}the write-up can go to your client under your agency’s name. I do not need to be named.
            </li>
          </ul>
        </section>

        <Offer again />
      </main>
    </div>
  );
}
