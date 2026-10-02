"use client";

import { useEffect, useRef, useState } from "react";
import { setSpeaking, setVoiceLevel, voice } from "./voice";
import { ENVELOPE, ENVELOPE_FPS } from "./twinEnvelope";

// The AI twin introduces itself, on its own, once per visit.
//
// What happens:
//   1. Nothing starts until the page has finished loading, then 3 more
//      seconds pass, the audio can play through without stalling and the
//      cyborg overlay image has decoded. On a slow connection it simply
//      waits; if the audio is still not ready after 12 seconds, the intro is
//      skipped rather than played in stutters. It also waits until the hero
//      is on screen and the tab is visible.
//   2. It tries to play WITH sound. Browsers only allow that for visitors who
//      have already interacted with the site, so for most first visits it
//      is refused. Then it plays MUTED instead (always allowed): the cyborg
//      half still appears, captions still run and the portrait still reacts,
//      with a small "Tap for sound" chip.
//   3. While sound plays there is a "Mute" chip (anything that speaks on its
//      own for more than 3 seconds must be stoppable), and when it ends a
//      "Replay" chip.
//
// The voice is ElevenLabs ("Jon"), not John Boy; the live tag says "AI twin".
// Reactivity reads a loudness envelope measured offline (twinEnvelope.ts), so
// the portrait moves the same with sound or without. Played once per browser
// session, so going back to the page does not repeat it.

const SRC = "/v3/twin-intro.mp3";
const CYBORG = "/v3/jb-cyborg.webp";
const START_DELAY_MS = 3000;
const READY_TIMEOUT_MS = 12000;
const SESSION_KEY = "v3-twin-intro-played";

// Phrase start times in seconds, measured from the audio's own pauses
// (ffmpeg silencedetect). Re-measure if the audio is regenerated.
const CAPTIONS: [number, string][] = [
  [0, "I'm John Boy's AI."],
  [2.3, "He built me, so I only know"],
  [4.0, "what he has actually shipped."],
  [5.6, "Five years in GoHighLevel,"],
  [7.84, "fifty-eight client systems."],
  [9.5, "Ask me anything about his work,"],
  [11.24, "or tell me what's broken in yours."],
];

type Phase = "waiting" | "playing" | "done";

function played() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markPlayed() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Private mode or blocked storage: it may replay on return, harmless.
  }
}

