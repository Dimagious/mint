import React, { useCallback } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '@mint/editor';
import { StylePanel, loadGoogleFont } from '@mint/ui';
import type { TextLayerData } from '@mint/core';
import { getPresetById, getSafeZoneByPresetId } from '@mint/core';
import {
  calculateLayerBackgroundLuminance,
  getSmartContrastStyle,
} from '../utils/smart-contrast';
import { calculateFitFontSize } from '../utils/text-fit';

const PANEL_WIDTH = 300;

interface PropertiesPanelProps {
  mobile?: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  mobile = false,
}) => {
  const { t } = useTranslation();
  const doc = useEditorStore((s) => s.document);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const updateTextLayer = useEditorStore((s) => s.updateTextLayer);

  const selectedLayer = doc.layers.find((l) => l.id === selectedLayerId);

  const handleAlignHorizontal = useCallback(
    (position: 'left' | 'center' | 'right') => {
      if (!selectedLayer) return;
      const preset = getPresetById(doc.presetId);
      const safeZone = getSafeZoneByPresetId(doc.presetId);
      const contentWidth = preset.width - safeZone.left - safeZone.right;

      let x = selectedLayer.x;
      if (position === 'left') {
        x = safeZone.left;
      } else if (position === 'center') {
        x = safeZone.left + (contentWidth - selectedLayer.width) / 2;
      } else {
        x = preset.width - safeZone.right - selectedLayer.width;
      }

      const maxX = Math.max(0, preset.width - selectedLayer.width);
      updateTextLayer(selectedLayer.id, {
        x: Math.round(clamp(x, 0, maxX)),
      });
    },
    [doc.presetId, selectedLayer, updateTextLayer],
  );

  const handleAlignVertical = useCallback(
    (position: 'top' | 'center' | 'bottom') => {
      if (!selectedLayer) return;
      const preset = getPresetById(doc.presetId);
      const safeZone = getSafeZoneByPresetId(doc.presetId);
      const contentHeight = preset.height - safeZone.top - safeZone.bottom;

      let y = selectedLayer.y;
      if (position === 'top') {
        y = safeZone.top;
      } else if (position === 'center') {
        y = safeZone.top + (contentHeight - selectedLayer.height) / 2;
      } else {
        y = preset.height - safeZone.bottom - selectedLayer.height;
      }

      const maxY = Math.max(0, preset.height - selectedLayer.height);
      updateTextLayer(selectedLayer.id, {
        y: Math.round(clamp(y, 0, maxY)),
      });
    },
    [doc.presetId, selectedLayer, updateTextLayer],
  );

  const handleFitTextWidth = useCallback(() => {
    if (!selectedLayer) return;
    loadGoogleFont(selectedLayer.style.fontFamily);
    const fittedSize = calculateFitFontSize(selectedLayer);
    updateTextLayer(selectedLayer.id, {
      style: {
        ...selectedLayer.style,
        fontSize: fittedSize,
      },
    });
  }, [selectedLayer, updateTextLayer]);

  const handleSmartContrast = useCallback(async () => {
    if (!selectedLayer) return;
    const preset = getPresetById(doc.presetId);
    const luminance = await calculateLayerBackgroundLuminance(
      doc,
      preset,
      selectedLayer,
    );
    const contrast = getSmartContrastStyle(luminance);

    updateTextLayer(selectedLayer.id, {
      style: {
        ...selectedLayer.style,
        color: contrast.color,
        stroke: contrast.stroke,
      },
    });
  }, [doc, selectedLayer, updateTextLayer]);

  return (
    <Paper
      data-testid={mobile ? 'properties-panel-mobile' : 'properties-panel'}
      sx={{
        width: mobile ? '100%' : PANEL_WIDTH,
        minWidth: mobile ? 0 : PANEL_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        borderLeft: mobile ? 0 : 1,
        borderColor: 'divider',
        overflow: 'auto',
        height: '100%',
      }}
      elevation={0}
    >
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2">{t('properties.title')}</Typography>
      </Box>

      {selectedLayer ? (
        <StylePanel
          layer={selectedLayer}
          onUpdate={(changes: Partial<Omit<TextLayerData, 'id'>>) =>
            updateTextLayer(selectedLayer.id, changes)
          }
          onAlignHorizontal={handleAlignHorizontal}
          onAlignVertical={handleAlignVertical}
          onFitTextWidth={handleFitTextWidth}
          onSmartContrast={handleSmartContrast}
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
            {t('properties.selectLayer')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
