import React, { useState, useCallback } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { Undo, Redo, TextFields, Download } from '@mui/icons-material';
import { useEditorStore } from '@social-posts-helper/editor';
import type { ExportOptions } from '@social-posts-helper/core';
import { ExportDialog } from '@social-posts-helper/ui';
import { CanvasPanel } from './components/CanvasPanel';
import { LayersPanel } from './components/LayersPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ToolbarSection } from './components/ToolbarSection';

export const App: React.FC = () => {
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ mr: 3, color: 'primary.main' }}>
            CaptionForge
          </Typography>

          <ToolbarSection />

          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
            <Button
              size="small"
              startIcon={<Undo />}
              onClick={undo}
              disabled={!canUndo}
            >
              Undo
            </Button>
            <Button
              size="small"
              startIcon={<Redo />}
              onClick={redo}
              disabled={!canRedo}
            >
              Redo
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<TextFields />}
              onClick={() => addTextLayer()}
            >
              Add Text
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Download />}
              onClick={() => setExportOpen(true)}
            >
              Export
            </Button>
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
