# Anti-Slop

Hard constraints that override any tendency toward the generic. If a choice feels
safe, familiar, or like something produced a thousand times before, it is
probably slop — choose the considered thing instead. This is a floor, not a
style; it applies in every design language.

## ABSOLUTELY FORBIDDEN: a physical product drawn in CSS
A credit/payment/bank card, a phone or device, a wearable, a 3D shield/orb, or any
solid physical product, **built out of `<div>`s and gradients, is the #1 flat-fake
failure** — it always reads cheap and AI-made, no matter how carefully styled.
Every such object MUST be a real `{{image:...}}` render (see the assets principle).
If you catch yourself drawing a card body, a chip, a device frame, or a glossy
object with CSS gradients, STOP and emit an `{{image:wide|...}}` token instead.
A flat CSS rectangle standing in for a credit card is never acceptable — even a
small one inside a layout.

## ABSOLUTELY FORBIDDEN: the generic AI icon glyphs
Never, under any circumstances, draw or use any of these as an icon — they are
the instant tell of AI-generated slop, zero exceptions:
- a **sparkle / twinkle / 4-point star** (✨, a diamond made of curved points)
- a **lightning bolt / zap**
- a **magic wand**, **stars**, or any "AI / magic / generate" glyph
- a **lone glyph inside a rounded accent-colored (purple/indigo/gradient)
  square tile**, especially next to the heading as a fake "brand mark" or "hub".

Do NOT put a decorative icon tile beside the card's title at all. A card does not
need a logo lockup. If — and only if — a REAL brand belongs there, use
`{{logo:NAME}}`. Otherwise show no icon tile. When an element genuinely needs a
small icon (a list marker, a metric affordance), draw a specific, literal,
meaningful shape (an arrow, a checkmark, a real object) — never a generic
sparkle/bolt/star. If you catch yourself reaching for a sparkle, delete it.
- **Decorative status pills.** Floating pills like "5 apps connected · syncing",
  "● Live", "Channels connected", "AI-powered" that exist only as decoration are
  noise pretending to be product detail. Only show a status indicator if it
  reflects real, specific state the component is genuinely about.
- **The generic eyebrow-stack header.** A tiny tracked-uppercase label
  ("INTEGRATIONS", "FEATURES") sitting above a heading is the default AI-SaaS
  section pattern. Use an eyebrow only when it adds real information (a category
  the user needs), set it with restraint, and never as a reflex.
- **Hub-and-spoke orbit diagrams** with a generic center and satellites are
  overused. Prefer a real, specific scene (an actual UI fragment) over an
  abstract diagram unless the brief is literally about connections.

If a composition could belong to any AI startup, it's slop. Make it specific to
this product.

## Copy & emphasis tells (these read as broken, not designed)
- **Do not bold or recolor scattered key phrases inside body paragraphs.** The
  "bold a few near-black words inside muted gray body text" treatment is a
  vibe-coded tell and looks broken. Body copy is one consistent weight and color.
  Create emphasis through what you *say* and through real hierarchy (a headline, a
  stat, a labelled element) — not by bolding words mid-sentence.
- Do not put the accent color on a single word of the headline ("Just _ask the
  question_") — that two-tone-headline trick is an overused AI gimmick. Let the
  whole headline carry one weight/color.
- No "● Live" pulsing-dot eyebrows unless the thing is genuinely, literally live.

## Layout integrity (a clipped diorama looks broken)
- The diorama/visual must **fit and fill its frame.** Never let content overflow a
  fixed-height container and get cut off, and never leave a large dead empty zone
  inside a panel. If you build N fragments, size the stage to hold them, or build
  fewer, better fragments. Decide the scene's content and its frame together.
- Prefer intrinsic/auto height with padding over fixed pixel heights that can clip.

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
