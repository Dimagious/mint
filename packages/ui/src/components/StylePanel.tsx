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
import type { TextLayerData, TextStyle } from '@social-posts-helper/core';

interface StylePanelProps {
  layer: TextLayerData;
  onUpdate: (changes: Partial<Omit<TextLayerData, 'id'>>) => void;
}

export const StylePanel: React.FC<StylePanelProps> = ({ layer, onUpdate }) => {
  const updateStyle = useCallback(
    (styleChanges: Partial<TextStyle>) => {
      onUpdate({ style: { ...layer.style, ...styleChanges } });
    },
    [layer.style, onUpdate],
  );

  return (
    <Box sx={{ p: 1 }}>
      <TextField
        label="Text"
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
          <InputLabel>Font</InputLabel>
          <Select
            value={layer.style.fontFamily}
            label="Font"
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
            Font Size: {layer.style.fontSize}
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
          <InputLabel>Weight</InputLabel>
          <Select
            value={layer.style.fontWeight}
            label="Weight"
            onChange={(e) =>
              updateStyle({ fontWeight: e.target.value as number })
            }
          >
            <MenuItem value={300}>Light</MenuItem>
            <MenuItem value={400}>Regular</MenuItem>
            <MenuItem value={600}>Semi Bold</MenuItem>
            <MenuItem value={700}>Bold</MenuItem>
            <MenuItem value={900}>Black</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Typography variant="caption">Color</Typography>
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
            Opacity: {Math.round(layer.style.opacity * 100)}%
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
          <InputLabel>Align</InputLabel>
          <Select
            value={layer.style.textAlign}
            label="Align"
            onChange={(e) =>
              updateStyle({
                textAlign: e.target.value as 'left' | 'center' | 'right',
              })
            }
          >
            <MenuItem value="left">Left</MenuItem>
            <MenuItem value="center">Center</MenuItem>
            <MenuItem value="right">Right</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Typography variant="caption">
            Line Height: {layer.style.lineHeight.toFixed(1)}
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
            Letter Spacing: {layer.style.letterSpacing}
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
            <Typography variant="body2">Shadow</Typography>
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
              label="Enable"
            />
            {layer.style.shadow && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption">
                    X: {layer.style.shadow.offsetX}
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
                    Y: {layer.style.shadow.offsetY}
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
                    Blur: {layer.style.shadow.blur}
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
                  <Typography variant="caption">Color</Typography>
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
            <Typography variant="body2">Stroke</Typography>
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
              label="Enable"
            />
            {layer.style.stroke && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption">
                    Width: {layer.style.stroke.width}
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
                  <Typography variant="caption">Color</Typography>
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
