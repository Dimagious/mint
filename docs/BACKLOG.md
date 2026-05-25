# MINT — Portfolio Backlog

Сводный отчёт по 5 параллельным аудитам (архитектура, UI/UX, документация, безопасность, продукт). Цель — довести проект до уровня, на котором не стыдно поделиться в соцсетях и положить в портфолио.

## TL;DR

Проект уже на крепком уровне — чистый монорепо, command pattern, тесты, husky+commitlint, i18n, mobile-flow, дизайн-бриф. Это видно сразу. Но между «крепким pet» и «вот это вау» — 6–10 конкретных действий.

Главные дыры:
- **Док/презентация**: README прячет продукт — нет hero-скриншота, нет tech stack бейджей, нет story «why I built this». Блокер №1 для соцсетей.
- **Дизайн**: три разных логотипа в проекте, бейдж размеров сливается с safe-zone, raw `<input type="color">` в `LayersPanel` остался от легаси, скриншоты нужно переснять с реальным фото.
- **Архитектура**: безлимитная command history + dataURL фон → утечка памяти; `App.tsx` 755 строк (god-component); опечатка `'social-posts-heler'` в `vite.config.ts`; WebP в Export Dialog врёт.
- **Безопасность**: нет валидации MIME/размера загружаемых картинок (DoS); `document-validation.ts` проверяет shape но не bounds; нет meta CSP.
- **Продукт**: нет шаблонов и нет share/remix цикла. Каждый юзер закрывает вкладку и забывает.

---

## Фаза 0 — Блокеры публикации (1 день)

Без этих пунктов в соцсети идти не стоит.

### 0.1. README — переписать первый экран
- Сейчас: `README.md:1-25` — лого, бейджи node/pnpm, одна строка описания, ссылка на demo текстом, скриншота нет.
- Надо: hero-скриншот (`docs/design/after-02-desktop-with-text.png`) первым, tagline «Make scroll-stopping social images in your browser. No upload, no account, no subscription», CTA-кнопка-бейдж на live demo, бейджи технологий (React 18, TS, Vite 6, MUI v6, Fabric.js, Zustand, Playwright).

### 0.2. Секция «Why I built this» + «What I learned»
- Сейчас `README.md:27-31` — три сухих буллета. Главная секция для рекрутера.
- Надо: story «почему ушёл с Canva», три инженерные idea (canvas-as-state, monorepo, design-before-code), три learnings (Fabric vs React render cycle, autosave UX, i18n с дня 2).

### 0.3. Tech stack явной секцией
Стек сейчас разбросан по 4 `package.json`. Рекрутер сканирует 10 секунд — должен увидеть стек сразу. Бейджами + параграфом «why these».

### 0.4. Screenshots секция в README
В `docs/design/` лежит 12 готовых PNG — в README 0. Использовать через MD-таблицу: desktop empty / with text / export + mobile empty / layers / properties.

### 0.5. CI workflow на PR
`.github/workflows/deploy-pages.yml` только деплоит. Нет workflow который на PR гонит lint+test+build. Добавить `.github/workflows/ci.yml` + статус-бейдж в README.

### 0.6. Логотип-несостыковка
Три разных «листа» в проекте:
- `docs/logo.png` (графичный лист с прожилками)
- `apps/web/src/assets/mint-logo-primary.png` в шапке
- `apps/web/src/components/EmptyStateOverlay.tsx:111-129` (третий 4-petal SVG inline)

Один SVG → переиспользовать везде (favicon, шапка 24-28px, empty state 52-64px).

### 0.7. Опечатка `'social-posts-heler'`
`apps/web/vite.config.ts:6` — fallback должен быть `'mint'`. Любой fork без `GITHUB_REPOSITORY` собирает на чужой base path.

### 0.8. WebP в Export Dialog врёт
`packages/ui/src/components/ExportDialog.tsx:94-97` — пользователь выбирает WebP, получает JPG. Либо реально поддержать в `FabricAdapter.getExportDataUrl`, либо убрать кнопку.

### 0.9. Переснять скриншоты с реальной фотографией
Все `after-*.png` на mint-цветном фоне. Нет ни одного шота с реальной фоткой (unsplash food/landscape) + текст-оверлей. Обязательно для постов.

