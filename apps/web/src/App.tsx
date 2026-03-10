import React, { useState, useCallback, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Paper,
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
  FolderOpen,
  LocalCafe,
  MoreVert,
  Redo,
  Save,
  TextFields,
  Tune,
  Undo,
  ViewSidebar,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '@mint/editor';
import type { EditorDocument, ExportOptions } from '@mint/core';
import { ExportDialog } from '@mint/ui';
import mintPrimaryLogo from './assets/mint-logo-primary.png';
import { CanvasPanel } from './components/CanvasPanel';
import { LayersPanel } from './components/LayersPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ToolbarSection } from './components/ToolbarSection';

const BUYMEACOFFEE_URL = 'https://buymeacoffee.com/dimagious';

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const language = i18n.language.startsWith('ru') ? 'ru' : 'en';

  const [exportOpen, setExportOpen] = useState(false);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [mobileLayersOpen, setMobileLayersOpen] = useState(false);
  const [mobilePropertiesOpen, setMobilePropertiesOpen] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<HTMLElement | null>(
    null,
  );

  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const addTextLayer = useEditorStore((s) => s.addTextLayer);
  const doc = useEditorStore((s) => s.document);
  const loadDocument = useEditorStore((s) => s.loadDocument);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer);
  const copyLayer = useEditorStore((s) => s.copyLayer);
  const pasteLayer = useEditorStore((s) => s.pasteLayer);
  const deleteSelectedLayer = useEditorStore((s) => s.deleteSelectedLayer);

  const mobileMenuOpen = Boolean(mobileMenuAnchor);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

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
      } else if (ctrl && e.key === 'c') {
        e.preventDefault();
        copyLayer();
      } else if (ctrl && e.key === 'v') {
        e.preventDefault();
        pasteLayer();
      } else if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedLayerId
      ) {
        e.preventDefault();
        deleteSelectedLayer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    selectedLayerId,
    duplicateLayer,
    copyLayer,
    pasteLayer,
    deleteSelectedLayer,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('mint-project', JSON.stringify(doc));
    }, 500);
    return () => clearTimeout(timer);
  }, [doc]);

  useEffect(() => {
    const saved = localStorage.getItem('mint-project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as EditorDocument;
        if (parsed.presetId && parsed.layers) {
          loadDocument(parsed);
        }
      } catch {
        // ignore invalid data
      }
    }
  }, [loadDocument]);

  useEffect(() => {
    if (!isMobile) {
      setMobileLayersOpen(false);
      setMobilePropertiesOpen(false);
      setMobileMenuAnchor(null);
    }
  }, [isMobile]);

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
      const text = await file.text();
      try {
        const parsed = JSON.parse(text) as EditorDocument;
        if (parsed.presetId && parsed.layers) {
          loadDocument(parsed);
        }
      } catch {
        // ignore invalid file
      }
    };
    input.click();
  }, [loadDocument]);

  const [canvasPanelRef, setCanvasPanelRef] = useState<{
    handleExport: (opts: ExportOptions) => void;
  } | null>(null);

  const handleExport = useCallback(
    (options: ExportOptions) => {
      canvasPanelRef?.handleExport(options);
    },
    [canvasPanelRef],
  );

  const handleLanguageChange = (
    _: React.MouseEvent,
    newLang: string | null,
  ) => {
    if (newLang) {
      i18n.changeLanguage(newLang);
    }
  };

  const handleMobileMenuClose = () => setMobileMenuAnchor(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar
          variant="dense"
          sx={{
            gap: 1,
            minHeight: isMobile ? 66 : 74,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            py: isMobile ? 0.5 : 0.6,
          }}
        >
          <Box
            data-testid="app-title"
            sx={{
              mr: isMobile ? 0.5 : 2,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={mintPrimaryLogo}
              alt="MINT logo"
              sx={{
                height: isMobile ? 46 : 60,
                width: 'auto',
                display: 'block',
                flexShrink: 0,
              }}
            />
          </Box>

          <ToolbarSection compact={isMobile} />

          <Stack
            direction="row"
            spacing={isMobile ? 0.25 : 1}
            sx={{ ml: 'auto', alignItems: 'center' }}
          >
            {isMobile ? (
              <>
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
                <Tooltip title={t('toolbar.addText')}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      addTextLayer();
                      setMobilePropertiesOpen(true);
                    }}
                  >
                    <TextFields fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('toolbar.export')}>
                  <IconButton size="small" onClick={() => setExportOpen(true)}>
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
                <IconButton
                  size="small"
                  onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
                  aria-label={t('toolbar.more')}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={mobileMenuAnchor}
                  open={mobileMenuOpen}
                  onClose={handleMobileMenuClose}
                >
                  <MenuItem
                    onClick={() => {
                      handleSaveFile();
                      handleMobileMenuClose();
                    }}
                  >
                    {t('toolbar.save')}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleLoadFile();
                      handleMobileMenuClose();
                    }}
                  >
                    {t('toolbar.load')}
                  </MenuItem>
                  <MenuItem
                    selected={showSafeZones}
                    onClick={() => {
                      setShowSafeZones((prev) => !prev);
                      handleMobileMenuClose();
                    }}
                  >
                    {t('toolbar.safeZones')}
                  </MenuItem>
                  <MenuItem
                    component="a"
                    href={BUYMEACOFFEE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleMobileMenuClose}
                  >
                    {t('toolbar.donate')}
                  </MenuItem>
                  <MenuItem
                    selected={language === 'en'}
                    onClick={() => {
                      i18n.changeLanguage('en');
                      handleMobileMenuClose();
                    }}
                  >
                    English
                  </MenuItem>
                  <MenuItem
                    selected={language === 'ru'}
                    onClick={() => {
                      i18n.changeLanguage('ru');
                      handleMobileMenuClose();
                    }}
                  >
                    Русский
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  size="small"
                  startIcon={<Undo />}
                  onClick={undo}
                  disabled={!canUndo}
                >
                  {t('toolbar.undo')}
                </Button>
                <Button
                  size="small"
                  startIcon={<Redo />}
                  onClick={redo}
                  disabled={!canRedo}
                >
                  {t('toolbar.redo')}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<TextFields />}
                  onClick={() => addTextLayer()}
                >
                  {t('toolbar.addText')}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => setExportOpen(true)}
                >
                  {t('toolbar.export')}
                </Button>
                <Tooltip title={t('toolbar.save')}>
                  <IconButton size="small" onClick={handleSaveFile}>
                    <Save fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('toolbar.load')}>
                  <IconButton size="small" onClick={handleLoadFile}>
                    <FolderOpen fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('toolbar.safeZones')}>
                  <IconButton
                    size="small"
                    onClick={() => setShowSafeZones((prev) => !prev)}
                    sx={{
                      color: showSafeZones ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <CropFree fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('toolbar.donate')}>
                  <IconButton
                    size="small"
                    component="a"
                    href={BUYMEACOFFEE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'text.secondary' }}
                  >
                    <LocalCafe fontSize="small" />
                  </IconButton>
                </Tooltip>
                <ToggleButtonGroup
                  value={language}
                  exclusive
                  onChange={handleLanguageChange}
                  size="small"
                  sx={{ height: 30 }}
                >
                  <ToggleButton
                    value="en"
                    sx={{ px: 1, py: 0, fontSize: '0.75rem' }}
                  >
                    EN
                  </ToggleButton>
                  <ToggleButton
                    value="ru"
                    sx={{ px: 1, py: 0, fontSize: '0.75rem' }}
                  >
                    RU
                  </ToggleButton>
                </ToggleButtonGroup>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {!isMobile && <LayersPanel />}

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            overflow: 'auto',
            p: isMobile ? 1.25 : 2,
            pb: isMobile ? 10 : 2,
          }}
        >
          <CanvasPanel ref={setCanvasPanelRef} showSafeZones={showSafeZones} />
        </Box>

        {!isMobile && <PropertiesPanel />}
      </Box>

      {isMobile && (
        <>
          <Paper
            elevation={4}
            sx={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              borderTop: 1,
              borderColor: 'divider',
              zIndex: (muiTheme) => muiTheme.zIndex.appBar,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ p: 1 }}>
              <Button
                size="small"
                fullWidth
                startIcon={<ViewSidebar />}
                onClick={() => setMobileLayersOpen(true)}
                data-testid="mobile-layers-button"
              >
                {t('mobile.layers')}
              </Button>
              <Button
                size="small"
                fullWidth
                startIcon={<Tune />}
                onClick={() => setMobilePropertiesOpen(true)}
                disabled={!selectedLayerId}
                data-testid="mobile-properties-button"
              >
                {t('mobile.properties')}
              </Button>
            </Stack>
          </Paper>

          <Drawer
            anchor="bottom"
            open={mobileLayersOpen}
            onClose={() => setMobileLayersOpen(false)}
            ModalProps={{ keepMounted: true }}
          >
            <Box sx={{ height: '72vh' }}>
              <LayersPanel mobile />
            </Box>
          </Drawer>

          <Drawer
            anchor="bottom"
            open={mobilePropertiesOpen}
            onClose={() => setMobilePropertiesOpen(false)}
            ModalProps={{ keepMounted: true }}
          >
            <Box sx={{ height: '72vh' }}>
              <PropertiesPanel mobile />
            </Box>
          </Drawer>
        </>
      )}

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
      />
    </Box>
  );
};
