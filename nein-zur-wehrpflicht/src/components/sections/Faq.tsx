import { LEAD_CITIES } from "@/lib/cities";

const leadNames = LEAD_CITIES.map((c) => c.name);
const leadList = `${leadNames.slice(0, -1).join(", ")} und ${leadNames.at(-1)}`;

const QA = [
  {
    q: "Wer organisiert den Protest?",
    a: `Gen Z regelt, eine überparteiliche Bewegung junger Menschen. In ${leadList} sind wir hauptverantwortlich für Inhalte und Organisation. Die weiteren Städte sind auf der Plattform dabei und werden von anderen Gruppen vor Ort organisiert. Wer diese Seite betreibt, steht im Impressum.`,
  },
  {
    q: "Meine Stadt fehlt. Was kann ich tun?",
    a: "Meld dich über das Kontaktformular unten und wähl „Meine Stadt fehlt“. Schreib dazu, welche Stadt es ist und ob es dort schon einen Treffpunkt oder eine Gruppe gibt. Wir melden uns bei dir.",
  },
  {
    q: "Muss ich mich anmelden?",
    a: "Nein. Du tippst einfach auf deine Stadt. Kein Konto, keine E-Mail, keine Telefonnummer.",
  },
  {
    q: "Was speichert ihr?",
    a: "Nur, welche Stadt dein Gerät gewählt hat, unter einer zufälligen Kennung. Gegen Missbrauch zählen wir kurz, wie oft aus einem Netz abgestimmt wird, ohne die IP-Adresse zu speichern. Damit beliebte Städte weiter oben stehen, zählen wir außerdem, wie oft eine Stadt geöffnet wird, ohne dich zu erkennen. Zwei Wochen nach dem Protest wird alles gelöscht.",
  },
  {
    q: "Kann ich meine Stadt ändern?",
    a: "Ja, jederzeit. Tipp auf eine andere Stadt, dann zieht deine Zusage mit um. Gezählt wirst du immer nur einmal. Über dein Ticket kannst du die Zusage auch ganz zurückziehen.",
  },
  {
    q: "Darf ich auch mit 15 oder 16 mit?",
    a: "Ja. Für Demos gibt es kein Mindestalter. Sag deinen Eltern Bescheid, wo du bist, und geh am besten mit Freund*innen hin.",
  },
  {
    q: "Wie genau ist die Zahl?",
    a: "Jedes Gerät zählt einmal. Wer einen anderen Browser nimmt oder alle Daten löscht, zählt noch einmal. Die Zahl zeigt also, wie viele Geräte zugesagt haben, nicht exakt, wie viele Menschen kommen.",
  },
];

export default function Faq() {
  return (
    <section aria-labelledby="faq-h" className="section">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <p className="eyebrow">Kurz erklärt</p>
            <h2 id="faq-h" className="t-h2 mt-3">
              Fragen und Antworten
            </h2>
          </div>
        </div>
        <dl className="grid gap-x-8 sm:grid-cols-2 lg:col-span-8">
          {QA.map((item) => (
            <div key={item.q} className="border-t border-line py-6">
              <dt className="t-h4">{item.q}</dt>
              <dd className="mt-2">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
