// Shared, mutable state for the AI twin's voice. TwinVoice writes the live
// loudness of the audio (0 to 1) every frame while it plays; PortraitDissolve
// reads it in its own particle loop so the figure reacts to the voice. A
// plain object instead of React state, because both sides run per frame and
// neither should re-render for it. Writes go through these setters so the
// React compiler sees no component mutating module state.
export const voice = { level: 0, speaking: false };

export function setVoiceLevel(level: number) {
  voice.level = level;
}

export function setSpeaking(on: boolean) {
  voice.speaking = on;
}