### 0.10. Бейдж размеров `1080×1080` сливается с safe-zone
`apps/web/src/components/CanvasPanel.tsx:217-238` — `top:14, left:14` визуально оказывается прямо в верхней светло-зелёной safe-zone-полосе. Поднять над карточкой или сделать микро-чипом 9-10px.

---

## Фаза 1 — Качество кода (2-3 дня)

Уровень «не стыдно перед интервьюером».

### Архитектура / память
- **`packages/editor/src/commands/command-history.ts:5-12`** — undoStack без лимита. `SetBackgroundCommand` хранит полный base64 dataUrl в каждой команде. Cap = 100 + легковесные снапшоты для тяжёлых полей.
- **`packages/editor/src/commands/update-text-layer-command.ts:8-20`** — `previousState` пишется внутри `execute()` через `map` с сайд-эффектом. Если execute вызвать дважды (redo после undo — `command-history.ts:26` так и делает) — `previousState` перезатрётся. Snapshot брать в конструкторе, redo использовать сохранённый after-state.
- **`apps/web/src/App.tsx:307-311`** — `autosaveSignal = JSON.stringify(doc.layers.map(...))` на каждый рендер. Хот-path. Ввести в стор `revision: number`.
- **`packages/editor/src/adapter/fabric-adapter.ts:229,250`** — `as fabric.FabricObject & { _dataUrl?: string }` — приватное поле поверх чужого объекта. Заменить на `WeakMap<fabric.FabricImage, string>`.
- **`fabric-adapter.ts:185-190`** — `getLayerIdFromObject` O(n) скан на каждое selection/modified событие. Завести обратный `WeakMap`.
- **`fabric-adapter.ts:240-258`** — `imgElement.onload` ставит фон асинхронно без guard. Нужен AbortController/version-check.
- **Coalescing команд**: перетаскивание слайдера opacity создаёт 100 команд в стеке. Debounce/merge по типу+layerId+поле в окне ~300мс.

### God-components
- **`apps/web/src/App.tsx`** — 755 строк, 15+ селекторов из стора в одном файле. Вынести: `useKeyboardShortcuts()` (104-201), `useAutosave()` (204-242), `<TopBar/>`, `<MobileBottomBar/>`, `<MobileDrawers/>`. Цель — ~120 строк.
- **`packages/ui/src/components/StylePanel.tsx`** — 1063 строки. EffectCard / ColorChip / NumberSlider / SegPill / Swatches → в отдельные файлы `packages/ui/src/components/style-panel/`.

### Стор и DX
- `editor-store.ts:53` — `const history = new CommandHistory();` модульный singleton. В тестах нельзя сбросить состояние. DI или `__test__/reset` helper.
- `addTextLayer` (`editor-store.ts:82-92`) не возвращает id созданного слоя.
- `exportCanvas` (`editor-store.ts:195-229`) — мёртвый код, дублирует download-логику из `CanvasPanel`. Удалить.
- `setBackground/setPreset/...` повторяют один и тот же бойлерплейт. Извлечь helper `runCommand(cmd, extra?)`.

### Безопасность
- **`packages/utils/src/file-reader.ts`** + drop-handler в `CanvasPanel.tsx:168-178` — нет MIME-whitelist, нет лимита размера, нет magic-byte check. 500MB файл = freeze + OOM. Добавить `readImageFileSafely` с whitelist + size 15MB + magic bytes (JPEG/PNG/WebP).
- **`apps/web/src/utils/document-validation.ts`** — проверяет shape, не bounds. `fontSize: 1e9`, `background.dataUrl: 'javascript:...'`, `text` без max length. Заменить на zod схему с numeric bounds + regex для color (`^#[0-9a-f]{3,8}$`) + prefix-check (`^data:image/(png|jpeg|webp);base64,`).
- **`apps/web/index.html`** — нет meta CSP. Добавить `default-src 'self'; img-src 'self' data: blob:; font-src https://fonts.gstatic.com; ...`.
- **`apps/web/src/components/LayersPanel.tsx:181-195`** — raw `<input type="color">` (дизайн-бриф §2.6 это требовал убрать). `ColorChip` уже есть в `StylePanel.tsx:822`. Переиспользовать.
- `localStorage` `mint-project` хранит base64 картинки — на shared-браузере следующий юзер видит фото. Чекбокс «Save project on this device» в overflow + кнопка «Clear local data».

