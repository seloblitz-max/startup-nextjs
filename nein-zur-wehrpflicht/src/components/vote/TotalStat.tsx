"use client";

import RollingNumber from "@/components/bits/RollingNumber";
import { CITY_COUNT } from "@/lib/cities";
import { useVote } from "./VoteProvider";

/** Gesamtzahl der Zusagen mit Live-Status. */
export default function TotalStat() {
  const total = useVote((s) => s.total);
  const ready = useVote((s) => s.ready);
  const live = useVote((s) => s.live);
  const setup = useVote((s) => s.setup);
  const cities = useVote((s) => Object.values(s.counts).filter((n) => n > 0).length);

  const status = !setup
    ? "Startet in Kürze"
    : live
      ? `Live aus ${cities} von ${CITY_COUNT} Städten`
      : ready
        ? "Verbindung wird gesucht"
        : "Zahlen werden geladen";

  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <p className="flex items-end gap-3">
        <span className="text-[3.5rem] font-black leading-[0.85] sm:text-[4rem]">
          {ready ? <RollingNumber value={total} /> : <span className="text-mute">–</span>}
        </span>
        <span className="pb-0.5 leading-tight">
          {total === 1 ? "Zusage" : "Zusagen"}
          <br />
          bundesweit
        </span>
      </p>
      <p className="t-label flex items-center gap-2 pb-1 text-soft">
        <span className={live && setup ? "live-dot" : "live-dot live-dot-off"} aria-hidden="true" />
        {status}
      </p>
    </div>
  );
}
