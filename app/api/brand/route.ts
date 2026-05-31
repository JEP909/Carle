import { hasApiKey } from "@/lib/anthropic";
import { generateBrandProfile } from "@/lib/brand";

export const runtime = "nodejs";
export const maxDuration = 120;

// Generate (or tweak) a BrandProfile from a business description. One Sonnet call.
// POST {business}            -> fresh brand
// POST {business, tweak}     -> regenerate the brand with an adjustment note
export async function POST(req: Request) {
  if (!hasApiKey()) {
    return Response.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const business: string | undefined = body.business?.trim();
  const tweak: string | undefined = body.tweak?.trim();
  if (!business) {
    return Response.json({ error: "Describe your business or app." }, { status: 400 });
  }
  const brand = await generateBrandProfile(business, tweak);
  return Response.json(brand, { headers: { "Cache-Control": "no-store" } });
}
