import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Typography,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ExportFormat, ExportOptions } from '@mint/core';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  onExport,
}) => {
  const { t } = useTranslation();
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(90);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('export.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {t('export.format')}
          </Typography>
          <ToggleButtonGroup
            value={format}
            exclusive
            onChange={(_, v: ExportFormat | null) => {
              if (v) setFormat(v);
            }}
            fullWidth
            size="small"
          >
            <ToggleButton value="png">PNG</ToggleButton>
            <ToggleButton value="jpeg">JPG</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {format === 'jpeg' && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2">
              {t('export.quality', { value: quality })}
            </Typography>
            <Slider
              value={quality}
              min={10}
              max={100}
              step={5}
              onChange={(_, v) => setQuality(v as number)}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('export.cancel')}</Button>
        <Button
          variant="contained"
          onClick={() => {
            onExport({ format, quality });
            onClose();
          }}
        >
          {t('export.export')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
