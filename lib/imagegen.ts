import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Real rendered illustration assets — the fix for the "CSS ceiling".
//
// CSS can do gradients, glass, depth tricks — but it cannot produce the
// photoreal rendered objects the reference cards lean on (metallic credit cards
// with motion-blur, dimensional 3D shields, product devices). So for hero
// objects we call OpenAI's image model (gpt-image-1), get a transparent-PNG
// render, and composite it straight into the card as inline base64 — keeping the
// card a single self-contained document, exactly like the {{logo:}} mechanism.
//
// The model emits a {{image:PROMPT}} token where it wants a rendered object;
// compositeImages() generates every token in parallel and swaps in the asset.
// Results are cached on disk by prompt hash so identical objects are free/instant
// on re-runs (gpt-image-1 is ~14s and bills per image).
// ---------------------------------------------------------------------------

const CACHE_DIR = join(process.cwd(), ".imgcache");
const ENDPOINT = "https://api.openai.com/v1/images/generations";

export function hasImageKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

type GenOpts = {
  size?: "1024x1024" | "1536x1024" | "1024x1536";
  quality?: "low" | "medium" | "high";
  background?: "transparent" | "opaque" | "auto";
};

function cacheKey(prompt: string, opts: GenOpts): string {
  const h = createHash("sha256");
  h.update(JSON.stringify({ prompt, ...opts }));
  return h.digest("hex").slice(0, 32);
}

// Generate one rendered asset. Returns a base64 PNG data URL, cached on disk.
export async function generateImage(
  prompt: string,
  opts: GenOpts = {},
): Promise<string> {
  const o: Required<GenOpts> = {
    size: opts.size ?? "1024x1024",
    quality: opts.quality ?? "medium",
    background: opts.background ?? "transparent",
  };

  const key = cacheKey(prompt, o);
  const cachePath = join(CACHE_DIR, `${key}.b64`);
  if (existsSync(cachePath)) {
    return `data:image/png;base64,${readFileSync(cachePath, "utf8")}`;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  // We always ask for an isolated object on a transparent field so it drops
  // cleanly onto the card's own color, not a white box. The wrapper text steers
  // every prompt toward the reference look.
  const fullPrompt = `${prompt}

Single isolated object, no background, no scene, no text, no labels, no UI,
centered with generous margin. Photoreal product render, crisp edges, soft
realistic shadow, high detail, premium quality.`;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: fullPrompt,
      n: 1,
      size: o.size,
      quality: o.quality,
      background: o.background,
      output_format: "png",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`gpt-image-1 ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error("gpt-image-1 returned no image data");

  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(cachePath, b64, "utf8");
  } catch {
    // cache write is best-effort
  }

  return `data:image/png;base64,${b64}`;
}

// {{image:PROMPT}} — free text until the closing }}. Optional leading size hint
// {{image:wide|PROMPT}} or {{image:tall|PROMPT}} for landscape/portrait heroes.
const IMAGE_TOKEN = /\{\{image:([\s\S]*?)\}\}/g;
// The placeholder an image token becomes during streaming — a real <img> that
// carries the (encoded) prompt so it survives the round-trip to the browser and
// back to the compositor. data-carle-w is "wide"/"tall"/"" for the size hint.
const PLACEHOLDER =
  /<img\b[^>]*\bdata-carle-img="([^"]*)"[^>]*\bdata-carle-w="([^"]*)"[^>]*>/g;

function optsFor(hint: string): GenOpts {
  if (hint === "wide") return { size: "1536x1024" };
  if (hint === "tall") return { size: "1024x1536" };
  return {};
}

// Turn {{image:...}} tokens into placeholder <img> elements: a subtle shimmer
// box during streaming, with the prompt + size hint stashed as data attributes.
// The browser sees a clean loading panel where the rendered object will land.
export function tokensToPlaceholders(s: string): string {
  return s.replace(IMAGE_TOKEN, (_full, raw: string) => {
    const m = raw.match(/^(wide|tall)\|([\s\S]+)$/);
    const hint = m ? m[1] : "";
    const prompt = (m ? m[2] : raw).trim();
    const enc = encodeURIComponent(prompt);
    return `<img data-carle-img="${enc}" data-carle-w="${hint}" alt="" style="display:block;width:100%;height:100%;object-fit:contain;border-radius:inherit;background:linear-gradient(110deg,rgba(255,255,255,.04),rgba(255,255,255,.12),rgba(255,255,255,.04));" />`;
  });
}

// Find every rendered-object placeholder, generate them all in parallel, and
// swap in the inline base64 asset. On failure the placeholder is left (the
// shimmer box) so the card still renders. No-op when no placeholders or no key.
export async function compositeImages(html: string): Promise<string> {
  // Accept raw tokens too (test scripts / non-streamed HTML).
  const withPlaceholders = tokensToPlaceholders(html);

  const matches = [...withPlaceholders.matchAll(PLACEHOLDER)];
  if (!matches.length || !hasImageKey()) return withPlaceholders;

  // De-dupe identical (prompt|hint) pairs so a fanned deck doesn't pay 3×.
  const jobs = new Map<string, { prompt: string; opts: GenOpts }>();
  for (const m of matches) {
    const enc = m[1];
    const hint = m[2];
    const id = `${hint}|${enc}`;
    if (!jobs.has(id)) {
      jobs.set(id, { prompt: decodeURIComponent(enc), opts: optsFor(hint) });
    }
  }

  const results = new Map<string, string | null>();
  await Promise.all(
    [...jobs.entries()].map(async ([id, { prompt, opts }]) => {
      try {
        results.set(id, await generateImage(prompt, opts));
      } catch {
        results.set(id, null);
      }
    }),
  );

  return withPlaceholders.replace(PLACEHOLDER, (full, enc, hint) => {
    const url = results.get(`${hint}|${enc}`);
    if (!url) return full;
    return `<img src="${url}" alt="" style="display:block;width:100%;height:100%;object-fit:contain;border-radius:inherit;" />`;
  });
}

// True if the HTML still contains image tokens or unresolved placeholders.
export function hasImageTokens(html: string): boolean {
  IMAGE_TOKEN.lastIndex = 0;
  PLACEHOLDER.lastIndex = 0;
  return IMAGE_TOKEN.test(html) || PLACEHOLDER.test(html);
}
