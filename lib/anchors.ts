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
];

export function anchorsFor(componentId: string | null, limit = 2): Anchor[] {
  const pool = componentId
    ? ANCHORS.filter((a) => a.components.includes(componentId))
    : ANCHORS;
  // Fall back to all anchors if none match the component (still useful as a bar).
  return (pool.length ? pool : ANCHORS).slice(0, limit);
}
