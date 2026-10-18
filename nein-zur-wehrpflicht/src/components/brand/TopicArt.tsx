import {
  GraduationCap,
  HandHeart,
  HandPalm,
  Scales,
  SecurityCamera,
  ShoppingCart,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { Topic } from "@/lib/content";
import { blackWidth } from "@/lib/type-metrics";

const ICONS: Record<string, Icon> = {
  bildung: GraduationCap,
  kosten: ShoppingCart,
  lasten: Scales,
  wehrpflicht: HandPalm,
  ueberwachung: SecurityCamera,
  fachkraefte: HandHeart,
};

const width = (line: string) => blackWidth(line.replace(/\*/g, ""));

/** Teilt eine Zeile in normale und orange (*so*) Stücke. */
function Line({ text }: { text: string }) {
  return (
    <>
      {text.split("*").map((part, i) =>
        i % 2 ? (
          <span key={i} className="text-orange">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * Bild zu einem Thema: ein schwarzer Sticker im Stil der Kampagne mit Piktogramm, kurzer Aussage und Signatur,
 * dahinter das Piktogramm groß als Hintergrundzeichen. Die Schrift wird so groß, wie die längste Zeile es zulässt.
 */
export default function TopicArt({ topic }: { topic: Topic }) {
  const Icon = ICONS[topic.id] ?? Scales;
  const longest = Math.max(...topic.sticker.map(width));
  // Die längste Zeile darf höchstens 72 % der Sticker-Breite einnehmen.
  const size = Math.min(15, 72 / longest);
  return (
    <div className="topic-art" aria-hidden="true">
      <Icon weight="thin" className="topic-art-mark" />
      <div className="topic-sticker">
        <Icon weight="fill" className="topic-sticker-icon" />
        <p className="topic-sticker-text" style={{ fontSize: `${size.toFixed(2)}cqw` }}>
          {topic.sticker.map((line, i) => (
            <span key={i} className="block">
              <Line text={line} />
            </span>
          ))}
        </p>
        <p className="topic-sticker-sig signature">#GENZREGELT</p>
      </div>
    </div>
  );
}
