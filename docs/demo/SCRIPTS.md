# MINT — GIF demo scripts

Шесть мини-сценариев под GIF-плейсхолдеры в `README.md` / `README.ru.md`.

Каждый сценарий заточен под пайплайн `.claude/ui-demo` (Playwright + cursor / subtitle overlay) с пост-обработкой через `.claude/video-editing` (FFmpeg `mp4 → gif`).

> **Общие правила**
>
> - **Браузер**: Chromium headless, `viewport: 1280×720` для desktop, `390×844` (iPhone 14 Pro) для mobile.
> - **Запись**: WebM от Playwright → FFmpeg `palette` + `paletteuse` → GIF, 20 fps, `loop=0`.
> - **Курсор и subtitle** — инжектятся после **каждой** навигации (`injectCursor` + `injectSubtitleBar`).
> - **Кликам предшествует движение** через `moveAndClick(page, locator, label)`.
> - **Текст печатается** через `typeSlowly(page, locator, text, label, 35)`.
> - **Subtitle**: ≤ 60 символов, формат `"Step N — Action"`, очищать в длинных паузах.
> - **Подготовка стартовой страницы**: перед каждым прогоном `localStorage.removeItem('mint-project')` + `localStorage.removeItem('mint-autosave')` чтобы вылез empty-state без напоминаний из прошлых сессий. Дальше — `page.reload()`.
> - **Test-ассеты**: единое фото `docs/demo/assets/test-photo.jpg` (1600 × 1067, ~200 KB JPEG, тёплый закатный пейзаж — гарантирует контрастный кадр под Smart Contrast).
> - **`prefers-reduced-motion`**: не выставлять — нам нужна та же анимация, что увидит реальный пользователь.

---

## 1. `hero.gif` — главная демка под шапку

**Длительность**: 8–12 с (loop). **Файл**: `docs/demo/hero.gif`. **Viewport**: 1280 × 720.

Сжатая версия workflow-демки для шапки README. Зрителю нужно за 8 секунд понять, что MINT — это «фото + текст + экспорт за полминуты». Без subtitle — пусть продукт говорит сам.

### Beat sheet

1. **Pre-roll (0.5 с)** — белый кадр / лого MINT, плавный fade-in в редактор.
2. **Drop a photo (1.5 с)** — фото появляется как фон, auto-fit.
3. **Add text (2.5 с)** — text-layer ставится по центру, печатается заголовок «Make it MINT».
4. **Smart Contrast (1.5 с)** — клик → текст становится белым с обводкой.
5. **Export (2 с)** — открывается диалог экспорта с превью, лёгкое hold на «PNG, 1×, ~120 KB».
6. **Post-roll (1 с)** — fade-out на финальный кадр.

### Playwright steps

| #   | Action                                        | Selector / API                                                                | Pause after |
| --- | --------------------------------------------- | ----------------------------------------------------------------------------- | ----------- |
| 1   | `page.goto(BASE_URL)`                         | —                                                                             | 1 200 ms    |
| 2   | Загрузить фото через скрытый file input       | `page.locator('[data-testid="bg-upload"]').setInputFiles('…/test-photo.jpg')` | 1 200 ms    |
| 3   | Empty-state → Add text CTA                    | `[data-testid="empty-cta-add-text"]`                                          | 800 ms      |
| 4   | Двойной клик по слою → войти в редактирование | layer textbox via canvas coords (use `fabric` testid pattern from app.test)   | 400 ms      |
| 5   | Напечатать заголовок                          | `typeSlowly(textbox, 'Make it MINT', 'headline', 60)`                         | 800 ms      |
| 6   | Открыть Properties → клик «Smart contrast»    | `page.getByRole('button', { name: /smart contrast/i })`                       | 1 200 ms    |
| 7   | Открыть Export                                | `[data-testid="export-open"]`                                                 | 1 000 ms    |
| 8   | Hold на превью                                | —                                                                             | 2 000 ms    |

### Subtitles

Без subtitle. Если автор позже захочет — единственная фраза в конце: `"Open. Drop. Type. Export."` (~2 с в финале).

### Gotchas

- Сделать снимок canvas после Smart Contrast полезно: `await page.locator('[data-testid="canvas-panel"]').screenshot()` — пригодится как fallback-still для соцсетей.
- Скрыть AutosaveBadge для чистоты кадра: `page.addStyleTag({ content: '[data-testid="autosave-badge"]{display:none!important}' })` после `injectCursor`.

---

