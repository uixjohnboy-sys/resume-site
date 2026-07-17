"use client";

import Link from "next/link";
import Script from "next/script";
import {
  IconArrowLeft,
  IconPlayerPlayFilled,
  IconClock,
  IconCurrencyDollar,
  IconChecklist,
  IconListNumbers,
  IconHelpCircle,
  IconFlame,
} from "@tabler/icons-react";
import { useAvailability } from "@/lib/useAvailability";

const complexBuilds = [
  "Scalable GoHighLevel infrastructure that lets agencies onboard unlimited clients with zero technical friction.",
  "Always-on multi-channel nurture automations across SMS, email, and voicemail drop, with A2P 10DLC compliance for deliverability.",
  "End-to-end lead tracking system from first click to close, so no opportunity slips through.",
  "Automated booking system with calendar sync, reminders, and cancellation handling.",
  "Full GHL account migrations and SaaS-mode/snapshot setup for scaling agencies.",
];

const nextSteps = [
  { title: "Discovery Call", description: "We talk through what you need, your current setup, and whether it's a good fit." },
  { title: "Proposal", description: "You get a clear scope, timeline, and rate for the work, no surprises." },
  { title: "Kickoff", description: "We start building, with regular updates so you always know where things stand." },
];

const faqs = [
  {
    q: "What if I'm not sure GoHighLevel is the right fit for my business?",
    a: "That's exactly what the discovery call is for. We'll walk through your current setup together and I'll tell you honestly if GHL is the right tool, no pressure either way.",
  },
  {
    q: "Do you sign NDAs or confidentiality agreements?",
    a: "Yes, happy to sign an NDA before we dive into any specifics about your business.",
  },
  {
    q: "What if the project takes longer than expected?",
    a: "I always scope the work upfront and flag early if timelines shift, so there are no surprises on your end.",
  },
  {
    q: "Can I hire you for a one-off task instead of an ongoing engagement?",
    a: "Yes, hourly work is available for smaller, one-off builds. Monthly retainers are for clients who want ongoing support.",
  },
];

