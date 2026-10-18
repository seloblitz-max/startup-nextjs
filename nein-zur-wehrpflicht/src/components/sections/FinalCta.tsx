"use client";

import { ArrowRight, Ticket } from "@phosphor-icons/react";
import Reveal from "@/components/Reveal";
import { useVote } from "@/components/vote/VoteProvider";
import { CITY_BY_ID } from "@/lib/cities";
import { voteStore } from "@/lib/vote-store";

export default function FinalCta() {
  const mine = useVote((s) => s.mine);
  const city = mine ? CITY_BY_ID[mine.city] : null;

  return (
    <section aria-labelledby="final-h" className="relative isolate overflow-hidden border-t border-line">
      <p className="final-bg" aria-hidden="true">
        Nein
      </p>
      <div className="relative mx-auto max-w-[1320px] px-4 py-24 text-center sm:px-6 lg:px-10 lg:py-36">
        <Reveal>
          <p className="marker">#GENZregelt</p>
          <h2 id="final-h" className="final-title mx-auto mt-6 font-display font-black uppercase">
            {city ? (
              <>
                Bring deine <span className="text-signal">Leute mit.</span>
              </>
            ) : (
              <>
                Sag, wo du <span className="text-signal">dabei bist.</span>
              </>
            )}
          </h2>
          <p className="mx-auto mt-6 max-w-[30rem] text-[1.05rem] leading-relaxed text-paper-2">
            {city
              ? `Je mehr wir sind, desto lauter wird es. Schick dein Ticket für ${city.name} an deine Freund*innen.`
              : "Samstag, 31. Oktober, 14 Uhr. Jede Zusage zeigt, wie viele wir sind."}
          </p>
          <div className="mt-10 flex justify-center">
            {city ? (
              <button type="button" className="btn btn-lg btn-paper" onClick={voteStore.openSheet}>
                <Ticket weight="bold" className="size-5" aria-hidden="true" />
                Ticket teilen
              </button>
            ) : (
              <a href="#staedte" className="btn btn-lg btn-signal group">
                Stadt wählen
                <ArrowRight weight="bold" className="size-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
