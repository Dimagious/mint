import React, { useCallback, useState } from 'react';
import {
  Autocomplete,
  Box,
  TextField,
  Slider,
  Select,
  MenuItem,
  Typography,
  FormControl,
  InputLabel,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Button,
  Divider,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { TextLayerData, TextStyle } from '@mint/core';
import { ALL_FONTS, loadGoogleFont } from '../fonts';

interface StylePanelProps {
  layer: TextLayerData;
  onUpdate: (changes: Partial<Omit<TextLayerData, 'id'>>) => void;
  onAlignHorizontal?: (position: 'left' | 'center' | 'right') => void;
  onAlignVertical?: (position: 'top' | 'center' | 'bottom') => void;
  onFitTextWidth?: () => void | Promise<void>;
  onSmartContrast?: () => void | Promise<void>;
}

export const StylePanel: React.FC<StylePanelProps> = ({
  layer,
  onUpdate,
  onAlignHorizontal,
  onAlignVertical,
  onFitTextWidth,
  onSmartContrast,
}) => {
  const { t } = useTranslation();
  const [isFittingText, setIsFittingText] = useState(false);
  const [isApplyingContrast, setIsApplyingContrast] = useState(false);
  const updateStyle = useCallback(
    (styleChanges: Partial<TextStyle>) => {
      onUpdate({ style: { ...layer.style, ...styleChanges } });
    },
    [layer.style, onUpdate],
  );

  return (
    <Box sx={{ p: 1 }}>
      <TextField
        label={t('style.text')}
        value={layer.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        multiline
        rows={2}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      />

      <Stack spacing={2}>
        {(onAlignHorizontal ||
          onAlignVertical ||
          onFitTextWidth ||
          onSmartContrast) && (
          <Box
            sx={{
              p: 1.25,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {t('style.quickTools')}
            </Typography>

            {onAlignHorizontal && (
              <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onAlignHorizontal('left')}
                >
                  {t('style.left')}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onAlignHorizontal('center')}
                >
                  {t('style.center')}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onAlignHorizontal('right')}
                >
                  {t('style.right')}
                </Button>
              </Stack>
            )}

            {onAlignVertical && (
              <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onAlignVertical('top')}
                >
                  {t('style.top')}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onAlignVertical('center')}
                >
                  {t('style.middle')}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onAlignVertical('bottom')}
                >
                  {t('style.bottom')}
                </Button>
              </Stack>
            )}

            {(onFitTextWidth || onSmartContrast) && <Divider sx={{ my: 1 }} />}

            {onFitTextWidth && (
              <Button
                size="small"
                variant="contained"
                disabled={isFittingText}
                onClick={async () => {
                  setIsFittingText(true);
                  try {
                    await onFitTextWidth();
                  } finally {
                    setIsFittingText(false);
                  }
                }}
                sx={{ mr: 1 }}
              >
                {isFittingText ? t('style.fitting') : t('style.fitToWidth')}
              </Button>
            )}

            {onSmartContrast && (
              <Button
                size="small"
                variant="contained"
                color="secondary"
                disabled={isApplyingContrast}
                onClick={async () => {
                  setIsApplyingContrast(true);
                  try {
                    await onSmartContrast();
                  } finally {
                    setIsApplyingContrast(false);
                  }
                }}
              >
                {isApplyingContrast
                  ? t('style.applyingContrast')
                  : t('style.smartContrast')}
              </Button>
            )}
          </Box>
        )}

        <Autocomplete
          size="small"
          options={ALL_FONTS}
          getOptionLabel={(opt) => opt.family}
          groupBy={(opt) => opt.category}
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
          renderInput={(params) => (
            <TextField {...params} label={t('style.font')} />
          )}
          disableClearable
          fullWidth
        />

        <Box>
          <Typography variant="caption">
            {t('style.fontSize', { size: layer.style.fontSize })}
          </Typography>
          <Slider
            value={layer.style.fontSize}
            min={8}
            max={200}
            onChange={(_, v) => updateStyle({ fontSize: v as number })}
            size="small"
          />
        </Box>

        <FormControl size="small" fullWidth>
          <InputLabel>{t('style.weight')}</InputLabel>
          <Select
            value={layer.style.fontWeight}
            label={t('style.weight')}
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
        </FormControl>

        <Box>
          <Typography variant="caption">{t('style.color')}</Typography>
          <input
            type="color"
            value={layer.style.color}
            onChange={(e) => updateStyle({ color: e.target.value })}
            style={{
              width: '100%',
              height: 32,
              border: 'none',
              cursor: 'pointer',
            }}
          />
        </Box>

        <Box>
          <Typography variant="caption">
            {t('style.opacity', {
              value: Math.round(layer.style.opacity * 100),
            })}
          </Typography>
          <Slider
            value={layer.style.opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(_, v) => updateStyle({ opacity: v as number })}
            size="small"
          />
        </Box>

        <FormControl size="small" fullWidth>
          <InputLabel>{t('style.align')}</InputLabel>
          <Select
            value={layer.style.textAlign}
            label={t('style.align')}
            onChange={(e) =>
              updateStyle({
                textAlign: e.target.value as 'left' | 'center' | 'right',
              })
            }
          >
            <MenuItem value="left">{t('style.alignLeft')}</MenuItem>
            <MenuItem value="center">{t('style.alignCenter')}</MenuItem>
            <MenuItem value="right">{t('style.alignRight')}</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Typography variant="caption">
            {t('style.lineHeight', {
              value: layer.style.lineHeight.toFixed(1),
            })}
          </Typography>
          <Slider
            value={layer.style.lineHeight}
            min={0.5}
            max={3}
            step={0.1}
            onChange={(_, v) => updateStyle({ lineHeight: v as number })}
            size="small"
          />
        </Box>

        <Box>
          <Typography variant="caption">
            {t('style.letterSpacing', { value: layer.style.letterSpacing })}
          </Typography>
          <Slider
            value={layer.style.letterSpacing}
            min={-5}
            max={20}
            step={0.5}
            onChange={(_, v) => updateStyle({ letterSpacing: v as number })}
            size="small"
          />
        </Box>

        <Accordion disableGutters sx={{ bgcolor: 'background.default' }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="body2">{t('style.shadow')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControlLabel
              control={
                <Switch
                  checked={layer.style.shadow !== null}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateStyle({
                        shadow: {
                          offsetX: 2,
                          offsetY: 2,
                          blur: 4,
                          color: 'rgba(0,0,0,0.5)',
                        },
                      });
                    } else {
                      updateStyle({ shadow: null });
                    }
                  }}
                  size="small"
                />
              }
              label={t('style.enable')}
            />
            {layer.style.shadow && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption">
                    {t('style.shadowX', { value: layer.style.shadow.offsetX })}
                  </Typography>
                  <Slider
                    value={layer.style.shadow.offsetX}
                    min={-20}
                    max={20}
                    onChange={(_, v) =>
                      updateStyle({
                        shadow: {
                          ...layer.style.shadow!,
                          offsetX: v as number,
                        },
                      })
                    }
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="caption">
                    {t('style.shadowY', { value: layer.style.shadow.offsetY })}
                  </Typography>
                  <Slider
                    value={layer.style.shadow.offsetY}
                    min={-20}
                    max={20}
                    onChange={(_, v) =>
                      updateStyle({
                        shadow: {
                          ...layer.style.shadow!,
                          offsetY: v as number,
                        },
                      })
                    }
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="caption">
                    {t('style.shadowBlur', { value: layer.style.shadow.blur })}
                  </Typography>
                  <Slider
                    value={layer.style.shadow.blur}
                    min={0}
                    max={30}
                    onChange={(_, v) =>
                      updateStyle({
                        shadow: {
                          ...layer.style.shadow!,
                          blur: v as number,
                        },
                      })
                    }
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="caption">{t('style.color')}</Typography>
                  <input
                    type="color"
                    value={layer.style.shadow.color}
                    onChange={(e) =>
                      updateStyle({
                        shadow: {
                          ...layer.style.shadow!,
                          color: e.target.value,
                        },
                      })
                    }
                    style={{
                      width: '100%',
                      height: 28,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </Box>
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters sx={{ bgcolor: 'background.default' }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="body2">{t('style.stroke')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControlLabel
              control={
                <Switch
                  checked={layer.style.stroke !== null}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateStyle({
                        stroke: { width: 1, color: '#000000' },
                      });
                    } else {
                      updateStyle({ stroke: null });
                    }
                  }}
                  size="small"
                />
              }
              label={t('style.enable')}
            />
            {layer.style.stroke && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption">
                    {t('style.strokeWidth', {
                      value: layer.style.stroke.width,
                    })}
                  </Typography>
                  <Slider
                    value={layer.style.stroke.width}
                    min={0}
                    max={10}
                    step={0.5}
                    onChange={(_, v) =>
                      updateStyle({
                        stroke: {
                          ...layer.style.stroke!,
                          width: v as number,
                        },
                      })
                    }
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="caption">{t('style.color')}</Typography>
                  <input
                    type="color"
                    value={layer.style.stroke.color}
                    onChange={(e) =>
                      updateStyle({
                        stroke: {
                          ...layer.style.stroke!,
                          color: e.target.value,
                        },
                      })
                    }
                    style={{
                      width: '100%',
                      height: 28,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </Box>
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters sx={{ bgcolor: 'background.default' }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="body2">{t('style.background')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControlLabel
              control={
                <Switch
                  checked={layer.style.background !== null}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateStyle({
                        background: {
                          color: 'rgba(0,0,0,0.6)',
                          padding: 10,
                          borderRadius: 4,
                        },
                      });
                    } else {
                      updateStyle({ background: null });
                    }
                  }}
                  size="small"
                />
              }
              label={t('style.enable')}
            />
            {layer.style.background && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption">{t('style.color')}</Typography>
                  <input
                    type="color"
                    value={layer.style.background.color}
                    onChange={(e) =>
                      updateStyle({
                        background: {
                          ...layer.style.background!,
                          color: e.target.value,
                        },
                      })
                    }
                    style={{
                      width: '100%',
                      height: 28,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption">
                    {t('style.bgPadding', {
                      value: layer.style.background.padding,
                    })}
                  </Typography>
                  <Slider
                    value={layer.style.background.padding}
                    min={0}
                    max={40}
                    onChange={(_, v) =>
                      updateStyle({
                        background: {
                          ...layer.style.background!,
                          padding: v as number,
                        },
                      })
                    }
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="caption">
                    {t('style.bgRadius', {
                      value: layer.style.background.borderRadius,
                    })}
                  </Typography>
                  <Slider
                    value={layer.style.background.borderRadius}
                    min={0}
                    max={30}
                    onChange={(_, v) =>
                      updateStyle({
                        background: {
                          ...layer.style.background!,
                          borderRadius: v as number,
                        },
                      })
                    }
                    size="small"
                  />
                </Box>
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Box>
  );
};
