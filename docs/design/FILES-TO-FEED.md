# Files to feed Claude Design

Copy-paste the prompt below into a new Claude Design session, then attach the listed files. The brief is the only required context — everything else is so Claude Design can see actual code, not guess at it.

---

## Prompt to use (paste this verbatim)

> I'm redesigning a small browser-only image editor called **MINT**. Read `docs/design/BRIEF.md` first — it's the full design brief with rationale, layout sketches, component specs, and acceptance checklist. Then look at the baseline screenshots in `docs/design/01..06-*.png` to see the "before" state. After that, study the attached source files (theme, components, i18n, types) and produce the redesign as a single PR per §10 of the brief.
>
> Hard constraints (from §9 of the brief): stay on MUI v6 + emotion + Zustand + react-i18next, don't touch `FabricAdapter` internals, preserve all `data-testid` attributes used by E2E tests, ship i18n in EN+RU.
>
> Output: real code edits to the files listed below, plus new files explicitly called out in §7 of the brief. When you're done, regenerate the screenshots into `docs/design/after-*.png` using the same scenes as the baseline.

---

## Files to attach (in this order)

### Required reading (the brief + baseline)

1. `docs/design/BRIEF.md` — **start here**
2. `docs/design/01-desktop-empty.png`
3. `docs/design/02-desktop-with-text.png`
4. `docs/design/03-desktop-export-dialog.png`
5. `docs/design/04-mobile-empty.png`
6. `docs/design/05-mobile-layers-drawer.png`
7. `docs/design/06-mobile-properties-drawer.png`

### Design system (1 file)

8. `packages/ui/src/theme.ts` — MUI theme to rewrite per §3.2

### Top-level composition (1 file)

9. `apps/web/src/App.tsx` — top bar + layout + drawers

### Panels to redesign (3 files)

10. `apps/web/src/components/LayersPanel.tsx`
11. `apps/web/src/components/PropertiesPanel.tsx`
12. `apps/web/src/components/CanvasPanel.tsx`
13. `apps/web/src/components/ToolbarSection.tsx`

### Reusable UI to redesign (3 files)

14. `packages/ui/src/components/LayerListItem.tsx`
15. `packages/ui/src/components/StylePanel.tsx`
16. `packages/ui/src/components/ExportDialog.tsx`

### Domain types & data (read-only — to understand the shape)

17. `packages/core/src/types/editor-document.ts` — `TextLayerData`, `TextStyle`, `BackgroundData`, `EditorDocument`
18. `packages/core/src/types/canvas-preset.ts`
19. `packages/core/src/constants/canvas-presets.ts`
20. `packages/core/src/constants/safe-zones.ts`
21. `packages/ui/src/fonts.ts` — `FontEntry`, `ALL_FONTS`, `loadGoogleFont`

### i18n (must edit to add new strings)

22. `apps/web/src/i18n/en.json`
23. `apps/web/src/i18n/ru.json`

### Tests to preserve (don't break selectors)

24. `apps/web/e2e/` — list the directory, attach any `.spec.ts` files referencing `data-testid`s the designer might rename

---

## Why this set

- **Brief + screenshots** = the "what" and "why"
- **theme.ts** = the design tokens that ripple everywhere
- **App.tsx + CanvasPanel + LayersPanel + PropertiesPanel + ToolbarSection** = every surface visible in a screenshot
- **StylePanel + LayerListItem + ExportDialog** = the dense components called out as worst-offenders in §2
- **core/types + presets + safe-zones + fonts** = the domain shape Claude Design must respect to render data correctly
- **i18n files** = the brief asks for new strings; they must land in both languages
- **e2e specs** = preserve test selectors per §9

## Why NOT include

- `packages/editor/` — Zustand store and FabricAdapter. The brief explicitly forbids touching the adapter and the store shape, so showing them only invites refactoring.
- `apps/api/` — unrelated playground.
- `packages/utils/` — generic helpers, irrelevant to visual redesign.
- `*.test.ts` (unit) — implementation detail; Claude Design must run them but doesn't need to read them.
