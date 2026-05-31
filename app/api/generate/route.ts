import {
  MODEL,
  anthropic,
  buildKnowledgeSystem,
  finalizeStaticHtml,
  toTextStream,
  hasApiKey,
} from "@/lib/anthropic";
import { resolveComponent } from "@/lib/knowledge";
import { expandBrief } from "@/lib/expand";
import { plan } from "@/lib/planner";
import { pickPalette, paletteText } from "@/lib/palette";
import { pickTemplate } from "@/lib/templates";
import { compositeImages } from "@/lib/imagegen";

const SPEC_MODEL = "claude-sonnet-4-6"; // content-only JSON; cheap + fast

export const runtime = "nodejs";
export const maxDuration = 300;

// One path: knowledge-driven generation. Describe any component; the agent
// reasons from the design-knowledge skills (always-on principles + the relevant
// component skill, inferred from the brief or passed explicitly) and composes an
// original piece. No presets, no corpus.
export async function POST(req: Request) {
  if (!hasApiKey()) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not set in this environment." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const prompt: string | undefined = body.prompt?.trim();
  const current: string | undefined = body.current;
  const tweak: string | undefined = body.tweak?.trim();

  const isTweak = Boolean(current && tweak);
  if (!isTweak && !prompt) {
    return Response.json({ error: "Describe what to build." }, { status: 400 });
  }

  const mode = isTweak ? "tweak" : "generate";

  // Move the prompting burden to the system: expand a casual brief into a rich
  // internal spec before generating. (Skip for tweaks and when the caller opts
  // out via { expand: false } — e.g. the harness running pre-written briefs.)
  const spec =
    !isTweak && body.expand !== false ? await expandBrief(prompt!) : prompt;

  // Planner: pick the component + recipe(s); plus a committed color palette so
  // the card has real character (not a plain white box). Run in parallel.
  let componentId = resolveComponent(body.component, spec ?? tweak);
  let recipes: string[] = [];
  let paletteBlock: string | undefined;
  if (!isTweak && spec) {
    const [p, pal] = await Promise.all([plan(spec), pickPalette(spec)]);
    if (p.component) componentId = p.component;
    recipes = p.recipes;
    if (pal) paletteBlock = paletteText(pal);
  }

  // Templated path: if the plan selected a "nailed" pattern, the layout is CODED.
  // The model only produces a content spec (JSON); the server renders the exact,
  // proven HTML and resolves logos + composites renders. No layout drift, and
  // faster (Sonnet spec + parallel renders) than a full Opus build.
  const template = isTweak ? null : pickTemplate(recipes);
  if (template && spec) {
    try {
      const res = await anthropic.messages.create({
        model: SPEC_MODEL,
        max_tokens: 2000,
        system: template.instruction,
        messages: [{ role: "user", content: spec }],
      });
      const text = res.content.find((b) => b.type === "text");
      const raw = text && text.type === "text" ? text.text : "";
      const html = template.build(raw);
      if (html) {
        // Resolve font + logos, then drop any logo whose brand isn't in the
        // vector set (the brand wordmark already covers it) so a raw token never
        // reaches the user in this deterministic path; then composite renders.
        const withAssets = finalizeStaticHtml(html).replace(/\{\{logo:[^}]*\}\}/g, "");
        const finalHtml = await compositeImages(withAssets);
        return new Response(finalHtml, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      }
      // fall through to the free-build path if the spec failed to parse
    } catch {
      // fall through to the free-build path on any error
    }
  }

  const system = buildKnowledgeSystem(componentId, mode, recipes, paletteBlock);

  const userContent = isTweak
    ? `Here is the current component:\n\n${current}\n\nApply this change and return the full updated document:\n\n${tweak}`
    : spec!;

  const stream = toTextStream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "disabled" },
    system,
    messages: [{ role: "user", content: userContent }],
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
