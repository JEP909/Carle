import { logoCatalog } from "../logos";

// ---------------------------------------------------------------------------
// Deterministic template: the Chatbase-style "platform features" section — a
// big header + two feature cards, each with a CODED diorama on top and a
// title/description below. Card A is an LLM constellation (a black app hub with a
// gradient underglow, dotted connectors fanning to a grid of real brand-logo
// tiles). Card B is an agent-builder UI (dotted orbit, toolbar, avatar dots, a
// "Create agent" underglow button, a "Reply with AI" pill, a toggle).
//
// The model supplies ONLY content (heading, copy, the hub letter, which logos,
// the button labels). The intricate layout never drifts because it is code.
// ---------------------------------------------------------------------------

export type PlatformSpec = {
  heading: string;
  sub?: string;
  hub?: string;        // 1-2 char app mark, e.g. "C"
  logos?: string[];    // simple-icons slugs for the constellation tiles
  leftTitle: string;
  leftDesc: string;
  rightTitle: string;
  rightDesc: string;
  cta?: string;        // agent button label, default "Create agent"
  reply?: string;      // pill label, default "Reply with AI"
};

function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string),
  );
}

export const PLATFORM_SPEC_INSTRUCTION = `You are filling CONTENT for a fixed
"platform features" section (a header + two feature cards). Do NOT write HTML/CSS
— return ONLY a JSON object.

Schema:
{
  "heading": string,        // big section title, e.g. "The complete platform for AI support agents"
  "sub": string,            // one or two supporting sentences
  "hub": string,            // a 1-character app mark for the brand, e.g. "C"
  "logos": string[],        // 4-6 REAL simple-icons slugs for provider tiles (lowercase). e.g. ["anthropic","google","mistralai","huggingface"]
  "leftTitle": string,      // first feature title, e.g. "Purpose-built for LLMs"
  "leftDesc": string,       // 1-2 line description
  "rightTitle": string,     // second feature title, e.g. "Designed for simplicity"
  "rightDesc": string,      // 1-2 line description
  "cta": string,            // agent button label, e.g. "Create agent"
  "reply": string           // small pill label, e.g. "Reply with AI"
}

Rules:
- "logos" MUST be real brand slugs (the first feature is about model providers /
  integrations). Common ones: ${logoCatalog()}.
- Confident, concrete copy. Return ONLY the JSON object, no prose, no fences.`;

export function parsePlatformSpec(raw: string): PlatformSpec | null {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const o = JSON.parse(m[0]);
    if (!o || typeof o.heading !== "string" || typeof o.leftTitle !== "string") return null;
    return o as PlatformSpec;
  } catch {
    return null;
  }
}

const SKY = `<div class="tile sky"></div>`;
const EMPTY = `<div class="tile empty"></div>`;

