# Motion

Motion makes an interface feel alive and considered — "like Apple" — but only
when it has a reason. Animate to explain a change, guide attention, or reward an
action. Never animate for decoration. A single well-judged micro-interaction
beats ten ambient ones.

## Principles
- **Fast and eased.** 120–260ms for micro-interactions; up to ~400ms for larger
  entrances. Use eased curves (`cubic-bezier`), never linear. Ease-out for things
  entering, ease-in for things leaving.
- **Purposeful.** Every animation answers "what does this help the user
  understand?" If there's no answer, cut it.
- **Restraint reads as premium.** Calm surfaces with one or two precise moments of
  motion feel more expensive than constant movement.
- **Always honour `prefers-reduced-motion: reduce`** — disable transforms and
  non-essential transitions inside that media query.
- **Performance.** Animate only `transform` and `opacity`. Avoid animating
  layout properties (width, top, margin) — they jank.

## The motion vocabulary
These are named techniques the agent applies by reasoning about fit — not a
library to paste from. Compose them; tune the timing to the brief.

- **Hover lift** — element rises a few px and its shadow/glow intensifies on
  hover. The default "this is interactive" signal. Pair lift + shadow, eased
  ~160ms.
- **Cursor-tracked sheen** — a soft radial highlight follows the pointer across a
  card/focal object, fed via CSS custom properties from a tiny pointermove
  handler. The premium "the surface catches light" move. Subtle opacity.
- **Reveal on load/scroll** — elements fade up (`opacity` 0→1, `translateY`
  ~12–20px→0) as they enter. Stagger siblings by ~60–90ms for a composed cascade.
  Use IntersectionObserver for scroll; honour reduced-motion.
- **Stagger** — a group reveals in sequence rather than all at once, drawing the
  eye through the content in reading order.
- **Magnetic / proximity** — a button or element eases slightly toward the cursor
  as it approaches. Use sparingly, on a single hero action.
- **Parallax** — layered elements move at different rates on scroll/pointer to
  imply depth. Keep the displacement small; large parallax feels gimmicky.
- **Count-up** — a number animates from 0 to its value on reveal. For stat
  cards; keep it quick and ease-out.
- **Press feedback** — active state depresses slightly (scale ~0.98) so taps feel
  physical.

## Implementation notes
- Pure CSS transitions/keyframes for hover/press/reveal where possible; minimal
  vanilla JS for pointer-tracking, IntersectionObserver, and count-up.
- Drive dynamic values (cursor position, scroll progress) through CSS custom
  properties so the CSS stays declarative and cheap.
- This file is where distilled Framer motion templates land — each becomes a
  named technique above with its timing and intent, applied by reasoning.
