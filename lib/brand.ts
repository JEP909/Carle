import { anthropic } from "./anthropic";
import { type Palette, paletteText } from "./palette";
import { templateIdFromBrief } from "./templates";

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
  canvasMode: CanvasMode;
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
3. canvasMode: choose like a real brand would for this DOMAIN:
   - "light-monochrome" — white/near-white canvas, slate/zinc ink, hairline borders,
     basically no background gradient; color comes from ONE accent + real content.
     This is the DEFAULT and correct choice for the large majority of products
     (SaaS, fintech, commerce, support, health, marketing). Stripe / Chatbase / Chexy
     are all fundamentally this.
   - "dark-glass" — ONLY for genuinely developer/infrastructure/security products
     where dark is native (think Linear, Vercel). And even then it is RESTRAINED:
     near-black canvas, ONE accent used sparingly, subtle 1px borders, NO purple
     wash, NO glow gradients. If unsure, do NOT pick this.
   - "saturated-field" — for a bold consumer/fintech brand: a LIGHT page where ONE
     section/panel commits to a single saturated brand color (like Chexy's indigo
     panel). NOT a fully dark or gradient page.
   When in doubt, choose light-monochrome.
4. palette: {field, accents, ink, mood}. For light-monochrome, FIELD is white/near-white
   (e.g. "#ffffff" or "#fafafa"), ink is slate/zinc, and there is exactly ONE accent.
   Pick a real, brand-appropriate accent for the domain — and AVOID defaulting to
   purple/violet unless the brand is genuinely purple. Good accents: a confident blue,
   indigo, teal/emerald, warm coral, amber, or near-black. Tasteful and specific,
   never rainbow, never neon-on-dark.
5. accent: a single canonical accent HEX used sparingly for buttons/links/key numbers.
6. typography: 1-2 lines (weights, scale, feel). House font is Geist.
7. voice: 3-5 brand voice traits.
8. sections: 3-5 sections to showcase the brand. Each {label, brief}, brief = a
   concrete, brand-aware description a designer would build from. Favor variety
   (hero, feature cards, metrics/stats, pricing, integrations/logos). Be specific.

Respond ONLY as JSON:
{"name","expanded","canvasMode","palette":{"field","accents","ink","mood"},"accent","typography","voice":[],"sections":[{"label","brief"}]}`;

const FALLBACK_SECTIONS: Array<{ label: string; brief: string }> = [
  { label: "Hero", brief: "a hero feature section introducing the product with a bold headline, a one-line value proposition, a primary call-to-action, and a believable product UI scene." },
  { label: "Features", brief: "a two-card feature section, each card with a small product-UI diorama, a feature title, and a two-line description." },
  { label: "Metrics", brief: "a stats/metrics section with 3-4 big numbers and short labels showing the product's impact, with a small trend chart." },
];

function rid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function asCanvasMode(v: unknown): CanvasMode {
  return v === "dark-glass" || v === "saturated-field" ? v : "light-monochrome";
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
      max_tokens: 1200,
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
  const canvasMode = asCanvasMode(parsed.canvasMode);
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
    canvasMode,
    palette,
    typography: String(parsed.typography ?? "Geist throughout; bold tight headlines, muted body, tabular numbers."),
    voice,
    accent: typeof parsed.accent === "string" && /^#[0-9a-fA-F]{3,8}$/.test(parsed.accent) ? parsed.accent : "#635bff",
    sections: planSections(rawSections, canvasMode),
    createdAt: new Date().toISOString(),
  };
}

const MODE_RULES: Record<CanvasMode, string> = {
  "light-monochrome": "white/near-white canvas (#ffffff–#fafafa), zinc/slate ink (#09090b headings, #52525b body, #a1a1aa meta), hairline borders (#e4e4e7), almost NO background gradient. Color enters through ONE accent and real product UI. This is the Stripe/Chatbase/Chexy look — clean and restrained.",
  "dark-glass": "RESTRAINED dark (Linear/Vercel), not a glowy AI template. Near-black canvas (#0a0b0d–#101114), subtle 1px borders (rgba(255,255,255,.08)), ink #f4f4f5 / #a1a1aa, ONE accent used sparingly on a button or key number. ABSOLUTELY NO purple/violet wash, NO glow gradients, NO color mesh — the surface stays calm and dark, color is a single deliberate touch.",
  "saturated-field": "a LIGHT page where ONE section/panel commits to a single saturated brand color (like Chexy's indigo panel) with floating WHITE sub-panels on it; the rest of the page stays white/clean. NOT a fully dark or gradient page.",
};

// The brand block injected into the build system on EVERY generation so all
// sections share one design language. Identical across parallel samples (caches).
export function brandSystemBlock(b: BrandProfile): string {
  return `# Brand identity — this section is part of ONE product's site (OBEY IT)

Product: ${b.name}. ${b.expanded}

Every section you build belongs to this single brand. Do NOT invent a new color
world per section — commit to the SAME canvas mode and palette throughout.

- CANVAS MODE: ${b.canvasMode} — ${MODE_RULES[b.canvasMode]}
- ACCENT: ${b.accent} (use for primary buttons, links, and key numbers)
- TYPOGRAPHY: ${b.typography}
- VOICE: ${b.voice.join(", ")} — write copy in this register, with real specifics.

${paletteText(b.palette)}`;
}

// A compact brand prefix for the templated (content-spec) path, where the layout
// is fixed and only the content JSON is generated.
export function brandSpecInstruction(b: BrandProfile): string {
  return `BRAND CONTEXT — fill content for "${b.name}" (${b.expanded}). Voice: ${b.voice.join(", ")}. Use the brand accent ${b.accent} for ink/number colors where the schema allows. Keep copy concrete and on-brand.\n\n`;
}
