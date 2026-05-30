// The design language is the asset — the reusable "vibe" the agent wields to
// build an entire site. It is INDEPENDENT of any one card's structure: the same
// language renders a pricing card, a feature card, a stat card, all as siblings.
//
// A language is seeded from a hand-built reference of EXCEPTIONAL quality (the
// quality bar), plus a written spec of its vocabulary. Crucially it is also
// *editable*: user tweaks feed back into `learned` notes so the language
// converges on the user's taste over time — this is what makes it smarter than
// a template. (The learned-notes feedback loop lands in a later layer; the field
// is here so the architecture supports it from day one.)

import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const read = (...p: string[]) => readFileSync(join(ROOT, ...p), "utf8");

export type DesignLanguage = {
  id: string;
  label: string;
  blurb: string;
  /** Markdown spec of the vocabulary: palette, type, motion, form, voice. */
  spec: string;
  /** A hand-built, reference-quality component in this language (any structure). */
  reference: string;
  /** What structure the reference happens to be — so the model knows the ref is
   *  an example of the LANGUAGE, not the structure it must produce. */
  referenceStructure: string;
  /** Accumulated taste corrections, applied on top of the base spec. Starts
   *  empty; user tweaks will append here in the feedback layer. */
  learned: string[];
};

export const DESIGN_LANGUAGES: Record<string, DesignLanguage> = {
  aurora: {
    id: "aurora",
    label: "Aurora",
    blurb:
      "Deep near-black canvas, luminous spectral gradients, crisp grotesk type, light that moves.",
    spec: read("languages", "aurora.md"),
    reference: read("languages", "aurora.reference.html"),
    referenceStructure: "membership card",
    learned: [],
  },
};

export function getLanguage(id?: string | null): DesignLanguage | null {
  if (!id) return null;
  return DESIGN_LANGUAGES[id] ?? null;
}

export const LANGUAGE_MENU = Object.values(DESIGN_LANGUAGES).map(
  ({ id, label, blurb }) => ({ id, label, blurb }),
);
