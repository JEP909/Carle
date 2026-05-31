import { MODEL, buildKnowledgeSystem, toTextStream, hasApiKey } from "@/lib/anthropic";
import { resolveComponent } from "@/lib/knowledge";
import { judgeVisual } from "@/lib/visual-judge";
import { compositeImages, hasImageTokens } from "@/lib/imagegen";

export const runtime = "nodejs";
export const maxDuration = 300;

// Read a ReadableStream of UTF-8 chunks fully into a string. Used when an image
// card revision must be collected server-side so its rendered objects can be
// composited before we hand the finished card back.
async function collectStream(s: ReadableStream<Uint8Array>): Promise<string> {
  const reader = s.getReader();
  const dec = new TextDecoder();
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    out += dec.decode(value, { stream: true });
  }
  out += dec.decode();
  return out;
}

function reviseStream(html: string, componentId: string, failures: string[]) {
  const system = buildKnowledgeSystem(componentId, "tweak");
  const instruction = `A visual design critic looked at the RENDERED card and
found these specific problems. Fix ALL of them while keeping everything that
works, and return the complete updated HTML document:

${failures.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Push toward reference-grade quality: real depth, dense believable product scene,
tasteful richness executed cleanly, restrained palette + one accent.`;

  return toTextStream({
    model: MODEL,
    max_tokens: 32000,
    thinking: { type: "disabled" },
    system,
    messages: [
      { role: "user", content: `Here is the current component:\n\n${html}\n\n${instruction}` },
    ],
  });
}

// The VISUAL quality gate. Render the card, let a vision model judge it against
// the rubric, and — if it falls short — stream a revised version that fixes the
// specific VISUAL failures it saw. Cards that use real rendered objects
// ({{image:...}}) get those assets composited in first, so the judge scores the
// finished card and the user receives it with the renders baked in.
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

  // ---- Image-card path: composite real renders, then judge the finished card.
  if (hasImageTokens(rawHtml)) {
    const composited = await compositeImages(rawHtml);
    const verdict = await judgeVisual(composited, componentId);

    if (verdict.pass || verdict.failures.length === 0) {
      return new Response(composited, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Visual-Score": String(verdict.score),
        },
      });
    }

    // Revise, then re-composite the revision's rendered objects.
    const revised = await collectStream(reviseStream(html, componentId, verdict.failures));
    const finalHtml = await compositeImages(revised);
    return new Response(finalHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Visual-Score": String(verdict.score),
        "X-Visual-Failures": encodeURIComponent(JSON.stringify(verdict.failures)),
      },
    });
  }

  // ---- Plain-card path: unchanged. JSON on pass, streamed revision on fail.
  const verdict = await judgeVisual(rawHtml, componentId);
  if (verdict.pass || verdict.failures.length === 0) {
    return Response.json({ pass: true, score: verdict.score, note: verdict.note });
  }

  const stream = reviseStream(html, componentId, verdict.failures);
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
