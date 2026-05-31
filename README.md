# Carle

Describe your product → Carle generates a committed **brand** (art direction +
palette + voice) and a set of **reference-grade website sections** that all share
one design language. Confirm it to "train" your personal agent, then keep building
in that language.

The bet: output looks dramatically better than generic AI builders because the
harness is better — proven layout **templates**, real brand **logos** (3,400 via
simple-icons), real photoreal **renders** (gpt-image-1), a grounded design-knowledge
layer (Stripe / Linear / Chatbase / Chexy), mandatory depth + motion, and a
deterministic router.

## Run it locally

```bash
npm install

# Create .env.local with your keys (see .env.example):
#   ANTHROPIC_API_KEY=sk-ant-...      (required — generation)
#   OPENAI_API_KEY=sk-proj-...        (optional — photoreal {{image}} renders)
# Optional: CARLE_TIER=standard       (economy | standard | premium)

npm run dev          # http://localhost:3000
```

Then open **http://localhost:3000/onboard** — the product flow:
describe your business → brand + sample sections → tweak / regenerate → confirm.

(`http://localhost:3000/` is the older single-component generator.)

Notes:
- Without `OPENAI_API_KEY`, `{{image}}` render tokens are dropped cleanly (no
  raw tokens) — everything else still works.
- Playwright is only needed for the optional visual judge / screenshot helpers
  (`npx playwright install chromium`); the app UI itself doesn't require it.

## Cost & model tiers

Each generation routes its calls to a model by **tier**, so you choose cheaper or
pricier (`lib/models.ts`):

| Tier | Build model | Helpers | Judge |
|------|-------------|---------|-------|
| economy  | Sonnet | Haiku  | Sonnet |
| standard | Sonnet | Sonnet | Sonnet | (default)
| premium  | Opus   | Sonnet | Opus   |

The big static prompt prefix (principles + brand) is **prompt-cached**, so the
parallel section builds bill it at ~10%. Estimated API cost + credits are returned
by `/api/samples` and shown in the onboarding UI (`lib/cost.ts`). Templated
sections are Sonnet-only + cached images — the cheapest path, so growing the
template library lowers cost while raising quality.

## How it's wired

- `app/onboard` — the product flow (intake → brand → samples → confirm).
- `app/api/brand` — one model call → a `BrandProfile` (art direction, palette,
  accent, voice, sections, tier). `lib/brand.ts`, `lib/art-directions.ts`.
- `app/api/samples` — builds all sections in parallel: templated fast-path
  (`lib/templates/*`) where possible, else a brand-injected free build. Returns
  cost.
- `app/api/compose` — finalizes harness HTML: inject font, resolve `{{logo:}}`,
  composite `{{image:}}` renders (`lib/anthropic.ts`, `lib/imagegen.ts`, `lib/logos.ts`).
- `app/api/projects` — persists a confirmed brand + samples (the trained agent).
- `knowledge/` — always-on principles (typography, color, voice, craft, motion,
  anti-slop) + planner-selected recipes.
