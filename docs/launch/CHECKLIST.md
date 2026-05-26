# Launch checklist

Everything that should be true before MINT is shared publicly. Most of these are already done — check each off before posting.

## Code

- [x] CI workflow runs lint + format:check + unit + e2e on every PR (`.github/workflows/ci.yml`)
- [x] CI status badge in README hero
- [x] Bundle outputs trimmed (334 KB PNG logo removed; SVG everywhere)
- [x] Vite `base` typo fixed (`'social-posts-heler'` → `'mint'`)
- [x] WebP export wired through the FabricAdapter, not silently fallen back to JPG
- [x] Command history capped at 100 + coalescing slider drags into one undo entry
- [x] `UpdateTextLayerCommand` snapshots `previousState` only on first execute
- [x] Store `revision` counter; autosave no longer does `JSON.stringify(doc)` on every render
- [x] FabricAdapter: `WeakMap` for dataURL, reverse `WeakMap` for object → id (O(1) selection)
- [x] FabricAdapter: race-guarded async background load
- [x] Dead store `exportCanvas` removed; `addTextLayer` returns the new layer id
- [x] DnD reorder via `@dnd-kit/sortable` with keyboard + pointer sensors
- [x] Pull-down-to-dismiss for the two mobile drawers

## Security

- [x] `readImageFileSafely`: MIME whitelist (jpeg/png/webp), 15 MB cap, magic-byte check
- [x] `isEditorDocument` bounds-checks numeric fields, length-caps strings, validates dataURL prefix
- [x] Meta CSP in `index.html` + `Referrer-Policy: strict-origin-when-cross-origin`
- [x] localStorage opt-out (overflow menu) + one-click "clear saved data"
- [x] Raw `<input type="color">` removed from LayersPanel (replaced by ColorChip)

## A11y

- [x] Dialogs / Drawers carry `aria-labelledby`
- [x] LayerListItem activates with Enter / Space (keyboard users can select layers)
- [x] Disabled-text contrast bumped to ~4.6:1 (WCAG AA pass)
- [x] Global `:focus-visible` mint ring; no default browser blue
- [x] Drawer close `IconButton` has `aria-label`
- [x] `eslint-plugin-jsx-a11y` runs on every PR

## Tests

- [x] Unit: editor / core / utils / web / ui packages (37 tests)
- [x] `smart-contrast` colour decision pinned with 5 cases
- [x] `text-fit` binary search pinned with 6 cases
- [x] `readImageFileSafely` rejection + magic-byte happy path (8 cases)
- [x] E2E: smoke spec (3 cases) covers desktop + mobile flows

## Documentation

- [x] README hero + tagline + live demo + CI / license badges
- [x] "Why this exists" + "What I learned" sections
- [x] Tech stack with bedges and a "why these" paragraph
- [x] 2×3 screenshot grid (real coffee photo background, not mint-tinted mocks)
- [x] Quick start + scripts + architecture map
- [x] `README.ru.md` in parity
- [x] `docs/design/BRIEF.md` (the brief that drove the redesign)
- [x] `docs/design/screenshots-src/ATTRIBUTION.md` for the Unsplash photo

## Visual

- [x] Three logo variants unified into one SVG `MintMark`
- [x] Canvas dimension badge moved above the card (was inside the safe-zone band)
- [x] Mint as accent only — surfaces stay warm off-white, not mint-tinted
- [x] `after-*` screenshots reshot with a real photo

## Pre-launch (manual)

- [ ] Smoke-test the live URL on iPhone Safari + Android Chrome
- [ ] Smoke-test the live URL on desktop Firefox + Safari (Chromium-only testing isn't enough)
- [ ] Confirm GitHub Pages deploy is fresh — `gh workflow run deploy-pages.yml` if needed
- [ ] Sanity check the deployed bundle size: `dist/assets/index-*.js` ≤ 50 KB gzip
- [ ] Open the deployed page in an incognito window and confirm autosave isn't auto-loading a leaked session
- [ ] Try uploading a 20 MB photo → expect a friendly "image too large" snackbar
- [ ] Try uploading a renamed `.pdf` as `.png` → expect "doesn't look like a real image"
- [ ] Confirm `?` opens the shortcuts dialog
- [ ] Confirm Smart Contrast picks a sensible colour on a bright background

## Post-launch

- [ ] Pin the X comment with the source link
- [ ] Watch the Vercel / GitHub Pages analytics for the first 24 hours
- [ ] Reply to every comment in the first hour after each post
- [ ] Open issues for the top 3 pieces of feedback within a week
- [ ] Update `docs/launch/POSTS.md` with what worked / what didn't for next time
