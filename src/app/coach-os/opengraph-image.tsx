import { ImageResponse } from "next/og";

// Share card for the case study. Without this the route inherits nothing
// and LinkedIn refuses to preview the link at all, which is exactly where
// this page gets shared most. Numbers only, no portrait: the point of the
// card is that the build is real and countable.

export const runtime = "nodejs";
export const alt = "Coach OS case study by John Boy Roxas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const stats = [
  ["29,474", "lines of code"],
  ["24", "GHL webhook events"],
  ["83", "automated emails"],
  ["8", "scheduled jobs"],
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0C0D0A",
          position: "relative",
          padding: "0 72px",
          fontFamily: "sans-serif",
        }}
      >
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
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -100,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(213,254,56,0.2), transparent 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#D5FE38", fontSize: 21, letterSpacing: 4 }}>
          <div style={{ width: 11, height: 11, borderRadius: 11, background: "#D5FE38", display: "flex" }} />
          CASE STUDY · JOHNBOY ROXAS
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "#F4F2ED",
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: -2.5,
            marginTop: 26,
          }}
        >
          <span>Coach OS: the client platform</span>
          <span>
            <span style={{ color: "#D5FE38" }}>GoHighLevel</span> can&apos;t build alone.
          </span>
        </div>

        <div style={{ display: "flex", gap: 52, marginTop: 46 }}>
          {stats.map(([v, l]) => (
            <div key={l} style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#D5FE38", fontSize: 40, fontWeight: 700 }}>{v}</span>
              <span style={{ color: "#8F9482", fontSize: 20, marginTop: 4 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
