import { MODEL, systemFor, toTextStream, hasApiKey } from "@/lib/anthropic";
import { getArchetype } from "@/lib/archetypes";

export const runtime = "nodejs";
export const maxDuration = 300;

// POST { prompt }                      -> fresh component
// POST { current, tweak }              -> tweak an existing component
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

  const arche = getArchetype(body.archetype);
  const system = systemFor(isTweak ? "tweak" : "generate", arche);
  const userContent = isTweak
    ? `Here is the current component:\n\n${current}\n\nApply this change and return the full updated document:\n\n${tweak}`
    : prompt!;

  const stream = toTextStream({
    model: MODEL,
    max_tokens: 16000,
    // Thinking off for the fastest possible time-to-first-token — the output
    // contract keeps the reply to pure HTML. (Tweak it to {type:"adaptive"} if
    // you want the model to deliberate more on hard briefs.)
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
