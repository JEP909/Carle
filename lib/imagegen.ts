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

// WebP (with alpha) at ~75% quality is visually indistinguishable from the PNG
// here but ~5-8× smaller, which is what kept the card HTML at ~2.5MB. Bumping
// the version tag invalidates the old PNG-keyed cache entries.
const FORMAT = "webp";
const COMPRESSION = 75;
const CACHE_VERSION = "v2-webp";

function cacheKey(prompt: string, opts: GenOpts): string {
  const h = createHash("sha256");
  h.update(JSON.stringify({ v: CACHE_VERSION, prompt, ...opts }));
  return h.digest("hex").slice(0, 32);
}

// Dedup concurrent generations of the SAME asset within this process. Eager
// generation (fired mid-stream) and the later judge-time composite then share a
// single API call instead of racing to bill twice.
const inflight = new Map<string, Promise<string>>();

// Generate one rendered asset. Returns a base64 WebP data URL, cached on disk.
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
    return `data:image/${FORMAT};base64,${readFileSync(cachePath, "utf8")}`;
  }

  const pending = inflight.get(key);
  if (pending) return pending;

  const job = (async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

    // We always ask for an isolated object on a transparent field so it drops
    // cleanly onto the card's own color, not a white box. The wrapper text
    // steers every prompt toward the reference look.
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
        output_format: FORMAT,
        output_compression: COMPRESSION,
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

    return `data:image/${FORMAT};base64,${b64}`;
  })();

  inflight.set(key, job);
  try {
    return await job;
  } finally {
    inflight.delete(key);
  }
}

// {{image:PROMPT}} — free text until the closing }}. Optional leading size hint
// {{image:wide|PROMPT}} or {{image:tall|PROMPT}} for landscape/portrait heroes.
//
// These are SOURCE strings, not shared RegExp objects: a global regex carries a
// mutable lastIndex, so reusing one instance across .test()/.matchAll()/.replace()
// leaks state between calls (a .test() leaves lastIndex non-zero and a later
// .matchAll() then starts mid-string and misses matches). We build a fresh regex
// at every use instead.
const IMAGE_TOKEN_SRC = "\\{\\{image:([\\s\\S]*?)\\}\\}";
const PLACEHOLDER_SRC =
  '<img\\b[^>]*\\bdata-carle-img="([^"]*)"[^>]*\\bdata-carle-w="([^"]*)"[^>]*>';
const imageTokenRe = () => new RegExp(IMAGE_TOKEN_SRC, "g");
const placeholderRe = () => new RegExp(PLACEHOLDER_SRC, "g");

function optsFor(hint: string): GenOpts {
  if (hint === "wide") return { size: "1536x1024" };
  if (hint === "tall") return { size: "1024x1536" };
  return {};
}

// Parse a raw token body ("wide|a sleek laptop ...") into prompt + opts.
function parseRaw(raw: string): { prompt: string; opts: GenOpts } {
  const m = raw.match(/^(wide|tall)\|([\s\S]+)$/);
  const hint = m ? m[1] : "";
  const prompt = (m ? m[2] : raw).trim();
  return { prompt, opts: optsFor(hint) };
}

// Eager generation: fire (don't await) a render for every complete {{image:...}}
// token in a streamed chunk, so the ~14s gen overlaps the rest of the draft and
// the judge pass. The in-flight map dedups, so the later composite reuses this
// exact call rather than billing again. Safe no-op without a key.
export function prefetchImages(chunk: string): void {
  if (!hasImageKey()) return;
  for (const m of chunk.matchAll(imageTokenRe())) {
    const { prompt, opts } = parseRaw(m[1]);
    generateImage(prompt, opts).catch(() => {});
  }
}

// Turn {{image:...}} tokens into placeholder <img> elements: a subtle shimmer
// box during streaming, with the prompt + size hint stashed as data attributes.
// The browser sees a clean loading panel where the rendered object will land.
export function tokensToPlaceholders(s: string): string {
  return s.replace(imageTokenRe(), (_full, raw: string) => {
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

  const matches = [...withPlaceholders.matchAll(placeholderRe())];
  if (!matches.length || !hasImageKey()) return stripResidualTokens(withPlaceholders);

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

  const out = withPlaceholders.replace(placeholderRe(), (full, enc, hint) => {
    const url = results.get(`${hint}|${enc}`);
    if (!url) return full;
    return `<img src="${url}" alt="" style="display:block;width:100%;height:100%;object-fit:contain;border-radius:inherit;" />`;
  });
  return stripResidualTokens(out);
}

// After all real tokens are resolved, drop any leftover {{...}} — models sometimes
// invent tokens (e.g. {{check}}) that would otherwise show as raw text.
function stripResidualTokens(html: string): string {
  return html.replace(/\{\{[a-zA-Z][^{}]*\}\}/g, "");
}

// True if the HTML still contains image tokens or unresolved placeholders.
export function hasImageTokens(html: string): boolean {
  return imageTokenRe().test(html) || placeholderRe().test(html);
}
