"use client";

import { useRef, useState } from "react";

// The intro film: poster plus one big play mark, so visitors see it is a video. The native controls appear once it
// starts. Sound is on because the visitor pressed play themselves.
export default function IntroPlayer({ src, poster, length }: { src: string; poster: string; length: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const start = () => {
    setStarted(true);
    const v = ref.current;
    if (!v) return;
    v.controls = true;
    v.play().catch(() => {
      /* the native controls are showing, so the visitor can press play there */
    });
  };

  return (
    <>
      <video
        ref={ref}
        preload="metadata"
        playsInline
        poster={poster}
        controls={started}
        aria-label="Intro video: John Boy Roxas on what he builds in GoHighLevel, with captions"
      >
        <source src={src} type="video/mp4" />
      </video>
      {!started && (
        <button type="button" className="ip-start" onClick={start} aria-label={`Play the intro video, ${length}`}>
          <span className="v4-film-play" aria-hidden="true" />
          <span className="ip-label">Watch the intro · {length}</span>
        </button>
      )}
    </>
  );
}
