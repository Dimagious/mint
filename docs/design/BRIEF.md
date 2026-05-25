# MINT — Design Brief for Claude Design (Redesign Phase 1)

> **Goal:** Bring MINT's UI from "homemade dev tool" to "modern, friendly, obvious-on-first-sight" — comparable to Notion / Figma / Linear in polish, but staying simple enough for non-designers.
>
> **Scope:** Full redesign allowed (layout, visual language, components). Logic stays untouched.
>
> **Style direction:** Friendly / playful (Notion + Figma vibe), light by default, mint as accent (not as everything), rounded shapes, illustrative icons, generous whitespace.

---

## 1. Product context (read first)

**MINT = Merge Image'N Text.** A tiny browser-only editor that turns "background image + text overlay" into ready-to-post social images (Square / Portrait / Story). No accounts, no server, no templates engine.

**Audience:** Mixed — a complete beginner who never touched Canva, AND an SMM person who wants speed. Beginner mode must be obvious; power features stay accessible.

**Tech constraints (do not break):**

- React 18 + TypeScript + Vite + MUI v6 (Material UI). Theme is in `packages/ui/src/theme.ts`.
- Canvas rendering is `fabric.js` — **do not touch** `CanvasPanel`/`FabricAdapter` internals; only restyle the wrapping chrome around the `<canvas>`.
- i18n via `react-i18next`, English + Russian. New strings → add to both `apps/web/src/i18n/en.json` and `ru.json`.
- All state goes through `@mint/editor` store (Zustand). Don't reshape the store.
- Deploy target is GitHub Pages (static). No SSR.

---

## 2. What's wrong with the current UI (evidence-based)

See `docs/design/01..06-*.png` for the baseline screenshots. Concrete issues:

### 2.1 Monochrome overload

The whole app is **the same mint hue** — background, borders, buttons, text, accents. There's no visual hierarchy: every surface competes for attention because nothing rests. The mint stops feeling premium and starts feeling like a school project.

### 2.2 No onboarding / empty state

First load shows: an empty mint rectangle in the middle, a "Keep key text in the middle area" tooltip, and two side panels that say "Click Add" / "Select a layer". A new user has **zero idea** what MINT does or where to start. There are no:

- example backgrounds (the existing CANVAS_PRESETS could be illustrated)
- "Start with a template" CTA
- demo / animated hint
- keyboard shortcut cheat sheet

### 2.3 Toolbar density and inconsistency

The top bar mixes 4 styles in one row: text+icon buttons (Undo/Redo/Add Text), a filled CTA (Export), a row of pure icon buttons (Save, Open, Safe Zones, Coffee), and a 2-segment toggle (EN/RU). On 1440px it just barely fits; below that it wraps awkwardly. Save/Open/Safe-Zones-toggle/Donate/Language belong in a **single overflow menu or a separate utility cluster**, not the primary toolbar.

### 2.4 Style panel = vertical wall of 12+ controls

Currently the right panel stacks: text input → quick tools block → font autocomplete → font size (number + slider) → weight select → color picker (raw `<input type=color>`) → opacity slider → align select → line height slider → letter spacing slider → shadow accordion → stroke accordion → background accordion. No grouping, no tabs. The user scrolls a wall to change a font weight.

### 2.5 Layer list item is unreadable

Each layer row has the layer text **plus 6 icon-only buttons** (up, down, eye, lock, duplicate, delete) crammed into 260px. On selection the row gets a faint background; the action icons stay the same color so it's hard to tell which row is active. On mobile the text is truncated to ~10 characters before the icon stack starts.

### 2.6 Color pickers look like 1999

Three different places use raw `<input type="color">` with no border, just a thin colored bar. They don't match the rounded, soft-bordered MUI theme everywhere else.

### 2.7 Mobile editor has wasted space

Above the canvas there's a huge empty area between the toolbar and the canvas (see `04-mobile-empty.png`). The canvas could be ~30% larger. The bottom "Layers / Style" bar is fine in concept but visually it's just two plain text buttons.

### 2.8 Export dialog is bare

"Format" with PNG/JPG, optional quality slider, two buttons. Missing: filename preview, output dimensions reminder, file-size estimate, a thumbnail preview.

### 2.9 Iconography is generic MUI

Default Material icons are fine but generic. A playful product deserves a softer/more rounded icon family (Lucide rounded, Phosphor duotone, or Tabler). Keep them monoline for consistency.

### 2.10 No visual feedback that work is autosaving