## 2. `workflow.gif` — drop, type, export (расширенная версия)

**Длительность**: 12 с. **Файл**: `docs/demo/workflow.gif`. **Viewport**: 1280 × 720.

Та же история, что в `hero.gif`, но с пояснениями subtitle. Цель — научить зрителя последовательности «фото → текст → Smart Contrast → экспорт».

### Beat sheet

1. Drop photo (2 с) — `Step 1 — Drop a photo`
2. Add text (2 с) — `Step 2 — Add your headline`
3. Smart Contrast (2 с) — `Step 3 — One click for readable color`
4. Open Export (2 с) — `Step 4 — Choose format and scale`
5. Click PNG export (2 с) — `Step 5 — Saved to downloads`
6. Hold + fade (2 с) — subtitle очищается

### Playwright steps

Те же шаги 1–7 что в `hero.gif`, плюс:

| #   | Action                                                                  | Selector / API                                     | Pause after |
| --- | ----------------------------------------------------------------------- | -------------------------------------------------- | ----------- |
| 8   | Выбрать PNG в радиогруппе (если по умолчанию другое) — иначе пропустить | `[data-testid="export-format"] input[value="png"]` | 600 ms      |
| 9   | Клик «Export»                                                           | `[data-testid="export-confirm"]`                   | 1 500 ms    |
| 10  | Подсветить download-toast / закрыть диалог                              | (диалог сам закроется; снять subtitle)             | 1 500 ms    |

### Subtitles (en)

```
Step 1 — Drop a photo
Step 2 — Add your headline
Step 3 — One click for readable color
Step 4 — Choose format and scale
Step 5 — Saved to downloads
```

### Gotchas

- Имя файла в Export-диалоге — поменять на `mint-demo.png` через `[data-testid="export-filename"] input` (если testid отсутствует — semantic locator) — иначе будет случайное `mint-2026….png`, плохо смотрится.
- Браузер реально скачивает файл — Playwright перехватит download event; пусть скачается, чтобы кадр Toast'а «Saved» был аутентичен.

---

## 3. `snap.gif` — Figma-style smart guides

**Длительность**: 8 с. **Файл**: `docs/demo/snap.gif`. **Viewport**: 1280 × 720.

Демка фичи из последнего PR. Зритель должен три раза увидеть мятную направляющую: (1) `left ↔ left` другого слоя, (2) `center ↔ center`, (3) `center ↔ canvas centerline`.

### Pre-state

Стартовая композиция загружается через share-link (быстрее, чем кликать руками):

```
page.goto(BASE_URL + '#mint=' + encodeDocumentToHash({
  presetId: 'square',
  background: { dataUrl: null, color: '#0e1f17', fit: 'cover' },
  layers: [
    /* anchor layer */ {
      id: 'anchor', text: 'Anchor',
      x: 200, y: 200, width: 320, height: 80, rotation: 0,
      style: { …default, color: '#2f9f7a', fontSize: 56 },
      visible: true, locked: false,
    },
    /* dragged layer — стартует в правом нижнем углу */ {
      id: 'mover', text: 'Drag me',
      x: 700, y: 700, width: 280, height: 80, rotation: 0,
      style: { …default, color: '#ffffff', fontSize: 56 },
      visible: true, locked: false,
    },
  ],
}))
```

`share-confirm` диалог можно проскочить — на пустой канве hash сразу применится.

### Beat sheet

1. **(0–1 с)** Pan камеры по двум слоям, subtitle: `Two layers. Aligned where?`
2. **(1–3 с)** Берём `mover` за центр и **медленно** тащим влево, пока его `left` не совпадёт с `anchor.left = 200`. Появляется вертикальная направляющая. Subtitle: `Snap to left edges`.
3. **(3–5 с)** Двигаем дальше вверх, пока `mover.center` не совпадёт с `anchor.center` (`x ≈ 360`). Subtitle: `Snap to centers`.
4. **(5–7 с)** Тащим в центр канваса (`x = 540`, `y = 540`). Появляются и вертикальная, и горизонтальная направляющие. Subtitle: `Snap to canvas center`.
5. **(7–8 с)** Hold + fade.

### Playwright steps

Drag нужно делать через `page.mouse.move/down/up` с steps, чтобы snap-логика fabric'a получала события постепенно:

