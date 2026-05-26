'use strict';

/**
 * bg-drag.gif — drag the background photo inside the canvas (~8 s).
 *
 * Simplified scenario without corner-zoom — the corner handle for a
 * cover-fitted photo lies outside the visible canvas DOM element so
 * Playwright can't click it directly. Two beats are enough: drag the
 * photo, then hit Reset position.
 *
 * Usage:
 *   node docs/demo/scripts/bg-drag.cjs --rehearse
 *   node docs/demo/scripts/bg-drag.cjs
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
} = require('./lib.cjs');

const BASE_URL = process.env.MINT_BASE_URL || 'http://localhost:3000/';
const PHOTO = path.resolve(__dirname, '../../design/screenshots-src/coffee.jpg');
const OUT_DIR = path.resolve(__dirname, '../raw');
const OUT_NAME = 'bg-drag.webm';
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
      const ok = await ensureVisible(
        page,
        '[data-testid="canvas-panel"]',
        'canvas-panel',
      );
      console.log(ok ? '\nREHEARSAL PASSED' : '\nREHEARSAL FAILED');
      process.exit(ok ? 0 : 1);
    }

    // Drop the cover-fit photo
    await page.locator('[data-testid="bg-upload"]').setInputFiles(PHOTO);
    await page.waitForTimeout(1200);

    // Force cover fit (the default is contain; cover gives the user
    // room to drag without showing letterbox).
    await moveAndClick(
      page,
      page.getByRole('button', { name: /^crop$|^fit$/i }).first(),
      'Toggle Crop/Fit',
      { postClickDelay: 600 },
    );

    const canvas = page
      .locator('[data-testid="canvas-panel"] canvas')
      .first();
    const bbox = await canvas.boundingBox();
    const scale = bbox.width / 1080;
    const at = (x, y) => ({ x: bbox.x + x * scale, y: bbox.y + y * scale });

    // --- Beat 1: select + drag the bg ---
    await showSubtitle(page, 'Reframe the photo on the canvas');
    const start = at(540, 540);
    await page.mouse.move(start.x, start.y, { steps: 10 });
    await page.waitForTimeout(400);

    await showSubtitle(page, 'Drag to reposition');
    await page.mouse.down();
    // Drag down-left so the upper portion of the image enters the frame
    const stop = at(420, 660);
    await page.mouse.move(stop.x, stop.y, { steps: 40 });
    await page.waitForTimeout(600);
    await page.mouse.up();
    await page.waitForTimeout(900);

    // --- Beat 2: hit Reset position ---
    await showSubtitle(page, 'Reset to auto-fit');
    await moveAndClick(
      page,
      '[data-testid="bg-reset-position"]',
      'Reset position',
      { postClickDelay: 1200 },
    );

    await showSubtitle(page, '');
    await page.waitForTimeout(600);
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
