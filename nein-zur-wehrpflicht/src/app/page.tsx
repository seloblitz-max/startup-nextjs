import Image from "next/image";
import Link from "next/link";
import Board from "@/components/Board";
import Countdown from "@/components/Countdown";
import heroPhoto from "../../public/brandenburger-tor.jpg";

const TIPS = [
  { t: "Bleib friedlich", d: "Keine Gewalt, keine Provokation. Lass dich nicht reizen und hör auf die Ordner*innen." },
  { t: "Nie allein", d: "Geh mit Freund*innen hin und macht einen Treffpunkt aus, falls ihr euch verliert." },
  { t: "Gesicht zeigen", d: "Masken, die dein Gesicht verdecken, sind auf Demos verboten. Schminke und Mütze sind okay." },
  { t: "Akku voll", d: "Handy laden, Powerbank einpacken. Im Gedränge ist das Netz oft langsam." },
  { t: "Ausweis dabei", d: "Steck deinen Ausweis ein. Unter 18? Sag deinen Eltern, wo du bist." },
  { t: "Notfall", d: "Polizei 110, Rettung 112. Bei Problemen geh zu den Ordner*innen oder zu Sanis." },
];

function Crown({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 24" aria-hidden="true">
      <path d="M3 20 L5 5 L13 13 L20 3 L27 13 L35 5 L37 20 Z" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}

const icon = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export default function Page() {
  return (
    <main>
      <header className="hero">
        <div className="hero-photo">
          <Image src={heroPhoto} alt="" fill priority sizes="(min-width: 900px) 60vw, 100vw" placeholder="blur" />
        </div>
        <div className="inner">
          <div className="topbar">
            <span className="eyebrow">
              <span className="flag" aria-hidden="true" />
              Protest für die Welt · bundesweit
            </span>
            <span className="live-chip">
              <span className="live-dot" aria-hidden="true" /> Abstimmung live
            </span>
          </div>
          <div className="hero-copy">
            <Crown className="crown" />
            <h1 className="headline">
              <span className="line">Gen Z</span>
              <span className="line red">steht auf.</span>
            </h1>
            <p className="slogan">
              <span>Unsere Zukunft ist kein Nebensatz.</span>
            </p>
            <p className="hero-sub">
              Nein zur Wehrpflicht. Wir demonstrieren für unsere Zukunft, gemeinsam für Deutschland.
            </p>
            <a className="cta" href="#staedte">
              Ich bin dabei <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </header>

      <section className="facts" aria-label="Eckdaten">
        <div className="inner facts-row">
          <div className="fact">
            <svg className="fact-icon" viewBox="0 0 24 24" aria-hidden="true" {...icon}>
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4M7.5 14h.01M12 14h.01M16.5 14h.01M7.5 17.5h.01M12 17.5h.01" />
            </svg>
            <div>
              <strong className="fact-big">31. Oktober</strong>
              <span className="fact-small">ab 14:00 Uhr</span>
            </div>
          </div>
          <div className="fact">
            <span className="brush-pill">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"
                />
              </svg>
              Deutschlandweit
            </span>
          </div>
          <div className="fact">
            <Crown className="fact-icon" />
            <div>
              <strong className="fact-big">21 Städte</strong>
              <span className="fact-small">gleichzeitig</span>
            </div>
          </div>
        </div>
      </section>

      <section className="against" aria-labelledby="against-h">
        <div className="inner">
          <h2 className="sr-only" id="against-h">
            Wofür wir stehen
          </h2>
          <div className="against-grid">
            <div className="stance">
              <span className="stance-kicker">Gegen</span>
              <svg className="stance-icon" viewBox="0 0 64 64" aria-hidden="true">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5" />
                <path d="M21 30a11 11 0 0 1 22 0v2H21Z M18 33h28 M27 38v8 M37 38v8" fill="none" stroke="#f3f2ee" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M13 51 51 13" stroke="currentColor" strokeWidth="5" />
              </svg>
              <h3>Die Wehrpflicht</h3>
              <p>Unsere Zukunft verdient Perspektiven, keine erzwungene Lebensplanung.</p>
            </div>
            <div className="stance">
              <span className="stance-kicker">Für</span>
              <svg className="stance-icon" viewBox="0 0 64 64" aria-hidden="true">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5" />
                <path d="M32 6v52M32 32 13.6 50.4M32 32l18.4 18.4" stroke="#f3f2ee" strokeWidth="4" />
              </svg>
              <h3>Frieden</h3>
              <p>Wir wollen lernen, arbeiten und leben, nicht für Kriege eingeplant werden.</p>
            </div>
            <div className="stance">
              <span className="stance-kicker">Für</span>
              <svg className="stance-icon" viewBox="0 0 64 64" aria-hidden="true">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5" />
                <path d="M32 46s-14-8.4-14-18a7.5 7.5 0 0 1 14-3.8A7.5 7.5 0 0 1 46 28c0 9.6-14 18-14 18Z" fill="none" stroke="#f3f2ee" strokeWidth="3.5" strokeLinejoin="round" />
              </svg>
              <h3>Mitsprache</h3>
              <p>Über unsere Jahre entscheidet niemand ohne uns. Gemeinsam für Deutschland.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="countdown-sec" aria-labelledby="cd-h">
        <div className="inner">
          <span className="eyebrow" id="cd-h">
            Noch bis Samstag, 14:00 Uhr
          </span>
          <Countdown />
        </div>
      </section>

      <Board />

      <section className="call">
        <div className="inner">
          <p className="brush-banner">
            <span>Bring Schilder mit. Bleib friedlich. Sei laut.</span>
          </p>
          <ul className="values">
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true" {...icon}>
                <circle cx="9" cy="8" r="3.2" />
                <circle cx="17" cy="9" r="2.6" />
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14.5 14.4c.8-.3 1.6-.4 2.5-.4 2.8 0 5 2.2 5 5" />
              </svg>
              <span>Jede*r ist willkommen.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true" {...icon}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v18M12 12l-6.4 6.4M12 12l6.4 6.4" />
              </svg>
              <span>Friedlich. Respektvoll. Gemeinsam.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true" {...icon}>
                <path d="M12 20s-8-4.8-8-10.3A4.3 4.3 0 0 1 12 7.5a4.3 4.3 0 0 1 8 2.2C20 15.2 12 20 12 20Z" />
              </svg>
              <span>Deine Stimme zählt. Dein Engagement zählt.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="safety" aria-labelledby="safe-h">
        <div className="inner">
          <h2 className="section-title" id="safe-h">
            <span className="underline">Safe auf der Demo</span>
          </h2>
          <ul className="tips">
            {TIPS.map((tip) => (
              <li className="tip" key={tip.t}>
                <h3>{tip.t}</h3>
                <p>{tip.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="footer">
        <div className="inner">
          <div className="footer-top">
            <p className="motto">Für unsere Zukunft. Gemeinsam für Deutschland.</p>
            <p className="hashtag">
              <Crown className="crown small" />
              #GENZregelt
            </p>
          </div>
          <p className="note">
            Deine Stimme ist anonym. Wir speichern keine Namen, keine Telefonnummern und keine IP-Adressen. Pro Gerät zählt
            eine Stimme.
          </p>
          <nav className="footer-links" aria-label="Rechtliches">
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
