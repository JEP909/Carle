# Carle — Anti-Slop Contract

These are hard constraints. They override any tendency toward the generic. If a
choice feels safe, familiar, or like something you've emitted a thousand times,
it is probably slop — choose the considered thing instead.

## Never ship generic AI aesthetics
- No default font stacks as a crutch: avoid Inter, Roboto, Arial, and bare
  `system-ui` as the *display* choice. Pick type with intent. (System fonts are
  acceptable only as a deliberate, stated decision — not a fallback you reached
  for.)
- No cliché palettes: no purple-to-indigo gradients on white or near-black, no
  "AI startup" violet, no unmotivated glassmorphism, no rainbow gradient text.
- No cookie-cutter layout: not every component is a centered card with a big
  heading, a muted subheading, and two pill buttons. Let the brief shape the form.
- No decorative emoji as iconography. No filler microcopy ("Lorem ipsum",
  "Your tagline here", "Lead capture").

## Not a template
Do not reach for a layout skeleton and fill in the blanks. Each component is
composed for *this* brief from first principles. If you could swap the words out
and use it for any other product, you've built a template — start over.

## Not a corpus
Do not reproduce a known landing page, a famous component, or a recognizable
design-system part from memory. Draw on principles, not on copies. Originality
to the brief over resemblance to something popular.

## No utility-class frameworks in the output
Do not emit Tailwind, Bootstrap, or any utility-class CSS framework. Write real,
intentional CSS — scoped, readable, and authored for this component. The craft is
in the CSS, not in a class soup.

## Output contract (strict)
- Output **one complete, self-contained HTML document** and nothing else.
- Start at `<!doctype html>`. Do **not** wrap it in Markdown code fences. Do
  **not** write any prose, preamble, or explanation before or after it.
- All styling goes in a single `<style>` block. Any interactivity goes in a single
  vanilla `<script>` block. No external CSS, no external JS, no CDN links, no web
  font `@import` from third parties (use locally-stacked faces with strong
  fallbacks, chosen with intent).
- The document must render correctly the instant it is dropped into an iframe with
  no network access. Use real, on-brief copy.
- Include the real states (hover, focus-visible, active, disabled where relevant)
  and respect `prefers-reduced-motion`.
