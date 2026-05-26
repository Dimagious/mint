import React, { useMemo, useState } from 'react';
import {
  Box,
  InputAdornment,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/* ────────────────────────────────────────────────────────────────────────── */
/* Public API                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

export interface ColorChipProps {
  value: string;
  onChange: (hex: string) => void;
  /** Override the localStorage key — useful in tests. */
  recentStorageKey?: string;
  /** Override the preset palette. */
  presetColors?: readonly string[];
}

const DEFAULT_PRESET_COLORS = [
  '#1A1D1B',
  '#5E6764',
  '#FFFFFF',
  '#2F9F7A',
  '#1F7459',
  '#E26D5C',
  '#E4B061',
  '#3F88C5',
  '#7E5BEF',
  '#D85F9B',
] as const;

const DEFAULT_RECENT_KEY = 'mint:recent-colors';

/**
 * Reusable color chip with a popover picker.
 *
 * Shows a hex chip the user can click to open a popover containing:
 *   - the native `<input type="color">` for the rainbow picker
 *   - a hex text input that accepts `#rgb`, `#rrggbb`, or `rgb()/rgba()`
 *   - a "recent colors" row (persisted to localStorage)
 *   - a curated preset palette
 *
 * Lifted from StylePanel so LayersPanel can use the same chip for the
 * canvas background colour (BACKLOG §1 security: the raw `<input
 * type="color">` was inconsistent with the rest of the redesigned UI
 * and was already flagged in the design brief).
 */
export const ColorChip: React.FC<ColorChipProps> = ({
  value,
  onChange,
  recentStorageKey = DEFAULT_RECENT_KEY,
  presetColors = DEFAULT_PRESET_COLORS,
}) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  // Refresh from localStorage on each popover open so a sibling chip's
  // recent additions show up — `anchor` is the trigger so the memo
  // recomputes when it changes, which is intentional even though anchor
  // itself isn't read inside.
  const recent = useMemo<string[]>(() => {
    void anchor;
    try {
      return JSON.parse(localStorage.getItem(recentStorageKey) || '[]');
    } catch {
      return [];
    }
  }, [anchor, recentStorageKey]);

  const commit = (hex: string) => {
    onChange(hex);
    try {
      const next = [
        hex,
        ...recent.filter((c) => c.toLowerCase() !== hex.toLowerCase()),
      ].slice(0, 8);
      localStorage.setItem(recentStorageKey, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  };

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        onClick={(e) => setAnchor(e.currentTarget)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setAnchor(e.currentTarget as HTMLElement);
          }
        }}
        sx={(theme) => ({
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          height: 32,
          px: '8px',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '8px',
          cursor: 'pointer',
          background: theme.palette.background.paper,
          '&:hover': { borderColor: theme.palette.text.secondary },
        })}
        data-testid="color-chip"
      >
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '5px',
            bgcolor: value,
            border: '1px solid rgba(0,0,0,.1)',
          }}
        />
        <Typography
          className="tnum"
          sx={{
            fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            fontSize: 11.5,
          }}
        >
          {value.toUpperCase()}
        </Typography>
      </Box>

      <Popover
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.75,
              p: 1.5,
              width: 240,
              boxShadow: '0 4px 12px rgba(0,0,0,.1)',
            },
          },
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={value}
          onChange={(e) => commit(normalizeHex(e.target.value, value))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <input
                  type="color"
                  value={normalizeHex(value, '#000000')}
                  onChange={(e) => commit(e.target.value)}
                  style={{
                    width: 22,
                    height: 22,
                    border: 0,
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                />
              </InputAdornment>
            ),
            sx: {
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
              fontSize: 12.5,
            },
          }}
        />

        {recent.length > 0 && (
          <Swatches title="recentColors" colors={recent} onPick={commit} />
        )}
        <Swatches
          title="presetColors"
          colors={[...presetColors]}
          onPick={commit}
        />
      </Popover>
    </>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

const Swatches: React.FC<{
  title: 'recentColors' | 'presetColors';
  colors: string[];
  onPick: (c: string) => void;
}> = ({ title, colors, onPick }) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ mt: 1.25 }}>
      <Typography
        sx={{
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: '0.05em',
          color: 'text.disabled',
          textTransform: 'uppercase',
          mb: 0.75,
        }}
      >
        {t(`style.${title}`)}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 0.75,
        }}
      >
        {colors.map((c) => (
          <Box
            key={c}
            role="button"
            tabIndex={0}
            onClick={() => onPick(c)}
            sx={{
              width: 22,
              height: 22,
              borderRadius: '6px',
              border: '1px solid rgba(0,0,0,.1)',
              bgcolor: c,
              cursor: 'pointer',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

function byteToHex(value: number): string {
  const c = Math.max(0, Math.min(255, Math.round(value)));
  return c.toString(16).padStart(2, '0');
}

/**
 * Coerce any sensible CSS color string into a `#rrggbb` hex.
 *
 * Accepts:
 *  - `#rrggbb` (passes through, lowercased)
 *  - `#rgb`    (expanded to `#rrggbb`)
 *  - `rgb(r, g, b)` / `rgba(r, g, b, a)` (alpha dropped)
 *
 * Anything else returns the supplied fallback. Used by the chip to
 * normalize the value before persisting it into the document; callers
 * that need to round-trip rgba should not use this.
 */
export function normalizeHex(input: string, fallback: string): string {
  const full = input.match(/^#([a-f0-9]{6})$/i);
  if (full) return `#${full[1]!.toLowerCase()}`;
  const short = input.match(/^#([a-f0-9]{3})$/i);
  if (short) {
    const [r, g, b] = short[1]!.toLowerCase().split('');
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  const rgb = input.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const channels = rgb[1]!
      .split(',')
      .slice(0, 3)
      .map((x) => Number.parseFloat(x.trim()));
    if (channels.length === 3 && channels.every(Number.isFinite)) {
      return `#${byteToHex(channels[0]!)}${byteToHex(channels[1]!)}${byteToHex(channels[2]!)}`;
    }
  }
  return fallback;
}
