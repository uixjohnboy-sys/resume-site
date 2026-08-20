import type { Metadata } from "next";
import Script from "next/script";
import {
  IconClock,
  IconDeviceLaptop,
  IconChartHistogram,
  IconRepeat,
} from "@tabler/icons-react";

// Booking page for the Coach OS Walkthrough. Lives here rather than on a
// FunnelGenie domain because www.johnboydesign.com already points at this
// Vercel project, so the funnel's own copy of this URL could never be
// reached. Same calendar underneath, embedded the same way /book does it.
const CALENDAR_ID = "cxCgIJSmtS5KkJDt4D6k";
const FIT_ASSESSMENT_URL = "https://coachos.johnboydesign.com/fit-assessment";

// Coach OS brand green. Deliberately NOT the site's amber: this page
// represents the product, not the portfolio, so it carries the product's
// own colour. Kept in one place so a brand change is a one-line edit.
const BRAND = "#D5FE38";
const BRAND_ON = "#1A2200";
const BRAND_GRADIENT = "linear-gradient(135deg, #EAFF7A 0%, #D5FE38 45%, #A8CC22 100%)";
const BRAND_FRAME = "linear-gradient(160deg, #EAFF7A 0%, #D5FE38 28%, #A8CC22 58%, #4A5E0A 100%)";
const BRAND_GLOW = "0 0 50px rgba(213,254,56,0.30), 0 20px 40px rgba(0,0,0,0.45)";

const INTRO_COLD =
  "This is not a sales call. It is a walkthrough. In 45 minutes you will watch one coaching client's entire first year happen inside the system, from the moment they land on a lead tool through payment, a signed agreement, and the weekly accountability that runs without you lifting a finger. Then I show you the same thing with your own packages in it.";

const INTRO_ASSESSED =
  "Your assessment is in and I have already read it. Pick a time below and I will walk you through what it found, then show you one coaching client's entire first year running inside the system, with your own packages in it.";

const title = "Coach OS Walkthrough with John Boy";
const description =
  "Watch one coaching client's entire first year run inside Coach OS, then see the same system with your own packages in it. 45 minutes, not a sales call.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://www.johnboydesign.com/coach-os-walkthrough" },
  openGraph: {
    title,
    description,
    url: "https://www.johnboydesign.com/coach-os-walkthrough",
    siteName: "Johnboy Roxas",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

const watchFor = [
  {
    icon: IconDeviceLaptop,
    title: "A lead arriving at 11pm, handled",
    body: "Someone lands on a diagnostic, answers sixteen questions, and gets a paragraph written about their own situation. You are asleep. On your side they are already a contact with a zone, a summary, and a tag.",
  },
  {
    icon: IconRepeat,
    title: "The week between sessions",
    body: "One commitment your client named, held at the top of their portal all week, referenced by name by the AI, and asked about at their check-in. Then the same thing from your side: a brief you never wrote, waiting before the call.",
  },
  {
    icon: IconChartHistogram,
    title: "Proof you can hand someone",
    body: "Twelve months of check-ins turned into one branded page of real numbers. The answer to the question that ends careers: does this actually work.",
  },
];

export default async function CoachOsWalkthroughPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Someone arriving straight from the Fit Assessment has just done the one
  // thing this page would otherwise tell them to do first. Sending them back
  // to that instruction reads as a loop, and as a system that was not paying
  // attention. So the page drops the section and acknowledges them instead.
  const assessed = (await searchParams).assessed === "1";

  return (
    <div
      className="min-h-screen w-full overflow-y-auto px-4 py-6 lg:px-10 lg:py-10"
      style={{ background: "var(--bg-page, #1A1917)" }}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {/* No back link on purpose. Prospects land here cold from a DM and
            the page has exactly one job; a route back to the portfolio is
            an exit ramp, not navigation. */}

        {/* Header */}
        <header className="flex flex-col gap-4">
          <span
            className="text-xs font-medium uppercase tracking-[0.18em]"
            style={{ color: BRAND }}
          >
            Coach OS
          </span>
          <h1
            className="text-3xl leading-tight font-semibold lg:text-4xl"
            style={{ color: "var(--text-primary)" }}
          >
            See your coaching practice running inside Coach OS.
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {assessed ? INTRO_ASSESSED : INTRO_COLD}
          </p>
          <div
            className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-surface)",
              color: "var(--text-primary)",
            }}
          >
            <IconClock size={14} style={{ color: BRAND }} />
            45 minutes, and nothing to prepare
          </div>
        </header>

        {/* What you will watch */}
        <section className="flex flex-col gap-3">
          {watchFor.map(({ icon: Icon, title: t, body }) => (
            <div
              key={t}
              className="flex gap-4 rounded-[18px] p-5"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-surface)",
              }}
            >
              <Icon size={20} className="mt-0.5 shrink-0" style={{ color: BRAND }} />
              <div className="flex flex-col gap-1.5">
                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  {t}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {body}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Fit Assessment, hidden for anyone who just came from it */}
        {!assessed && (
        <section
          className="flex flex-col gap-3 rounded-[18px] p-5"
          style={{
            background: "var(--bg-surface)",
            border: `1px solid ${BRAND}`,
          }}
        >
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Do this first, it takes four minutes
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            It is not a form. It shows you your own packages in the checkout your clients would
            see, an honest read of what you already do well versus what Coach OS would formalize,
            and a build list that comes out of your own answers. I use what you write there to
            build part of what I show you on the call.
          </p>
          <a
            href={FIT_ASSESSMENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: BRAND_GRADIENT,
              color: BRAND_ON,
            }}
          >
            See your practice inside Coach OS
          </a>
        </section>
        )}

        {/* Booking calendar */}
        <div
          id="book"
          className="overflow-hidden rounded-[24px] p-2 lg:p-3"
          style={{
            background:
              BRAND_FRAME,
            boxShadow: BRAND_GLOW,
          }}
        >
          <iframe
            src={`https://link.funnelgenie.io/widget/booking/${CALENDAR_ID}`}
            title="Book a Coach OS Walkthrough"
            style={{
              width: "100%",
              border: "none",
              overflow: "auto",
              minHeight: "1200px",
              borderRadius: "18px",
            }}
            scrolling="yes"
            id={`${CALENDAR_ID}_1`}
          />
        </div>

        <p className="text-sm leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          Built for coaches who already have paying clients and are tired of being the system
          that holds it all together. If you are still finding your first client, this is
          probably early, and I will tell you that honestly on the call rather than sell you
          something you cannot use yet.
        </p>
      </div>

      <Script src="https://link.funnelgenie.io/js/form_embed.js" strategy="afterInteractive" />
    </div>
  );
}
