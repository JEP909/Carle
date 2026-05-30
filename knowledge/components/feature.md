# Component: Feature card

Its job: make one product capability tangible and desirable. This is the most
common landing-page card — and the one most often botched into "icon + heading +
two lines." Great feature cards (Stripe, Stan, Chexy, Chatbase, Vercel) are NOT
built that way. Internalize how they actually work.

## The core principle: build a UI DIORAMA, not an icon
The defining move of a premium feature card is a **small, believable product
scene** occupying the top ~60–70% of the card, with quiet copy anchored beneath
it. The diorama SHOWS the feature working. This single decision is the
difference between "looks designed by a studio" and "looks AI-generated."

A diorama is a miniature, layered composition of **floating UI fragments** that
imply a real product:
- chat bubbles / message threads (a question, an AI reply, a status line)
- a faux editor or composer (a toolbar, an input with a cursor, action buttons)
- list/table rows with status pills ("Dispute won", "Open", "$231.00")
- a small chart or sparkline with a trend line and a labelled peak
- a scheduler (day-of-week chips, toggles, a Save button)
- toggle switches, segmented controls, badges, avatars
- a phone frame showing a real screen (status bar, app chrome, a CTA)
- orbiting tiles connected by dotted/dashed paths
- a stack of cards/objects with depth and a subtle ✓ on each

Compose 2–4 of these into one scene with real hierarchy — a clear focal fragment,
supporting fragments behind/around it, gentle overlap and depth. Make it specific
to THIS feature: a fraud feature shows a fraud chart; an escalation feature shows
a chat turning into a ticket; a scheduling feature shows a scheduler.

## How the diorama is rendered (craft primitives)
- **Floating panels**: white (or dark) rounded rectangles (radius 12–18px) with a
  soft, layered shadow (e.g. `0 1px 2px rgba(0,0,0,.06), 0 12px 28px -12px
  rgba(0,0,0,.18)`) and sometimes a 1px hairline border. They sit on the card
  surface or a wash, slightly overlapping to imply depth.
- **Ambient wash behind the scene**: a soft radial/linear glow in the card's
  accent hue bleeding from one edge or corner (Stripe's teal→violet top glow,
  Stan's per-card grainy red/gold wash, Chexy's indigo field). It reads as light,
  low opacity, never a flat fill over everything. Optionally add faint grain.
- **Real micro-content**: actual labels, amounts, names, timestamps, statuses —
  never lorem. Tiny but legible. Status pills use tinted backgrounds (green
  `#e7f7ee`/`#1a7f4b` text for success, etc.).
- **Brand/logo tiles**: small rounded-square tiles with a real glyph, connected by
  dotted SVG paths when showing integrations or routing.
- **Buttons inside the scene**: a solid dark (`#0a0a0a`) pill/squircle button is a
  recurring hero element; the premium touch is a soft multi-color gradient
  *underglow* beneath it (coral→pink→amber), as if lit from below.
- **Phone frames**: rounded ~40px radius, thin bezel, a status bar (9:41, signal,
  battery), then a real app screen inside. Used for checkout/mobile features.

## Copy block (anchored below the diorama)
- Optional small eyebrow/label in an accent tint, uppercase, wide tracking.
- A **tight grotesk headline**, ~22–30px, weight 600–700, near-black ink
  (`#0a0a0a`–`#111`), tracking ~-0.02em. Benefit-led, short.
- A **two-line supporting paragraph** in muted gray (`#6b7280`-ish), ~15–16px,
  line-height ~1.5. Concise — one idea.
- Optional quiet link ("Explore →", "See how it works →") in the accent color.

## How to reason about it
- Decide the scene first: what fragment best PROVES this feature? Build that, then
  write copy that points at it.
- Hierarchy: the diorama's focal fragment is the eye's first stop; the headline is
  second. Don't let the scene become noise — 2–4 fragments, clear focal one.
- Give the scene room to breathe inside the card; generous padding (28–40px).
  Card radius 20–24px, white/near-white surface, soft border + shadow.
- Legibility at real size: every fragment must read when the card is ~360–420px
  wide. Favor a few crisp elements over many tiny ones.
- Motion (when wanted): a gentle reveal of the card; a hover lift; or one alive
  detail in the scene (a toggle that's on, a cursor, a trend line that draws in).
  Restraint — one moment, not five. Honour `prefers-reduced-motion`.

## Failure modes to avoid
- A single flat icon above a heading. (The cardinal sin.)
- A vague abstract blob instead of a real UI fragment.
- A busy mockup fighting cramped copy — give each its space.
- Pure-decoration gradient with no product scene in it.
