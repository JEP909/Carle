import { anthropic, buildKnowledgeSystem, finalizeStaticHtml, hasApiKey } from "@/lib/anthropic";
import { compositeImages } from "@/lib/imagegen";
import { TEMPLATES } from "@/lib/templates";
import { brandSystemBlock, brandSpecInstruction, type BrandProfile, type SectionPlan } from "@/lib/brand";
import { templateIdFromBrief } from "@/lib/templates";
import { plan } from "@/lib/planner";
import { resolveComponent } from "@/lib/knowledge";
import { paletteText } from "@/lib/palette";
import { type Tier, modelFor, defaultTier, isTier } from "@/lib/models";
import { usdForCall, usdForImages, toCredits, type TokenUsage } from "@/lib/cost";

export const runtime = "nodejs";
export const maxDuration = 300;

type Sample = { id: string; label: string; html: string };
type Built = Sample & { usd: number };

function imagesIn(html: string): number {
  return (html.match(/src="data:image/g) ?? []).length;
}

function textOf(res: { content: Array<{ type: string; text?: string }> }): string {
  const t = res.content.find((b) => b.type === "text");
  return t && t.type === "text" ? t.text ?? "" : "";
}

// Build one section in the brand's design language. Templated patterns take the
// fast deterministic path (Sonnet content spec -> coded layout); everything else
// is a free Opus build with the brand block injected for cohesion.
async function buildSection(brand: BrandProfile, section: SectionPlan, tier: Tier): Promise<Built> {
  // ---- Templated (fast, deterministic layout) ----
  if (section.template && TEMPLATES[section.template]) {
    const tmpl = TEMPLATES[section.template];
    try {
      const specModel = modelFor("spec", tier);
      const res = await anthropic.messages.create({
        model: specModel,
        max_tokens: 2000,
        system: brandSpecInstruction(brand) + tmpl.instruction,
        messages: [{ role: "user", content: section.brief }],
      });
      const html = tmpl.build(textOf(res));
      if (html) {
        const withAssets = finalizeStaticHtml(html).replace(/\{\{logo:[^}]*\}\}/g, "");
        const finalHtml = await compositeImages(withAssets);
        const usd = usdForCall(specModel, (res as { usage?: TokenUsage }).usage ?? {}) + usdForImages(imagesIn(finalHtml));
        return { id: section.id, label: section.label, html: finalHtml, usd };
      }
    } catch {
      // fall through to free-build
    }
  }

  // ---- Free build (brand-injected, recipe-planned) ----
  const buildModel = modelFor("build", tier);
  const p = await plan(section.brief, tier).catch(() => ({ component: null, recipes: [] as string[] }));
  const component = resolveComponent(p.component, section.brief);
  const system = buildKnowledgeSystem(
    component,
    "generate",
    p.recipes,
    paletteText(brand.palette),
    brandSystemBlock(brand),
  );
  const res = await anthropic.messages.create({
    model: buildModel,
    max_tokens: 16000,
    thinking: { type: "disabled" },
    system,
    messages: [{ role: "user", content: section.brief }],
  });
  let raw = textOf(res);
  const i = raw.indexOf("<");
  if (i > 0) raw = raw.slice(i);
  const finalHtml = await compositeImages(finalizeStaticHtml(raw));
  const usd = usdForCall(buildModel, (res as { usage?: TokenUsage }).usage ?? {}) + usdForImages(imagesIn(finalHtml));
  return { id: section.id, label: section.label, html: finalHtml, usd };
}

// Run jobs with bounded concurrency (avoid hammering the Opus rate limit with N
// simultaneous free builds).
async function pooled<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

// POST {brand}            -> build all sections (in the brand)
// POST {brand, only:id}   -> rebuild a single section (regenerate-one)
// POST {brand, addBrief}  -> build ONE new section from a brief, in the brand
//                            (the "agent keeps building in your language" loop)
export async function POST(req: Request) {
  if (!hasApiKey()) {
    return Response.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const brand: BrandProfile | undefined = body.brand;
  const only: string | undefined = body.only;
  const addBrief: string | undefined = body.addBrief?.trim();
  if (!brand || !Array.isArray(brand.sections)) {
    return Response.json({ error: "No brand profile provided." }, { status: 400 });
  }

  // Tier resolution: explicit request override -> the agent's saved tier -> default.
  const tier: Tier = isTier(body.tier) ? body.tier : brand.tier ?? defaultTier();

  // A new section from a free-text brief, built in the existing brand.
  if (addBrief) {
    const section: SectionPlan = {
      id: `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      label: addBrief.length > 32 ? addBrief.slice(0, 30) + "…" : addBrief,
      brief: addBrief,
      template: brand.canvasMode === "light-monochrome" ? templateIdFromBrief(addBrief) : null,
    };
    const b = await buildSection(brand, section, tier);
    return Response.json(
      { samples: [{ id: b.id, label: b.label, html: b.html }], cost: { usd: Number(b.usd.toFixed(4)), credits: toCredits(b.usd), tier } },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const sections = only ? brand.sections.filter((s) => s.id === only) : brand.sections;
  const built = await pooled(sections, 3, (s) => buildSection(brand, s, tier));
  const usd = built.reduce((sum, b) => sum + b.usd, 0);
  const samples: Sample[] = built.map(({ id, label, html }) => ({ id, label, html }));
  return Response.json(
    { samples, cost: { usd: Number(usd.toFixed(4)), credits: toCredits(usd), tier } },
    { headers: { "Cache-Control": "no-store" } },
  );
}
