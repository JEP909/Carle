// A structure is an INTENT, not a skeleton. It tells the model what job the card
// does and what elements it usually needs — but never a fixed layout to fill in.
// The model composes the actual layout fresh, in the chosen design language.
//
// structure (intent) × design language (vibe) × brief → a generated card.
// Any structure works with any language, which is why a site built from these
// reads as one coherent thing rather than a pile of templates.

export type Structure = {
  id: string;
  label: string;
  blurb: string;
  /** Guidance on the card's JOB and the elements it tends to need. Describes
   *  intent and content, never a literal layout. */
  intent: string;
  placeholder: string;
};

export const STRUCTURES: Record<string, Structure> = {
  feature: {
    id: "feature",
    label: "Feature card",
    blurb: "Show what the product does — a single capability, made tangible.",
    placeholder:
      "A feature card for an AI support tool that drafts replies and pulls order history.",
    intent: `A FEATURE card. Its job: make one product capability tangible and
desirable. It typically carries an eyebrow/label, a sharp benefit-led headline, a
short supporting line, and — importantly — a *visual that shows the feature*
(a small product mockup, a diagram, an animated detail, a representative UI
fragment), not just an icon. Lead with the benefit, not the mechanism. Compose
the layout to suit this specific feature; do not default to "icon + heading +
two lines".`,
  },
  pricing: {
    id: "pricing",
    label: "Pricing card",
    blurb: "A plan: tier, price, what's included, a clear call to action.",
    placeholder:
      "A Pro plan pricing card at $24/mo with 5 included seats and a 14-day trial CTA.",
    intent: `A PRICING card. Its job: present one plan and make choosing it easy.
It typically carries the tier name, the price with its cadence, a concise
value line, an itemised list of what's included (with crisp affirmative
markers), one primary CTA, and optionally a "most popular" emphasis treatment.
Make the price the clear focal point and the CTA unmissable. Compose a layout
that fits the plan; avoid the generic centred-list template.`,
  },
  stat: {
    id: "stat",
    label: "Stat card",
    blurb: "A metric that proves something — a big number with supporting viz.",
    placeholder:
      "A stat card showing median first-reply time of 2m 41s across 4,800 inboxes.",
    intent: `A STAT card. Its job: prove a claim with a number. It is built
around one big, beautifully-set figure, a label that says what it measures and
its context, and usually a small supporting visualization (a chart, sparkline,
meter, or trend) that makes the number feel real. The figure is the hero; let it
dominate. Compose the layout around the number.`,
  },
};

export function getStructure(id?: string | null): Structure | null {
  if (!id) return null;
  return STRUCTURES[id] ?? null;
}

export const STRUCTURE_MENU = Object.values(STRUCTURES).map(
  ({ id, label, blurb, placeholder }) => ({ id, label, blurb, placeholder }),
);
