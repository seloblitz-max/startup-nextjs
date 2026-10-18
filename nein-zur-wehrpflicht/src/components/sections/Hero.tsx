import Image from "next/image";
import { NowOrNever } from "@/components/brand/Sticker";
import megafon from "@/img/foto-megafon.jpg";
import { CITY_COUNT } from "@/lib/cities";
import { DOCUMENTS, WHO } from "@/lib/content";
import HeroActions from "./HeroActions";

const PAPER = DOCUMENTS[0].file;

export default function Hero() {
  return (
    <section aria-labelledby="hero-h" className="relative isolate overflow-hidden">
      {/* Hintergrundzeichen in #2A2A2A, nur hinter dem Sticker, nie hinter kleiner Schrift */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 top-24 -z-10 hidden select-none text-[17rem] font-black leading-none text-mark lg:block xl:text-[20rem]"
      >
        31.10.
      </p>

      <div className="container-page grid gap-10 pb-16 pt-24 sm:pt-28 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-24 lg:pt-36">
        <div className="lg:col-span-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Bundesweiter Protest der Generation Z</p>
              <p className="mt-2 font-bold sm:text-[1.25rem] sm:leading-7">
                Samstag, 31. Oktober 2026
                <br />
                ab 14 Uhr in {CITY_COUNT} Städten
              </p>
            </div>
            <NowOrNever className="w-[6.5rem] shrink-0 -rotate-6 sm:w-32 lg:hidden" />
          </div>

          <h1 id="hero-h" className="t-h1 mt-8">
            Unsere Zukunft liegt in <span className="text-orange">unseren Händen.</span>
          </h1>

          <p className="t-text mt-6 max-w-[36rem]">
            {WHO} Am 31. Oktober gehen wir in {CITY_COUNT} Städten gleichzeitig auf die Straße: für Bildung, Gesundheit und
            ein bezahlbares Leben, gegen die Wehrpflicht und gegen einen Sparkurs auf unserem Rücken. Was wir fordern, steht in
            unserem{" "}
            <a href={PAPER} className="link" target="_blank" rel="noopener">
              Positionspapier
            </a>
            .
          </p>

          <HeroActions />
        </div>

        {/* Foto wie ein Plakat, der Sticker klebt auf der Ecke. Auf dem Handy steht das Foto unter den Knöpfen. */}
        <div className="relative lg:col-span-5">
          <Image
            src={megafon}
            alt="Eine junge Frau ruft auf einer Demonstration in ein Megafon."
            sizes="(min-width: 1280px) 430px, (min-width: 1024px) 36vw, (min-width: 640px) 36rem, 100vw"
            loading="eager"
            className="photo aspect-[4/3] object-top sm:max-w-[36rem] lg:ml-auto lg:aspect-[4/5] lg:w-[86%]"
          />
          <NowOrNever className="absolute -bottom-10 -left-2 hidden w-[44%] -rotate-6 lg:block" />
        </div>
      </div>
    </section>
  );
}
