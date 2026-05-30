// Hand-build the dense "Content Calendar" interior graphic anchor — a real
// weekly scheduler fragment at the density/depth of the Stan reference.
const fs = require("fs");

const day = (l, sel) =>
  `<span class="day${sel ? " sel" : ""}">${l}</span>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Content Calendar</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Geist",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#fff;display:grid;place-items:center;padding:56px 32px;-webkit-font-smoothing:antialiased}
.card{width:420px}
/* grainy warm stage like the Stan reference */
.stage{position:relative;border-radius:22px;padding:30px 28px 34px;overflow:hidden;
  background:linear-gradient(150deg,#e9ebf0,#dfe2ea 60%,#d7dae3)}
.stage::after{content:"";position:absolute;inset:0;opacity:.5;mix-blend-mode:overlay;pointer-events:none;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='80' height='80' filter='url(%23n)' opacity='0.6'/></svg>")}
/* the floating scheduler panel */
.sched{position:relative;z-index:1;background:#fff;border-radius:16px;padding:20px 20px 18px;
  box-shadow:0 1px 2px rgba(20,24,40,.05),0 18px 38px -16px rgba(20,24,40,.34),inset 0 1px 0 rgba(255,255,255,.8)}
.row1{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.row1 .t{font-size:17px;font-weight:600;color:#15181f;letter-spacing:-.01em}
.pill{font-size:12.5px;font-weight:500;color:#5b6072;background:#f1f2f5;border:1px solid #e6e8ee;border-radius:999px;padding:5px 12px}
.days{display:flex;gap:7px;margin-bottom:20px}
.day{flex:1;height:38px;display:grid;place-items:center;border-radius:10px;font-size:14px;font-weight:500;color:#3a3f4b;
  background:#f6f7f9;box-shadow:inset 0 0 0 1px rgba(20,24,40,.05)}
.day.sel{background:#e8f7ee;color:#1f9d57;box-shadow:inset 0 0 0 1px #bce8cf}
.meta{display:flex;flex-direction:column;gap:12px;margin-bottom:20px}
.mrow{display:flex;align-items:center;justify-content:space-between;font-size:14px}
.mrow .k{color:#8a8f9c}
.mrow .v{color:#15181f;font-weight:500;display:flex;align-items:center;gap:8px}
.who{display:inline-flex;align-items:center;gap:6px;background:#fae3e1;color:#c0392b;font-size:12.5px;font-weight:500;padding:3px 9px 3px 4px;border-radius:999px}
.who .av{width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#e85d4a,#c0392b);display:inline-block}
.btns{display:flex;gap:10px}
.btn{flex:1;height:42px;border-radius:11px;font-family:inherit;font-size:14px;font-weight:500;cursor:pointer}
.btn.cancel{background:#f1f2f5;border:1px solid #e6e8ee;color:#3a3f4b}
.btn.save{background:#15181f;border:0;color:#fff;font-weight:600;box-shadow:0 6px 16px -6px rgba(20,24,40,.5)}
.copy{padding:26px 4px 0}
.copy h2{font-size:25px;font-weight:600;letter-spacing:-.02em;line-height:1.15;color:#0a0a0a}
.copy p{font-size:15.5px;line-height:1.5;color:#5b6472;margin-top:12px;max-width:36ch}
</style></head><body>
<article class="card">
  <div class="stage">
    <div class="sched">
      <div class="row1"><span class="t">Repeat Weekly</span><span class="pill">Every week</span></div>
      <div class="days">${day("S")}${day("S",true)}${day("M")}${day("T")}${day("W")}${day("T")}${day("F")}</div>
      <div class="meta">
        <div class="mrow"><span class="k">Start</span><span class="v"><span class="who"><span class="av"></span>Lewis Hamilton</span></span></div>
        <div class="mrow"><span class="k">Created at</span><span class="v">Sun, May 12 · 04:25 GMT+7</span></div>
      </div>
      <div class="btns"><button class="btn cancel">Cancel</button><button class="btn save">Save schedule</button></div>
    </div>
  </div>
  <div class="copy">
    <h2>Schedule once, post on repeat</h2>
    <p>Set a cadence and let every channel publish itself — no reminders, no manual reposting.</p>
  </div>
</article>
</body></html>`;

fs.writeFileSync("reference/feature-scheduler.html", html);
console.log("wrote reference/feature-scheduler.html");
