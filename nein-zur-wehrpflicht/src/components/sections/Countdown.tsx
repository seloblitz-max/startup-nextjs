"use client";

import { useEffect, useState } from "react";
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
    return <p className="t-h4">Danke an alle, die auf der Straße waren. Der 31.10. war erst der Anfang.</p>;
  }
  if (now !== null && now >= EVENT_START) {
    return (
      <p className="t-h3">
        Es läuft. <span className="text-orange">Komm vorbei.</span>
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
      <p className="t-label mb-3 text-soft">Noch bis zum Start</p>
      <p className="sr-only" aria-live="off">
        {p ? `Noch ${p.d} Tage, ${p.h} Stunden und ${p.m} Minuten bis zum Protest.` : "Countdown bis zum Protest"}
      </p>
      <div className="flex gap-2 sm:gap-3" aria-hidden="true">
        {groups.map(([value, label]) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <span className="count-tile">{value}</span>
            <span className="t-label text-soft">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
