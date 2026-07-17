import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "Johnboy Roxas: GoHighLevel Specialist & AI Automation Expert";
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
          alignItems: "center",
          background: "#141311",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(239,159,39,0.35), transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: "0 80px",
            gap: 64,
          }}
        >
          <img
            src={photoSrc}
            width={340}
            height={340}
            style={{
              borderRadius: 32,
              objectFit: "cover",
              border: "4px solid rgba(239,159,39,0.45)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#F2F1EE", lineHeight: 1.05 }}>
              Johnboy Roxas
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 600,
                marginTop: 16,
                backgroundImage: "linear-gradient(135deg, #EF9F27, #D85A30)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              GoHighLevel Specialist & AI Automation Expert
            </div>
            <div style={{ display: "flex", fontSize: 26, color: "#B0AEA4", marginTop: 20, maxWidth: 620 }}>
              Automating businesses with Claude, n8n, and Zapier.
            </div>
            <div style={{ display: "flex", fontSize: 22, color: "#6B6960", marginTop: 40 }}>
              johnboydesign.com
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
