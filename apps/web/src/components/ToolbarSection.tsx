import React from 'react';
import { Box, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CANVAS_PRESETS } from '@mint/core';
import type { CanvasPreset, CanvasPresetId } from '@mint/core';
import { useEditorStore } from '@mint/editor';

interface ToolbarSectionProps {
  compact?: boolean;
}

/**
 * Canvas preset selector (BRIEF §4.1).
 *
 * Renders a small ratio-preview rectangle alongside the dimensions:
 *
 *  [▢] Square · 1080 × 1080
 *
 * Each option in the menu also shows its preview shape so the user
 * can spot Portrait vs Story at a glance.
 */
export const ToolbarSection: React.FC<ToolbarSectionProps> = ({
  compact = false,
}) => {
  const { t } = useTranslation();
  const presetId = useEditorStore((s) => s.document.presetId);
  const setPreset = useEditorStore((s) => s.setPreset);
  const current =
    CANVAS_PRESETS.find((p) => p.id === presetId) ?? CANVAS_PRESETS[0]!;

  return (
    <Box>
      <Typography
        component="label"
        htmlFor="canvas-preset"
        sx={{
          display: 'block',
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.disabled',
          mb: '2px',
          lineHeight: 1,
        }}
      >
        {t('toolbar.canvasSizeShort')}
      </Typography>
      <Select
        id="canvas-preset"
        size="small"
        value={presetId}
        onChange={(e) => setPreset(e.target.value as CanvasPresetId)}
        renderValue={() => (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            <PresetIcon preset={current} />
            <span style={{ fontWeight: 500 }}>
              {compact
                ? t(`presets.${current.id}`)
                : `${t(`presets.${current.id}`)} · ${current.width} × ${current.height}`}
            </span>
          </Stack>
        )}
        sx={{
          minWidth: compact ? 132 : 220,
          height: 38,
          fontSize: 13,
          '& .MuiSelect-select': {
            py: 0.75,
            display: 'flex',
            alignItems: 'center',
          },
        }}
      >
        {CANVAS_PRESETS.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PresetIcon preset={p} />
              <span>{t(`presets.${p.id}`)}</span>
              <Typography
                component="span"
                className="tnum"
                sx={{
                  color: 'text.disabled',
                  fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                  fontSize: 12,
                  ml: 1,
                }}
              >
                {p.width}×{p.height}
              </Typography>
            </Stack>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

const PresetIcon: React.FC<{ preset: CanvasPreset }> = ({ preset }) => {
  // Map preset to a small filled rectangle in correct ratio.
  const isStory = preset.id === 'story';
  const isPortrait = preset.id === 'portrait';
  const w = 14;
  const h = isStory ? 18 : isPortrait ? 17 : 14;
  return (
    <Box
      sx={(theme) => ({
        width: w,
        height: h,
        borderRadius: '3px',
        bgcolor: theme.palette.secondary.main,
        border: `1.5px solid ${theme.palette.primary.main}`,
        flexShrink: 0,
      })}
      aria-hidden
    />
  );
};
