'use strict';

/**
 * snap.gif — Figma-style smart guides demo (~8-10 s).
 *
 * Seeds the canvas with two text layers via a `#mint=…` share URL, then
 * drags one across three snap targets (anchor's left edge, anchor's
 * center, canvas center) so the viewer sees the mint-green guides fire
 * three times.
 *
 * Usage:
 *   node docs/demo/scripts/snap.cjs --rehearse
 *   node docs/demo/scripts/snap.cjs
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const {
  injectCursor,
  injectSubtitleBar,
  showSubtitle,
  ensureVisible,
  hideClutter,
  freshSession,
} = require('./lib.cjs');

const BASE_URL = process.env.MINT_BASE_URL || 'http://localhost:3000/';
const OUT_DIR = path.resolve(__dirname, '../raw');
const OUT_NAME = 'snap.webm';
const REHEARSAL = process.argv.includes('--rehearse');
const VIEWPORT = { width: 1280, height: 720 };

const DEFAULT_TEXT_STYLE = {
  fontFamily: 'Arial',
  fontSize: 88,
  fontWeight: 700,
  color: '#ffffff',
  opacity: 1,
  textAlign: 'left',
  lineHeight: 1.1,
  letterSpacing: 0,
  shadow: null,
  stroke: null,
  background: null,
};

function buildSeedHash() {
  // Two layers wide apart so the user can drag one across snap zones.
  // anchor: x=200, w=320 → left edge 200, center 360, right 520
  // mover:  x=700 → starts in the lower-right quadrant
  const doc = {
    presetId: 'square',
    background: { dataUrl: null, fit: 'cover', color: '#0e1f17' },
    layers: [
      {
        id: 'layer-anchor',
        text: 'Anchor',
        x: 200,
        y: 200,
        width: 320,
        height: 110,
        rotation: 0,
        style: { ...DEFAULT_TEXT_STYLE, color: '#2f9f7a' },
        visible: true,
        locked: false,
      },
      {
        id: 'layer-mover',
        text: 'Drag me',
        x: 700,
        y: 720,
        // Narrower than anchor so the three snap moments land at three
        // distinct x's instead of collapsing onto one (same-width pairs
        // snap-to-left and snap-to-center at the exact same x).
        width: 200,
        height: 110,
        rotation: 0,
        style: { ...DEFAULT_TEXT_STYLE, color: '#ffffff' },
        visible: true,
        locked: false,
      },
    ],
  };
  const payload = { v: 1, doc };
  const bin = new TextEncoder().encode(JSON.stringify(payload));
  let s = '';
  for (let i = 0; i < bin.length; i++) s += String.fromCharCode(bin[i]);
  return Buffer.from(s, 'binary')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
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
    const seed = buildSeedHash();
    // Clear persisted state *before* the app mounts. A two-step
    // localStorage clear + page.goto(hash) doesn't work — same-path
    // hash navigation skips remount, so the share-hydration effect
    // never re-runs and the seed is silently ignored.
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('mint-project');
        localStorage.removeItem('mint-autosave');
      } catch (_) {
        /* ignore */
      }
    });
    await page.goto(`${BASE_URL}#mint=${seed}`);
    await page.waitForLoadState('networkidle');
    // give the hydration effect + fabric a beat to render the layers
    await page.waitForTimeout(1200);
    await injectCursor(page);
    await injectSubtitleBar(page);
    await hideClutter(page);

    if (REHEARSAL) {
      const allOk = await ensureVisible(
        page,
        '[data-testid="canvas-panel"]',
        'canvas-panel',
      );
      // Also verify two layers loaded
      const layerCount = await page
        .locator('[data-testid^="layer-item-"]')
        .count();
      console.log(`Layers loaded: ${layerCount} (expected 2)`);
      const ok = allOk && layerCount === 2;
      console.log(ok ? '\nREHEARSAL PASSED' : '\nREHEARSAL FAILED');
      process.exit(ok ? 0 : 1);
    }

    const canvas = page
      .locator('[data-testid="canvas-panel"] canvas')
      .first();
    const bbox = await canvas.boundingBox();
    const scale = bbox.width / 1080;
    const at = (x, y) => ({ x: bbox.x + x * scale, y: bbox.y + y * scale });

    // Mover layer: x=700, y=720, w=200, h=110 → center (800, 775).
    // Anchor:      x=200, y=200, w=320, h=110 → left=200, center=360, right=520.
    // Three distinct snap x's for mover.center:
    //   - 300 (mover.left = anchor.left = 200)   → "Snap to left edges"
    //   - 360 (mover.center = anchor.center)     → "Snap to centers"
    //   - 540 (mover.center = canvas center)     → "Snap to canvas center"
    const pickup = at(800, 775);

    // --- Beat 1: pan over the two layers, then approach the mover ---
    await showSubtitle(page, 'Two layers. Aligned where?');
    await page.mouse.move(at(360, 255).x, at(360, 255).y, { steps: 15 });
    await page.waitForTimeout(600);
    await page.mouse.move(pickup.x, pickup.y, { steps: 15 });
    await page.waitForTimeout(300);

    await page.mouse.down();

    // --- Beat 2: snap to left edges (mover.center = 300) ---
    await showSubtitle(page, 'Snap to left edges');
    const stopA = at(300, 775);
    await page.mouse.move(stopA.x, stopA.y, { steps: 35 });
    await page.waitForTimeout(900);

    // --- Beat 3: snap to centers (mover.center = 360) ---
    await showSubtitle(page, 'Snap to centers');
    const stopB = at(360, 480);
    await page.mouse.move(stopB.x, stopB.y, { steps: 30 });
    await page.waitForTimeout(900);

    // --- Beat 4: snap to canvas center (mover.center = 540) ---
    await showSubtitle(page, 'Snap to canvas center');
    const stopC = at(540, 540);
    await page.mouse.move(stopC.x, stopC.y, { steps: 30 });
    await page.waitForTimeout(1000);

    await page.mouse.up();
    await showSubtitle(page, '');
    await page.waitForTimeout(900);
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
