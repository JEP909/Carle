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
- Available names: whatsapp, messenger, gmail, discord, telegram, slack, notion,
  github, google, youtube, tiktok, instagram, x, stripe, visa, mastercard, amex.
  Use the exact lowercase name. If a brand you need isn't listed, draw a tasteful
  generic glyph instead — do NOT invent a fake brand path.

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

## Rendered hero objects (the {{image:...}} token — use for the focal object)
Some objects cannot be faked in CSS: a metallic credit card with real sheen and
motion-blur, a dimensional 3D shield, a glossy device, a rendered product. For
the card's ONE focal hero object, emit a **`{{image:PROMPT}}`** token. It is
replaced server-side with a real photoreal render (transparent background) that
drops straight onto your card — exactly like a {{logo:}} token, but for a
rendered 3D object.

**The decision rule — this is important.** If the hero is a SOLID, DIMENSIONAL,
PHYSICAL OBJECT, it MUST be an {{image:}} render. CSS versions of these read as
flat clipart and are the #1 quality failure. This includes, but is not limited
to:
- a **3D shield / lock / badge / crest** (security, trust, compliance) — a flat
  CSS shield with a lock glyph is exactly the failure to avoid;
- a **glowing orb / AI core / sphere / energy object** (AI agents, models) —
  render it as a real volumetric glass/plasma sphere, not a radial-gradient circle;
- a **credit/payment card, pass, ticket, key** with real material;
- a **device / gadget / wearable / product** (puck, phone, speaker, sensor);
- a **gem / crystal / coin / token / trophy / medal**;
- a **3D mascot / character / abstract sculptural form**.

Only build the hero in CSS when it is genuinely a FLAT UI THING — a chart, a
dashboard panel, a chat transcript, an integration logo grid, a settings list. A
solid object that would cast a real shadow → render it.

- Describe the object precisely and concretely: material, finish, color, angle,
  lighting. e.g. `{{image:a premium credit card at a 30-degree 3D angle, brushed
  metal indigo finish with a gold EMV chip, subtle holographic sheen, soft studio
  shadow}}`.
- The render is ALWAYS an isolated object on a transparent field — never write
  "on a white background" or "in a scene". It sits on YOUR card's color.
- Place it inside a container with an **explicit size** — a fixed height or an
  `aspect-ratio` (e.g. `aspect-ratio:16/10;width:78%`). The <img> fills the
  container (object-fit:contain), so WITHOUT a sized parent it collapses to
  nothing and you get an empty void. Give it real presence — large, the clear
  focal point — with your own underglow / shadow / stage behind it.
- Use it for the hero ONLY. **One**, occasionally two, per card. Everything else
  (UI panels, charts, logos, type, layout) is still hand-built HTML/CSS — the
  render is the one thing CSS can't do.
- Aspect: default is square; prepend `wide|` or `tall|` for landscape/portrait
  heroes, e.g. `{{image:wide|a sleek laptop ...}}`.

And the inverse failure: a render alone, floating in a big empty zone, is NOT
enough. Surround it with real hand-built UI (panels, stats, pills, copy) so the
card is a dense, believable scene — the render is the focal object, not the whole
card. Never leave a big dead empty zone.
