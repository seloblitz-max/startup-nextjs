"use client";

import type { ReactNode } from "react";
import type { ContactTopic } from "@/lib/contact";
import { TOPIC_EVENT } from "./ContactForm";

/** Link zum Kontaktformular, der gleich das passende Anliegen auswählt. */
export default function TopicLink({ topic, className, children }: { topic: ContactTopic; className?: string; children: ReactNode }) {
  return (
    <a href="#kontakt" className={className} onClick={() => window.dispatchEvent(new CustomEvent(TOPIC_EVENT, { detail: topic }))}>
      {children}
    </a>
  );
}
