import React, { useCallback, useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CropFree,
  Download,
  FileDownloadOutlined,
  FolderOpen,
  KeyboardOutlined,
  LocalCafeOutlined,
  MoreHoriz,
  Redo,
  Save,
  TextFields,
  Tune,
  Undo,
  ViewSidebar,
  Close,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '@mint/editor';
import type { EditorDocument, ExportOptions } from '@mint/core';
import { ExportDialog, MintMark } from '@mint/ui';
import { CanvasPanel, CanvasPanelHandle } from './components/CanvasPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LayersPanel } from './components/LayersPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ToolbarSection } from './components/ToolbarSection';
import { AutosaveBadge } from './components/AutosaveBadge';
import { ShortcutsDialog } from './components/ShortcutsDialog';
import { isEditorDocument } from './utils/document-validation';
import { usePullDownToClose } from './hooks/usePullDownToClose';
import type { ImageRejectedError } from '@mint/utils';

const BUYMEACOFFEE_URL = 'https://buymeacoffee.com/dimagious';
const PROJECT_STORAGE_KEY = 'mint-project';

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Root                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const language = i18n.language.startsWith('ru') ? 'ru' : 'en';

  /* ─── State ─── */
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPreview, setExportPreview] = useState<string | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [mobileLayersOpen, setMobileLayersOpen] = useState(false);
  const [mobilePropertiesOpen, setMobilePropertiesOpen] = useState(false);
  const [overflowAnchor, setOverflowAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  /* ─── Store ─── */
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const addTextLayer = useEditorStore((s) => s.addTextLayer);
  const doc = useEditorStore((s) => s.document);
  const loadDocument = useEditorStore((s) => s.loadDocument);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer);
  const copyLayer = useEditorStore((s) => s.copyLayer);
  const pasteLayer = useEditorStore((s) => s.pasteLayer);
  const deleteSelectedLayer = useEditorStore((s) => s.deleteSelectedLayer);
  const updateTextLayer = useEditorStore((s) => s.updateTextLayer);
  const clipboard = useEditorStore((s) => s.clipboard);

  const overflowOpen = Boolean(overflowAnchor);

  /* ─── Pull-down-to-dismiss gestures for the two mobile drawers ─── */
  const layersDrawer = usePullDownToClose(() => setMobileLayersOpen(false));
  const propertiesDrawer = usePullDownToClose(() =>
    setMobilePropertiesOpen(false),
  );

  /* ─── Image rejection → localized snackbar ─── */
  const handleImageRejected = useCallback(
    (code: ImageRejectedError['code']) => {
      setSnackbarMsg(t(`errors.image.${code}`));
    },
    [t],
  );

  /* ─── Keyboard shortcuts (unchanged + ? + T) ─── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
        return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (ctrl && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        redo();
      } else if (ctrl && e.key === 'd' && selectedLayerId) {
        e.preventDefault();
        duplicateLayer(selectedLayerId);
      } else if (ctrl && e.key === 'c' && selectedLayerId) {
        e.preventDefault();
        copyLayer();
      } else if (ctrl && e.key === 'v') {
        e.preventDefault();
        if (!clipboard) {
          setSnackbarMsg(t('errors.nothingToPaste'));
          return;
        }
        pasteLayer();
      } else if (ctrl && e.key === 'e') {
        e.preventDefault();
        setExportOpen(true);
      } else if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedLayerId
      ) {
        const layer = useEditorStore
          .getState()
          .document.layers.find((l) => l.id === selectedLayerId);
        if (layer?.locked) return;
        e.preventDefault();
        deleteSelectedLayer();
      } else if (e.key === 'Escape') {
        if (shortcutsOpen) {
          e.preventDefault();
          setShortcutsOpen(false);
          return;
        }
        if (selectedLayerId) {
          e.preventDefault();
          selectLayer(null);
        }
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShortcutsOpen(true);
      } else if (e.key.toLowerCase() === 't' && !ctrl && !e.altKey) {
        e.preventDefault();
        addTextLayer();
      } else if (
        selectedLayerId &&
        !ctrl &&
        (e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowDown')
      ) {
        const layer = useEditorStore
          .getState()
          .document.layers.find((l) => l.id === selectedLayerId);
        if (!layer || layer.locked) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx =
          e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy =
          e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        updateTextLayer(selectedLayerId, { x: layer.x + dx, y: layer.y + dy });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    undo,
    redo,
    selectedLayerId,
    selectLayer,
    duplicateLayer,
    copyLayer,
    pasteLayer,
    clipboard,
    deleteSelectedLayer,
    updateTextLayer,
    t,
    addTextLayer,
    shortcutsOpen,
  ]);

  /* ─── Autosave (unchanged) ─── */
  useEffect(() => {
    const timer = setTimeout(() => {
      const serialized = JSON.stringify(doc);
      try {
        localStorage.setItem(PROJECT_STORAGE_KEY, serialized);
      } catch (error) {
        if (!isQuotaExceededError(error)) return;
        const lightweight: EditorDocument = {
          ...doc,
          background: { ...doc.background, dataUrl: null },
        };
        try {
          localStorage.setItem(
            PROJECT_STORAGE_KEY,
            JSON.stringify(lightweight),
          );
        } catch {
          /* ignore */
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [doc]);

  useEffect(() => {
    const saved = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isEditorDocument(parsed)) {
          loadDocument(parsed);
        } else {
          localStorage.removeItem(PROJECT_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(PROJECT_STORAGE_KEY);
      }
    }
  }, [loadDocument]);

  useEffect(() => {
    if (!isMobile) {
      setMobileLayersOpen(false);
      setMobilePropertiesOpen(false);
    }
  }, [isMobile]);

  /* ─── Save / Load project file (unchanged) ─── */
  const handleSaveFile = useCallback(() => {
    const json = JSON.stringify(doc, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'mint-project.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [doc]);

  const handleLoadFile = useCallback(() => {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        if (isEditorDocument(parsed)) loadDocument(parsed);
        else setSnackbarMsg(t('errors.invalidFile'));
      } catch {
        setSnackbarMsg(t('errors.invalidFile'));
      }
    };
    input.click();
  }, [loadDocument, t]);

  /* ─── Canvas ref ─── */
  const canvasPanelRef = React.useRef<CanvasPanelHandle | null>(null);

  const handleExport = useCallback(
    (options: ExportOptions & { filename?: string; scale?: 1 | 2 }) => {
      if (!canvasPanelRef.current) {
        setSnackbarMsg(t('errors.exportFailed'));
        return;
      }
      canvasPanelRef.current.handleExport(options);
    },
    [t],
  );

  const openExport = () => {
    setExportPreview(canvasPanelRef.current?.getPreviewDataUrl() ?? null);
    setExportOpen(true);
  };

  const handleLanguageChange = (_: React.MouseEvent, lang: string | null) => {
    if (lang) i18n.changeLanguage(lang);
  };

  const closeOverflow = () => setOverflowAnchor(null);

  // Monotonic revision counter from the store — bumped on every mutation.
  // The AutosaveBadge subscribes to this instead of doing a JSON.stringify
  // on `doc` per render.
  const autosaveSignal = useEditorStore((s) => s.revision);

  return (
    <ErrorBoundary>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {/* ─── Top bar ─── */}
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar
            variant="dense"
            sx={{
              gap: 1.25,
              minHeight: 60,
              flexWrap: 'nowrap',
              py: 0.75,
            }}
          >
            <Box
              data-testid="app-title"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.875,
                flexShrink: 0,
                mr: isMobile ? 0.5 : 1,
                color: 'primary.dark',
              }}
              aria-label="MINT"
            >
              <MintMark size={isMobile ? 24 : 28} />
              {!isMobile && (
                <Box
                  component="span"
                  sx={{
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: '0.06em',
                    color: 'text.primary',
                  }}
                >
                  MINT
                </Box>
              )}
            </Box>

            <ToolbarSection compact={isMobile} />

            {!isMobile && (
              <>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ mx: 0.5, my: 1.25 }}
                />
                <Tooltip title={t('toolbar.undo')}>
                  <span>
                    <IconButton onClick={undo} disabled={!canUndo} size="small">
                      <Undo />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t('toolbar.redo')}>
                  <span>
                    <IconButton onClick={redo} disabled={!canRedo} size="small">
                      <Redo />
                    </IconButton>
                  </span>
                </Tooltip>
                <AutosaveBadge signal={autosaveSignal} />
              </>
            )}

            <Box sx={{ flex: 1 }} />

            {isMobile ? (
              <>
                <Tooltip title={t('toolbar.addText')}>
                  <IconButton size="small" onClick={() => addTextLayer()}>
                    <TextFields fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Download sx={{ fontSize: 16 }} />}
                  onClick={openExport}
                  data-testid="export-open"
                >
                  {t('toolbar.export')}
                </Button>
                <IconButton
                  size="small"
                  onClick={(e) => setOverflowAnchor(e.currentTarget)}
                >
                  <MoreHoriz />
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<TextFields sx={{ fontSize: 16 }} />}
                  onClick={() => addTextLayer()}
                >
                  {t('toolbar.addText')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download sx={{ fontSize: 16 }} />}
                  onClick={openExport}
                  data-testid="export-open"
                >
                  {t('toolbar.export')}
                </Button>
                <Tooltip title={t('toolbar.more')}>
                  <IconButton
                    onClick={(e) => setOverflowAnchor(e.currentTarget)}
                  >
                    <MoreHoriz />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {/* Overflow menu — replaces 5 separate icon buttons in old toolbar */}
            <Menu
              anchorEl={overflowAnchor}
              open={overflowOpen}
              onClose={closeOverflow}
              slotProps={{ paper: { sx: { minWidth: 220 } } }}
            >
              <MenuItem
                onClick={() => {
                  handleSaveFile();
                  closeOverflow();
                }}
              >
                <Save fontSize="small" sx={{ mr: 1.25 }} />
                {t('toolbar.save')}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleLoadFile();
                  closeOverflow();
                }}
              >
                <FolderOpen fontSize="small" sx={{ mr: 1.25 }} />
                {t('toolbar.load')}
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  setShowSafeZones((p) => !p);
                  closeOverflow();
                }}
              >
                <CropFree
                  fontSize="small"
                  sx={{
                    mr: 1.25,
                    color: showSafeZones ? 'primary.main' : 'inherit',
                  }}
                />
                {t('toolbar.safeZones')}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setShortcutsOpen(true);
                  closeOverflow();
                }}
              >
                <KeyboardOutlined fontSize="small" sx={{ mr: 1.25 }} />
                {t('toolbar.shortcuts')}
              </MenuItem>
              <Divider />
              <MenuItem
                component="a"
                href={BUYMEACOFFEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeOverflow}
              >
                <LocalCafeOutlined fontSize="small" sx={{ mr: 1.25 }} />
                {t('toolbar.donate')}
              </MenuItem>
              <Divider />
              <Box sx={{ px: 1.5, py: 0.75 }}>
                <ToggleButtonGroup
                  value={language}
                  exclusive
                  onChange={handleLanguageChange}
                  size="small"
                  sx={{ width: '100%' }}
                  fullWidth
                >
                  <ToggleButton value="en" sx={{ flex: 1 }}>
                    EN
                  </ToggleButton>
                  <ToggleButton value="ru" sx={{ flex: 1 }}>
                    RU
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* ─── Body ─── */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {!isMobile && (
            <LayersPanel
              showSafeZones={showSafeZones}
              onToggleSafeZones={setShowSafeZones}
              onImageRejected={handleImageRejected}
            />
          )}

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default',
              overflow: 'auto',
              p: isMobile ? 1.5 : 3,
              pb: isMobile ? 11 : 3,
              // Dotted-grid backdrop (BRIEF §4.4)
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(0,0,0,.045) 1px, transparent 0)',
              backgroundSize: '18px 18px',
            }}
          >
            <CanvasPanel
              ref={canvasPanelRef}
              showSafeZones={showSafeZones}
              onRequestUpload={() => {
                // Surface the upload picker via the bg-upload input.
                const el = document.querySelector<HTMLInputElement>(
                  '[data-testid="bg-upload"]',
                );
                el?.click();
              }}
              onRequestAddText={() => addTextLayer()}
              onImageRejected={handleImageRejected}
            />
          </Box>

          {!isMobile && <PropertiesPanel />}
        </Box>

        {/* ─── Mobile bottom bar (BRIEF §6.3) ─── */}
        {isMobile && (
          <>
            <Paper
              elevation={0}
              sx={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                pb: 'env(safe-area-inset-bottom)',
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'rgba(255,255,255,.92)',
                backdropFilter: 'blur(14px)',
                zIndex: (m) => m.zIndex.appBar,
                borderRadius: 0,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ px: 1.5, py: 1.25 }}
              >
                <Tooltip title={t('toolbar.undo')}>
                  <span>
                    <IconButton size="small" onClick={undo} disabled={!canUndo}>
                      <Undo fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t('toolbar.redo')}>
                  <span>
                    <IconButton size="small" onClick={redo} disabled={!canRedo}>
                      <Redo fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 0.5,
                  }}
                >
                  <Button
                    size="small"
                    startIcon={<ViewSidebar sx={{ fontSize: 16 }} />}
                    onClick={() => setMobileLayersOpen(true)}
                    data-testid="mobile-layers-button"
                  >
                    {t('mobile.layers')}
                  </Button>
                  <Tooltip
                    title={!selectedLayerId ? t('mobile.noLayerSelected') : ''}
                    placement="top"
                  >
                    <span>
                      <Button
                        size="small"
                        startIcon={<Tune sx={{ fontSize: 16 }} />}
                        onClick={() => setMobilePropertiesOpen(true)}
                        disabled={!selectedLayerId}
                        data-testid="mobile-properties-button"
                      >
                        {selectedLayerId
                          ? t('mobile.properties')
                          : t('mobile.properties')}
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
                <Tooltip title={t('toolbar.addText')}>
                  <IconButton size="small" onClick={() => addTextLayer()}>
                    <TextFields fontSize="small" />
                  </IconButton>
                </Tooltip>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={openExport}
                  sx={{
                    bgcolor: 'primary.main',
                    color: '#fff',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <FileDownloadOutlined fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>

            <Drawer
              anchor="bottom"
              open={mobileLayersOpen}
              onClose={() => setMobileLayersOpen(false)}
              PaperProps={{
                sx: {
                  borderTopLeftRadius: 22,
                  borderTopRightRadius: 22,
                  maxHeight: '90dvh',
                  ...layersDrawer.paperSx,
                },
              }}
            >
              <DrawerHeader
                title={t('mobile.drawerTitleLayers')}
                onClose={() => setMobileLayersOpen(false)}
                handleProps={layersDrawer.handleProps}
              />
              <Box sx={{ overflowY: 'auto' }}>
                <LayersPanel
                  mobile
                  showSafeZones={showSafeZones}
                  onToggleSafeZones={setShowSafeZones}
                  onImageRejected={handleImageRejected}
                />
              </Box>
            </Drawer>

            <Drawer
              anchor="bottom"
              open={mobilePropertiesOpen}
              onClose={() => setMobilePropertiesOpen(false)}
              PaperProps={{
                sx: {
                  borderTopLeftRadius: 22,
                  borderTopRightRadius: 22,
                  maxHeight: '90dvh',
                  ...propertiesDrawer.paperSx,
                },
              }}
            >
              <DrawerHeader
                title={
                  selectedLayerId
                    ? t('mobile.drawerTitleEditing', {
                        name:
                          doc.layers.find((l) => l.id === selectedLayerId)
                            ?.text || t('layers.emptyText'),
                      })
                    : t('properties.title')
                }
                onClose={() => setMobilePropertiesOpen(false)}
                handleProps={propertiesDrawer.handleProps}
              />
              <Box sx={{ overflowY: 'auto' }}>
                <PropertiesPanel mobile />
              </Box>
            </Drawer>
          </>
        )}

        <ExportDialog
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          onExport={handleExport}
          doc={doc}
          previewDataUrl={exportPreview}
        />

        <ShortcutsDialog
          open={shortcutsOpen}
          onClose={() => setShortcutsOpen(false)}
        />

        <Snackbar
          open={snackbarMsg !== null}
          autoHideDuration={4000}
          onClose={() => setSnackbarMsg(null)}
          message={snackbarMsg}
        />
      </Box>
    </ErrorBoundary>
  );
};

interface DrawerHeaderProps {
  title: string;
  onClose: () => void;
  /** Touch handlers from `usePullDownToClose`; applied to the grab area. */
  handleProps?: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    style: React.CSSProperties;
  };
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  title,
  onClose,
  handleProps,
}) => (
  <>
    {/* Pull-to-dismiss zone: a generous touch target wrapping the visible pill. */}
    <Box
      {...handleProps}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        pt: 1.25,
        pb: 0.5,
        // Make the entire band a draggable target, not just the 40px pill.
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Box
        sx={{ width: 40, height: 4, bgcolor: 'divider', borderRadius: '999px' }}
      />
    </Box>
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: 2, pb: 1.75, borderBottom: 1, borderColor: 'divider' }}
    >
      <Box sx={{ fontSize: 16, fontWeight: 600 }}>{title}</Box>
      <IconButton onClick={onClose} size="small">
        <Close fontSize="small" />
      </IconButton>
    </Stack>
  </>
);
