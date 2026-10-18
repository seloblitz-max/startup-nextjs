/**
 * Texte der Seite aus den Papieren von Gen Z regelt (Positionspapier, Erklärung, Flyer; die PDFs liegen in
 * public/dokumente). Wer hier etwas ändert, ändert es auf der Seite. Fett gedruckte Stellen gibt es bewusst nicht:
 * Orange markiert nur einzelne Schlüsselwörter (Designguide: „Schlüsselwörter statt Farbteppich“).
 */

export type Topic = {
  id: string;
  /** Kurzes Schlagwort über der Überschrift (Label) */
  label: string;
  title: string;
  text: string;
  /** Was wir fordern, ein Satz */
  demand: string;
  /** Aufschrift des Motivs, eine Zeile pro Eintrag. Wörter in *Sternchen* werden orange. */
  sticker: string[];
};

/** Was uns bewegt, und was wir dazu fordern (Positionspapier, „Was uns bewegt“ und „Was wir wollen“). */
export const TOPICS: Topic[] = [
  {
    id: "bildung",
    label: "Bildung und Gesundheit",
    title: "Kaputte Schulen und Sparkurs",
    text: "Gespart wird bei Bildung, Sozialem, Kultur und Gesundheit. Suchtkliniken für Jugendliche schließen, Psychotherapie ist für viele kaum noch erreichbar.",
    demand: "Geld für Schulen, Suchthilfe und Psychotherapie statt Kürzungen.",
    sticker: ["*Bildung*", "statt", "Sparkurs"],
  },
  {
    id: "kosten",
    label: "Alltag",
    title: "Steigende Lebenshaltungskosten",
    text: "Preissteigerungen, hohe Steuern und Armut belasten viele Menschen im Alltag. Ihre Sorgen bekommen zu wenig Aufmerksamkeit.",
    demand: "Ein bezahlbares Leben. Die Sorgen der Menschen gehören ganz oben auf die Tagesordnung.",
    sticker: ["Leben muss", "*bezahlbar*", "sein"],
  },
  {
    id: "lasten",
    label: "Gerechtigkeit",
    title: "Ungerechte Lastenverteilung",
    text: "Die Kürzungen gehen auf unseren Rücken, während Großunternehmen weiter profitieren und Milliarden in Aufrüstung fließen.",
    demand: "Lasten gerecht verteilen, statt bei der jungen Generation zu sparen.",
    sticker: ["*Nicht* auf", "unserem", "Rücken"],
  },
  {
    id: "wehrpflicht",
    label: "Wehrpflicht",
    title: "Wehrpflicht und Musterung",
    text: "Wir sollen für Kriege ausgebildet werden, über die wir nie mitentschieden haben.",
    demand: "Nein zur Wehrpflicht. Über unsere Zukunft entscheidet niemand ohne uns.",
    sticker: ["*Nein*", "zur", "Wehrpflicht"],
  },
  {
    id: "ueberwachung",
    label: "Grundrechte",
    title: "Mehr Überwachung",
    text: "Der Überwachungsapparat wird immer weiter ausgebaut.",
    demand: "Grundrechte schützen, statt die Überwachung immer weiter auszubauen.",
    sticker: ["*Freiheit*", "statt", "Überwachung"],
  },
  {
    id: "fachkraefte",
    label: "Personal",
    title: "Fachkräftemangel",
    text: "Er verschärft die Probleme in Schulen, Pflege und Gesundheitsversorgung.",
    demand: "Mehr Personal für Schulen, Pflege und Gesundheit.",
    sticker: ["*Mehr Hände*", "für Schule", "und Pflege"],
  },
];

/** Wer wir sind (Positionspapier) */
export const WHO =
  "Wir sind junge Menschen, die nicht länger zusehen wollen, wie über unsere Zukunft entschieden wird, ohne dass wir gehört werden.";

/** Wir sind nicht allein (Positionspapier und Flyer) */
export const ABROAD = {
  title: "Wir sind nicht allein",
  text: "In Frankreich, Belgien und Spanien geht die Jugend schon auf die Straße. Der Funke ist nach Deutschland übergesprungen: Erste Solidaritätsaktionen mit den Schüler:innenprotesten in Frankreich haben schon stattgefunden. Jetzt sind wir dran.",
};

/** Der 31.10. ist erst der Anfang (Positionspapier) */
export const BEGINNING = {
  title: "Der 31.10. ist erst der Anfang.",
  text: "Dauerhafte Probleme brauchen mehr als einen Protesttag. Wir wollen langfristig etwas verändern und auch danach weitermachen.",
};

/** Unser Aufruf an euch (Positionspapier) */
export const CALL = {
  title: "Unser Aufruf an Organisationen",
  text: "Wir suchen Organisationen, Vereine und Initiativen, die unsere Anliegen teilen. Unterstützt uns, indem ihr den Protest am 31. Oktober bekannt macht, mit euren Mitgliedern teilnehmt oder uns mit Erfahrung und Ressourcen helft.",
};

/** Kurze Sätze aus den Papieren */
export const SLOGAN = {
  future: "Ohne uns läuft die Zukunft nicht!",
  peaceful: "Friedlich. Gemeinsam. Für unsere Zukunft.",
};

