const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(160000);
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  await page.fill(
    "textarea",
    "A pricing card for a small-batch coffee roaster — warm, tactile, confident.",
  );
  await page.click("button.accent");

  // Streaming done when the build button flips back to "Rebuild" (phase ready).
  // Pass empty arg so the options object isn't mistaken for the page-function arg.
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll("button.accent")).some((b) =>
        /rebuild/i.test(b.textContent || ""),
      ),
    undefined,
    { timeout: 160000, polling: 500 },
  );
  await page.waitForTimeout(1500);

  await page.screenshot({ path: "/tmp/carle-generated.png" });
  await browser.close();
  console.log("saved");
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
