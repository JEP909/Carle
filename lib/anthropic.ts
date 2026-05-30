import Anthropic from "@anthropic-ai/sdk";
import {
  PRINCIPLES,
  ANTI_SLOP,
  GENERATE_CONTRACT,
  TWEAK_CONTRACT,
  VIBE_CONTRACT,
} from "./prompts";
import type { Archetype } from "./archetypes";
import type { DesignLanguage } from "./design-language";
import type { Structure } from "./structures";

export const MODEL = "claude-opus-4-8";

// Single shared client. The API key is injected at runtime via ANTHROPIC_API_KEY;
// the SDK resolves it from the environment.
export const anthropic = new Anthropic();

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

type TextBlock = Anthropic.TextBlockParam;

// Build the system array for a mode. principles + anti-slop are identical across
// every mode (the shared design soul); the per-mode contract is appended last and
// carries the cache breakpoint, so the whole static prefix caches together.
//
// Note on caching: Opus's minimum cacheable prefix is ~4096 tokens. As the
// principles/anti-slop/contract grow past that, `cache_read_input_tokens` starts
// reporting hits on repeat requests in the same mode. Below the threshold the
// breakpoint is a no-op (no error) — placement is already correct for when it
// matters.
function buildSystem(contract: string): TextBlock[] {
  return [
    { type: "text", text: PRINCIPLES },
    { type: "text", text: ANTI_SLOP },
    { type: "text", text: contract, cache_control: { type: "ephemeral" } },
  ];
}

export const GENERATE_SYSTEM = buildSystem(GENERATE_CONTRACT);
export const TWEAK_SYSTEM = buildSystem(TWEAK_CONTRACT);
export const VIBE_SYSTEM = buildSystem(VIBE_CONTRACT);

// Archetype system: principles stay, but the archetype's tuned aesthetic spec
// REPLACES the generic anti-slop (whose palette rules would contradict the
// house style), and a hand-built reference is supplied as loose inspiration —
// quality bar and visual language, not a template. The whole static prefix
// (principles + aesthetic + reference + contract) caches behind the breakpoint
// on the contract block.
function referenceBlock(arche: Archetype): string {
  return `# Reference component (quality bar — loose inspiration, NOT a template)

Below is a hand-built component in the "${arche.label}" house style. Study the
*level of craft* and the *visual vocabulary* — the foil/mesh treatment, the ink,
the shadow stack, the micro-detail density. Then build something fresh for the
brief: your own layout, your own focal object and content. Do not copy its
structure or reproduce it; match its quality and language.

\`\`\`html
${arche.reference}
\`\`\``;
}

export function buildArchetypeSystem(
  arche: Archetype,
  contract: string,
): TextBlock[] {
  return [
    { type: "text", text: PRINCIPLES },
    { type: "text", text: arche.aesthetic },
    { type: "text", text: referenceBlock(arche) },
    { type: "text", text: contract, cache_control: { type: "ephemeral" } },
  ];
}

// Resolve the system array for a generate/tweak request, with optional archetype.
export function systemFor(
  mode: "generate" | "tweak",
  arche: Archetype | null,
): TextBlock[] {
  const contract = mode === "generate" ? GENERATE_CONTRACT : TWEAK_CONTRACT;
  if (!arche) return mode === "generate" ? GENERATE_SYSTEM : TWEAK_SYSTEM;
  return buildArchetypeSystem(arche, contract);
}

// ---------------------------------------------------------------------------
// Composition: design language × structure × brief.
//
// This is the "smarter than templates" core. The design language (the vibe) and
// the structure (the intent) are INDEPENDENT inputs. We hand the model:
//   1. universal craft principles,
//   2. the language spec + any learned taste corrections,
//   3. a reference component as proof of the language's QUALITY BAR — explicitly
//      labelled with the structure it happens to be, so the model imitates the
//      *language*, not that structure,
//   4. the requested structure's intent (a job to do, never a skeleton),
//   5. the output contract (carries the cache breakpoint).
// The model then composes a fresh layout — no skeleton is ever filled in.
// ---------------------------------------------------------------------------
function languageReferenceBlock(lang: DesignLanguage): string {
  return `# Reference: the quality bar for the "${lang.label}" language

Below is a hand-built, production-quality component **in the ${lang.label}
language**. It happens to be a ${lang.referenceStructure} — that is NOT the
structure you must build. Study it only for the *design language*: how the canvas,
light/gradients, ink, type, form, detail density, and motion are executed, and
the overall level of craft. Reproduce that language and that quality in whatever
structure you are asked to build. Do not copy its layout or its content.

\`\`\`html
${lang.reference}
\`\`\``;
}

function learnedBlock(lang: DesignLanguage): string {
  if (!lang.learned.length) return "";
  return `# Learned taste (corrections that refine this language)

Apply these on top of the language spec — they reflect the user's accumulated
preferences and take precedence where they conflict:

${lang.learned.map((l) => `- ${l}`).join("\n")}`;
}

export function composeSystem(
  lang: DesignLanguage,
  structure: Structure,
  mode: "generate" | "tweak",
): TextBlock[] {
  const contract = mode === "generate" ? GENERATE_CONTRACT : TWEAK_CONTRACT;
  const blocks: TextBlock[] = [
    { type: "text", text: PRINCIPLES },
    { type: "text", text: lang.spec },
  ];
  const learned = learnedBlock(lang);
  if (learned) blocks.push({ type: "text", text: learned });
  blocks.push({ type: "text", text: languageReferenceBlock(lang) });
  blocks.push({
    type: "text",
    text: `# The structure to build\n\n${structure.intent}`,
  });
  blocks.push({ type: "text", text: contract, cache_control: { type: "ephemeral" } });
  return blocks;
}

// Turn an Anthropic text stream into a web ReadableStream of UTF-8 chunks the
// browser can read incrementally — this is what makes generation feel instant.
export function toTextStream(
  params: Anthropic.MessageStreamParams,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream(params);
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        await stream.finalMessage();
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // Surface the error into the stream so the client can show it inline.
        controller.enqueue(encoder.encode(`\n\n<!-- carle-error: ${message} -->`));
        controller.close();
      }
    },
  });
}
