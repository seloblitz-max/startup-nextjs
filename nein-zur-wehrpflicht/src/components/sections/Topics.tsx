import { FilePdf } from "@phosphor-icons/react/ssr";
import TopicArt from "@/components/brand/TopicArt";
import { DEMAND, DOCUMENTS, TOPICS } from "@/lib/content";

const PAPER = DOCUMENTS[0];

export default function Topics() {
  return (
    <section id="forderungen" aria-labelledby="forderungen-h" className="section">
      <div className="container-page">
        <div className="max-w-[46rem]">
          <p className="eyebrow">Aus unserem Positionspapier</p>
          <h2 id="forderungen-h" className="t-h2 mt-3">
            Was uns bewegt. <span className="text-orange">Was wir fordern.</span>
          </h2>
          <p className="mt-4">
            Wohin wir auch schauen, sehen wir Krisen und kaum eine Perspektive für uns. Um diese sechs Themen geht es am 31.
            Oktober.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((topic) => (
            <li key={topic.id} className="card flex flex-col">
              <TopicArt topic={topic} />
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="t-label text-soft">{topic.label}</p>
                <h3 className="t-h4 mt-2">{topic.title}</h3>
                <p className="mt-2">{topic.text}</p>
                <div className="mt-auto pt-5">
                  <div className="border-t border-line pt-4">
                    <p className="t-label font-bold text-orange">Unsere Forderung</p>
                    <p className="mt-1 font-bold">{topic.demand}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="panel-orange mt-10 p-6 sm:p-10">
          <p className="t-label font-bold">Was wir wollen</p>
          <p className="t-h3 mt-3 max-w-[52rem]">{DEMAND}</p>
          <a href={PAPER.file} target="_blank" rel="noopener" className="btn btn-dark mt-8">
            <FilePdf weight="bold" className="size-5" aria-hidden="true" />
            Positionspapier lesen
            <span className="sr-only">(PDF, {PAPER.pages})</span>
          </a>
        </div>
      </div>
    </section>
  );
}
