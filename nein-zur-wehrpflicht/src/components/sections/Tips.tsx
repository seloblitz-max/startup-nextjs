import { BatteryFull, FirstAid, IdentificationCard, Peace, UserFocus, UsersThree } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

const TIPS: Array<{ icon: ReactNode; t: string; d: ReactNode }> = [
  {
    icon: <Peace weight="bold" />,
    t: "Bleib friedlich",
    d: "Keine Gewalt, keine Provokation. Lass dich nicht reizen und hör auf die Ordner*innen.",
  },
  {
    icon: <UsersThree weight="bold" />,
    t: "Nie allein",
    d: "Geh mit Freund*innen hin und macht einen Treffpunkt aus, falls ihr euch verliert.",
  },
  {
    icon: <UserFocus weight="bold" />,
    t: "Gesicht zeigen",
    d: "Vermummung ist auf Versammlungen verboten. Eine warme Mütze geht natürlich klar.",
  },
  {
    icon: <BatteryFull weight="bold" />,
    t: "Akku voll",
    d: "Handy laden, Powerbank einpacken. Im Gedränge ist das Netz oft langsam.",
  },
  {
    icon: <IdentificationCard weight="bold" />,
    t: "Ausweis dabei",
    d: "Steck deinen Ausweis ein. Unter 18? Sag deinen Eltern, wo du bist.",
  },
  {
    icon: <FirstAid weight="bold" />,
    t: "Im Notfall",
    d: (
      <>
        Polizei{" "}
        <a href="tel:110" className="link-inline">
          110
        </a>
        , Rettung{" "}
        <a href="tel:112" className="link-inline">
          112
        </a>
        . Bei Problemen geh zu den Ordner*innen oder zu den Sanis vor Ort.
      </>
    ),
  },
];

export default function Tips() {
  return (
    <section id="infos" aria-labelledby="infos-h" className="border-t border-line bg-ink-2">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:py-28">
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <p className="eyebrow">Gut vorbereitet</p>
            <h2 id="infos-h" className="section-title is-narrow mt-4">
              Safe auf <span className="text-signal">der Demo.</span>
            </h2>
            <p className="mt-5 max-w-[24rem] text-[1.05rem] leading-relaxed text-paper-2">
              Ende Oktober wird es früh dunkel und kalt. Zieh dich warm an und pack Wasser und etwas zu essen ein.
            </p>
          </div>
        </Reveal>
        <ul className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
          {TIPS.map((tip, i) => (
            <Reveal as="li" key={tip.t} delay={(i % 2) * 0.06} className="flex gap-5 border-t border-line py-7">
              <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-signal/12 text-[1.4rem] text-signal-hi">{tip.icon}</span>
              <div>
                <h3 className="font-display text-[1.6rem] font-extrabold uppercase leading-none">{tip.t}</h3>
                <p className="mt-2 leading-relaxed text-paper-2">{tip.d}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
