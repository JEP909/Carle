# Recipe: Brand Offer / Earn Cards (logo + metric + bleeding render)

Transcribed from the Chexy "More ways to earn" section. Use for loyalty/rewards/
partner/offer rows where each item pairs a real brand with a headline number and a
photoreal product render.

## NON-NEGOTIABLE — this recipe is defined by the render
Every card in this recipe MUST contain a photoreal `{{image:wide|...}}` render of
the actual physical credit card, bleeding off one edge. That render IS the recipe.
The brand `{{logo:}}` is SEPARATE and additional (a small mark by the name) — it
does NOT replace the card render. A version that shows only a logo + number with
no `{{image}}` card render, or that draws the card in CSS, has FAILED this recipe.
If you emit a card here, the very next thing you emit is its `{{image:wide|...}}`.

## When to use
Loyalty & rewards, "earn up to X points", partner/brand programs, credit-card or
product offers, plan/program comparison — anywhere each option has a brand mark +
a big number + a hero object. Typically 1–3 items in a row.

## Layout
- White page. Optional centered heading + muted one-line subhead above the row.
  A dark, fully-rounded pill CTA centered below ("Start earning today →").
- A row of 1–3 **light-gray** rounded cards (field `#f4f4f6`, radius ~28px).
- Each card is a **two-column flex** (`align-items:center`), min-height ~300px,
  `overflow:hidden`, padded left ~52px:
  - **LEFT (~44%)**, stacked: the brand mark via `{{logo:SLUG}}` (real vector,
    e.g. `{{logo:aeroplan}}`, `{{logo:americanexpress}}`); a small "Earn up to"
    eyebrow (weight 500); a very large **tabular** number (~76px, weight 700,
    tracking -.03em, ink = the heading/brand color); a muted one-line support
    ("Bonus … points*"); an "Explore →" text link (weight 600, accent ink).
  - **RIGHT (~56%)**: the hero is a `{{image:wide|...}}` product render that
    **bleeds off the right edge** — its container has a negative `margin-right`
    and the `<img>` uses `object-fit:contain; object-position:center right;
    transform:scale(~1.25)` so the object reads large and runs off-frame like a
    real marketing shot.

## What is coded vs looked-up vs generated (the whole point)
- **CODED** (HTML/CSS): the gray cards, heading, eyebrow, the big number, support
  copy, Explore link, CTA pill, every bit of spacing.
- **LOOKED UP** (token, never drawn): each brand mark → `{{logo:SLUG}}`. Never
  hand-draw or approximate a logo.
- **GENERATED** (token, gpt-image-1): only the physical card/product →
  `{{image:wide|...}}`. Nothing else gets generated.

## Render prompt tips
Describe material + finish + angle + lighting + motion; one isolated object (the
wrapper forces a transparent background — never say "on white"). e.g.
`{{image:wide|a single premium credit card, glossy red finish, brushed silver
chip, embossed digits, standing upright tilted toward the viewer, directional
motion blur streaking off the right edge, clean studio product render, soft
shadow}}`. For a stack use "a fanned overlapping deck of … cards".

## Reference-grade vs lazy
- GREAT: real logo + big tabular number + a photoreal render bleeding off the
  edge; airy spacing; one accent; confident concrete copy with real numbers.
- LAZY: a flat CSS rectangle standing in for the card; a hand-drawn logo; a tiny
  centered render with dead space around it; cramped spacing.

Geist throughout.
