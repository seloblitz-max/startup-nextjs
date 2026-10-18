/**
 * Kontaktformular: Prüfregeln für Browser und Server. Die PHP-Fassung (hostinger/public/_app/mail.php) prüft
 * dasselbe. Nachrichten werden nur per E-Mail weitergeleitet, nie auf dem Server gespeichert.
 */
export const CONTACT_EMAIL = "genzregelt@gmx.de";

export const LIMITS = { name: 100, email: 200, message: 4000, minMessage: 10 } as const;
/** Nachrichten pro Anschluss und Stunde */
export const CONTACT_PER_HOUR = 5;
/** Wer das Formular schneller abschickt, ist sehr wahrscheinlich ein Programm. */
export const MIN_FILL_MS = 2500;

/** Worum es geht. Steht im Betreff der E-Mail, damit sich Anfragen leicht sortieren lassen. */
export const CONTACT_TOPICS = [
  { id: "mitmachen", label: "Ich will mitmachen", hint: "Wo wohnst du, und wie möchtest du mitmachen?" },
  { id: "stadt", label: "Meine Stadt fehlt", hint: "Welche Stadt fehlt, und gibt es dort schon einen Treffpunkt oder eine Gruppe?" },
  { id: "organisation", label: "Organisation", hint: "Wer seid ihr, und wie wollt ihr den Protest unterstützen?" },
  { id: "presse", label: "Presse", hint: "Für welches Medium schreibst du, und worum geht es?" },
  { id: "frage", label: "Frage oder Idee", hint: "Was möchtest du uns sagen?" },
] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number]["id"];
export const DEFAULT_TOPIC: ContactTopic = "mitmachen";
export const topicLabel = (id: ContactTopic) => CONTACT_TOPICS.find((t) => t.id === id)?.label ?? "Nachricht";

export type ContactField = "name" | "email" | "message" | "consent";
export type ContactInput = { topic: ContactTopic; name: string; email: string; message: string };

const EMAIL = /^[^\s@<>()",;:\\[\]]+@[^\s@<>()",;:\\[\]]+\.[^\s@<>()",;:\\[\]]{2,}$/;

/** Steuerzeichen raus, Zeilenumbrüche nur in der Nachricht. */
const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
const multiLine = (s: string) =>
  s
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]+/g, "")
    .trim();

export function checkContact(body: Record<string, unknown>):
  | { ok: true; value: ContactInput }
  | { ok: false; field: ContactField } {
  const name = oneLine(typeof body.name === "string" ? body.name : "");
  const email = oneLine(typeof body.email === "string" ? body.email : "");
  const message = multiLine(typeof body.message === "string" ? body.message : "");
  if (!name || [...name].length > LIMITS.name) return { ok: false, field: "name" };
  if (email.length > LIMITS.email || !EMAIL.test(email)) return { ok: false, field: "email" };
  const len = [...message].length;
  if (len < LIMITS.minMessage || len > LIMITS.message) return { ok: false, field: "message" };
  if (body.consent !== true) return { ok: false, field: "consent" };
  const topic = CONTACT_TOPICS.find((t) => t.id === body.topic)?.id ?? DEFAULT_TOPIC;
  return { ok: true, value: { topic, name, email, message } };
}

/** Ausgefülltes Honigtopf-Feld oder zu schnell abgeschickt: still annehmen, aber nichts senden. */
export function looksAutomated(body: Record<string, unknown>) {
  const trap = typeof body.website === "string" ? body.website : "";
  const elapsed = typeof body.elapsed === "number" ? body.elapsed : 0;
  return trap.trim() !== "" || elapsed < MIN_FILL_MS;
}

export const FIELD_ERROR: Record<ContactField, string> = {
  name: "Bitte gib deinen Namen an.",
  email: "Bitte gib eine gültige E-Mail-Adresse an, damit wir dir antworten können.",
  message: `Deine Nachricht braucht mindestens ${LIMITS.minMessage} und höchstens ${LIMITS.message.toLocaleString("de-DE")} Zeichen.`,
  consent: "Bitte bestätige den Hinweis zum Datenschutz.",
};
