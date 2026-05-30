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
const SPARKLE_HINT = /sparkl|magic|✨|<path[^>]*d="M12 ?0[^"]*l[^"]*z"[^>]*\/>\s*<path[^>]*d="M/i;

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

  if (BOLT_PATHS.some((re) => re.test(html)) || SPARKLE_HINT.test(html)) {
    push(
      "bolt-icon",
      "A lightning-bolt/sparkle/magic glyph is used as an icon. Remove it — use a real brand logo or a specific, meaningful custom icon instead. Never a generic AI/action glyph.",
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
