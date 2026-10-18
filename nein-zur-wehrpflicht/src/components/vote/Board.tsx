import { MapPinPlus } from "@phosphor-icons/react/ssr";
import TopicLink from "@/components/contact/TopicLink";
import { CITY_COUNT, LEAD_CITIES } from "@/lib/cities";
import CityList from "./CityList";
import CityMap from "./CityMap";
import CityPanel from "./CityPanel";
import TotalStat from "./TotalStat";

function MapLegend() {
  return (
    <div>
      <h3 className="t-label font-bold text-soft">Legende</h3>
      <ul className="mt-3 grid gap-3">
        <li className="flex gap-3">
          <span className="legend-dot is-lead" aria-hidden="true" />
          <span>
            <strong className="font-bold text-orange">Orange:</strong> Städte, für die wir hauptverantwortlich sind (Inhalte,
            Organisation)
          </span>
        </li>
        <li className="flex gap-3">
          <span className="legend-dot" aria-hidden="true" />
          <span>
            <strong className="font-bold">Weiß:</strong> weitere Städte auf der Plattform
          </span>
        </li>
      </ul>
      <p className="mt-4 flex gap-3 border-t border-mark-2 pt-4">
        <MapPinPlus weight="bold" className="mt-0.5 size-5 shrink-0 text-soft" aria-hidden="true" />
        <span>
          Deine Stadt fehlt auf der Karte?{" "}
          <TopicLink topic="stadt" className="link">
            Dann meld dich bei uns.
          </TopicLink>
        </span>
      </p>
    </div>
  );
}

export default function Board() {
  return (
    <section id="staedte" aria-labelledby="staedte-h" className="section">
      <div className="container-page">
        <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow">Live-Abstimmung</p>
            <h2 id="staedte-h" className="t-h2 mt-3">
              Wo bist du dabei?
            </h2>
            <p className="mt-4 max-w-[38rem]">
              Tipp auf deine Stadt und sag zu. Jedes Gerät zählt einmal, und alle sehen live, wie viele kommen. In{" "}
              {LEAD_CITIES.length} von {CITY_COUNT} Städten organisieren wir den Protest selbst.
            </p>
          </div>
          <div className="lg:col-span-5 lg:justify-self-end">
            <TotalStat />
          </div>
        </header>

        <div className="board-grid mt-10 lg:mt-14">
          <div className="board-map">
            <CityMap />
          </div>
          <div className="board-aside">
            <MapLegend />
            <CityPanel />
          </div>
          <div className="board-list">
            <CityList />
          </div>
        </div>
      </div>
    </section>
  );
}
