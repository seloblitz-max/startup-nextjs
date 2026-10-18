"use client";

// Basiert auf "CircularText" aus React Bits (MIT + Commons Clause, siehe README in diesem Ordner).
// Angepasst: Text läuft als SVG-Pfad (gestochen scharf in jeder Größe), Mitte frei für ein Symbol,
// dreht nicht bei reduzierter Bewegung.

import { motion, useAnimation, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useId, type ReactNode } from "react";

const spin = (duration: number, from: number) => ({
  rotate: { from, to: from + 360, ease: "linear" as const, duration, repeat: Infinity, type: "tween" as const },
});

export default function CircularBadge({
  text,
  children,
  duration = 24,
  className = "",
}: {
  text: string;
  children?: ReactNode;
  duration?: number;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reduce = useReducedMotion();
  const controls = useAnimation();
  const rotation = useMotionValue(0);

  useEffect(() => {
    if (reduce) return;
    controls.start({ rotate: rotation.get() + 360, transition: spin(duration, rotation.get()) });
  }, [controls, duration, reduce, rotation]);

  const speed = (d: number) => {
    if (reduce) return;
    const from = rotation.get();
    controls.start({ rotate: from + 360, transition: spin(d, from) });
  };

  return (
    <div
      className={`relative grid aspect-square place-items-center ${className}`}
      onPointerEnter={() => speed(duration / 4)}
      onPointerLeave={() => speed(duration)}
    >
      <motion.svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" style={{ rotate: rotation }} animate={controls} aria-hidden="true">
        <defs>
          <path id={`c${id}`} d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
        </defs>
        <text className="fill-current font-display text-[21px] font-extrabold uppercase tracking-[0.2em]">
          <textPath href={`#c${id}`} textLength="476" lengthAdjust="spacingAndGlyphs">
            {text}
          </textPath>
        </text>
      </motion.svg>
      <div className="relative">{children}</div>
    </div>
  );
}
