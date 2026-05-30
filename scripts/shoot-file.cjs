const { chromium } = require("playwright");
const path = process.argv[2] || "reference/holographic-card.html";
const out = process.argv[3] || "/tmp/ref-card.png";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 760, height: 720 },
    deviceScaleFactor: 2,
  });
  await page.goto("file://" + require("path").resolve(path), {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: out });
  await browser.close();
  console.log("saved", out);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
