"use client";

// Basiert auf "ScrollVelocity" aus React Bits (MIT + Commons Clause, siehe README in diesem Ordner).
// Angepasst: eine Zeile, die innere Komponente ist nicht mehr bei jedem Rendern neu definiert,
// Breite per ResizeObserver, steht still bei reduzierter Bewegung.

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

function useWidth(ref: React.RefObject<HTMLElement | null>) {
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.offsetWidth));
    ro.observe(el);
    setW(el.offsetWidth);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

export default function VelocityMarquee({
  children,
  baseVelocity = 60,
  copies = 4,
  className = "",
}: {
  children: ReactNode;
  baseVelocity?: number;
  copies?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const copyRef = useRef<HTMLDivElement>(null);
  const width = useWidth(copyRef);
  const x = useTransform(baseX, (v) => (width ? `${wrap(-width, 0, v)}px` : "0px"));
  const dir = useRef(-1);

  useAnimationFrame((_, delta) => {
    if (reduce || !width) return;
    const f = factor.get();
    if (f < 0) dir.current = 1;
    else if (f > 0) dir.current = -1;
    let move = dir.current * baseVelocity * (delta / 1000);
    move += move * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div className="flex w-max whitespace-nowrap will-change-transform" style={{ x }}>
        {Array.from({ length: copies }, (_, i) => (
          <div key={i} ref={i === 0 ? copyRef : undefined} className="flex shrink-0 items-center" aria-hidden={i > 0}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
