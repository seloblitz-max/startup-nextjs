import { SQUIRREL_PATH } from "@/og/squirrel";

/** Das Eichhörnchen-Logo, gefüllt in der aktuellen Textfarbe. */
export default function SquirrelMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} aria-hidden="true" focusable="false">
      <path d={SQUIRREL_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
