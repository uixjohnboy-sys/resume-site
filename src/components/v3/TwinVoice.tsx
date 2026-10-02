"use client";

import { useEffect, useRef, useState } from "react";
import { setSpeaking, setVoiceLevel, voice } from "./voice";

// "Tap to hear my AI": the twin's spoken intro, over the dissolving portrait.
//
// The voice is ElevenLabs ("Jon"), not John Boy, and the control says so.
// Browsers block audio until a tap, so nothing plays on load and the file is
// not even fetched until then (preload="none", 156KB).
//
// While it plays, an AnalyserNode measures loudness every frame and:
//   - writes it to `voice.level`, which PortraitDissolve reads to speed up
//     and warm the particles leaving the figure,
//   - sets --vl on the stage for the amber glow behind the portrait,
//   - draws a small bar waveform inside the button.
// Captions follow the audio by phrase. Timings were measured from the
// file's own pauses (ffmpeg silencedetect), not guessed; if the audio is
// ever regenerated, re-measure them.
//
// If Web Audio is unavailable the audio still plays with captions, only the
// reactive visuals are skipped.

const SRC = "/v3/twin-intro.mp3";

const CAPTIONS: [number, string][] = [
  [0, "I'm John Boy's AI."],
  [2.3, "He built me, so I only know"],
  [4.0, "what he has actually shipped."],
  [5.6, "Five years in GoHighLevel,"],
  [7.84, "fifty-eight client systems."],
  [9.5, "Ask me anything about his work,"],
  [11.24, "or tell me what's broken in yours."],
];

type Phase = "idle" | "playing" | "done";

export default function TwinVoice() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [line, setLine] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);

  const stage = () => waveRef.current?.closest(".v3-stage") as HTMLElement | null;

  const stopLoop = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  };

  // Let the glow and particles settle instead of snapping off.
  const decay = () => {
    const st = stage();
    const step = () => {
      setVoiceLevel(voice.level * 0.86);
      st?.style.setProperty("--vl", voice.level.toFixed(3));
      if (voice.level > 0.01) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setVoiceLevel(0);
        st?.style.setProperty("--vl", "0");
        rafRef.current = 0;
      }
    };
    stopLoop();
    rafRef.current = requestAnimationFrame(step);
  };

  const loop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = audio.currentTime;
    let idx = -1;
    for (let i = 0; i < CAPTIONS.length; i++) if (t >= CAPTIONS[i][0]) idx = i;
    setLine((cur) => (cur === idx ? cur : idx));

    const an = analyserRef.current;
    const cv = waveRef.current;
    if (an && cv) {
      const bins = new Uint8Array(an.frequencyBinCount);
      an.getByteTimeDomainData(bins);
      let sum = 0;
      for (let i = 0; i < bins.length; i++) {
        const v = (bins[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / bins.length);
      const target = Math.min(1, rms * 4.2);
      // Fast attack, slower release: reads as speech, not flicker.
      setVoiceLevel(voice.level + (target - voice.level) * (target > voice.level ? 0.5 : 0.12));
      stage()?.style.setProperty("--vl", voice.level.toFixed(3));

      an.getByteFrequencyData(bins);
      const g = cv.getContext("2d");
      if (g) {
        const W = cv.width;
        const H = cv.height;
        g.clearRect(0, 0, W, H);
        const n = 9;
        const bw = W / (n * 1.7);
        g.fillStyle = "#ffb224";
        for (let i = 0; i < n; i++) {
          // Speech energy sits in the low bins; spread them across the bars.
          const v = bins[2 + i * 3] / 255;
          const h = Math.max(H * 0.14, H * v * 0.95);
          const x = i * bw * 1.7 + bw * 0.35;
          g.fillRect(x, (H - h) / 2, bw, h);
        }
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  };

  const ensureAudio = () => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio(SRC);
    audio.preload = "auto";
    audioRef.current = audio;
    audio.addEventListener("ended", () => {
      setSpeaking(false);
      setPhase("done");
      decay();
      window.setTimeout(() => setLine(-1), 1800);
    });
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = new AC();
      const src = ac.createMediaElementSource(audio);
      const an = ac.createAnalyser();
      an.fftSize = 256;
      an.smoothingTimeConstant = 0.6;
      src.connect(an);
      an.connect(ac.destination);
      ctxRef.current = ac;
      analyserRef.current = an;
    } catch {
      // No Web Audio: plain playback, captions only.
    }
    return audio;
  };

  const toggle = async () => {
    const audio = ensureAudio();
    if (phase === "playing") {
      audio.pause();
      setSpeaking(false);
      setPhase("idle");
      decay();
      return;
    }
    if (phase === "done") audio.currentTime = 0;
    try {
      await ctxRef.current?.resume();
      await audio.play();
      setSpeaking(true);
      setPhase("playing");
      stopLoop();
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setPhase("idle");
    }
  };

  // Size the waveform canvas for the screen's pixel density.
  useEffect(() => {
    const cv = waveRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(34 * dpr);
    cv.height = Math.round(18 * dpr);
  }, []);

  useEffect(
    () => () => {
      stopLoop();
      audioRef.current?.pause();
      ctxRef.current?.close().catch(() => {});
      setVoiceLevel(0);
      setSpeaking(false);
    },
    []
  );

  const label =
    phase === "playing" ? "Stop" : phase === "done" ? "Hear it again" : "Tap to hear my AI";

  return (
    <div className="v3-twin" data-phase={phase} data-v3="line">
      <p className="v3-twin-cap" aria-hidden="true">
        {line >= 0 ? <span key={line}>{CAPTIONS[line][1]}</span> : null}
      </p>
      <button
        type="button"
        className="v3-twin-btn"
        onClick={toggle}
        aria-pressed={phase === "playing"}
        aria-label={
          phase === "playing"
            ? "Stop the AI voice"
            : "Play a 13 second intro spoken by John Boy's AI twin, an AI voice, not John Boy"
        }
      >
        <span className="v3-twin-icon" aria-hidden="true">
          <canvas ref={waveRef} className="v3-twin-wave" />
          <svg className="v3-twin-play" viewBox="0 0 12 12">
            <path d="M3 1.8v8.4L10.2 6z" fill="currentColor" />
          </svg>
        </span>
        <span className="v3-twin-text">
          <b>{label}</b>
          <small>AI voice, not John Boy &middot; 0:13</small>
        </span>
      </button>
    </div>
  );
}
