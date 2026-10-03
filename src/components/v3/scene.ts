// Shared, mutable scene state, written per frame by V3Motion (scroll) and
// read by the canvases (PortraitDissolve, HeroShader) in their own loops.
// Same idea as voice.ts: a plain object, no React state, no re-renders.
//
// erode: 0 while the hero is at the top, rising to 1 as it scrolls away.
//        The portrait turns to smoke along it, and the shader thins out.
export const scene = { erode: 0 };

export function setErode(v: number) {
  scene.erode = v;
}
