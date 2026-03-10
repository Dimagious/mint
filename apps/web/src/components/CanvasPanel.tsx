import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FabricAdapter, useEditorStore } from '@mint/editor';
import type { ExportOptions, TextLayerData } from '@mint/core';
import {
  getPresetById,
  generateExportFilename,
  getSafeZoneByPresetId,
} from '@mint/core';
import { readFileAsDataUrl } from '@mint/utils';

export interface CanvasPanelHandle {
  handleExport: (options: ExportOptions) => void;
}

interface CanvasPanelProps {
  showSafeZones: boolean;
}

const CANVAS_SCALE = 0.5;

export const CanvasPanel = forwardRef<CanvasPanelHandle, CanvasPanelProps>(
  function CanvasPanel({ showSafeZones }, ref) {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const adapterRef = useRef<FabricAdapter | null>(null);
    const doc = useEditorStore((s) => s.document);
    const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
    const selectLayer = useEditorStore((s) => s.selectLayer);
    const updateTextLayer = useEditorStore((s) => s.updateTextLayer);
    const setBackground = useEditorStore((s) => s.setBackground);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
      if (!canvasRef.current) return;
      const adapter = new FabricAdapter(canvasRef.current);
      adapterRef.current = adapter;

      adapter.setCallbacks(
        (layerId: string | null) => {
          selectLayer(layerId);
        },
        (layerId: string, changes: Partial<Omit<TextLayerData, 'id'>>) => {
          updateTextLayer(layerId, changes);
        },
      );

      return () => {
        adapter.dispose();
        adapterRef.current = null;
      };
    }, []);

    useEffect(() => {
      const adapter = adapterRef.current;
      if (!adapter) return;
      const preset = getPresetById(doc.presetId);
      adapter.setDimensions(preset, CANVAS_SCALE);
      adapter.syncDocument(doc, selectedLayerId);
    }, [doc, selectedLayerId]);

    const handleExport = useCallback(
      (options: ExportOptions) => {
        const adapter = adapterRef.current;
        if (!adapter) return;

        const preset = getPresetById(doc.presetId);
        const dataUrl = adapter.getExportDataUrl(
          preset,
          options.format,
          options.quality,
        );

        const link = window.document.createElement('a');
        link.href = dataUrl;
        link.download = generateExportFilename(doc.presetId, options.format);
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      },
      [doc],
    );

    useImperativeHandle(ref, () => ({ handleExport }), [handleExport]);

    const handleDrop = useCallback(
      async (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        const dataUrl = await readFileAsDataUrl(file);
        setBackground({ ...doc.background, dataUrl });
      },
      [setBackground, doc.background],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
      setDragging(false);
    }, []);

    const preset = getPresetById(doc.presetId);
    const safeZone = showSafeZones ? getSafeZoneByPresetId(doc.presetId) : null;

    return (
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          width: preset.width * CANVAS_SCALE,
          height: preset.height * CANVAS_SCALE,
          boxShadow: 3,
          borderRadius: 1,
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <canvas ref={canvasRef} />
        {safeZone && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: safeZone.top * CANVAS_SCALE,
                bgcolor: 'rgba(47, 159, 122, 0.15)',
                borderBottom: '1px dashed rgba(47, 159, 122, 0.85)',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: safeZone.bottom * CANVAS_SCALE,
                bgcolor: 'rgba(47, 159, 122, 0.15)',
                borderTop: '1px dashed rgba(47, 159, 122, 0.85)',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: 'rgba(20, 80, 60, 0.66)',
                color: '#fff',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            >
              {t('canvas.safeZoneHint')}
            </Typography>
          </>
        )}
        {dragging && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(25, 118, 210, 0.15)',
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <Typography variant="h6" color="primary">
              {t('canvas.dropImage')}
            </Typography>
          </Box>
        )}
      </Box>
    );
  },
);
