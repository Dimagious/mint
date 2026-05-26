import React from 'react';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import {
  FileUpload,
  GridView,
  TextFields,
  Keyboard,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { MintMark } from '@mint/ui';

interface EmptyStateOverlayProps {
  onUpload: () => void;
  onAddText: () => void;
  /** Optional — when provided, an extra link "Browse templates" appears
   *  below the two primary CTAs and the keyboard tip line. */
  onBrowseTemplates?: () => void;
}

/**
 * Empty-state overlay on the canvas card (BRIEF §4.5).
 * Renders only when there is no background image AND no layers yet.
 *
 * Provides a "what is this / how do I start" entrypoint with two CTAs +
 * a keyboard-shortcut tip. Disappears the moment the user uploads a
 * background or adds a layer — CanvasPanel handles that conditional.
 */
export const EmptyStateOverlay: React.FC<EmptyStateOverlayProps> = ({
  onUpload,
  onAddText,
  onBrowseTemplates,
}) => {
  const { t } = useTranslation();
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPad|iPhone|iPod/.test(navigator.platform);

  return (
    <Box
      data-testid="empty-state-overlay"
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2.25,
        p: 5,
        textAlign: 'center',
        bgcolor:
          'linear-gradient(180deg, rgba(255,255,255,.4), rgba(255,255,255,.92))',
        background:
          'linear-gradient(180deg, rgba(255,255,255,.4), rgba(255,255,255,.92))',
        zIndex: 6,
      }}
    >
      <Box
        sx={{
          width: 70,
          height: 70,
          borderRadius: '22px',
          bgcolor: 'secondary.main',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 0.5,
        }}
        aria-hidden
      >
        <MintMark size={42} />
      </Box>

      <Typography variant="h6" sx={{ fontSize: 22, fontWeight: 600 }}>
        {t('empty.title')}
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', maxWidth: 320 }}
      >
        {t('empty.subtitle')}
      </Typography>

      <Stack direction="row" spacing={1.25} sx={{ mt: 0.5 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileUpload />}
          onClick={onUpload}
          data-testid="empty-cta-upload"
        >
          {t('empty.ctaUpload')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<TextFields />}
          onClick={onAddText}
          data-testid="empty-cta-add-text"
        >
          {t('empty.ctaAddText')}
        </Button>
      </Stack>

      {onBrowseTemplates && (
        <Link
          component="button"
          type="button"
          onClick={onBrowseTemplates}
          data-testid="empty-cta-templates"
          underline="hover"
          sx={(theme) => ({
            mt: 0.25,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            color: theme.palette.primary.dark,
            fontSize: 14,
            fontWeight: 500,
          })}
        >
          <GridView sx={{ fontSize: 16 }} />
          {t('empty.ctaTemplates')}
        </Link>
      )}

      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        sx={{ mt: 1, color: 'text.disabled', fontSize: 12 }}
      >
        <Keyboard sx={{ fontSize: 14 }} />
        <span>{t('empty.tipUndo', { cmd: isMac ? '⌘' : 'Ctrl' })}</span>
      </Stack>
    </Box>
  );
};
