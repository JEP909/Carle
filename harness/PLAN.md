# Carle Harness Plan — Visual Quality Loop

## The vision (user's words)
Type plain English ("a website for an AI agent real estate SaaS company") →
get cards that look like the references → "Is this good?" → Confirm →
trains an agent on it → build the entire website with that context.

## Core diagnosis
The system has no VISION. It generates from prose + my hand-built anchors, and
the quality gate only greps HTML for banned strings — it has never *seen* a
rendered card or a reference. The thing that made quality jump in this project
was always: render → look at pixels → compare to target → fix. That capability
is missing from the machine. We add it.

Also: references are OUR build-time asset, never the user's runtime burden. The
user only types English. We bake the reference taste into the harness.

Decisions locked with user:
- Encourage RICH execution (Chatbase-grade: underglow, constellations, sparkles,
  dimensional objects) — the earlier blanket bans were the mistake.
- Rubric defined as 4 buckets per archetype: must-have / must-avoid /
  should-match / should-not-match.
- Feature-card rubric approved (see below).

## Build steps
1. Rubric module (lib/rubric.ts): structured params per archetype. Start with
   the approved feature-card rubric.
2. Reference standard baked in: the rubric's "should-match" encodes the
   reference taste in words; (optional later) store reference images for the
   judge to compare against.
3. Render step: reuse the Playwright screenshot pipeline to turn generated HTML
   into a PNG.
4. VISUAL judge (lib/visual-judge.ts): a vision model looks at the rendered PNG
   against the rubric and returns specific visual failures + a pass/fail.
5. Revise loop: feed the visual failures back to the model; regenerate; re-judge;
   up to N rounds. Replaces/absorbs the text-only slop-gate.
6. Prove it: generate a feature card end-to-end through the visual loop and
   show the user. Tune the rubric against real output.

## Approved: Feature Card rubric
MUST HAVE: a product diorama (not a single icon); one clear focal object; dense
real micro-content (no lorem); real brand logos via tokens; copy anchored below
(tight headline + 2-line support).
MUST AVOID: flat single-icon-above-text; dead empty zones; lorem/filler;
hand-drawn brand glyphs.
SHOULD MATCH: real depth (layered shadows, floating panels); tasteful richness
when it fits (gradient sheen, underglow, constellations — Chatbase bar); Geist
type, restrained palette + one accent; fragment vocab (tiles, pills, toggles,
charts, chat bubbles).
SHOULD NOT MATCH: generic AI-startup look; cream/serif editorial default; thin
flat CSS gestures; rainbow candy pills.

## Not now (later stages of the product roadmap)
- Other archetype rubrics (pricing/hero/stat) — tune after seeing feature output.
- Train-agent-on-blessed-cards (Stage 2) and site assembly (Stage 3).
- The polished app UI.
