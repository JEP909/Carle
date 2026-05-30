// Hand-build the depth-rich omnichannel anchor: real brand logos (bundled,
// offline), layered floating panels with real shadows, a saturated field.
const fs = require("fs");
const L = require("../lib/logos.json");

const ico = (k, size = 28) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="#${L[k].hex}"><path d="${L[k].path}"/></svg>`;

// Slack isn't in the bundled set; draw its known 4-color glyph by hand.
const slack = `<svg viewBox="0 0 24 24" width="28" height="28">
  <path fill="#36C5F0" d="M5.0 15.2a2.1 2.1 0 1 1-2.1-2.1h2.1zM6.1 15.2a2.1 2.1 0 0 1 4.2 0v5.3a2.1 2.1 0 1 1-4.2 0z"/>
  <path fill="#2EB67D" d="M8.8 5.0a2.1 2.1 0 1 1 2.1-2.1v2.1zM8.8 6.1a2.1 2.1 0 0 1 0 4.2H3.5a2.1 2.1 0 1 1 0-4.2z"/>
  <path fill="#ECB22E" d="M19.0 8.8a2.1 2.1 0 1 1 2.1 2.1h-2.1zM17.9 8.8a2.1 2.1 0 0 1-4.2 0V3.5a2.1 2.1 0 1 1 4.2 0z"/>
  <path fill="#E01E5A" d="M15.2 19.0a2.1 2.1 0 1 1-2.1 2.1v-2.1zM15.2 17.9a2.1 2.1 0 0 1 0-4.2h5.3a2.1 2.1 0 1 1 0 4.2z"/>
</svg>`;

const tile = (glyph, label) =>
  `        <div class="tile">${glyph}<span>${label}</span></div>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Omnichannel</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Geist",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#fff;display:grid;place-items:center;padding:56px 32px;-webkit-font-smoothing:antialiased}
.card{width:400px}
.stage{position:relative;border-radius:24px;padding:34px 30px 30px;overflow:hidden;
  background:
    radial-gradient(120% 80% at 18% 0%, #b483f2 0%, transparent 55%),
    radial-gradient(120% 90% at 92% 26%, #7a3fd6 0%, transparent 60%),
    radial-gradient(140% 130% at 50% 120%, #d2b0f7 0%, transparent 55%),
    linear-gradient(160deg,#9a5fe6,#7b3fd4 70%,#8c54e0);
  box-shadow:0 24px 56px -22px rgba(108,60,200,.6)}
.stage::before{content:"";position:absolute;inset:0;opacity:.45;mix-blend-mode:soft-light;
  background:radial-gradient(55% 40% at 28% 16%,#fff,transparent 62%),radial-gradient(45% 38% at 82% 72%,#fff,transparent 62%)}
.grid-panel{position:relative;z-index:1;background:#fff;border-radius:18px;padding:16px;
  display:grid;grid-template-columns:1fr 1fr;gap:14px;
  box-shadow:0 2px 4px rgba(40,20,80,.10),0 24px 46px -18px rgba(40,20,80,.5),inset 0 1px 0 rgba(255,255,255,.7)}
.tile{background:#f5f5f8;border-radius:12px;padding:20px 12px 14px;display:flex;flex-direction:column;align-items:center;gap:11px;
  box-shadow:inset 0 0 0 1px rgba(20,20,40,.045)}
.tile span{font-size:14px;font-weight:500;color:#1a1230}
.pill{position:relative;z-index:1;margin:22px auto 0;width:fit-content;display:flex;align-items:center;gap:11px;
  background:#15101f;color:#fff;font-size:14px;font-weight:500;padding:11px 18px 11px 12px;border-radius:999px;
  box-shadow:0 14px 28px -10px rgba(20,0,40,.55)}
.pill .dots{display:flex}
.pill .d{width:24px;height:24px;border-radius:50%;background:#fff;display:grid;place-items:center;margin-left:-8px;box-shadow:0 1px 3px rgba(0,0,0,.35)}
.pill .d:first-child{margin-left:0}
.pill .d svg{width:13px;height:13px;display:block}
.copy{padding:26px 4px 0}
.copy h2{font-size:25px;font-weight:600;letter-spacing:-.02em;line-height:1.15;color:#0a0a0a}
.copy p{font-size:15.5px;line-height:1.5;color:#5b6472;margin-top:12px;max-width:34ch}
</style></head><body>
<article class="card">
  <div class="stage">
    <div class="grid-panel">
${tile(`<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#e0457b" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/></svg>`, "Web widget")}
${tile(slack, "Slack")}
${tile(ico("whatsapp"), "WhatsApp")}
${tile(ico("messenger"), "Messenger")}
    </div>
  </div>
  <div class="pill">
    <span class="dots">
      <span class="d"><svg viewBox="0 0 24 24" fill="#15101f"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.5 2.4-7.4L2 9.6h7.6z"/></svg></span>
      <span class="d"><svg viewBox="0 0 24 24" fill="none" stroke="#15101f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3a5 5 0 0 1 0 8H8M8 21a5 5 0 0 1 0-8h8"/></svg></span>
    </span>
    Channels connected
  </div>
  <div class="copy">
    <h2>Works across every channel your customers use</h2>
    <p>Connect your AI agent to website chat, WhatsApp, Slack, and Messenger in a few clicks.</p>
  </div>
</article>
</body></html>`;

fs.writeFileSync("reference/feature-omnichannel.html", html);
console.log("wrote reference/feature-omnichannel.html");
