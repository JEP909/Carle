import { anthropic } from "./anthropic";

// Brief expander — moves the prompting burden from the user to the system. A
// casual one-liner ("graph of revenue for an ai agent company") becomes a tight
// internal spec the main generation reasons from: what component, what real
// content to show, how dense, what restraint. Runs on Sonnet (fast + cheap) and
// is invisible to the user.

const EXPAND_MODEL = "claude-sonnet-4-6";

const EXPAND_SYSTEM = `You turn a user's casual, underspecified request for a UI
card into a tight, concrete brief that a senior designer would work from. You do
NOT design or write HTML — you write the brief.

The user will type something loose. Infer the rest with strong, specific, tasteful
defaults so they don't have to spell it out:
- Identify the component type (feature card, stat/metric card, pricing, hero,
  testimonial, CTA, or a specific product-UI scene).
- Decide the ONE focal thing and the supporting elements.
- Invent realistic, specific content — real labels, plausible numbers, real
  company/section names, real time ranges — never placeholders. Pick a concrete
  example subject if the user was vague.
- Specify a DENSE, believable interior (real UI fragments: charts with axes and a
  labelled point, stat rows, toggles, chips, tables, a breakdown) — not a sparse
  gesture.
- Specify restraint: light surface, one confident accent, slate ink, the house
  grotesk. No cream/serif editorial look, no rainbow pills, no generic AI bolt
  icons or decorative status pills.
- Keep it to 3-6 tight sentences. Be concrete, not flowery.

Output ONLY the expanded brief text. No preamble, no JSON, no quotes.`;

// Expand a casual brief into a rich spec. Falls back to the original on any
// failure (the system must still work if this step errors).
export async function expandBrief(brief: string): Promise<string> {
  try {
    const res = await anthropic.messages.create({
      model: EXPAND_MODEL,
      max_tokens: 600,
      system: EXPAND_SYSTEM,
      messages: [{ role: "user", content: brief }],
    });
    const text = res.content.find((b) => b.type === "text");
    const out = text && text.type === "text" ? text.text.trim() : "";
    return out.length > brief.length ? out : brief;
  } catch {
    return brief;
  }
}
