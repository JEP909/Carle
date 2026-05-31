import { blessCard, listVibes, removeVibe } from "@/lib/vibes";

export const runtime = "nodejs";

// GET  -> list blessed cards (metadata)
// POST { html, brief, note? } -> bless a card (save it to the taste corpus)
// DELETE { id } -> unbless
export async function GET() {
  return Response.json({ vibes: listVibes() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const html: string | undefined = body.html;
  const brief: string | undefined = body.brief;
  if (!html) {
    return Response.json({ error: "Nothing to save." }, { status: 400 });
  }
  const vibe = blessCard({ html, brief: brief ?? "", note: body.note });
  return Response.json({ vibe });
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id: string | undefined = body.id;
  if (!id) return Response.json({ error: "No id." }, { status: 400 });
  return Response.json({ removed: removeVibe(id) });
}
