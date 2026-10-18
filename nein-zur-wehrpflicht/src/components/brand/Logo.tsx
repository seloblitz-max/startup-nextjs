import Image from "next/image";
import logo from "@/img/logo.svg";

/** Seitenverhältnis des Original-Logos (300 × 314). */
export const LOGO_RATIO = 300 / 314;

/**
 * Das Original-Logo von Gen Z regelt: das orangefarbene Eichhörnchen, unverändert aus der gelieferten SVG-Datei
 * (src/img/logo.svg). Designguide: Original bleibt Original, also nicht nachzeichnen, verzerren, umfärben oder
 * beschneiden, und Freiraum lassen.
 *
 * Ohne `badge` steht das Eichhörnchen frei auf dem dunklen Grund, `size` ist seine Höhe in Pixeln. Mit `badge` liegt es
 * wie auf den Stickern in einem schwarzen Kreis, etwa auf orangem Grund, `size` ist dann der Durchmesser.
 */
export default function Logo({
  size,
  badge = false,
  alt = "",
  eager = false,
  className = "",
}: {
  size: number;
  badge?: boolean;
  alt?: string;
  /** Sofort laden, etwa in der Kopfzeile */
  eager?: boolean;
  className?: string;
}) {
  const height = badge ? Math.round(size * 0.6) : size;
  const img = (
    <Image
      src={logo}
      alt={alt}
      width={Math.round(height * LOGO_RATIO)}
      height={height}
      loading={eager ? "eager" : undefined}
      unoptimized
      className={badge ? undefined : `shrink-0 ${className}`}
    />
  );
  if (!badge) return img;
  return (
    <span className={`logo-badge ${className}`} style={{ width: size, height: size }}>
      {img}
    </span>
  );
}
