import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// The recipe library — precise "how to build rich things" construction guides,
// transcribed from the reference images. The planner selects which recipe(s) to
// load for a given brief so context stays sharp as the library grows.

const ROOT = process.cwd();
const DIR = join(ROOT, "knowledge", "recipes");

function load(): Record<string, string> {
  if (!existsSync(DIR)) return {};
  const out: Record<string, string> = {};
  for (const f of readdirSync(DIR)) {
    if (f.endsWith(".md")) out[f.replace(/\.md$/, "")] = readFileSync(join(DIR, f), "utf8");
  }
  return out;
}

export const RECIPES: Record<string, string> = load();

// id -> one-line "when to use", for the planner to choose from cheaply.
export const RECIPE_INDEX: Array<{ id: string; when: string }> = [
  { id: "orbit-constellation", when: "connecting/orchestrating tools, an AI hub tying things together, integrations as a constellation, 'powered by many models'." },
  { id: "floating-subpanels", when: "a list/settings/schedule/summary with toggles or options, on a confident saturated color field (fintech, config, dashboards)." },
  { id: "rendered-cards", when: "a physical-object hero: payment cards, passes, devices, tickets, wallets — anything that wants a 3D rendered object." },
  { id: "logo-grid", when: "showing many real brand/platform integrations as logos in tiles (omnichannel, 'works with X/Y/Z')." },
  { id: "dataviz", when: "a metric/stat with a chart, trend, or breakdown (revenue, usage, analytics, growth)." },
  { id: "chat-diorama", when: "a conversation/support/agent-does-a-task flow shown as chat bubbles producing a result artifact." },
];

export function recipesText(ids: string[]): string {
  const blocks = ids
    .map((id) => RECIPES[id])
    .filter(Boolean)
    .map((md) => md);
  return blocks.join("\n\n---\n\n");
}

export function recipeMenuText(): string {
  return RECIPE_INDEX.filter((r) => RECIPES[r.id])
    .map((r) => `- ${r.id}: ${r.when}`)
    .join("\n");
}
