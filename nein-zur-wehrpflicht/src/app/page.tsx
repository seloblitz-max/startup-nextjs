import Link from "next/link";
import Board from "@/components/Board";
import Countdown from "@/components/Countdown";

const SLOGANS = [
  "Kein Bock auf Wehrpflicht",
  "Frieden statt Front",
  "Unsere Zukunft, unsere Entscheidung",
  "31.10. · 14 Uhr · 21 Städte",
];

const TIPS = [
  { t: "Bleib friedlich", d: "Keine Gewalt, keine Provokation. Lass dich nicht reizen und hör auf die Ordner*innen." },
  { t: "Nie allein", d: "Geh mit deiner Crew hin und macht einen Treffpunkt aus, falls ihr euch verliert." },
  { t: "Akku voll", d: "Handy laden, Powerbank einpacken. Im Gedränge ist das Netz oft langsam." },
  { t: "Wasser & Snacks", d: "Eine Flasche Wasser und was zu essen. Und zieh dich nach Wetter an." },
  { t: "Ausweis dabei", d: "Steck deinen Ausweis ein. Unter 18? Sag deinen Eltern, wo du bist." },
  { t: "Notfall", d: "Polizei 110, Rettung 112. Bei Problemen geh zu den Ordner*innen oder zu Sanis." },
];

export default function Page() {
  const marquee = [...SLOGANS, ...SLOGANS];
  return (
    <main>
      <header className="hero">
        <div className="inner">
          <div className="topbar">
            <span className="eyebrow">Protest für die Welt · bundesweit</span>
            <span className="live-chip">
              <span className="live-dot" aria-hidden="true" /> Abstimmung läuft live
            </span>
          </div>
          <h1 className="headline">
            <span className="line">
              Nein <span className="light">zur</span>
            </span>
            <span className="line">
              Wehr<wbr />pflicht
            </span>
          </h1>
          <p className="hero-sub">
            Wir sind die Generation, die eingezogen werden soll. Also reden wir mit. Am Samstag, 31. Oktober, in 21 Städten
            gleichzeitig.
          </p>
          <div className="stickers" aria-label="31. Oktober, ab 14 Uhr, 21 Städte">
            <span className="sticker yellow">31.10.</span>
            <span className="sticker white">ab 14 Uhr</span>
            <span className="sticker black">21 Städte</span>
          </div>
          <a className="cta" href="#staedte">
            Ich bin dabei <span className="arrow" aria-hidden="true">↓</span>
          </a>
        </div>
      </header>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {marquee.map((s, i) => (
            <span key={i}>
              {s}
              <span className="star">✦</span>
            </span>
          ))}
        </div>
      </div>

      <section className="countdown-sec" aria-labelledby="cd-h">
        <div className="inner">
          <span className="eyebrow" id="cd-h">
            Noch bis Samstag, 14:00 Uhr
          </span>
          <Countdown />
        </div>
      </section>

      <Board />

      <section className="safety" aria-labelledby="safe-h">
        <div className="inner">
          <h2 className="section-title" id="safe-h">
            Safe auf <em>der Demo</em>
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
          <p className="motto">Gemeinsam für Gerechtigkeit, Frieden und eine bessere Zukunft.</p>
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
