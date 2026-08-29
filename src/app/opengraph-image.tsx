import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

// Social share card, matching the neon design system in home.css:
// near-black ink, #D5FE38 accent, mono data strip along the bottom.

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
          background: "#0C0D0A",
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
              "linear-gradient(#2C3021 1px, transparent 1px), linear-gradient(90deg, #2C3021 1px, transparent 1px)",
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
            background: "radial-gradient(circle, rgba(213,254,56,0.22), transparent 70%)",
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
              color: "#D5FE38",
              fontSize: 22,
              letterSpacing: 4,
              marginBottom: 26,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 12, background: "#D5FE38", display: "flex" }} />
            JB·ROXAS
          </div>
          <div
            style={{
              color: "#F4F2ED",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>I build the systems</span>
            <span style={{ color: "#D5FE38" }}>GoHighLevel</span>
            <span>can&apos;t build alone.</span>
          </div>
          <div style={{ display: "flex", gap: 26, marginTop: 40, color: "#8F9482", fontSize: 24 }}>
            <span style={{ color: "#D5FE38" }}>58 builds</span>
            <span>·</span>
            <span style={{ color: "#D5FE38" }}>5 years</span>
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
            borderTop: "2px solid #D5FE38",
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
