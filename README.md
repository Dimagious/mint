# MINT

**Merge Image 'N Text** - a tiny browser editor to make social images fast.

[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Deploy: GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-222?logo=github&logoColor=white)](./.github/workflows/deploy-pages.yml)

MINT helps you create post/stories visuals with text overlays, export them quickly, and iterate without opening heavy design tools.

## Live Demo

After enabling GitHub Pages, the app will be available at:

`https://<your-username>.github.io/<your-repo>/`

For this repository:

`https://<your-username>.github.io/social-posts-heler/`

## Why This Exists

- Fast content drafts for personal projects.
- Clean flow: upload background -> add text layers -> export.
- Works fully in the browser (no server required).

## Features

- Canvas presets for common social formats:
  - `1080 x 1080` Square
  - `1080 x 1350` Portrait
  - `1080 x 1920` Story
- Drag-and-drop background image upload.
- Multiple text layers with:
  - font, size, weight, color, opacity
  - alignment, line height, letter spacing
  - shadow, stroke, and text background fill
- Layer controls: reorder, lock, hide, duplicate, copy/paste.
- Text quick tools:
  - safe-zone alignment (left/center/right, top/center/bottom)
  - fit text to layer width
  - smart contrast (auto text color + stroke)
- Keyboard shortcuts for faster editing (`Cmd/Ctrl+Z`, `Cmd/Ctrl+Y`, `Delete`, etc.).
- Autosave to `localStorage`.
- Project save/load (`.json`).
- PNG/JPG export.
- RU/EN UI switch.
- **Safe Zones overlay** for social UI cutoffs (great for stories).
- Mobile-first editing flow (bottom actions + mobile drawers for Layers and Style).
- Mint green pastel UI theme + branded logo.
- Visible **Buy Me a Coffee** CTA.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

```bash
pnpm dev          # run web app locally
pnpm build        # build all packages
pnpm test         # run all tests
pnpm lint         # lint all packages
pnpm test:e2e     # run Playwright e2e for web app
```

## Contributing

- Contribution guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- License: [`LICENSE`](./LICENSE)

## Deploy to GitHub Pages

This repo already includes a workflow: [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml)

1. Push to `main`.
2. In GitHub repo settings, ensure **Pages** uses **GitHub Actions** as source.
3. Wait for the `Deploy to GitHub Pages` workflow to complete.

The workflow builds the monorepo packages and deploys `apps/web/dist`.

## Monorepo Architecture

```text
apps/
  web/       React + Vite frontend editor
  api/       optional backend playground package
packages/
  core/      domain types, presets, factories
  editor/    state store + command history + fabric adapter
  ui/        reusable React UI components + theme + fonts
  utils/     shared helpers
```

## Product Positioning

MINT is intentionally simple:

- no account wall
- no complex timeline or templates engine
- fast execution for creators who want to post now

That makes it ideal for side projects, personal brands, and "built-on-a-vacation" stories.

## Roadmap

- Better mobile editing gestures for text positioning.
- Faster text-edit workflows (quick align, smart spacing, typography suggestions).
- Optional cloud sync for project files.

## Support

If MINT helps you publish content faster:

`https://buymeacoffee.com/mint`
