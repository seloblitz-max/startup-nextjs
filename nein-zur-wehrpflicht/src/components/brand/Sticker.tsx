import Image from "next/image";
import logo from "@/img/logo.svg";

/**
 * Sticker „JETZT ODER NIE!“ aus dem Designguide, nachgebaut nach den angegebenen Maßen (siehe .sticker in
 * globals.css), mit dem Original-Logo als SVG. Liegt eine Originaldatei vor, kann sie hier einfach als Bild eingesetzt werden.
 */
export function NowOrNever({ className = "" }: { className?: string }) {
  return (
    <div className={`sticker ${className}`} role="img" aria-label="Sticker: Jetzt oder nie! #GENZREGELT">
      <Image src={logo} alt="" width={60} height={63} unoptimized className="sticker-logo" />
      <p className="sticker-text" aria-hidden="true">
        Jetzt
        <br />
        oder
        <br />
        <span className="text-orange">nie!</span>
      </p>
      <p className="sticker-signature signature" aria-hidden="true">
        #GENZREGELT
      </p>
    </div>
  );
}
