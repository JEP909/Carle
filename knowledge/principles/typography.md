# Typography

Type is 80% of most interfaces. Treat it as the primary design decision, not an
afterthought. Reason about it from these principles — do not reach for a default.

## Choosing type with intent
- Pick faces that fit the brief's register. A fintech tool, an editorial site, a
  children's app, and a luxury brand each demand a different voice. Read the
  domain first, then choose.
- A confident interface usually uses **one** family with real weight range, or a
  deliberate **two-family pairing**: a display face for headlines + a clean text
  face for body. Pair only when the contrast earns its keep.
- Good pairings share a quality (both geometric, both humanist) or contrast
  deliberately (a high-contrast serif display + a neutral grotesque body). Avoid
  pairing two faces that merely look similar — that reads as a mistake.
- Reach for genuinely well-drawn faces. Strong, characterful choices over the
  safe, overused defaults (see anti-slop). When you must stay system-native, say
  so deliberately and set it impeccably.

## Setting type well
- **Scale**: establish a clear modular scale (e.g. ~1.2–1.333 ratio). Display
  large and tight; body comfortable; labels small. Skip steps to create
  hierarchy — adjacent sizes that are too close read as indecision.
- **Weight**: hierarchy through weight is cheaper than through size. A 600 heading
  over a 400 body does a lot of work. Avoid more than ~3 weights in one component.
- **Line-height**: tight for display (1.05–1.2), open for body (1.4–1.6). The
  bigger the type, the tighter the leading.
- **Tracking**: negative on large display (-0.01 to -0.03em); near-zero on body;
  positive and wide on small uppercase labels (0.08–0.16em).
- **Measure**: keep body text to ~45–75 characters. Constrain with max-width on
  the text element, not the container.
- **Numbers**: prices and stats are showpieces — set them large, tight, optically
  aligned; use tabular figures for data that aligns in columns.

## Optical care
- Align to the optical edge, not the bounding box (punctuation, round letters).
- Trim the leading at the top of headings so they sit tight to elements above.
- Don't center long-form text. Center only short, balanced phrases.
