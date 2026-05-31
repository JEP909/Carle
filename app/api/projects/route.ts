import { saveProject, listProjects, getProject } from "@/lib/project";

export const runtime = "nodejs";

// GET            -> list saved projects
// GET ?id=<id>   -> one full project (brand + samples) — reopen the trained agent
// POST {brand, samples} -> persist (or update) a project
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (id) {
    const project = getProject(id);
    if (!project) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json(project, { headers: { "Cache-Control": "no-store" } });
  }
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
