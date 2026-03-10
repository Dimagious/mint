import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2f9f7a',
      light: '#a6dcc6',
      dark: '#1f7459',
    },
    secondary: {
      main: '#6ab596',
    },
    background: {
      default: '#edf7f0',
      paper: '#f9fdf9',
    },
    text: {
      primary: '#1f4f3e',
      secondary: '#4f7f6c',
    },
  },
  typography: {
    fontFamily: '"Trebuchet MS", "Segoe UI", "Inter", "Arial", sans-serif',
    h6: {
      fontWeight: 700,
      letterSpacing: 0.4,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(249, 253, 249, 0.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(47, 159, 122, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#2b7e62',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(47, 159, 122, 0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: '1px solid rgba(47, 159, 122, 0.14)',
          backgroundImage: 'none',
        },
      },
    },
  },
});
