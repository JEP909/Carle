// The quality rubric — taste encoded as explicit parameters, per archetype.
// This is what both the generator and the VISUAL judge reason from. Four
// buckets: what a card must have, must avoid, should match (the reference
// taste), and should not match. The references are OUR build-time asset baked
// in here as words; the user never uploads anything.
//
// Decision locked with the user: RICH execution is encouraged (Chatbase-grade
// underglow / constellations / dimensional objects / tasteful sparkles) — the
// earlier blanket bans on those patterns were the mistake. The line is
// execution quality, not the pattern.

export type Rubric = {
  id: string;
  label: string;
  mustHave: string[];
  mustAvoid: string[];
  shouldMatch: string[];
  shouldNotMatch: string[];
};

export const RUBRICS: Record<string, Rubric> = {
  feature: {
    id: "feature",
    label: "Feature card",
    mustHave: [
      "A product DIORAMA — a believable mini-UI scene — not a single icon.",
      "One clear focal object the eye lands on first.",
      "Dense, real micro-content: real labels, numbers, names — never lorem.",
      "Real brand logos where a brand appears (inserted as a logo, never hand-drawn).",
      "Copy anchored below the scene: a tight headline + ~2-line support.",
    ],
    mustAvoid: [
      "A flat single-icon-above-text layout.",
      "Dead empty zones inside the card.",
      "Lorem / placeholder copy or filler like 'Powerful features'.",
      "Hand-drawn brand glyphs (use a real logo or nothing).",
    ],
    shouldMatch: [
      "Real depth: layered shadows, floating panels, dimensionality.",
      "Tasteful RICHNESS when it fits — gradient sheen, underglow, orbiting constellations, dimensional objects — executed cleanly at the Chatbase bar.",
      "Clean grotesque type (Geist), restrained palette with one confident accent.",
      "The fragment vocabulary: tiles, pills, toggles, charts, chat bubbles, status rows.",
    ],
    shouldNotMatch: [
      "The generic AI-startup look (a lone bolt/sparkle in a flat accent tile).",
      "The cream + serif editorial default.",
      "Thin, flat CSS gestures pretending to be a real scene.",
      "Rainbow candy pills or harsh, garish color.",
    ],
  },
};

export function getRubric(id?: string | null): Rubric | null {
  if (!id) return null;
  return RUBRICS[id] ?? null;
}

// Render a rubric as a compact checklist for prompts (generator + judge).
export function rubricText(r: Rubric): string {
  const list = (xs: string[]) => xs.map((x) => `  - ${x}`).join("\n");
  return `## Quality rubric — ${r.label}

MUST HAVE:
${list(r.mustHave)}

MUST AVOID:
${list(r.mustAvoid)}

SHOULD MATCH (the house reference taste):
${list(r.shouldMatch)}

SHOULD NOT MATCH:
${list(r.shouldNotMatch)}`;
}