`localStorage` autosave runs every 500ms but the user has no idea. There's no "Saved", no "Last edit 2s ago", no offline indicator.

---

## 3. Direction (what "good" looks like)

### 3.1 Mood

- **Notion-meets-Figma**, lightweight: warm off-white surfaces (not pure white), 1 accent color (mint), 1 neutral palette, soft long shadows.
- Rounded everything (10–16px corners on cards, 8–12 on buttons, 999px on chip-style toggles).
- Generous breathing room (16/24/32px rhythm).
- One playful illustration on the empty canvas state (mint leaf / abstract pastel shapes).
- Friendly micro-copy ("Drop an image to start" instead of "Background → Upload Image").

### 3.2 Visual hierarchy fix — drop the all-mint

Reserve **mint only for primary actions, selected states, and brand**. The rest:

- App background: warm neutral `#FAFAF7` or `#F7F7F4` (off-white).
- Surfaces (panels, cards): pure white with very soft shadow (`0 1px 2px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.04)`).
- Text: neutral charcoal `#1A1D1B` (primary) / `#5E6764` (secondary), not mint.
- Borders: `rgba(0,0,0,.06)` hairlines — almost invisible.
- Mint: primary CTA (`Export`), focus rings, brand logo, selected layer highlight only.
- Add a single warm accent for danger (delete) — soft coral `#E26D5C`.

### 3.3 Typography

- UI: **Inter** (already loaded via fonts list) at 14/16px sizes. Replace the current `"Trebuchet MS", "Segoe UI", "Inter"` cascade which renders inconsistently across OS.
- Headings: Inter SemiBold 16/18/22.
- Numeric labels (font size, %): tabular-nums for stable width.

### 3.4 Iconography

Switch from MUI icons to **Lucide** (`lucide-react`, monoline, rounded). Map the icons used today:

- Undo/Redo, Type (add text), Download (export), Save, FolderOpen, Frame (safe zones), Coffee, MoreVertical
- Visibility/VisibilityOff, Lock/Unlock, Copy, Trash2, ChevronUp/ChevronDown, GripVertical (for drag handle — see §5.2)

---

## 4. Layout (desktop ≥ 1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ◯ MINT     [ Canvas: Square ▾ ]              ↶ ↷  •  + Add Text  ⤓ Export │  ← top bar
│                                                                ⋯   │
├──────────┬───────────────────────────────────────────┬────────────┤
│          │                                           │            │
│ ▾ Canvas │                                           │  Text      │
│  • Bg    │                                           │  Position  │
│  • Color │              [    canvas    ]             │  Effects   │  ← right-side
│          │                                           │            │     style panel
│ ▾ Layers │                                           │  (tabs)    │     (tabs, not wall)
│   • L1   │                                           │            │
│   • L2   │                                           │            │
│   + Add  │                                           │            │
│          │                                           │            │
└──────────┴───────────────────────────────────────────┴────────────┘
                          ↑                              ↑
              centered on neutral bg          280-320px, scroll-free
              soft shadow under canvas             when tabs are short
```

### 4.1 Top bar

- Logo + small wordmark **MINT** (single line, ~32px tall).
- Canvas preset selector — keep as a dropdown but show preview shape + dimensions (e.g. small filled rectangle in the right proportions next to "Square 1080×1080").
- Center / right group:
  - Undo / Redo (icon-only, with shortcut tooltip)
  - Subtle separator
  - `+ Add Text` (outlined)
  - `⤓ Export` (primary filled mint)
- Far right `⋯` overflow menu hosting: Save project, Open project, Safe zones toggle, Language, Buy me a coffee, Keyboard shortcuts, About.
- **Autosave indicator**: tiny dot + "Saved" / "Saving…" between Redo and Add Text — proves autosave exists.

### 4.2 Left panel ("Canvas & Layers")

Merge today's "Background" + "Layers" into **one collapsible-section panel** (280px):

- Section: **Canvas** — background image (drop zone or upload button), background color, fit toggle (cover/contain).
- Section: **Layers** — list with new card-style layer item (see §5.2), `+ Add text` button at the bottom of the section.
- Section: **Safe zones** — toggle moved here from the toolbar (this is where it belongs contextually).

### 4.3 Right panel ("Style")

**Tabbed** (Notion-style underlined tabs) so the wall of controls gets split:

- **Text** — the text content + font + size + weight + color + alignment.
- **Layout** — opacity + line height + letter spacing + (new) rotation slider.
- **Effects** — shadow / stroke / background fill (each as a section card with the on/off toggle in the section header, no more accordion).
- **Quick tools** — fixed at the top of the panel (above tabs) so they're always reachable: Left/Center/Right + Top/Middle/Bottom as 2 icon-button groups + Fit-To-Width + Smart Contrast buttons.

### 4.4 Center

- Canvas remains centered, but elevate it with a soft white card + drop shadow.
- Add a small ruler badge top-left of the canvas: `1080 × 1080`.
- Replace the current Drop-image overlay (`rgba(25,118,210,.15)` — blue, off-brand) with a mint dashed border + an icon + helper text in the brand font.
- Add subtle dotted grid background on the **app** behind the canvas (1px dots, 16px grid, `rgba(0,0,0,.04)`) — gives a creator-tool feel like Figma.

### 4.5 Empty state on canvas (CRITICAL — the user's #1 complaint)

When the canvas has no background and zero layers, render an overlay inside the canvas card:

```
        ┌───────────────────────┐
        │       [mint leaf]     │
        │                       │
        │  Let's make something │
        │                       │
        │  ⤓ Drop an image, or  │
        │  [ Upload image ] [ + Add text ] │
        │                       │
        │  💡 Tip: press ⌘+Z to undo │
        └───────────────────────┘
