import {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Box } from '@mui/material';
import { FabricAdapter, useEditorStore } from '@mint/editor';
import type { ExportOptions, TextLayerData } from '@mint/core';
import { getPresetById, generateExportFilename } from '@mint/core';

export interface CanvasPanelHandle {
  handleExport: (options: ExportOptions) => void;
}

const CANVAS_SCALE = 0.5;

export const CanvasPanel = forwardRef<CanvasPanelHandle>(
  function CanvasPanel(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const adapterRef = useRef<FabricAdapter | null>(null);
    const doc = useEditorStore((s) => s.document);
    const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
    const selectLayer = useEditorStore((s) => s.selectLayer);
    const updateTextLayer = useEditorStore((s) => s.updateTextLayer);

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

    const preset = getPresetById(doc.presetId);

    return (
      <Box
        sx={{
          width: preset.width * CANVAS_SCALE,
          height: preset.height * CANVAS_SCALE,
          boxShadow: 3,
          borderRadius: 1,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <canvas ref={canvasRef} />
      </Box>
    );
  },
);
