import {
  BatteryFull,
  CheckCircle,
  FirstAid,
  IdentificationCard,
  Peace,
  UserFocus,
  UsersThree,
  XCircle,
} from "@phosphor-icons/react/ssr";
import Image from "next/image";
import type { ReactNode } from "react";
import kind from "@/img/foto-kind.jpg";
import { ALLOWED, DOCUMENTS, FORBIDDEN, PRINCIPLES } from "@/lib/content";

const DECLARATION = DOCUMENTS[1];

const TIPS: Array<{ icon: ReactNode; title: string; text: ReactNode }> = [
  {
    icon: <Peace weight="bold" />,
    title: "Bleib friedlich",
    text: "Keine Gewalt, keine Provokation. Lass dich nicht reizen und hör auf die Ordner*innen.",
  },
  {
    icon: <UsersThree weight="bold" />,
    title: "Nie allein",
    text: "Geh mit Freund*innen hin und macht einen Treffpunkt aus, falls ihr euch verliert.",
  },
  {
    icon: <UserFocus weight="bold" />,
    title: "Gesicht zeigen",
    text: "Vermummung ist auf Versammlungen verboten. Eine warme Mütze geht natürlich klar.",
  },
  {
    icon: <BatteryFull weight="bold" />,
    title: "Akku voll",
    text: "Handy laden, Powerbank einpacken. Im Gedränge ist das Netz oft langsam.",
  },
  {
    icon: <IdentificationCard weight="bold" />,
    title: "Ausweis dabei",
    text: "Steck deinen Ausweis ein. Unter 18? Sag deinen Eltern, wo du bist.",
  },
  {
    icon: <FirstAid weight="bold" />,
    title: "Im Notfall",
    text: (
      <>
        Polizei{" "}
        <a href="tel:110" className="link">
          110
        </a>
        , Rettung{" "}
        <a href="tel:112" className="link">
          112
        </a>
        . Bei Problemen geh zu den Ordner*innen oder zu den Sanis vor Ort.
      </>
    ),
  },
];

/** Unsere Erklärung: Grundsätze, was geht und was nicht, und praktische Tipps für den Tag. */
export default function Demo() {
  return (
    <section id="demo" aria-labelledby="demo-h" className="section">
      <div className="container-page">
        {/* Auf dem Handy: Einstieg, Foto, Grundsätze. Ab lg steht das Foto rechts neben beidem. */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-0">
          <div className="max-w-[46rem] lg:col-span-7">
            <p className="eyebrow">Unsere Erklärung</p>
            <h2 id="demo-h" className="t-h2 mt-3">
              Friedlich, überparteilich, <span className="text-orange">für alle.</span>
            </h2>
            <p className="mt-4">
              So läuft unser Protest. Wer mitmacht, trägt diese Grundsätze mit.{" "}
              <a href={DECLARATION.file} target="_blank" rel="noopener" className="link">
                Erklärung als PDF
              </a>
            </p>
          </div>

          <Image
            src={kind}
            alt="Ein Kind sitzt auf einer Demonstration auf den Schultern eines Erwachsenen und schaut in die Menge."
            sizes="(min-width: 1280px) 460px, (min-width: 1024px) 36vw, (min-width: 640px) 28rem, 100vw"
            className="photo aspect-[4/5] sm:max-w-[28rem] lg:sticky lg:top-24 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:max-w-none lg:self-start"
          />

          <ul className="grid gap-x-8 sm:grid-cols-2 lg:col-span-7 lg:mt-10">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className="border-t border-line py-6">
                <h3 className="t-h4">{p.title}</h3>
                <p className="mt-2">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="card p-6">
            <h3 className="t-h4 flex items-center gap-2.5">
              <CheckCircle weight="fill" className="size-6 text-orange" aria-hidden="true" />
              Was für uns geht
            </h3>
            <ul className="rule-list mt-3">
              {ALLOWED.map((item) => (
                <li key={item}>
                  <CheckCircle weight="bold" className="text-orange" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="t-h4 flex items-center gap-2.5">
              <XCircle weight="fill" className="size-6" aria-hidden="true" />
              Was für uns nicht geht
            </h3>
            <ul className="rule-list mt-3">
              {FORBIDDEN.map((item) => (
                <li key={item}>
                  <XCircle weight="bold" className="text-soft" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="t-h3 mt-16">Gut vorbereitet auf die Demo</h3>
        <p className="mt-2 max-w-[40rem]">
          Ende Oktober wird es früh dunkel und kalt. Zieh dich warm an und pack Wasser und etwas zu essen ein.
        </p>
        <ul className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {TIPS.map((tip) => (
            <li key={tip.title} className="flex gap-4 border-t border-line py-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-mark text-[1.375rem] text-orange" aria-hidden="true">
                {tip.icon}
              </span>
              <div>
                <h4 className="t-h4">{tip.title}</h4>
                <p className="mt-1">{tip.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="t-statement mt-14 text-center text-[clamp(1.75rem,1.2rem+2.4vw,3rem)]">
          Friedlich. Gemeinsam.
          <br />
          <span className="text-orange">Für unsere Zukunft.</span>
        </p>
      </div>
    </section>
  );
}
