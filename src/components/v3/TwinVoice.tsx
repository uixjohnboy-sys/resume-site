"use client";

import { useEffect, useRef, useState } from "react";
import { setSpeaking, setVoiceLevel, voice } from "./voice";
import { ENVELOPE, ENVELOPE_FPS } from "./twinEnvelope";
import { onRevealed } from "./Preloader";

// The AI twin wakes up and introduces itself, and a "Talk to my AI" button
// plays it with sound (JB's call 2026-10-03, after learning that no browser
// allows sound before the visitor interacts).
//
// Order of events:
//   1. 1.2 seconds after the page is interactive, as the hero intro settles,
//      once the cyborg overlay (31KB) has decoded and the hero is on screen
//      in a visible tab. (JB found load + 3 seconds too slow, 2026-10-02.)
//   2. The right half of the face glitches into the cyborg and STAYS that
//      way for the rest of the visit: John Boy on the left, his AI on the
//      right. The live tag says which is which.
//   3. It tries to speak WITH sound. Browsers refuse sound until the visitor
//      has clicked, tapped or typed on the page, and that cannot be bypassed.
//      Chrome desktop refuses even MUTED <audio> (muted autoplay is only
//      allowed for <video>, measured 2026-10-02), and iOS Low Power Mode
//      refuses all media. So when sound is refused the twin speaks SILENTLY
//      on its own clock instead of a media element: captions, the cyborg and
//      the reactive portrait run exactly as they would with sound. The first
//      click, tap or key press anywhere afterwards counts as permission, and
//      it starts over from the top with the real voice, once per page load.
//      Every load and every refresh tries again (JB, 2026-10-03: he wants the
//      robot to speak each time the page is refreshed).
//   4. "Talk to my AI" opens the chat (TwinChat.tsx); if the intro has not
//      been heard with sound on this page load, it plays it as the greeting.
//      While the voice plays the same button reads "Mute" (WCAG 1.4.2), and
//      Esc mutes too.
//
// The voice is ElevenLabs ("Jon"), not John Boy. Reactivity reads a loudness
// envelope measured offline (twinEnvelope.ts), so the portrait moves the
// same whichever clock drives it.

const SRC = "/v3/twin-intro.mp3";
const CYBORG = "/v3/jb-cyborg.webp";
// Counted from the moment the preloader's curtain parts (at once on repeat
// visits, when there is no curtain).
const START_DELAY_MS = 900;
const DURATION = ENVELOPE.length / ENVELOPE_FPS;

// Phrase start times in seconds for the 66-second intro (2026-10-03),
// measured from the audio's own pauses (ffmpeg silencedetect, -30dB, 0.12s).
// Re-measure if the audio is regenerated, and regenerate twinEnvelope.ts.
const CAPTIONS: [number, string][] = [
  [0, "Hi, I'm John Boy's AI."],
  [2.25, "He built me,"],
  [3.1, "so I only know what he has actually shipped."],
  [5.65, "Here's the short version."],
  [7.2, "Five years inside GoHighLevel."],
  [9.9, "Fifty-eight client systems:"],
  [11.9, "workflows, pipelines, snapshots, funnels,"],
  [15.8, "the whole engine."],
  [17.3, "But the real work starts"],
  [19.05, "when GoHighLevel hits a wall."],
  [21.45, "A client gets charged twice."],
  [23.65, "The dashboard says forty leads,"],
  [25.85, "but the CRM says twenty-seven."],
  [28.55, "A launch slips two weeks"],
  [30.75, "because A2P was filed late."],
  [33.65, "That's where John Boy keeps building."],
  [36.05, "Webhooks, the v2 API, Stripe,"],
  [39, "and full apps, wired back into the CRM."],
  [42.5, "Like a payment that Stripe delivers five times,"],
  [45.45, "and his system records once."],
  [47.55, "His biggest build, Coach OS,"],
  [49.9, "is over thirty thousand lines of code,"],
  [52.5, "running live,"],
  [53.7, "wired into GoHighLevel in both directions."],
  [56.45, "So here's the offer."],
  [58.05, "Send him one workflow that isn't firing,"],
  [60.8, "and he'll tell you exactly what's wrong with it,"],
  [63, "free."],
  [64.25, "Or ask me anything, right here."],
];

