# Real assets (use them — they're what make cards look real)

Flat CSS shapes read as fake. Real product cards use real brand logos, real
depth, and real imagery. You have these tools — use them.

## Brand logos (bundled, offline, authentic)
Insert a real brand logo with the token **`{{logo:NAME}}`**. It is replaced
server-side with the authentic inline SVG (correct geometry + brand color). Never
hand-draw or guess a brand's SVG path — emit the token.

- Sizing: `{{logo:NAME:40}}` sets a 40px glyph (default 28).
- Recolor for monochrome contexts: `{{logo:NAME:24:currentColor}}` or
  `{{logo:NAME:24:#ffffff}}` (e.g. a white logo on a dark pill). Omit to use the
  real brand color.
- Available names include: whatsapp, messenger, gmail, discord, telegram,
  stripe, visa, mastercard, amex, google, notion, github. Use the exact lowercase
  name. If a brand you need isn't listed, draw a tasteful generic glyph instead —
  do NOT invent a fake brand path.

Put logos in rounded tiles, integration grids, payment-method rows, orbit
diagrams, "channels connected" scenes — wherever a real product would show them.

## Depth & material (this is what separates real from flat)
- **Float panels on a field**: a white sub-panel sitting on a saturated or tinted
  background, with a real layered shadow, reads as dimensional. Overlap 2–3 panels
  with offsets. (See the craft-primitives floating-panel + ambient-wash recipes.)
- **Commit to saturated color** when the brief wants it — a confident indigo or
  purple field (like a real product marketing card), not a washed-out pale tint.
- Use inner highlights (`inset 0 1px 0 rgba(255,255,255,.6)`) and multi-stop
  shadows so surfaces feel lit, not pasted.

## Imagery (when a photo is implied)
You cannot fetch external photos (offline, self-contained). When a brief implies
product photography, render a **tasteful, specific illustration in CSS/SVG** —
a credit-card render with chip and gradient, a device frame, an abstract product
form with real shadow — not a vague gray blob. Make it deliberate and on-brand.
Keep it confident and reasonably large; do not leave big dead empty zones.
