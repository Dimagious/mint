'use strict';

/**
 * hero.gif — main loop for the README header (8-12 s).
 *
 * Flow: drop photo → press T (add text) → double-click layer → type
 * "Make it MINT" → Smart Contrast → open Export → hold on preview.
 *
 * Usage:
 *   node docs/demo/scripts/hero.cjs --rehearse
 *   node docs/demo/scripts/hero.cjs
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const {
  injectCursor,
  injectSubtitleBar,
  moveAndClick,
  ensureVisible,
  hideClutter,
  freshSession,
} = require('./lib.cjs');

const BASE_URL = process.env.MINT_BASE_URL || 'http://localhost:3000/';
const PHOTO = path.resolve(__dirname, '../../design/screenshots-src/coffee.jpg');
const OUT_DIR = path.resolve(__dirname, '../raw');
const OUT_NAME = 'hero.webm';
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
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await freshSession(page);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await injectCursor(page);
    await injectSubtitleBar(page);
    await hideClutter(page);

    if (REHEARSAL) {
      const visibleSteps = [
        { label: 'empty-state Add text CTA', sel: '[data-testid="empty-cta-add-text"]' },
        { label: 'canvas-panel', sel: '[data-testid="canvas-panel"]' },
        { label: 'export-open button', sel: '[data-testid="export-open"]' },
      ];
      let allOk = true;
      for (const s of visibleSteps) {
        if (!(await ensureVisible(page, s.sel, s.label))) allOk = false;
      }
      // Hidden file input — check presence in DOM, not visibility
      const fileInputCount = await page
        .locator('[data-testid="bg-upload"]')
        .count();
      if (fileInputCount > 0) {
        console.log('REHEARSAL OK: "bg-upload (hidden file input present)"');
      } else {
        console.error('REHEARSAL FAIL: "bg-upload" input not in DOM');
        allOk = false;
      }
      console.log(allOk ? '\nREHEARSAL PASSED' : '\nREHEARSAL FAILED');
      process.exit(allOk ? 0 : 1);
    }

    // --- Beat 1: drop the photo ---
    await page.waitForTimeout(500);
    await page.locator('[data-testid="bg-upload"]').setInputFiles(PHOTO);
    await page.waitForTimeout(1100);

    // --- Beat 2: add text layer via the toolbar button ---
    const addTextBtn = page
      .getByRole('button', { name: /^add text$/i })
      .first();
    await moveAndClick(page, addTextBtn, 'Add Text', { postClickDelay: 500 });

    // --- Beat 3: type headline via the Style panel input ---
    const textInput = page.locator('[data-testid="style-text-input"]');
    await moveAndClick(page, textInput, 'Text input', { postClickDelay: 200 });
    await textInput.fill('');
    await textInput.pressSequentially('Make it MINT', { delay: 70 });
    await page.waitForTimeout(400);

    // --- Beat 3b: bump font size to 120 for more impact ---
    // The Size control has a + button next to the numeric readout. Clicking
    // it bumps the size by a step; instead, set the slider value directly.
    // The font-size slider is the only MUI slider above the Weight section.
    await page.evaluate(() => {
      const slider = document
        .querySelector('[data-testid="properties-panel"]')
        ?.querySelector('input[type="range"]');
      if (slider) {
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        ).set;
        nativeSetter.call(slider, '120');
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        slider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(700);

    // Click the canvas in a non-layer spot to defocus the input
    const canvas = page
      .locator('[data-testid="canvas-panel"] canvas')
      .first();
    const bbox = await canvas.boundingBox();
    const scale = bbox.width / 1080;
    await page.mouse.click(bbox.x + 900 * scale, bbox.y + 900 * scale);
    await page.waitForTimeout(300);

    // Re-select the text layer so Smart Contrast applies to it
    const layerCenter = {
      x: bbox.x + 300 * scale,
      y: bbox.y + 150 * scale,
    };
    await page.mouse.move(layerCenter.x, layerCenter.y, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.click(layerCenter.x, layerCenter.y);
    await page.waitForTimeout(300);

    // --- Beat 4: Smart Contrast ---
    const smartContrast = page.getByRole('button', {
      name: /smart contrast/i,
    });
    await moveAndClick(page, smartContrast, 'Smart contrast', {
      postClickDelay: 900,
    });

    // --- Beat 5: Export ---
    await moveAndClick(
      page,
      '[data-testid="export-open"]',
      'Export',
      { postClickDelay: 1200 },
    );

    // --- Beat 6: hold on the export preview ---
    await page.waitForTimeout(1500);
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
          /* original is fine to leave behind */
        }
        console.log(`Video saved: ${dest}`);
      } catch (e) {
        console.error('ERROR: Failed to copy video:', e.message);
        console.error('  Source:', src);
        console.error('  Destination:', dest);
      }
    }
    await browser.close();
  }
})();
