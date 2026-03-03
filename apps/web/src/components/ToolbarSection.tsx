import React from 'react';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { CANVAS_PRESETS } from '@social-posts-helper/core';
import type { CanvasPresetId } from '@social-posts-helper/core';
import { useEditorStore } from '@social-posts-helper/editor';

export const ToolbarSection: React.FC = () => {
  const presetId = useEditorStore((s) => s.document.presetId);
  const setPreset = useEditorStore((s) => s.setPreset);

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>Canvas Size</InputLabel>
      <Select
        value={presetId}
        label="Canvas Size"
        onChange={(e) => setPreset(e.target.value as CanvasPresetId)}
      >
        {CANVAS_PRESETS.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
