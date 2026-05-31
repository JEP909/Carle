import { anthropic } from "./anthropic";
import { recipeMenuText, RECIPES } from "./recipes";
import { COMPONENT_SKILLS } from "./knowledge";

// The planner — reads the (expanded) brief and SELECTS which component skill and
// which recipe(s) are relevant, so only those load into the build context. This
// is what lets the MD library grow deep without bloating every prompt: the model
// consults the right docs for the task, like an agent.

const PLAN_MODEL = "claude-sonnet-4-6"; // fast + cheap; selection, not generation

export type Plan = { component: string | null; recipes: string[] };

const PLAN_SYSTEM = (recipeMenu: string, components: string[]) => `You are a
build planner for a UI-card generator. Given a brief, pick the most relevant
COMPONENT type and 1–2 RECIPES (construction guides) to load. Choose only what
genuinely fits — fewer, well-matched picks beat many.

COMPONENTS: ${components.join(", ")}

RECIPES (id: when to use):
${recipeMenu}

Respond ONLY as JSON: {"component": "<id or null>", "recipes": ["<id>", ...]}.
Use null for component if none fits. recipes may be empty if none fits.`;

export async function plan(brief: string): Promise<Plan> {
  const components = Object.keys(COMPONENT_SKILLS);
  try {
    const res = await anthropic.messages.create({
      model: PLAN_MODEL,
      max_tokens: 200,
      system: PLAN_SYSTEM(recipeMenuText(), components),
      messages: [{ role: "user", content: brief }],
    });
    const t = res.content.find((b) => b.type === "text");
    const raw = t && t.type === "text" ? t.text : "";
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return { component: null, recipes: [] };
    const p = JSON.parse(m[0]);
    const recipes = Array.isArray(p.recipes)
      ? p.recipes.filter((r: unknown) => typeof r === "string" && RECIPES[r as string]).slice(0, 2)
      : [];
    const component =
      typeof p.component === "string" && COMPONENT_SKILLS[p.component] ? p.component : null;
    return { component, recipes };
  } catch {
    return { component: null, recipes: [] };
  }
}
