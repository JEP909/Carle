# Craft Primitives

The reusable construction techniques that make premium product UI (Stripe, Stan,
Chexy, Chatbase, Vercel, Linear) read as studio-grade rather than AI-generated.
These apply across every component — compose them; tune to the brief. They are
techniques to reason with, not snippets to paste.

## Floating panel
The atom of premium product dioramas: a rounded rectangle that appears to hover
above the surface.
- Radius 12–18px. Surface white on light themes, a raised dark (`#16171f`-ish) on
  dark themes.
- Layered shadow, never a single flat one. Light theme example:
  `0 1px 2px rgba(16,24,40,.06), 0 12px 28px -12px rgba(16,24,40,.18)`.
  Optionally a 1px hairline border (`rgba(16,24,40,.08)`) and an inner top
  highlight (`inset 0 1px 0 rgba(255,255,255,.6)` light / `…,.06` dark).
- Overlap 2–4 panels with small offsets to imply depth (a stack, a layered scene).

## Ambient wash / glow
Color as light behind a focal object — the signature of all the references.
- A soft radial or linear gradient in the accent hue(s), low opacity, bleeding
  from one edge/corner. Examples: a teal→violet glow at the top of a panel
  (Stripe), a saturated per-card field in indigo (Chexy) or grainy red/gold/gray
  (Stan).
- It reads as atmosphere, not a fill. Keep most of the card calm; the wash is a
  highlight. Optionally add faint film grain (a tiled noise data-URI at ~4–8%
  opacity) for the Stan-style texture.
- On dark surfaces, luminous glints via `mix-blend-mode: screen`.

## Status pill / badge
- Small rounded-full chip, tinted background + matching darker text.
  Success: bg `#e7f7ee`, text `#1a7f4b`. Info: bg `#e8eefc`, text `#2350c8`.
  Neutral: bg `#f1f2f4`, text `#5a6072`. Warning/active per hue.
- Used for states ("Dispute won", "Open", "Most popular"), deltas ("+643%"),
  and labels. Keep text tiny, medium weight, ~0.02em tracking.

## Dark button with gradient underglow
A recurring hero control (Chatbase "Create agent", Stan "Save").
- Solid near-black (`#0a0a0a`) pill or squircle, white label, weight 600.
- The premium touch: a soft multi-color gradient *underglow* beneath it — a
  blurred gradient bar (coral→pink→amber, or the brand spectrum) offset a few px
  below, as if the button is lit from below. Subtle, not neon.

## Brand/logo tiles + connectors
For integrations/routing scenes (Chatbase).
- Small rounded-square tiles (radius ~12px), white with a soft shadow, holding a
  real glyph/logo. Arrange in a grid or orbit.
- Connect with **dotted/dashed SVG paths** (1.5px, low-opacity ink) routing
  between a hub tile and the satellites. Curved paths feel more crafted than
  straight.

## Phone frame
For mobile/checkout features (Stripe Link).
- Rounded ~38–44px outer radius, thin (~10px) bezel, a notch or pill camera.
- A status bar inside (time "9:41", signal, wifi, battery), then a real app
  screen: app title, content, a primary CTA. Two overlapping phones imply a flow.

## Mini chart / sparkline
For stat and analytics scenes (Stripe fraud chart, Stan live-visitors).
- Hand-draw in inline SVG. A bar series (rounded tops) or a line/area with a
  smooth path; optionally a second overlaid line for a trend.
- Label one point (a peak) with a small tag/tooltip and a dot. Light gridlines or
  baseline only — no chart-junk. Accent-colored series; muted axis labels.
- Animate the line drawing in or bars rising on reveal (optional, eased).

## Big number hero
For stats and metric-led cards (Chexy "7,000", Stripe "$1,025").
- Very large, tight, weight 600–700, optically aligned. Units/cadence set much
  smaller and muted beside it. Tabular figures. May take an accent or gradient
  text-fill on dark.

## Composition note
A great card usually combines a few of these (e.g. floating panels + a wash + a
status pill + a mini chart) into ONE scene with a clear focal element, then
anchors quiet copy beneath. Reason about which primitives prove THIS feature;
don't include all of them.
