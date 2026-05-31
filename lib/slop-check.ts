// Slop check — the self-enforcing quality gate. After generation, scan the HTML
// for the known vibe-coder tells we keep regressing into. The deterministic
// layer here is free and instant; it catches the unambiguous offenders. (A
// model-critic layer can run after this for the subtler "could be any AI
// startup" cases — see slop-critic.ts.)
//
// Each rule returns a short, specific finding the reviser can act on.

export type SlopFinding = { id: string; detail: string };

// Lightning-bolt / sparkle / magic-wand glyph as a primary icon — THE generic
// "AI/action/generate" mark. Detect common bolt + sparkle SVG path signatures.
// The lightning bolt is a small zigzag that almost always starts near "M13 2"
// / "M13 10" and contains the tell-tale "h…-1 …" or "l…z" kink. Match the family
// loosely rather than one exact path (the model varies the coordinates).
const BOLT_PATHS = [
  /d="M1[13][ .,]?\d{0,3}[ .,]?\d{0,2}[ .,]?\d?\s*4[ .,]?14h\d/i, // M13 2 4 14h6...
  /M13 ?10V3L4 ?14h7v7l9-11/i,
  /M11 ?21h-1l1-7H7\.5/i,
  /polygon points="13[ ,]/i,
  /d="M1[13][ .,]\d{1,2}[ .,]\d[ .,]?14[hl]/i,
];
// Sparkle / 4-point-star: the #1 generic AI glyph. It varies infinitely in
// coordinates, so detect by STRUCTURE and context, not exact paths:
//  - the literal character or words,
//  - a tiny path made of 4 cubic curves that returns to its start (a symmetric
//    twinkle), e.g. "M6.5 1.5C... 6.5 1.5Z" — 3+ C/c segments and a Z close,
//  - any small icon tile filled with an accent/gradient sitting next to a title.
const SPARKLE_HINT = /sparkl|twinkl|magic|✨|✦|✧|⭐|\bstar\b/i;
// A sparkle/twinkle is a small closed path that RETURNS TO ITS START POINT — the
// coordinate-agnostic signature. Match: M<x> <y> ... <same x> <y>Z, where the
// path is icon-sized (short) and uses curves. Captures the start coords and
// requires them to reappear right before the Z.
const STAR_PATH =
  /d="M\s*([\d.]+)[ ,]+([\d.]+)[Cc][^"]{4,160}?\1[ ,]+\2\s*[Zz]"/;

// Decorative status pills: "5 apps connected", "channels connected", "● Live",
// "AI-powered", "synced/syncing" floating chips that are pure decoration.
const DECOR_PILL =
  /(?:\bconnected\b|\bsyncing\b|\bsynced\b|·\s*live\b|\blive\s*·|ai[-\s]?powered|all systems)/i;

// Generic tracked-uppercase eyebrow stack: a short ALL-CAPS label with wide
// letter-spacing sitting alone (e.g. "INTEGRATIONS", "FEATURES", "PRODUCT").
// Generic eyebrow — match the word even with surrounding whitespace/newlines or
// a leading icon, anywhere it sits as standalone label text.
const GENERIC_EYEBROW =
  />\s*(INTEGRATIONS?|FEATURES?|PRODUCT|PLATFORM|OVERVIEW|SOLUTIONS?|WORKFLOW|AUTOMATION|ANALYTICS|CAPABILITIES|GET STARTED)\s*</i;

// A lone glyph inside an accent-colored rounded square acting as a "hub".
const ACCENT_TILE_HUB =
  /border-radius:\s*1[0-8]px[^}]*background:\s*(#6[0-9a-f]{2}|#7[0-9a-f]{2}|var\(--indigo|var\(--accent|linear-gradient[^;]*#6)/i;

export function scanForSlop(html: string): SlopFinding[] {
  const out: SlopFinding[] = [];
  const push = (id: string, detail: string) => out.push({ id, detail });

  if (
    BOLT_PATHS.some((re) => re.test(html)) ||
    SPARKLE_HINT.test(html) ||
    STAR_PATH.test(html)
  ) {
    push(
      "ai-glyph",
      "A generic AI glyph (sparkle/4-point star, lightning bolt, or magic wand) is used as an icon — the #1 vibe-coder tell. Remove it entirely. Do not put a decorative icon tile next to the title. Use a real {{logo:...}} only if a real brand belongs there; otherwise no icon.",
    );
  }
  // The offending STRUCTURE: a small inline <svg> sitting inside a rounded tile
  // filled with an accent/gradient, beside the heading — the fake "brand mark".
  if (
    /(?:background:\s*(?:var\(--(?:indigo|accent)\)|#[0-9a-f]{3,6}|linear-gradient[^;]*));[^}]*border-radius:\s*\d/i.test(
      html,
    ) &&
    /<svg[^>]*viewBox="0 0 (?:24|20|16)[^"]*"[^>]*>\s*<path/i.test(html) &&
    !/\{\{logo:/.test(html) &&
    !/aria-label=/.test(html)
  ) {
    push(
      "accent-icon-tile",
      "There's a hand-drawn glyph inside an accent/gradient rounded tile (a fake brand mark next to the title). Remove the tile entirely unless it holds a real {{logo:...}}.",
    );
  }
  if (DECOR_PILL.test(html)) {
    push(
      "decorative-pill",
      "There is a decorative status pill (e.g. 'connected', 'syncing', 'Live', 'AI-powered'). Remove it unless it reflects real, specific state the card is genuinely about.",
    );
  }
  if (GENERIC_EYEBROW.test(html)) {
    push(
      "generic-eyebrow",
      "A generic tracked-uppercase eyebrow label (INTEGRATIONS/FEATURES/etc.) sits above the heading. Remove it or replace with something that adds real information — don't use a reflex eyebrow.",
    );
  }
  if (ACCENT_TILE_HUB.test(html) && /viewBox="0 0 24 24"/.test(html)) {
    // Heuristic: accent-filled rounded tile + an inline glyph nearby.
    push(
      "accent-hub-tile",
      "Looks like a lone glyph inside a purple/indigo rounded-square 'hub' tile — a vibe-coder cliché. Use a real logo or a specific scene instead of an abstract hub.",
    );
  }
  return out;
}

export function slopFindingsToInstruction(findings: SlopFinding[]): string {
  return `The component has these specific problems that make it look
AI-generated. Fix ONLY these, keep everything else, and return the full updated
HTML document:\n\n${findings.map((f, i) => `${i + 1}. ${f.detail}`).join("\n")}`;
}
