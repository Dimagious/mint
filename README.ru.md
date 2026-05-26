# MINT — социальные картинки прямо в браузере

[English](README.md) | [Русский](README.ru.md)

<p align="center">
  <img src="docs/logo.svg" alt="MINT logo" width="96" />
</p>

<p align="center">
  <strong>Бросил картинку, вписал текст, нажал Экспорт.</strong><br/>
  Делайте красивые посты прямо в браузере — без загрузок в облако, аккаунтов и подписок.
</p>

<p align="center">
  <a href="https://dimagious.github.io/mint/">
    <img alt="Live demo" src="https://img.shields.io/badge/▶︎_Live_demo-2F9F7A?style=for-the-badge&logoColor=white" />
  </a>
  &nbsp;
  <a href="https://github.com/Dimagious/mint/actions/workflows/ci.yml">
    <img alt="CI status" src="https://github.com/Dimagious/mint/actions/workflows/ci.yml/badge.svg?branch=main" />
  </a>
  &nbsp;
  <a href="./LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg" />
  </a>
</p>

<p align="center">
  <img src="docs/design/after-02-desktop-with-text.png" alt="Редактор MINT с текстовым слоем на квадратном холсте" width="900" />
</p>

---

## Зачем это

Я регулярно делаю обложки постов, слайды для сторис и анонсы для пет-проектов. Каждый «лёгкий аналог Canva» хочет мой email, тащит проекты в своё облако и продаёт Pro. Хотелось инструмент, который делает одно — и делает быстро, прямо в браузере, без отвлечений.

**MINT = Merge Image'N Text.** Открыл страницу, бросил фон, вписал заголовок, выгрузил PNG. Это весь продукт. Без аккаунтов, без папок проектов, без AI-подсказок, без маркетплейса шаблонов.

## Что я узнал, делая это

Три инженерных идеи, которые сделали проект интересным:

