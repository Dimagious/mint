'use strict';

/**
 * palette.gif — ⌘K command palette demo (~7-9 s).
 *
 * Show two distinct commands routed through the palette: (a) "exp" →
 * open Export dialog, (b) "story" → switch canvas preset. Headless
 * Playwright doesn't reliably deliver Meta+K to window keydown, so we
 * open via the overflow menu first time and via shortcut second time;
 * if shortcut fails we fall back to overflow again.
 *
 * Usage:
 *   node docs/demo/scripts/palette.cjs --rehearse
 *   node docs/demo/scripts/palette.cjs
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const {
  injectCursor,
  injectSubtitleBar,
  showSubtitle,
  moveAndClick,
  ensureVisible,
  hideClutter,
  freshSession,
} = require('./lib.cjs');

const BASE_URL = process.env.MINT_BASE_URL || 'http://localhost:3000/';
const OUT_DIR = path.resolve(__dirname, '../raw');
const OUT_NAME = 'palette.webm';
const REHEARSAL = process.argv.includes('--rehearse');
const VIEWPORT = { width: 1280, height: 720 };

async function openPalette(page) {
  // Try keyboard first; if the palette doesn't appear in 800 ms, fall
  // back to the overflow menu (Playwright headless doesn't always
  // route Meta+K to the window keydown listener).
  await page.keyboard.press('ControlOrMeta+k');
  const visible = await page
    .locator('[data-testid="command-palette"]')
    .isVisible({ timeout: 800 })
    .catch(() => false);
  if (visible) return;
  await moveAndClick(
    page,
    page.getByRole('button', { name: /more actions/i }),
    'More actions',
    { postClickDelay: 300 },
  );
  await moveAndClick(
    page,
    page.getByRole('menuitem', { name: /command palette/i }),
    'Command palette menu item',
    { postClickDelay: 300 },
  );
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    ...(REHEARSAL ? {} : { recordVideo: { dir: OUT_DIR, size: VIEWPORT } }),
  });
  const page = await context.newPage();

  try {
    // Clear LS before mount so the empty-state shows + autosave doesn't race
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
    await injectCursor(page);
    await injectSubtitleBar(page);
    await hideClutter(page);

    if (REHEARSAL) {
      const okMore = await ensureVisible(
        page,
        page.getByRole('button', { name: /more actions/i }),
        'More actions button',
      );
      console.log(okMore ? '\nREHEARSAL PASSED' : '\nREHEARSAL FAILED');
      process.exit(okMore ? 0 : 1);
    }

    // Add a text layer first so the canvas is non-empty when we switch
    // presets — visually more obvious that the canvas resized.
    await moveAndClick(
      page,
      page.getByRole('button', { name: /^add text$/i }).first(),
      'Add Text',
      { postClickDelay: 400 },
    );
    const textInput = page.locator('[data-testid="style-text-input"]');
    await moveAndClick(page, textInput, 'Text input', { postClickDelay: 200 });
    await textInput.fill('');
    await textInput.pressSequentially('Hello', { delay: 60 });
    await page.waitForTimeout(400);

    // --- Beat 1: open palette, run Export ---
    await showSubtitle(page, 'Press ⌘K — find any command');
    await page.waitForTimeout(400);
    await openPalette(page);
    await page.waitForTimeout(300);

    await showSubtitle(page, 'Type a few letters');
    await page
      .locator('[data-testid="command-palette-input"]')
      .pressSequentially('exp', { delay: 110 });
    await page.waitForTimeout(700);

    await showSubtitle(page, 'Enter to run');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1200);

    // Close the Export dialog
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // --- Beat 2: open palette again, switch preset to Story ---
    await openPalette(page);
    await page.waitForTimeout(300);
    await page
      .locator('[data-testid="command-palette-input"]')
      .pressSequentially('story', { delay: 110 });
    await page.waitForTimeout(700);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);

    await showSubtitle(page, 'Same shortcut. Everything.');
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
