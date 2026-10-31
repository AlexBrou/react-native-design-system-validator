// Runs every rendered rule against every screen, in every viewport defined in
// design-rules/playwright.config.js. One test per (viewport, screen, rule).
// Failing tests attach a screenshot with the offending elements outlined.
//
// The screens run through react-native-web, so what is measured is the web
// rendering of the React Native layout (same flexbox model, same Paper styles).

import { test, expect } from '@playwright/test';
import { screens } from '../../src/screens/registry.js';
import { m3 } from '../m3.js';
import { createHelpers } from './helpers.js';
import { rules } from './index.js';

const helpersSrc = createHelpers.toString();

function runRuleInPage({ id, checkSrc, helpersSrc, m3 }) {
  window.__designM3 = m3;
  const h = new Function(`return (${helpersSrc})`)()();
  const check = new Function(`return ({ ${checkSrc} }).check`)();
  document.querySelectorAll('[data-design-violation]').forEach((el) => el.removeAttribute('data-design-violation'));
  const ignored = (el) => el.closest(`[data-design-ignore~="${id}"]`);
  const seen = new Set();
  return check(m3, h)
    .filter((v) => !ignored(v.el) && !seen.has(v.message) && seen.add(v.message))
    .map((v) => {
      v.el.setAttribute('data-design-violation', '');
      // Set by design-rules/babel-plugin-source.cjs. Elements rendered inside a
      // library component report the nearest JSX element that we wrote. Ones
      // rendered in a portal (a Dialog's surface) have no such ancestor, so
      // they report the first JSX element inside them.
      const tagged = v.el.closest('[data-source]') ?? v.el.querySelector('[data-source]');
      const source = tagged?.getAttribute('data-source') ?? null;
      return { message: v.message, source };
    });
}

const HIGHLIGHT_CSS = '[data-design-violation] { outline: 3px solid #e00 !important; outline-offset: 1px; }';

for (const screen of screens) {
  test.describe(screen.id, () => {
    for (const rule of rules) {
      test(rule.id, async ({ page }, testInfo) => {
        await page.goto(`/#/${screen.id}`);
        await page.locator(`[data-screen="${screen.id}"]`).waitFor({ state: 'attached', timeout: 110_000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(800); // let dialogs (JS-animated in react-native-web) settle

        const violations = await page.evaluate(runRuleInPage, {
          id: rule.id,
          checkSrc: rule.check.toString(),
          helpersSrc,
          m3,
        });

        const lines = violations.map((v) => (v.source ? `${v.message}\n      at ${v.source}` : v.message));
        if (violations.length) {
          for (const v of violations) testInfo.annotations.push({ type: v.source ?? 'unknown source', description: v.message });
          await page.addStyleTag({ content: HIGHLIGHT_CSS });
          await testInfo.attach(`${rule.id}.png`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
        }
        expect(lines.length, `${rule.description}\n  • ${lines.join('\n  • ')}\n`).toBe(0);
      });
    }
  });
}
