<p align="center">
  <img src="docs/logo.svg" alt="MINT logo" width="96" />
</p>

<h1 align="center">MINT</h1>

<p align="center">
  <strong>The fastest way to make a post graphic — open the page, drop a photo, type a headline, hit Export.</strong><br/>
  No signup. No upload to anyone's server. No watermark. No "Upgrade to Pro".
</p>

<p align="center">
  <a href="https://dimagious.github.io/mint/">
    <img alt="Open the live editor" src="https://img.shields.io/badge/▶︎_Open_the_live_editor-2F9F7A?style=for-the-badge&logoColor=white" />
  </a>
  &nbsp;
  <a href="https://github.com/Dimagious/mint/stargazers">
    <img alt="If MINT saves you a Canva subscription, star it" src="https://img.shields.io/github/stars/Dimagious/mint?style=for-the-badge&logo=github&logoColor=white&color=2F9F7A&labelColor=1f3a30" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/Dimagious/mint/actions/workflows/ci.yml">
    <img alt="CI status" src="https://github.com/Dimagious/mint/actions/workflows/ci.yml/badge.svg?branch=main" />
  </a>
  &nbsp;
  <img alt="Installable PWA" src="https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa&logoColor=white" />
  &nbsp;
  <img alt="Works offline" src="https://img.shields.io/badge/Offline-ready-009688" />
  &nbsp;
  <a href="./LICENSE">
    <img alt="MIT License" src="https://img.shields.io/badge/License-MIT-blue.svg" />
  </a>
  &nbsp;
  <img alt="English / Russian" src="https://img.shields.io/badge/i18n-EN_|_RU-7E57C2" />
</p>

<p align="center">[English] · <a href="./README.ru.md">Русский</a></p>

<p align="center">
  <!-- TODO: hero.gif — 8-12 s loop: drop a photo → add headline → smart-contrast → export -->
  <img src="docs/demo/hero.gif" alt="A short loop of MINT: a photo is dropped onto the canvas, a headline appears, one click of Smart Contrast picks a readable color, and the image exports as a PNG." width="900" />
</p>

---

## The 30-second pitch

You need a clean post graphic _right now_. Every "lightweight Canva alternative" wants your email, syncs your project to their cloud you didn't ask for, and gates PNG export behind a paywall. **MINT skips all of it.**

Open the URL. Drop a photo. Type a headline. Smart Contrast picks a readable color in one click, Fit-to-width auto-sizes the type, snap-guides keep your alignment honest. Export to PNG, JPEG or WebP at the exact dimensions Instagram, LinkedIn, TikTok and Pinterest actually want.

The whole tool runs in your browser. Your photo never leaves your machine. There is no server.

> **MINT** = **M**erge **I**mage'**N** **T**ext.

## Why people use it

- **Open and go.** No account, no email, no onboarding tour. The empty state takes 4 seconds to figure out.
- **Your files stay yours.** Photos are read locally — they never hit a server. Close the tab and the cloud doesn't have a copy.
- **Pixel-perfect for every platform.** Three canvas presets (Square 1080, Portrait 1080×1350, Story 1080×1920) match the dimensions Instagram, LinkedIn, TikTok and Pinterest publish at — no awkward crops on upload.
- **Smart Contrast.** One click samples the photo under your headline and picks a readable color _with_ a complementary stroke. Stop fighting white-on-white.
- **Snap to layers, Figma-style.** Drag a layer near another's edge or center and it locks into place with a mint-green guide. Designs end up aligned without rulers.
- **`⌘K` for everything.** A fuzzy command palette covers every action — add text, switch canvas, change language, toggle safe-zones, copy a share link. Power users get speed; new users get discoverability.
- **Share by URL.** "Copy shareable link" packs the composition into a `#mint=...` hash. Paste it anywhere — the recipient opens the exact design (sans your background photo) in their browser.
- **Real mobile editor.** Not "responsive" — actually usable on a phone. Bottom action bar, drawer-based Layers and Style, pull-down to dismiss.
- **Installable & offline.** Add to home screen → MINT works without a network. PWA with manual SW registration so it plays nice with strict CSP.
- **English / Русский** in parity, with the language toggle persisted per device.

## See it in action

> All clips are short, silent loops — under 15 seconds each.

### 1. Drop, type, export

<!-- TODO: workflow.gif — 12 s: drop a photo, add a headline, click Smart Contrast, export PNG -->
<img src="docs/demo/workflow.gif" alt="A photo is dropped onto the canvas. A headline is typed. Smart Contrast turns the text white with a soft stroke. Export dialog opens, PNG is downloaded." width="900" />

### 2. Snap to layer guides

<!-- TODO: snap.gif — 8 s: drag a layer near another, watch mint-green guide appear, drag near canvas center -->
<img src="docs/demo/snap.gif" alt="A text layer is dragged across the canvas. Mint-green dashed guides appear when its left edge aligns with another layer's left edge, then when its center matches another center, then when it hits the canvas center." width="900" />

### 3. ⌘K command palette

