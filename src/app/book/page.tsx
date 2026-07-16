"use client";

import Link from "next/link";
import Script from "next/script";
import {
  IconArrowLeft,
  IconPlayerPlayFilled,
  IconClock,
  IconCurrencyDollar,
  IconChecklist,
} from "@tabler/icons-react";

const complexBuilds = [
  "Scalable GoHighLevel infrastructure that lets agencies onboard unlimited clients with zero technical friction.",
  "Always-on multi-channel nurture automations across SMS, email, and voicemail drop, with A2P 10DLC compliance for deliverability.",
  "End-to-end lead tracking system from first click to close, so no opportunity slips through.",
  "Automated booking system with calendar sync, reminders, and cancellation handling.",
  "Full GHL account migrations and SaaS-mode/snapshot setup for scaling agencies.",
];

export default function BookPage() {
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
            A quick intro, the essentials clients usually ask about, and a calendar to lock in a call — all in one place.
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
            Before We Talk — the Quick Answers
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div
              className="flex items-start gap-3 rounded-[16px] p-4"
              style={{ background: "var(--bg-surface-2)" }}
            >
              <div
                className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px]"
                style={{ background: "linear-gradient(135deg, #EF9F27, #D85A30)", color: "var(--btn-text-on-gradient)" }}
              >
                <IconClock size={16} />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Availability
                </p>
                <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-primary)" }}>
                  Part-time — 4 hours/day
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  Flexible schedule to match your timezone
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-3 rounded-[16px] p-4"
              style={{ background: "var(--bg-surface-2)" }}
            >
              <div
                className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px]"
                style={{ background: "linear-gradient(135deg, #EF9F27, #D85A30)", color: "var(--btn-text-on-gradient)" }}
              >
                <IconCurrencyDollar size={16} />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Proposed Rate
                </p>
                <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-primary)" }}>
                  $10 / hour
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  Open to discuss based on project scope
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[16px] p-4" style={{ background: "var(--bg-surface-2)" }}>
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
        </div>

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
            style={{ width: "100%", border: "none", overflow: "hidden", minHeight: "950px", borderRadius: "18px" }}
            scrolling="no"
            id="LOYqIv9mae8XbBhBarr5_1"
          />
        </div>
      </div>

      <Script src="https://link.funnelgenie.io/js/form_embed.js" strategy="afterInteractive" />
    </div>
  );
}
