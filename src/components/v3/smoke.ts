// The site's one smoke: the cursor trail (Cursor.tsx) and the portrait's
// smoking edges (PortraitDissolve.tsx) draw the same puffs, so the page
// speaks one visual language (JB, 2026-10-03).

// Amber (the brand), the portrait's pink key light, the violet glow, and a
// pale smoke that reads as real smoke between the colours.
export const SMOKE_TINTS = {
  amber: "255,178,36",
  pink: "255,80,140",
  violet: "140,90,255",
  pale: "255,236,210",
} as const;

export type SmokeTint = keyof typeof SMOKE_TINTS;

// A soft, slightly irregular puff: a few offset radial blobs on a 128px
// sprite, drawn once and reused for every particle of that colour.
export function smokeSprite(rgb: string) {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  if (!g) return c;
  const blobs = [
    [64, 64, 52, 0.55],
    [48, 56, 34, 0.35],
    [80, 70, 30, 0.3],
    [62, 82, 28, 0.25],
  ];
  for (const [x, y, r, a] of blobs) {
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${rgb},${a})`);
    grad.addColorStop(0.55, `rgba(${rgb},${a * 0.45})`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

export function smokeSprites() {
  return {
    amber: smokeSprite(SMOKE_TINTS.amber),
    pink: smokeSprite(SMOKE_TINTS.pink),
    violet: smokeSprite(SMOKE_TINTS.violet),
    pale: smokeSprite(SMOKE_TINTS.pale),
  } as Record<SmokeTint, HTMLCanvasElement>;
}
