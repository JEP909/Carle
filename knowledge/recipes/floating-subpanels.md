# Recipe: Floating Sub-Panels on a Saturated Field

Transcribed from the Chexy "Pay any bill / Pay on your terms / Chexy does the
rest" cards. Use for product-feature cards that benefit from a confident, branded
color field with crisp white UI fragments floating inside it. This is the antidote
to flat: COMMIT to saturated color + real depth.

## When to use
A feature that shows a list, a settings/schedule panel, a summary, toggles, or
selectable options. Fintech, dashboards, config, "set it your way."

## The construction (exact)
- **The field:** a SATURATED rounded panel (~20px radius) as the diorama stage —
  a deep indigo/violet gradient (e.g. #3b2e7e → #5b4bc4, top-left lighter). This
  is the bold color we kept being too timid about. Soft outer shadow so the field
  itself has presence.
- **Floating white sub-panels INSIDE the field:** white rounded rectangles
  (~14px radius) with a real layered shadow (`0 2px 4px rgba(20,16,60,.12),
  0 16px 32px -12px rgba(20,16,60,.4)`) so they clearly float above the indigo.
  Stack 2–3 with slight offsets/overlap for depth (the Chexy "Pay any bill" bill
  list does this).
- **Real micro-content in the sub-panels:** a labeled row with a real brand logo
  + name + sublabel (e.g. green Manulife logo, "Insurance", "Manulife"), a
  lavender **toggle** on the right; a schedule list (Monthly / Bi-weekly /
  One-time with toggles); a "Payment summary" with line items and a green
  check + "+$10.56 cashback earned". Real names, real amounts.
- **Eyebrow with a small emoji/icon label above the heading** (Chexy uses a tiny
  glyph + "Pay any bill") — this is a deliberate, on-brand eyebrow, not a generic
  tracked-uppercase one.

## What makes it reference-grade vs lazy
- GREAT: the indigo field is rich and confident; white panels genuinely float
  with layered shadows; toggles/logos/amounts are real and specific; slight
  overlap creates depth.
- LAZY (do NOT ship): a pale washed-out tint instead of committed saturation;
  flat panels flush on the field with a thin border and no shadow; generic
  placeholder rows. Timid color is the #1 failure here — commit.

## Palette & type
Saturated indigo/violet field; white sub-panels; ink inside panels near-black;
lavender (#a89cf0-ish) for toggles/accents; one green for success/logo. Geist.
Heading can sit ABOVE in this layout (Chexy does), tight weight 600, with a short
muted support line.
