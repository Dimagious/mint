import React, { useState, useCallback } from 'react';
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
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '@mint/editor';
import type { ExportOptions } from '@mint/core';
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
