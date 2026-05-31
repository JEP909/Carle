import { anthropic } from "./anthropic";
import { type Palette, paletteText } from "./palette";
import { templateIdFromBrief } from "./templates";
import { type ArtDirectionId, artDirectionBlock, canvasModeFor } from "./art-directions";

// ---------------------------------------------------------------------------
// BrandProfile — the persisted design identity that makes a user's agent
// personalized. One merged Sonnet call turns a business description into a
// committed brand (canvas mode + palette + type + voice + accent) plus a set of
// showcase sections. The same profile is then injected into EVERY generation so
// all output shares one cohesive design language — this is the core of "their
// agent knows their design system".
//
// Merges what used to be three separate calls (expand + palette + plan) into one.
// ---------------------------------------------------------------------------

export type CanvasMode = "light-monochrome" | "dark-glass" | "saturated-field";

export type SectionPlan = {
  id: string;
  label: string; // gallery label, e.g. "Pricing"
  brief: string; // brand-aware brief for THIS section
  template: string | null; // a deterministic template id, or null = free-build
};

export type BrandProfile = {
  id: string;
  business: string; // raw user intake
  expanded: string; // rich internal spec
  name: string; // inferred product/brand name
  artDirection: ArtDirectionId; // the committed theme (Stripe/Chatbase/Chexy/Linear)
  canvasMode: CanvasMode; // derived from artDirection (for the template gate)
  palette: Palette;
  typography: string;
  voice: string[];
  accent: string; // single canonical accent hex
  sections: SectionPlan[];
  createdAt: string;
};

const BRAND_MODEL = "claude-sonnet-4-6"; // a design call, not generation — fast + cheap

const BRAND_SYSTEM = `You are a senior brand & product designer at the level of
the teams behind Stripe, Linear, Chatbase, and Chexy. Given a short description of
a business/app, define a COMMITTED, RESTRAINED visual brand and a set of website
sections. You do NOT write HTML — you return JSON.

THE BAR — and the #1 thing to AVOID:
Real premium product sites are LIGHT, clean, and restrained: a near-white canvas,
near-black/slate ink, hairline borders, ONE confident accent, generous space, and
real product UI. The single most common failure — the thing that screams
"AI-generated startup template" — is a DARK page covered in PURPLE/VIOLET gradients
and glows. DO NOT produce that. No purple-on-black. No gradient-mesh backgrounds.
No glow washes as the primary look. If you reach for "dark + purple + glow", stop.

Decide:
1. name: infer a plausible product/brand name.
2. expanded: 2-4 tight sentences describing the product concretely.
3. artDirection: pick EXACTLY ONE proven theme that fits the DOMAIN. Each carries a
   committed look + a signature visual move + real depth (so the site has a theme,
   not generic flat cards):
   - "stripe" — technical/infra/fintech/payments/data/analytics/B2B platforms.
     Light, restrained, ONE accent, data-viz + bento grids, floating layered
     product UI. The DEFAULT for most B2B SaaS.
   - "chatbase" — AI agents / support / automation / chat tools. Light monochrome
     zinc + ONE signature gradient used only as a button underglow, orbiting logos,
     3D rendered objects, very rounded.
   - "chexy" — bold consumer fintech / rewards / commerce. A light page with ONE
     saturated brand panel + a photoreal rendered product object.
   - "linear" — ONLY genuinely developer-tools / infrastructure / security products
     that are dark-native. Restrained dark, ONE accent, NO glow/purple.
   When in doubt choose "stripe". Do NOT choose "linear" unless the product is truly
   developer/infra/security.
4. palette: {field, accents, ink, mood}. Pick a real, brand-appropriate ACCENT for
   the domain — AVOID defaulting to purple/violet unless the brand is genuinely
   purple. Good accents: a confident blue, indigo, teal/emerald, warm coral, amber,
   or near-black. Tasteful and specific, never rainbow, never neon-on-dark. (The
   canvas itself is set by the art direction.)
5. accent: a single canonical accent HEX used sparingly for buttons/links/key numbers.
6. typography: 1-2 lines (weights, scale, feel). House font is Geist.
7. voice: 3-5 brand voice traits.
8. sections: 3-5 sections to showcase the brand. Each {label, brief}, brief = a
   concrete, brand-aware description a designer would build from. Favor variety
   (hero, feature cards, metrics/stats, pricing, integrations/logos). Be specific,
   and lean into the art direction's signature (e.g. a data-viz section for stripe,
   an orbiting-integrations section for chatbase, a rendered-product section for chexy).

Respond ONLY as JSON:
{"name","expanded","artDirection","palette":{"field","accents","ink","mood"},"accent","typography","voice":[],"sections":[{"label","brief"}]}`;

