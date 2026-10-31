"use client";

// Shrinks a phone photo in the browser before it is sent: longest side 720 px,
// JPEG quality stepping down until it is under ~70 KB. Small enough to keep a
// sandbox well inside Redis limits, sharp enough to show a water stain.

const MAX_SIDE = 720;
const MAX_CHARS = 95_000;

export async function shrinkPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a photo.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot prepare photos.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  for (const q of [0.72, 0.6, 0.5, 0.4, 0.32]) {
    const url = canvas.toDataURL("image/jpeg", q);
    if (url.length <= MAX_CHARS) return url;
  }
  throw new Error("That photo is too detailed to send. Try another one.");
}
