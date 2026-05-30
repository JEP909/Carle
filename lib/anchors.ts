import { readFileSync } from "node:fs";
import { join } from "node:path";

// Validated anchors: hand-built components the USER judged to clear the quality
// bar. They are the taste signal — concrete proof of "good" rather than prose.
// Fed to the model as few-shot QUALITY references: study the craft and
// construction, then build something original for the brief. Never copy them.
//
// As more anchors pass review, add them here. Keep them small and relevant to
// the component being generated (we filter by `components`).

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, "reference", f), "utf8");

export type Anchor = {
  id: string;
  /** Which component types this anchor exemplifies. */
  components: string[];
  /** One-line note on what makes it good (helps the model read it correctly). */
  note: string;
  html: string;
};

export const ANCHORS: Anchor[] = [
  {
    id: "stripe-fraud",
    components: ["feature", "stat"],
    note: "Feature card built around a real data-viz diorama (stacked bars with detached caps + a smooth trend line), slate ink, quiet legend stats, copy anchored below. No gradient-glow clichés.",
    html: read("feature-stripe.html"),
  },
  {
    id: "stripe-payments",
    components: ["feature"],
    note: "Two feature cards: a checkout-form diorama and a payment-succeeded receipt + product card. Believable mini-UI fragments with depth on a tinted stage; navy heading + lavender-check list below.",
    html: read("feature-stripe-2.html"),
  },
  {
    id: "stripe-link",
    components: ["feature", "stat"],
    note: "Exemplary INTERIOR FRAGMENT craft: a real product panel (brand glyph tile, status pill, a primary + two outlined buttons) with a metric panel-within-panel — a metric anchored line chart with area-fill and a white-ringed endpoint dot. Panel-in-panel depth, layered shadows, big number kept light (weight ~450, not bold). This is the bar for interior fragments.",
    html: read("feature-stripe-link.html"),
  },
  {
    id: "omnichannel",
    components: ["feature"],
    note: "Depth + REAL ASSETS done right: a floating white integration grid (real brand logos via {{logo:...}}) on a saturated purple watercolor field. Committed saturated color, real layered shadows, authentic logos in rounded tiles — not flat CSS shapes. Logos use the {{logo:NAME}} token, never hand-drawn paths.",
    html: read("feature-omnichannel.html"),
  },
  {
    id: "scheduler",
    components: ["feature"],
    note: "DENSE INTERIOR GRAPHIC: a believable weekly-scheduler product screen — a 'Repeat Weekly / Every week' header, a row of day chips with one selected (green), labelled meta rows (Start, Created at) with a small person tag, and Cancel + solid-dark Save buttons — floating on a soft grainy stage. The bar for interior density: a real, specific UI fragment with real micro-content, not a sparse gesture.",
    html: read("feature-scheduler.html"),
  },
  {
    id: "analytics",
    components: ["feature", "stat"],
    note: "DENSE INTERIOR GRAPHIC, professional restraint: a real analytics panel — a List/Table segmented toggle, an avatar stack + Invite, two platform cards using REAL logos ({{logo:youtube}}, {{logo:tiktok}}) with tight stat ROWS (label left, tabular value right, accent color only on up-metrics — NOT candy-colored pills), and a 'Generate similar' input with ONE confident accent button. Shows how to keep dense dashboard UI restrained and Stripe-grade rather than rainbow.",
    html: read("feature-analytics.html"),
  },
];

export function anchorsFor(componentId: string | null, limit = 3): Anchor[] {
  const pool = componentId
    ? ANCHORS.filter((a) => a.components.includes(componentId))
    : ANCHORS;
  // Fall back to all anchors if none match the component (still useful as a bar).
  return (pool.length ? pool : ANCHORS).slice(0, limit);
}
