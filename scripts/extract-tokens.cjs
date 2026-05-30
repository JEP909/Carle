// Extract REAL computed design tokens from live reference sites, so the
// knowledge files can be grounded in concrete specifics (actual fonts, hex
// colors, radii, shadows, type scale) rather than guesses.
//
// Usage: node scripts/extract-tokens.cjs   ->   writes /tmp/tokens.json
//
// NOTE: this does NOT work inside the Claude Code cloud sandbox — outbound HTTPS
// is intercepted by a TLS proxy whose CA the bundled Chromium rejects
// (ERR_CERT_AUTHORITY_INVALID), even with --ignore-certificate-errors. Run it on
// a normal machine/network to get real tokens. Inside the sandbox, ground the
// knowledge files from user-provided screenshots instead.
const { chromium } = require("playwright");

const SITES = [
  { id: "stripe", url: "https://stripe.com" },
  { id: "chatbase", url: "https://www.chatbase.co" },
  { id: "vercel", url: "https://vercel.com" },
  { id: "linear", url: "https://linear.app" },
];

function analyze() {
  const seen = (sel) => Array.from(document.querySelectorAll(sel));
  const cs = (el) => getComputedStyle(el);
  const tally = (arr) => {
    const m = {};
    for (const v of arr) if (v) m[v] = (m[v] || 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8);
  };

  const bodyBg = cs(document.body).backgroundColor;
  const htmlBg = cs(document.documentElement).backgroundColor;

  // Headings: family, size, weight, tracking
  const heads = ["h1", "h2", "h3"].flatMap((t) =>
    seen(t).slice(0, 3).map((el) => {
      const c = cs(el);
      return {
        tag: t,
        font: c.fontFamily.split(",")[0].replace(/["']/g, ""),
        size: c.fontSize,
        weight: c.fontWeight,
        spacing: c.letterSpacing,
        lh: c.lineHeight,
        color: c.color,
      };
    }),
  );

  // Body text
  const ps = seen("p").slice(0, 10).map((el) => {
    const c = cs(el);
    return { font: c.fontFamily.split(",")[0].replace(/["']/g, ""), size: c.fontSize, weight: c.fontWeight, lh: c.lineHeight, color: c.color };
  });

  // Buttons / links styled as buttons
  const btns = seen("button, a").filter((el) => {
    const c = cs(el);
    return c.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(c.paddingLeft) > 8;
  }).slice(0, 8).map((el) => {
    const c = cs(el);
    return { bg: c.backgroundColor, color: c.color, radius: c.borderRadius, padding: `${c.paddingTop} ${c.paddingRight}`, weight: c.fontWeight, shadow: c.boxShadow.slice(0, 60) };
  });

  // Cards: divs with radius + shadow or border
  const cards = seen("div, section, article").filter((el) => {
    const c = cs(el);
    return parseFloat(c.borderRadius) >= 6 && (c.boxShadow !== "none" || c.borderWidth !== "0px");
  }).slice(0, 12).map((el) => {
    const c = cs(el);
    return { radius: c.borderRadius, shadow: c.boxShadow.slice(0, 80), border: c.border.slice(0, 40), bg: c.backgroundColor };
  });

  return {
    backgrounds: { body: bodyBg, html: htmlBg },
    headingFonts: tally(heads.map((h) => h.font)),
    headings: heads,
    bodyFonts: tally(ps.map((p) => p.font)),
    bodySample: ps.slice(0, 3),
    buttons: btns,
    radii: tally(cards.map((c) => c.radius)),
    shadows: tally(cards.map((c) => c.shadow)),
    cardSample: cards.slice(0, 4),
  };
}

(async () => {
  const browser = await chromium.launch({ args: ["--ignore-certificate-errors"] });
  const out = {};
  for (const s of SITES) {
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
      await page.goto(s.url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(2500);
      await page.waitForTimeout(1500);
      out[s.id] = await page.evaluate(analyze);
      await page.close();
      console.error("ok " + s.id);
    } catch (e) {
      out[s.id] = { error: e.message };
      console.error("FAIL " + s.id + ": " + e.message);
    }
  }
  require("fs").writeFileSync("/tmp/tokens.json", JSON.stringify(out, null, 2));
  console.error("written /tmp/tokens.json");
})().catch((e) => { console.error(e); process.exit(1); });