// Real user activation in Chrome, Safari and Firefox. Scrolling is not one.
const ACTIVATION_EVENTS = ["pointerup", "keydown", "touchend"] as const;

type Phase = "waiting" | "speaking" | "awake";

// Heard with sound on this page load. Deliberately not stored: a refresh
// starts fresh and the twin speaks again.
let heardNow = false;

function heard() {
  return heardNow;
}

function markHeard() {
  heardNow = true;
}

export default function TwinVoice() {
  const [phase, setPhase] = useState<Phase>("waiting");
  const [sound, setSound] = useState(false);
  const [line, setLine] = useState(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Set inside the effect: start the intro over with the real voice.
  const talkRef = useRef<() => void>(() => {});

  useEffect(() => {
    const st = rootRef.current?.closest(".v3-stage") as HTMLElement | null;
    if (!st) return;
    let alive = true;
    let raf = 0;
    let clearTimer = 0;
    let armed = false;
    // Which clock drives the speech: the real audio, or a silent timer.
    let mode: "audio" | "silent" = "silent";
    let silentStart = 0;
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = SRC;
    audioRef.current = audio;

    const now = () => (mode === "audio" ? audio.currentTime : (performance.now() - silentStart) / 1000);

    const stopLoop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // The cyborg half: once awake, it never goes back to human this visit.
    const wake = (state: "speaking" | "awake") => {
      st.setAttribute("data-twin", state);
      setPhase(state);
    };

    // Let the glow and particles settle instead of snapping off.
    const decay = () => {
      stopLoop();
      const step = () => {
        setVoiceLevel(voice.level * 0.86);
        st.style.setProperty("--vl", voice.level.toFixed(3));
        if (voice.level > 0.01) raf = requestAnimationFrame(step);
        else {
          setVoiceLevel(0);
          st.style.setProperty("--vl", "0");
          raf = 0;
        }
      };
      raf = requestAnimationFrame(step);
    };

    const finish = () => {
      setSpeaking(false);
      wake("awake");
      decay();
      window.clearTimeout(clearTimer);
      clearTimer = window.setTimeout(() => setLine(-1), 1800);
    };

    // Per frame while speaking: captions and the voice level from the envelope.
    const loop = () => {
      const t = now();
      if (mode === "silent" && t >= DURATION) {
        finish();
        return;
      }
      let idx = -1;
      for (let i = 0; i < CAPTIONS.length; i++) if (t >= CAPTIONS[i][0]) idx = i;
      setLine((cur) => (cur === idx ? cur : idx));
      const target = (ENVELOPE[Math.floor(t * ENVELOPE_FPS)] ?? 0) / 99;
      // Fast attack, slower release: reads as speech, not flicker.
      setVoiceLevel(voice.level + (target - voice.level) * (target > voice.level ? 0.5 : 0.14));
      st.style.setProperty("--vl", voice.level.toFixed(3));
      raf = requestAnimationFrame(loop);
    };

    const begin = () => {
      window.clearTimeout(clearTimer);
      setSpeaking(true);
      wake("speaking");
      stopLoop();
      raf = requestAnimationFrame(loop);
    };

    const speakSilently = () => {
      mode = "silent";
      silentStart = performance.now();
      setSound(false);
      begin();
    };

    const onPlaying = () => {
      mode = "audio";
      begin();
    };
    const onEnded = () => {
      if (mode === "audio") finish();
    };
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onEnded);

    // ---- first interaction = permission for sound ----
    const disarm = () => {
      armed = false;
      ACTIVATION_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivate, true));
    };
    const talk = () => {
      disarm();
      audio.muted = false;
      audio.currentTime = 0;
      audio
        .play()
        .then(() => {
          setSound(true);
          markHeard();
        })
        .catch(() => {
          // Still refused (rare): the silent run carries on.
        });
    };
    talkRef.current = talk;
    const onActivate = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") return;
      // The button handles its own click.
      if (e.target instanceof Element && e.target.closest(".v3-twin-btn")) return;
      disarm();
      if (!alive || heard()) return;
      // Only start over if the twin is still on screen; a click far down
      // the page should not suddenly talk about the hero.
      const r = st.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      talk();
    };
    const arm = () => {
      if (armed) return;
      armed = true;
      ACTIVATION_EVENTS.forEach((ev) => window.addEventListener(ev, onActivate, { capture: true, passive: true }));
    };

    // Esc always silences it.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mode === "audio" && !audio.muted && !audio.paused) {
        audio.muted = true;
        setSound(false);
      }
    };
    window.addEventListener("keydown", onKey);

    // ---- the gate: 1.2s, cyborg decoded, hero in view ----
    const delay = new Promise<void>((res) => {
      onRevealed(() => window.setTimeout(res, START_DELAY_MS));
    });
    const cyborgReady = (() => {
      const img = new Image();
      img.src = CYBORG;
      return img.decode().catch(() => undefined);
    })();
    let io: IntersectionObserver | null = null;
    let onVis: (() => void) | null = null;
    const inView = new Promise<void>((res) => {
      io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting && !document.hidden) {
            io?.disconnect();
            res();
          }
        },
        { threshold: 0.35 }
      );
      io.observe(st);
      // Coming back to a hidden tab with the hero already on screen.
      onVis = () => {
        if (!document.hidden && st.getBoundingClientRect().top < window.innerHeight * 0.65) {
          io?.disconnect();
          res();
        }
      };
      document.addEventListener("visibilitychange", onVis);
    });

    Promise.all([delay, cyborgReady]).then(async () => {
      await inView;
      if (onVis) document.removeEventListener("visibilitychange", onVis);
      if (!alive) return;
      try {
        // Rejected at once when there has been no interaction yet, so this
        // costs no delay on a first visit.
        await audio.play();
        setSound(true);
        markHeard();
      } catch {
        if (!alive) return;
        speakSilently();
        arm();
      }
    });

    return () => {
      alive = false;
      stopLoop();
      disarm();
      window.clearTimeout(clearTimer);
      window.removeEventListener("keydown", onKey);
      io?.disconnect();
      if (onVis) document.removeEventListener("visibilitychange", onVis);
      audio.pause();
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onEnded);
      st.removeAttribute("data-twin");
      setVoiceLevel(0);
      setSpeaking(false);
    };
  }, []);

  const mute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = true;
    setSound(false);
  };

  return (
    <div className="v3-twin" ref={rootRef} data-phase={phase} data-v3="line">
      {phase !== "waiting" ? (
        <p className="v3-twin-tag" aria-hidden="true">
          <i className={phase === "speaking" ? "v3-dot v3-dot-live" : "v3-dot"} />
          {phase === "speaking" ? "AI twin speaking" : "Right half: John Boy's AI twin"}
        </p>
      ) : null}
      <p className="v3-twin-cap" aria-hidden="true">
        {line >= 0 ? <span key={line}>{CAPTIONS[line][1]}</span> : null}
      </p>
      {phase === "speaking" && sound ? (
        <button type="button" className="v3-twin-btn v3-twin-btn-quiet" onClick={mute}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor" />
            <path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Mute
        </button>
      ) : (
        <button
          type="button"
          className="v3-twin-btn"
          data-cursor="Talk"
          onClick={() => {
            // Opens the chat (TwinChat); the first time this session, the
            // intro also plays with the real voice as the greeting.
            window.dispatchEvent(new Event("v3:chat-open"));
            if (!heard()) talkRef.current();
          }}
          aria-label="Talk to my AI: opens a chat with John Boy's AI twin, an AI, not John Boy"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor" />
            <path d="M11 5.5c1.3 1.3 1.3 3.7 0 5M12.8 3.8c2.2 2.3 2.2 6.1 0 8.4" stroke="currentColor" fill="none" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Talk to my AI
        </button>
      )}
    </div>
  );
}
