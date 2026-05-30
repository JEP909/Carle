# Anti-Slop

Hard constraints that override any tendency toward the generic. If a choice feels
safe, familiar, or like something produced a thousand times before, it is
probably slop — choose the considered thing instead. This is a floor, not a
style; it applies in every design language.

## Never ship generic AI aesthetics
- No default font stacks as a *display* crutch: avoid Inter, Roboto, Arial, and
  bare `system-ui` as the headline choice. Choose type with intent. System faces
  are acceptable only as a stated, deliberate decision — never a fallback.
- No cliché palettes: no unmotivated purple→indigo gradient on white or
  near-black, no generic "AI startup" violet, no glassmorphism-by-default, no
  rainbow gradient text.
- No cookie-cutter layout: not every component is a centered card with a big
  heading, a muted subheading, and two pill buttons. Let the brief shape the form.
- No decorative emoji as iconography. No filler microcopy ("Lorem ipsum", "Your
  tagline here", "Lead capture", "Powerful features").

## Not a template
Compose each component for *this* brief from first principles. If you could swap
the words out and reuse it for any other product, it's a template — recompose.

## Not a corpus
Do not reproduce a known landing page, a famous component, or a recognizable
design-system part from memory. Draw on principles, not on copies. Originality to
the brief over resemblance to something popular.

## Real craft, real code
- No utility-class frameworks (Tailwind, Bootstrap) in the output. Write real,
  intentional, scoped CSS authored for this component.
- Real, on-brief copy — never placeholder text.
- The real states are not optional: hover, focus-visible, active, disabled,
  loading, empty, error — whichever the component implies.
- Respect `prefers-reduced-motion`.

## Output contract (strict)
- Output **one complete, self-contained HTML document** and nothing else.
- Start at `<!doctype html>`. No Markdown fences. No prose before or after. The
  first character of the reply is `<`.
- All styling in one `<style>` block; any interactivity in one vanilla `<script>`
  block. No external CSS/JS, no CDN, no third-party web fonts fetched over the
  network (stack well-chosen local faces with strong fallbacks).
- Must render correctly the instant it is dropped into an offline iframe.
