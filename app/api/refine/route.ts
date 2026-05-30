import { MODEL, buildKnowledgeSystem, toTextStream, hasApiKey } from "@/lib/anthropic";
import { resolveComponent } from "@/lib/knowledge";
import { criticReview } from "@/lib/slop-critic";
import { slopFindingsToInstruction } from "@/lib/slop-check";

export const runtime = "nodejs";
export const maxDuration = 300;

// The self-enforcing quality gate. The client sends a freshly-generated card;
// we run the slop check (free regex scan + Sonnet critic). If it's clean, we say
// so. If it has tells, we stream back a corrected version — the model revises
// ONLY the flagged problems, holding everything else.
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
    return Response.json({ error: "No component to check." }, { status: 400 });
  }

  // Strip the server-injected font block before sending back to the model — it's
  // ~90KB of base64 the model shouldn't re-emit (it would blow max_tokens and
  // truncate). The revise stream re-injects the font on the way out.
  const html = rawHtml.replace(/<style id="carle-font">[\s\S]*?<\/style>\s*/i, "");

  const review = await criticReview(html);

  if (review.clean) {
    return Response.json({ clean: true, findings: [] });
  }

  // Revise: one corrective pass fixing only the findings. Reuse the tweak system
  // so the model holds the design quality and applies a targeted change.
  const componentId = resolveComponent(body.component, brief ?? null);
  const system = buildKnowledgeSystem(componentId, "tweak");
  const instruction = slopFindingsToInstruction(review.findings);

  const stream = toTextStream({
    model: MODEL,
    max_tokens: 32000,
    thinking: { type: "disabled" },
    system,
    messages: [
      {
        role: "user",
        content: `Here is the current component:\n\n${html}\n\n${instruction}`,
      },
    ],
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      // Surface the findings so the client/harness can log what was fixed.
      "X-Slop-Findings": encodeURIComponent(JSON.stringify(review.findings)),
    },
  });
}
