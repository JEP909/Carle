import Anthropic from "@anthropic-ai/sdk";
import {
  PRINCIPLES,
  ANTI_SLOP,
  GENERATE_CONTRACT,
  TWEAK_CONTRACT,
  VIBE_CONTRACT,
} from "./prompts";

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