const FALLBACK_SECTIONS: Array<{ label: string; brief: string }> = [
  { label: "Hero", brief: "a hero feature section introducing the product with a bold headline, a one-line value proposition, a primary call-to-action, and a believable product UI scene." },
  { label: "Features", brief: "a two-card feature section, each card with a small product-UI diorama, a feature title, and a two-line description." },
  { label: "Metrics", brief: "a stats/metrics section with 3-4 big numbers and short labels showing the product's impact, with a small trend chart." },
];

function rid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function asArtDirection(v: unknown): ArtDirectionId {
  return v === "stripe" || v === "chatbase" || v === "chexy" || v === "linear" ? v : "stripe";
}

// Build the section plans, resolving each to a deterministic template when the
// brief matches one AND the brand is light-monochrome (the templates' native
// look — avoids a templated section clashing with a dark/saturated brand).
function planSections(
  raw: Array<{ label?: unknown; brief?: unknown }>,
  canvasMode: CanvasMode,
): SectionPlan[] {
  const list = (raw.length ? raw : FALLBACK_SECTIONS).slice(0, 5);
  return list.map((s) => {
    const brief = typeof s.brief === "string" && s.brief.trim() ? s.brief.trim() : "a clean product section.";
    const label = typeof s.label === "string" && s.label.trim() ? s.label.trim() : "Section";
    const template = canvasMode === "light-monochrome" ? templateIdFromBrief(brief) : null;
    return { id: rid("sec"), label, brief, template };
  });
}

export async function generateBrandProfile(business: string, tweak?: string): Promise<BrandProfile> {
  const userContent = tweak ? `${business}\n\nAdjust the brand per this note: ${tweak}` : business;
  let parsed: Record<string, unknown> = {};
  try {
    const res = await anthropic.messages.create({
      model: BRAND_MODEL,
      max_tokens: 2000,
      system: BRAND_SYSTEM,
      messages: [{ role: "user", content: userContent }],
    });
    const t = res.content.find((b) => b.type === "text");
    const txt = t && t.type === "text" ? t.text : "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (m) parsed = JSON.parse(m[0]);
  } catch {
    // fall through to defaults
  }

  const p = (parsed.palette ?? {}) as Record<string, unknown>;
  const palette: Palette = {
    field: String(p.field ?? "linear-gradient(180deg,#ffffff,#fafafa)"),
    accents: String(p.accents ?? "a single confident accent"),
    ink: String(p.ink ?? "near-black #0a0a0a on white, muted #6b7280"),
    mood: String(p.mood ?? "clean and premium"),
  };
  const artDirection = asArtDirection(parsed.artDirection);
  const canvasMode = canvasModeFor(artDirection);
  const voice = Array.isArray(parsed.voice)
    ? parsed.voice.filter((v): v is string => typeof v === "string").slice(0, 5)
    : ["confident", "concrete", "premium"];
  const rawSections = Array.isArray(parsed.sections)
    ? (parsed.sections as Array<{ label?: unknown; brief?: unknown }>)
    : [];

  return {
    id: rid("brand"),
    business,
    expanded: String(parsed.expanded ?? business),
    name: String(parsed.name ?? "Your brand"),
    artDirection,
    canvasMode,
    palette,
    typography: String(parsed.typography ?? "Geist throughout; bold tight headlines, muted body, tabular numbers."),
    voice,
    accent: typeof parsed.accent === "string" && /^#[0-9a-fA-F]{3,8}$/.test(parsed.accent) ? parsed.accent : "#0f6fec",
    sections: planSections(rawSections, canvasMode),
    createdAt: new Date().toISOString(),
  };
}

// The brand block injected into the build system on EVERY generation so all
// sections share one design language + theme + depth. Identical across a project's
// parallel sample builds, so it caches. The art-direction block carries the
// signature technique and the depth rules; the rest pins identity/voice/accent.
export function brandSystemBlock(b: BrandProfile): string {
  return `# Brand identity — this section is part of ONE product's site (OBEY IT)

Product: ${b.name}. ${b.expanded}

Every section belongs to this single brand: same theme, same accent, same depth.

${artDirectionBlock(b.artDirection, b.accent)}

- ACCENT: ${b.accent} (the single confident accent — buttons, links, key numbers)
- TYPOGRAPHY: ${b.typography}
- VOICE: ${b.voice.join(", ")} — write copy in this register, with real specifics.`;
}

// A compact brand prefix for the templated (content-spec) path, where the layout
// is fixed and only the content JSON is generated.
export function brandSpecInstruction(b: BrandProfile): string {
  return `BRAND CONTEXT — fill content for "${b.name}" (${b.expanded}). Voice: ${b.voice.join(", ")}. Use the brand accent ${b.accent} for ink/number colors where the schema allows. Keep copy concrete and on-brand.\n\n`;
}
