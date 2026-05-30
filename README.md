# Carle

Vibe-code a single component, train an agent on it, deploy it to build the
whole site.

Prompt → Carle streams one crafted, self-contained component (Opus 4.8, rendered
live in a sandboxed iframe) → tweak it → lock & train an agent on its design
language (`vibe.md`).

## Run it

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # injected at runtime, never committed
npm run dev                            # http://localhost:3000
```

Without a key the UI loads fully, but **Build it** returns a clear
"key not set" message.

## How it's wired

- `app/api/generate` — streams a single self-contained HTML component; the same
  route handles tweaks. Thinking off for the fastest time-to-first-token.
- `app/api/vibe` — streams the extracted `vibe.md` ("train the agent") with
  adaptive thinking.
- `prompts/principles.md` + `prompts/anti-slop.md` — the static, prompt-cached
  system prefix shared across every mode. No templates, no corpus, no utility-CSS
  frameworks.

## Preview helpers

Headless-browser scripts for visual checks without a port-forward
(`npm i -D playwright && npx playwright install chromium` first, server running):

```bash
node scripts/preview-home.cjs       # screenshots the home UI → /tmp/carle-home.png
node scripts/preview-generate.cjs   # runs a real build → /tmp/carle-generated.png
```
