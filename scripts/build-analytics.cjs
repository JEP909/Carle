// Hand-build the dense "Advanced Analytics" interior graphic anchor — platform
// performance cards with REAL logos and a restrained, professional palette.
const fs = require("fs");
const L = require("../lib/logos.json");

// Real brand logo, inline (authentic geometry + brand hex), in a white tile.
const logoTile = (name) => {
  const l = L[name];
  return `<span class="pi"><svg viewBox="0 0 24 24" width="18" height="18" fill="#${l.hex}"><path d="${l.path}"/></svg></span>`;
};

const pill = (txt, cls = "") => `<span class="stat ${cls}">${txt}</span>`;

const platform = (logo, name, pills) => `
      <div class="pcard">
        <div class="ph">${logoTile(logo)}<span class="pn">${name}</span></div>
        <div class="pills">${pills}</div>
      </div>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Advanced Analytics</title>
<style>
:root{
  --ink:#1a1f2e;--ink-2:#5b6472;--ink-3:#9097a4;
  --line:#e9ecf1;--surface:#fff;--accent:#5b5bf0;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Geist",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#fff;display:grid;place-items:center;padding:56px 32px;-webkit-font-smoothing:antialiased}
.card{width:460px}
.stage{position:relative;border-radius:22px;padding:22px;overflow:hidden;background:linear-gradient(160deg,#f5f6f9,#eef0f4)}
.panel{position:relative;z-index:1;background:var(--surface);border-radius:16px;padding:18px;
  box-shadow:0 1px 2px rgba(26,31,46,.05),0 18px 38px -18px rgba(26,31,46,.26),inset 0 1px 0 rgba(255,255,255,.9)}
.ptop{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.toggle{display:flex;background:#f2f3f6;border-radius:9px;padding:3px}
.toggle span{font-size:13px;font-weight:500;color:var(--ink-3);padding:5px 13px;border-radius:7px}
.toggle span.on{background:#fff;color:var(--ink);box-shadow:0 1px 2px rgba(26,31,46,.12)}
.avs{display:flex;align-items:center;gap:9px}
.avstack{display:flex}
.avstack .a{width:26px;height:26px;border-radius:50%;border:2px solid #fff;margin-left:-9px;background:#c9cdd6}
.avstack .a:first-child{margin-left:0;background:#aeb4c0}
.avstack .a:nth-child(2){background:#c0c5d0}
.invite{font-size:13px;font-weight:500;color:var(--ink-2)}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.pcard{border:1px solid var(--line);border-radius:12px;padding:14px}
.ph{display:flex;align-items:center;gap:10px;margin-bottom:13px}
.pi{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;background:#fff;
  box-shadow:0 1px 2px rgba(26,31,46,.08),inset 0 0 0 1px var(--line)}
.pn{font-size:14.5px;font-weight:600;color:var(--ink);letter-spacing:-.01em}
.pills{display:flex;flex-direction:column;gap:8px}
.stat{font-size:12.5px;font-weight:500;color:var(--ink-2);display:flex;align-items:center;justify-content:space-between}
.stat b{color:var(--ink);font-weight:600;font-variant-numeric:tabular-nums}
.stat.up b{color:#1f9d57}
.divline{height:1px;background:var(--line);margin:2px 0}
.trend{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:11px;padding:7px 7px 7px 14px;background:#fcfcfd}
.trend input{flex:1;border:0;outline:0;font-family:inherit;font-size:14px;color:var(--ink);background:transparent}
.trend input::placeholder{color:var(--ink-3)}
.gen{background:var(--accent);color:#fff;border:0;font-family:inherit;font-size:13px;font-weight:600;padding:10px 15px;border-radius:8px;cursor:pointer;
  box-shadow:0 1px 2px rgba(26,31,46,.12),0 6px 14px -6px rgba(91,91,240,.5)}
.copy{padding:24px 4px 0}
.copy h2{font-size:25px;font-weight:600;letter-spacing:-.02em;line-height:1.15;color:#0a0a0a}
.copy p{font-size:15.5px;line-height:1.5;color:var(--ink-2);margin-top:12px;max-width:38ch}
</style></head><body>
<article class="card">
  <div class="stage">
    <div class="panel">
      <div class="ptop">
        <div class="toggle"><span class="on">List</span><span>Table</span></div>
        <div class="avs"><div class="avstack"><span class="a"></span><span class="a"></span><span class="a"></span></div><span class="invite">+ Invite</span></div>
      </div>
      <div class="cards">
        ${platform("youtube", "YouTube", pill('Views <b>302.1k</b>','up')+pill('Videos <b>112</b>')+pill('Avg watch <b>41%</b>'))}
        ${platform("tiktok", "TikTok", pill('Views <b>100.2k</b>','up')+pill('Comments <b>+130</b>','up')+pill('Posts <b>38</b>'))}
      </div>
      <div class="trend">
        <input placeholder="Describe a trend to remix…" />
        <button class="gen">Generate similar</button>
      </div>
    </div>
  </div>
  <div class="copy">
    <h2>See what's working, then make more of it</h2>
    <p>Track every platform in one view and spin up the next post from your best-performing trends.</p>
  </div>
</article>
</body></html>`;

fs.writeFileSync("reference/feature-analytics.html", html);
console.log("wrote reference/feature-analytics.html");
