"use client";

import { CheckCircle, CircleNotch, EnvelopeSimple, PaperPlaneTilt } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  checkContact,
  CONTACT_EMAIL,
  CONTACT_TOPICS,
  DEFAULT_TOPIC,
  FIELD_ERROR,
  LIMITS,
  topicLabel,
  type ContactField,
  type ContactTopic,
} from "@/lib/contact";
import { pagePath } from "@/lib/site";

/** Andere Stellen der Seite (etwa „Deine Stadt fehlt?“) wählen damit das passende Anliegen vor. */
export const TOPIC_EVENT = "gzsa:kontakt";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string; mailto?: string };

/**
 * Kontaktformular. Die Nachricht geht per E-Mail an Gen Z regelt und wird nicht gespeichert. Klappt der Versand nicht
 * (Server ohne E-Mail-Zugang, keine Verbindung), bietet das Formular die fertige Nachricht als E-Mail an.
 */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [invalid, setInvalid] = useState<ContactField | null>(null);
  const [topic, setTopic] = useState<ContactTopic>(DEFAULT_TOPIC);
  const started = useRef(0);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    started.current = Date.now();
    const onTopic = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const known = CONTACT_TOPICS.find((t) => t.id === id);
      if (!known) return;
      setTopic(known.id);
      setStatus((s) => (s.kind === "sent" ? { kind: "idle" } : s));
    };
    window.addEventListener(TOPIC_EVENT, onTopic);
    return () => window.removeEventListener(TOPIC_EVENT, onTopic);
  }, []);

  function mailto(name: string, message: string) {
    const subject = encodeURIComponent(`[${topicLabel(topic)}] Nachricht von ${name || "der Website"}`);
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodeURIComponent(message)}`;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "sending") return;
    const data = new FormData(e.currentTarget);
    const body = {
      topic,
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
      consent: data.get("consent") === "on",
      website: String(data.get("website") ?? ""),
      elapsed: Date.now() - started.current,
    };
    const checked = checkContact(body);
    if (!checked.ok) {
      setInvalid(checked.field);
      setStatus({ kind: "idle" });
      form.current?.querySelector<HTMLElement>(`[name="${checked.field}"]`)?.focus();
      return;
    }
    setInvalid(null);
    setStatus({ kind: "sending" });
    const fallback = mailto(checked.value.name, checked.value.message);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus({ kind: "sent" });
        form.current?.reset();
        return;
      }
      if (res.status === 400 && json.field) {
        setInvalid(json.field as ContactField);
        setStatus({ kind: "idle" });
        return;
      }
      if (res.status === 429) {
        setStatus({
          kind: "error",
          message: "Von deinem Anschluss kamen gerade sehr viele Nachrichten. Versuch es in einer Stunde noch einmal oder schreib uns direkt.",
          mailto: fallback,
        });
        return;
      }
      setStatus({
        kind: "error",
        message: "Das Formular ist gerade nicht erreichbar. Schick uns deine Nachricht einfach direkt per E-Mail.",
        mailto: fallback,
      });
    } catch {
      setStatus({
        kind: "error",
        message: "Keine Verbindung. Prüf dein Internet oder schick uns deine Nachricht direkt per E-Mail.",
        mailto: fallback,
      });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="card mt-8 p-6" role="status">
        <CheckCircle weight="fill" className="size-8 text-orange" aria-hidden="true" />
        <p className="t-h4 mt-3">Danke, deine Nachricht ist angekommen.</p>
        <p className="mt-2">Wir antworten dir per E-Mail, so schnell wir können.</p>
        <button type="button" className="btn btn-quiet mt-5" onClick={() => setStatus({ kind: "idle" })}>
          Noch eine Nachricht schreiben
        </button>
      </div>
    );
  }

  const err = (field: ContactField) =>
    invalid === field ? (
      <p id={`${field}-error`} className="field-error">
        {FIELD_ERROR[field]}
      </p>
    ) : null;
  const aria = (field: ContactField) =>
    invalid === field ? { "aria-invalid": true, "aria-describedby": `${field}-error` } : {};

  const hint = CONTACT_TOPICS.find((t) => t.id === topic)?.hint;

  return (
    <form ref={form} className="mt-8 grid gap-5" noValidate onSubmit={onSubmit}>
      <fieldset>
        <legend className="field-label">Worum geht es?</legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_TOPICS.map((t) => (
            <label key={t.id} className="chip">
              <input type="radio" name="topic" value={t.id} checked={topic === t.id} onChange={() => setTopic(t.id)} />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="field-label">
            Name
          </label>
          <input id="contact-name" name="name" className="field" autoComplete="name" maxLength={LIMITS.name} required {...aria("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="contact-email" className="field-label">
            E-Mail
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            className="field"
            autoComplete="email"
            maxLength={LIMITS.email}
            required
            {...aria("email")}
          />
          {err("email")}
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="field-label">
          Nachricht
        </label>
        <textarea
          id="contact-message"
          name="message"
          className="field"
          rows={6}
          maxLength={LIMITS.message}
          placeholder={hint}
          required
          {...aria("message")}
        />
        {err("message")}
      </div>

      {/* Für Programme, die Formulare automatisch ausfüllen. Menschen sehen das Feld nicht. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="check">
          <input type="checkbox" name="consent" required {...aria("consent")} />
          <span>
            Ich habe die{" "}
            <Link href={`${pagePath("/datenschutz")}#kontaktformular`} className="link">
              Datenschutzerklärung
            </Link>{" "}
            gelesen und bin einverstanden, dass meine Angaben zur Beantwortung meiner Nachricht verwendet werden.
          </span>
        </label>
        {err("consent")}
      </div>

      {status.kind === "error" ? (
        <div className="card p-5" role="alert">
          <p>{status.message}</p>
          {status.mailto ? (
            <a href={status.mailto} className="btn btn-sm btn-light mt-4">
              <EnvelopeSimple weight="bold" className="size-4" aria-hidden="true" />
              E-Mail an {CONTACT_EMAIL}
            </a>
          ) : null}
        </div>
      ) : null}

      <div>
        <button type="submit" className="btn btn-primary" aria-busy={status.kind === "sending" || undefined}>
          {status.kind === "sending" ? (
            <CircleNotch weight="bold" className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <PaperPlaneTilt weight="bold" className="size-5" aria-hidden="true" />
          )}
          Nachricht senden
        </button>
      </div>
    </form>
  );
}
