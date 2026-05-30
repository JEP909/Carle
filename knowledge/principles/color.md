# Color

Color is structural, not decorative. Build a deliberate, narrow system and derive
everything from it. Reason from the brief's domain and mood — never default to a
familiar palette.

## Building the system
- Start from a grounded **base/canvas** (a near-white, a near-black, or a tinted
  neutral) and one or two functional **neutrals** for surfaces and text.
- Add a single **accent** that means something for the brand. One confident
  accent beats a rainbow. A second accent only if it has a distinct job
  (e.g. success vs. primary action).
- Derive **states** (hover, active, disabled, selected) from the base palette by
  shifting lightness/saturation — don't invent new hues for states.
- Most strong components live on **2–3 colors**. If you're reaching for a 6th,
  question it.

## Ink (text color)
- Never pure black on white or pure white on dark. Use a deep tinted ink
  (e.g. a near-black with a hint of the brand hue) and a true-but-soft light.
- Establish a text ramp: primary / secondary / tertiary by opacity or lightness,
  so hierarchy reads without changing hue.

## Contrast & accessibility
- Body text must clear WCAG AA (4.5:1); large text 3:1. Check accent-on-canvas
  for any text use.
- Use contrast intentionally for hierarchy: the most important element gets the
  most contrast; supporting elements recede.

## Reference palettes (grounded)
The premium product look is mostly **near-white canvas + near-black ink + one
accent**, with color appearing as an ambient wash behind dioramas:
- Canvas: `#ffffff` to `#fafafa`; ink `#0a0a0a`–`#111827`; muted text `#6b7280`;
  hairlines `rgba(16,24,40,.08)`.
- Accents seen: Stripe indigo/violet `#635bff` with teal glints; Chexy indigo
  field `#3b2e7e`→`#5b4bc4` with lavender controls; Stan per-card grainy washes
  (coral-red, gold, gray); Chatbase warm coral→pink→amber underglow on black.
- A card may invert to a saturated field (Chexy) or a grainy colored wash (Stan)
  while keeping floating white sub-panels inside it. Use one accent family per
  card; let it glow, don't smear it everywhere.

## Gradients & light (when the brief invites it)
- A gradient should read as **light**, not paint: layered, soft, with a clear
  direction, often pooling at edges or behind a focal object. Build from related
  hues; avoid muddy complementary mixes.
- Use `mix-blend-mode: screen` for luminous glints on dark surfaces.
- A garish, flat, or unmotivated gradient is slop. A restrained, purposeful one
  is craft. The line is intent and execution, not the technique itself.