```

- Disappears as soon as the user uploads bg OR adds first layer.

---

## 5. Component specs (precise)

### 5.1 Layer item card (replaces `LayerListItem.tsx`)

Old: row with truncated text + 6 inline icons (always visible) → cluttered.

New:

```
┌──────────────────────────────────────────┐
│ ⋮⋮  [aA]  New Text                  ●●●  │  ← grip + type chip + name + actions (visible on hover OR when selected)
│         18px Inter Bold, mint         👁 🔒 │  ← secondary line: small style preview
└──────────────────────────────────────────┘
```

- Default state: text only + visibility/lock indicators if NOT default. Three-dot menu hides Duplicate / Delete.
- Hover/selected: action row fades in.
- Selected: 2px mint left border + faint mint bg.
- Drag handle (`⋮⋮`) on the left → use `dnd-kit` for keyboard-accessible reordering (replaces up/down arrow buttons).
- Truncate with ellipsis after ~22 chars, full text shown in tooltip.

### 5.2 Color picker

Stop using raw `<input type=color>`. Build a small popover picker (or use `react-colorful`):

```
[ ●  #2F9F7A ]   ← chip + hex; click opens popover with palette + native picker
```

- Show recently-used colors row.
- Show a small "smart contrast suggestion" pill when on canvas with background image.

### 5.3 Number + slider combo (font size, line height, opacity, etc.)

Today: full-width slider AND a separate number input. Combine into a single compact control:

```
Font size                                ⬡ 48 ⬡
━━━━━━━●─────────────────────────────────────
```

Where `⬡ 48 ⬡` is a chip with `-` / `+` micro-buttons that also accepts typing. Saves ~50% vertical space.

### 5.4 Alignment quick tools

Today: 6 text buttons "Left/Center/Right" and "Top/Middle/Bottom".
New: 2 grouped icon button groups (`AlignLeft / AlignCenter / AlignRight` + `AlignStart / AlignMiddle / AlignEnd` from Lucide), each as 3 segments inside one rounded pill. Reduces visual weight by ~70%.

### 5.5 Font picker

Today: Autocomplete with category grouping — fine logic. UX problems:

- Each row should render the font name **in the actual font**, with a 24px size preview (currently does this for own family but spacing is tight).
- Add a "Recently used" group at the top.
- Add a 1-line search hint: "Find a font..."

### 5.6 Export dialog

Add to the existing layout:

- **Live preview** thumbnail (160×160 of the current canvas at the chosen format/quality).
- Filename input (default = `mint-2026-05-25-1432.png`, editable).
- Right under the format toggle: "Will export at **1080 × 1080**" (uses preset dims).
- File size estimate (rough: `quality × pixels × format ratio`).
- Optional: a "2x" / "1x" toggle for HiDPI export.

### 5.7 Top-bar Save/Open

Move to overflow menu. Reduce 5 separate icon buttons → 1 `⋯`. The only **always-visible** primary actions stay: Undo/Redo, Add Text, Export.

### 5.8 Safe zone overlay

Keep the dashed mint guides — but:

- Lower opacity (`rgba(47,159,122,.10)` for fill, `.4` for the dashes).
- Move the "Keep key text in the middle area" pill to the **bottom-left corner** of the canvas card (currently top-center, blocks the design).
- Hide the pill after first user interaction (auto-dismiss).

---

## 6. Mobile (≤ 900px)

See `04-..-06-mobile-*.png` for current state.

### 6.1 Compact app bar (56px)

- Logo (32px) — wordmark hidden below 360px.
- Preset selector compressed to icon + dropdown.
- Right side: Add Text icon, Export icon (primary mint pill), `⋯` overflow.
- Remove Undo/Redo from the top bar on mobile — they're useful but not primary. Put them in the bottom bar instead (see 6.3).

### 6.2 Canvas area

- Reduce vertical padding. Currently there's ~250px empty above the canvas — kill it.
- Pinch-to-zoom hint chip ("Pinch to zoom") on first session.

### 6.3 Bottom action bar

Today: just `Layers` / `Style` (Style disabled when no selection). Better:

```
┌──────────────────────────────────────────┐
│  ↶  ↷  │  ☷ Layers  ▌ Style  │  + ⤓     │
└──────────────────────────────────────────┘
```

- Left: Undo / Redo with disabled state.
- Center: Layers / Style — still drawers. Style label changes to **layer name** when one is selected ("Editing: Headline 1").
- Right: Add Text + Export.
- Use safe-area-inset-bottom for notch devices.

### 6.4 Drawers

- Make drawers reach 90dvh max with a clear drag handle at top.
- Each drawer header has a title + close (X) on the right.
- Style drawer: same tabbed layout as desktop (Text / Layout / Effects). Tabs work great on mobile too — Notion does this.

---

## 7. Concrete changes to existing components

| File                                                                                               | Action                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [packages/ui/src/theme.ts](../../packages/ui/src/theme.ts)                                         | Rewrite palette per §3.2; add `MuiToggleButton`, `MuiSlider`, `MuiTabs` style overrides; tighten typography (Inter only).                                                                                                                                                                                                                                                                                                   |
| [apps/web/src/App.tsx](../../apps/web/src/App.tsx)                                                 | Top bar: collapse Save/Open/SafeZones/Coffee/Lang into `⋯` overflow. Add autosave indicator.                                                                                                                                                                                                                                                                                                                                |
| [apps/web/src/components/LayersPanel.tsx](../../apps/web/src/components/LayersPanel.tsx)           | Merge "Background" + "Layers" into one panel with collapsible sections. New empty-state hint.                                                                                                                                                                                                                                                                                                                               |
| [packages/ui/src/components/LayerListItem.tsx](../../packages/ui/src/components/LayerListItem.tsx) | Card redesign per §5.1. Hide action icons until hover/select. Replace up/down arrows with drag handle (later phase: install `@dnd-kit/sortable`).                                                                                                                                                                                                                                                                           |
| [apps/web/src/components/PropertiesPanel.tsx](../../apps/web/src/components/PropertiesPanel.tsx)   | Wrap StylePanel in MUI `Tabs` (Text / Layout / Effects).                                                                                                                                                                                                                                                                                                                                                                    |
| [packages/ui/src/components/StylePanel.tsx](../../packages/ui/src/components/StylePanel.tsx)       | Split into 3 tab subcomponents. Replace raw `<input type=color>` with color popover. Collapse number-input + slider per §5.3. Convert alignment buttons to icon groups. Promote Quick Tools above the tabs.                                                                                                                                                                                                                 |
| [packages/ui/src/components/ExportDialog.tsx](../../packages/ui/src/components/ExportDialog.tsx)   | Add preview thumbnail, filename input, output dimensions, file size estimate per §5.6.                                                                                                                                                                                                                                                                                                                                      |
| [apps/web/src/components/CanvasPanel.tsx](../../apps/web/src/components/CanvasPanel.tsx)           | Wrap `<canvas>` in elevated card (soft shadow). Re-color drop overlay to mint. Move safe zone hint pill to bottom-left, add auto-dismiss. **Add empty-state overlay** (§4.5) when `doc.background.dataUrl === null && doc.layers.length === 0`.                                                                                                                                                                             |
| [apps/web/src/components/ToolbarSection.tsx](../../apps/web/src/components/ToolbarSection.tsx)     | Replace plain text option with icon (small filled rectangle in correct ratio) + dimensions.                                                                                                                                                                                                                                                                                                                                 |
| **NEW** `apps/web/src/components/EmptyStateOverlay.tsx`                                            | The illustrated first-run overlay.                                                                                                                                                                                                                                                                                                                                                                                          |
| **NEW** `apps/web/src/components/AutosaveBadge.tsx`                                                | Subscribe to document changes, show debounced "Saved 3s ago" pill.                                                                                                                                                                                                                                                                                                                                                          |
| **NEW** `apps/web/src/components/ShortcutsDialog.tsx`                                              | A modal with the keyboard cheat sheet (the shortcuts already implemented in `App.tsx`).                                                                                                                                                                                                                                                                                                                                     |
| [apps/web/src/i18n/en.json](../../apps/web/src/i18n/en.json) + `ru.json`                           | Add keys for: `app.tagline`, `empty.title`, `empty.cta.upload`, `empty.cta.addText`, `empty.tip`, `autosave.saving`, `autosave.saved`, `autosave.savedAgo`, `toolbar.shortcuts`, `shortcuts.title`, `shortcuts.undo`, `shortcuts.redo`, `shortcuts.duplicate`, `shortcuts.copy`, `shortcuts.paste`, `shortcuts.delete`, `shortcuts.deselect`, `shortcuts.nudge`, `style.tab.text`, `style.tab.layout`, `style.tab.effects`. |

---

## 8. Acceptance checklist for the redesign PR

A user testing the result should be able to honestly say "yes" to all of these:

1. [ ] First-load: I see a clear "what is this and how do I start" overlay on the canvas.
2. [ ] I can complete the core flow (upload image → add text → change color → export) without reading any docs.
3. [ ] The right panel doesn't require scrolling to change font size or color.
4. [ ] On a phone (390×844) the canvas takes at least 60% of the vertical viewport.
5. [ ] The top bar fits at 1024px without wrapping.
6. [ ] When I select a layer, the row in the left panel is unmistakably highlighted.
7. [ ] I can tell at a glance whether autosave is working.
8. [ ] No screen has 3+ different visual styles competing in the same row of controls.
9. [ ] The Export dialog shows me what I'm about to export and at what size.
10. [ ] The color picker doesn't look like a 1999 form input.
11. [ ] Light/dark contrast: WCAG AA on all text vs background.
12. [ ] Keyboard shortcuts are discoverable (Help → Shortcuts).
13. [ ] All new strings exist in both `en.json` and `ru.json`.
14. [ ] All existing E2E tests (in `apps/web/e2e/`) still pass — selectors used in tests are preserved (`data-testid` on layers-panel, properties-panel, app-title, mobile-layers-button, mobile-properties-button, bg-upload).

---

## 9. What NOT to do

- Don't introduce a new state management library (Zustand stays).
- Don't switch to Tailwind. We're on MUI v6 + emotion — keep it. Use `sx` and styled components.
- Don't add accounts, cloud sync, templates engine, or any backend. MINT is intentionally browser-only.
- Don't change the i18n library (keep `react-i18next`).
- Don't break `data-testid` attributes used by E2E tests.
- Don't replace `fabric.js` or restructure the canvas adapter.
- Don't bundle huge font files — keep the Google Fonts on-demand loader in `packages/ui/src/fonts.ts`.

---

## 10. Deliverable

A single PR titled `feat(ui): redesign — modern, friendly, beginner-first` with:

- Updated `theme.ts`, `App.tsx`, all touched components per §7.
- New files per §7 (EmptyStateOverlay, AutosaveBadge, ShortcutsDialog).
- New i18n keys in both languages.
- Updated screenshots in `docs/design/after-*.png` matching the same scenes as `01..06`.
- Passing `pnpm lint && pnpm test && pnpm --filter @mint/web test:e2e`.

---

## Appendix A — Baseline screenshots

These are the "before" shots taken from the live deployment ([https://dimagious.github.io/mint/](https://dimagious.github.io/mint/)) on 2026-05-25:

- [`01-desktop-empty.png`](./01-desktop-empty.png) — landing state, 1440×900
- [`02-desktop-with-text.png`](./02-desktop-with-text.png) — single text layer added, 1440×900
- [`03-desktop-export-dialog.png`](./03-desktop-export-dialog.png) — Export modal, 1440×900
- [`04-mobile-empty.png`](./04-mobile-empty.png) — mobile landing, 390×844
- [`05-mobile-layers-drawer.png`](./05-mobile-layers-drawer.png) — bottom Layers drawer open
- [`06-mobile-properties-drawer.png`](./06-mobile-properties-drawer.png) — bottom Style drawer open

Refer to these when making "before → after" comparisons.
