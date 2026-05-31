# Recipe: Chat / Flow Diorama

Transcribed from the Chatbase "Smart escalation" card (chat bubbles → a ticket).
Use for conversational / support / agent-does-a-task features where showing the
exchange tells the story.

## When to use
Support, escalation, AI replies, booking, "the agent handles X" — anything that's
a short conversation or a step that produces an artifact.

## The construction (exact)
- **Surface:** white card, generous padding, soft shadow; diorama on top, copy
  below.
- **The exchange:** 1–2 chat bubbles. A user bubble (white, rounded, a small real
  avatar) right-aligned: "Hey, I would like a refund". An agent bubble
  (light-gray, rounded) left-aligned with a small dark circular agent mark:
  "Sure, let's create a ticket!". Keep copy real and specific.
- **A divider event:** a thin hairline with a centered muted label + tiny icon
  ("🎟 Ticket submitted") separating the chat from the result.
- **The result artifact:** a floating white card — "Ticket #234 · Open · 12m ago"
  with a small colored icon tile — and the signature detail: a **gradient bottom
  edge** (a thin blue→cyan gradient strip along the card's bottom border) giving
  it life.

## Reference-grade vs lazy
- GREAT: believable dialogue, real avatar, the divider event, the result card
  with the gradient edge and real ticket metadata, soft depth on each element.
- LAZY: hand-drawn glyphs, generic "Lorem" messages, no avatar, a flat result row
  with no artifact, a sparkle as the agent icon, cramped/uneven spacing.

Restrained palette + one accent (the gradient edge / status color). Geist.

## Icons / spacing / type (the three things that separate good from great)
- ICONS: a connected-tools sidebar MUST use REAL logos via {{logo:...}} (slack,
  gmail, notion, github, stripe, …) — never hand-drawn letter-marks. No real
  logo for a tool? Leave it out rather than fake it. Agent avatar = a clean dark
  circle or real mark, never a sparkle.
- SPACING: 8px base rhythm. Even gaps between bubbles (~12–14px), consistent
  bubble padding (~14–16px), one clear ~20px gap + divider before the result
  card. Align sidebar, bubbles, and result to a shared grid. No cramped or uneven
  gaps, no dead zones.
- TYPE: Geist throughout. Bubbles ~15px/1.5; headline ~26px weight 600 tracking
  -0.02em; support ~15.5px muted ≤34ch; metadata ~12–13px; numbers tabular.
  Heading 600 / body 400 / one medium for emphasis — no arbitrary weight mixing.
