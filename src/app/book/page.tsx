"use client";

import Link from "next/link";
import Script from "next/script";
import { IconArrowLeft } from "@tabler/icons-react";

export default function BookPage() {
  return (
    <div
      className="min-h-screen w-full overflow-y-auto px-4 py-6 lg:h-screen lg:px-10 lg:py-10"
      style={{ background: "var(--bg-page)" }}
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
            Book a Discovery Call
          </h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Pick a time that works for you and let&apos;s talk about your GoHighLevel setup and automation needs.
          </p>
        </div>

        <div
          className="overflow-hidden rounded-[24px] p-2 lg:p-3"
          style={{
            background: "linear-gradient(90deg, var(--accent), var(--accent-deep))",
            boxShadow: "0 20px 50px rgba(31,29,25,0.18), 0 8px 20px rgba(31,29,25,0.12)",
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
