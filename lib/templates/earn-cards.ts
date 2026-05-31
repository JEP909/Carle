import { logoCatalog } from "../logos";

// ---------------------------------------------------------------------------
// Deterministic template: the "earn / brand offer cards" layout, CODED once so
// it is pixel-perfect every time. The model never re-derives this layout — it
// only supplies the CONTENT (a small JSON spec); the server renders the exact
// HTML. This is the proven Chexy layout (two-column cards: logo + big number +
// link on the left, a photoreal card render bleeding off the right).
//
// Layout = harnessed code. Content = generated. Logos = looked up. Renders =
// generated. Each token (`{{logo:}}`, `{{image:}}`) is resolved by the finalizer.
// ---------------------------------------------------------------------------

export type EarnCard = {
  logo?: string;     // simple-icons slug, e.g. "aircanada", "americanexpress", "visa"
  brand?: string;    // optional wordmark shown next to the logo, e.g. "AEROPLAN"
  eyebrow?: string;  // e.g. "Earn up to"
  number: string;    // e.g. "7,000" or "5×"
  unit?: string;     // e.g. "Bonus Aeroplan® points*" or "points on travel"
  link?: string;     // e.g. "Explore"
  image: string;     // gpt-image prompt for the card render
};

export type EarnSpec = {
  heading: string;
  sub?: string;
  cta?: string;      // pill button label below the row
  ink?: string;      // heading/number/cta color (hex); default deep indigo
  cards: EarnCard[];
};

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string),
  );
}

// Instruction handed to the model: return ONLY the content as JSON. The layout
// is not the model's concern.
export const EARN_SPEC_INSTRUCTION = `You are filling the CONTENT for a fixed
"ways to earn" card layout. Do NOT write HTML or CSS — return ONLY a JSON object.

Schema:
{
  "heading": string,            // short section title, e.g. "More ways to earn"
  "sub": string,                // one supporting line
  "cta": string,                // pill button label, e.g. "Start earning today"
  "cards": [                    // 2 to 4 cards
    {
      "logo": string,           // a REAL simple-icons slug for the brand (lowercase, no spaces)
      "brand": string,          // OPTIONAL wordmark to show beside the logo (e.g. "AEROPLAN"); omit if the logo already includes the name
      "eyebrow": string,        // e.g. "Earn up to"
      "number": string,         // the headline figure, e.g. "7,000" or "5×"
      "unit": string,           // one short line under the number, e.g. "Bonus Aeroplan® points*"
      "link": string,           // a short link label, e.g. "Explore"
      "image": string           // a vivid prompt for a PHOTOREAL render of the physical card: material, finish, color, angle, motion blur. One isolated card. e.g. "a premium credit card, glossy deep red metallic finish, brushed silver chip, embossed digits, standing tilted toward the viewer, directional motion blur streaking right"
    }
  ]
}

Rules:
- Use real, specific brands and real-sounding numbers. Concrete, confident copy.
- "logo" MUST be a real brand slug. Common ones: ${logoCatalog()}.
- Every card MUST have an "image" prompt — these become real rendered card photos.
- Return ONLY the JSON object, no prose, no code fences.`;

// Best-effort parse of the model's JSON spec.
export function parseEarnSpec(raw: string): EarnSpec | null {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const o = JSON.parse(m[0]);
    if (!o || !Array.isArray(o.cards) || o.cards.length === 0) return null;
    o.cards = o.cards
      .filter((c: unknown) => c && typeof (c as EarnCard).number === "string" && typeof (c as EarnCard).image === "string")
      .slice(0, 4);
    if (!o.cards.length) return null;
    return o as EarnSpec;
  } catch {
    return null;
  }
}

// Render the exact, proven layout from a content spec.
export function renderEarnCards(spec: EarnSpec): string {
  const ink = typeof spec.ink === "string" && /^#[0-9a-fA-F]{3,8}$/.test(spec.ink) ? spec.ink : "#2b1a63";
  const cols = spec.cards.length <= 1 ? 1 : 2;

  const cards = spec.cards
    .map((c) => {
      const slug = (c.logo || "").replace(/[^a-z0-9]/gi, "").toLowerCase();
      const logo = slug ? `{{logo:${slug}:40}}` : "";
      const brandText = c.brand ? `<span class="brandword">${esc(c.brand)}</span>` : "";
      const eyebrow = c.eyebrow ? `<div class="eyebrow">${esc(c.eyebrow)}</div>` : "";
      const unit = c.unit ? `<div class="sub">${esc(c.unit)}</div>` : "";
      const link = c.link ? `<a class="explore" href="#">${esc(c.link)} ${ARROW}</a>` : "";
      return `      <div class="card">
        <div class="left">
          <div class="brand">${logo}${brandText}</div>
          ${eyebrow}
          <div class="num">${esc(c.number)}</div>
          ${unit}
          ${link}
        </div>
        <div class="render">{{image:wide|${esc(c.image)}}}</div>
      </div>`;
    })
    .join("\n");

  const cta = spec.cta
    ? `\n    <div class="cta"><a href="#">${esc(spec.cta)} ${ARROW}</a></div>`
    : "";
  const sub = spec.sub ? `\n      <p>${esc(spec.sub)}</p>` : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root{ --ink:${ink}; --muted:#5b6270; --card:#f4f4f6; }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:#ffffff;}
  body{font-family:"Geist",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;padding:64px 40px 72px;}
  .wrap{max-width:1280px;margin:0 auto;}
  .head{text-align:center;margin-bottom:48px;}
  .head h1{font-size:54px;font-weight:700;letter-spacing:-.022em;line-height:1.05;}
  .head p{font-size:22px;color:var(--muted);margin-top:14px;font-weight:400;}
  .grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:30px;}
  .card{position:relative;overflow:hidden;background:var(--card);border-radius:28px;min-height:300px;display:flex;align-items:center;padding:46px 0 46px 52px;}
  .left{flex:0 0 44%;position:relative;z-index:2;}
  .render{flex:1 1 auto;align-self:stretch;position:relative;margin-right:-48px;z-index:1;}
  .render img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center right;transform:scale(1.28);transform-origin:center right;}
  .brand{min-height:50px;display:flex;align-items:center;gap:12px;margin-bottom:30px;}
  .brandword{font-size:28px;font-weight:800;letter-spacing:-.01em;color:#0a0a0a;}
  .eyebrow{font-size:20px;font-weight:500;color:var(--ink);margin-bottom:8px;}
  .num{font-size:76px;font-weight:700;letter-spacing:-.03em;line-height:.96;margin:0 0 12px;font-variant-numeric:tabular-nums;}
  .sub{font-size:19px;color:var(--muted);font-weight:400;line-height:1.35;}
  .explore{display:inline-flex;align-items:center;gap:10px;margin-top:30px;font-size:19px;font-weight:600;color:var(--ink);text-decoration:none;}
  .explore svg{width:20px;height:20px;}
  .cta{display:flex;justify-content:center;margin-top:52px;}
  .cta a{display:inline-flex;align-items:center;gap:12px;background:var(--ink);color:#fff;font-size:21px;font-weight:600;padding:19px 42px;border-radius:9999px;text-decoration:none;box-shadow:0 14px 30px -12px rgba(43,26,99,.5);}
  .cta a svg{width:20px;height:20px;}
</style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <h1>${esc(spec.heading)}</h1>${sub}
    </div>
    <div class="grid">
${cards}
    </div>${cta}
  </div>
</body>
</html>`;
}
