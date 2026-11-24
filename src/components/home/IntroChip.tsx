"use client";

// A face and a "watch" prompt on the first screen (hiring review 2026-11-24: no face or video above the fold).
// Clicking scrolls to the intro section and starts the video with sound, since the visitor asked for it.
export default function IntroChip({ length }: { length: string }) {
  const go = () => {
    const sec = document.getElementById("intro");
    if (!sec) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sec.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    window.setTimeout(() => {
      const start = sec.querySelector<HTMLButtonElement>(".ip-start");
      if (start) start.click();
      else sec.querySelector("video")?.play().catch(() => {});
    }, reduce ? 0 : 650);
  };

  return (
    <button type="button" className="ic-chip" onClick={go} aria-label={`Watch my intro video, ${length}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/intro/face-chip.webp" alt="" width={40} height={40} />
      <span className="ic-play" aria-hidden="true" />
      <span className="ic-text">Watch my intro · {length}</span>
    </button>
  );
}
