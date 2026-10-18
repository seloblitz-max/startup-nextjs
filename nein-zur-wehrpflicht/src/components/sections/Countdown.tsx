"use client";

import { useEffect, useState } from "react";
import FlapText from "@/components/bits/FlapText";
import { EVENT_END, EVENT_START } from "@/lib/cities";

const pad = (n: number) => String(n).padStart(2, "0");

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export default function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(Date.now());
      t = setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    tick();
    return () => clearTimeout(t);
  }, []);

  if (now !== null && now >= EVENT_END) {
    return <p className="font-display text-4xl font-extrabold uppercase leading-tight">Danke an alle, die auf der Straße waren.</p>;
  }
  if (now !== null && now >= EVENT_START) {
    return (
      <p className="font-display text-5xl font-black uppercase leading-[0.95] text-signal">
        Es läuft.
        <br />
        <span className="text-paper">Komm vorbei.</span>
      </p>
    );
  }

  const p = now === null ? null : parts(EVENT_START - now);
  const groups: Array<[string, string]> = [
    [p ? pad(p.d) : "--", "Tage"],
    [p ? pad(p.h) : "--", "Std"],
    [p ? pad(p.m) : "--", "Min"],
    [p ? pad(p.s) : "--", "Sek"],
  ];

  return (
    <div>
      <p className="sr-only" aria-live="off">
        {p ? `Noch ${p.d} Tage, ${p.h} Stunden und ${p.m} Minuten bis zum Protest.` : "Countdown bis zum Protest"}
      </p>
      <div className="flex items-start gap-3 sm:gap-4" aria-hidden="true">
        {groups.map(([value, label], i) => (
          <div key={label} className="flex items-start gap-3 sm:gap-4">
            <div className="flex flex-col items-center gap-2">
              <FlapText text={value} className="text-[2.6rem] sm:text-[3.4rem] lg:text-[3.8rem]" />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-mute">{label}</span>
            </div>
            {i < groups.length - 1 ? (
              <span className="pt-[0.35em] font-display text-[1.8rem] font-black leading-none text-line-2 sm:text-[2.4rem]">:</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