### TS-гигиена
- `as` cast'ы в `CanvasPanel.tsx:44`, `fabric-adapter.ts:334`, `StylePanel.tsx:419,856`, `ExportDialog.tsx:96` — все лишние или прячут проблемы.
- `eslint.config.js` не подключает `eslint-plugin-react-hooks` и `eslint-plugin-jsx-a11y`. Для React-проекта в портфолио — мастхэв.
- `apps/web/vitest.config.ts:6` `environment: 'node'` — но в `apps/web/src` есть DOM-зависимый код. Должно быть `jsdom`.

### Доступность
- Dialog/Drawer без `aria-labelledby` (Mobile drawer, ShortcutsDialog, ExportDialog).
- `LayerListItem.tsx:83-110` — кликабельный `<Box>` без `role="button"`, `tabIndex=0`, Enter/Space handler. Клавиатурный юзер не выберет слой.
- `text.disabled = #8A938F` на `#FAFAF7` ≈ 3.0:1 — ниже WCAG AA. Empty-state subtitle. Подтянуть до `#6F7873`.
- Нет глобального `:focus-visible` стиля — браузерный синий ring ломает mint-эстетику.

### Тесты
- Нет тестов: `smart-contrast.ts` (важный «вау» алгоритм), `text-fit.ts` (бинпоиск), `fabric-adapter.ts`, `editor-store` integration.
- E2E `apps/web/e2e/smoke.spec.ts` — только 3 простых сценария. Добавить: export PNG, undo/redo через UI, drag&drop фона, шорткаты.
- Нет coverage-отчёта.

---

## Фаза 2 — Виральность и продукт (3-5 дней)

| # | Фича | Усилие | Зачем |
|---|------|--------|-------|
| 1 | **Template Gallery** — 20-30 готовых композиций как `.json` в `/templates`, грузятся через существующий `loadDocument` | 2-3 дня | Закрывает главную дыру «нечего попробовать за 5 секунд». Тред «I built MINT + 30 templates» — готовый виральный пост. |
| 2 | **Copy to Clipboard PNG + Share Intents** (`navigator.clipboard.write([new ClipboardItem(...)])`+ intent X/Threads/Telegram) | Несколько часов | Меняет UX «download → найти → drag» на Cmd+V. |
| 3 | **Shareable Project Links + Remix Button** — сериализация `EditorDocument` (без фона) в `?d=lz-string(json)` | 1-2 дня | Growth-loop. Архитектурно красиво на существующий `loadDocument`. |
| 4 | **Command Palette (Cmd+K)** через `cmdk` + **PWA** через `vite-plugin-pwa` | 1 день вдвоём | Малый код, мгновенное «pro-tool» восприятие. |
| 5 | **Code Snippets layer** — встроенный Shiki/Prism для syntax highlighting | 2-3 дня | Carbon.now.sh + Canva в одном. Прямое попадание в dev-Twitter. |

### Quick wins (по часу)
- Eyedropper API (`new EyeDropper().open()`)
- Snap-to-center alignment guides (Figma-style розовые линии)
- Random tasteful background («Surprise me» — 10 готовых градиентов)
- Recent color swatches (уже частично в `StylePanel.tsx:827`)
- OG-image и Twitter Card для сайта (сгенерить самим MINT)
- Text presets (Headline / Subheadline / Caption)
- Live Smart Contrast анимация — split-screen wipe «before/after» при клике

### Визуальные улучшения для скринов
- Empty state: добавить размытые pastel-blobs (`filter:blur(80px)`) или 5-7 sec lottie-листа.
- Outlined `+ Add Text` в шапке выглядит disabled → filled-tonal (mint50 bg + mintDark text).
- Disabled Undo/Redo идентичны активным — нужен override в `theme.ts`.
- Tabs Text/Layout/Effects underline 2px → 3px mintDark.
- Truncate `Inter S...` в LayerListItem — убрать вес из лейбла.
- **Smart Contrast = killer feature** — оформить как AI-pill с градиентом mint→teal.
- Превью в Export Dialog (`after-03`) залить шахматной transparency-сеткой когда нет картинки.
- Точечная сетка фона (`App.tsx:537-540`) — усилить до `.07` или 24px grid.
- `@mui/icons-material` → Lucide (бриф §3.4).

