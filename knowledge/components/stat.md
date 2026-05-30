# Component: Stat / metric card

Its job: prove a claim with a number that feels real.

## What it needs
- One **big, beautifully-set figure** — the hero. Large, tight, optically
  aligned; may take an accent or gradient text treatment.
- A **label** saying what it measures and its context ("Median first reply,
  across 4,800 inboxes this week").
- Usually a small **supporting visualization** — a chart, sparkline, meter, or
  trend indicator — that makes the number tangible.
- Optionally a secondary stat or a delta ("+18% faster") for context.

## How to reason about it
- Let the figure dominate; everything else supports it. Resist clutter.
- The visualization must be honest and legible at small size — a clean sparkline
  beats a cramped full chart. Hand-draw it in inline SVG with intent.
- Use tabular/aligned figures; set units smaller than the number itself.
- A delta or trend should read instantly (color + arrow), clearing contrast.
- Motion: a count-up on reveal for the figure, a draw-in for the chart line.
  Keep both quick and eased; honour reduced-motion.
