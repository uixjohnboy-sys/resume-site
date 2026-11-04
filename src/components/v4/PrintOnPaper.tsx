"use client";

import { useEffect } from "react";

// Makes the page read as printed on the sheet. Each word is moved and tilted by the creases under it, and each image is
// redrawn bent along them, from public/paper-map.webp (the same folds as public/paper.webp). All of it is done once
// per layout: a live SVG filter does the same job but drops scrolling to 18 fps on an ordinary laptop.
const TILE = 1200;
const BEND = 11;
const MOST_TILT = 2.2;
const IMAGE_EDGE = 6;

type Sampler = (x: number, y: number) => [number, number];

const loadSampler = async (): Promise<Sampler> => {
  const map = new Image();
  map.src = "/paper-map.webp";
  await map.decode();
  const c = document.createElement("canvas");
  c.width = map.naturalWidth;
  c.height = map.naturalHeight;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(map, 0, 0);
  const size = c.width;
  const { data } = g.getImageData(0, 0, size, size);
  const per = size / TILE;
  return (x, y) => {
    const fx = (((x % TILE) + TILE) % TILE) * per;
    const fy = (((y % TILE) + TILE) % TILE) * per;
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const x1 = (x0 + 1) % size, y1 = (y0 + 1) % size;
    const a = fx - x0, b = fy - y0;
    const at = (ch: number) =>
      (data[(y0 * size + x0) * 4 + ch] * (1 - a) + data[(y0 * size + x1) * 4 + ch] * a) * (1 - b) +
      (data[(y1 * size + x0) * 4 + ch] * (1 - a) + data[(y1 * size + x1) * 4 + ch] * a) * b;
    return [BEND * (at(0) / 255 - 0.5), BEND * (at(1) / 255 - 0.5)];
  };
};

// Words become inline-blocks so each can move on its own. The spaces stay as text, so wrapping and copying are unchanged.
const splitWords = (root: HTMLElement) => {
  const skip = "script,style,svg,button,.v4-btn,.v4-nav-cta,[data-live]";
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (node.data.trim() && !node.parentElement?.closest(skip)) nodes.push(node);
  }
  for (const node of nodes) {
    // In a flex or grid parent every loose word would become its own item, so they stay together in one span.
    const shown = getComputedStyle(node.parentElement!).display;
    const parts = /flex|grid/.test(shown) ? document.createElement("span") : document.createDocumentFragment();
    for (const piece of node.data.split(/(\s+)/)) {
      if (!piece) continue;
      if (/^\s+$/.test(piece)) {
        parts.append(piece);
      } else {
        const word = document.createElement("span");
        word.className = "v4-w";
        word.textContent = piece;
        parts.append(word);
      }
    }
    node.replaceWith(parts);
  }
  return [...root.querySelectorAll<HTMLElement>(".v4-w,.v4-btn,.v4-nav-cta")];
};

const placeWords = (words: HTMLElement[], sample: Sampler) => {
  for (const w of words) w.style.transform = "";
  const sx = window.scrollX, sy = window.scrollY;
  const boxes = words.map((w) => w.getBoundingClientRect());
  words.forEach((w, i) => {
    const r = boxes[i];
    if (!r.width) return;
    const y = r.top + sy + r.height / 2;
    const [lx, ly] = sample(r.left + sx, y);
    const [cx, cy] = sample(r.left + sx + r.width / 2, y);
    const [, ry] = sample(r.right + sx, y);
    const tilt = (Math.atan2(ry - ly, r.width) * 180) / Math.PI;
    const clamped = Math.max(-MOST_TILT, Math.min(MOST_TILT, tilt));
    w.style.transform = `translate(${((lx + cx) / 2).toFixed(2)}px, ${cy.toFixed(2)}px) rotate(${clamped.toFixed(2)}deg)`;
  });
};

const sources = new WeakMap<HTMLImageElement, HTMLImageElement>();

const sourceOf = async (img: HTMLImageElement) => {
  let source = sources.get(img);
  if (!source) {
    source = new Image();
    source.src = img.currentSrc || img.src;
    await source.decode();
    sources.set(img, source);
  }
  return source;
};

