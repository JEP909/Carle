import { hasApiKey } from "@/lib/anthropic";
import { resolveComponent } from "@/lib/knowledge";
import { judgeVisual } from "@/lib/visual-judge";
import { compositeImages, hasImageTokens } from "@/lib/imagegen";

export const runtime = "nodejs";
export const maxDuration = 300;

// The VISUAL quality gate — now ADVISORY, not auto-revising. It composites any
// rendered objects (so image cards become final) and scores the card on pixels,
// then returns the finished HTML plus the score. It does NOT trigger a second
// full Opus rebuild: that auto-revision silently doubled every generation's
// latency (and, for templated/known-good cards, replaced a good layout with a
// freshly-improvised one). Polishing is now an explicit, opt-in action.
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

  const componentId = resolveComponent(body.component, brief ?? null) ?? "feature";

  // Composite any rendered objects so image cards come back final (cheap — the
  // renders were already prefetched during the build stream). No-op otherwise.
  const finalHtml = hasImageTokens(rawHtml) ? await compositeImages(rawHtml) : rawHtml;

  const verdict = await judgeVisual(finalHtml, componentId);

  // Always return the finished HTML + the score. The client shows it as-is.
  return new Response(finalHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Visual-Score": String(verdict.score),
      "X-Visual-Pass": verdict.pass ? "1" : "0",
      "X-Visual-Failures": encodeURIComponent(JSON.stringify(verdict.failures)),
    },
  });
}
