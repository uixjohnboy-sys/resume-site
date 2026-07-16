import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "Johnboy Roxas — GoHighLevel Specialist & AI Automation Expert";
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
          background: "#FAF9F5",
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
            background: "radial-gradient(circle, rgba(31,29,25,0.06), transparent 70%)",
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
              border: "4px solid #C9C6BD",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#1F1D19", lineHeight: 1.05 }}>
              Johnboy Roxas
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 600,
                marginTop: 16,
                backgroundImage: "linear-gradient(90deg, #1A1A1A, #000000)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              GoHighLevel Specialist & AI Automation Expert
            </div>
            <div style={{ display: "flex", fontSize: 26, color: "#4A473F", marginTop: 20, maxWidth: 620 }}>
              Automating businesses with Claude, n8n, and Zapier.
            </div>
            <div style={{ display: "flex", fontSize: 22, color: "#8A8578", marginTop: 40 }}>
              johnboydesign.com
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
