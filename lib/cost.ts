// Cost estimation — tracks the real API spend of a generation so we can map it to
// credits (and, later, Stripe). Rates are APPROXIMATE USD per 1M tokens; keep them
// in one place and update as pricing changes. The point is the plumbing
// (usage -> $ -> credits), not penny precision.

export type TokenUsage = {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
};

// ~USD per 1M tokens. Cached reads are far cheaper; cache writes a bit pricier.
const RATES: Record<string, { in: number; out: number; cacheRead: number; cacheWrite: number }> = {
  opus: { in: 15, out: 75, cacheRead: 1.5, cacheWrite: 18.75 },
  sonnet: { in: 3, out: 15, cacheRead: 0.3, cacheWrite: 3.75 },
  haiku: { in: 1, out: 5, cacheRead: 0.1, cacheWrite: 1.25 },
};

// gpt-image-1, ~USD per image by quality (approximate).
export const IMAGE_USD: Record<string, number> = { low: 0.011, medium: 0.042, high: 0.167 };

function family(model: string): keyof typeof RATES {
  if (/opus/i.test(model)) return "opus";
  if (/haiku/i.test(model)) return "haiku";
  return "sonnet";
}

export function usdForCall(model: string, u: TokenUsage): number {
  const r = RATES[family(model)];
  const M = 1_000_000;
  return (
    ((u.input_tokens ?? 0) * r.in +
      (u.output_tokens ?? 0) * r.out +
      (u.cache_read_input_tokens ?? 0) * r.cacheRead +
      (u.cache_creation_input_tokens ?? 0) * r.cacheWrite) /
    M
  );
}

export function usdForImages(n: number, quality = "medium"): number {
  return n * (IMAGE_USD[quality] ?? IMAGE_USD.medium);
}

// Credits — the internal unit shown to users. 1 credit ≈ $0.01 of raw API cost
// (pre-markup). A Stripe markup gets applied at purchase later; this just maps a
// generation's real cost onto credits so the meter is honest.
export const CREDIT_USD = 0.01;

export function toCredits(usd: number): number {
  return Math.max(1, Math.ceil(usd / CREDIT_USD));
}
