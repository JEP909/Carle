import logos from "./logos.json";

// Real brand logos, bundled offline (from simple-icons) so generated cards can
// use authentic marks while staying fully self-contained. Each entry is the
// official single-path SVG geometry + the brand's hex. The agent references
// logos by name; we inline them as <svg> so there's no network dependency.

type Logo = { hex: string; path: string; title: string };
const LOGOS = logos as Record<string, Logo>;

export const LOGO_NAMES = Object.keys(LOGOS);

// Build an inline <svg> for a logo. `color` defaults to the brand hex; pass
// "currentColor" or a hex to recolor (e.g. monochrome on a dark pill).
export function logoSvg(name: string, size = 28, color?: string): string | null {
  const l = LOGOS[name];
  if (!l) return null;
  const fill = color ?? `#${l.hex}`;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${fill}" role="img" aria-label="${l.title}"><path d="${l.path}"/></svg>`;
}

// A compact catalog string for the system prompt: tells the model which logos
// are available and how to request one, without shipping all the path data.
export function logoCatalog(): string {
  return LOGO_NAMES.join(", ");
}
