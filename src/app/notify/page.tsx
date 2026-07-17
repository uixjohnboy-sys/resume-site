"use client";

import Link from "next/link";
import Script from "next/script";
import { IconArrowLeft } from "@tabler/icons-react";

export default function NotifyPage() {
  return (
    <div
      className="min-h-screen w-full overflow-y-auto px-4 py-6 lg:h-screen lg:px-10 lg:py-10"
      style={{ background: "var(--bg-page, #1A1917)" }}
    >
      <div className="mx-auto flex max-w-lg flex-col gap-5">
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
            Get Notified
          </h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            I&apos;m fully loaded with client projects right now. Leave your details and I&apos;ll reach out the moment a slot opens up.
          </p>
        </div>

        <div
          className="overflow-hidden rounded-[24px] p-2 lg:p-3"
          style={{
            background: "linear-gradient(160deg, #FFC15E 0%, #EF9F27 28%, #D85A30 58%, #8A1F0C 100%)",
            boxShadow: "0 0 50px rgba(216,90,48,0.45), 0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          <iframe
            src="https://link.funnelgenie.io/widget/form/ysww0QPa32S2Kp4BtlLI"
            style={{ width: "100%", border: "none", overflow: "auto", minHeight: "620px", borderRadius: "18px" }}
            scrolling="yes"
            id="ysww0QPa32S2Kp4BtlLI"
          />
        </div>
      </div>

      <Script src="https://link.funnelgenie.io/js/form_embed.js" strategy="afterInteractive" />
    </div>
  );
}
