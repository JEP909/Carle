import { saveProject, listProjects } from "@/lib/project";

export const runtime = "nodejs";

// GET  -> list saved projects
// POST {brand, samples} -> persist a confirmed project
export async function GET() {
  return Response.json({ projects: listProjects() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.brand || !Array.isArray(body.samples)) {
    return Response.json({ error: "Need a brand and samples." }, { status: 400 });
  }
  const meta = saveProject(body.brand, body.samples);
  return Response.json(meta, { headers: { "Cache-Control": "no-store" } });
}
