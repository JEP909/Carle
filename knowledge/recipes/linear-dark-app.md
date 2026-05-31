# Recipe: Linear Dark App Scene

Transcribed from linear.app — the refined, high-contrast "AI-era" dark product
look. Use when the brief is a developer/product tool, a workflow/issue/project
app, anything that should feel fast, engineered, and premium-dark.

## When to use
Dev tools, project/issue tracking, workflow & automation, technical SaaS, AI
agents shown as a real product surface, "designed for speed / for the AI era".

## The canvas (dark glass)
- Deep charcoal/near-black canvas `#08090c`–`#101114` (a faint top-down or
  radial lift, not flat).
- ONE subtle accent glow pooling behind the hero: a low-opacity cyan→violet
  radial, `mix-blend-mode: screen`. Restraint — the dark stays mostly calm.

## The hero
- Either a real app-UI **glass panel** (built in CSS) or a rendered hero object
  (`{{image:...}}` for a 3D mark/orb/device). If it's a product surface, build a
  believable mini-app:
  - Raised glass panel `#16171b`, radius 16–24px, `rgba(255,255,255,.08)`
    hairline + `inset 0 1px 0 rgba(255,255,255,.06)` top highlight, big soft
    shadow so it floats.
  - Inside: a tight list of **issue/task rows** — a small status dot (cyan/amber/
    violet/green), a title in `#f4f4f5`, a muted `#a1a1aa` meta (assignee avatar,
    a project tag pill, a date), priority/keyboard hints on the right. Aligned
    rows, generous row height, hairline dividers `rgba(255,255,255,.06)`.
  - Optional: a small command-menu / keyboard shortcut chips (`⌘K`, `G`),
    colorful round member avatars, a tiny progress ring.

## Type & copy
- Geist. Hero headline large, weight 500–600, tracking tight, `#f4f4f5`. Support
  one muted `#a1a1aa` line. Voice: direct and confident ("Purpose-built for
  modern teams", "Designed for the way you work"). A `→` on the primary action.

## Buttons
- Primary: a bright accent or a clean white/near-white pill, dark label, weight
  600. Secondary: **ghost** — transparent with a `rgba(255,255,255,.12)` border
  and light-gray label. Hover lifts and brightens.

## Reference-grade vs lazy
- GREAT: calm deep canvas, one cyan/violet glow, a crisp glass app panel dense
  with real aligned rows, restrained bright accent, ghost secondary.
- LAZY: flat black background, a neon rainbow gradient, a near-empty panel with
  two generic rows, sharp corners, heavy borders everywhere.
