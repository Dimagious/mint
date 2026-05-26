'use strict';

/**
 * share.gif — share-by-URL round trip (~12 s, single window).
 *
 * Compose a design → click Share link → toast appears → simulate
 * opening the same link in a fresh session → confirm dialog → same
 * design loads minus the photo (as the share strips it on purpose).
 *
 * Usage:
 *   node docs/demo/scripts/share.cjs --rehearse
 *   node docs/demo/scripts/share.cjs
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
const PHOTO = path.resolve(__dirname, '../../design/screenshots-src/coffee.jpg');
const OUT_DIR = path.resolve(__dirname, '../raw');
const OUT_NAME = 'share.webm';
const REHEARSAL = process.argv.includes('--rehearse');
const VIEWPORT = { width: 1280, height: 720 };

(async () => {
  if (!fs.existsSync(PHOTO)) {
    console.error(`PHOTO not found: ${PHOTO}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    permissions: ['clipboard-read', 'clipboard-write'],
    ...(REHEARSAL ? {} : { recordVideo: { dir: OUT_DIR, size: VIEWPORT } }),
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

    // --- Compose: drop photo + add text ---
    await page.locator('[data-testid="bg-upload"]').setInputFiles(PHOTO);
    await page.waitForTimeout(900);

    await moveAndClick(
      page,
      page.getByRole('button', { name: /^add text$/i }).first(),
      'Add Text',
      { postClickDelay: 400 },
    );
    const textInput = page.locator('[data-testid="style-text-input"]');
    await moveAndClick(page, textInput, 'Text input', { postClickDelay: 200 });
    await textInput.fill('');
    await textInput.pressSequentially('Coffee O\'Clock', { delay: 55 });
    await page.waitForTimeout(400);

    // Bump size for visibility
    await page.evaluate(() => {
      const slider = document
        .querySelector('[data-testid="properties-panel"]')
        ?.querySelector('input[type="range"]');
      if (slider) {
        const set = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        ).set;
        set.call(slider, '110');
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        slider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(500);

    // --- Beat 1: open More → click Share link ---
    await showSubtitle(page, 'Click Share link');
    await moveAndClick(
      page,
      page.getByRole('button', { name: /more actions/i }),
      'More actions',
      { postClickDelay: 400 },
    );
    await moveAndClick(
      page,
      '[data-testid="toolbar-share"]',
      'Share link',
      { postClickDelay: 1200 },
    );

    // --- Beat 2: read URL from clipboard, simulate opening in a new session ---
    const sharedUrl = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    await showSubtitle(page, 'Recipient opens it');
    await page.waitForTimeout(600);

    // Simulate the recipient: navigate to the share URL. They still have
    // the photo+text in their local autosave, so the confirm dialog
    // appears — that's part of the story (MINT doesn't clobber work).
    // page.goto with same-path-different-hash doesn't reload the React
    // app — force a real reload so the hash-hydration effect runs.
    await page.goto(sharedUrl);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await injectCursor(page);
    await injectSubtitleBar(page);
    await hideClutter(page);
    await page.waitForTimeout(800);

    // --- Beat 3: confirm the open ---
    const confirmBtn = page.locator('[data-testid="share-confirm-open"]');
    if (await confirmBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await moveAndClick(page, confirmBtn, 'Open shared', {
        postClickDelay: 1200,
      });
    }

    // --- Beat 4: hold on the loaded design — text remains, photo gone ---
    await showSubtitle(page, 'Same design — drop your own photo');
    await page.waitForTimeout(1800);
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
