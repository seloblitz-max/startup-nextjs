import Link from "next/link";

export const metadata = { title: "Impressum · Nein zur Wehrpflicht" };

// Vor der Veröffentlichung ausfüllen: Pflichtangaben nach § 5 DDG und § 18 MStV.
export default function Impressum() {
  return (
    <main className="legal">
      <div className="inner">
        <Link href="/">← Zurück</Link>
        <h1>Impressum</h1>
        <h2>Angaben nach § 5 DDG</h2>
        <p>
          <span className="todo">Vor- und Nachname oder Name der Gruppe</span>
          <br />
          <span className="todo">Straße und Hausnummer</span>
          <br />
          <span className="todo">PLZ und Ort</span>
        </p>
        <h2>Kontakt</h2>
        <p>
          E-Mail: <span className="todo">kontakt@beispiel.de</span>
        </p>
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          <span className="todo">Name und Anschrift wie oben</span>
        </p>
        <h2>Hinweis</h2>
        <p>
          Die Treffpunkte stammen aus dem öffentlichen Aufruf zum Protest am 31. Oktober. Für die einzelnen Versammlungen sind
          die jeweiligen Anmelder*innen vor Ort verantwortlich.
        </p>
      </div>
    </main>
  );
}
