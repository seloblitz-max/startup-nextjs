// Breite von Großbuchstaben, Ziffern und Satzzeichen in Lexend Black (900), in em, gemessen an der Schriftdatei.
// Damit setzen Sticker und Teilen-Bilder große Schrift so groß, wie der Platz es zulässt.
const BLACK: Record<string, number> = {
  A: 0.69, B: 0.715, C: 0.705, D: 0.79, E: 0.668, F: 0.63, G: 0.793, H: 0.793, I: 0.612, J: 0.682, K: 0.744,
  L: 0.616, M: 0.888, N: 0.817, O: 0.834, P: 0.683, Q: 0.834, R: 0.707, S: 0.641, T: 0.714, U: 0.784, V: 0.71,
  W: 0.99, X: 0.719, Y: 0.71, Z: 0.701, Ä: 0.69, Ö: 0.834, Ü: 0.784,
  "0": 0.725, "1": 0.607, "2": 0.548, "3": 0.637, "4": 0.693, "5": 0.617, "6": 0.596, "7": 0.561, "8": 0.613, "9": 0.596,
  " ": 0.35, ".": 0.278, ",": 0.302, "-": 0.488, "!": 0.364, "?": 0.554, ":": 0.278, "/": 0.623, "&": 0.804, "'": 0.286,
  "(": 0.407, ")": 0.407,
};

/** Breite eines Texts in Lexend Black, in Großbuchstaben gesetzt, in em. Unbekannte Zeichen zählen etwas breiter. */
export function blackWidth(text: string) {
  return [...text.toUpperCase()].reduce((w, ch) => w + (BLACK[ch] ?? 0.8), 0);
}

/**
 * Setzt einen Namen in Großbuchstaben so groß wie möglich in eine Spalte. Würde er in einer Zeile kleiner als `minSize`,
 * wird er an einem Leerzeichen auf zwei Zeilen verteilt (etwa „FRANKFURT / AM MAIN“), dann höchstens `maxTwoLine` groß.
 */
export function fitName(name: string, width: number, maxSize: number, minSize: number, maxTwoLine = maxSize) {
  const single = Math.min(maxSize, width / blackWidth(name));
  const words = name.split(" ");
  if (single >= minSize || words.length < 2) return { lines: [name], size: Math.floor(single) };
  let best = { lines: [name], size: single };
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
    const size = Math.min(maxTwoLine, width / Math.max(...lines.map(blackWidth)));
    if (size > best.size) best = { lines, size };
  }
  return { lines: best.lines, size: Math.floor(best.size) };
}
