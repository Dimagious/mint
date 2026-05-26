import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { ColorChip, normalizeHex } from './ColorChip';
import {
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  VerticalAlignTop,
  VerticalAlignCenter,
  VerticalAlignBottom,
  AutoFixHigh,
  Add,
  Remove,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { TextLayerData, TextStyle } from '@mint/core';
import { ALL_FONTS, loadGoogleFont } from '../fonts';

/* ────────────────────────────────────────────────────────────────────────── */
/* Public component                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

interface StylePanelProps {
  layer: TextLayerData;
  onUpdate: (changes: Partial<Omit<TextLayerData, 'id'>>) => void;
  onAlignHorizontal?: (position: 'left' | 'center' | 'right') => void;
  onAlignVertical?: (position: 'top' | 'center' | 'bottom') => void;
  onFitTextWidth?: () => void | Promise<void>;
  onSmartContrast?: () => void | Promise<void>;
}

type TabValue = 'text' | 'layout' | 'effects';

/**
 * Style panel — split into 3 tabs (BRIEF §4.3, §5.7).
 *
 *  ┌─ EDITING (layer chip)              ┐  ← header (in PropertiesPanel)
 *  │  Quick Tools                       │  ← always-visible, above tabs
 *  │  [align ←↔→] [align ↑↕↓]            │
 *  │  Fit to width   Smart contrast     │
 *  ├─ Text · Layout · Effects ──────────┤  ← Tabs (Notion-underlined)
 *  │  per-tab body                      │
 *  └────────────────────────────────────┘
 *
 * Text tab    : text content, font, size, weight, color
 * Layout tab  : opacity, line-height, letter-spacing, rotation
 * Effects tab : shadow / stroke / background fill — each a card with a switch
 */
export const StylePanel: React.FC<StylePanelProps> = ({
  layer,
  onUpdate,
  onAlignHorizontal,
  onAlignVertical,
  onFitTextWidth,
  onSmartContrast,
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabValue>('text');

  const updateStyle = useCallback(
    (s: Partial<TextStyle>) => onUpdate({ style: { ...layer.style, ...s } }),
    [layer.style, onUpdate],
  );

  return (
    <Box sx={{ pb: 2.5 }}>
      <QuickTools
        layer={layer}
        onAlignHorizontal={onAlignHorizontal}
        onAlignVertical={onAlignVertical}
        onFitTextWidth={onFitTextWidth}
        onSmartContrast={onSmartContrast}
      />

      <Tabs
        value={tab}
        onChange={(_, v: TabValue) => setTab(v)}
        sx={{ px: 2, mb: 1.5 }}
        data-testid="style-tabs"
      >
        <Tab
          value="text"
          label={t('style.tabText')}
          data-testid="style-tab-text"
        />
        <Tab
          value="layout"
          label={t('style.tabLayout')}
          data-testid="style-tab-layout"
        />
        <Tab
          value="effects"
          label={t('style.tabEffects')}
          data-testid="style-tab-effects"
        />
      </Tabs>

      <Box sx={{ px: 2 }}>
        {tab === 'text' && (
          <TextTab
            layer={layer}
            onUpdate={onUpdate}
            updateStyle={updateStyle}
          />
        )}
        {tab === 'layout' && (
          <LayoutTab
            layer={layer}
            onUpdate={onUpdate}
            updateStyle={updateStyle}
          />
        )}
        {tab === 'effects' && (
          <EffectsTab layer={layer} updateStyle={updateStyle} />
        )}
      </Box>
    </Box>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Quick tools — fixed above tabs                                             */
/* ────────────────────────────────────────────────────────────────────────── */

interface QTProps {
  layer: TextLayerData;
  onAlignHorizontal?: (p: 'left' | 'center' | 'right') => void;
  onAlignVertical?: (p: 'top' | 'center' | 'bottom') => void;
  onFitTextWidth?: () => void | Promise<void>;
  onSmartContrast?: () => void | Promise<void>;
}

const QuickTools: React.FC<QTProps> = ({
  onAlignHorizontal,
  onAlignVertical,
  onFitTextWidth,
  onSmartContrast,
}) => {
  const { t } = useTranslation();
  const [fitBusy, setFitBusy] = useState(false);
  const [contrastBusy, setContrastBusy] = useState(false);

  if (
    !onAlignHorizontal &&
    !onAlignVertical &&
    !onFitTextWidth &&
    !onSmartContrast
  ) {
    return null;
  }

  return (
    <Box
      sx={{ px: 2, pt: 1.75, pb: 1.5, borderBottom: 1, borderColor: 'divider' }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        {onAlignHorizontal && (
          <SegPill
            value=""
            options={[
              {
                value: 'left',
                icon: <FormatAlignLeft fontSize="small" />,
                tip: t('style.left'),
              },
              {
                value: 'center',
                icon: <FormatAlignCenter fontSize="small" />,
                tip: t('style.center'),
              },
              {
                value: 'right',
                icon: <FormatAlignRight fontSize="small" />,
                tip: t('style.right'),
              },
            ]}
            onChange={(v) =>
              onAlignHorizontal(v as 'left' | 'center' | 'right')
            }
          />
        )}
        {onAlignVertical && (
          <SegPill
            value=""
            options={[
              {
                value: 'top',
                icon: <VerticalAlignTop fontSize="small" />,
                tip: t('style.top'),
              },
              {
                value: 'center',
                icon: <VerticalAlignCenter fontSize="small" />,
                tip: t('style.middle'),
              },
              {
                value: 'bottom',
                icon: <VerticalAlignBottom fontSize="small" />,
                tip: t('style.bottom'),
              },
            ]}
            onChange={(v) => onAlignVertical(v as 'top' | 'center' | 'bottom')}
          />
        )}
      </Stack>
      <Stack direction="row" spacing={1}>
        {onFitTextWidth && (
          <Button
            fullWidth
            size="small"
            variant="outlined"
            disabled={fitBusy}
            onClick={async () => {
              setFitBusy(true);
              try {
                await onFitTextWidth();
              } finally {
                setFitBusy(false);
              }
            }}
          >
            {fitBusy ? t('style.fitting') : t('style.fitToWidth')}
          </Button>
        )}
        {onSmartContrast && (
          <Button
            fullWidth
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<AutoFixHigh sx={{ fontSize: 14 }} />}
            disabled={contrastBusy}
            onClick={async () => {
              setContrastBusy(true);
              try {
                await onSmartContrast();
              } finally {
                setContrastBusy(false);
              }
            }}
            sx={{ color: 'primary.dark' }}
          >
            {contrastBusy
              ? t('style.applyingContrast')
              : t('style.smartContrast')}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

interface SegPillProps {
  value: string;
  options: { value: string; icon: React.ReactNode; tip: string }[];
  onChange: (v: string) => void;
}
const SegPill: React.FC<SegPillProps> = ({ value, options, onChange }) => (
  <Box
    sx={(theme) => ({
      display: 'inline-flex',
      background: theme.palette.background.default,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: '999px',
      p: '3px',
      gap: '2px',
    })}
  >
    {options.map((o) => (
      <Tooltip key={o.value} title={o.tip} placement="top">
        <IconButton
          size="small"
          onClick={() => onChange(o.value)}
          sx={{
            width: 28,
            height: 28,
            borderRadius: '999px',
            color: value === o.value ? 'text.primary' : 'text.secondary',
            bgcolor: value === o.value ? 'background.paper' : 'transparent',
            boxShadow: value === o.value ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
          }}
        >
          {o.icon}
        </IconButton>
      </Tooltip>
    ))}
  </Box>
);

/* ────────────────────────────────────────────────────────────────────────── */
/* TextTab — content, font, size, weight, color                               */
/* ────────────────────────────────────────────────────────────────────────── */

interface TabProps {
  layer: TextLayerData;
  onUpdate: (c: Partial<Omit<TextLayerData, 'id'>>) => void;
  updateStyle: (s: Partial<TextStyle>) => void;
}

const TextTab: React.FC<TabProps> = ({ layer, onUpdate, updateStyle }) => {
  const { t } = useTranslation();

  // Debounced text edit — mirrors prior behaviour (local leads store by ~150ms).
  const [localText, setLocalText] = useState(layer.text);
  const dRef = useRef<ReturnType<typeof setTimeout>>();
  const updRef = useRef(onUpdate);
  useEffect(() => {
    updRef.current = onUpdate;
  }, [onUpdate]);
  useEffect(() => {
    setLocalText(layer.text);
  }, [layer.id, layer.text]);
  useEffect(() => () => clearTimeout(dRef.current), []);

  const onText = (v: string) => {
    setLocalText(v);
    clearTimeout(dRef.current);
    dRef.current = setTimeout(() => updRef.current({ text: v }), 150);
  };

  return (
    <Stack spacing={2}>
      <TextField
        value={localText}
        onChange={(e) => onText(e.target.value)}
        multiline
        rows={2}
        fullWidth
        size="small"
        placeholder={t('style.text')}
        inputProps={{ 'data-testid': 'style-text-input' }}
      />

      <FieldGroup label={t('style.font')}>
        <Autocomplete
          size="small"
          options={ALL_FONTS}
          getOptionLabel={(o) => o.family}
          groupBy={(o) => o.category}
          value={
            ALL_FONTS.find((f) => f.family === layer.style.fontFamily) || {
              family: layer.style.fontFamily,
              category: 'sans-serif' as const,
            }
          }
          onChange={(_, val) => {
            if (val) {
              loadGoogleFont(val.family);
              updateStyle({ fontFamily: val.family });
            }
          }}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <li key={key} {...rest}>
                <span
                  style={{
                    fontFamily: `"${option.family}", ${option.category}`,
                  }}
                >
                  {option.family}
                </span>
              </li>
            );
          }}
          renderInput={(p) => (
            <TextField
              {...p}
              placeholder={t('style.fontPlaceholder')}
              InputProps={{
                ...p.InputProps,
                style: {
                  fontFamily: `"${layer.style.fontFamily}", sans-serif`,
                },
              }}
            />
          )}
          disableClearable
          fullWidth
        />
      </FieldGroup>

      <NumberSlider
        label={t('style.fontSizeLabel')}
        min={8}
        max={400}
        step={1}
        value={layer.style.fontSize}
        onChange={(v) => updateStyle({ fontSize: v })}
      />

      <FieldGroup label={t('style.weight')}>
        <Select
          fullWidth
          size="small"
          value={layer.style.fontWeight}
          onChange={(e) =>
            updateStyle({ fontWeight: e.target.value as number })
          }
        >
          <MenuItem value={300}>{t('style.weightLight')}</MenuItem>
          <MenuItem value={400}>{t('style.weightRegular')}</MenuItem>
          <MenuItem value={600}>{t('style.weightSemiBold')}</MenuItem>
          <MenuItem value={700}>{t('style.weightBold')}</MenuItem>
          <MenuItem value={900}>{t('style.weightBlack')}</MenuItem>
        </Select>
      </FieldGroup>

      <FieldGroup label={t('style.color')}>
        <ColorChip
          value={layer.style.color}
          onChange={(c) => updateStyle({ color: c })}
        />
      </FieldGroup>
    </Stack>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/* LayoutTab — opacity, line-height, letter-spacing, rotation                  */
/* ────────────────────────────────────────────────────────────────────────── */

const LayoutTab: React.FC<TabProps> = ({ layer, onUpdate, updateStyle }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={2}>
      <NumberSlider
        label={t('style.opacity')}
        suffix="%"
        min={0}
        max={100}
        step={1}
        value={Math.round(layer.style.opacity * 100)}
        onChange={(v) => updateStyle({ opacity: v / 100 })}
      />
      <NumberSlider
        label={t('style.lineHeight')}
        min={0.5}
        max={3}
        step={0.1}
        decimals={1}
        value={layer.style.lineHeight}
        onChange={(v) => updateStyle({ lineHeight: v })}
      />
      <NumberSlider
        label={t('style.letterSpacing')}
        min={-20}
        max={100}
        step={1}
        value={layer.style.letterSpacing}
        onChange={(v) => updateStyle({ letterSpacing: v })}
      />
      <NumberSlider
        label={t('style.rotation')}
        suffix="°"
        min={-180}
        max={180}
        step={1}
        value={layer.rotation}
        onChange={(v) => onUpdate({ rotation: v })}
      />
    </Stack>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/* EffectsTab — shadow / stroke / background fill                              */
/* ────────────────────────────────────────────────────────────────────────── */

const EffectsTab: React.FC<{
  layer: TextLayerData;
  updateStyle: (s: Partial<TextStyle>) => void;
}> = ({ layer, updateStyle }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={1.25}>
      <EffectCard
        title={t('style.shadow')}
        enabled={layer.style.shadow !== null}
        onToggle={(on) =>
          updateStyle({
            shadow: on
              ? { offsetX: 2, offsetY: 2, blur: 4, color: '#000000' }
              : null,
          })
        }
      >
        {layer.style.shadow && (
          <Stack spacing={1.5}>
            <NumberSlider
              label={t('style.shadowX')}
              min={-20}
              max={20}
              value={layer.style.shadow.offsetX}
              onChange={(v) =>
                updateStyle({ shadow: { ...layer.style.shadow!, offsetX: v } })
              }
            />
            <NumberSlider
              label={t('style.shadowY')}
              min={-20}
              max={20}
              value={layer.style.shadow.offsetY}
              onChange={(v) =>
                updateStyle({ shadow: { ...layer.style.shadow!, offsetY: v } })
              }
            />
            <NumberSlider
              label={t('style.shadowBlur')}
              min={0}
              max={30}
              value={layer.style.shadow.blur}
              onChange={(v) =>
                updateStyle({ shadow: { ...layer.style.shadow!, blur: v } })
              }
            />
            <FieldGroup label={t('style.color')}>
              <ColorChip
                value={normalizeHex(layer.style.shadow.color, '#000000')}
                onChange={(c) =>
                  updateStyle({ shadow: { ...layer.style.shadow!, color: c } })
                }
              />
            </FieldGroup>
          </Stack>
        )}
      </EffectCard>

      <EffectCard
        title={t('style.stroke')}
        enabled={layer.style.stroke !== null}
        onToggle={(on) =>
          updateStyle({ stroke: on ? { width: 1, color: '#000000' } : null })
        }
      >
        {layer.style.stroke && (
          <Stack spacing={1.5}>
            <NumberSlider
              label={t('style.strokeWidth')}
              min={0}
              max={10}
              step={0.5}
              decimals={1}
              value={layer.style.stroke.width}
              onChange={(v) =>
                updateStyle({ stroke: { ...layer.style.stroke!, width: v } })
              }
            />
            <FieldGroup label={t('style.color')}>
              <ColorChip
                value={normalizeHex(layer.style.stroke.color, '#000000')}
                onChange={(c) =>
                  updateStyle({ stroke: { ...layer.style.stroke!, color: c } })
                }
              />
            </FieldGroup>
          </Stack>
        )}
      </EffectCard>

      <EffectCard
        title={t('style.background')}
        enabled={layer.style.background !== null}
        onToggle={(on) =>
          updateStyle({
            background: on
              ? { color: '#000000', padding: 10, borderRadius: 4 }
              : null,
          })
        }
      >
        {layer.style.background && (
          <Stack spacing={1.5}>
            <FieldGroup label={t('style.color')}>
              <ColorChip
                value={normalizeHex(layer.style.background.color, '#000000')}
                onChange={(c) =>
                  updateStyle({
                    background: { ...layer.style.background!, color: c },
                  })
                }
              />
            </FieldGroup>
            <NumberSlider
              label={t('style.bgPadding')}
              min={0}
              max={40}
              value={layer.style.background.padding}
              onChange={(v) =>
                updateStyle({
                  background: { ...layer.style.background!, padding: v },
                })
              }
            />
          </Stack>
        )}
      </EffectCard>
    </Stack>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Shared building blocks                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

const FieldGroup: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Box>
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: 'text.disabled',
        textTransform: 'uppercase',
        mb: 0.75,
      }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

interface NumberSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  decimals?: number;
  suffix?: string;
}

/**
 * Compact number + slider combo (BRIEF §5.3).
 *  - One row instead of two
 *  - Chip with −/+ micro-buttons that accept typing
 *  - tabular-nums for stable width while dragging
 */
const NumberSlider: React.FC<NumberSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  decimals = 0,
  suffix = '',
}) => {
  const fmt = (n: number) =>
    decimals ? n.toFixed(decimals) : String(Math.round(n));
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography
          sx={{ fontSize: 12.5, color: 'text.secondary', fontWeight: 500 }}
        >
          {label}
        </Typography>
        <Stack
          direction="row"
          alignItems="stretch"
          sx={(theme) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            height: 26,
            overflow: 'hidden',
            background: theme.palette.background.paper,
          })}
        >
          <IconButton
            size="small"
            sx={{ width: 22, borderRadius: 0 }}
            onClick={() => onChange(Math.max(min, value - step))}
          >
            <Remove sx={{ fontSize: 12 }} />
          </IconButton>
          <TextField
            value={fmt(value) + suffix}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
            }}
            variant="standard"
            InputProps={{ disableUnderline: true }}
            inputProps={{
              style: {
                width: 42,
                textAlign: 'center',
                fontSize: 12,
                fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                fontVariantNumeric: 'tabular-nums',
                padding: 0,
              },
            }}
          />
          <IconButton
            size="small"
            sx={{ width: 22, borderRadius: 0 }}
            onClick={() => onChange(Math.min(max, value + step))}
          >
            <Add sx={{ fontSize: 12 }} />
          </IconButton>
        </Stack>
      </Stack>
      <Box
        sx={{
          position: 'relative',
          height: 18,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            height: 4,
            bgcolor: 'background.default',
            borderRadius: 999,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            height: 4,
            width: `${pct}%`,
            bgcolor: 'primary.main',
            borderRadius: 999,
          }}
        />
        <Box
          sx={(theme) => ({
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 14,
            height: 14,
            bgcolor: '#fff',
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: '50%',
            boxShadow: '0 1px 3px rgba(0,0,0,.12)',
            left: `calc(${pct}% - 7px)`,
            pointerEvents: 'none',
          })}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'pointer',
            width: '100%',
            height: '100%',
          }}
        />
      </Box>
    </Box>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/* EffectCard — card with on/off toggle in the header                         */
/* ────────────────────────────────────────────────────────────────────────── */

const EffectCard: React.FC<{
  title: string;
  enabled: boolean;
  onToggle: (on: boolean) => void;
  children?: React.ReactNode;
}> = ({ title, enabled, onToggle, children }) => (
  <Box
    sx={(theme) => ({
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: '12px',
      bgcolor: theme.palette.background.paper,
      overflow: 'hidden',
    })}
  >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: 1.75, py: 1.25 }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{title}</Typography>
      <Switch
        size="small"
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        inputProps={{ 'aria-label': title }}
      />
    </Stack>
    {enabled && children && (
      <Box sx={{ px: 1.75, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
        {children}
      </Box>
    )}
  </Box>
);
