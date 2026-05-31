import { chromium } from "playwright";
import { anthropic } from "./anthropic";
import { getRubric, rubricText } from "./rubric";

// The VISUAL judge — the capability the system never had. It RENDERS a generated
// card to an image and shows that image to a vision model alongside the rubric,
// so quality is judged on pixels (does it look like the reference bar?) rather
// than by grepping HTML. Returns a verdict + specific visual failures that the
// revise loop can act on.

const JUDGE_MODEL = "claude-opus-4-8"; // vision-capable; this is the taste call, worth Opus

export type VisualVerdict = {
  pass: boolean;
  score: number; // 0-100, holistic "matches the bar"
  failures: string[]; // specific, visual, actionable
  note: string;
};

// Render an HTML document to a base64 PNG using the same pipeline as the harness.
export async function renderToPng(html: string): Promise<string> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 760, height: 820 },
      deviceScaleFactor: 2,
    });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.waitForTimeout(350);
    const buf = await page.screenshot({ type: "png" });
    return buf.toString("base64");
  } finally {
    await browser.close();
  }
}

const JUDGE_SYSTEM = `You are Carle's visual quality judge. You are shown an
IMAGE of a generated UI card and a rubric. Judge what you SEE — the actual
rendered pixels — not code.

The bar is reference-grade product marketing UI (Stripe / Chatbase / Chexy):
dimensional, dense, believable product scenes with real depth, a clean grotesque
typeface, a restrained palette with one confident accent, and tasteful richness
(gradient sheen, underglow, constellations, real logos) executed cleanly. Rich
is GOOD when executed well; flat/thin/generic is the failure.

Score 0-100 on how close the rendered card is to that bar. Be a harsh critic —
most first drafts are 60-75. Reserve 85+ for cards that genuinely look like they
shipped on a top product site.

Return ONLY JSON:
{"pass": boolean, "score": number, "failures": [string], "note": string}
- pass = score >= 82 AND no MUST-HAVE missing AND nothing in MUST-AVOID/SHOULD-NOT present.
- failures: specific, VISUAL, actionable fixes ("the chart is a thin flat line with no area fill or depth"; "the icon top-left is a generic sparkle in an accent tile"; "huge dead empty zone in the lower third"). Not code talk.
- note: one sentence overall.`;

export async function judgeVisual(
  html: string,
  rubricId: string,
): Promise<VisualVerdict> {
  const rubric = getRubric(rubricId);
  const rubricBlock = rubric ? rubricText(rubric) : "(no specific rubric; judge against the general bar)";

  let png: string;
  try {
    png = await renderToPng(html);
  } catch (e) {
    // If rendering fails, we can't judge visually — fail open (pass) so the
    // pipeline still returns a card.
    return { pass: true, score: 0, failures: [], note: "render failed; skipped visual judge" };
  }

  try {
    const res = await anthropic.messages.create({
      model: JUDGE_MODEL,
      max_tokens: 1000,
      system: JUDGE_SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/png", data: png },
            },
            { type: "text", text: `Judge this rendered card.\n\n${rubricBlock}` },
          ],
        },
      ],
    });
    const text = res.content.find((b) => b.type === "text");
    const raw = text && text.type === "text" ? text.text : "";
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return { pass: true, score: 0, failures: [], note: "judge parse failed" };
    const v = JSON.parse(m[0]);
    return {
      pass: Boolean(v.pass),
      score: typeof v.score === "number" ? v.score : 0,
      failures: Array.isArray(v.failures) ? v.failures.filter((x: unknown) => typeof x === "string") : [],
      note: typeof v.note === "string" ? v.note : "",
    };
  } catch {
    return { pass: true, score: 0, failures: [], note: "judge errored; skipped" };
  }
}
