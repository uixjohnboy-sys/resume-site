"use client";

import Image from "next/image";
import { useRef, useState } from "react";

// The hero's face-to-camera intro. Research for AU/UK buyers: 60 to 90
// seconds, his real face first, captions, never autoplay with sound. Until
// John Boy records it (VIDEO_SRC empty) the card shows his photo only, with
// no dead play button.
const VIDEO_SRC = "";
const POSTER = "/jb-portrait.png";
const CUTOUT = "/jb-cutout.webp";

export default function IntroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  if (!VIDEO_SRC) {
    return (
      <figure className="v4-photo">
        <Image src={CUTOUT} alt="John Boy Roxas" width={1400} height={1400} sizes="(max-width: 860px) 90vw, 500px" priority />
      </figure>
    );
  }

  return (
    <figure className="v4-photo v4-video">
      <video
        ref={ref}
        src={VIDEO_SRC}
        poster={POSTER}
        controls={playing}
        playsInline
        preload="none"
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      {!playing && (
        <button
          type="button"
          className="v4-play"
          onClick={() => {
            setPlaying(true);
            ref.current?.play();
          }}
        >
          <span aria-hidden="true">&#9654;</span> Watch my 75-second intro
        </button>
      )}
      <figcaption>
        <b>John Boy Roxas</b>
        <span>Paniqui, Tarlac, Philippines</span>
      </figcaption>
    </figure>
  );
}
