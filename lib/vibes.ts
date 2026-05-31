import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// The "blessed" store — cards the user loved. This is the taste corpus the agent
// will later be trained on: describe -> generate -> bless the good ones, and the
// blessed set becomes the design-language the agent builds the whole site from.
//
// MVP persistence: flat files under .vibes/ (gitignored — this is user data, not
// repo content). Each blessed card is an .html file + a sidecar .json with the
// brief and metadata. Swap for a DB later without changing callers.

const ROOT = process.cwd();
const DIR = join(ROOT, ".vibes");

export type Vibe = {
  id: string;
  brief: string; // the brief that produced it (what the user asked for)
  createdAt: string;
  note?: string; // optional: why the user liked it / what to emphasize
};

function ensureDir() {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
}

function safeId(id: string): string {
  // ids are generated server-side; still guard against path traversal.
  return id.replace(/[^a-zA-Z0-9_-]/g, "");
}

export function blessCard(input: {
  html: string;
  brief: string;
  note?: string;
}): Vibe {
  ensureDir();
  const id = `vibe_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const meta: Vibe = {
    id,
    brief: input.brief,
    createdAt: new Date().toISOString(),
    note: input.note,
  };
  writeFileSync(join(DIR, `${id}.html`), input.html);
  writeFileSync(join(DIR, `${id}.json`), JSON.stringify(meta, null, 2));
  return meta;
}

export function listVibes(): Vibe[] {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(DIR, f), "utf8")) as Vibe)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getVibeHtml(id: string): string | null {
  const file = join(DIR, `${safeId(id)}.html`);
  return existsSync(file) ? readFileSync(file, "utf8") : null;
}

export function removeVibe(id: string): boolean {
  const s = safeId(id);
  let removed = false;
  for (const ext of ["html", "json"]) {
    const file = join(DIR, `${s}.${ext}`);
    if (existsSync(file)) {
      rmSync(file);
      removed = true;
    }
  }
  return removed;
}

// The blessed corpus as the agent will consume it: brief + html for each.
export function blessedCorpus(): Array<{ brief: string; html: string }> {
  return listVibes()
    .map((v) => {
      const html = getVibeHtml(v.id);
      return html ? { brief: v.brief, html } : null;
    })
    .filter((x): x is { brief: string; html: string } => x !== null);
}
