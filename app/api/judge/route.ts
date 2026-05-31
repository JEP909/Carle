import { MODEL, buildKnowledgeSystem, toTextStream, hasApiKey } from "@/lib/anthropic";
import { resolveComponent } from "@/lib/knowledge";
import { judgeVisual } from "@/lib/visual-judge";

export const runtime = "nodejs";
export const maxDuration = 300;

// The VISUAL quality gate. Render the card, let a vision model judge it against
// the rubric, and — if it falls short — stream a revised version that fixes the
// specific VISUAL failures it saw. This is the eyes the text-only slop-gate
// lacked. Returns JSON {pass:true, score} if the card already meets the bar.
export async function POST(req: Request) {
  if (!hasApiKey()) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not set in this environment." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const rawHtml: string | undefined = body.html;
  const brief: string | undefined = body.prompt;
  if (!rawHtml) {
    return Response.json({ error: "No component to judge." }, { status: 400 });
  }

  // Strip the injected font block before re-sending to the model (it would blow
  // max_tokens); the stream re-injects it.
  const html = rawHtml.replace(/<style id="carle-font">[\s\S]*?<\/style>\s*/i, "");

  const componentId = resolveComponent(body.component, brief ?? null) ?? "feature";
  const verdict = await judgeVisual(rawHtml, componentId);

  if (verdict.pass || verdict.failures.length === 0) {
    return Response.json({ pass: true, score: verdict.score, note: verdict.note });
  }

  // Revise: fix the specific visual failures the judge saw.
  const system = buildKnowledgeSystem(componentId, "tweak");
  const instruction = `A visual design critic looked at the RENDERED card and
found these specific problems. Fix ALL of them while keeping everything that
works, and return the complete updated HTML document:

${verdict.failures.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Push toward reference-grade quality: real depth, dense believable product scene,
tasteful richness executed cleanly, restrained palette + one accent.`;

  const stream = toTextStream({
    model: MODEL,
    max_tokens: 32000,
    thinking: { type: "disabled" },
    system,
    messages: [
      { role: "user", content: `Here is the current component:\n\n${html}\n\n${instruction}` },
    ],
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      "X-Visual-Score": String(verdict.score),
      "X-Visual-Failures": encodeURIComponent(JSON.stringify(verdict.failures)),
    },
  });
}
