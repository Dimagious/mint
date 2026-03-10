import React, { useCallback } from 'react';
import { Box, Typography, List, Button, Paper, Stack } from '@mui/material';
import { Add, Image } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '@mint/editor';
import { LayerListItem } from '@mint/ui';
import { readFileAsDataUrl } from '@mint/utils';

const PANEL_WIDTH = 260;

interface LayersPanelProps {
  mobile?: boolean;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ mobile = false }) => {
  const { t } = useTranslation();
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
      setBackground({ ...doc.background, dataUrl });
      e.target.value = '';
    },
    [setBackground, doc.background],
  );

  const reversedLayers = [...doc.layers].reverse();

  return (
    <Paper
      data-testid={mobile ? 'layers-panel-mobile' : 'layers-panel'}
      sx={{
        width: mobile ? '100%' : PANEL_WIDTH,
        minWidth: mobile ? 0 : PANEL_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        borderRight: mobile ? 0 : 1,
        borderColor: 'divider',
        height: '100%',
      }}
      elevation={0}
    >
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {t('layers.background')}
        </Typography>
        <Stack spacing={0.5}>
          <Button
            component="label"
            size="small"
            variant="outlined"
            startIcon={<Image />}
            fullWidth
          >
            {t('layers.uploadImage')}
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
              onClick={() =>
                setBackground({
                  ...doc.background,
                  fit: doc.background.fit === 'contain' ? 'cover' : 'contain',
                })
              }
            >
              {t('layers.fit', { fit: doc.background.fit })}
            </Button>
          )}
          <Box>
            <Typography variant="caption">{t('layers.bgColor')}</Typography>
            <input
              type="color"
              value={doc.background.color || '#e8f5ee'}
              onChange={(e) =>
                setBackground({ ...doc.background, color: e.target.value })
              }
              style={{
                width: '100%',
                height: 28,
                border: 'none',
                cursor: 'pointer',
              }}
            />
          </Box>
        </Stack>
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
        <Typography variant="subtitle2">{t('layers.title')}</Typography>
        <Button size="small" startIcon={<Add />} onClick={() => addTextLayer()}>
          {t('layers.add')}
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
              emptyText={t('layers.emptyText')}
            />
          );
        })}
      </List>
    </Paper>
  );
};
