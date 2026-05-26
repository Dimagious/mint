# Deferred from the portfolio backlog

The portfolio backlog (`docs/BACKLOG.md`) was scope-cut at the end of the first work session because the remaining items are multi-day, lower-blocker, or both. Listed here so they don't get forgotten — none of them are publication blockers, but each is a sensible follow-up PR.

## Phase 1 — code quality, deferred

- **`App.tsx` god-component split.** App.tsx is now ~750 lines and would benefit from extracting `useKeyboardShortcuts` (the `keydown` effect), `useAutosave` (the localStorage write + restore), and `<TopBar />` / `<MobileBottomBar />` / `<MobileDrawers />` sub-components. Deferred because splitting it carries a real regression risk; the current shape is well-commented and works.
- **`StylePanel.tsx` split** into `packages/ui/src/components/style-panel/{ColorChip,QuickTools,TextTab,LayoutTab,EffectsTab,NumberSlider,EffectCard,SegPill}.tsx`. ColorChip is already extracted; the rest is the same risk vs reward trade-off.
- **DI for the command history singleton.** Currently a module-scope `CommandHistory` instance is shared across the store. Tests can use `__resetHistoryForTests` (added in the store cleanup commit); a future iteration could inject the history via a factory so multiple stores can coexist for, say, a side-by-side comparison view.
- **`FabricAdapter` integration tests.** Hard to write well without a real browser canvas. Could be added as a separate Playwright spec that drives the adapter through visible UI rather than unit-testing the adapter directly.

## Phase 2 — features, queued

In rough priority order:

1. **Template Gallery.** 20–30 ready-made compositions as `.json` files in `/templates`, loaded via the existing `loadDocument`. The single biggest engagement win in the backlog. ~2–3 days.
2. **Copy-to-clipboard PNG** + Twitter / Threads / Telegram share intents. `navigator.clipboard.write([new ClipboardItem(...)])`. ~Few hours.
3. **Shareable project links.** Serialize the (image-less) `EditorDocument` into `?d=lz-string(json)` so people can hand around remixable cards. ~1–2 days.
4. **Command Palette** (`Cmd+K`) via `cmdk` + **PWA manifest** via `vite-plugin-pwa`. ~1 day. Disproportionate "pro-tool" perception bump for the code spend.
5. **Eyedropper API** (`new EyeDropper().open()`), snap-to-center guides (Figma-style pink lines), "Surprise me" random-gradient backgrounds, Text presets (Headline / Subheadline / Caption), recent-color swatches across all chips.

## Phase 3 — differentiator (multi-day each)

- **CLI / Headless generation.** `npx @mint/cli generate --template launch.json --vars '{"title":"v2.0"}' --out launch.png`. Reuses `EditorDocument` and a Node-side fabric renderer. Use case: changelog banners and GitHub release graphics in CI.
- **Code Snippets layer.** Shiki/Prism as a new layer type, syntax-highlighted snippet on a real photo. Carbon.now.sh fused with the photo background — direct hit on dev-Twitter.

Both are 2–3 days of focused work; do one at a time, not in parallel.

## Phase 4 — content still to do

- **OG / Twitter Card image.** The standard size is 1200×630, none of MINT's social presets exactly match. Either add a 1200×630 preset (and an i18n key for "Open Graph") or generate the OG image as a standalone Playwright script. Drafts of the social posts that need this image are in `docs/launch/POSTS.md`.
- **Loom video.** 15-second screencast per the script in `docs/launch/POSTS.md`. Needs a quiet recording environment.
- **PH submission day-of work.** Categories, makers list, hunter coordination — not coding work, but worth a calendar slot.

## Things I considered and ruled out

- **Real-time collaboration (y.js).** Lots of engineering, very few users on a pet project.
- **Plugin API.** Pre-mature without two or three concrete plugin use cases.
- **MP4 / GIF animated export.** Big engineering risk and dilutes the "ship a single PNG fast" positioning.
- **`apps/api/` build-out.** Currently a one-constant playground. Leave or delete in a separate cleanup PR — either is fine.
