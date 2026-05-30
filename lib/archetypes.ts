import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const read = (...p: string[]) => readFileSync(join(ROOT, ...p), "utf8");

// An archetype is a specialized card harness: a tuned aesthetic spec plus a
// hand-built reference component that sets the quality bar. Add new card types
// here — each becomes its own high-craft generator. ("none" falls back to the
// generic principles + anti-slop path.)
export type Archetype = {
  id: string;
  label: string;
  blurb: string;
  placeholder: string;
  aesthetic: string; // markdown spec, replaces generic anti-slop for this mode
  reference: string; // hand-built gold-standard HTML, used as loose inspiration
};

export const ARCHETYPES: Record<string, Archetype> = {
  holographic: {
    id: "holographic",
    label: "Holographic card",
    blurb:
      "A feature card built around a holographic focal object — foil bands, mesh wash, navy ink.",
    placeholder:
      "A matte-black metal card for a premium fintech — restrained, with a gold contactless mark.",
    aesthetic: read("prompts", "aesthetic-holographic.md"),
    reference: read("reference", "holographic-card.html"),
  },
};

export function getArchetype(id?: string | null): Archetype | null {
  if (!id || id === "none") return null;
  return ARCHETYPES[id] ?? null;
}

// Lightweight list for the client (no big strings shipped to the browser).
export const ARCHETYPE_MENU = Object.values(ARCHETYPES).map(
  ({ id, label, blurb, placeholder }) => ({ id, label, blurb, placeholder }),
);