<!-- TODO: palette.gif — 6 s: press Cmd+K, type "exp", hit Enter → export dialog opens; press Cmd+K, type "story" → preset switches -->
<img src="docs/demo/palette.gif" alt="Cmd+K opens the command palette. The user types 'export', the export action is selected, the export dialog opens. The palette opens again, the user types 'story', and the canvas switches to the 1080x1920 Story preset." width="900" />

### 4. Share by URL

<!-- TODO: share.gif — 10 s: design is composed, More → Share link → URL copied to clipboard. New tab → paste URL → same design opens. -->
<img src="docs/demo/share.gif" alt="A composed design is open. The user clicks More → Share link and a toast says 'Link copied'. A new browser tab is opened, the URL is pasted, and the same design loads (without the background photo, with a hint to add one)." width="900" />

### 5. Reframe the background photo

<!-- TODO: bg-drag.gif — 8 s: photo is on canvas, user drags it inside the frame; uses a corner handle to zoom; clicks Reset position -->
<img src="docs/demo/bg-drag.gif" alt="A photo on the canvas is dragged around inside the frame, then zoomed using a corner handle, then a Reset position button returns it to auto-fit." width="900" />

### 6. Mobile

<!-- TODO: mobile.gif — 12 s on a phone viewport: open empty state, add text, swipe up the Style drawer, change color, export -->
<img src="docs/demo/mobile.gif" alt="MINT on a phone screen. The user taps Add text from the empty state, opens the Style drawer with a swipe, changes color, and taps Export." width="400" />

## Everything you can do

<details>
<summary><strong>Compose</strong> — canvas, photo, layers</summary>

- Three canvas presets: **Square (1080)**, **Portrait (1080×1350)**, **Story (1080×1920)**.
- **14 curated templates** across Announcement, Quote, Social, Promo, Dev — one click to drop a starter composition.
- **Drop or paste** any JPEG / PNG / WebP as a background. Files stay local; max 15 MB with magic-byte safety checks.
- **Manual reframe** — drag the photo on the canvas, corner-zoom uniformly, **Reset position** to return to auto-fit, **Crop ↔ Fit** to flip the auto-fit mode.
- **Canvas color** shows wherever the photo doesn't cover, so transparent backgrounds and "Fit" mode look intentional.

</details>

<details>
<summary><strong>Style text</strong> — fonts, color, effects</summary>

- 30+ Google Fonts loaded on demand. Find them with the fuzzy font search.
- Full type controls: **size, weight (100-900), color, opacity, alignment, line height, letter spacing**.
- Per-layer **shadow**, **stroke**, and **background fill** with padding + border radius.
- **Smart Contrast** — one click picks a readable color + stroke from the photo under the layer.
- **Fit-to-width** — autosize the font so the headline spans the layer's width without re-typing.

</details>

<details>
<summary><strong>Layer system</strong></summary>

- **Drag-to-reorder** with `@dnd-kit` (keyboard accessible — Space to pick, arrows to move).
- **Lock, hide, duplicate** per layer.
- **Copy / paste / delete** with standard shortcuts.
- **Undo / redo** with smart coalescing — a drag-then-zoom gesture is one undo entry, not 60.
- **Snap to layer edges** + canvas centerlines, with live mint-green guides.

</details>

<details>
<summary><strong>Export & share</strong></summary>

- **PNG, JPEG, WebP** at 1× or 2× scale with a live preview and size estimate.
- **Filename customization** before download.
- **Safe-zone overlays** show where Instagram and TikTok crop your headline.
- **Shareable URL** packs the composition into a hash — paste it anywhere.
- **`.json` save / load** for full project portability (photo included, no server).

</details>

<details>
<summary><strong>Quality-of-life</strong></summary>

- **Autosave** to `localStorage` with a live "Saved" indicator. Per-device opt-out.
- **Installable PWA** — add to home screen, opens like a native app, works offline.
- **English / Русский** at full parity, language persists across sessions.
- **Command palette (`⌘K`)** for every action — add text, switch preset, share link, change language, toggle safe-zones, autosave on/off.
- **Mobile-first drawers** with pull-down-to-dismiss gesture.

</details>

## Built for the keyboard

| Action                         | Shortcut                             |
| ------------------------------ | ------------------------------------ |
| Command palette                | `⌘K` / `Ctrl+K`                      |
| Add text layer                 | `T`                                  |
| Undo / redo                    | `⌘Z` / `⌘⇧Z` or `⌘Y`                 |
| Duplicate selected layer       | `⌘D`                                 |
| Copy / paste layer             | `⌘C` / `⌘V`                          |
| Delete selected layer          | `⌫` / `Delete`                       |
| Export                         | `⌘E`                                 |
| Browse templates               | `⌘G`                                 |
| Deselect / close dialogs       | `Esc`                                |
| Nudge selected layer           | `←↑→↓` (or `Shift+arrows` for 10 px) |
| Keyboard shortcuts cheat sheet | `?`                                  |

## Your photos stay on your device

