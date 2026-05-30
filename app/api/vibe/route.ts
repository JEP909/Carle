import { MODEL, VIBE_SYSTEM, toTextStream, hasApiKey } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 300;

// POST { component } -> stream the extracted vibe.md ("train the agent")
export async function POST(req: Request) {
  if (!hasApiKey()) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not set in this environment." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const component: string | undefined = body.component;
  if (!component) {
    return Response.json({ error: "No component to train on." }, { status: 400 });
  }

  const stream = toTextStream({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: VIBE_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Here is the locked component. Extract its vibe.md.\n\n${component}`,
      },
    ],
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
