import { compositeImages, hasImageTokens } from "@/lib/imagegen";

export const runtime = "nodejs";
export const maxDuration = 300;

// Composite-only: swap every {{image:...}} placeholder for its real rendered
// asset and return the finished HTML. No judging, no revision — just the
// rendered objects baked in. Used for instant preview of a draft (and as a
// quick survey path), separate from the visual quality gate in /api/judge.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const html: string | undefined = body.html;
  if (!html) {
    return Response.json({ error: "No component to compose." }, { status: 400 });
  }

  if (!hasImageTokens(html)) {
    // Nothing to do — hand it straight back.
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const composited = await compositeImages(html);
  return new Response(composited, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
