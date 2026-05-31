import { MODEL, anthropic, buildKnowledgeSystem, finalizeStaticHtml, hasApiKey } from "@/lib/anthropic";
import { compositeImages } from "@/lib/imagegen";
import { TEMPLATES } from "@/lib/templates";
import { brandSystemBlock, brandSpecInstruction, type BrandProfile, type SectionPlan } from "@/lib/brand";
import { plan } from "@/lib/planner";
import { resolveComponent } from "@/lib/knowledge";
import { paletteText } from "@/lib/palette";

export const runtime = "nodejs";
export const maxDuration = 300;

const SPEC_MODEL = "claude-sonnet-4-6"; // template content specs — fast + cheap

type Sample = { id: string; label: string; html: string };

function textOf(res: { content: Array<{ type: string; text?: string }> }): string {
  const t = res.content.find((b) => b.type === "text");
  return t && t.type === "text" ? t.text ?? "" : "";
}

// Build one section in the brand's design language. Templated patterns take the
// fast deterministic path (Sonnet content spec -> coded layout); everything else
// is a free Opus build with the brand block injected for cohesion.
async function buildSection(brand: BrandProfile, section: SectionPlan): Promise<Sample> {
  // ---- Templated (fast, deterministic layout) ----
  if (section.template && TEMPLATES[section.template]) {
    const tmpl = TEMPLATES[section.template];
    try {
      const res = await anthropic.messages.create({
        model: SPEC_MODEL,
        max_tokens: 2000,
        system: brandSpecInstruction(brand) + tmpl.instruction,
        messages: [{ role: "user", content: section.brief }],
      });
      const html = tmpl.build(textOf(res));
      if (html) {
        const withAssets = finalizeStaticHtml(html).replace(/\{\{logo:[^}]*\}\}/g, "");
        return { id: section.id, label: section.label, html: await compositeImages(withAssets) };
      }
    } catch {
      // fall through to free-build
    }
  }

  // ---- Free build (brand-injected, recipe-planned) ----
  const p = await plan(section.brief).catch(() => ({ component: null, recipes: [] as string[] }));
  const component = resolveComponent(p.component, section.brief);
  const system = buildKnowledgeSystem(
    component,
    "generate",
    p.recipes,
    paletteText(brand.palette),
    brandSystemBlock(brand),
  );
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "disabled" },
    system,
    messages: [{ role: "user", content: section.brief }],
  });
  let raw = textOf(res);
  const i = raw.indexOf("<");
  if (i > 0) raw = raw.slice(i);
  const finalHtml = await compositeImages(finalizeStaticHtml(raw));
  return { id: section.id, label: section.label, html: finalHtml };
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
export async function POST(req: Request) {
  if (!hasApiKey()) {
    return Response.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const brand: BrandProfile | undefined = body.brand;
  const only: string | undefined = body.only;
  if (!brand || !Array.isArray(brand.sections)) {
    return Response.json({ error: "No brand profile provided." }, { status: 400 });
  }

  const sections = only ? brand.sections.filter((s) => s.id === only) : brand.sections;
  const samples = await pooled(sections, 3, (s) => buildSection(brand, s));
  return Response.json({ samples }, { headers: { "Cache-Control": "no-store" } });
}
