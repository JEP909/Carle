#!/usr/bin/env node
// Carle tuning harness.
//
// The loop: edit the MD files (languages/*.md, lib/structures.ts, prompts/*.md)
// -> `node harness/run.mjs [filter]` -> open harness/out/index.html. You see
// every generated card next to its brief and (if pinned) its gold-standard
// target, so you can judge the effect of a prompt change across the whole suite
// at once. That is how we tune the agent toward "genuinely good" without
// templates.
//
// Usage:
//   node harness/run.mjs              regenerate every case, rebuild contact sheet
//   node harness/run.mjs aurora       only cases whose id includes "aurora"
//   node harness/run.mjs --sheet      rebuild the contact sheet only (no API calls)
//
// Requires the dev server running on :3000 (it owns the API key) and playwright.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "harness", "out");
const GOLD = join(ROOT, "harness", "gold");
const BASE = process.env.CARLE_URL || "http://localhost:3000";

const arg = process.argv[2] || "";
const sheetOnly = arg === "--sheet";
const filter = sheetOnly ? "" : arg;

const suite = JSON.parse(readFileSync(join(ROOT, "harness", "suite.json"), "utf8"));
const cases = suite.cases.filter((c) => !filter || c.id.includes(filter));

mkdirSync(OUT, { recursive: true });
mkdirSync(GOLD, { recursive: true });

function cleanDoc(raw) {
  const i = raw.toLowerCase().indexOf("<!doctype");
  return i >= 0 ? raw.slice(i) : raw;
}

async function generate(c) {
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Knowledge path: send the brief; the agent infers the component and
    // reasons from the knowledge files. (language/structure/component optional.)
    body: JSON.stringify({
      prompt: c.brief,
      ...(c.component ? { component: c.component } : {}),
      ...(c.language ? { language: c.language } : {}),
      ...(c.structure ? { structure: c.structure } : {}),
    }),
  });
  if (!res.ok && !res.body) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || `HTTP ${res.status}`);
  }
  const text = await res.text();
  const html = cleanDoc(text);
  writeFileSync(join(OUT, `${c.id}.html`), html);
  return html;
}

async function shoot(browser, c) {
  const page = await browser.newPage({
    viewport: { width: 760, height: 760 },
    deviceScaleFactor: 2,
  });
  await page.goto("file://" + join(OUT, `${c.id}.html`), { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, `${c.id}.png`) });
  await page.close();
}

function buildSheet() {
  const rows = suite.cases
    .map((c) => {
      const gen = existsSync(join(OUT, `${c.id}.png`))
        ? `out/${c.id}.png`.replace("out/", "")
        : null;
      const goldRel = `../gold/${c.id}.png`;
      const hasGold = existsSync(join(GOLD, `${c.id}.png`));
      return `
      <section class="case">
        <div class="meta">
          <h2>${c.id}</h2>
          <p class="tags"><span>${c.language}</span> × <span>${c.structure}</span></p>
          <p class="brief">${c.brief}</p>
          ${c.note ? `<p class="note">${c.note}</p>` : ""}
        </div>
        <div class="pair">
          <figure>
            <figcaption>Generated</figcaption>
            ${gen ? `<img src="${c.id}.png" alt="generated ${c.id}">` : `<div class="empty">not generated yet</div>`}
          </figure>
          <figure>
            <figcaption>Gold standard${hasGold ? "" : ` (drop ${c.id}.png in harness/gold/)`}</figcaption>
            ${hasGold ? `<img src="${goldRel}" alt="gold ${c.id}">` : `<div class="empty">no target pinned</div>`}
          </figure>
        </div>
      </section>`;
    })
    .join("\n");

  const html = `<!doctype html><html><head><meta charset="utf-8">
<title>Carle tuning harness</title>
<style>
  body{margin:0;background:#0c0d14;color:#e9eaf2;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;padding:32px}
  h1{font-size:22px;letter-spacing:-.02em;margin:0 0 4px}
  .sub{color:#8b90a8;margin:0 0 28px;font-size:13px}
  .case{display:grid;grid-template-columns:320px 1fr;gap:24px;padding:24px 0;border-top:1px solid #1c1e2c}
  .meta h2{font:600 15px ui-monospace,Menlo,monospace;margin:0 0 8px;color:#c9b6ff}
  .tags{color:#8b90a8;font-size:12px;margin:0 0 10px}
  .tags span{color:#e9eaf2}
  .brief{color:#b9bccd;font-size:13px;margin:0 0 8px}
  .note{color:#7d8296;font-size:12px;font-style:italic;margin:0}
  .pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  figure{margin:0}
  figcaption{font:600 11px ui-monospace,monospace;text-transform:uppercase;letter-spacing:.08em;color:#8b90a8;margin-bottom:8px}
  img{width:100%;border-radius:12px;border:1px solid #1c1e2c;display:block}
  .empty{aspect-ratio:1;border:1px dashed #2a2d40;border-radius:12px;display:grid;place-items:center;color:#5a5e74;font-size:12px}
</style></head><body>
  <h1>Carle tuning harness</h1>
  <p class="sub">Edit the MD files, run <code>node harness/run.mjs</code>, refresh. Generated (left) vs gold-standard target (right).</p>
  ${rows}
</body></html>`;
  writeFileSync(join(OUT, "index.html"), html);
}

async function main() {
  if (!sheetOnly) {
    console.log(`Generating ${cases.length} case(s) against ${BASE} …`);
    for (const c of cases) {
      process.stdout.write(`  ${c.id} … `);
      try {
        await generate(c);
        console.log("ok");
      } catch (e) {
        console.log("FAILED: " + e.message);
      }
    }
    const browser = await chromium.launch();
    for (const c of cases) {
      if (existsSync(join(OUT, `${c.id}.html`))) await shoot(browser, c);
    }
    await browser.close();
  }
  buildSheet();
  console.log(`\nContact sheet: harness/out/index.html`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
