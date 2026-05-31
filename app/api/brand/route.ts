import { hasApiKey } from "@/lib/anthropic";
import { generateBrandProfile } from "@/lib/brand";
import { defaultTier, isTier } from "@/lib/models";

export const runtime = "nodejs";
export const maxDuration = 120;

// Generate (or tweak) a BrandProfile from a business description. One model call.
// POST {business, tier?}          -> fresh brand (tier saved onto the agent)
// POST {business, tweak, tier?}   -> regenerate the brand with an adjustment note
export async function POST(req: Request) {
  if (!hasApiKey()) {
    return Response.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const business: string | undefined = body.business?.trim();
  const tweak: string | undefined = body.tweak?.trim();
  const tier = isTier(body.tier) ? body.tier : defaultTier();
  if (!business) {
    return Response.json({ error: "Describe your business or app." }, { status: 400 });
  }
  const brand = await generateBrandProfile(business, tweak, tier);
  return Response.json(brand, { headers: { "Cache-Control": "no-store" } });
}
