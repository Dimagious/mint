import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useEditorStore } from '@social-posts-helper/editor';
import { StylePanel } from '@social-posts-helper/ui';
import type { TextLayerData } from '@social-posts-helper/core';

const PANEL_WIDTH = 300;

export const PropertiesPanel: React.FC = () => {
  const doc = useEditorStore((s) => s.document);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const updateTextLayer = useEditorStore((s) => s.updateTextLayer);

  const selectedLayer = doc.layers.find((l) => l.id === selectedLayerId);

  return (
    <Paper
      sx={{
        width: PANEL_WIDTH,
        minWidth: PANEL_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        borderLeft: 1,
        borderColor: 'divider',
        overflow: 'auto',
      }}
      elevation={0}
    >
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2">Properties</Typography>
      </Box>

      {selectedLayer ? (
        <StylePanel
          layer={selectedLayer}
          onUpdate={(changes: Partial<Omit<TextLayerData, 'id'>>) =>
            updateTextLayer(selectedLayer.id, changes)
          }
        />
      ) : (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Select a layer to edit properties
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
