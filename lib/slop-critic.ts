import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "./anthropic";
import { scanForSlop, type SlopFinding } from "./slop-check";

// The model-critic layer of the slop check. Regex catches the unambiguous tells
// for free; this catches the variations and the subtler "could be any AI
// startup" cases the regex can't. Runs on Sonnet (fast + ~5x cheaper than Opus)
// and returns concrete, actionable findings — or an empty list if the card is
// clean.

const CRITIC_MODEL = "claude-sonnet-4-6";

const CRITIC_SYSTEM = `You are a ruthless design critic guarding against
AI-generated "slop". You are given the full HTML of a single UI card. Your job:
find the specific things that make it look AI-generated, if any.

Hunt for these tells especially:
- A lightning-bolt, sparkle (✨), or magic-wand glyph used as an icon — the
  generic "AI / action / generate" mark.
- A lone glyph inside a purple/indigo rounded-square "hub" tile.
- Decorative status pills ("5 apps connected", "syncing", "● Live",
  "AI-powered") that are pure decoration, not real state.
- A generic tracked-uppercase eyebrow label (INTEGRATIONS, FEATURES, PLATFORM)
  used as a reflex above the heading.
- Hub-and-spoke orbit diagrams with a generic center.
- Bolded/recolored phrases scattered inside body copy; two-tone accent-word
  headlines.
- Washed-out timid color; flat shapes with no real depth; big dead empty zones.
- Anything that could belong to any AI startup rather than THIS specific product.

Be precise and specific. If the card is genuinely clean and high-craft, say so.

Respond as JSON only: {"clean": boolean, "findings": [{"id": string, "detail":
string}]}. Each detail must be an actionable fix instruction. No prose outside
the JSON.`;

export type CriticResult = {
  clean: boolean;
  findings: SlopFinding[];
  source: "regex" | "model" | "both";
};

// Run the full check: free regex scan first, then the model critic. Findings are
// merged and de-duplicated by id.
export async function criticReview(html: string): Promise<CriticResult> {
  const regexFindings = scanForSlop(html);

  let modelFindings: SlopFinding[] = [];
  try {
    const res = await anthropic.messages.create({
      model: CRITIC_MODEL,
      max_tokens: 1200,
      system: CRITIC_SYSTEM,
      messages: [{ role: "user", content: html }],
    });
    const text = res.content.find((b) => b.type === "text");
    if (text && text.type === "text") {
      const parsed = JSON.parse(stripFences(text.text));
      if (Array.isArray(parsed.findings)) {
        modelFindings = parsed.findings
          .filter((f: unknown) => f && typeof (f as SlopFinding).detail === "string")
          .map((f: SlopFinding) => ({ id: f.id || "critic", detail: f.detail }));
      }
    }
  } catch {
    // Critic is best-effort; if it fails, fall back to the regex findings only.
  }

  const byId = new Map<string, SlopFinding>();
  for (const f of [...regexFindings, ...modelFindings]) {
    if (!byId.has(f.id)) byId.set(f.id, f);
  }
  const findings = [...byId.values()];
  return {
    clean: findings.length === 0,
    findings,
    source: regexFindings.length && modelFindings.length ? "both" : modelFindings.length ? "model" : "regex",
  };
}

function stripFences(s: string): string {
  const m = s.match(/\{[\s\S]*\}/);
  return m ? m[0] : s;
}
