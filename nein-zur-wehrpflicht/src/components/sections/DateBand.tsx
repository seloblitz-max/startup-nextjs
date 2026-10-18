import { CITY_COUNT } from "@/lib/cities";
import Countdown from "./Countdown";

/** Termin und Countdown, direkt unter dem Einstieg. */
export default function DateBand() {
  return (
    <section aria-labelledby="termin-h" className="container-page pb-16 lg:pb-24">
      <div className="card grid gap-6 p-5 sm:p-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-10">
        <h2 id="termin-h" className="sr-only">
          Termin
        </h2>
        <p className="text-[3.5rem] font-black leading-none sm:text-[4rem]" aria-label="31. Oktober">
          31.10.
        </p>
        <p className="t-h4">
          Samstag ab 14 Uhr.
          <br />
          <span className="text-orange">Alle {CITY_COUNT} Städte gleichzeitig.</span>
        </p>
        <Countdown />
      </div>
    </section>
  );
}
