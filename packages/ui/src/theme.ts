import { createTheme } from '@mui/material/styles';

/**
 * MINT theme — redesign (Phase 1).
 *
 * Direction (from BRIEF §3):
 *  - Warm off-white surfaces, NOT mint everywhere.
 *  - Mint reserved for primary CTA, focus rings, brand, selected states.
 *  - Hairline borders (rgba(0,0,0,.06)), soft layered shadows.
 *  - Inter as the only UI font; tabular-nums for numeric labels.
 *  - Rounded everything (10–16px cards, 8–12 buttons, 999 chips).
 */

export const PALETTE = {
  // surface
  bg: '#FAFAF7',
  surface: '#FFFFFF',
  surface2: '#F4F4F0',
  // text
  text: '#1A1D1B',
  text2: '#5E6764',
  text3: '#8A938F',
  // border hairlines
  border: 'rgba(0, 0, 0, 0.07)',
  borderStrong: 'rgba(0, 0, 0, 0.12)',
  // brand
  mint: '#2F9F7A',
  mintDark: '#1F7459',
  mint50: '#E6F3EC',
  mint100: '#C9E4D6',
  // danger
  danger: '#E26D5C',
  danger50: '#FBEAE6',
} as const;

export const SHADOWS = {
  card: '0 1px 2px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.04)',
  modal: '0 4px 12px rgba(0,0,0,.06), 0 12px 32px rgba(0,0,0,.06)',
  canvas: '0 1px 2px rgba(0,0,0,.04), 0 20px 48px -12px rgba(20,40,30,.18)',
} as const;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: PALETTE.mint,
      light: PALETTE.mint100,
      dark: PALETTE.mintDark,
      contrastText: '#fff',
    },
    secondary: {
      main: PALETTE.mint50,
      contrastText: PALETTE.mintDark,
    },
    error: {
      main: PALETTE.danger,
      light: PALETTE.danger50,
    },
    background: {
      default: PALETTE.bg,
      paper: PALETTE.surface,
    },
    text: {
      primary: PALETTE.text,
      secondary: PALETTE.text2,
      disabled: PALETTE.text3,
    },
    divider: PALETTE.border,
  },

  shape: { borderRadius: 10 },

  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 14,
    h6: { fontSize: 18, fontWeight: 600, letterSpacing: '-0.005em' },
    subtitle1: { fontSize: 14, fontWeight: 600 },
    subtitle2: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: PALETTE.text3,
    },
    body1: { fontSize: 14 },
    body2: { fontSize: 13 },
    caption: { fontSize: 12, color: PALETTE.text2 },
    button: {
      fontSize: 13,
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: 0,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: PALETTE.bg,
          color: PALETTE.text,
          WebkitFontSmoothing: 'antialiased',
          fontFeatureSettings: '"cv11", "ss01"',
        },
        // tabular numerics utility class for chips, sizes, etc.
        '.tnum': { fontVariantNumeric: 'tabular-nums' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,.86)',
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${PALETTE.border}`,
          color: PALETTE.text,
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
          border: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 500,
          padding: '8px 14px',
        },
        containedPrimary: {
          fontWeight: 600,
          boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 1px 2px rgba(47,159,122,.25)',
        },
        outlined: {
          borderColor: PALETTE.borderStrong,
          color: PALETTE.text,
          '&:hover': {
            borderColor: PALETTE.text2,
            background: PALETTE.surface2,
          },
        },
        text: {
          color: PALETTE.text2,
          '&:hover': { background: 'rgba(0,0,0,.04)', color: PALETTE.text },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: PALETTE.text2,
          borderRadius: 8,
          '&:hover': { background: 'rgba(0,0,0,.04)', color: PALETTE.text },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderColor: PALETTE.border,
          color: PALETTE.text2,
          fontWeight: 500,
          '&.Mui-selected': {
            backgroundColor: PALETTE.surface,
            color: PALETTE.text,
            boxShadow: '0 1px 2px rgba(0,0,0,.06)',
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          background: PALETTE.surface2,
          border: `1px solid ${PALETTE.border}`,
          borderRadius: 999,
          padding: 3,
          gap: 2,
          '& .MuiToggleButton-root': {
            border: 0,
            borderRadius: '999px !important',
            padding: '4px 12px',
            minHeight: 28,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${PALETTE.border}`,
          minHeight: 40,
        },
        indicator: {
          backgroundColor: PALETTE.mint,
          height: 2,
          borderRadius: '2px 2px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minHeight: 40,
          padding: '10px 4px',
          marginRight: 16,
          fontSize: 13,
          fontWeight: 500,
          color: PALETTE.text3,
          minWidth: 0,
          '&.Mui-selected': { color: PALETTE.text },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { color: PALETTE.mint, height: 4, padding: '12px 0' },
        rail: { color: PALETTE.surface2, opacity: 1 },
        track: { border: 'none' },
        thumb: {
          height: 14,
          width: 14,
          backgroundColor: '#fff',
          border: `2px solid ${PALETTE.mint}`,
          boxShadow: '0 1px 3px rgba(0,0,0,.12)',
          '&:hover, &.Mui-active': {
            boxShadow: '0 2px 8px rgba(47,159,122,.25)',
          },
          '&:before': { display: 'none' },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: SHADOWS.modal,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: PALETTE.surface,
          '& fieldset': { borderColor: PALETTE.border },
          '&:hover fieldset': { borderColor: PALETTE.borderStrong },
          '&.Mui-focused fieldset': {
            borderColor: `${PALETTE.mint} !important`,
            borderWidth: 2,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: PALETTE.text3, fontSize: 13 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { fontSize: 13, borderRadius: 6, margin: '2px 4px' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: 'rgba(20,30,25,.92)',
          fontSize: 11,
          borderRadius: 6,
          padding: '4px 8px',
        },
        arrow: { color: 'rgba(20,30,25,.92)' },
      },
    },
  },
});
