import React, { useCallback } from 'react';
import {
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
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { TextLayerData, TextStyle } from '@mint/core';

interface StylePanelProps {
  layer: TextLayerData;
  onUpdate: (changes: Partial<Omit<TextLayerData, 'id'>>) => void;
}

export const StylePanel: React.FC<StylePanelProps> = ({ layer, onUpdate }) => {
  const { t } = useTranslation();
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
        <FormControl size="small" fullWidth>
          <InputLabel>{t('style.font')}</InputLabel>
          <Select
            value={layer.style.fontFamily}
            label={t('style.font')}
            onChange={(e) =>
              updateStyle({ fontFamily: e.target.value as string })
            }
          >
            <MenuItem value="Arial">Arial</MenuItem>
            <MenuItem value="Georgia">Georgia</MenuItem>
            <MenuItem value="Times New Roman">Times New Roman</MenuItem>
            <MenuItem value="Courier New">Courier New</MenuItem>
            <MenuItem value="Verdana">Verdana</MenuItem>
            <MenuItem value="Impact">Impact</MenuItem>
          </Select>
        </FormControl>

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
      </Stack>
    </Box>
  );
};
