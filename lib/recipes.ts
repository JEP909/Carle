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
  { id: "orbit-constellation", when: "a SINGLE hub-and-spokes constellation diorama inside ONE card (tools/integrations orbiting a central hub). For a full multi-card section, prefer platform-features instead." },
  { id: "floating-subpanels", when: "a list/settings/schedule/summary with toggles or options, on a confident saturated color field (fintech, config, dashboards)." },
  { id: "rendered-cards", when: "a physical-object hero: payment cards, passes, devices, tickets, wallets — anything that wants a 3D rendered object." },
  { id: "logo-grid", when: "showing many real brand/platform integrations as logos in tiles (omnichannel, 'works with X/Y/Z')." },
  { id: "dataviz", when: "a metric/stat with a chart, trend, or breakdown (revenue, usage, analytics, growth)." },
  { id: "chat-diorama", when: "a conversation/support/agent-does-a-task flow shown as chat bubbles producing a result artifact." },
  { id: "linear-dark-app", when: "a refined DARK product surface (dev tools, workflow/issue tracking, technical SaaS, AI agents shown as a real app) — Linear-style glass panels on charcoal." },
  { id: "earn-cards", when: "loyalty/rewards/partner/offer cards: each item is a brand logo + a big 'earn up to N' number + a photoreal product/card render bleeding off the edge (Chexy 'more ways to earn')." },
  { id: "platform-features", when: "a full feature SECTION with a heading and TWO feature cards that have rich UI dioramas — e.g. an LLM/model-provider constellation card + an agent-builder UI card (Chatbase 'the complete platform for AI support agents'). Prefer this for ANY two-card platform/product feature section." },
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