// Draws the image into a canvas the way CSS shows it, then moves every pixel by the crease under it.
const bakeImage = async (img: HTMLImageElement, sample: Sampler) => {
  const W = img.clientWidth, H = img.clientHeight;
  if (!W || !H) return;
  const source = await sourceOf(img);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cw = Math.round(W * dpr), ch = Math.round(H * dpr);
  const flat = document.createElement("canvas");
  flat.width = cw;
  flat.height = ch;
  const fg = flat.getContext("2d", { willReadFrequently: true })!;
  const style = getComputedStyle(img);
  const nw = source.naturalWidth, nh = source.naturalHeight;
  const inner = (IMAGE_EDGE * 2) * dpr;
  if (style.objectFit === "contain" || style.objectFit === "fill") {
    fg.drawImage(source, IMAGE_EDGE * dpr, IMAGE_EDGE * dpr, cw - inner, ch - inner);
  } else {
    const fit = Math.max((cw - inner) / nw, (ch - inner) / nh);
    const sw = (cw - inner) / fit, sh = (ch - inner) / fit;
    const [px, py] = style.objectPosition.split(" ").map((v) => (v.endsWith("%") ? parseFloat(v) / 100 : 0.5));
    fg.drawImage(source, (nw - sw) * px, (nh - sh) * py, sw, sh, IMAGE_EDGE * dpr, IMAGE_EDGE * dpr, cw - inner, ch - inner);
  }
  const from = fg.getImageData(0, 0, cw, ch).data;
  const out = fg.createImageData(cw, ch);
  const box = img.getBoundingClientRect();
  const left = box.left + window.scrollX, top = box.top + window.scrollY;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const [dx, dy] = sample(left + x / dpr, top + y / dpr);
      const fx = x - dx * dpr, fy = y - dy * dpr;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      if (x0 < 0 || y0 < 0 || x0 >= cw - 1 || y0 >= ch - 1) continue;
      const a = fx - x0, b = fy - y0;
      const i = (y0 * cw + x0) * 4, o = (y * cw + x) * 4;
      for (let k = 0; k < 4; k++) {
        out.data[o + k] =
          (from[i + k] * (1 - a) + from[i + 4 + k] * a) * (1 - b) +
          (from[i + cw * 4 + k] * (1 - a) + from[i + cw * 4 + 4 + k] * a) * b;
      }
    }
  }
  fg.putImageData(out, 0, 0);
  const blob = await new Promise<Blob | null>((done) => flat.toBlob(done, "image/webp", 0.9));
  if (!blob) return;
  img.removeAttribute("srcset");
  img.removeAttribute("sizes");
  img.src = URL.createObjectURL(blob);
};

export default function PrintOnPaper() {
  useEffect(() => {
    const root = document.getElementById("v4-root");
    if (!root) return;
    let gone = false;
    let observer: ResizeObserver | undefined;
    (async () => {
      const sample = await loadSampler();
      if (gone) return;
      const words = splitWords(root);
      const images = [...root.querySelectorAll("img")];
      placeWords(words, sample);

      const bakeAll = async () => {
        for (const img of images) {
          if (gone) return;
          // The first load decides what the image is, so wait for it, and let the page breathe between images.
          if (!img.complete) await new Promise((done) => img.addEventListener("load", done, { once: true }));
          await new Promise((done) => setTimeout(done, 16));
          await bakeImage(img, sample);
        }
      };
      void bakeAll();

      let width = root.offsetWidth, height = root.offsetHeight, queued = false;
      observer = new ResizeObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          if (root.offsetWidth === width && root.offsetHeight === height) return;
          const widthChanged = root.offsetWidth !== width;
          width = root.offsetWidth;
          height = root.offsetHeight;
          placeWords(words, sample);
          if (widthChanged) void bakeAll();
        });
      });
      observer.observe(root);
    })();
    return () => {
      gone = true;
      observer?.disconnect();
    };
  }, []);
  return null;
}
