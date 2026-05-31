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
import { PRINCIPLES_BUNDLE, componentSkill } from "./knowledge";
import { anchorsFor, type Anchor } from "./anchors";
import { recipesText } from "./recipes";

// The build model. Opus is the quality bar; Sonnet is ~2x faster and far cheaper.
// Now that the knowledge/recipe harness does the heavy lifting, Sonnet is worth
// running as the default — override via CARLE_BUILD_MODEL to compare.
export const MODEL = process.env.CARLE_BUILD_MODEL || "claude-opus-4-8";

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

// ---------------------------------------------------------------------------
// The MVP path: knowledge-driven generation. ONE path, no presets, no corpus.
//
// The agent always reasons from the cross-cutting design principles (typography,
// color, layout, motion, anti-slop). If the brief is about a known component
// type, the relevant component skill is loaded too. Then it composes original
// work for the brief — "prompt it to make a graph and it makes a beautiful
// graph" — because it's reasoning from taste, not filling a template.
// ---------------------------------------------------------------------------
const KNOWLEDGE_CONTRACT = `# Your task

Build the single component the user describes — whatever it is. Reason from the
design knowledge above: choose type, color, layout, and motion with intent for
THIS brief and its domain. Be genuinely creative and specific — compose an
original piece, never a fill-in-the-blank template. Sweat the details: real
states, real on-brief copy, precise spacing, one clear focal point, a tasteful
moment of motion.

Output one complete, self-contained HTML document and nothing else — no fences,
no commentary. The first character of your reply must be \`<\`.`;

const KNOWLEDGE_TWEAK_CONTRACT = `# Your task

You will be given the current component (a full HTML document) and a change to
apply. Make exactly that change, keep everything else, and hold the same design
quality and principles above. Reply with the complete updated HTML document and
nothing else — first character \`<\`.`;

function anchorBlock(anchors: Anchor[]): string {
  const examples = anchors
    .map(
      (a, i) =>
        `## Example ${i + 1} — why it's good: ${a.note}\n\n\`\`\`html\n${a.html}\n\`\`\``,
    )
    .join("\n\n");
  return `# Quality bar — study these, do NOT copy them

The following are hand-built components that meet the quality bar this project
demands. Study them for CRAFT and CONSTRUCTION technique: how the diorama is
built from real, layered UI fragments; the restraint (slate ink, one accent, no
gradient-glow clichés); the precise spacing, shadows, and chart drawing; how copy
is anchored quietly below the scene.

Then build something ORIGINAL for the brief. Do not reuse their layout, content,
copy, or subject. Match their level of polish and their construction approach —
never their specifics. If your output resembles one of these examples, you have
failed; reason from the brief and compose freshly at this quality.

${examples}`;
}

// Build the system for the knowledge path. Principles bundle is the stable,
// cacheable prefix; an optional component skill is appended; validated anchors
// are supplied as a few-shot quality bar; the contract carries the cache
// breakpoint.
export function buildKnowledgeSystem(
  componentId: string | null,
  mode: "generate" | "tweak",
  recipes: string[] = [],
  paletteBlock?: string,
  brandBlock?: string,
): TextBlock[] {
  // Cache breakpoints, ordered most-stable-first so prefixes are reused:
  //  1) PRINCIPLES_BUNDLE — identical on EVERY request, ever (biggest static block).
  //  2) brand block — identical across all of a project's section builds.
  //  3) the contract (below) — caches the full prefix for an identical repeat.
  // Caching bills the cached prefix at ~10% on hits, which is the single biggest
  // cost cut for the parallel sample batch and repeated generations.
  const blocks: TextBlock[] = [
    { type: "text", text: PRINCIPLES_BUNDLE, cache_control: { type: "ephemeral" } },
  ];
  // Brand goes right after principles (before the per-section skill) so the
  // principles+brand prefix is identical across a project's sections and caches.
  if (mode === "generate" && brandBlock) {
    blocks.push({ type: "text", text: brandBlock, cache_control: { type: "ephemeral" } });
  }
  const skill = componentSkill(componentId);
  if (skill) blocks.push({ type: "text", text: skill });
  // The committed per-card color identity (gives the card character vs a plain
  // white box). Generate-only. Skipped when a brand block already sets color.
  if (mode === "generate" && paletteBlock && !brandBlock) {
    blocks.push({ type: "text", text: paletteBlock });
  }
  // The planner-selected recipes: precise construction guides for the rich
  // patterns this brief calls for (transcribed from the references).
  if (mode === "generate" && recipes.length) {
    const text = recipesText(recipes);
    if (text) {
      blocks.push({
        type: "text",
        text: `# Build recipes for this card (follow these closely)\n\n${text}`,
      });
    }
  }
  // Anchors only help generation; on tweak we keep the current doc the focus.
  if (mode === "generate") {
    const anchors = anchorsFor(componentId);
    if (anchors.length) blocks.push({ type: "text", text: anchorBlock(anchors) });
  }
  blocks.push({
    type: "text",
    text: mode === "generate" ? KNOWLEDGE_CONTRACT : KNOWLEDGE_TWEAK_CONTRACT,
    cache_control: { type: "ephemeral" },
  });
  return blocks;
}

