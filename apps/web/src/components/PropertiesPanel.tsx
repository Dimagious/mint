import React, { useCallback } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { Tune } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '@mint/editor';
import { StylePanel, ensureFontLoaded } from '@mint/ui';
import type { TextLayerData } from '@mint/core';
import { getPresetById, getSafeZoneByPresetId } from '@mint/core';
import {
  calculateLayerBackgroundLuminance,
  getSmartContrastStyle,
} from '../utils/smart-contrast';
import { calculateFitFontSize } from '../utils/text-fit';

const PANEL_WIDTH = 320;

interface PropertiesPanelProps {
  mobile?: boolean;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), hi);

/**
 * Right panel — Properties (BRIEF §4.3).
 *
 * The panel itself is just chrome: it renders the "Editing: <layer>" header
 * and delegates the whole tabbed body (Text / Layout / Effects + Quick Tools)
 * to `<StylePanel>`. Empty-state lives here too.
 */
export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  mobile = false,
}) => {
  const { t } = useTranslation();
  const doc = useEditorStore((s) => s.document);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const updateTextLayer = useEditorStore((s) => s.updateTextLayer);

  const layer = doc.layers.find((l) => l.id === selectedLayerId);

  const handleAlignHorizontal = useCallback(
    (position: 'left' | 'center' | 'right') => {
      if (!layer) return;
      const preset = getPresetById(doc.presetId);
      const safe = getSafeZoneByPresetId(doc.presetId);
      const contentW = preset.width - safe.left - safe.right;
      let x = layer.x;
      if (position === 'left') x = safe.left;
      if (position === 'center') x = safe.left + (contentW - layer.width) / 2;
      if (position === 'right') x = preset.width - safe.right - layer.width;
      const maxX = Math.max(0, preset.width - layer.width);
      updateTextLayer(layer.id, { x: Math.round(clamp(x, 0, maxX)) });
    },
    [doc.presetId, layer, updateTextLayer],
  );

  const handleAlignVertical = useCallback(
    (position: 'top' | 'center' | 'bottom') => {
      if (!layer) return;
      const preset = getPresetById(doc.presetId);
      const safe = getSafeZoneByPresetId(doc.presetId);
      const contentH = preset.height - safe.top - safe.bottom;
      let y = layer.y;
      if (position === 'top') y = safe.top;
      if (position === 'center') y = safe.top + (contentH - layer.height) / 2;
      if (position === 'bottom') y = preset.height - safe.bottom - layer.height;
      const maxY = Math.max(0, preset.height - layer.height);
      updateTextLayer(layer.id, { y: Math.round(clamp(y, 0, maxY)) });
    },
    [doc.presetId, layer, updateTextLayer],
  );

  const handleFitTextWidth = useCallback(async () => {
    if (!layer) return;
    await ensureFontLoaded(layer.style.fontFamily, layer.style.fontWeight);
    updateTextLayer(layer.id, {
      style: { ...layer.style, fontSize: calculateFitFontSize(layer) },
    });
  }, [layer, updateTextLayer]);

  const handleSmartContrast = useCallback(async () => {
    if (!layer) return;
    const preset = getPresetById(doc.presetId);
    const luminance = await calculateLayerBackgroundLuminance(
      doc,
      preset,
      layer,
    );
    const contrast = getSmartContrastStyle(luminance);
    updateTextLayer(layer.id, {
      style: { ...layer.style, color: contrast.color, stroke: contrast.stroke },
    });
  }, [doc, layer, updateTextLayer]);

  return (
    <Paper
      elevation={0}
      data-testid={mobile ? 'properties-panel-mobile' : 'properties-panel'}
      sx={{
        width: mobile ? '100%' : PANEL_WIDTH,
        minWidth: mobile ? 0 : PANEL_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        borderLeft: mobile ? 0 : 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflowY: 'auto',
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2.25,
          pb: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: layer ? 1 : 0 }}>
          {layer ? t('properties.editing') : t('properties.title')}
        </Typography>

        {layer && (
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: `"${layer.style.fontFamily}", sans-serif`,
                fontWeight: layer.style.fontWeight,
                fontSize: 14,
              }}
              aria-hidden
            >
              aA
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {layer.text || t('layers.emptyText')}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.disabled', fontSize: 11.5 }}
              >
                {t('properties.textLayer')}
              </Typography>
            </Box>
          </Stack>
        )}
      </Box>

      {layer ? (
        <StylePanel
          layer={layer}
          onUpdate={(c: Partial<Omit<TextLayerData, 'id'>>) =>
            updateTextLayer(layer.id, c)
          }
          onAlignHorizontal={handleAlignHorizontal}
          onAlignVertical={handleAlignVertical}
          onFitTextWidth={handleFitTextWidth}
          onSmartContrast={handleSmartContrast}
        />
      ) : (
        <EmptyProperties />
      )}
    </Paper>
  );
};

const EmptyProperties: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: 'background.default',
          color: 'text.disabled',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
        }}
        aria-hidden
      >
        <Tune sx={{ fontSize: 18 }} />
      </Box>
      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
        {t('properties.selectLayer')}
      </Typography>
      <Typography
        variant="caption"
        sx={{ display: 'block', mt: 0.5, color: 'text.disabled' }}
      >
        {t('properties.selectLayerHint')}
      </Typography>
    </Box>
  );
};
