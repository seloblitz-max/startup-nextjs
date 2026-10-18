import Reveal from "@/components/Reveal";
import Countdown from "./Countdown";

export default function DateSection() {
  return (
    <section aria-labelledby="termin-h" className="mx-auto max-w-[1320px] px-4 pb-20 pt-24 sm:px-6 lg:px-10 lg:pb-28 lg:pt-36">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10">
        <Reveal className="lg:col-span-7">
          <h2 id="termin-h" className="sr-only">
            Der Termin
          </h2>
          <p className="date-giant font-display font-black text-paper" aria-label="31. Oktober">
            31.10.
          </p>
          <p className="mt-6 max-w-[28rem] font-display text-[1.9rem] font-extrabold uppercase leading-[1.02] sm:text-[2.3rem]">
            Samstag ab 14 Uhr. <span className="text-signal">Alle 21 Städte gleichzeitig.</span>
          </p>
        </Reveal>
        <Reveal className="lg:col-span-5 lg:pb-4" delay={0.1}>
          <p className="mb-5 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-paper-2">Noch bis zum Start</p>
          <Countdown />
        </Reveal>
      </div>
    </section>
  );
}
