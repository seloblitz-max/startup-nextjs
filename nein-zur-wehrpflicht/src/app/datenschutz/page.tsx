import Link from "next/link";

export const metadata = { title: "Datenschutz · Nein zur Wehrpflicht" };

export default function Datenschutz() {
  return (
    <main className="legal">
      <div className="inner">
        <Link href="/">← Zurück</Link>
        <h1>Datenschutz</h1>
        <p>
          Verantwortlich ist die im <Link href="/impressum">Impressum</Link> genannte Stelle. Wir wollen so wenig über dich
          wissen wie möglich.
        </p>
        <h2>Was wir speichern</h2>
        <ul>
          <li>
            <strong>Deine Stimme:</strong> welcher Standort für eine zufällige Geräte-Kennung gewählt wurde. Kein Name, keine
            E-Mail, keine Telefonnummer.
          </li>
          <li>
            <strong>Geräte-Kennung:</strong> eine Zufallsnummer in einem Cookie und im Speicher deines Browsers. Sie sorgt
            dafür, dass jedes Gerät nur einmal zählt. Ohne sie funktioniert die Abstimmung nicht (technisch notwendig, Art. 6
            Abs. 1 lit. f DSGVO, § 25 Abs. 2 TDDDG).
          </li>
          <li>
            <strong>Schutz vor Missbrauch:</strong> aus deiner IP-Adresse bilden wir einen nicht umkehrbaren, gesalzenen Hash und
            zählen damit höchstens einen Tag lang, wie viele neue Geräte von einem Anschluss abstimmen. Die IP-Adresse selbst
            speichern wir nicht.
          </li>
        </ul>
        <h2>Wo die Daten liegen</h2>
        <p>
          Die Seite läuft bei <span className="todo">Hosting-Anbieter, z. B. Vercel Inc.</span>, die Stimmen liegen bei{" "}
          <span className="todo">Datenbank-Anbieter, z. B. Upstash</span>. Beim Aufruf verarbeitet der Hoster technisch
          notwendige Server-Logs.
        </p>
        <h2>Externe Links</h2>
        <p>Die Links zu Karten, WhatsApp und Telegram öffnen fremde Dienste erst, wenn du sie antippst.</p>
        <h2>Deine Rechte</h2>
        <p>
          Du hast das Recht auf Auskunft, Löschung, Berichtigung, Einschränkung und Beschwerde bei einer
          Datenschutz-Aufsichtsbehörde. Schreib uns dazu an die Adresse im Impressum.
        </p>
      </div>
    </main>
  );
}
