# Recipe: Rendered Card Deck

Transcribed from the Chexy "Use any credit card" card (fanned Visa/Mastercard/
Amex) and our validated dimensional card-deck. Use when the subject is physical-
object-like: payment cards, passes, devices, tickets — anything that benefits
from a 3D rendered hero object.

## When to use
Card issuing, payments, membership/passes, "use any card", wallet, physical
product hero.

## The hero card is a RENDERED object — use {{image:...}}
A metallic / holographic credit card with real sheen, depth, and material is the
canonical thing CSS cannot fake. Render the hero card with an `{{image:...}}`
token (see the "Rendered hero objects" principle). Build the stage and
everything else around it in CSS.

- **Stage:** a saturated field (indigo) or deep spotlight gradient, with a soft
  radial highlight near the top so it reads as a lit scene, plus a blurred accent
  underglow ellipse behind where the card sits.
- **The hero render:** one container, tilted slightly, holding
  `{{image:wide|a single premium credit card at a 25-degree 3D angle, <MATERIAL
  matched to the brief: brushed titanium / matte black / iridescent holographic>
  finish, gold EMV chip, subtle reflective sheen and soft motion, studio
  lighting, soft realistic shadow}}`. Give the container a strong drop shadow so
  the card lifts off the stage. Make it large — the clear focal point.
- **Compose UI around it** in CSS: a glass status pill ("titanium • live"), a
  small rewards row, a real brand mark ({{logo:visa}}/{{logo:mastercard}}) or a
  tasteful wordmark in a corner panel — so the scene is dense, not just a floating
  render on emptiness.

(If the brief really wants a *fanned deck* of 2–3 cards and CSS perspective reads
well enough, that's still acceptable — but for a single premium hero card, the
{{image:}} render is the quality jump.)

## Reference-grade vs lazy
- GREAT: a photoreal rendered hero card with real metallic/holographic material,
  sitting on a lit saturated stage with underglow, surrounded by tight supporting
  UI and crisp Geist copy.
- LAZY: a flat upright CSS rectangle with one color and no depth; the render
  floating alone in a big empty zone with nothing around it.

Geist; copy anchored below with a tight headline + 2-line support.
