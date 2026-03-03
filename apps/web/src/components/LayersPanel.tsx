import React, { useCallback } from 'react';
import { Box, Typography, List, Button, Paper } from '@mui/material';
import { Add, Image } from '@mui/icons-material';
import { useEditorStore } from '@social-posts-helper/editor';
import { LayerListItem } from '@social-posts-helper/ui';
import { readFileAsDataUrl } from '@social-posts-helper/utils';

const PANEL_WIDTH = 260;

export const LayersPanel: React.FC = () => {
  const doc = useEditorStore((s) => s.document);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const addTextLayer = useEditorStore((s) => s.addTextLayer);
  const removeTextLayer = useEditorStore((s) => s.removeTextLayer);
  const updateTextLayer = useEditorStore((s) => s.updateTextLayer);
  const reorderLayer = useEditorStore((s) => s.reorderLayer);
  const setBackground = useEditorStore((s) => s.setBackground);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const dataUrl = await readFileAsDataUrl(file);
      setBackground({ dataUrl, fit: doc.background.fit });
      e.target.value = '';
    },
    [setBackground, doc.background.fit],
  );

  const reversedLayers = [...doc.layers].reverse();

  return (
    <Paper
      sx={{
        width: PANEL_WIDTH,
        minWidth: PANEL_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        borderRight: 1,
        borderColor: 'divider',
      }}
      elevation={0}
    >
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Background
        </Typography>
        <Button
          component="label"
          size="small"
          variant="outlined"
          startIcon={<Image />}
          fullWidth
        >
          Upload Image
          <input
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            data-testid="bg-upload"
          />
        </Button>
        {doc.background.dataUrl && (
          <Button
            size="small"
            fullWidth
            sx={{ mt: 0.5 }}
            onClick={() =>
              setBackground({
                ...doc.background,
                fit: doc.background.fit === 'contain' ? 'cover' : 'contain',
              })
            }
          >
            Fit: {doc.background.fit}
          </Button>
        )}
      </Box>

      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2">Layers</Typography>
        <Button size="small" startIcon={<Add />} onClick={() => addTextLayer()}>
          Add
        </Button>
      </Box>

      <List sx={{ flex: 1, overflow: 'auto', p: 0.5 }}>
        {reversedLayers.map((layer, visualIndex) => {
          const actualIndex = doc.layers.length - 1 - visualIndex;
          return (
            <LayerListItem
              key={layer.id}
              layer={layer}
              isSelected={layer.id === selectedLayerId}
              onSelect={() => selectLayer(layer.id)}
              onDelete={() => removeTextLayer(layer.id)}
              onToggleVisibility={() =>
                updateTextLayer(layer.id, { visible: !layer.visible })
              }
              onToggleLock={() =>
                updateTextLayer(layer.id, { locked: !layer.locked })
              }
              onMoveUp={() => reorderLayer(layer.id, 'up')}
              onMoveDown={() => reorderLayer(layer.id, 'down')}
              isFirst={actualIndex === 0}
              isLast={actualIndex === doc.layers.length - 1}
            />
          );
        })}
      </List>
    </Paper>
  );
};
