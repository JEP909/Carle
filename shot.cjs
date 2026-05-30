const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: "/tmp/carle-home.png", fullPage: false });
  await browser.close();
  console.log("screenshot saved");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
