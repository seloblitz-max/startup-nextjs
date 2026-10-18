"use client";

// Basiert auf "Counter" aus React Bits (MIT + Commons Clause, siehe README in diesem Ordner).
// Angepasst: Tausenderpunkt, Größe kommt aus CSS (em statt px), Screenreader lesen die ganze Zahl.

import { motion, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect } from "react";
import { fmt } from "@/lib/format";

const SPRING = { stiffness: 120, damping: 20, mass: 0.9 };

function Glyph({ mv, n }: { mv: MotionValue<number>; n: number }) {
  const y = useTransform(mv, (latest) => {
    const place = ((latest % 10) + 10) % 10;
    let offset = (10 + n - place) % 10;
    if (offset > 5) offset -= 10;
    return `${offset * 100}%`;
  });
  return (
    <motion.span className="absolute inset-0 flex items-center justify-center" style={{ y }}>
      {n}
    </motion.span>
  );
}

function Digit({ place, value }: { place: number; value: number }) {
  const target = Math.floor(value / place);
  const reduce = useReducedMotion();
  const mv = useSpring(target, SPRING);
  useEffect(() => {
    if (reduce) mv.jump(target);
    else mv.set(target);
  }, [mv, target, reduce]);
  return (
    <span className="relative inline-block h-[1em] w-[1ch] overflow-hidden" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <Glyph key={i} mv={mv} n={i} />
      ))}
    </span>
  );
}

export default function RollingNumber({ value, className = "" }: { value: number; className?: string }) {
  const safe = Math.max(0, Math.floor(value));
  const digits = String(safe).length;
  const places = Array.from({ length: digits }, (_, i) => 10 ** (digits - 1 - i));
  return (
    <span className={`inline-flex items-center leading-none tabular-nums ${className}`}>
      <span className="sr-only">{fmt(safe)}</span>
      {places.map((place, i) => {
        const fromRight = digits - 1 - i;
        return (
          <span key={place} className="inline-flex items-center" aria-hidden="true">
            <Digit place={place} value={safe} />
            {fromRight > 0 && fromRight % 3 === 0 ? <span className="inline-block">.</span> : null}
          </span>
        );
      })}
    </span>
  );
}
