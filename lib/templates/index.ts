import {
  EARN_SPEC_INSTRUCTION,
  parseEarnSpec,
  renderEarnCards,
  type EarnSpec,
} from "./earn-cards";
import {
  PLATFORM_SPEC_INSTRUCTION,
  parsePlatformSpec,
  renderPlatformFeatures,
} from "./platform-features";

// Registry of "nailed" patterns that have graduated from prose recipes to CODED
// layouts. For these, the model only produces a content spec (JSON); the server
// renders the exact, proven HTML — so the layout can never drift.
//
// A template entry: the instruction that asks the model for a content spec, a
// parser, and a renderer that turns the spec into the final harness HTML (with
// {{logo:}}/{{image:}} tokens for the finalizer to resolve).
export type Template = {
  instruction: string;
  build: (raw: string) => string | null; // raw model JSON -> harness HTML, or null on parse failure
};

export const TEMPLATES: Record<string, Template> = {
  "earn-cards": {
    instruction: EARN_SPEC_INSTRUCTION,
    build: (raw) => {
      const spec: EarnSpec | null = parseEarnSpec(raw);
      return spec ? renderEarnCards(spec) : null;
    },
  },
  "platform-features": {
    instruction: PLATFORM_SPEC_INSTRUCTION,
    build: (raw) => {
      const spec = parsePlatformSpec(raw);
      return spec ? renderPlatformFeatures(spec) : null;
    },
  },
};

// Return the template handler for the first selected recipe that has one.
export function pickTemplate(recipeIds: string[]): Template | null {
  for (const id of recipeIds) {
    if (TEMPLATES[id]) return TEMPLATES[id];
  }
  return null;
}

// Deterministic fallback: the LLM planner is unreliable at routing these whole-
// section patterns, so match the brief directly. Used when the planner didn't
// already pick a template.
export function templateFromBrief(brief: string): Template | null {
  const b = brief.toLowerCase();
  if (/ways to earn|earn (up to|\d|more)|bonus points|rewards? program|partner (credit )?cards?|loyalty/.test(b)) {
    return TEMPLATES["earn-cards"];
  }
  if (
    /complete platform|platform for|feature section|two (feature )?cards/.test(b) ||
    (/constellation|llm|model providers?|integrations?/.test(b) && /agent|automation|build|workflow|simplicity/.test(b))
  ) {
    return TEMPLATES["platform-features"];
  }
  return null;
}
