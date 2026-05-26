# MINT — Make social images in your browser

[English](README.md) | [Русский](README.ru.md)

<p align="center">
  <img src="docs/logo.svg" alt="MINT logo" width="96" />
</p>

<p align="center">
  <strong>Drop an image, drop in some text, hit Export.</strong><br/>
  Make scroll-stopping social images in your browser — no upload, no account, no subscription.
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
  <img src="docs/design/after-02-desktop-with-text.png" alt="MINT editor with a text layer placed on a square canvas" width="900" />
</p>

---

## Why this exists

I draft a lot of small social images — post covers, story slides, side-project announcements — and every "lightweight Canva alternative" wanted my email, my project saved to their cloud, and a Pro upsell. I wanted a tool that does one thing well, runs entirely in my browser, and gets out of the way.

**MINT = Merge Image'N Text.** Open the page, drop a background, type your headline, export a PNG. That's the whole product. No account wall, no project folders, no AI suggestions, no template marketplace.

## What I learned building it

A short engineering write-up of three things that made this fun to build:

- **Canvas as state, not as DOM.** [Fabric.js](https://fabricjs.com/) owns the visual representation, [Zustand](https://github.com/pmndrs/zustand) owns the source of truth. The two systems talk through a thin `FabricAdapter` layer that translates store mutations into canvas operations, and selection/drag events back into store actions. It took a while to land on this — see the longer write-up linked from the project page.
- **Design before code, even for a pet.** The repo includes [`docs/design/BRIEF.md`](./docs/design/BRIEF.md) — a real design brief written before the redesign pass, with `before` and `after` screenshots, hard constraints, and an acceptance checklist. The redesign PR matched the brief, not the implementer's mood.
- **i18n from day two.** Adding `react-i18next` early was cheap; retrofitting Russian into a polished UI later would have hurt. Both `en.json` and `ru.json` ship in parity, and the language toggle survives reloads via `localStorage`.

## Tech stack

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

**Why these:**

- **React + MUI v6** so I could focus on product shape, not a custom design system.
- **Fabric.js** rather than raw canvas because text-with-shadow-and-stroke is a solved problem I didn't want to re-solve.
- **Zustand** with a command-pattern history (undo/redo) rather than something heavier — small, no boilerplate, easy to reason about.
- **Vite** for instant HMR and a sane build pipeline.
- **dnd-kit** for accessible, library-agnostic drag-to-reorder layers.
- **Playwright** + **Vitest** for tests; CI fails the PR if either breaks.
- **pnpm workspaces** so `core` / `editor` / `ui` / `utils` stay separable.

## Screenshots

|                                                                        |                                                                           |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| ![Desktop empty state](docs/design/after-01-desktop-empty.png)         | ![Desktop with text layer](docs/design/after-02-desktop-with-text.png)    |
| _Empty state — clear first-run guidance_                               | _Editing a text layer with the tabbed Style panel_                        |
| ![Export dialog](docs/design/after-03-desktop-export-dialog.png)       | ![Mobile empty state](docs/design/after-04-mobile-empty.png)              |
| _Export dialog: preview, filename, 1×/2×, size estimate_               | _Mobile: canvas-first, bottom action bar for Layers / Style / Export_     |
| ![Mobile layers drawer](docs/design/after-05-mobile-layers-drawer.png) | ![Mobile style drawer](docs/design/after-06-mobile-properties-drawer.png) |
| _Layers drawer — pull-down to dismiss_                                 | _Style drawer with tabs and inline color popover_                         |

## Features

- **Canvas presets** for the three formats people actually post in:
  - `1080 × 1080` — Square (Instagram feed, LinkedIn)
  - `1080 × 1350` — Portrait (Instagram, Pinterest)
  - `1080 × 1920` — Story (Instagram, TikTok, Shorts)
- **Text layers** with font, size, weight, color, opacity, alignment, line height, letter spacing, shadow, stroke, and a per-layer background fill.
- **Layer system** — reorder via drag-and-drop (keyboard accessible), lock, hide, duplicate, copy/paste, undo/redo with a single entry per gesture.
- **Smart Contrast** — one click samples the background under the text layer and picks a readable colour + stroke.
- **Fit-to-width** — auto-scales the font size so the headline spans the layer's width.
- **Safe-zone guides** for the social UI cutoffs that crop your headline if you don't think about them.
- **PNG, JPEG, and WebP export** with a live preview, scale toggle (1× / 2×), and a file-size estimate.
- **Keyboard shortcuts** for every primary action (`Cmd/Ctrl+Z/Y`, `T`, `Cmd+E`, `?` for the cheat sheet).
- **Autosave** to `localStorage` with a live "Saved" indicator; `.json` project save/load for portability.
- **Mobile-first editing** — drawer-based Layers and Style with pull-down dismiss.
- **English / Русский** in parity.
- **Zero server, zero account.** Everything stays in your browser.

## Quick start

```bash
pnpm install
pnpm dev
```

Then open <http://localhost:3000>.

## Scripts

```bash
pnpm dev          # run the web app locally
pnpm build        # build all packages
pnpm test         # run all unit tests
pnpm lint         # lint all packages
pnpm format:check # check Prettier formatting
pnpm test:e2e     # run Playwright E2E for the web app
```

## Architecture

```text
apps/
  web/       React + Vite frontend (the editor itself)
  api/       optional backend playground — currently unused
packages/
  core/      domain types, presets, factories, export helpers
  editor/    Zustand store, command history, Fabric.js adapter
  ui/        reusable React UI components + MUI theme + Google Fonts loader
  utils/     small shared helpers (no DOM)
```

The full design brief that drove the current UI lives in [`docs/design/BRIEF.md`](./docs/design/BRIEF.md) — useful context if you're considering a contribution.

## Deploy

This repo ships with a [`deploy-pages.yml`](./.github/workflows/deploy-pages.yml) workflow:

1. Push to `main`.
2. In GitHub repo settings, ensure **Pages** uses **GitHub Actions** as source.
3. Wait for the workflow to complete.

The workflow builds the monorepo and deploys `apps/web/dist`.

## Contributing

Contribution guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md). Issues and PRs welcome.

## Support

If MINT helps you publish content faster, you can [buy me a coffee](https://buymeacoffee.com/dimagious). It's appreciated, but never expected.

## License

[MIT](./LICENSE)
