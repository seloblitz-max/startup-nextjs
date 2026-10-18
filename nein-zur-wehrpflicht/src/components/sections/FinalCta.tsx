"use client";

import { ArrowRight, Ticket } from "@phosphor-icons/react";
import Image from "next/image";
import { useVote } from "@/components/vote/VoteProvider";
import schild from "@/img/foto-schild.jpg";
import { CITY_BY_ID } from "@/lib/cities";
import { voteStore } from "@/lib/vote-store";

export default function FinalCta() {
  const mine = useVote((s) => s.mine);
  const city = mine ? CITY_BY_ID[mine.city] : null;

  return (
    <section aria-labelledby="final-h" className="section text-center">
      <div className="container-page">
        <Image
          src={schild}
          alt="Pappschild auf einer Demonstration: Fight today for a better tomorrow."
          sizes="(min-width: 1240px) 1160px, (min-width: 1024px) calc(100vw - 5rem), (min-width: 640px) calc(100vw - 3rem), 100vw"
          className="photo mb-12 aspect-[16/9] lg:aspect-[2/1]"
        />
        <p className="eyebrow">Samstag, 31. Oktober, ab 14 Uhr</p>
        <h2 id="final-h" className="t-h1 mx-auto mt-4 max-w-[16ch]">
          Ohne uns läuft die Zukunft <span className="text-orange">nicht!</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[32rem]">
          {city
            ? `Je mehr wir sind, desto lauter wird es. Schick dein Ticket für ${city.name} an deine Freund*innen.`
            : "Jede Zusage zeigt, wie viele wir sind. Sag, wo du dabei bist, und bring deine Leute mit."}
        </p>
        <div className="mt-8 flex justify-center">
          {city ? (
            <button type="button" className="btn btn-lg btn-light" onClick={voteStore.openSheet}>
              <Ticket weight="bold" className="size-5" aria-hidden="true" />
              Ticket teilen
            </button>
          ) : (
            <a href="#staedte" className="btn btn-lg btn-primary group">
              Stadt wählen
              <ArrowRight weight="bold" className="size-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </a>
          )}
        </div>
        <p className="signature mt-12 text-[1.25rem] sm:text-[1.5rem]">#GENZREGELT</p>
      </div>
    </section>
  );
}
