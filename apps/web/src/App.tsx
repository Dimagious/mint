import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import {
  Undo,
  Redo,
  TextFields,
  Download,
  LocalCafe,
  Save,
  FolderOpen,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '@mint/editor';
import type { EditorDocument, ExportOptions } from '@mint/core';
import { ExportDialog } from '@mint/ui';
import { CanvasPanel } from './components/CanvasPanel';
import { LayersPanel } from './components/LayersPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ToolbarSection } from './components/ToolbarSection';

const BUYMEACOFFEE_URL = 'https://buymeacoffee.com/mint';

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [exportOpen, setExportOpen] = useState(false);
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

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('mint-project', JSON.stringify(doc));
    }, 500);
    return () => clearTimeout(timer);
  }, [doc]);

  // Load from localStorage on mount
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
  }, []);

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ mr: 3, color: 'primary.main' }}>
            MINT
          </Typography>

          <ToolbarSection />

          <Stack
            direction="row"
            spacing={1}
            sx={{ ml: 'auto', alignItems: 'center' }}
          >
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
              value={i18n.language.startsWith('ru') ? 'ru' : 'en'}
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
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LayersPanel />

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            overflow: 'auto',
            p: 2,
          }}
        >
          <CanvasPanel ref={setCanvasPanelRef} />
        </Box>

        <PropertiesPanel />
      </Box>

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
      />
    </Box>
  );
};