export function renderPlatformFeatures(spec: PlatformSpec): string {
  const hub = esc((spec.hub || "C").slice(0, 2));
  const cta = esc(spec.cta || "Create agent");
  const reply = esc(spec.reply || "Reply with AI");
  const slugs = (Array.isArray(spec.logos) ? spec.logos : [])
    .map((s) => String(s).replace(/[^a-z0-9]/gi, "").toLowerCase())
    .filter(Boolean)
    .slice(0, 4);

  // 8-cell grid: a couple of decorative sky tiles, the real logos, the rest empty.
  const logoTiles = slugs.map((s) => `<div class="tile">{{logo:${s}:46}}</div>`);
  const cells: string[] = [SKY, logoTiles[0] || EMPTY, logoTiles[1] || EMPTY, EMPTY, EMPTY, logoTiles[2] || EMPTY, logoTiles[3] || EMPTY, SKY];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--ink:#0a0a0a;--muted:#6b7280;--line:#ececf0;}
  body{font-family:"Geist",-apple-system,sans-serif;background:#fbfbfc;color:var(--ink);-webkit-font-smoothing:antialiased;padding:56px 48px 64px;}
  .wrap{max-width:1180px;margin:0 auto;}
  .head{display:flex;justify-content:space-between;align-items:flex-start;gap:48px;margin-bottom:36px;}
  .head h1{font-size:50px;font-weight:700;letter-spacing:-.025em;line-height:1.04;max-width:620px;}
  .head p{font-size:19px;color:var(--muted);line-height:1.5;max-width:340px;margin-top:8px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:26px;}
  .card{background:#fff;border:1px solid var(--line);border-radius:26px;padding:34px 34px 32px;display:flex;flex-direction:column;min-height:560px;box-shadow:0 1px 2px rgba(16,24,40,.04);}
  .dio{height:392px;position:relative;margin-bottom:26px;}
  .ftitle{font-size:24px;font-weight:700;letter-spacing:-.01em;margin-bottom:10px;}
  .fdesc{font-size:17px;color:var(--muted);line-height:1.5;max-width:380px;}
  .hub{position:absolute;top:24px;left:50%;transform:translateX(-50%);width:88px;height:88px;border-radius:22px;background:#0a0a0a;display:flex;align-items:center;justify-content:center;z-index:3;}
  .hub span{color:#fff;font-size:46px;font-weight:800;line-height:1;}
  .hub::after{content:"";position:absolute;left:10px;right:10px;bottom:-7px;height:20px;border-radius:14px;background:linear-gradient(90deg,#ff9a3d,#ff5db1,#b66bff);filter:blur(11px);opacity:.85;z-index:-1;}
  .conn{position:absolute;top:0;left:0;width:100%;height:230px;z-index:1;pointer-events:none;}
  .tiles{position:absolute;top:170px;left:0;right:0;display:grid;grid-template-columns:repeat(4,1fr);gap:15px;z-index:2;}
  .tile{position:relative;aspect-ratio:1/1;border-radius:20px;background:#fff;border:1px solid var(--line);box-shadow:0 8px 20px -14px rgba(16,24,40,.35);display:flex;align-items:center;justify-content:center;}
  .tile.empty{box-shadow:none;border-color:#f1f1f4;}
  .tile.sky{background:linear-gradient(160deg,#5db4ff,#2f7bf6);border:none;box-shadow:0 12px 26px -14px rgba(47,123,246,.6);}
  .tile svg,.tile img{width:46px;height:46px;}
  .orbit{position:absolute;top:50%;left:50%;width:330px;height:330px;transform:translate(-50%,-50%);border-radius:50%;border:2px dotted #d8d8e0;z-index:0;}
  .float{position:absolute;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 10px 24px -14px rgba(16,24,40,.25);display:flex;align-items:center;}
  .toolbar{top:34px;left:24px;padding:11px 16px;gap:18px;color:#6b7280;}
  .toolbar b,.toolbar i,.toolbar u,.toolbar s{font-size:16px;font-weight:600;}
  .dots{top:60px;right:18px;padding:12px 16px;}
  .dots i{width:22px;height:22px;border-radius:50%;display:inline-block;margin-left:-7px;border:2px solid #fff;}
  .dots i:first-child{margin-left:0;background:#1f7a4d;}
  .dots i:nth-child(2){background:#6fd34a;}
  .dots i:nth-child(3){background:#d6e84a;}
  .reply{bottom:60px;left:20px;padding:13px 18px;gap:9px;font-size:16px;font-weight:600;color:#0a0a0a;}
  .reply .spark{width:16px;height:16px;}
  .ctaBtn{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:4;background:#0a0a0a;color:#fff;font-size:19px;font-weight:600;padding:17px 30px;border-radius:14px;}
  .ctaBtn::after{content:"";position:absolute;left:8px;right:8px;bottom:-7px;height:20px;border-radius:14px;background:linear-gradient(90deg,#ff9a3d,#ff5db1,#b66bff);filter:blur(11px);opacity:.85;z-index:-1;}
  .toggle{position:absolute;bottom:74px;right:28px;width:52px;height:30px;border-radius:9999px;background:#46c46a;border:none;box-shadow:0 4px 10px -4px rgba(70,196,106,.6);z-index:4;}
  .toggle i{position:absolute;top:3px;right:3px;width:24px;height:24px;border-radius:50%;background:#fff;}
</style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <h1>${esc(spec.heading)}</h1>
      <p>${esc(spec.sub || "")}</p>
    </div>
    <div class="grid">
      <div class="card">
        <div class="dio">
          <div class="hub"><span>${hub}</span></div>
          <svg class="conn" viewBox="0 0 520 230" preserveAspectRatio="none" fill="none" stroke="#c9c9d2" stroke-width="2" stroke-dasharray="2 5" stroke-linecap="round">
            <path d="M260 118 V150 Q260 168 200 168 T70 178"/>
            <path d="M260 118 V172"/>
            <path d="M260 118 V150 Q260 168 320 168 T450 178"/>
          </svg>
          <div class="tiles">${cells.join("")}</div>
        </div>
        <div class="ftitle">${esc(spec.leftTitle)}</div>
        <div class="fdesc">${esc(spec.leftDesc)}</div>
      </div>
      <div class="card">
        <div class="dio">
          <div class="orbit"></div>
          <div class="float toolbar"><b>B</b><i>I</i><u>U</u><s>S</s></div>
          <div class="float dots"><i></i><i></i><i></i></div>
          <div class="ctaBtn">${cta}</div>
          <div class="float reply"><svg class="spark" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z"/></svg>${reply}</div>
          <button class="toggle"><i></i></button>
        </div>
        <div class="ftitle">${esc(spec.rightTitle)}</div>
        <div class="fdesc">${esc(spec.rightDesc)}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
