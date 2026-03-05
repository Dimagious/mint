import React from 'react';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CANVAS_PRESETS } from '@mint/core';
import type { CanvasPresetId } from '@mint/core';
import { useEditorStore } from '@mint/editor';

export const ToolbarSection: React.FC = () => {
  const { t } = useTranslation();
  const presetId = useEditorStore((s) => s.document.presetId);
  const setPreset = useEditorStore((s) => s.setPreset);

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>{t('toolbar.canvasSize')}</InputLabel>
      <Select
        value={presetId}
        label={t('toolbar.canvasSize')}
        onChange={(e) => setPreset(e.target.value as CanvasPresetId)}
      >
        {CANVAS_PRESETS.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.width} x {p.height} ({t(`presets.${p.id}`)})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
