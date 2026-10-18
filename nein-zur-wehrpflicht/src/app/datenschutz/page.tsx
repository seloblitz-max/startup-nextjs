import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Datenschutz", alternates: { canonical: "/datenschutz" } };

export default function Datenschutz() {
  return (
    <LegalPage title="Datenschutz">
      <p>
        Wir wollen so wenig über dich wissen wie möglich. Es gibt kein Konto, kein Tracking, keine Werbung und keine
        Analyse-Tools. Verantwortlich ist die im <Link href="/impressum">Impressum</Link> genannte Stelle.
      </p>

      <h2>Wenn du die Seite aufrufst</h2>
      <p>
        Die Seite läuft bei <mark className="todo">Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA</mark>. Beim
        Aufruf verarbeitet der Hoster technisch notwendige Daten wie IP-Adresse, Zeitpunkt und aufgerufene Adresse, um die
        Seite auszuliefern und vor Angriffen zu schützen (Art. 6 Abs. 1 lit. f DSGVO). Die Übermittlung in die USA stützt sich
        auf das EU-US Data Privacy Framework und die Standardvertragsklauseln der EU-Kommission. Schriften und Bilder kommen
        von unserer eigenen Domain, es werden keine Inhalte von Google oder anderen Diensten nachgeladen.
      </p>

      <h2>Wenn du „Ich bin dabei“ tippst</h2>
      <ul>
        <li>
          <strong>Geräte-Kennung:</strong> Dein Gerät bekommt eine zufällige, vom Server signierte Kennung. Sie liegt in einem
          Cookie (<code>wp_device</code>, 120 Tage) und im Speicher deines Browsers (<code>wp-device-token</code>). Sie sorgt
          dafür, dass jedes Gerät nur einmal zählt und du deine Stadt wechseln kannst. Ohne sie geht die Abstimmung nicht
          (§ 25 Abs. 2 Nr. 2 TDDDG, Art. 6 Abs. 1 lit. f DSGVO).
        </li>
        <li>
          <strong>Deine Zusage:</strong> Zu dieser Kennung speichern wir die gewählte Stadt und deine Nummer in dieser Stadt.
          Kein Name, keine E-Mail, keine Telefonnummer.
        </li>
        <li>
          <strong>Schutz vor Missbrauch:</strong> Aus deiner IP-Adresse bilden wir das Netz (bei IPv6 die ersten 64 Bit) und
          daraus einen nicht umkehrbaren, geheimen Hash. Damit zählen wir, wie viele Stimmen pro Minute (gelöscht nach zwei
          Minuten) und wie viele neue Geräte pro Tag (gelöscht nach gut einem Tag) aus einem Netz kommen. Die IP-Adresse selbst
          speichern wir nicht.
        </li>
        <li>
          <strong>Zählerstand:</strong> Pro Stadt speichern wir nur eine Gesamtzahl. Sie enthält keine Daten über einzelne
          Personen.
        </li>
      </ul>
      <p>
        Die Daten liegen bei <mark className="todo">Upstash, Inc. (Redis-Datenbank, Region Frankfurt)</mark>. Alle
        Geräte-Einträge löschen sich zwei Wochen nach dem Protest automatisch, also am 14. November 2026.
      </p>

      <h2>Zusage zurückziehen</h2>
      <p>
        Du kannst deine Zusage jederzeit selbst löschen: Öffne dein Ticket und tippe auf „Zusage zurückziehen“. Danach ist
        der Eintrag zu deiner Kennung gelöscht. Wenn du zusätzlich Cookies und Website-Daten in deinem Browser löschst, ist
        auch die Kennung auf deinem Gerät weg.
      </p>

      <h2>Externe Links</h2>
      <p>
        Die Links zu Google Maps und WhatsApp öffnen fremde Dienste erst, wenn du sie antippst. Dann gelten deren
        Datenschutzbestimmungen.
      </p>

      <h2>Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch und Beschwerde bei
        einer Datenschutz-Aufsichtsbehörde. Da wir nicht wissen, wer du bist, können wir deinen Eintrag nur über die
        Kennung auf deinem Gerät finden. Schreib uns dazu an die Adresse im Impressum.
      </p>
    </LegalPage>
  );
}
