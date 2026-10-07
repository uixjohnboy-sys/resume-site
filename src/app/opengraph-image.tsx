import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

// Social share card, matching the homepage (amber accent on violet ink):
// near-black ink, amber accent, mono data strip along the bottom.

export const runtime = "nodejs";
export const alt = "John Boy Roxas · GoHighLevel Systems Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const photoBuffer = readFileSync(join(process.cwd(), "public", "johnboy.png"));
  const photoSrc = `data:image/png;base64,${photoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#07070B",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* faint blueprint grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(#1C1A2A 1px, transparent 1px), linear-gradient(90deg, #1C1A2A 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.35,
          }}
        />
        {/* neon glow behind the portrait */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -60,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(91,33,214,0.45), transparent 70%)",
            display: "flex",
          }}
        />

        {/* left: copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 0 0 72px",
            width: 760,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#FFB224",
              fontSize: 22,
              letterSpacing: 4,
              marginBottom: 26,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 12, background: "#FFB224", display: "flex" }} />
            JB·ROXAS
          </div>
          <div
            style={{
              color: "#F2F0EA",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>GoHighLevel specialist.</span>
            <span>And the part that</span>
            <span style={{ display: "flex", gap: 16 }}>
              <span style={{ color: "#FFB224" }}>leaves</span>
              <span>GoHighLevel.</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 26, marginTop: 40, color: "#8A8698", fontSize: 24 }}>
            <span style={{ color: "#FFB224" }}>58 builds</span>
            <span>·</span>
            <span style={{ color: "#FFB224" }}>5 years</span>
            <span>·</span>
            <span>GHL + custom code + AI</span>
          </div>
        </div>

        {/* right: portrait */}
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: 0,
            width: 360,
            height: 520,
            display: "flex",
            borderTop: "2px solid #FFB224",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoSrc}
            alt=""
            width={360}
            height={520}
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
