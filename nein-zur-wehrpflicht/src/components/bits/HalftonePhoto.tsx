"use client";

// Basiert auf "HalftoneReveal" aus React Bits (MIT + Commons Clause, siehe README in diesem Ordner).
// Angepasst: Das Foto löst sich zu den Rändern hin in Farbpunkte auf und geht nahtlos ins Schwarz der Seite über.
// Gezeichnet wird nur bei Bedarf (Einblenden, Maus, Größenänderung), nicht in einer Dauerschleife.
// Darunter liegt immer das normale Bild: ohne WebGL2 bleibt einfach das Foto stehen.

import Image, { type StaticImageData } from "next/image";
import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";
import { useEffect, useRef, useState } from "react";

type Fade = { left?: number; bottom?: number; right?: number; top?: number };
type Focus = [number, number];

const vertex = /* glsl */ `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D tMap;
uniform vec2 iResolution;
uniform vec2 uImageSize;
uniform vec2 uFocus;
uniform float uCell;
uniform float uAngle;
uniform vec3 uPaper;
uniform vec4 uFade;
uniform float uLod;
uniform float uProgress;
uniform vec2 uMouse;
uniform float uActive;
uniform float uRadius;
out vec4 fragColor;

vec2 coverUv(vec2 uv) {
  float ia = uImageSize.x / max(uImageSize.y, 1.0);
  float pa = iResolution.x / max(iResolution.y, 1.0);
  vec2 s = pa > ia ? vec2(1.0, ia / pa) : vec2(pa / ia, 1.0);
  vec2 focus = vec2(uFocus.x, 1.0 - uFocus.y);
  return (1.0 - s) * focus + uv * s;
}

float edge(float x, float w) { return w <= 0.0 ? 1.0 : smoothstep(0.0, w, x); }

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / iResolution;

  // 1 = Foto, 0 = nur noch Papier. Dazwischen Punkte, die zum Rand hin kleiner werden.
  float d = edge(uv.x, uFade.x) * edge(uv.y, uFade.y) * edge(1.0 - uv.x, uFade.z) * edge(1.0 - uv.y, uFade.w);
  float p = clamp(uProgress, 0.0, 1.0);
  d *= p * p * (3.0 - 2.0 * p);
  float lens = 1.0 - smoothstep(uRadius * 0.45, uRadius, length(frag - uMouse));
  d = max(d, lens * uActive);

  float c = cos(uAngle);
  float s = sin(uAngle);
  mat2 R = mat2(c, -s, s, c);
  vec2 rp = R * frag / uCell;
  vec2 cell = floor(rp);
  vec2 local = rp - cell - 0.5;
  vec2 center = transpose(R) * ((cell + 0.5) * uCell);
  vec3 cellCol = textureLod(tMap, coverUv(clamp(center / iResolution, 0.0, 1.0)), uLod).rgb;
  vec3 pixCol = texture(tMap, coverUv(uv)).rgb;

  float lum = dot(cellCol, vec3(0.299, 0.587, 0.114));
  float grow = smoothstep(0.3, 0.93, d);
  float rDot = sqrt(clamp(lum * 1.2, 0.0, 1.0)) * 0.62 * smoothstep(0.0, 0.55, d);
  float r = mix(rDot, 0.8, grow);
  float aa = 0.9 / uCell;
  float cov = 1.0 - smoothstep(r - aa, r + aa, length(local));
  vec3 ink = mix(min(cellCol * 1.2, vec3(1.0)), pixCol, grow);
  vec3 col = mix(uPaper, ink, cov);
  col = mix(col, pixCol, smoothstep(0.92, 1.0, d));
  fragColor = vec4(col, 1.0);
}
`;

const PAPER: [number, number, number] = [12 / 255, 11 / 255, 10 / 255];

/** Weicher Rand als CSS-Maske für das normale Bild, falls WebGL fehlt. */
function fadeMask(f: Fade) {
  const sides: Array<[keyof Fade, string]> = [
    ["left", "to right"],
    ["bottom", "to top"],
    ["right", "to left"],
    ["top", "to bottom"],
  ];
  const layers = sides
    .filter(([k]) => (f[k] ?? 0) > 0)
    .map(([k, dir]) => `linear-gradient(${dir}, transparent, #000 ${Math.round((f[k] ?? 0) * 100)}%)`);
  return layers.length ? layers.join(", ") : "none";
}

