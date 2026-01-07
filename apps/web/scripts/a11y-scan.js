const { configureAxe, getViolations } = require('axe-playwright');
const { chromium } = require('playwright');

const pages = [
  '/',
  '/trust-score/leaderboard',
  '/admin/analytics',
  '/profile',
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const axe = configureAxe(page);
  let hasViolations = false;

  for (const route of pages) {
    const url = `http://localhost:3000${route}`;
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const violations = await getViolations(axe);
    if (violations.length) {
      hasViolations = true;
      console.log(`\nAccessibility issues on ${url}:`);
      violations.forEach(v => {
        console.log(`- [${v.impact}] ${v.help}: ${v.nodes.length} node(s)`);
        v.nodes.forEach(n => {
          console.log(`  Selector: ${n.target.join(', ')}`);
          console.log(`  Failure: ${n.failureSummary}`);
        });
      });
    } else {
      console.log(`No accessibility issues on ${url}`);
    }
  }

  await browser.close();
  if (hasViolations) process.exit(1);
})();