```js
const canvas = page.locator('[data-testid="canvas-panel"] canvas');
const box = await canvas.boundingBox();
// canvas coords → screen coords with scale (preset 1080 × scale)
const scale = box.width / 1080;
const at = (x, y) => ({ x: box.x + x * scale, y: box.y + y * scale });

// pick up the mover
const pickup = at(700 + 140, 700 + 40); // its center
await page.mouse.move(pickup.x, pickup.y, { steps: 10 });
await page.waitForTimeout(400);
await page.mouse.down();

// (1) drag toward anchor.left = 200 → mover.left = 200 means center at 200 + 140 = 340
const stopA = at(340, pickup.y);
await page.mouse.move(stopA.x, stopA.y, { steps: 30 });
await page.waitForTimeout(900); // hold to show guide

// (2) move up to align centers vertically → center = anchor.center = 200 + 160 = 360
const stopB = at(360, 200 + 40);
await page.mouse.move(stopB.x, stopB.y, { steps: 30 });
await page.waitForTimeout(900);

// (3) snap to canvas center → 540, 540
const stopC = at(540, 540);
await page.mouse.move(stopC.x, stopC.y, { steps: 30 });
await page.waitForTimeout(900);

await page.mouse.up();
```

### Subtitles

```
Two layers. Aligned where?
Snap to left edges
Snap to centers
Snap to canvas center
```

### Gotchas

- Курсор Playwright'a + наш overlay-курсор: оверлей следует за `mousemove` через JS-listener; во время `mouse.down` событие тоже летит, всё ок.
- Если direction-snap не виден — увеличить `steps` до 50 и `waitForTimeout` после остановки до 1 200 ms, чтобы зритель успел заметить мятную линию.
- Канвас отрисовывает guide на следующем `requestAnimationFrame` после snap — пауза перед `mouse.up` должна быть ≥ 700 ms, иначе guide клирится по `object:modified`.

---

## 4. `palette.gif` — командная палитра ⌘K

**Длительность**: 6–8 с. **Файл**: `docs/demo/palette.gif`. **Viewport**: 1280 × 720.

Показывает, что одно сочетание клавиш покрывает все действия. Две команды для контраста: одна — открыть диалог (Export), вторая — мгновенно меняет состояние холста (preset → Story).

### Pre-state

Стартовая композиция с одним текстовым слоем — чтобы preset-смена была визуально заметна (квадрат → вертикаль). Загрузка через тот же share-hash трюк, или просто:

```
await page.goto(BASE_URL);
await page.getByTestId('empty-cta-add-text').click();
```

### Beat sheet

1. **(0–1 с)** Hold на канвасе. Subtitle: `Press ⌘K — find any command`.
2. **(1–3 с)** `⌘K` (mac) / `Ctrl+K` (win) — палитра открывается. Печатаем `exp`. Subtitle: `Type a few letters`.
3. **(3–4 с)** Палитра отфильтрована, Enter → диалог Export. Subtitle: `Enter to run`.
4. **(4–5 с)** Esc, диалог закрывается. Snap-pause.
5. **(5–7 с)** Снова `⌘K`. Печатаем `story`. Палитра показывает `Switch canvas to Story (1080 × 1920)`. Enter → канвас меняется.
6. **(7–8 с)** Hold на новом вертикальном холсте. Subtitle: `Same shortcut. Everything.`.

### Playwright steps

| #   | Action             | API                                                                                     | Pause after |
| --- | ------------------ | --------------------------------------------------------------------------------------- | ----------- |
| 1   | Open palette       | `page.keyboard.press('Meta+K')` (mac) / `'Control+K'`                                   | 600 ms      |
| 2   | Type filter        | `typeSlowly(page, '[data-testid="command-palette-input"]', 'exp', 'palette query', 80)` | 800 ms      |
| 3   | Activate top match | `page.keyboard.press('Enter')`                                                          | 1 200 ms    |
| 4   | Close dialog       | `page.keyboard.press('Escape')`                                                         | 600 ms      |
| 5   | Re-open palette    | `page.keyboard.press('Meta+K')`                                                         | 600 ms      |
| 6   | Type `story`       | `typeSlowly(…, 'story', …, 80)`                                                         | 800 ms      |
| 7   | Activate           | `Enter`                                                                                 | 1 500 ms    |

> **Важный workaround**: в Playwright headless `Meta+K` не всегда долетает до window-level keydown — мы сами этот баг ловили в `smoke.spec.ts`. Если не реагирует — открыть через overflow: `page.getByRole('button', { name: /more actions/i }).click()` → `page.getByRole('menuitem', { name: /command palette/i }).click()`. Для GIF — overflow-путь надёжнее, но visually менее «магически». Лучше попробовать оба и выбрать по итоговому видео.

