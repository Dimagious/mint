import React, { useMemo } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface KbdShortcut {
  keys: string[]; // ['⌘', 'Z'] — rendered as individual <kbd> chips
  label: string;
}

/**
 * Keyboard shortcuts cheat sheet (BRIEF §2.2 — make shortcuts discoverable).
 * The shortcuts themselves are wired in App.tsx; this dialog just lists them.
 */
export const ShortcutsDialog: React.FC<ShortcutsDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();

  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPad|iPhone|iPod/.test(navigator.platform);
  const cmd = isMac ? '⌘' : 'Ctrl';

  const groups: { title: string; items: KbdShortcut[] }[] = useMemo(
    () => [
      {
        title: t('style.text'),
        items: [{ keys: ['T'], label: t('shortcuts.addText') }],
      },
      {
        title: t('layers.title'),
        items: [
          { keys: [cmd, 'D'], label: t('shortcuts.duplicate') },
          { keys: [cmd, 'C'], label: t('shortcuts.copy') },
          { keys: [cmd, 'V'], label: t('shortcuts.paste') },
          { keys: ['Delete'], label: t('shortcuts.delete') },
          { keys: ['Esc'], label: t('shortcuts.deselect') },
          { keys: ['←', '→', '↑', '↓'], label: t('shortcuts.nudge') },
          { keys: ['⇧', '←/→/↑/↓'], label: t('shortcuts.nudgeFast') },
        ],
      },
      {
        title: t('toolbar.undo'),
        items: [
          { keys: [cmd, 'Z'], label: t('shortcuts.undo') },
          { keys: [cmd, '⇧', 'Z'], label: t('shortcuts.redo') },
          { keys: [cmd, 'E'], label: t('shortcuts.export') },
        ],
      },
    ],
    [t, cmd],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      data-testid="shortcuts-dialog"
      aria-labelledby="shortcuts-dialog-title"
    >
      <DialogTitle id="shortcuts-dialog-title" sx={{ pr: 6 }}>
        {t('shortcuts.title')}
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
          {t('shortcuts.subtitle')}
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label={t('mobile.close')}
          sx={{ position: 'absolute', top: 12, right: 12 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {groups.map((g) => (
            <Box key={g.title}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {g.title}
              </Typography>
              <Stack spacing={0.75}>
                {g.items.map((it) => (
                  <Stack
                    key={it.label}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ fontSize: 13 }}
                  >
                    <span>{it.label}</span>
                    <Stack direction="row" spacing={0.5}>
                      {it.keys.map((k, i) => (
                        <Kbd key={i}>{k}</Kbd>
                      ))}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    component="kbd"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 22,
      height: 22,
      px: 0.75,
      borderRadius: '5px',
      bgcolor: 'background.default',
      border: 1,
      borderColor: 'divider',
      borderBottomWidth: 2,
      fontFamily: 'ui-monospace, "SF Mono", Menlo, "JetBrains Mono", monospace',
      fontSize: 11,
      color: 'text.secondary',
    }}
  >
    {children}
  </Box>
);