- **Canvas как состояние, а не как DOM.** [Fabric.js](https://fabricjs.com/) держит визуальное представление, [Zustand](https://github.com/pmndrs/zustand) — источник правды. Между ними прослойка `FabricAdapter`, которая транслирует мутации стора в операции над canvas, а события выделения/перетаскивания обратно в action'ы стора.
- **Дизайн до кода — даже для пета.** В репо есть [`docs/design/BRIEF.md`](./docs/design/BRIEF.md) — настоящий бриф, написанный до редизайна, со скриншотами «до/после», жёсткими ограничениями и чеклистом приёмки. Редизайн-PR сверялся с брифом, а не с настроением исполнителя.
- **i18n со второго дня.** Подключить `react-i18next` сразу было дёшево; докручивать русский в полированный UI потом — больно. EN и RU идут паритетно, переключение языка переживает перезагрузку через `localStorage`.

## Стек

<p>
  <img alt="React 18" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite 6" src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" />
  <img alt="MUI v6" src="https://img.shields.io/badge/MUI-v6-007FFF?logo=mui&logoColor=white" />
  <img alt="Fabric.js" src="https://img.shields.io/badge/Fabric.js-6-FF6B6B" />
  <img alt="Zustand" src="https://img.shields.io/badge/Zustand-5-2D3748" />
  <img alt="dnd-kit" src="https://img.shields.io/badge/dnd--kit-6-6B7280" />
  <img alt="Playwright" src="https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white" />
  <img alt="Node 22" src="https://img.shields.io/badge/Node-22-339933?logo=node.js&logoColor=white" />
</p>

**Почему так:**

- **React + MUI v6** — чтобы тратить силы на форму продукта, а не на свою дизайн-систему.
- **Fabric.js** вместо голого canvas — текст с тенью и обводкой это решённая задача, не хочется решать её заново.
- **Zustand** + command pattern для undo/redo — мало кода, понятно как устроено.
- **Vite** — мгновенный HMR и понятный bundle.
- **dnd-kit** — доступный drag-and-drop слоёв без привязки к UI-библиотеке.
- **Playwright** + **Vitest** — CI блокирует мерж, если что-то падает.
- **pnpm workspaces** — `core` / `editor` / `ui` / `utils` остаются разделимыми.

## Скриншоты

|                                                                             |                                                                                 |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| ![Пустой экран на десктопе](docs/design/after-01-desktop-empty.png)         | ![С текстовым слоем](docs/design/after-02-desktop-with-text.png)                |
| _Empty-state — понятно, с чего начинать_                                    | _Редактирование текстового слоя на вкладочной панели стиля_                     |
| ![Диалог экспорта](docs/design/after-03-desktop-export-dialog.png)          | ![Мобильный пустой экран](docs/design/after-04-mobile-empty.png)                |
| _Экспорт: превью, имя файла, 1×/2×, оценка размера_                         | _Мобильный: canvas-first, нижний бар Layers / Style / Export_                   |
| ![Drawer слоёв на мобильном](docs/design/after-05-mobile-layers-drawer.png) | ![Drawer стиля на мобильном](docs/design/after-06-mobile-properties-drawer.png) |
| _Drawer слоёв — закрытие свайпом вниз_                                      | _Drawer стиля с вкладками и поповером цвета_                                    |

## Возможности

- **Пресеты холста** для трёх форматов, которые реально нужны:
  - `1080 × 1080` — Квадрат (Instagram feed, LinkedIn)
  - `1080 × 1350` — Портрет (Instagram, Pinterest)
  - `1080 × 1920` — Сторис (Instagram, TikTok, Shorts)
- **Текстовые слои**: шрифт, размер, вес, цвет, прозрачность, выравнивание, межстрочный/межбуквенный интервалы, тень, обводка, фон под текстом.
- **Слои** — перетаскивание (с клавиатурным доступом), блокировка, скрытие, дубль, copy/paste, undo/redo одной записью на жест.
- **Smart Contrast** — один клик и MINT сэмплит фон под текстом и подбирает читаемый цвет + обводку.
- **Fit-to-width** — автоматически подгоняет размер шрифта под ширину слоя.
- **Safe-zone** подсказки для соцсетей, которые режут заголовок.
- **PNG / JPEG / WebP** экспорт с живым превью, выбором масштаба (1× / 2×) и оценкой размера файла.
- **Горячие клавиши** для всего (`Cmd/Ctrl+Z/Y`, `T`, `Cmd+E`, `?` для шпаргалки).
- **Автосохранение** в `localStorage` + бейдж «Сохранено»; экспорт/импорт проекта в `.json`.
- **Mobile-first**: drawer-ы для Layers и Style, закрытие свайпом вниз.
- **English / Русский** в паритете.
- **Без сервера, без аккаунта.** Всё остаётся в браузере.

## Быстрый старт

```bash
pnpm install
pnpm dev
```

Затем откройте <http://localhost:3000>.

## Скрипты

```bash
pnpm dev          # запуск веб-приложения локально
pnpm build        # сборка всех пакетов
pnpm test         # unit-тесты
pnpm lint         # линтер
pnpm format:check # проверка форматирования Prettier
pnpm test:e2e     # Playwright E2E
```

## Архитектура

```text
apps/
  web/       React + Vite фронтенд (сам редактор)
  api/       опциональный backend-плейграунд — сейчас не используется
packages/
  core/      доменные типы, пресеты, фабрики, утилиты экспорта
  editor/    Zustand-стор, command history, Fabric.js-адаптер
  ui/        переиспользуемые React-компоненты + MUI-тема + загрузчик Google Fonts
  utils/     маленькие общие хелперы (без DOM)
```

Дизайн-бриф, по которому делали текущий UI, лежит в [`docs/design/BRIEF.md`](./docs/design/BRIEF.md).

## Деплой

В репо лежит workflow [`deploy-pages.yml`](./.github/workflows/deploy-pages.yml):

1. Push в `main`.
2. В настройках репо GitHub Pages → source = **GitHub Actions**.
3. Дождаться завершения workflow.

Workflow собирает монорепо и деплоит `apps/web/dist`.

## Контрибьют

Гайд для контрибьюторов: [`CONTRIBUTING.md`](./CONTRIBUTING.md). Issues и PR приветствуются.

## Поддержка

Если MINT помогает быстрее выпускать контент — можно [угостить кофе](https://buymeacoffee.com/dimagious). Ценю, но не ожидаю.

## Лицензия

[MIT](./LICENSE)
