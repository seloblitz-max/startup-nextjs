import { ArrowRight, GlobeHemisphereEast } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import haende from "@/img/foto-haende.jpg";
import { ABROAD, BEGINNING, VALUES } from "@/lib/content";

export default function Values() {
  return (
    <section id="haltung" aria-labelledby="haltung-h" className="section">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <p className="eyebrow">Wofür wir stehen</p>
            <h2 id="haltung-h" className="t-h2 mt-3">
              Für die Menschen. <span className="text-orange">Nicht für eine Partei.</span>
            </h2>
            <p className="mt-4 max-w-[26rem]">
              Egal ob links, rechts oder dazwischen: Unsere gemeinsamen Probleme sind wichtiger als das, was uns trennt.
            </p>
            <Image
              src={haende}
              alt="Viele Hände unterschiedlicher Menschen liegen übereinander."
              sizes="(min-width: 1280px) 352px, (min-width: 1024px) 28vw, (min-width: 640px) 28rem, 100vw"
              className="photo mt-8 aspect-square sm:max-w-[28rem] lg:max-w-[22rem]"
            />
          </div>
        </div>

        <div className="lg:col-span-8">
          <ol className="grid gap-x-8 sm:grid-cols-2">
            {VALUES.map((value, i) => (
              <li key={value.title} className="border-t border-line py-6">
                <p className="t-label font-bold text-orange">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="t-h4 mt-2">{value.title}</h3>
                <p className="mt-2">{value.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <article className="card p-6">
              <GlobeHemisphereEast weight="bold" className="size-7 text-orange" aria-hidden="true" />
              <h3 className="t-h4 mt-4">{ABROAD.title}</h3>
              <p className="mt-2">{ABROAD.text}</p>
            </article>
            <article className="card p-6">
              <ArrowRight weight="bold" className="size-7 text-orange" aria-hidden="true" />
              <h3 className="t-h4 mt-4">{BEGINNING.title}</h3>
              <p className="mt-2">{BEGINNING.text}</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