export default function TwinVoice() {
  const [phase, setPhase] = useState<Phase>("waiting");
  const [muted, setMuted] = useState(false);
  const [line, setLine] = useState(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef(0);
  const clearRef = useRef(0);

  useEffect(() => {
    const st = rootRef.current?.closest(".v3-stage") as HTMLElement | null;
    if (!st) return;
    let alive = true;
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const stopLoop = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };

    // Per frame while playing: captions and the voice level from the envelope.
    const loop = () => {
      const t = audio.currentTime;
      let idx = -1;
      for (let i = 0; i < CAPTIONS.length; i++) if (t >= CAPTIONS[i][0]) idx = i;
      setLine((cur) => (cur === idx ? cur : idx));
      const target = (ENVELOPE[Math.floor(t * ENVELOPE_FPS)] ?? 0) / 99;
      // Fast attack, slower release: reads as speech, not flicker.
      setVoiceLevel(voice.level + (target - voice.level) * (target > voice.level ? 0.5 : 0.14));
      st.style.setProperty("--vl", voice.level.toFixed(3));
      rafRef.current = requestAnimationFrame(loop);
    };

    // Let the glow and particles settle instead of snapping off.
    const decay = () => {
      stopLoop();
      const step = () => {
        setVoiceLevel(voice.level * 0.86);
        st.style.setProperty("--vl", voice.level.toFixed(3));
        if (voice.level > 0.01) rafRef.current = requestAnimationFrame(step);
        else {
          setVoiceLevel(0);
          st.style.setProperty("--vl", "0");
          rafRef.current = 0;
        }
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const onPlaying = () => {
      setSpeaking(true);
      st.setAttribute("data-twin", "speaking");
      setPhase("playing");
      stopLoop();
      rafRef.current = requestAnimationFrame(loop);
    };
    const onEnded = () => {
      setSpeaking(false);
      st.removeAttribute("data-twin");
      setPhase("done");
      decay();
      window.clearTimeout(clearRef.current);
      clearRef.current = window.setTimeout(() => setLine(-1), 1800);
    };
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onEnded);

    if (played()) {
      // Already heard this session: go straight to the replay chip.
      Promise.resolve().then(() => alive && setPhase("done"));
      return () => {
        alive = false;
        stopLoop();
        window.clearTimeout(clearRef.current);
        audio.pause();
        audio.removeEventListener("playing", onPlaying);
        audio.removeEventListener("ended", onEnded);
        st.removeAttribute("data-twin");
        setVoiceLevel(0);
        setSpeaking(false);
      };
    }

    // ---- the gate: loaded + 3s, audio ready, cyborg decoded, in view ----
    const pageLoaded = new Promise<void>((res) => {
      if (document.readyState === "complete") res();
      else window.addEventListener("load", () => res(), { once: true });
    });
    const delay = pageLoaded.then(() => new Promise<void>((res) => window.setTimeout(res, START_DELAY_MS)));
    // The audio is only requested once the page itself has loaded, so it
    // never competes with the hero for bandwidth.
    const audioReady = pageLoaded.then(
      () =>
        new Promise<boolean>((res) => {
          const t = window.setTimeout(() => res(false), READY_TIMEOUT_MS);
          audio.addEventListener(
            "canplaythrough",
            () => {
              window.clearTimeout(t);
              res(true);
            },
            { once: true }
          );
          audio.addEventListener("error", () => res(false), { once: true });
          audio.src = SRC;
          audio.load();
        })
    );
    const cyborgReady = (() => {
      const img = new Image();
      img.src = CYBORG;
      return img.decode().catch(() => undefined);
    })();
    const inView = new Promise<void>((res) => {
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting && !document.hidden) {
            io.disconnect();
            res();
          }
        },
        { threshold: 0.35 }
      );
      io.observe(st);
      // Coming back to a hidden tab with the hero already on screen.
      const onVis = () => {
        if (!document.hidden && st.getBoundingClientRect().top < window.innerHeight * 0.65) {
          document.removeEventListener("visibilitychange", onVis);
          io.disconnect();
          res();
        }
      };
      document.addEventListener("visibilitychange", onVis);
    });

    Promise.all([delay, audioReady, cyborgReady]).then(async ([, ok]) => {
      if (!alive || !ok) {
        if (alive) setPhase("done");
        return;
      }
      await inView;
      if (!alive) return;
      markPlayed();
      audio.muted = false;
      try {
        await audio.play();
        setMuted(false);
      } catch {
        // Sound refused: play silently, the visuals carry it.
        audio.muted = true;
        setMuted(true);
        try {
          await audio.play();
        } catch {
          if (alive) setPhase("done");
        }
      }
    });

    return () => {
      alive = false;
      stopLoop();
      window.clearTimeout(clearRef.current);
      audio.pause();
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onEnded);
      st.removeAttribute("data-twin");
      setVoiceLevel(0);
      setSpeaking(false);
    };
  }, []);

  // Chip actions are real taps, so sound is always allowed from here.
  const soundOn = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio.currentTime = 0;
    setMuted(false);
    try {
      await audio.play();
    } catch {
      // Ignore: the next tap will try again.
    }
  };

  const mute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = true;
    setMuted(true);
  };

  const replay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.src) audio.src = SRC;
    window.clearTimeout(clearRef.current);
    audio.muted = false;
    audio.currentTime = 0;
    setMuted(false);
    try {
      await audio.play();
    } catch {
      // Ignore.
    }
  };

  return (
    <div className="v3-twin" ref={rootRef} data-phase={phase}>
      {phase === "playing" ? (
        <p className="v3-twin-tag" aria-hidden="true">
          <i className="v3-dot v3-dot-live" /> AI twin speaking
        </p>
      ) : null}
      <p className="v3-twin-cap" aria-hidden="true">
        {line >= 0 ? <span key={line}>{CAPTIONS[line][1]}</span> : null}
      </p>
      {phase === "playing" && muted ? (
        <button type="button" className="v3-twin-chip" onClick={soundOn}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor" />
            <path d="M11 5.5c1.3 1.3 1.3 3.7 0 5M12.8 3.8c2.2 2.3 2.2 6.1 0 8.4" stroke="currentColor" fill="none" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Tap for sound
        </button>
      ) : null}
      {phase === "playing" && !muted ? (
        <button type="button" className="v3-twin-chip v3-twin-chip-quiet" onClick={mute}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor" />
            <path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Mute
        </button>
      ) : null}
      {phase === "done" ? (
        <button
          type="button"
          className="v3-twin-chip v3-twin-chip-quiet"
          onClick={replay}
          aria-label="Replay the 13 second intro spoken by John Boy's AI twin, an AI voice, not John Boy"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 8a5 5 0 1 0 1.6-3.7" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3.2 1.8v3h3" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Hear my AI twin
        </button>
      ) : null}
    </div>
  );
}
