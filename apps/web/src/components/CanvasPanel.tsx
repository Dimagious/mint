import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from 'react';
import { Box, Typography } from '@mui/material';
import { CropFree } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { FabricAdapter, useEditorStore } from '@mint/editor';
import type { ExportOptions, TextLayerData } from '@mint/core';
import {
  generateExportFilename,
  getPresetById,
  getSafeZoneByPresetId,
} from '@mint/core';
import { readFileAsDataUrl } from '@mint/utils';
import { EmptyStateOverlay } from './EmptyStateOverlay';

export interface CanvasPanelHandle {
  handleExport: (
    options: ExportOptions & { filename?: string; scale?: 1 | 2 },
  ) => void;
  /** Snapshot for the export-dialog preview (returns a dataURL at current preset). */
  getPreviewDataUrl: () => string | null;
}

interface CanvasPanelProps {
  showSafeZones: boolean;
  /** Optional callbacks for the empty-state CTAs. */
  onRequestUpload?: () => void;
  onRequestAddText?: () => void;
}

const MAX_SCALE = 0.5;

function computeScale(presetId: string): number {
  let pw = 1080;
  let ph = 1080;
  try {
    const preset = getPresetById(
      presetId as Parameters<typeof getPresetById>[0],
    );
    pw = preset.width;
    ph = preset.height;
  } catch {
    /* fallback */
  }
  const isMobileView = window.innerWidth < 900;
  const panelsW = isMobileView ? 0 : 600;
  const toolbarH = isMobileView ? 64 : 80;
  const paddingH = isMobileView ? 32 : 64;
  const paddingW = isMobileView ? 32 : 64;
  const availH = window.innerHeight - toolbarH - paddingH;
  const availW = window.innerWidth - panelsW - paddingW;
  return Math.max(0.05, Math.min(MAX_SCALE, availH / ph, availW / pw));
}

/**
 * CanvasPanel — restyled chrome around the unchanged `<canvas>` (BRIEF §4.4, §4.5, §5.8).
 *
 *  - Canvas card has a soft drop shadow, rounded corners.
 *  - Dotted-grid backdrop applied by the parent (App.tsx).
 *  - Safe-zone tints are softer; the "Keep key text in safe area" pill now
 *    sits at bottom-left of the card (and dismisses on first interaction).
 *  - Drop-image overlay is mint-themed, not blue.
 *  - 1080 × 1080 dimension badge at top-left of the card.
 *  - **Empty-state overlay** when document is truly empty.
 *
 * IMPORTANT: this component does NOT touch `FabricAdapter` internals — only
 * the wrapping chrome around `<canvas>`. See BRIEF §9 hard constraints.
 */