### Subtitles

```
Press ⌘K — find any command
Type a few letters
Enter to run
Same shortcut. Everything.
```

### Gotchas

- В палитре не показывать длинный hover-tooltip на shortcut chip — на GIF выглядит шумно.
- Курсор на Enter не нужен, всё клавиатурой — overlay-курсор останется в последней позиции, это ок.

---

## 5. `share.gif` — Share by URL

**Длительность**: 10 с. **Файл**: `docs/demo/share.gif`. **Viewport**: 1280 × 720.

Показ через **две** браузерные вкладки в одном видео — иначе фича не читается. Лучший способ: записать **один** Playwright прогон, в котором мы открываем second page внутри того же context, и в монтаже FFmpeg склеить две дорожки бок-о-бок (split-screen, 640×720 + 640×720).

### Pre-state

Composed design на старте — загружаем через `loadDocument` с photo:

```js
// helper that posts a doc via store before the recording begins
await page.evaluate((doc) => {
  window.__mintTestSeed?.(doc);
}, composedDoc);
```

Если test-seed-хука нет (его действительно нет в проде) — собрать руками: drop photo → add text → 2 секунды паузы → старт записи. Это первые 2 с GIF, можно вместо них поставить still-кадр в финальном монтаже.

### Beat sheet (split-screen, left = sender, right = recipient)

| t   | Left pane (sender)                | Right pane (recipient)         | Subtitle                 |
| --- | --------------------------------- | ------------------------------ | ------------------------ |
| 0   | Composed canvas                   | (empty)                        | `One link, same design`  |
| 2   | Click More → Share link           | (empty)                        | `Click Share link`       |
| 4   | Toast: «Link copied — share away» | New tab opens, pastes URL      | `URL goes to clipboard`  |
| 6   | (idle)                            | Confirm dialog: «Open shared?» | `Recipient opens it`     |
| 8   | (idle)                            | Canvas loads same composition  | `Same design, no upload` |
| 10  | fade                              | fade                           | —                        |

### Playwright steps (single page, then split in post)

```js
// === RECORD 1: sender ===
const sender = await context.newPage();
await sender.goto(BASE_URL);
// … compose …
await injectCursor(sender);
await injectSubtitleBar(sender);
await moveAndClick(sender, '[aria-label="More actions"]', 'More');
await moveAndClick(sender, '[data-testid="toolbar-share"]', 'Share link');
// pause for toast to appear (Snackbar autoHide=4000)
await sender.waitForTimeout(1500);
const sharedUrl = await sender.evaluate(() => navigator.clipboard.readText());

// === RECORD 2: recipient ===
const recipient = await context.newPage();
await injectCursor(recipient);
await injectSubtitleBar(recipient);
await recipient.goto(sharedUrl);
// share-confirm dialog may appear if recipient has autosave
const confirm = recipient.locator('[data-testid="share-confirm-open"]');
if (await confirm.isVisible({ timeout: 1500 }).catch(() => false)) {
  await moveAndClick(recipient, confirm, 'Open shared');
}
await recipient.waitForTimeout(2500); // hold the result
```

В монтаже:

```bash
ffmpeg -i sender.webm -i recipient.webm -filter_complex \
  "[0]scale=640:720[s];[1]scale=640:720[r];[s][r]hstack" \
  share-stacked.mp4
```

### Subtitles

```
One link, same design
Click Share link
URL goes to clipboard
Recipient opens it
Same design, no upload
```

### Gotchas

- Для `navigator.clipboard.readText()` нужен grant: `context.grantPermissions(['clipboard-read', 'clipboard-write'])` — иначе бросит promise rejection и сценарий упадёт.
- Если автосейв на recipient-табе не пустой — выскочит confirm-dialog. Это **хорошая** часть демки (показывает, что MINT не клобберит работу), но subtitle нужно подвинуть на 1 секунду позже.
- Background photo не передаётся по share-link by design — это упоминать **в subtitle**: можно расширить до `Same design — drop your own photo`.

---

## 6. `bg-drag.gif` — Reframe the background photo

**Длительность**: 8 с. **Файл**: `docs/demo/bg-drag.gif`. **Viewport**: 1280 × 720.

Фича из PR #7. Показ — три действия: (1) drag самого фото внутри рамки, (2) corner-zoom через handle, (3) Reset position.

### Pre-state