/** Was wir wollen (Positionspapier) */
export const DEMAND =
  "Wir fordern eine Politik, die in Bildung, soziale Sicherheit, Gesundheit und bezahlbares Leben investiert, statt bei der jungen Generation zu sparen. Wir wollen mitbestimmen, wenn über unsere Zukunft entschieden wird.";

/** Wofür wir stehen (Positionspapier) */
export const VALUES = [
  {
    title: "Überparteilich und gemeinsam",
    text: "Egal ob links, rechts oder dazwischen: An diesem Tag stellen wir politische Differenzen zurück und stehen gemeinsam für die Menschen ein, nicht für eine Partei. Unsere gemeinsamen Probleme sind wichtiger als das, was uns trennt.",
  },
  {
    title: "Kritik an der politischen Führung",
    text: "Wir kritisieren Entscheidungen der Politik, egal welche Partei dahintersteht. Viele Kräfte stellen sich als einzige Lösung dar, obwohl ihre Politik unsere Zukunft gefährdet. Keine Partei steht über den Sorgen der Bevölkerung.",
  },
  {
    title: "Einheit statt Spaltung",
    text: "Wir stehen für alle Menschen, unabhängig von Herkunft, Hautfarbe, Religion oder politischer Meinung. Wir wollen zusammenbringen, statt uns gegeneinander aufbringen zu lassen.",
  },
  {
    title: "Eine Stimme für die Jugend",
    text: "Wir Jugendlichen werden vernachlässigt und ignoriert. Das wollen wir ändern.",
  },
];

/** Unsere Erklärung (Erklärung – Gen Z regelt!) */
export const PRINCIPLES = [
  {
    title: "Wir sind gegen jede Form von Gewalt",
    text: "Unser Protest ist friedlich, ohne Ausnahme. Gewalt gegen Menschen oder Sachen widerspricht allem, wofür wir stehen. Nur friedlich können wir gemeinsam etwas erreichen.",
  },
  {
    title: "Schutz der eigenen Unversehrtheit",
    text: "Friedlich heißt nicht, alles hinzunehmen. Wir lassen uns nicht einschüchtern, bedrohen oder angreifen, und wir schauen nicht weg, wenn es anderen passiert. Kommt es zu Bedrohungen oder Übergriffen, setzen wir auf Abstand, Deeskalation und Zusammenhalt und bringen Betroffene in Sicherheit.",
  },
  {
    title: "Wir sind überparteilich",
    text: "Egal ob links, rechts, grün oder eine andere Richtung: Alle sind willkommen. Wir kämpfen für uns Menschen, für unsere Jugend und für unsere Zukunft, nicht für eine Partei.",
  },
  {
    title: "Wir sind für alle da",
    text: "Egal welche Hautfarbe, Herkunft, Geschlecht oder Religion: Bei uns gehören alle dazu. Wir unterstützen uns gegenseitig und lassen uns nicht spalten.",
  },
  {
    title: "Kein Platz für Extremismus",
    text: "Offen für alle heißt nicht offen für alles. Extremistische Gruppen, verfassungsfeindliche Symbole, Rassismus und Hetze haben bei uns keinen Platz, egal aus welcher Richtung. Wer unseren Protest dafür missbrauchen will, wird von der Versammlung ausgeschlossen.",
  },
];

export const ALLOWED = [
  "Friedlich und respektvoll demonstrieren",
  "Laut sein mit Plakaten, Sprüchen und Musik",
  "Menschen aller Richtungen und Herkünfte",
  "Aufeinander achten und sich gegenseitig helfen",
  "Uns und andere gewaltfrei schützen",
];

export const FORBIDDEN = [
  "Gewalt, Drohungen oder Zerstörung",
  "Hass, Hetze und Diskriminierung",
  "Extremistische Gruppen und verfassungsfeindliche Symbole",
  "Parteiwerbung oder Fahnen von Parteien",
  "Provokationen gegen Polizei oder Gegendemos",
];

/** Zum Herunterladen, Dateien in public/dokumente */
export const DOCUMENTS = [
  {
    file: "/dokumente/positionspapier-gen-z-regelt.pdf",
    title: "Positionspapier",
    text: "Wer wir sind, was uns bewegt, was wir wollen. Mit unserem Aufruf an Organisationen.",
    pages: "2 Seiten",
  },
  {
    file: "/dokumente/erklaerung-gen-z-regelt.pdf",
    title: "Unsere Erklärung",
    text: "Friedlich, überparteilich, für alle. Was auf unserem Protest geht und was nicht.",
    pages: "1 Seite",
  },
  {
    file: "/dokumente/flyer-gen-z-regelt.pdf",
    title: "Flyer",
    text: "Warum wir protestieren und wofür wir stehen, zum Ausdrucken und Weitergeben.",
    pages: "1 Seite",
  },
];

/**
 * Social-Media-Kanäle von Gen Z regelt. Nur echte, bestätigte Links eintragen, leere werden nicht angezeigt.
 * Mögliche Kanäle: instagram, tiktok, youtube, x, threads, facebook, telegram (Hauptkanal).
 */
export const SOCIAL: Array<{ network: "instagram" | "tiktok" | "youtube" | "x" | "threads" | "facebook" | "telegram"; url: string }> = [
  { network: "instagram", url: "" },
  { network: "tiktok", url: "" },
];
