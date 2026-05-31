import { MODEL } from "./anthropic";

// Model tiers — pick cheaper or pricier models per task. The agent (a project) can
// carry a default tier; any request can override it. The dominant cost is the
// BUILD model (the big free-build generations), so that's where the tiers diverge
// most: economy/standard build on Sonnet, premium builds on Opus.
//
// We reference the premium build/judge model via anthropic.ts's MODEL export
// (Opus by default, overridable with CARLE_BUILD_MODEL) rather than hardcoding it.

export type Tier = "economy" | "standard" | "premium";
export type Role = "build" | "spec" | "aux" | "judge";

const SONNET = "claude-sonnet-4-6";
const HAIKU = "claude-haiku-4-5-20251001";

const TIERS: Record<Tier, Record<Role, string>> = {
  // Cheapest: Sonnet builds, Haiku for the small auxiliary/spec calls.
  economy: { build: SONNET, spec: HAIKU, aux: HAIKU, judge: SONNET },
  // Balanced default: everything on Sonnet — much cheaper than Opus, still strong
  // now that the harness (art directions, depth/motion guardrails, templates)
  // carries most of the quality.
  standard: { build: SONNET, spec: SONNET, aux: SONNET, judge: SONNET },
  // Best: Opus for the build and the visual judge (the taste-heavy calls).
  premium: { build: MODEL, spec: SONNET, aux: SONNET, judge: MODEL },
};

export const TIER_LABELS: Record<Tier, string> = {
  economy: "Economy — cheapest (Sonnet build, Haiku helpers)",
  standard: "Standard — balanced (all Sonnet)",
  premium: "Premium — best quality (Opus build + judge)",
};

export function isTier(v: unknown): v is Tier {
  return v === "economy" || v === "standard" || v === "premium";
}

// The global default tier, overridable per-request. Defaults to "standard" (Sonnet
// build) — a large cost cut from always-Opus, with the guardrails holding quality.
export function defaultTier(): Tier {
  const t = process.env.CARLE_TIER;
  return isTier(t) ? t : "standard";
}

export function modelFor(role: Role, tier: Tier = defaultTier()): string {
  return TIERS[tier][role];
}
