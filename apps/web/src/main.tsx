import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@mint/ui';
import './i18n';
import { App } from './App';
import { registerServiceWorker } from './registerSW';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);

// PWA service worker — registered from the bundled JS so the CSP
// `script-src 'self'` directive permits it. No-ops during dev.
registerServiceWorker();
