'use strict';

/**
 * workflow.gif — extended hero with subtitles (~12-14 s).
 *
 * Same beats as hero.cjs but each step is narrated by a subtitle bar.
 * Use when the viewer needs guidance, e.g. in a blog post.
 *
 * Usage:
 *   node docs/demo/scripts/workflow.cjs --rehearse
 *   node docs/demo/scripts/workflow.cjs
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
const OUT_NAME = 'workflow.webm';
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
      const steps = [
        { label: 'canvas-panel', sel: '[data-testid="canvas-panel"]' },
        { label: 'export-open', sel: '[data-testid="export-open"]' },
      ];
      let allOk = true;
      for (const s of steps) {
        if (!(await ensureVisible(page, s.sel, s.label))) allOk = false;
      }
      console.log(allOk ? '\nREHEARSAL PASSED' : '\nREHEARSAL FAILED');
      process.exit(allOk ? 0 : 1);
    }

    // --- Beat 1: drop photo ---
    await showSubtitle(page, 'Step 1 — Drop a photo');
    await page.waitForTimeout(400);
    await page.locator('[data-testid="bg-upload"]').setInputFiles(PHOTO);
    await page.waitForTimeout(1100);

    // --- Beat 2: add text ---
    await showSubtitle(page, 'Step 2 — Add your headline');
    await moveAndClick(
      page,
      page.getByRole('button', { name: /^add text$/i }).first(),
      'Add Text',
      { postClickDelay: 400 },
    );

    const textInput = page.locator('[data-testid="style-text-input"]');
    await moveAndClick(page, textInput, 'Text input', { postClickDelay: 200 });
    await textInput.fill('');
    await textInput.pressSequentially('Make it MINT', { delay: 70 });
    await page.waitForTimeout(300);

    // Bump font size to 120 (same trick as hero.cjs)
    await page.evaluate(() => {
      const slider = document
        .querySelector('[data-testid="properties-panel"]')
        ?.querySelector('input[type="range"]');
      if (slider) {
        const set = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        ).set;
        set.call(slider, '120');
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        slider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(500);

    const canvas = page
      .locator('[data-testid="canvas-panel"] canvas')
      .first();
    const bbox = await canvas.boundingBox();
    const scale = bbox.width / 1080;
    await page.mouse.click(bbox.x + 900 * scale, bbox.y + 900 * scale);
    await page.waitForTimeout(250);
    await page.mouse.move(bbox.x + 300 * scale, bbox.y + 150 * scale, {
      steps: 10,
    });
    await page.mouse.click(bbox.x + 300 * scale, bbox.y + 150 * scale);
    await page.waitForTimeout(300);

    // --- Beat 3: Smart Contrast ---
    await showSubtitle(page, 'Step 3 — One click for readable color');
    await moveAndClick(
      page,
      page.getByRole('button', { name: /smart contrast/i }),
      'Smart contrast',
      { postClickDelay: 900 },
    );

    // --- Beat 4: Open Export ---
    await showSubtitle(page, 'Step 4 — Choose format and scale');
    await moveAndClick(page, '[data-testid="export-open"]', 'Export', {
      postClickDelay: 800,
    });

    // --- Beat 5: hold on preview, clear subtitle ---
    await showSubtitle(page, 'Step 5 — Saved to downloads');
    await page.waitForTimeout(1200);
    await showSubtitle(page, '');
    await page.waitForTimeout(800);
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
