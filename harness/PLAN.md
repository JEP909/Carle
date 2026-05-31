# Carle Harness Plan v2 — MD Recipe Library + Planner + Visual Judge

## The vision (unchanged)
Type plain English ("a website for an AI agent real estate SaaS") -> cards that
look like the references -> "Is this good?" -> Confirm -> train an agent ->
build the whole site. References are OUR baked-in taste; the user only types.

## Core architecture (decided with user)
Words guide the build; pixels verify it.
- MD KNOWLEDGE LIBRARY = the "how to build rich things" brain. A deep, organized
  set of MD files the model consults.
- PLANNER = a fast pass that reads the brief and SELECTS which recipe + component
  MDs are relevant, so only those load into the build context (scales without
  bloating every prompt).
- VISUAL JUDGE (already built) = renders the card and scores it on pixels vs the
  rubric/reference bar; revises against what it SAW. The eyes prose can't give.

Why both: MD files alone drift to generic (words about images). The visual judge
is what moved quality every time (67->84). MD library makes the FIRST draft rich
(start ~80 not ~67); the judge catches what prose can't.

## MD library structure (3 layers)
1. Always-on principles (the floor): typography, color, layout, craft-primitives,
   motion, anti-slop, assets. (Exist; to be deepened.)
2. RECIPE files (NEW depth) — one per technique, transcribed PRECISELY from the
   user's real references:
   - recipe-orbit-constellation.md  (Chatbase: dotted-circle orbit, floating
     B/I/U/S toolbar, black "Create agent" pill with coral->magenta gradient
     UNDERGLOW ~12px below, overlapping green/lime dots, "Reply with AI" outlined
     pill w/ sparkle, green toggle)
   - recipe-floating-subpanels.md   (Chexy: saturated indigo field #3b2e7e->#5b4bc4,
     white floating sub-panels w/ real shadows, lavender toggles, green logo,
     payment-summary panel, green cashback check)
   - recipe-rendered-cards.md       (Chexy/credit-card deck: fanned cards w/
     perspective, metallic/holographic, motion-blur depth, brand logos)
   - recipe-logo-grid.md            (Chatbase omnichannel: real logos in white
     tiles on a watercolor field)
   - recipe-dataviz.md              (Stripe: bars w/ detached caps, smooth trend
     line, area fill, endpoint dot)
   - recipe-chat-diorama.md         (Chatbase smart-escalation: chat bubbles ->
     ticket card w/ gradient bottom edge)
   Each recipe: when-to-use, exact construction, the depth/underglow/material
   details, and what makes it reference-grade vs lazy.
3. Component files (per card type): feature, pricing, hero, stat, testimonial,
   cta — reference the recipes.

## Planner (selection mechanism)
lib/planner.ts: a fast Sonnet pass takes the (expanded) brief and returns which
component + which recipe MD(s) to load. Only those get injected into the build
system prompt. Keeps context sharp as the library grows.

## Build order (decided)
1. Transcribe the 4 sent references into precise recipe MDs (orbit-constellation,
   floating-subpanels, rendered-cards, logo-grid; + dataviz, chat-diorama from
   earlier refs). I read the actual images; encode their visual DNA exactly.
2. Build lib/planner.ts (brief -> selected MDs) + a recipe registry.
3. Wire generate to: expand -> plan(select MDs) -> build with those MDs -> visual
   judge -> revise. Raise judge bar (~88) and allow 2-3 revise rounds.
4. Prove it: generate the user's kind of brief end-to-end, show before/after.

## Note on references-as-files
User pastes references as chat images; I can SEE them but can't write the pasted
bytes to disk. So recipes are my precise transcription of the real images (best
available). If real image FILES are ever committed to reference/images/, wire the
judge to load and compare against literal pixels too.

## Later (product roadmap, not now)
Bless/save (built) -> train agent on blessed set -> site assembly -> app UI.
