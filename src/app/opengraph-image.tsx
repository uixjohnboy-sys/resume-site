import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

// Social share card, matching the site: black and white, his portrait, one plain promise.

export const runtime = "nodejs";
export const alt = "John Boy Roxas · GoHighLevel Specialist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const photoBuffer = readFileSync(join(process.cwd(), "public", "jb-portrait.png"));
  const photoSrc = `data:image/png;base64,${photoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff", color: "#0a0a0a", fontFamily: "sans-serif" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px" }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 600 }}>John Boy Roxas</div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 62, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1 }}>GoHighLevel builds and fixes for agencies and small businesses.</div>
          <div style={{ display: "flex", marginTop: 32, paddingTop: 24, borderTop: "2px solid #0a0a0a", fontSize: 26, color: "#404040" }}>Automation · API integrations · Custom apps</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoSrc} width={630} height={630} alt="" />
      </div>
    ),
    { ...size },
  );
}
