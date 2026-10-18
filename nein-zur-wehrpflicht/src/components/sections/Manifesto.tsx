import HalftonePhoto from "@/components/bits/HalftonePhoto";
import Reveal from "@/components/Reveal";
import schild from "@/img/schild.jpg";

const POINTS = [
  {
    t: "Unsere Zukunft ist kein Nebensatz.",
    d: "Ausbildung, Studium, erster Job: Die Jahre nach der Schule prägen unser ganzes Leben. Wer darüber entscheidet, muss mit uns reden, nicht über uns.",
  },
  {
    t: "Perspektiven statt Pflicht.",
    d: "Wir wollen gute Schulen, Ausbildungsplätze und bezahlbare Wohnungen. Keinen Zwang, der ganze Jahrgänge verplant.",
  },
  {
    t: "Friedlich. Laut. Gemeinsam.",
    d: "Wir stehen zusammen, über alle Unterschiede hinweg. Ohne Gewalt, mit klarer Haltung. Für unsere Zukunft, gemeinsam für Deutschland.",
  },
];

export default function Manifesto() {
  return (
    <section id="warum" aria-labelledby="warum-h" className="relative border-t border-line">
      <div className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Reveal className="lg:sticky lg:top-24">
              <div className="relative aspect-[6/5] w-full">
                <HalftonePhoto
                  src={schild}
                  alt="Symbolbild: Protestschild mit der Aufschrift Keine Wehrpflicht"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  focus={[0.5, 0.4]}
                  fade={{ left: 0.1, bottom: 0.32, right: 0.1, top: 0.08 }}
                  cell={5}
                />
                <span className="photo-credit">Symbolbild</span>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:pl-6">
            <Reveal>
              <p className="eyebrow">Warum wir auf die Straße gehen</p>
              <h2 id="warum-h" className="section-title mt-4">
                Über unsere Zukunft <span className="text-signal">reden wir mit.</span>
              </h2>
            </Reveal>
            <ol className="mt-12 border-t border-line">
              {POINTS.map((p, i) => (
                <Reveal as="li" key={p.t} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-line py-8 sm:grid-cols-[4.5rem_1fr] lg:py-10">
                  <span className="pt-1 font-mono text-sm text-signal-hi">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-[2rem] font-extrabold uppercase leading-[0.95] sm:text-[2.6rem]">{p.t}</h3>
                    <p className="mt-4 max-w-[34rem] text-[1.05rem] leading-relaxed text-paper-2">{p.d}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
