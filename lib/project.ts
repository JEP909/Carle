import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { BrandProfile } from "./brand";

// A "project" = a confirmed brand profile + the blessed sample sections. This is
// the persisted, personalized agent: its brand profile becomes standing context
// for every future generation, and the samples are its few-shot corpus.
//
// MVP persistence: flat files under .projects/ (gitignored — user data). Mirrors
// lib/vibes.ts. Swap for Supabase later without changing callers.

const ROOT = process.cwd();
const DIR = join(ROOT, ".projects");

export type ProjectSample = { id: string; label: string; html: string };
export type ProjectMeta = { id: string; name: string; createdAt: string };

function ensureDir(p: string) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}
function safeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "");
}

export function saveProject(brand: BrandProfile, samples: ProjectSample[]): ProjectMeta {
  const id = safeId(brand.id) || `proj_${Date.now().toString(36)}`;
  const dir = join(DIR, id);
  ensureDir(join(dir, "samples"));
  writeFileSync(join(dir, "profile.json"), JSON.stringify(brand, null, 2));
  for (const s of samples) {
    const sid = safeId(s.id);
    writeFileSync(join(dir, "samples", `${sid}.html`), s.html);
    writeFileSync(join(dir, "samples", `${sid}.json`), JSON.stringify({ id: s.id, label: s.label }, null, 2));
  }
  return { id, name: brand.name, createdAt: brand.createdAt };
}

export function listProjects(): ProjectMeta[] {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR)
    .filter((d) => existsSync(join(DIR, d, "profile.json")))
    .map((d) => {
      const b = JSON.parse(readFileSync(join(DIR, d, "profile.json"), "utf8")) as BrandProfile;
      return { id: d, name: b.name, createdAt: b.createdAt };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getProject(id: string): { brand: BrandProfile; samples: ProjectSample[] } | null {
  const dir = join(DIR, safeId(id));
  const profile = join(dir, "profile.json");
  if (!existsSync(profile)) return null;
  const brand = JSON.parse(readFileSync(profile, "utf8")) as BrandProfile;
  const sdir = join(dir, "samples");
  const samples: ProjectSample[] = existsSync(sdir)
    ? readdirSync(sdir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => {
          const meta = JSON.parse(readFileSync(join(sdir, f), "utf8")) as { id: string; label: string };
          const html = readFileSync(join(sdir, `${safeId(meta.id)}.html`), "utf8");
          return { id: meta.id, label: meta.label, html };
        })
    : [];
  return { brand, samples };
}