MINT has no backend. There is no upload queue, no project sync, no telemetry. The "Save project" file is a `.json` you keep. Autosave writes to `localStorage` on your device and can be turned off in the overflow menu, with a one-click button to wipe it.

- **No tracking pixels** — the page loads exactly the assets it needs to run.
- **Strict CSP** — no inline scripts. The PWA service worker is registered manually to keep the policy clean.
- **No third-party fonts at load time** — Google Fonts are fetched only when a user picks one.
- **Hand-rolled input validation** — every parsed project file (loaded from disk or from a share link) is bounds-checked before it touches the canvas. See [`document-validation.ts`](apps/web/src/utils/document-validation.ts).

## Install it like an app

MINT is a Progressive Web App. On a desktop browser the install prompt appears in the URL bar; on mobile, use "Add to Home Screen". After install:

- Opens in its own window without browser chrome.
- Works **offline** — once cached, you can compose images on a plane.
- Updates in the background; reload to pick up new versions.

---

## For developers

> If you're not here to read code, you can skip this section.

### What I built and learned

A few engineering decisions worth a read:

- **Canvas as state, not as DOM.** [Fabric.js](https://fabricjs.com/) owns the visual representation; [Zustand](https://github.com/pmndrs/zustand) owns the source of truth. A thin `FabricAdapter` translates store mutations into canvas operations and selection / drag events back into store actions. The store is the single writer; the canvas is a renderer.
- **Command-pattern history with coalescing.** Every mutation is a `Command` with `execute` / `undo`. A slider drag fires 60 events; the history coalesces adjacent updates from the same source into one undo entry, so `Cmd+Z` matches user intent.
- **Pure snap geometry.** Smart guides ([`snap.ts`](packages/editor/src/adapter/snap.ts)) live as a pure function over rectangles — the adapter calls it and renders the result. The math is unit-tested without spinning up a real canvas.
- **Defence-in-depth validation.** Loaded project files (from disk _or_ `#mint=...` share links) go through bounds checks — coordinates, font size, image dataURL prefix, layer count — so a hand-edited payload can't OOM the canvas or sneak in a `javascript:` URL.
- **Design before code.** The repo includes [`docs/design/BRIEF.md`](./docs/design/BRIEF.md) — a real brief with before/after screenshots and an acceptance checklist. The redesign PR matched the brief, not the implementer's mood.
- **i18n from day two.** Retrofitting Russian into a polished UI would have hurt. `en.json` and `ru.json` ship in parity, and CI catches diverging keys.

### Tech stack

<p>
  <img alt="React 18" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite 6" src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" />
  <img alt="MUI v6" src="https://img.shields.io/badge/MUI-v6-007FFF?logo=mui&logoColor=white" />
  <img alt="Fabric.js" src="https://img.shields.io/badge/Fabric.js-6-FF6B6B" />
  <img alt="Zustand" src="https://img.shields.io/badge/Zustand-5-2D3748" />
  <img alt="dnd-kit" src="https://img.shields.io/badge/dnd--kit-6-6B7280" />
  <img alt="cmdk" src="https://img.shields.io/badge/cmdk-1-000000" />
  <img alt="Playwright" src="https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white" />
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-2-6E9F18?logo=vitest&logoColor=white" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white" />
  <img alt="Node 22" src="https://img.shields.io/badge/Node-22-339933?logo=node.js&logoColor=white" />
</p>

### Architecture

```text
apps/
  web/        React + Vite frontend (the editor)
  api/        optional backend playground — currently unused
packages/
  core/       domain types, presets, factories, export helpers
  editor/     Zustand store, command history, Fabric.js adapter, snap math
  ui/         reusable components + MUI theme + Google Fonts loader
  utils/      small shared helpers (no DOM)
```

Design brief that drove the UI: [`docs/design/BRIEF.md`](./docs/design/BRIEF.md).

### Quick start

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

### Scripts

```bash
pnpm dev          # run the web app locally
pnpm build        # build all packages
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # Playwright end-to-end
pnpm lint         # eslint across the monorepo
pnpm format:check # Prettier check
```

### CI / deploy

`push` to `main` triggers [`ci.yml`](./.github/workflows/ci.yml) (lint, format, build, unit, e2e) and [`deploy-pages.yml`](./.github/workflows/deploy-pages.yml) (GitHub Pages from `apps/web/dist`). In repo Settings → Pages, **GitHub Actions** must be the source.

### Contributing

Bug reports, feedback, and PRs are welcome — see [`CONTRIBUTING.md`](./CONTRIBUTING.md). Good first targets: new templates, more Google Fonts, RTL support.

---

## Star, share, support

If MINT saves you an hour you'd have spent fighting Canva:

- [Star this repo](https://github.com/Dimagious/mint) — it costs nothing and helps others find it.
- [Buy me a coffee](https://buymeacoffee.com/dimagious) — appreciated, never expected.
- File issues with screenshots — small UI nits make the product better.

## License

[MIT](./LICENSE) — fork it, ship a derivative, use it for client work. Just don't sell it as someone else's "AI design platform".
