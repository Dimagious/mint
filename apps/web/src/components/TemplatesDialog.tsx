import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getPresetById } from '@mint/core';
import type { EditorDocument } from '@mint/core';
import { TEMPLATES } from '../templates';
import type { TemplateCategory, TemplateEntry } from '../templates';
import { TemplateThumbnail } from './TemplateThumbnail';

interface TemplatesDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called with the chosen template's document — host wires this to `loadDocument`. */
  onPick: (document: EditorDocument) => void;
}

const ALL = 'all' as const;

type ActiveCategory = TemplateCategory | typeof ALL;

/**
 * Browse + pick a starting template. Renders a categorised grid of
 * thumbnails; clicking a thumbnail loads the document into the editor.
 *
 * Thumbnails are drawn into off-screen canvases (see `TemplateThumbnail`)
 * — no Fabric.js or DataURL caching needed at this scale.
 */
export const TemplatesDialog: React.FC<TemplatesDialogProps> = ({
  open,
  onClose,
  onPick,
}) => {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState<ActiveCategory>(ALL);

  // The order of category tabs is fixed for stability; ALL leads.
  const categories = useMemo<ActiveCategory[]>(
    () => [ALL, 'announcement', 'quote', 'social', 'promo'],
    [],
  );

  const visible = useMemo(
    () =>
      category === ALL
        ? TEMPLATES
        : TEMPLATES.filter((tpl) => tpl.category === category),
    [category],
  );

  const lang = i18n.language.startsWith('ru') ? 'ru' : 'en';

  const handlePick = useCallback(
    (tpl: TemplateEntry) => {
      onPick(tpl.document);
      onClose();
    },
    [onPick, onClose],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="templates-dialog-title"
      data-testid="templates-dialog"
    >
      <DialogTitle id="templates-dialog-title" sx={{ pr: 7 }}>
        {t('templates.title')}
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mt: 0.25, fontSize: 12.5 }}
        >
          {t('templates.subtitle')}
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label={t('templates.close')}
          sx={{ position: 'absolute', top: 12, right: 12 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3 }}>
        <Tabs
          value={category}
          onChange={(_, v: ActiveCategory) => setCategory(v)}
          variant="scrollable"
          allowScrollButtonsMobile
          data-testid="templates-tabs"
        >
          {categories.map((c) => (
            <Tab
              key={c}
              value={c}
              label={t(`templates.categories.${c}`)}
              data-testid={`templates-tab-${c}`}
            />
          ))}
        </Tabs>
      </Box>

      <DialogContent>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 2,
            mt: 1,
          }}
          role="list"
        >
          {visible.map((tpl) => {
            const preset = getPresetById(tpl.document.presetId);
            return (
              <Stack
                key={tpl.id}
                role="listitem"
                onClick={() => handlePick(tpl)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePick(tpl);
                  }
                }}
                tabIndex={0}
                spacing={1}
                data-testid={`template-card-${tpl.id}`}
                sx={(theme) => ({
                  cursor: 'pointer',
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  p: 1.25,
                  transition: 'border-color .15s, box-shadow .15s',
                  '&:hover, &:focus-visible': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: '0 4px 16px rgba(47,159,122,.18)',
                    outline: 'none',
                  },
                })}
              >
                <Box
                  sx={{
                    aspectRatio: `${preset.width} / ${preset.height}`,
                    background: tpl.document.background.color,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <TemplateThumbnail document={tpl.document} preset={preset} />
                </Box>
                <Box>
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {tpl.name[lang]}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: 'text.disabled',
                      mt: 0.25,
                      lineHeight: 1.2,
                    }}
                  >
                    {tpl.hint[lang]} ·{' '}
                    <Box
                      component="span"
                      className="tnum"
                      sx={{
                        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                        fontSize: 11,
                      }}
                    >
                      {preset.width}×{preset.height}
                    </Box>
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
