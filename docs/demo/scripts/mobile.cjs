'use strict';

/**
 * mobile.gif — iPhone 14 Pro viewport tour (~10-12 s).
 *
 * Beats: empty-state → tap Add text → open Style drawer → tap a preset
 * color → close drawer → tap Export. Touch emulation enabled.
 *
 * Usage:
 *   node docs/demo/scripts/mobile.cjs --rehearse
 *   node docs/demo/scripts/mobile.cjs
 */

const { chromium, devices } = require('playwright');
const path = require('path');
const fs = require('fs');
const {
  injectSubtitleBar,
  showSubtitle,
  ensureVisible,
  hideClutter,
} = require('./lib.cjs');

const BASE_URL = process.env.MINT_BASE_URL || 'http://localhost:3000/';
const OUT_DIR = path.resolve(__dirname, '../raw');
const OUT_NAME = 'mobile.webm';
const REHEARSAL = process.argv.includes('--rehearse');
// iPhone 14 Pro portrait
const VIEWPORT = { width: 390, height: 844 };

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: devices['iPhone 14 Pro']?.userAgent,
    // Record at logical viewport size (not multiplied by deviceScaleFactor)
    // — Playwright already captures at the rendered CSS-pixel resolution.
    ...(REHEARSAL
      ? {}
      : {
          recordVideo: { dir: OUT_DIR, size: VIEWPORT },
        }),
  });
  const page = await context.newPage();

  try {
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('mint-project');
        localStorage.removeItem('mint-autosave');
      } catch (_) {
        /* ignore */
      }
    });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    // Mobile-specific: larger subtitle so it's readable on a phone-sized GIF
    await injectSubtitleBar(page, { fontSize: 22 });
    await hideClutter(page);

    if (REHEARSAL) {
      const okEmpty = await ensureVisible(
        page,
        '[data-testid="empty-cta-add-text"]',
        'empty-cta-add-text',
      );
      const okMobBar = await ensureVisible(
        page,
        '[data-testid="mobile-properties-button"]',
        'mobile-properties-button',
      );
      console.log(okEmpty && okMobBar ? '\nREHEARSAL PASSED' : '\nREHEARSAL FAILED');
      process.exit(okEmpty && okMobBar ? 0 : 1);
    }

    // --- Beat 1: empty state ---
    await showSubtitle(page, 'MINT on your phone');
    await page.waitForTimeout(1300);

    // --- Beat 2: tap Add text ---
    await showSubtitle(page, 'Tap to add text');
    await page
      .locator('[data-testid="empty-cta-add-text"]')
      .tap()
      .catch(async () => {
        // Fallback for environments where tap dispatch fails
        await page.locator('[data-testid="empty-cta-add-text"]').click();
      });
    await page.waitForTimeout(900);

    // --- Beat 3: open Style drawer ---
    await showSubtitle(page, 'Style drawer slides up');
    await page
      .locator('[data-testid="mobile-properties-button"]')
      .tap()
      .catch(async () => {
        await page.locator('[data-testid="mobile-properties-button"]').click();
      });
    await page.waitForTimeout(1200);

    // --- Beat 4: tap a preset color via the COLOR row in the drawer ---
    // The first colored swatch in the open ColorChip popover is a known
    // preset; if we can't find one easily, just close the drawer.
    await showSubtitle(page, 'Style your headline');
    // open the colour chip
    const colourChip = page
      .locator('[data-testid="properties-panel-mobile"]')
      .locator('[data-testid="color-chip"]')
      .first();
    if (await colourChip.isVisible().catch(() => false)) {
      await colourChip.tap().catch(() => colourChip.click());
      await page.waitForTimeout(800);
      // Tap one of the preset swatches that pops up. They are buttons
      // inside the colour picker popover; the first visible one will do.
      const preset = page
        .getByRole('button', { name: /color preset|preset color|^#/i })
        .first();
      if (await preset.isVisible().catch(() => false)) {
        await preset.tap().catch(() => preset.click());
        await page.waitForTimeout(800);
      }
      // Close the popover by tapping the canvas
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(500);
    }

    // --- Beat 5: close the drawer ---
    await showSubtitle(page, 'Swipe down to dismiss');
    // Try the close button first, fall back to a downward drag at the top
    const closeBtn = page.getByRole('button', { name: /close/i }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.tap().catch(() => closeBtn.click());
    } else {
      // Simulated swipe down at the top of the drawer
      const drawer = page.locator('[data-testid="properties-panel-mobile"]');
      const dbox = await drawer.boundingBox().catch(() => null);
      if (dbox) {
        await page.mouse.move(dbox.x + dbox.width / 2, dbox.y + 20);
        await page.mouse.down();
        await page.mouse.move(dbox.x + dbox.width / 2, dbox.y + 350, {
          steps: 25,
        });
        await page.mouse.up();
      }
    }
    await page.waitForTimeout(1200);

    await showSubtitle(page, '');
    await page.waitForTimeout(500);
  } catch (err) {
    console.error('DEMO ERROR:', err.message);
    console.error(err.stack);
  } finally {
    await context.close();
    const video = page.video();
    if (video) {
      const src = await video.path();
      const dest = path.join(OUT_DIR, OUT_NAME);
      try {
        fs.copyFileSync(src, dest);
        try {
          fs.unlinkSync(src);
        } catch (_) {
          /* ignore */
        }
        console.log(`Video saved: ${dest}`);
      } catch (e) {
        console.error('ERROR: Failed to copy video:', e.message);
      }
    }
    await browser.close();
  }
})();
