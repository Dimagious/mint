import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

type Status = 'idle' | 'saving' | 'saved';

interface AutosaveBadgeProps {
  /**
   * Bumped whenever the document changes — this component then debounces
   * a "saving → saved" state transition off it. Pass `doc` itself, or a
   * lightweight version key (`doc.layers.length + doc.presetId + …`), or
   * a tick counter from your store — anything that changes per edit.
   */
  signal: unknown;
  /** Debounce window matching the App.tsx localStorage write (default 500ms). */
  debounceMs?: number;
}

/**
 * Visual proof that autosave is working (BRIEF §2.10).
 *
 * Shows:
 *  - "Saved"            steady state (mint dot)
 *  - "Saving…"          during the debounced write window
 *  - "Saved {{n}}s ago" 5s+ after last edit, refreshes once a minute
 *
 * We intentionally don't reach into the store — autosave logic lives in
 * App.tsx; this badge just renders a derived status from the signal.
 */
export const AutosaveBadge: React.FC<AutosaveBadgeProps> = ({
  signal,
  debounceMs = 500,
}) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('idle');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const firstRender = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setStatus('saved');
      setSavedAt(Date.now());
      return;
    }
    setStatus('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStatus('saved');
      setSavedAt(Date.now());
    }, debounceMs);
    return () => clearTimeout(timer.current);
  }, [signal, debounceMs]);

  // Tick "saved Ns ago" once a minute.
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((x) => x + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  let label: string;
  if (status === 'saving') {
    label = t('autosave.saving');
  } else if (savedAt && Date.now() - savedAt > 60_000) {
    const ago = Math.round((Date.now() - savedAt) / 1000);
    label = t('autosave.savedAgo', { seconds: ago });
  } else {
    label = t('autosave.saved');
  }

  const isSaving = status === 'saving';

  return (
    <Box
      data-testid="autosave-badge"
      role="status"
      aria-live="polite"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1,
        color: 'text.secondary',
        userSelect: 'none',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: isSaving ? 'warning.main' : 'primary.main',
          boxShadow: isSaving
            ? 'none'
            : (theme) => `0 0 0 4px ${theme.palette.secondary.main}`,
          ...(isSaving && {
            animation: 'mint-pulse 1.2s infinite',
            '@keyframes mint-pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.45 },
            },
          }),
        }}
      />
      <Typography variant="caption" sx={{ fontSize: 12, color: 'inherit' }}>
        {label}
      </Typography>
    </Box>
  );
};
