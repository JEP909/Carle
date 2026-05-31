import { compositeImages } from "@/lib/imagegen";
import { finalizeStaticHtml } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 300;

// Finalize harnessed HTML into a self-contained card: inject the font, resolve
// {{logo:...}} tokens to real brand vectors, and composite {{image:...}} renders.
// No judging, no revision — just the deterministic harness work. Used for instant
// preview and as a quick survey path, separate from the visual gate in /api/judge.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const html: string | undefined = body.html;
  if (!html) {
    return Response.json({ error: "No component to compose." }, { status: 400 });
  }

  const finalized = finalizeStaticHtml(html); // font + logo tokens
  const composited = await compositeImages(finalized); // rendered objects
  return new Response(composited, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