Холст со загруженным фото (тёплый закат в `cover` режиме — гарантирует, что у фото есть «лишний» пиксель за рамкой канваса, который можно подвигать).

```js
await page.goto(BASE_URL);
await page
  .locator('[data-testid="bg-upload"]')
  .setInputFiles('docs/demo/assets/test-photo.jpg');
await page.waitForTimeout(800); // wait for fabric to decode
```

### Beat sheet

1. **(0–2 с)** Pan на канвас, subtitle: `Reframe the photo on the canvas`.
2. **(2–4 с)** Drag фото влево-вниз на ~120 px (canvas coords). Видно, что меняется кадрирование. Subtitle: `Drag to reposition`.
3. **(4–6 с)** Хвататься за **bottom-right corner handle** фото и тянуть наружу — пропорциональный зум. Subtitle: `Corner-zoom uniformly`.
4. **(6–7.5 с)** Open Layers panel → клик «Reset position». Фото возвращается к auto-fit. Subtitle: `Reset to auto-fit`.
5. **(7.5–8 с)** Hold.

### Playwright steps

Background image на canvas — fabric-object с `_mintId === '__mint_background__'`. У него **есть** corner handles (`tl`, `tr`, `bl`, `br`), но middle handles мы выключили в `setControlsVisibility`. Чтобы попасть в handle через Playwright, нужны canvas coords:

```js
const canvas = page.locator('[data-testid="canvas-panel"] canvas');
const box = await canvas.boundingBox();
const scale = box.width / 1080;
const at = (x, y) => ({ x: box.x + x * scale, y: box.y + y * scale });

// 1. Select the bg by clicking its center (where no text layers are yet)
await page.mouse.click(at(540, 540).x, at(540, 540).y);
await page.waitForTimeout(500);

// 2. Drag it
const start = at(540, 540);
const end = at(420, 660);
await page.mouse.move(start.x, start.y, { steps: 10 });
await page.mouse.down();
await page.mouse.move(end.x, end.y, { steps: 40 });
await page.mouse.up();
await page.waitForTimeout(800);

// 3. Corner-zoom — grab the bottom-right handle. After drag the bg's br
// corner is at approx (image_right + dx, image_bottom + dy) in canvas coords.
// Easier: query fabric for the active object's corner coords.
const corner = await page.evaluate(() => {
  const c = window.__mintCanvas; // expose for tests if needed
  const bg = c.getObjects().find((o) => o._mintId === '__mint_background__');
  return bg ? bg.oCoords.br : null;
});
const cornerScreen = at(corner.x, corner.y);
await page.mouse.move(cornerScreen.x, cornerScreen.y, { steps: 10 });
await page.mouse.down();
await page.mouse.move(cornerScreen.x + 80, cornerScreen.y + 80, { steps: 40 });
await page.mouse.up();
await page.waitForTimeout(800);

// 4. Reset position via the Layers panel button
await moveAndClick(page, '[data-testid="bg-reset-position"]', 'Reset position');
await page.waitForTimeout(1500);
```

### Subtitles

```
Reframe the photo on the canvas
Drag to reposition
Corner-zoom uniformly
Reset to auto-fit
```

### Gotchas

- `window.__mintCanvas` — такого хука сейчас нет в проде. Под demo-запись либо временно экспонировать `adapter.canvas` через `window` под flag (`if (import.meta.env.MODE !== 'production') window.__mintCanvas = …`), либо подобрать coordinates руками экспериментально. Я бы рекомендовал первый путь — компактнее, не оставляет magic-numbers в скрипте.
- Reset-position button показывается **только если** есть `manual` transform. Если drag-шаг не сработал — кнопки не будет, GIF получится без четвёртого beat'а.
- Если фото меньше канваса (`contain` режим), drag слабо заметен. Используем `cover` тестовое фото 1600×1067 на квадратном канвасе.

---

## 7. `mobile.gif` — touch-first editor

**Длительность**: 12 с. **Файл**: `docs/demo/mobile.gif`. **Viewport**: 390 × 844 (iPhone 14 Pro), `deviceScaleFactor: 2`.

Идея: показать, что на телефоне MINT — не «адаптив», а реально удобный редактор. Маршрут: empty-state → add text → открыть Style drawer → менять цвет → закрыть pull-down свайпом → экспорт.

### Pre-state

```js
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  recordVideo: { dir: VIDEO_DIR, size: { width: 390 * 2, height: 844 * 2 } },
});
```

`isMobile: true` важно — иначе React-Material медиа-запросы не сработают, и приложение откроется в desktop-layout'е.

