import {
  MODEL,
  buildKnowledgeSystem,
  toTextStream,
  hasApiKey,
} from "@/lib/anthropic";
import { resolveComponent } from "@/lib/knowledge";

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
  const componentId = resolveComponent(body.component, prompt ?? tweak);
  const system = buildKnowledgeSystem(componentId, mode);

  const userContent = isTweak
    ? `Here is the current component:\n\n${current}\n\nApply this change and return the full updated document:\n\n${tweak}`
    : prompt!;

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
