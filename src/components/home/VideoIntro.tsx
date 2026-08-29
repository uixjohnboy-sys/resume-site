"use client";

// The hero's video-intro frame. Employers on OLJ and Upwork routinely ask
// for a 1-2 minute intro video, so the slot is a first-class part of the
// hero rather than an afterthought. Until a real file exists at
// /public/intro.mp4 the frame shows the portrait as a poster; the play
// button then explains itself instead of pretending to play something.

import { useRef, useState } from "react";

const VIDEO_SRC = "/intro.mp4";

export default function VideoIntro() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mode, setMode] = useState<"poster" | "playing" | "missing">("poster");

  function play() {
    const el = videoRef.current;
    if (!el) return;
    el.play()
      .then(() => setMode("playing"))
      .catch(() => setMode("missing"));
  }

  return (
    <div className="jb-video">
      <div className="jb-video-frame">
        <span className="jb-tick tl" aria-hidden="true" />
        <span className="jb-tick tr" aria-hidden="true" />
        <span className="jb-tick bl" aria-hidden="true" />
        <span className="jb-tick br" aria-hidden="true" />

        <span className="jb-video-tag">Intro · 90 sec</span>

        {/* Poster portrait sits under the video element; the video only
            covers it once it actually plays. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/johnboy.png" alt="John Boy Roxas" />
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          playsInline
          controls={mode === "playing"}
          preload="none"
          onEnded={() => setMode("poster")}
          onError={() => setMode("missing")}
          style={{ opacity: mode === "playing" ? 1 : 0, zIndex: mode === "playing" ? 4 : 0 }}
        />

        {mode !== "playing" && <div className="jb-video-shade" aria-hidden="true" />}

        {mode !== "playing" && (
          <div className="jb-video-meta">
            <div>
              <div className="jb-video-name">John Boy Roxas</div>
              <div className="jb-video-role">
                {mode === "missing" ? "Video intro recording soon" : "GoHighLevel Systems Builder"}
              </div>
            </div>
            <button className="jb-play" onClick={play} aria-label="Play intro video" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </button>
          </div>
        )}
      </div>


    </div>
  );
}