### Beat sheet

1. **(0–1.5 с)** Empty-state full-screen. Subtitle: `MINT on your phone`.
2. **(1.5–3 с)** Tap «Add text» CTA. Subtitle: `Tap to add text`.
3. **(3–5 с)** Тап на bottom-bar кнопку Style → drawer выезжает. Subtitle: `Style drawer slides up`.
4. **(5–8 с)** Выбираем preset-цвет (например, mint-green). Текст в превью меняется. Subtitle: `Tap a preset color`.
5. **(8–9.5 с)** Pull-down свайпом закрываем drawer. Subtitle: `Pull down to dismiss`.
6. **(9.5–11 с)** Tap Export (можно overflow «⋯» если в нижнем баре нет — проверить). Subtitle: `Export — same dimensions, mobile UX`.
7. **(11–12 с)** Hold + fade.

### Playwright steps

Touch-эмуляция через `tap()` вместо `click()` плюс жесты через `touchscreen.tap()`/`page.mouse.move()`:

| #   | Action                             | API                                                                                               | Pause after |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Goto                               | `page.goto(BASE_URL)`                                                                             | 1 200 ms    |
| 2   | Tap «Add text»                     | `page.locator('[data-testid="empty-cta-add-text"]').tap()`                                        | 800 ms      |
| 3   | Open Style drawer                  | `page.locator('[data-testid="mobile-properties-button"]').tap()`                                  | 1 200 ms    |
| 4   | Tap preset color (e.g. mint-green) | `page.getByRole('button', { name: /color preset/i }).first().tap()` — уточнить по DOM в discovery | 1 500 ms    |
| 5   | Pull-down to dismiss               | См. ниже                                                                                          | 1 200 ms    |
| 6   | Tap «Export» from bottom bar       | overflow → Export                                                                                 | 1 500 ms    |

Pull-down (свайп по grab-area drawer'а):

```js
const drawer = page.locator('[data-testid="properties-panel-mobile"]');
const grabArea = drawer.locator('[role="separator"]').first(); // grab-handle
const gb = await grabArea.boundingBox();
await page.touchscreen.tap(gb.x + gb.width / 2, gb.y + gb.height / 2);
// emulate sustained swipe
await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2);
await page.mouse.down();
await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2 + 250, {
  steps: 30,
});
await page.mouse.up();
```

### Subtitles

```
MINT on your phone
Tap to add text
Style drawer slides up
Tap a preset color
Pull down to dismiss
Export — same dimensions, mobile UX
```

### Gotchas

- Subtitle font может быть мелким на 390-wide GIF. Можно увеличить `font-size` в `injectSubtitleBar` под mobile preset (например, до 22 px).
- iOS-стиль hover ≠ desktop, наш overlay-курсор на mobile **не нужен** — это уменьшит шум. Скип `injectCursor(page)` для mobile-сценария.
- Pull-down gesture работает через `usePullDownToClose` hook — нужен реальный touch-listener; `page.mouse.move` с `down/up` подойдёт только если в hook fallback на mouse-events. Если drawer не закрывается — проверить `page.touchscreen.swipe` (если есть) или эмуляцию через `dispatchEvent('touchstart' …)`.

---

## Запуск сценариев

После того, как все 6 будут реализованы:

```bash
# каждый сценарий — отдельный .cjs скрипт в docs/demo/scripts/
node docs/demo/scripts/hero.cjs --rehearse        # phase 2
node docs/demo/scripts/hero.cjs                   # phase 3, .webm → docs/demo/raw/

# конверсия в GIF (один файл = одна команда; loop=0 = infinite)
ffmpeg -i docs/demo/raw/hero.webm -vf "fps=20,scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 docs/demo/hero.gif
```

Финальные GIF'ы — в `docs/demo/*.gif`, на которые ссылается README.

## Что записывать в последовательности

Если время ограничено — порядок по важности:

1. **`hero.gif`** — без неё README выглядит как незаполненный плейсхолдер.
2. **`workflow.gif`** — расширенная версия hero с subtitle, прямой объяснитель для холодного зрителя.
3. **`snap.gif`** — самая «вау» фича из последних.
4. **`palette.gif`** — короткая, простая, дешёвая в записи; даёт второе впечатление «ого, тут продумано».
5. **`share.gif`** — split-screen, требует больше монтажа, можно отложить.
6. **`mobile.gif`** — другой viewport, потенциально больше gotchas; последняя.
