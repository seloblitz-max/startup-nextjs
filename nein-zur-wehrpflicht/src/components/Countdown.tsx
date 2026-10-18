"use client";

import { useEffect, useState } from "react";
import { EVENT_START } from "@/lib/cities";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    [Math.floor(s / 86400), "Tage"],
    [Math.floor((s % 86400) / 3600), "Std"],
    [Math.floor((s % 3600) / 60), "Min"],
    [s % 60, "Sek"],
  ] as const;
}

export default function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const left = now === null ? null : EVENT_START - now;
  if (left !== null && left <= 0) {
    return <div className="cd-now">Jetzt. Auf die Straße.</div>;
  }
  return (
    <div className="countdown" role="timer" aria-label="Countdown bis zum Protest">
      {parts(left ?? 0).map(([v, label]) => (
        <div className="cd-cell" key={label}>
          <span className="cd-num">{left === null ? "––" : String(v).padStart(2, "0")}</span>
          <span className="cd-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
