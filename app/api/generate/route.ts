import {
  MODEL,
  systemFor,
  composeSystem,
  toTextStream,
  hasApiKey,
} from "@/lib/anthropic";
import { getArchetype } from "@/lib/archetypes";
import { getLanguage } from "@/lib/design-language";
import { getStructure } from "@/lib/structures";

export const runtime = "nodejs";
export const maxDuration = 300;

// Generation paths, in priority order:
//   language + structure  -> composeSystem (the "smarter than templates" core)
//   archetype             -> systemFor(arche)   (legacy single-archetype path)
//   neither               -> systemFor(null)    (free-form generic path)
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
  const lang = getLanguage(body.language);
  const structure = getStructure(body.structure);

  let system;
  if (lang && structure) {
    system = composeSystem(lang, structure, mode);
  } else {
    system = systemFor(mode, getArchetype(body.archetype));
  }

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
