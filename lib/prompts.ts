import { readFileSync } from "node:fs";
import { join } from "node:path";

// Loaded once at module init. These are the static, stable system prompts that
// form the cacheable prefix sent on every request (see lib/anthropic.ts).
const PROMPTS_DIR = join(process.cwd(), "prompts");

export const PRINCIPLES = readFileSync(join(PROMPTS_DIR, "principles.md"), "utf8");
export const ANTI_SLOP = readFileSync(join(PROMPTS_DIR, "anti-slop.md"), "utf8");

// Per-mode task contracts. Kept here (not in the user message) so they stay part
// of the cached system prefix rather than varying per request.
export const GENERATE_CONTRACT = `# Task: generate one component

Read the brief and build a single component that embodies the principles and
respects the anti-slop contract above. Reply with the complete HTML document and
nothing else — no fences, no commentary. The first character of your reply must be
\`<\`.`;

export const TWEAK_CONTRACT = `# Task: tweak one component

You will be given the current component (a full HTML document) and a change to
apply. Return the complete, updated HTML document with the change made and
everything else preserved — same principles, same anti-slop contract. Reply with
the HTML document and nothing else; the first character of your reply must be \`<\`.`;

export const VIBE_CONTRACT = `# Task: extract the design language ("train the agent")

You will be given a finished component the user has locked in. Study it and write
its design language as a \`vibe.md\` file: the reusable system that would let an
agent build an entire site that feels like it came from the same hand.

Capture, concretely and specifically (cite the actual values from the component):
- **Palette** — exact hex values and the role each color plays.
- **Type** — the families, the scale, weights, line-heights, tracking.
- **Space & rhythm** — the base unit and how spacing is used.
- **Form language** — radii, borders, shadows, density, shape motifs.
- **Motion** — durations, easing, what animates and why.
- **Voice** — the tone of the copy and the register of the design.
- **Rules** — the do's and don'ts that keep new screens on-language.

Write it as clean Markdown a design agent could follow. Reply with the \`vibe.md\`
content only — no fences around the whole thing, no preamble.`;
