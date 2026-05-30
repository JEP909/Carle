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

## Faces that read as "premium product" (grounded in references)
The references (Stripe, Chatbase, Stan, Chexy, Vercel, Linear) almost all use a
**clean geometric/neo-grotesque sans** for both headings and body — tight,
confident, low-contrast. Headlines are large and heavy with tight tracking; body
is the same family at regular weight in muted gray. Good choices in that vein:
a well-drawn grotesque (think Söhne / Geist / General Sans / Inter Tight family
character) set impeccably. The "look" comes far more from *setting* (size jump,
weight, tracking, muted body) than from an exotic face — so set a grotesque
beautifully rather than reaching for novelty. Editorial/luxury briefs may instead
pair a high-contrast serif display with a clean sans body.

## House typeface (use it)
A clean grotesque named **"Geist"** is embedded in every document automatically
(you do not need to declare @font-face). Use it as the primary family in your CSS:
`font-family: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;`
Set it on the root/body so the whole card inherits it. Geist is a Söhne-class
neo-grotesque — lean on weight, size, and tracking for hierarchy, not novelty.

**Big numbers are NOT heavy.** A large metric (a price, a stat like `450,335`)
should be weight 400–500 and open — never 600/700 bold. Heavy large numbers are a
tell. Reserve 600 for headings and labels; keep showpiece figures lighter and let
their size carry them.

## The reference headline recipe
- Headline: ~22–40px depending on context, weight 600–700, tracking -0.02em,
  near-black ink (`#0a0a0a`–`#111827`), short measure (one or two tight lines).
- Body/support: same family, ~15–16px, weight 400, muted gray (`#6b7280`-ish),
  line-height ~1.5, capped at ~2 lines on a card.
- Eyebrow/label: ~11–12px, uppercase, wide tracking (0.1–0.16em), accent tint.
