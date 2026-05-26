import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Command } from 'cmdk';
import { Box, Dialog } from '@mui/material';
import {
  AutoFixHigh,
  ContentCopy,
  CropFree,
  DeleteOutline,
  Download,
  FolderOpen,
  GridView,
  HighlightOff,
  KeyboardOutlined,
  LocalCafeOutlined,
  Lock,
  LockOpen,
  Redo,
  Save,
  TextFields,
  Undo,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { CANVAS_PRESETS } from '@mint/core';
import type { CanvasPresetId } from '@mint/core';
import { useEditorStore } from '@mint/editor';

const BUYMEACOFFEE_URL = 'https://buymeacoffee.com/dimagious';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;

  /* Dialog openers — state lives in App.tsx */
  onOpenExport: () => void;
  onOpenTemplates: () => void;
  onOpenShortcuts: () => void;
  onSaveFile: () => void;
  onLoadFile: () => void;

  /* View toggles */
  safeZones: boolean;
  onToggleSafeZones: () => void;

  /* Persistence */
  autosaveEnabled: boolean;
  onToggleAutosave: () => void;
  onClearStored: () => void;

  /* Locale */
  language: 'en' | 'ru';
  onSwitchLanguage: (lang: 'en' | 'ru') => void;
}

/**
 * `Cmd+K` command palette. A single keyboard-driven entry point that
 * fuzzy-searches every action the user can otherwise reach through the
 * top bar, the overflow menu, the layer card menu, or the keyboard
 * shortcuts dialog. Wins:
 *
 *  - Discoverability — a new user can find "Browse templates" without
 *    knowing about the ⋯ menu.
 *  - Speed for power users — every primary action is one fuzzy match
 *    away regardless of the panel layout.
 *  - Mobile parity — on touch devices the palette is reachable via the
 *    overflow menu (no keyboard) and gives access to actions that don't
 *    fit in the mobile bottom bar.
 *
 * The list of commands is derived per-render from the current store
 * state (selected layer, undo/redo flags, preset id), so the palette
 * always reflects what's actually possible right now — disabled rows
 * are filtered out instead of greyed.
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  onOpenExport,
  onOpenTemplates,
  onOpenShortcuts,
  onSaveFile,
  onLoadFile,
  safeZones,
  onToggleSafeZones,
  autosaveEnabled,
  onToggleAutosave,
  onClearStored,
  language,
  onSwitchLanguage,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  // Store reads — layer-aware commands switch on selection/clipboard.
  const doc = useEditorStore((s) => s.document);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const addTextLayer = useEditorStore((s) => s.addTextLayer);
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer);
  const removeTextLayer = useEditorStore((s) => s.removeTextLayer);
  const updateTextLayer = useEditorStore((s) => s.updateTextLayer);
  const reorderLayer = useEditorStore((s) => s.reorderLayer);
  const setPreset = useEditorStore((s) => s.setPreset);

  const selectedLayer = selectedLayerId
    ? (doc.layers.find((l) => l.id === selectedLayerId) ?? null)
    : null;

  // Reset the query each time the palette opens so the first match is
  // always the user's intended new search, not a leftover from before.
  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  // Stable across renders (depends only on `onClose`), so `useMemo` deps
  // below can include `run` without thrashing the memoised group list.
  const run = useCallback(
    (fn: () => void) => () => {
      fn();
      onClose();
    },
    [onClose],
  );

  // Build groups — each group is rendered only if it has at least one
  // item, and each item is conditionally included so disabled rows don't
  // pollute the fuzzy results.
  type CmdItem = {
    id: string;
    label: string;
    /** Comma-separated extra search tokens (synonyms, shortcut letters). */
    keywords?: string;
    icon: React.ReactNode;
    onSelect: () => void;
    /** Optional right-aligned shortcut hint. */
    hint?: string;
  };
  type CmdGroup = { label: string; items: CmdItem[] };

  const groups = useMemo<CmdGroup[]>(() => {
    const isMac =
      typeof navigator !== 'undefined' &&
      /Mac|iPad|iPhone|iPod/.test(navigator.platform);
    const cmd = isMac ? '⌘' : 'Ctrl';

    const document: CmdItem[] = [
      {
        id: 'add-text',
        label: t('palette.addText'),
        keywords: 'layer text create new',
        icon: <TextFields fontSize="small" />,
        onSelect: run(() => addTextLayer()),
        hint: 'T',
      },
      {
        id: 'open-templates',
        label: t('palette.openTemplates'),
        keywords: 'gallery start preset',
        icon: <GridView fontSize="small" />,
        onSelect: run(onOpenTemplates),
        hint: `${cmd}G`,
      },
      {
        id: 'open-export',
        label: t('palette.openExport'),
        keywords: 'download png jpg webp save image',
        icon: <Download fontSize="small" />,
        onSelect: run(onOpenExport),
        hint: `${cmd}E`,
      },
      {
        id: 'save-file',
        label: t('palette.saveFile'),
        keywords: 'project json download',
        icon: <Save fontSize="small" />,
        onSelect: run(onSaveFile),
      },
      {
        id: 'load-file',
        label: t('palette.loadFile'),
        keywords: 'project json open import',
        icon: <FolderOpen fontSize="small" />,
        onSelect: run(onLoadFile),
      },
    ];

    const edit: CmdItem[] = [];
    if (canUndo) {
      edit.push({
        id: 'undo',
        label: t('palette.undo'),
        icon: <Undo fontSize="small" />,
        onSelect: run(undo),
        hint: `${cmd}Z`,
      });
    }
    if (canRedo) {
      edit.push({
        id: 'redo',
        label: t('palette.redo'),
        icon: <Redo fontSize="small" />,
        onSelect: run(redo),
        hint: `${cmd}Y`,
      });
    }

    const layers: CmdItem[] = [];
    if (selectedLayer) {
      layers.push({
        id: 'duplicate',
        label: t('palette.duplicateLayer'),
        icon: <ContentCopy fontSize="small" />,
        onSelect: run(() => duplicateLayer(selectedLayer.id)),
        hint: `${cmd}D`,
      });
      if (!selectedLayer.locked) {
        layers.push({
          id: 'delete',
          label: t('palette.deleteLayer'),
          icon: <DeleteOutline fontSize="small" />,
          onSelect: run(() => removeTextLayer(selectedLayer.id)),
          hint: '⌫',
        });
      }
      layers.push({
        id: 'visibility',
        label: selectedLayer.visible
          ? t('palette.hideLayer')
          : t('palette.showLayer'),
        icon: selectedLayer.visible ? (
          <VisibilityOff fontSize="small" />
        ) : (
          <Visibility fontSize="small" />
        ),
        onSelect: run(() =>
          updateTextLayer(selectedLayer.id, {
            visible: !selectedLayer.visible,
          }),
        ),
      });
      layers.push({
        id: 'lock',
        label: selectedLayer.locked
          ? t('palette.unlockLayer')
          : t('palette.lockLayer'),
        icon: selectedLayer.locked ? (
          <LockOpen fontSize="small" />
        ) : (
          <Lock fontSize="small" />
        ),
        onSelect: run(() =>
          updateTextLayer(selectedLayer.id, { locked: !selectedLayer.locked }),
        ),
      });
      const idx = doc.layers.findIndex((l) => l.id === selectedLayer.id);
      if (idx >= 0 && idx < doc.layers.length - 1) {
        layers.push({
          id: 'bring-forward',
          label: t('palette.bringForward'),
          icon: <AutoFixHigh fontSize="small" />,
          onSelect: run(() => reorderLayer(selectedLayer.id, 'up')),
        });
      }
      if (idx > 0) {
        layers.push({
          id: 'send-backward',
          label: t('palette.sendBackward'),
          icon: <AutoFixHigh fontSize="small" />,
          onSelect: run(() => reorderLayer(selectedLayer.id, 'down')),
        });
      }
    }

    const view: CmdItem[] = [
      {
        id: 'toggle-safe-zones',
        label: safeZones
          ? t('palette.hideSafeZones')
          : t('palette.showSafeZones'),
        icon: <CropFree fontSize="small" />,
        onSelect: run(onToggleSafeZones),
      },
      ...CANVAS_PRESETS.filter((p) => p.id !== doc.presetId).map<CmdItem>(
        (p) => ({
          id: `preset-${p.id}`,
          label: t('palette.switchPreset', {
            name: t(`presets.${p.id}`),
            w: p.width,
            h: p.height,
          }),
          keywords: `${p.id} ${p.width} ${p.height}`,
          icon: <GridView fontSize="small" />,
          onSelect: run(() => setPreset(p.id as CanvasPresetId)),
        }),
      ),
    ];

    const app: CmdItem[] = [
      {
        id: 'open-shortcuts',
        label: t('palette.openShortcuts'),
        keywords: 'help cheat sheet keyboard',
        icon: <KeyboardOutlined fontSize="small" />,
        onSelect: run(onOpenShortcuts),
        hint: '?',
      },
      {
        id: 'switch-language',
        label:
          language === 'en'
            ? t('palette.switchLangRu')
            : t('palette.switchLangEn'),
        keywords: 'locale i18n english russian',
        icon: <AutoFixHigh fontSize="small" />,
        onSelect: run(() => onSwitchLanguage(language === 'en' ? 'ru' : 'en')),
      },
      {
        id: 'toggle-autosave',
        label: autosaveEnabled
          ? t('palette.autosaveOff')
          : t('palette.autosaveOn'),
        icon: <Save fontSize="small" />,
        onSelect: run(onToggleAutosave),
      },
      {
        id: 'clear-stored',
        label: t('palette.clearStored'),
        icon: <HighlightOff fontSize="small" />,
        onSelect: run(onClearStored),
      },
      {
        id: 'buy-coffee',
        label: t('palette.buyCoffee'),
        icon: <LocalCafeOutlined fontSize="small" />,
        onSelect: () => {
          window.open(BUYMEACOFFEE_URL, '_blank', 'noopener,noreferrer');
          onClose();
        },
      },
    ];

    return [
      { label: t('palette.groupDocument'), items: document },
      ...(edit.length ? [{ label: t('palette.groupEdit'), items: edit }] : []),
      ...(layers.length
        ? [{ label: t('palette.groupLayer'), items: layers }]
        : []),
      { label: t('palette.groupView'), items: view },
      { label: t('palette.groupApp'), items: app },
    ];
  }, [
    addTextLayer,
    autosaveEnabled,
    canRedo,
    canUndo,
    doc.layers,
    doc.presetId,
    duplicateLayer,
    language,
    onClearStored,
    onClose,
    onLoadFile,
    run,
    onOpenExport,
    onOpenShortcuts,
    onOpenTemplates,
    onSaveFile,
    onSwitchLanguage,
    onToggleAutosave,
    onToggleSafeZones,
    redo,
    removeTextLayer,
    reorderLayer,
    safeZones,
    selectedLayer,
    setPreset,
    t,
    undo,
    updateTextLayer,
  ]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="command-palette-title"
      data-testid="command-palette"
      slotProps={{ paper: { sx: { borderRadius: '14px', mt: 6 } } }}
      // Don't autoFocus the dialog wrapper — cmdk's Command.Input owns focus.
      disableAutoFocus
      disableEnforceFocus={false}
    >
      {/* Style overrides for cmdk's data-selected highlight + group headings.
          cmdk renders [cmdk-item], [cmdk-group-heading], etc. — we hook into
          those so the palette matches the rest of the MUI theme. */}
      <Box
        sx={(theme) => ({
          '[cmdk-group-heading]': {
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: theme.palette.text.disabled,
            padding: '10px 12px 4px',
          },
          '[cmdk-item][data-selected="true"]': {
            background: theme.palette.action.hover,
          },
          '[cmdk-item][data-selected="true"] [data-palette-icon]': {
            color: theme.palette.primary.main,
          },
          '[cmdk-input]': {
            color: theme.palette.text.primary,
          },
        })}
      >
        <Command
          loop
          label={t('palette.title')}
          // Defaults to fuzzy substring matching across label + keywords.
          filter={(value, search, keywords) => {
            const haystack =
              `${value} ${(keywords ?? []).join(' ')}`.toLowerCase();
            return haystack.includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box
              id="command-palette-title"
              component="span"
              sx={{ display: 'none' }}
            >
              {t('palette.title')}
            </Box>
            <Command.Input
              data-testid="command-palette-input"
              placeholder={t('palette.placeholder')}
              value={query}
              onValueChange={setQuery}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: 'inherit',
                fontSize: 16,
                padding: 0,
                color: 'inherit',
              }}
            />
          </Box>

          <Command.List
            style={{
              maxHeight: 380,
              overflow: 'auto',
              padding: '6px 6px 8px',
            }}
          >
            <Command.Empty
              style={{
                padding: '20px 14px',
                fontSize: 13,
                color: 'rgba(0,0,0,.45)',
                textAlign: 'center',
              }}
            >
              {t('palette.noResults')}
            </Command.Empty>

            {groups.map((g) => (
              <Command.Group
                key={g.label}
                heading={g.label}
                data-testid={`palette-group-${g.label}`}
              >
                {g.items.map((item) => (
                  <PaletteItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    keywords={item.keywords ?? ''}
                    icon={item.icon}
                    hint={item.hint}
                    onSelect={item.onSelect}
                  />
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </Box>
    </Dialog>
  );
};

/**
 * One row in the palette. Split out so the styling block doesn't bloat
 * the parent render. The cmdk lib supplies the keyboard nav, selection,
 * and accessibility wiring; we only style the row.
 */
const PaletteItem: React.FC<{
  id: string;
  label: string;
  keywords: string;
  icon: React.ReactNode;
  hint?: string;
  onSelect: () => void;
}> = ({ id, label, keywords, icon, hint, onSelect }) => (
  <Command.Item
    value={`${id}${label}`}
    keywords={keywords ? keywords.split(/\s+/) : undefined}
    onSelect={onSelect}
    data-testid={`palette-item-${id}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 10px',
      margin: '2px 0',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: 14,
      color: 'inherit',
    }}
  >
    <Box
      component="span"
      data-palette-icon
      sx={{
        display: 'inline-flex',
        width: 20,
        height: 20,
        color: 'text.secondary',
      }}
    >
      {icon}
    </Box>
    <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
      {label}
    </Box>
    {hint && (
      <Box
        component="span"
        className="tnum"
        sx={{
          fontSize: 11,
          color: 'text.disabled',
          fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
        }}
      >
        {hint}
      </Box>
    )}
  </Command.Item>
);
