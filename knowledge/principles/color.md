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

## The three canvas modes (grounded — pick ONE per card and commit)
Studying Stripe, Linear, Chatbase, and Chexy: every reference commits to one of
three canvas strategies. Choose the one that fits the brief, then stay disciplined
inside it. A half-dark, half-tinted, muddy in-between is the tell.

1. **Light monochrome** — Stripe (light), Chatbase. The default for most cards.
   - Canvas `#ffffff`–`#fafafa`. Ink ramp from the zinc/slate family:
     `#09090b` (zinc-950) headings · `#27272a` (zinc-800) / `#52525b` (zinc-600)
     body · `#a1a1aa` (zinc-400) meta. Hairline borders `#e4e4e7` (zinc-200).
   - Almost NO background gradient. Chatbase's whole page is near-monochrome zinc;
     color enters through exactly ONE accent (a button, a link, a positive stat)
     and through the **hero render's own color**. Tactility comes from rounding,
     soft layered shadows, and inner highlights — not paint.

2. **Dark glass** — Linear, Chatbase hero. Refined, high-contrast, "AI-era".
   - Canvas deep charcoal/near-black `#08090c`–`#101114`. Raised surfaces are
     `#16171b` glass panels with a `rgba(255,255,255,.06)` top highlight and a
     `rgba(255,255,255,.08)` hairline.
   - Ink `#f4f4f5` primary, `#a1a1aa` secondary. ONE bright accent used sparingly
     (Linear's cyan/indigo); a subtle cyan→violet glow pooling behind the hero.
     `mix-blend-mode: screen` for luminous glints. Ghost/text secondary buttons.

3. **Saturated field** — Chexy. One confident color owns the card.
   - A committed indigo/violet field (`#3b2e7e`→`#5b4bc4`) or another saturated
     brand hue, with floating **white** sub-panels sitting on it (layered shadow,
     so they lift). Lavender/tinted controls. The white panels carry the detail;
     the field carries the brand.

Use one accent family per card; let it glow in one place, don't smear it
everywhere. Stripe's flowing gradient *mesh* is a heavier fourth move — reserve it
for a true marketing hero, and keep it reading as light, not paint.

## Gradients & light (when the brief invites it)
- A gradient should read as **light**, not paint: layered, soft, with a clear
  direction, often pooling at edges or behind a focal object. Build from related
  hues; avoid muddy complementary mixes.
- Use `mix-blend-mode: screen` for luminous glints on dark surfaces.
- A garish, flat, or unmotivated gradient is slop. A restrained, purposeful one
  is craft. The line is intent and execution, not the technique itself.
