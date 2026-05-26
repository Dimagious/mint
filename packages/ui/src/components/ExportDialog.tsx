import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { ExportFormat, ExportOptions, EditorDocument } from '@mint/core';
import { getPresetById } from '@mint/core';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (
    options: ExportOptions & { filename?: string; scale?: 1 | 2 },
  ) => void;
  /** Used for preview + dimension labels + size estimate. */
  doc?: EditorDocument;
  /** Snapshot dataURL of the canvas — passed in so we don't reach into FabricAdapter. */
  previewDataUrl?: string | null;
}

const FORMAT_BPP: Record<ExportFormat, number> = {
  png: 4,
  jpeg: 0.6,
  webp: 0.4,
};

function defaultFilename(format: ExportFormat): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ext = format === 'jpeg' ? 'jpg' : format;
  return `mint-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.${ext}`;
}

/**
 * Export dialog (BRIEF §5.6).
 * Adds: live preview thumb, filename input, output dimensions, file-size estimate,
 * 1×/2× scale toggle. Behaviour-compatible: still calls onExport with format + quality.
 */
export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  onExport,
  doc,
  previewDataUrl,
}) => {
  const { t } = useTranslation();
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState<1 | 2>(1);
  const [filename, setFilename] = useState(() => defaultFilename('png'));

  // Reset filename + format when reopening.
  useEffect(() => {
    if (open) {
      setFormat('png');
      setScale(1);
      setFilename(defaultFilename('png'));
    }
  }, [open]);

  // Keep filename extension in sync when format changes.
  useEffect(() => {
    setFilename((prev) => {
      const stem = prev.replace(/\.(png|jpg|jpeg|webp)$/i, '');
      const ext = format === 'jpeg' ? 'jpg' : format;
      return `${stem}.${ext}`;
    });
  }, [format]);

  const preset = doc
    ? getPresetById(doc.presetId)
    : { width: 1080, height: 1080 };
  const outW = preset.width * scale;
  const outH = preset.height * scale;
  const estBytes = Math.round((outW * outH * FORMAT_BPP[format]) / 4);

  const sizeLabel = useMemo(() => {
    if (estBytes < 1024) return `${estBytes} B`;
    if (estBytes < 1024 * 1024) return `${Math.round(estBytes / 1024)} KB`;
    return `${(estBytes / (1024 * 1024)).toFixed(1)} MB`;
  }, [estBytes]);

  const submit = () => {
    onExport({ format, quality: 90, filename, scale });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="export-dialog-title"
    >
      <DialogTitle id="export-dialog-title" sx={{ pb: 0.5 }}>
        {t('export.title')}
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mt: 0.25, fontSize: 12.5 }}
        >
          {t('export.subtitle')}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Live preview */}
        <Box
          sx={{
            width: '100%',
            height: 160,
            borderRadius: '10px',
            border: 1,
            borderColor: 'divider',
            mt: 1,
            mb: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: previewDataUrl
              ? 'transparent'
              : 'linear-gradient(135deg, #d6e7da 0%, #e3eee5 100%)',
          }}
          aria-label={t('export.preview')}
        >
          {previewDataUrl ? (
            <Box
              component="img"
              src={previewDataUrl}
              alt={t('export.preview')}
              sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 700,
                fontSize: 22,
                textShadow: '0 2px 12px rgba(0,0,0,.25)',
              }}
            >
              MINT
            </Typography>
          )}
        </Box>

        <Stack spacing={1.5}>
          <Row label={t('export.format')}>
            <ToggleButtonGroup
              value={format}
              exclusive
              size="small"
              onChange={(_, v) => v && setFormat(v)}
              data-testid="export-format"
            >
              <ToggleButton value="png">PNG</ToggleButton>
              <ToggleButton value="jpeg">JPG</ToggleButton>
              <ToggleButton value="webp">WebP</ToggleButton>
            </ToggleButtonGroup>
          </Row>

          <Row label={t('export.scale')}>
            <ToggleButtonGroup
              value={scale}
              exclusive
              size="small"
              onChange={(_, v) => v && setScale(v)}
              data-testid="export-scale"
            >
              <ToggleButton value={1}>1× &nbsp;{preset.width}</ToggleButton>
              <ToggleButton value={2}>2× &nbsp;{preset.width * 2}</ToggleButton>
            </ToggleButtonGroup>
          </Row>

          <Row label={t('export.filename')}>
            <TextField
              size="small"
              fullWidth
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              inputProps={{
                'data-testid': 'export-filename',
                style: {
                  fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                  fontSize: 12.5,
                },
              }}
            />
          </Row>

          {/* Output / size / color */}
          <Box
            sx={{
              display: 'flex',
              gap: 2.25,
              p: 1.25,
              bgcolor: 'background.default',
              borderRadius: '8px',
              mt: 0.5,
            }}
          >
            <Stat k={t('export.output')} v={`${outW} × ${outH}`} />
            <Stat k={t('export.estSize')} v={`~ ${sizeLabel}`} />
            <Stat k={t('export.color')} v="sRGB" />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 1.75,
          bgcolor: 'background.default',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Button onClick={onClose}>{t('export.cancel')}</Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={submit}
          data-testid="export-confirm"
        >
          {t('export.export')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Stack direction="row" spacing={1.25} alignItems="center">
    <Typography
      sx={{
        width: 78,
        flexShrink: 0,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'text.disabled',
      }}
    >
      {label}
    </Typography>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Stack>
);

const Stat: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <Typography
      sx={{
        fontSize: 10.5,
        color: 'text.disabled',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: 600,
        mb: 0.25,
      }}
    >
      {k}
    </Typography>
    <Typography
      className="tnum"
      sx={{
        fontSize: 12.5,
        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
      }}
    >
      {v}
    </Typography>
  </Box>
);
