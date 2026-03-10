import React from 'react';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CANVAS_PRESETS } from '@mint/core';
import type { CanvasPresetId } from '@mint/core';
import { useEditorStore } from '@mint/editor';

interface ToolbarSectionProps {
  compact?: boolean;
}

export const ToolbarSection: React.FC<ToolbarSectionProps> = ({
  compact = false,
}) => {
  const { t } = useTranslation();
  const presetId = useEditorStore((s) => s.document.presetId);
  const setPreset = useEditorStore((s) => s.setPreset);

  const label = compact
    ? t('toolbar.canvasSizeShort')
    : t('toolbar.canvasSize');

  return (
    <FormControl size="small" sx={{ minWidth: compact ? 132 : 200 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={presetId}
        label={label}
        sx={{
          '.MuiSelect-select': {
            fontSize: compact ? '0.8rem' : '0.875rem',
            py: compact ? 0.75 : 1,
          },
        }}
        onChange={(e) => setPreset(e.target.value as CanvasPresetId)}
      >
        {CANVAS_PRESETS.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {compact
              ? t(`presets.${p.id}`)
              : `${p.width} x ${p.height} (${t(`presets.${p.id}`)})`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
