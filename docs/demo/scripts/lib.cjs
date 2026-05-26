'use strict';

/**
 * Shared helpers for MINT demo recordings. Implements the contract
 * described in `.claude/ui-demo/SKILL.md`:
 *   injectCursor — SVG arrow that tracks mousemove
 *   injectSubtitleBar / showSubtitle — bottom subtitle overlay
 *   moveAndClick — visible click with cursor travel + post-click pause
 *   typeSlowly — character-by-character typing
 *   ensureVisible — rehearsal helper that logs and fails loudly
 *
 * Used by docs/demo/scripts/*.cjs.
 */

async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    cursor.style.cssText = `
      position: fixed; z-index: 999999; pointer-events: none;
      width: 24px; height: 24px;
      transition: left 0.1s, top 0.1s;
      filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
      left: 0; top: 0;
    `;
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  });
}

async function injectSubtitleBar(page, opts = {}) {
  const { fontSize = 16 } = opts;
  await page.evaluate((fs) => {
    if (document.getElementById('demo-subtitle')) return;
    const bar = document.createElement('div');
    bar.id = 'demo-subtitle';
    bar.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 999998;
      text-align: center; padding: 12px 24px;
      background: rgba(0, 0, 0, 0.75);
      color: white; font-family: -apple-system, "Segoe UI", sans-serif;
      font-size: ${fs}px; font-weight: 500; letter-spacing: 0.3px;
      transition: opacity 0.3s;
      pointer-events: none;
    `;
    bar.textContent = '';
    bar.style.opacity = '0';
    document.body.appendChild(bar);
  }, fontSize);
}

async function showSubtitle(page, text) {
  await page.evaluate((t) => {
    const bar = document.getElementById('demo-subtitle');
    if (!bar) return;
    if (t) {
      bar.textContent = t;
      bar.style.opacity = '1';
    } else {
      bar.style.opacity = '0';
    }
  }, text);
  if (text) await page.waitForTimeout(800);
}

/** Move cursor to the element, then click. Returns true on success. */
async function moveAndClick(page, locator, label, opts = {}) {
  const { postClickDelay = 800, ...clickOpts } = opts;
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: moveAndClick skipped — "${label}" not visible`);
    return false;
  }
  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await el.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
      await page.waitForTimeout(400);
    }
    await el.click(clickOpts);
  } catch (e) {
    console.error(`WARNING: moveAndClick failed on "${label}": ${e.message}`);
    return false;
  }
  await page.waitForTimeout(postClickDelay);
  return true;
}

async function typeSlowly(page, locator, text, label, charDelay = 35) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: typeSlowly skipped — "${label}" not visible`);
    return false;
  }
  await moveAndClick(page, el, label, { postClickDelay: 300 });
  await el.fill('');
  await el.pressSequentially(text, { delay: charDelay });
  await page.waitForTimeout(500);
  return true;
}

async function ensureVisible(page, locator, label) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`REHEARSAL FAIL: "${label}" not found`);
    const found = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll('button, input, select, textarea, a, [data-testid]'),
      )
        .filter((el) => el.offsetParent !== null)
        .map((el) => {
          const t = el.tagName;
          const tid = el.getAttribute('data-testid');
          const txt = el.textContent?.trim().substring(0, 30) || '';
          return `${t}${tid ? `[testid="${tid}"]` : ''} "${txt}"`;
        })
        .slice(0, 40)
        .join('\n  ');
    });
    console.error('  Visible elements:\n  ' + found);
    return false;
  }
  console.log(`REHEARSAL OK: "${label}"`);
  return true;
}

/** Hide the AutosaveBadge for cleaner frames. */
async function hideClutter(page) {
  await page.addStyleTag({
    content: `
      [data-testid="autosave-badge"]{display:none!important}
    `,
  });
}

/** Clear persisted state so the empty-state always shows. */
async function freshSession(page) {
  await page.evaluate(() => {
    try {
      localStorage.removeItem('mint-project');
      localStorage.removeItem('mint-autosave');
    } catch (_) {
      /* ignore */
    }
  });
}

module.exports = {
  injectCursor,
  injectSubtitleBar,
  showSubtitle,
  moveAndClick,
  typeSlowly,
  ensureVisible,
  hideClutter,
  freshSession,
};
