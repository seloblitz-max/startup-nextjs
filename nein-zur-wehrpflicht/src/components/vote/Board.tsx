import Reveal from "@/components/Reveal";
import CityList from "./CityList";
import SpikeMap from "./SpikeMap";
import TotalStat from "./TotalStat";

export default function Board() {
  return (
    <section id="staedte" aria-labelledby="staedte-h" className="relative border-t border-line bg-ink-2">
      <div className="mx-auto max-w-[1320px] px-4 pb-20 pt-16 sm:px-6 lg:px-10 lg:pb-28 lg:pt-24">
        <Reveal as="header" className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow">Live-Abstimmung</p>
            <h2 id="staedte-h" className="section-title mt-4">
              Wo bist du <span className="text-signal">dabei?</span>
            </h2>
            <p className="mt-5 max-w-[34rem] text-[1.05rem] leading-relaxed text-paper-2">
              Tipp auf deine Stadt. Jedes Gerät zählt einmal, und alle sehen live, wie viele kommen.
            </p>
          </div>
          <div className="lg:col-span-5 lg:justify-self-end">
            <TotalStat />
          </div>
        </Reveal>

        <div className="mt-12 grid gap-14 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <p className="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-mute">Alle 21 Treffpunkte</p>
              <SpikeMap />
              <p className="mt-4 text-center text-sm text-mute">
                Je höher die Spitze, desto mehr sind dabei. Tipp auf eine Stadt, dann siehst du den Treffpunkt.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <CityList />
          </div>
        </div>
      </div>
    </section>
  );
}
