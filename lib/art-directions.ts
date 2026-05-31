// Art directions — proven THEMES distilled from crawling the real reference sites
// (Stripe, Chatbase, Chexy, Linear). The brand generator picks ONE per brand; the
// chosen direction's signature technique + depth rules are injected into every
// section so output has a real theme and real depth instead of flat, generic,
// signature-less "safe SaaS" (the thing that reads as vibe-coded).
//
// Each direction is grounded in what actually makes that site look world-class:
// a committed palette discipline, ONE repeated signature move, and explicit depth
// techniques. None of them is "dark page + purple glow" (the AI-slop default).

export type ArtDirectionId = "stripe" | "chatbase" | "chexy" | "linear";

type ArtDirection = {
  label: string;
  canvasMode: "light-monochrome" | "dark-glass" | "saturated-field";
  body: string; // injected design rules
};

export const ART_DIRECTIONS: Record<ArtDirectionId, ArtDirection> = {
  stripe: {
    label: "Stripe — technical-beautiful infrastructure",
    canvasMode: "light-monochrome",
    body: `ART DIRECTION: Stripe — beautiful, technical, understated-confident.
- CANVAS: near-white (#ffffff / #f6f9fc), near-black ink (#0a2540 / #1a1f36),
  muted slate (#697386). ONE confident accent (the brand color); optionally ONE
  deep secondary (teal #00c1ca or navy #012939) for charts. Restrained — never rainbow.
- SIGNATURE (use it): data-viz as narrative + a bento grid. Real charts (an area
  chart with a soft gradient fill and a labelled peak, or bars with rounded caps),
  BIG concrete numbers with units ("US$1.9tn processed", "135+ currencies"), and
  product-UI panels arranged in a bento grid.
- DEPTH (mandatory): product panels FLOAT above the canvas with layered shadows
  (e.g. \`0 1px 1px rgba(0,0,0,.04), 0 24px 48px -16px rgba(10,37,64,.16)\`), 1px
  hairline borders, and an optional very-subtle light gradient wash behind the
  hero (light, not paint). Overlap/offset 2-3 panels to imply depth.
- THEME: infrastructure as invisible enabler; information density without
  overwhelm; calm authority.`,
  },
  chatbase: {
    label: "Chatbase — premium-minimal trustworthy AI",
    canvasMode: "light-monochrome",
    body: `ART DIRECTION: Chatbase — premium, minimal, monochrome + ONE signature gradient.
- CANVAS: white, MONOCHROME zinc ink (#09090b headings, #27272a/#52525b body,
  #a1a1aa meta), hairline borders (#e4e4e7). The page is essentially black-and-white.
- SIGNATURE (use it, and ONLY here): a single warm gradient (coral #fb923c → pink
  #f472b6 → fuchsia #e879f9, OR a brand-appropriate analogous pair) used
  EXCLUSIVELY as a soft UNDERGLOW beneath a dark (#0a0a0a) pill button and as a
  faint halo behind ONE hero object — NEVER as a background wash. Plus an orbiting
  logo constellation (real {{logo:}} tiles around a dark app hub) and/or a 3D
  rendered object ({{image:}}) for the hero.
- DEPTH (mandatory): very generous rounding (cards 24px, tiles 16-20px, buttons
  full pills 9999px). Inner-shadow tactility on inputs/wells/tracks
  (\`inset 0 1px 2px rgba(16,24,40,.06)\`). Layered tiles with soft drop shadows.
- THEME: enterprise confidence meets consumer ease; calm, restrained, magical.`,
  },
  chexy: {
    label: "Chexy — bold consumer fintech, product-forward",
    canvasMode: "saturated-field",
    body: `ART DIRECTION: Chexy — bold, tangible, product-forward.
- CANVAS: a LIGHT page overall, near-black ink, with ONE section/panel committing
  to a SATURATED brand color (deep indigo #3b2e7e → #5b4bc4, or the brand hue).
  Floating WHITE sub-panels sit on that saturated field.
- SIGNATURE (use it): a photoreal RENDERED product object ({{image:wide|...}} — a
  card / device / package) that BLEEDS off an edge, paired with BIG tabular numbers
  and a brand logo. Real motion/sheen in the render.
- DEPTH (mandatory): strong layered shadows lift the white sub-panels off the
  saturated field; the rendered object casts a real soft shadow and runs off-frame;
  generous rounding (~28px).
- THEME: bold, confident, tangible — a product you can almost pick up.`,
  },
  linear: {
    label: "Linear — engineered precision (restrained dark)",
    canvasMode: "dark-glass",
    body: `ART DIRECTION: Linear — precise, engineered, RESTRAINED dark.
- CANVAS: calm near-black (#0a0b0d), glass panels (#16171b) with 1px
  rgba(255,255,255,.08) borders and a faint inset top highlight; ink #f4f4f5 /
  #a1a1aa. ONE accent used SPARINGLY (an active row, one button). ABSOLUTELY NO
  purple/violet wash, NO glow gradients, NO color mesh — the dark stays calm.
- SIGNATURE (use it): a dense, believable product surface — a command menu with
  keyboard hints, aligned issue/list rows with status dots, a small progress ring —
  built crisply. One accent on the active element only.
- DEPTH (mandatory): glass panels with a subtle top highlight + a big soft shadow;
  layered rows with hairline dividers; restrained, never glowy.
- THEME: speed, precision, engineered calm.`,
  },
};

export function artDirectionBlock(id: ArtDirectionId, accent: string): string {
  const dir = ART_DIRECTIONS[id] ?? ART_DIRECTIONS.stripe;
  return `# Theme — ${dir.label} (commit to it across EVERY section)

This product has ONE committed art direction. Every section must share its
signature move and its depth — flat, single-layer cards on a plain background are
the FAILURE that reads as "AI-generated template". Build with real depth and the
signature technique below, and reuse the brand accent ${accent} as the single
confident accent.

${dir.body}`;
}

export function canvasModeFor(id: ArtDirectionId): "light-monochrome" | "dark-glass" | "saturated-field" {
  return (ART_DIRECTIONS[id] ?? ART_DIRECTIONS.stripe).canvasMode;
}