// The embedded house font (Geist, base64 woff2) — injected server-side into the
// <head> of every generated card so output is self-contained with a real
// grotesque, without the model emitting ~90KB of base64. Loaded once.
import { readFileSync as _readFileSync } from "node:fs";
import { join as _join } from "node:path";
import { logoSvg } from "./logos";
import { tokensToPlaceholders, prefetchImages } from "./imagegen";
const FONT_BLOCK: string = (() => {
  try {
    return _readFileSync(_join(process.cwd(), "assets", "font-geist.html"), "utf8");
  } catch {
    return "";
  }
})();

// The model emits real brand logos as {{logo:NAME}} (optionally {{logo:NAME:SIZE}}
// or {{logo:NAME:SIZE:#hex|currentColor}}) instead of guessing SVG path data.
// We swap each token for the authentic inline SVG server-side.
const LOGO_TOKEN = /\{\{logo:([a-z0-9]+)(?::(\d+))?(?::(#[0-9a-fA-F]{3,8}|currentColor))?\}\}/g;
function replaceLogoTokens(s: string): string {
  // Models sometimes URL-encode the '#' in a hex color (%23) — normalize it so
  // the token matches.
  s = s.replace(/(\{\{logo:[^}]*?)%23/g, "$1#");
  s = s.replace(LOGO_TOKEN, (full, name, size, color) =>
    logoSvg(name, size ? Number(size) : 28, color || undefined) ?? "",
  );
  // Catch-all: drop any leftover/malformed logo token so raw `{{logo:...}}` text
  // never reaches the user (unknown brand, odd formatting, etc.).
  return s.replace(/\{\{logo:[^}]*\}\}/g, "");
}

// Finalize a STATIC (non-streamed) HTML document the way the stream does, minus
// images: inject the embedded font once (if absent) and resolve {{logo:...}}
// tokens to real inline SVGs. Used by /api/compose so hand-/server-authored
// harness HTML becomes a self-contained card. Image tokens are left for the
// image compositor to handle separately.
export function finalizeStaticHtml(html: string): string {
  let out = html;
  if (FONT_BLOCK && !/id="carle-font"/.test(out)) {
    const m = out.match(/<head[^>]*>/i);
    if (m) {
      const at = m.index! + m[0].length;
      out = out.slice(0, at) + "\n" + FONT_BLOCK + out.slice(at);
    }
  }
  return replaceLogoTokens(out);
}

// Turn an Anthropic text stream into a web ReadableStream of UTF-8 chunks the
// browser can read incrementally — this is what makes generation feel instant.
// As it streams, it (1) drops any stray characters before the first tag and
// (2) injects the embedded font once, right after the opening <head>.
export function toTextStream(
  params: Anthropic.MessageStreamParams,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      let headBuffer = "";   // holds text until <head> is found (for font inject)
      let tail = "";         // holds a small tail that might contain a partial {{logo:}} token
      let started = false;        // have we seen the first "<" yet?
      let fontInjected = FONT_BLOCK === "";  // treat empty font as "done"

      // Emit text with logo tokens replaced. Keep back any trailing partial token
      // ("{{lo…") so a token split across chunks is resolved, not emitted raw.
      const emit = (text: string) => {
        let s = tail + text;
        const cut = s.lastIndexOf("{{");
        let hold = "";
        if (cut !== -1 && !s.slice(cut).includes("}}")) {
          hold = s.slice(cut);
          s = s.slice(0, cut);
        }
        tail = hold;
        // Logos resolve inline; image tokens become shimmer placeholders that
        // carry their prompt — the real render is composited at the judge step.
        // Fire the render NOW (eager) so its ~14s overlaps the rest of the draft.
        if (s) {
          prefetchImages(s);
          controller.enqueue(encoder.encode(tokensToPlaceholders(replaceLogoTokens(s))));
        }
      };

      const flush = (text: string) => {
        if (!started) {
          const i = text.indexOf("<");
          if (i === -1) return;
          text = text.slice(i);
          started = true;
        }
        if (!fontInjected) {
          headBuffer += text;
          const m = headBuffer.match(/<head[^>]*>/i);
          if (m) {
            const at = m.index! + m[0].length;
            const out = headBuffer.slice(0, at) + "\n" + FONT_BLOCK + headBuffer.slice(at);
            fontInjected = true;
            emit(out);
            headBuffer = "";
          } else if (headBuffer.length > 4096) {
            fontInjected = true;
            emit(headBuffer);
            headBuffer = "";
          }
          return;
        }
        emit(text);
      };

      try {
        const stream = anthropic.messages.stream(params);
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            flush(event.delta.text);
          }
        }
        if (headBuffer) emit(headBuffer);
        if (tail) controller.enqueue(encoder.encode(tokensToPlaceholders(replaceLogoTokens(tail)))); // flush remainder
        await stream.finalMessage();
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (headBuffer) emit(headBuffer);
        if (tail) controller.enqueue(encoder.encode(tail));
        // Surface the error into the stream so the client can show it inline.
        controller.enqueue(encoder.encode(`\n\n<!-- carle-error: ${message} -->`));
        controller.close();
      }
    },
  });
}
