"use client";

import RollingNumber from "@/components/bits/RollingNumber";
import { useVote } from "./VoteProvider";

/** Gesamtzahl der Zusagen mit Live-Status. */
export default function TotalStat() {
  const total = useVote((s) => s.total);
  const ready = useVote((s) => s.ready);
  const live = useVote((s) => s.live);
  const setup = useVote((s) => s.setup);
  const cities = useVote((s) => Object.values(s.counts).filter((n) => n > 0).length);

  const status = !setup ? "Startet in Kürze" : live ? `Live aus ${cities} von 21 Städten` : "Verbindung wird gesucht";

  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <p className="flex items-end gap-3">
        <span className="font-display text-[4.25rem] font-black leading-[0.8] text-paper sm:text-[5.5rem]">
          {ready ? <RollingNumber value={total} /> : "0"}
        </span>
        <span className="pb-1 text-sm font-semibold leading-tight text-paper-2">
          {total === 1 ? "Zusage" : "Zusagen"}
          <br />
          bundesweit
        </span>
      </p>
      <p className="flex items-center gap-2 pb-1.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-paper-2">
        <span className={live && setup ? "live-dot" : "live-dot live-dot-off"} aria-hidden="true" />
        {status}
      </p>
    </div>
  );
}