### Не делать сейчас (хотя соблазнительно)
- Real-time collab через y.js — много кода, мало юзеров.
- Plugin API — пока нет 2-3 плагинов, это over-engineering.
- Animated MP4/GIF export — большой engineering risk, размывает позиционирование.

### Легаси
- `apps/api/` — пустышка с одной константой. Либо удалить, либо превратить в shareable-link service.

---

## Фаза 3 — Differentiator (1 неделя)

Одно из двух:
- **Code Snippets layer** (Shiki/Prism как layer-тип) — Carbon-killer внутри MINT
- **CLI / Headless Generation** — `npx @mint/cli generate --template launch.json --vars '{"title":"v2.0"}' --out launch.png`. Use-case: changelog генерация, GitHub release banners в CI.

---

## Фаза 4 — Публикация

- Loom-видео 15 сек: drop → text → smart contrast → export
- Twitter тред + 2 скрина (desktop+mobile с реальным фото)
- LinkedIn-пост (длинный со storytelling)
- dev.to статья «Canvas as state, not as DOM»
- Product Hunt в четверг с заранее подготовленными screenshots
- Pinned-репозиторий в профиле + кастомный профиль README

### Готовые посты (тексты)

**X/Twitter:**
```
Every "lightweight Canva alternative" wants my email.

So I built one that doesn't. Browser-only, no account, no upload. PNG export in ~60s.

React 18 + Fabric.js + Zustand, monorepo, MIT.

→ https://dimagious.github.io/mint/
```

**dev.to заголовок + хук:**
> «I built a browser-only social image editor (React + Fabric.js + Zustand) — here's what state management on a canvas actually looks like»
>
> When you put a canvas into a React app, your canvas library and your state library will fight over who owns the truth, and you have to make a choice.

---

## Чек-лист по файлам

- `README.md` — переписать целиком (Фаза 0)
- `README.ru.md` — синхронизировать после англоязычного
- `CONTRIBUTING.md` — расширить (карта репо, scope cheat sheet, ссылка на BRIEF)
- `.github/workflows/ci.yml` — создать (lint + test + build на PR)
- `.github/ISSUE_TEMPLATE/*.yml` + `PULL_REQUEST_TEMPLATE.md` — создать
- `apps/web/vite.config.ts:6` — `'social-posts-heler'` → `'mint'`
- `apps/web/index.html` — meta CSP + referrer
- `apps/web/src/App.tsx` — distill (~120 строк, выделить хуки)
- `apps/web/src/utils/document-validation.ts` — заменить на zod с bounds
- `apps/web/src/components/CanvasPanel.tsx:168-178,217-238` — MIME-валидация, бейдж размеров
- `apps/web/src/components/LayersPanel.tsx:181-195` — raw color input → ColorChip
- `apps/web/src/components/EmptyStateOverlay.tsx:111-129` — единый логотип
- `apps/web/src/assets/mint-logo-primary.png` — заменить на SVG
- `apps/web/vitest.config.ts:6` — `environment: 'jsdom'`
- `packages/editor/src/commands/command-history.ts` — cap + coalescing
- `packages/editor/src/commands/update-text-layer-command.ts` — snapshot в конструкторе
- `packages/editor/src/adapter/fabric-adapter.ts` — WeakMap, AbortController на bg load
- `packages/editor/src/store/editor-store.ts` — revision counter, удалить exportCanvas
- `packages/ui/src/components/StylePanel.tsx` — distill в `style-panel/`
- `packages/ui/src/components/ExportDialog.tsx:94-97` — WebP fix или удалить
- `packages/utils/src/file-reader.ts` — добавить `readImageFileSafely`
- `eslint.config.js` — добавить `react-hooks` + `jsx-a11y`
- `package.json` — `pnpm.overrides` для tar

---

## Источники

Этот бэклог собран по результатам 5 параллельных аудитов в ветке `claude/portfolio-product-review-CuxRQ`:
1. Архитектура и качество кода
2. UI/UX и визуальный дизайн (по скриншотам after-*)
3. Документация и презентация
4. Безопасность фронтенда
5. Продуктовый бэклог и виральные механики
