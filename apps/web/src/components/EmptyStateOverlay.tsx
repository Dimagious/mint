import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { FileUpload, TextFields, Keyboard } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface EmptyStateOverlayProps {
  onUpload: () => void;
  onAddText: () => void;
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
        <MintLeaf />
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

/** Abstract 4-petal mint mark — used in the empty-state hero. */
const MintLeaf: React.FC = () => (
  <svg width="42" height="42" viewBox="0 0 32 32" fill="none" aria-hidden>
    <path
      d="M16 4c2.5 3.5 2.5 7 0 10-2.5-3-2.5-6.5 0-10z"
      fill="currentColor"
    />
    <path
      d="M28 16c-3.5 2.5-7 2.5-10 0 3-2.5 6.5-2.5 10 0z"
      fill="currentColor"
    />
    <path
      d="M16 28c-2.5-3.5-2.5-7 0-10 2.5 3 2.5 6.5 0 10z"
      fill="currentColor"
    />
    <path
      d="M4 16c3.5-2.5 7-2.5 10 0-3 2.5-6.5 2.5-10 0z"
      fill="currentColor"
    />
    <circle cx="16" cy="16" r="2.2" fill="currentColor" />
  </svg>
);