export default function BookPage() {
  const available = useAvailability();

  return (
    <div
      className="min-h-screen w-full overflow-y-auto px-4 py-6 lg:h-screen lg:px-10 lg:py-10"
      style={{ background: "var(--bg-page, #1A1917)" }}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
          style={{ color: "var(--text-tertiary)" }}
        >
          <IconArrowLeft size={14} />
          Back to portfolio
        </Link>

        <div>
          <h1 className="text-2xl font-medium lg:text-3xl" style={{ color: "var(--text-primary)" }}>
            Client Intake
          </h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            A quick intro, the essentials clients usually ask about, and a calendar to lock in a call, all in one place.
          </p>
        </div>

        {/* Video intro */}
        <div
          className="flex flex-col items-center justify-center rounded-[24px] px-6 py-10 text-center"
          style={{ background: "var(--bg-surface)", boxShadow: "var(--surface-shadow)" }}
        >
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span className="pulse-ring absolute inline-flex h-full w-full rounded-full" style={{ background: "#EF9F27" }} />
            <span
              className="relative flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "#EF9F27", boxShadow: "0 0 20px 4px rgba(239,159,39,0.5)" }}
            >
              <IconPlayerPlayFilled size={22} style={{ color: "var(--btn-text-on-gradient)" }} />
            </span>
          </span>
          <p className="mt-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            3-Minute Intro
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Video upload soon
          </p>
        </div>

        {/* Work details */}
        <div
          className="rounded-[24px] p-5 lg:p-6"
          style={{ background: "var(--bg-surface)", boxShadow: "var(--surface-shadow)" }}
        >
          <p className="mb-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Before We Talk: the Quick Answers
          </p>

          <div className="flex flex-col gap-3">
            <div className="rounded-[16px] p-4" style={{ background: "var(--bg-surface-2)" }}>
              <div className="mb-2.5 flex items-center gap-2">
                <div
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px]"
                  style={{ background: "linear-gradient(135deg, #EF9F27, #D85A30)", color: "var(--btn-text-on-gradient)" }}
                >
                  <IconClock size={16} />
                </div>
                <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Availability
                </p>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--text-primary)" }}>Part-time, 4 hours a day</span>, starting at 8 AM in
                your timezone, whether you&apos;re working with me from the US or Australia.
              </p>
              <p className="mt-2.5 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                I keep my schedule{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  flexible
                </span>{" "}
                and adjust it regularly to match what a project actually needs, whether that means shifting hours
                around a{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  launch date
                </span>
                , a{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  live event
                </span>
                , or an{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  urgent request
                </span>
                . If you need me outside my usual window, just let me know and I&apos;ll make it work.
              </p>
            </div>

            <div className="rounded-[16px] p-4" style={{ background: "var(--bg-surface-2)" }}>
              <div className="mb-2.5 flex items-center gap-2">
                <div
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px]"
                  style={{ background: "linear-gradient(135deg, #EF9F27, #D85A30)", color: "var(--btn-text-on-gradient)" }}
                >
                  <IconCurrencyDollar size={16} />
                </div>
                <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Proposed Rate
                </p>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                I charge{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  $10 per hour
                </span>
                , depending on project scope. You can hire me on an <span style={{ color: "var(--text-primary)" }}>hourly</span>{" "}
                or <span style={{ color: "var(--text-primary)" }}>monthly</span> basis, monthly clients are billed{" "}
                <span style={{ color: "var(--text-primary)" }}>fortnightly</span> rather than all at once.
              </p>
              <p className="mt-2.5 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Payment goes through{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Wise
                </span>
                , it&apos;s the easiest way for clients anywhere to send payment directly.
              </p>
              <p className="mt-2.5 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Why this rate? Because the work doesn&apos;t stop once something is built. I set up a proper{" "}
                <span style={{ color: "var(--text-primary)" }}>client handover</span>, stay on for{" "}
                <span style={{ color: "var(--text-primary)" }}>ongoing support</span>, and make sure you fully understand
                what was built for you. You won&apos;t be left with a system you don&apos;t know how to run.
              </p>
              <p className="mt-2.5 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                I&apos;m also not a typical Virtual Assistant. I work as a{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  strategist
                </span>
                , someone who can look at your business and help figure out what should actually get built, not just
                execute a list of tasks.
              </p>
            </div>

            <div className="rounded-[16px] p-4" style={{ background: "var(--bg-surface-2)" }}>
              <div className="mb-2.5 flex items-center gap-2">
                <div
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px]"
                  style={{ background: "linear-gradient(135deg, #EF9F27, #D85A30)", color: "var(--btn-text-on-gradient)" }}
                >
                  <IconChecklist size={16} />
                </div>
                <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Most Complex Systems Built
                </p>
              </div>
              <ul className="list-disc space-y-1.5 pl-8 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {complexBuilds.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-[16px] p-4" style={{ background: "var(--bg-surface-2)" }}>
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px]"
                  style={{ background: "linear-gradient(135deg, #EF9F27, #D85A30)", color: "var(--btn-text-on-gradient)" }}
                >
                  <IconListNumbers size={16} />
                </div>
                <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  What Happens After You Book
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {nextSteps.map((step, i) => (
                  <div key={step.title} className="flex items-start gap-3">
                    <div
                      className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-medium"
                      style={{
                        background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                        color: "var(--btn-text-on-gradient)",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] p-4" style={{ background: "var(--bg-surface-2)" }}>
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px]"
                  style={{ background: "linear-gradient(135deg, #EF9F27, #D85A30)", color: "var(--btn-text-on-gradient)" }}
                >
                  <IconHelpCircle size={16} />
                </div>
                <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Common Questions
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {faqs.map((item) => (
                  <div key={item.q}>
                    <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                      {item.q}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {available === true && (
          <div
            className="flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-center text-xs font-medium"
            style={{
              background: "linear-gradient(135deg, rgba(239,159,39,0.16), rgba(216,90,48,0.07))",
              border: "1px solid rgba(239,159,39,0.28)",
              color: "var(--text-primary)",
            }}
          >
            <IconFlame size={14} style={{ color: "#EF9F27" }} />
            Currently accepting 1 new client this month
          </div>
        )}

        {/* Booking calendar */}
        <div
          className="overflow-hidden rounded-[24px] p-2 lg:p-3"
          style={{
            background: "linear-gradient(160deg, #FFC15E 0%, #EF9F27 28%, #D85A30 58%, #8A1F0C 100%)",
            boxShadow: "0 0 50px rgba(216,90,48,0.45), 0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          <iframe
            src="https://link.funnelgenie.io/widget/booking/LOYqIv9mae8XbBhBarr5"
            style={{ width: "100%", border: "none", overflow: "auto", minHeight: "1200px", borderRadius: "18px" }}
            scrolling="yes"
            id="LOYqIv9mae8XbBhBarr5_1"
          />
        </div>
      </div>

      <Script src="https://link.funnelgenie.io/js/form_embed.js" strategy="afterInteractive" />
    </div>
  );
}
