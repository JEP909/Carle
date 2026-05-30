# Design Language: Aurora

A dark, premium, luminous language — deep near-black canvas with spectral light
that feels alive. Restrained and confident, never garish. The bar is "a top
product studio shipped this."

This spec describes the *language*. It is applied to many different card
structures (feature, pricing, stat, …). Hold the language constant; let the
structure and brief drive the layout.

## Canvas & surface
- Background: deep near-black, faintly blue (`#0a0b14`–`#0d0e1a`). Never pure
  black, never light.
- Cards: a slightly raised dark surface (`#12131f`) with a 1px hairline border
  in a low-opacity light (`rgba(255,255,255,0.08)`), large radius (20–28px).
- Depth comes from layered shadows AND a soft inner top-edge highlight
  (`inset 0 1px 0 rgba(255,255,255,0.06)`), so cards feel lit from above.

## Light (the signature)
- Spectral gradients — indigo `#5b6cff`, violet `#a26bf6`, magenta `#e158c8`,
  teal `#33c5b0` — used as **light**, not fills: as a soft glow behind/within a
  card, a diagonal sheen across a focal object, a luminous accent on a number or
  border. Built with layered radial/linear gradients and `mix-blend-mode: screen`
  for the glints.
- A focal object (a card-within, a chart, a price) may carry a moving sheen.
  When interactivity is warranted, a subtle **cursor-tracked highlight** (a soft
  radial that follows the pointer) is the house move — implement with a tiny
  vanilla script and CSS custom properties; always honour
  `prefers-reduced-motion`.
- Light is the accent. Most of the card is calm dark; the spectral colour is a
  precise highlight, not a wash over everything.

## Ink & type
- Text is light on dark: primary `#f4f5fb`, secondary `rgba(244,245,251,0.66)`,
  tertiary `rgba(244,245,251,0.42)`. Never pure white for body.
- One crisp grotesk/sans (e.g. a clean geometric or neo-grotesque). Display
  headings large, weight 600–700, tight tracking (-0.02em), short measure.
  Eyebrow labels small, uppercase, wide tracking (0.12em), in a muted tint or a
  spectral accent.
- Numbers (prices, stats) are a showpiece: large, tight, optically aligned, and
  may take a spectral gradient text-fill.

## Form & detail
- 8px spatial rhythm; let the focal element breathe more than the chrome.
- Real micro-detail density: hairline dividers, crisp affirmative markers in
  lists, small precise iconography in inline SVG, a chip/badge/meter where the
  card's job calls for it. Detail at this precision is what separates it from AI
  slop.
- Buttons: a luminous primary (spectral fill or a solid bright accent with a
  soft glow), a quiet secondary (text or hairline-outline). Real states:
  hover (lift + glow), focus-visible (a clear ring), active.

## Motion
- Purposeful and fast (120–260ms, eased). A hover lift + intensified glow on
  interactive elements; an optional cursor-tracked sheen on the focal object;
  optional reveal-on-load for the headline/number. No ambient looping animation.
  Always honour `prefers-reduced-motion`.

## Voice
- Confident, concrete, a little editorial. Benefit-led, specific, never filler.
  Real on-brief copy always.

## Hard rules (always)
- One self-contained HTML document, no fences, no commentary, first char `<`.
- All CSS in one `<style>` block; any JS in one vanilla `<script>` block.
- No external assets, no CDN, no third-party fonts fetched over the network, no
  utility-class frameworks. Real authored CSS only.
- Set the document/body background to the Aurora canvas so the card sits in its
  world, and centre the card with generous padding.
- Renders correctly the instant it's dropped into an offline iframe.
