/**
 * Renders the fixed design layer of the share cards (wash, artwork, logo, web address)
 * to src/assets/og/background.jpg. Only needed when the card design changes.
 *   node scripts/og/render-background.cjs
 * Needs Playwright (preinstalled in Claude's workspace; or `npx playwright install chromium`).
 */
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.goto("file://" + path.resolve(__dirname, "card-background.html"));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.resolve(__dirname, "../../src/assets/og/background.jpg"), type: "jpeg", quality: 90 });
  await b.close();
  console.log("wrote src/assets/og/background.jpg");
})();