export const CanvasPanel = forwardRef<CanvasPanelHandle, CanvasPanelProps>(
  function CanvasPanel(
    { showSafeZones, onRequestUpload, onRequestAddText },
    ref,
  ) {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const adapterRef = useRef<FabricAdapter | null>(null);

    const doc = useEditorStore((s) => s.document);
    const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
    const selectLayer = useEditorStore((s) => s.selectLayer);
    const updateTextLayer = useEditorStore((s) => s.updateTextLayer);
    const setBackground = useEditorStore((s) => s.setBackground);
    const addTextLayer = useEditorStore((s) => s.addTextLayer);

    const [dragging, setDragging] = useState(false);
    const [scale, setScale] = useState(() => computeScale(doc.presetId));
    const [hintDismissed, setHintDismissed] = useState(false);

    // Mount / dispose fabric adapter — UNCHANGED logic.
    useEffect(() => {
      if (!canvasRef.current) return;
      const adapter = new FabricAdapter(canvasRef.current);
      adapterRef.current = adapter;
      adapter.setCallbacks(
        (id: string | null) => selectLayer(id),
        (id: string, changes: Partial<Omit<TextLayerData, 'id'>>) =>
          updateTextLayer(id, changes),
      );
      return () => {
        adapter.dispose();
        adapterRef.current = null;
      };
    }, []);

    useEffect(() => {
      const onResize = () => setScale(computeScale(doc.presetId));
      onResize();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, [doc.presetId]);

    useEffect(() => {
      const a = adapterRef.current;
      if (!a) return;
      a.setDimensions(getPresetById(doc.presetId), scale);
      a.syncDocument(doc, selectedLayerId);
    }, [doc, selectedLayerId, scale]);

    // Auto-dismiss hint once any layer is added or background is set.
    useEffect(() => {
      if ((doc.layers.length > 0 || doc.background.dataUrl) && !hintDismissed) {
        setHintDismissed(true);
      }
    }, [doc.layers.length, doc.background.dataUrl, hintDismissed]);

    const handleExport = useCallback(
      (options: ExportOptions & { filename?: string; scale?: 1 | 2 }) => {
        const a = adapterRef.current;
        if (!a) return;
        const preset = getPresetById(doc.presetId);
        const dataUrl = a.getExportDataUrl(
          preset,
          options.format,
          options.quality,
        );
        const link = window.document.createElement('a');
        link.href = dataUrl;
        link.download =
          options.filename ?? generateExportFilename(options.format);
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      },
      [doc],
    );

    const getPreviewDataUrl = useCallback(() => {
      const a = adapterRef.current;
      if (!a) return null;
      try {
        return a.getExportDataUrl(getPresetById(doc.presetId), 'png', 80);
      } catch {
        return null;
      }
    }, [doc.presetId]);

    useImperativeHandle(ref, () => ({ handleExport, getPreviewDataUrl }), [
      handleExport,
      getPreviewDataUrl,
    ]);

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

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setDragging(false);
    }, []);

    const preset = getPresetById(doc.presetId);
    const safeZone = showSafeZones ? getSafeZoneByPresetId(doc.presetId) : null;
    const isEmpty = doc.layers.length === 0 && !doc.background.dataUrl;
    const showSafeHint = showSafeZones && !hintDismissed;

    return (
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Dimensions badge — lives outside the card so it never collides
            with the top safe-zone band. Sits just above the card's top edge. */}
        <Typography
          className="tnum"
          sx={{
            position: 'absolute',
            top: -22,
            left: 0,
            px: 0.875,
            py: '2px',
            borderRadius: '6px',
            bgcolor: 'rgba(20,30,25,.85)',
            color: '#fff',
            fontSize: 10,
            fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            backdropFilter: 'blur(8px)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
            pointerEvents: 'none',
            lineHeight: 1.4,
          }}
        >
          {preset.width} × {preset.height}
        </Typography>

        <Box
          data-testid="canvas-panel"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !hintDismissed && setHintDismissed(true)}
          sx={{
            width: preset.width * scale,
            height: preset.height * scale,
            borderRadius: '14px',
            boxShadow:
              '0 1px 2px rgba(0,0,0,.04), 0 20px 48px -12px rgba(20,40,30,.18)',
            overflow: 'hidden',
            position: 'relative',
            bgcolor: 'background.paper',
          }}
        >
          <canvas
            ref={canvasRef}
            aria-label={t('canvas.ariaLabel')}
            role="img"
          />

          {/* Safe zones */}
          {safeZone && (
            <>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: safeZone.top * scale,
                  bgcolor: 'rgba(47, 159, 122, 0.07)',
                  borderBottom: '1px dashed rgba(47,159,122,.4)',
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: safeZone.bottom * scale,
                  bgcolor: 'rgba(47, 159, 122, 0.07)',
                  borderTop: '1px dashed rgba(47,159,122,.4)',
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              />
            </>
          )}

          {/* Safe-zone hint pill — bottom-left, auto-dismiss */}
          {safeZone && showSafeHint && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 14,
                left: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: '11px',
                py: '5px',
                borderRadius: '999px',
                bgcolor: 'rgba(20,30,25,.7)',
                color: '#fff',
                fontSize: 11,
                backdropFilter: 'blur(8px)',
                zIndex: 5,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <CropFree sx={{ fontSize: 12 }} />
              {t('canvas.safeZoneHint')}
            </Box>
          )}

          {/* Drop image overlay (mint, not blue) */}
          {dragging && (
            <Box
              sx={{
                position: 'absolute',
                inset: 8,
                borderRadius: '10px',
                bgcolor: 'rgba(230, 243, 236, .85)',
                border: '2px dashed',
                borderColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                pointerEvents: 'none',
                color: 'primary.dark',
                fontWeight: 600,
              }}
            >
              <Typography color="inherit">{t('canvas.dropImage')}</Typography>
            </Box>
          )}

          {/* Empty state */}
          {isEmpty && onRequestUpload && (
            <EmptyStateOverlay
              onUpload={onRequestUpload}
              onAddText={onRequestAddText ?? (() => addTextLayer())}
            />
          )}
        </Box>
      </Box>
    );
  },
);
