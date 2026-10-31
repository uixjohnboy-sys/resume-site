"use client";

// If anything in the demo fails to render, offer a clean restart instead of a
// blank page: forget this browser's demo id and load a fresh sandbox.
export default function TaplineError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f6f8", fontFamily: "system-ui, sans-serif", color: "#0f1b2d", padding: 24 }}>
      <div style={{ maxWidth: 420, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}>This demo hit a problem</h1>
        <p style={{ margin: "0 0 16px", color: "#3b4a5f" }}>Your demo data may be out of date. Start a fresh copy and carry on.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem("tapline-sb");
              } catch {}
              window.location.href = "/demo/tapline";
            }}
            style={{ minHeight: 40, padding: "0 16px", borderRadius: 8, border: 0, background: "#0f766e", color: "#fff", fontWeight: 600, cursor: "pointer" }}
          >
            Start a fresh demo
          </button>
          <button type="button" onClick={reset} style={{ minHeight: 40, padding: "0 16px", borderRadius: 8, border: "1px solid #6b7789", background: "#fff", color: "#0f1b2d", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
