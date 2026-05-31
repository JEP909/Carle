# Recipe: Data-Viz Panel

Transcribed from the Stripe fraud/Link cards and our validated metric cards. Use
for any stat/metric/analytics feature where a number + chart tells the story.

## When to use
Revenue, usage, growth, uptime, analytics, "track X", any big-number-with-trend.

## The construction (exact)
- **A floating white panel** (or the card itself) with a clear hierarchy:
  - a small muted label/eyebrow (what's measured),
  - the **hero figure** — large, tight, weight 400–500 (NOT bold), tabular
    figures; units/cadence set smaller and muted beside it,
  - a green/positive **delta pill** ("↑ 12.4%") only on the up-metric.
- **The chart** (hand-drawn inline SVG, the craft detail):
  - a smooth line OR rounded bars; for bars, use the Stripe move of a base bar +
    a **detached cap** floating above with a gap,
  - an **area fill** (gradient to transparent) under a line,
  - a **labelled endpoint dot** (white-ringed) on the latest point,
  - faint gridline(s) only; muted axis labels; never chart-junk.
- Optional supporting stat row beneath (label left, tabular value right; accent
  only on positives — NOT candy pills).

## Reference-grade vs lazy
- GREAT: smooth/áarea-filled chart with an endpoint dot, light figure, restrained
  one-accent palette, real axis labels, tabular alignment.
- LAZY: a thin lifeless flat line; a heavy bold number; rainbow multi-series
  clutter; a lonely number with a big dead zone.

Geist; restrained palette, one accent (often green for up, indigo for brand).
