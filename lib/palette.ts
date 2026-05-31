import { anthropic } from "./anthropic";

// Palette picker — gives every card a COMMITTED color identity instead of the
// default colorless white-box/navy. The system chooses a saturated field + mood
// per brief (like a designer setting a brand direction), and the builder must
// use it. This is what gives cards character.

const PALETTE_MODEL = "claude-sonnet-4-6"; // fast; a design call, not generation

export type Palette = {
  field: string; // CSS for the saturated stage background (gradient/wash)
  accents: string; // the accent hues + where they go
  ink: string; // text colors on the field / on panels
  mood: string; // one-line character (e.g. "confident fintech indigo")
};

const PALETTE_SYSTEM = `You are a senior brand designer choosing a COMMITTED,
saturated color identity for a single UI card, based on its brief. The cards have
been too colorless (white box, navy ink, timid accent). Fix that: pick a
confident, characterful palette that fits the brief's domain and mood — the way
Chexy commits to a deep indigo field, Chatbase to a purple watercolor wash, Stan
to grainy per-card color fields.

Rules:
- The FIELD is a saturated, real backdrop (a multi-stop gradient or wash), not a
  pale tint and not white. Commit to the color. Floating white/dark panels will
  sit on it.
- Choose hues that suit the brief's industry and feeling (fintech=deep indigo/
  violet; health=teal/green; creator=warm coral/magenta; dev-tools=ink+electric
  accent; AI=spectral indigo→violet). Avoid the generic "AI purple-on-black".
- Give 1–2 accents used with intent, an ink ramp that's legible, and name the
  mood in a few words.
- Tasteful and premium, never garish or rainbow.

Respond ONLY as JSON:
{"field": "<CSS background value>", "accents": "<hues + usage>", "ink": "<text colors>", "mood": "<short phrase>"}`;

export async function pickPalette(brief: string): Promise<Palette | null> {
  try {
    const res = await anthropic.messages.create({
      model: PALETTE_MODEL,
      max_tokens: 400,
      system: PALETTE_SYSTEM,
      messages: [{ role: "user", content: brief }],
    });
    const t = res.content.find((b) => b.type === "text");
    const raw = t && t.type === "text" ? t.text : "";
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const p = JSON.parse(m[0]);
    if (!p.field) return null;
    return {
      field: String(p.field),
      accents: String(p.accents ?? ""),
      ink: String(p.ink ?? ""),
      mood: String(p.mood ?? ""),
    };
  } catch {
    return null;
  }
}

export function paletteText(p: Palette): string {
  return `# Color identity for this card (USE IT — commit to it)

This card MUST have real color character, not a plain white box with navy ink.
Build it around this committed palette:

- MOOD: ${p.mood}
- FIELD (the saturated stage/backdrop — use this, not white): ${p.field}
- ACCENTS: ${p.accents}
- INK: ${p.ink}

Put the diorama/content on this saturated field (or use it as a strong section),
with floating white or dark panels for the UI fragments. Commit to the color —
a confident saturated field is the goal, not a pale tint. Keep it tasteful and
premium; never garish or rainbow.`;
}