export default function HalftonePhoto({
  src,
  alt,
  sizes,
  focus = [0.5, 0.5],
  focusDesktop,
  fade,
  fadeDesktop,
  cell = 6,
  priority = false,
  className = "",
}: {
  src: StaticImageData;
  alt: string;
  sizes: string;
  focus?: Focus;
  focusDesktop?: Focus;
  fade: Fade;
  fadeDesktop?: Fade;
  /** Rasterweite in CSS-Pixeln */
  cell?: number;
  priority?: boolean;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  // Bilder weiter unten bekommen ihr WebGL erst, wenn sie in die Nähe kommen.
  const [near, setNear] = useState(priority);
  useEffect(() => {
    if (near) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [near]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!near || !wrap || !img) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 1024px)");

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        alpha: false,
        antialias: false,
        webgl: 2,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    const gl = renderer.gl;
    if (!renderer.isWebgl2) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }
    gl.clearColor(PAPER[0], PAPER[1], PAPER[2], 1);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "halftone-canvas";
    wrap.appendChild(canvas);

    const texture = new Texture(gl, {
      generateMipmaps: true,
      minFilter: gl.LINEAR_MIPMAP_LINEAR,
      magFilter: gl.LINEAR,
    });
    const uniforms = {
      tMap: { value: texture },
      iResolution: { value: [1, 1] },
      uImageSize: { value: [1, 1] },
      uFocus: { value: focus as number[] },
      uCell: { value: cell },
      uAngle: { value: (22 * Math.PI) / 180 },
      uPaper: { value: PAPER },
      uFade: { value: [0, 0, 0, 0] },
      uLod: { value: 0 },
      uProgress: { value: reduce ? 1 : 0 },
      uMouse: { value: [-9999, -9999] },
      uActive: { value: 0 },
      uRadius: { value: 140 },
    };
    let program: Program;
    try {
      program = new Program(gl, { vertex, fragment, uniforms });
    } catch {
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    let loaded = false;
    let raf = 0;
    let t0 = 0;
    let shown = false;
    const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, a: 0, ta: 0 };

    const configure = () => {
      const isDesktop = desktop.matches;
      const f = (isDesktop && fadeDesktop) || fade;
      uniforms.uFade.value = [f.left ?? 0, f.bottom ?? 0, f.right ?? 0, f.top ?? 0];
      uniforms.uFocus.value = ((isDesktop && focusDesktop) || focus) as number[];
      const w = wrap.clientWidth || 1;
      const h = wrap.clientHeight || 1;
      renderer.setSize(w, h);
      uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height];
      uniforms.uCell.value = cell * renderer.dpr;
      uniforms.uRadius.value = 150 * renderer.dpr;
      const [iw, ih] = uniforms.uImageSize.value;
      const ia = iw / ih;
      const pa = gl.canvas.width / gl.canvas.height;
      const visibleTexels = pa > ia ? iw : ih * pa;
      const texelsPerPx = visibleTexels / gl.canvas.width;
      uniforms.uLod.value = Math.max(0, Math.log2(Math.max(1, uniforms.uCell.value * texelsPerPx)) - 0.6);
    };

    const frame = (now: number) => {
      raf = 0;
      let more = false;
      if (uniforms.uProgress.value < 1) {
        if (!t0) t0 = now;
        uniforms.uProgress.value = Math.min(1, (now - t0) / 1700);
        more = true;
      }
      mouse.sx += (mouse.x - mouse.sx) * 0.2;
      mouse.sy += (mouse.y - mouse.sy) * 0.2;
      mouse.a += (mouse.ta - mouse.a) * 0.12;
      if (Math.abs(mouse.x - mouse.sx) > 0.5 || Math.abs(mouse.y - mouse.sy) > 0.5 || Math.abs(mouse.ta - mouse.a) > 0.002) more = true;
      uniforms.uMouse.value = [mouse.sx, mouse.sy];
      uniforms.uActive.value = mouse.a;
      renderer.render({ scene: mesh });
      if (!shown) {
        shown = true;
        setReady(true);
      }
      if (more) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (loaded && !raf) raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(() => {
      configure();
      kick();
    });
    ro.observe(wrap);
    const onMq = () => {
      configure();
      kick();
    };
    desktop.addEventListener("change", onMq);

    const load = () => {
      const source = new window.Image();
      source.decoding = "async";
      source.src = img.currentSrc || img.src;
      source.onload = () => {
        texture.image = source;
        uniforms.uImageSize.value = [source.naturalWidth, source.naturalHeight];
        loaded = true;
        configure();
        kick();
      };
    };
    if (img.complete && img.naturalWidth) load();
    else img.addEventListener("load", load, { once: true });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduce) return;
      const r = wrap.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * renderer.dpr;
      mouse.y = (r.bottom - e.clientY) * renderer.dpr;
      if (mouse.sx < -999) {
        mouse.sx = mouse.x;
        mouse.sy = mouse.y;
      }
      mouse.ta = 1;
      kick();
    };
    const onLeave = () => {
      mouse.ta = 0;
      kick();
    };
    const target = wrap.parentElement ?? wrap;
    target.addEventListener("pointermove", onMove, { passive: true });
    target.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      desktop.removeEventListener("change", onMq);
      img.removeEventListener("load", load);
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
    // Einmal pro Bild aufsetzen; Fade und Fokus sind feste Gestaltungswerte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src.src, near]);

  return (
    <div ref={wrapRef} className={`halftone ${className}`} data-ready={ready || undefined}>
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        quality={82}
        placeholder="blur"
        className="halftone-img object-cover"
        style={
          {
            "--focus": `${focus[0] * 100}% ${focus[1] * 100}%`,
            "--focus-lg": `${(focusDesktop ?? focus)[0] * 100}% ${(focusDesktop ?? focus)[1] * 100}%`,
            "--fade-mask": fadeMask(fade),
            "--fade-mask-lg": fadeMask(fadeDesktop ?? fade),
          } as React.CSSProperties
        }
      />
    </div>
  );
}
