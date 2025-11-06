const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
  await page.goto('http://localhost:3000');
  await page.screenshot({ path: '/home/jules/verification/fab-icon-final.png' });
  await browser.close();
})();
