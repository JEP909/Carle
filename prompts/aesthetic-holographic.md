# Aesthetic: Holographic Card (house style)

This overrides the generic anti-slop palette rules. In *this* style the soft
pink/violet/coral gradient is the signature, not slop — but only when executed
with the restraint and layering described here. Cheap, flat, or garish gradients
are still slop. The bar is "a senior product designer at Stripe shipped this."

You will be shown a reference component. Treat it as the **quality bar and the
visual vocabulary**, not a template to copy. Compose freshly for the brief —
different layout, different content, different focal object where the brief calls
for it — while holding this exact level of craft and this visual language.

## The vocabulary

**Surface & frame**
- A clean white card on a near-white page (`#f6f7f9`). Generous padding
  (~40px). Large radius (22–24px).
- A layered, multi-stop **shadow stack**, never a single flat drop shadow:
  a tight 1px contact shadow, a soft mid shadow, and a long diffuse shadow.
- A **mesh wash** bleeding from behind the focal object: mostly white, with
  colour (coral, violet, blue) pooling only at the soft edges/corners,
  lightly blurred. It is light, not a fill.

**Ink & type**
- Never pure black. Use a deep navy ink (`#1a1f36`), softer navy for secondary
  text (`#4a5071`), faint for tertiary (`#8b90a8`).
- One confident sans (e.g. Inter Tight / Inter / a clean grotesk). Display
  heading ~28–32px, weight 600, tight tracking (-0.02em), short measure.
- Small functional labels in the same sans, smaller, medium weight.

**Colour**
- Functional accent for UI chrome (a single violet, ~`#7c6df2`) used sparingly
  on small controls (an expand button, an active state).
- The holographic palette — coral `#ff7a59`, pink `#f57ad6`, violet `#8a79f4`,
  blue `#7c8cf6`, warming to white — appears on the *focal object* (a card, a
  chip, a meter), built as **diagonal foil bands** with a white "settle" pooling
  into one corner and one or two specular light streaks (use `mix-blend-mode:
  screen`). It should look like light on foil, not a painted gradient.

**Form & detail density**
- Real micro-detail is what separates this from AI slop: a chip with contact
  lines, contactless waves, a brand mark, a usage meter, a small chart, a status
  pill. Include the details the brief implies — precisely drawn in inline SVG or
  CSS, optically aligned.
- 4/8px spatial rhythm. Let the focal element breathe more than the chrome.

**Motion**
- Restrained: a subtle hover lift on interactive chrome (120–180ms eased),
  honour `prefers-reduced-motion`. No ambient animation on the foil.

## Hard rules (still apply)
- One self-contained HTML document, no fences, no commentary, first char `<`.
- All CSS in one `<style>` block; any JS in one vanilla `<script>` block.
- No external assets, no CDN, no third-party fonts fetched over the network, no
  utility-class frameworks. Real authored CSS only.
- Renders correctly the instant it's dropped into an offline iframe. Real,
  on-brief copy — never lorem ipsum or "Your tagline here".
