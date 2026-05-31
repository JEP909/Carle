import * as simpleIcons from "simple-icons";
import logos from "./logos.json";

// Real brand logos. We resolve against the FULL simple-icons set (3,400+ official
// brand vectors, bundled offline as a dependency) so the model never has to guess
// or hand-draw a mark — any brand it names resolves to the authentic single-path
// SVG + brand hex. The small curated logos.json stays as an override layer for
// custom/hand-tuned entries.

type Icon = { title: string; hex: string; path: string; slug: string };

// Build a slug -> icon map once. Object.values(simpleIcons) yields every si* icon.
const BY_SLUG: Map<string, Icon> = (() => {
  const m = new Map<string, Icon>();
  for (const v of Object.values(simpleIcons) as unknown[]) {
    const ic = v as Partial<Icon>;
    if (ic && typeof ic.slug === "string" && typeof ic.path === "string") {
      m.set(ic.slug, ic as Icon);
    }
  }
  return m;
})();

// Nicknames the model is likely to use that don't match the simple-icons slug.
const ALIASES: Record<string, string> = {
  amex: "americanexpress",
  aeroplan: "aircanada", // Aeroplan is Air Canada's program; the rondelle is the AC mark
  mc: "mastercard",
  twitter: "x",
};

// Curated overrides (custom or hand-tuned). Falls back to simple-icons.
type Logo = { hex: string; path: string; title: string };
const OVERRIDES = logos as Record<string, Logo>;

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolve(name: string): { path: string; hex: string; title: string } | null {
  // 1. exact curated override (preserves any hand-tuned entries)
  if (OVERRIDES[name]) return OVERRIDES[name];
  const n = normalize(name);
  if (OVERRIDES[n]) return OVERRIDES[n];
  // 2. alias -> slug, else the normalized name AS a slug
  const slug = ALIASES[n] ?? n;
  const icon = BY_SLUG.get(slug);
  if (icon) return { path: icon.path, hex: icon.hex, title: icon.title };
  return null;
}

// Build an inline <svg> for a logo. `color` defaults to the brand hex; pass
// "currentColor" or a hex to recolor (e.g. monochrome on a dark pill).
export function logoSvg(name: string, size = 28, color?: string): string | null {
  const l = resolve(name);
  if (!l) return null;
  const fill = color ?? `#${l.hex}`;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${fill}" role="img" aria-label="${l.title}"><path d="${l.path}"/></svg>`;
}

// True if a brand name resolves to a real vector.
export function hasLogo(name: string): boolean {
  return resolve(name) !== null;
}

// A short, representative catalog for the system prompt — we can't list 3,400+,
// so we name the common ones and tell the model the slug rule.
export function logoCatalog(): string {
  return [
    "americanexpress (amex)", "aircanada (aeroplan)", "mastercard", "visa",
    "stripe", "paypal", "shopify", "notion", "slack", "github", "google",
    "googlepay", "applepay", "youtube", "tiktok", "instagram", "x", "whatsapp",
    "discord", "spotify", "airbnb", "uber",
  ].join(", ");
}
