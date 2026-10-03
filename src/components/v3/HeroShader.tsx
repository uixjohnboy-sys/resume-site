"use client";

import { useEffect, useRef } from "react";
import { voice } from "./voice";
import { scene } from "./scene";

// The hero's living background: a GPU fragment shader (plain WebGL, no
// library) drawing slow aurora smoke in the brand's amber, violet and pink
// over the ink. It leans toward the mouse, brightens and quickens while the
// AI twin speaks (voice.level), and thins out as the hero scrolls away
// (scene.erode). Rendered at half resolution, paused off-screen and in
// hidden tabs. If WebGL is unavailable or reduced motion is on, nothing is
// drawn and the CSS glows underneath carry the hero as before.

const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 r;      // resolution
uniform float t;     // seconds
uniform vec2 m;      // mouse, 0..1, smoothed
uniform float v;     // voice level 0..1
uniform float e;     // erode 0..1

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; }
  return s;
}

void main(){
  vec2 uv = gl_FragCoord.xy / r;
  vec2 q = uv; q.x *= r.x / r.y;
  float time = t * (0.05 + v * 0.08);

  // Two layers of drifting smoke, domain-warped so it curls instead of
  // sliding. The mouse bends the field toward itself.
  vec2 mm = (m - 0.5) * vec2(r.x / r.y, 1.0);
  vec2 pull = (mm - (q - vec2(0.5 * r.x / r.y, 0.5))) * 0.18;
  vec2 w = vec2(fbm(q * 1.6 + time + pull), fbm(q * 1.6 - time * 0.8 + 4.0 + pull));
  float n1 = fbm(q * 1.4 + w * 1.6 + vec2(0.0, -time * 1.2));
  float n2 = fbm(q * 2.6 - w * 1.1 + vec2(time * 0.6, 0.0));

  // Where the colour lives: a violet mass up-right, a pink pool low-left,
  // amber threads where the two layers cross.
  float violet = smoothstep(0.35, 0.85, n1) * smoothstep(0.1, 0.9, uv.x) * smoothstep(0.0, 0.8, uv.y);
  float pink   = smoothstep(0.45, 0.9, n2) * (1.0 - smoothstep(0.1, 0.9, uv.x)) * (1.0 - smoothstep(0.1, 0.9, uv.y));
  float amber  = smoothstep(0.6, 0.95, n1 * n2 * 2.2);

  vec3 col = vec3(0.0);
  col += vec3(0.36, 0.13, 0.84) * violet * 0.55;
  col += vec3(1.0, 0.18, 0.44) * pink * 0.32;
  col += vec3(1.0, 0.70, 0.14) * amber * (0.2 + v * 0.45);

  // The twin's voice lights the whole field a little; scrolling away thins it.
  col *= (1.0 + v * 0.25) * (1.0 - e * 0.85);

  // Vignette so the edges stay ink.
  float vig = smoothstep(1.25, 0.35, length(uv - 0.5) * 1.3);
  col *= vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function HeroShader() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = cv.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("[v3 shader]", gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r");
    const uT = gl.getUniformLocation(prog, "t");
    const uM = gl.getUniformLocation(prog, "m");
    const uV = gl.getUniformLocation(prog, "v");
    const uE = gl.getUniformLocation(prog, "e");

    const hero = cv.parentElement;
    hero?.setAttribute("data-shader", "on");

    // Half resolution: smoke has no edges to lose, and it halves the cost.
    const size = () => {
      const scale = 0.5;
      cv.width = Math.max(2, Math.round(cv.clientWidth * scale));
      cv.height = Math.max(2, Math.round(cv.clientHeight * scale));
      gl.viewport(0, 0, cv.width, cv.height);
    };
    size();

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (ev: PointerEvent) => {
      mouse.tx = ev.clientX / window.innerWidth;
      mouse.ty = 1 - ev.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let visible = true;
    const t0 = performance.now();
    const frame = () => {
      raf = 0;
      if (!visible || document.hidden) return;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl.uniform2f(uR, cv.width, cv.height);
      gl.uniform1f(uT, (performance.now() - t0) / 1000);
      gl.uniform2f(uM, mouse.x, mouse.y);
      gl.uniform1f(uV, voice.level);
      gl.uniform1f(uE, scene.erode);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) start();
    });
    io.observe(cv);
    const onVis = () => start();
    document.addEventListener("visibilitychange", onVis);
    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(size, 150);
    };
    window.addEventListener("resize", onResize);
    start();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.clearTimeout(rt);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      hero?.removeAttribute("data-shader");
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} className="v3-shader" aria-hidden="true" />;
}
