import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// The knowledge layer: the agent's design TASTE, written as principles — not a
// corpus of presets to copy. Cross-cutting principle skills are always in
// context; per-component skills are loaded based on what's being built. The
// agent reasons from these to compose original work, the way a designer draws on
// expertise rather than templates.

const ROOT = process.cwd();
const KNOW = join(ROOT, "knowledge");
const read = (...p: string[]) => readFileSync(join(KNOW, ...p), "utf8");

// Always-on principles. Order matters: craft-primitives gives the construction
// vocabulary, the rest shape decisions, and anti-slop is the floor (read last so
// it frames everything). These form a stable cacheable prefix.
const PRINCIPLE_FILES = [
  "typography",
  "voice",
  "color",
  "layout",
  "craft-primitives",
  "assets",
  "motion",
  "anti-slop",
];

export const PRINCIPLES_BUNDLE: string = PRINCIPLE_FILES.map((f) =>
  read("principles", `${f}.md`),
).join("\n\n---\n\n");

// Per-component skills, loaded on demand. id -> markdown.
function loadComponents(): Record<string, string> {
  const dir = join(KNOW, "components");
  const out: Record<string, string> = {};
  for (const file of readdirSync(dir)) {
    if (file.endsWith(".md")) out[file.replace(/\.md$/, "")] = read("components", file);
  }
  return out;
}

export const COMPONENT_SKILLS: Record<string, string> = loadComponents();

export type ComponentMeta = { id: string; label: string };

// Lightweight menu for the UI (derive a label from the first heading).
export const COMPONENT_MENU: ComponentMeta[] = Object.entries(COMPONENT_SKILLS)
  .map(([id, md]) => {
    const m = md.match(/^#\s*Component:\s*(.+)$/m);
    return { id, label: m ? m[1].trim() : id };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

// Resolve the component skill the conversation is about. Explicit id wins;
// otherwise infer from the brief text by keyword so plain conversational prompts
// still pull the right knowledge.
const INFER: Array<[RegExp, string]> = [
  [/\bpricing|plan|\/mo|per month|tier|subscription\b/i, "pricing"],
  [/\bhero|headline|landing (header|top)|above the fold\b/i, "hero"],
  [/\btestimonial|quote|review|social proof|customer said\b/i, "testimonial"],
  [/\bstat|metric|number|kpi|\b\d+%|uptime|count\b/i, "stat"],
  [/\bcta|call to action|sign ?up|get started|convert\b/i, "cta"],
  [/\bfeature|capability|how it works|what it does\b/i, "feature"],
];

export function resolveComponent(
  explicitId?: string | null,
  brief?: string | null,
): string | null {
  if (explicitId && COMPONENT_SKILLS[explicitId]) return explicitId;
  if (brief) {
    for (const [re, id] of INFER) {
      if (re.test(brief) && COMPONENT_SKILLS[id]) return id;
    }
  }
  return null;
}

export function componentSkill(id: string | null): string | null {
  return id ? (COMPONENT_SKILLS[id] ?? null) : null;
}
