import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const isGitHubPagesBuild = process.env.GITHUB_PAGES === 'true';
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'mint';
const basePath = isGitHubPagesBuild ? `/${repoName}/` : '/';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Manifest at /<base>/manifest.webmanifest; service worker at /sw.js.
      // `registerType: 'autoUpdate'` swaps in the new SW as soon as it's ready
      // — appropriate for a single-document editor with no in-flight state
      // that gets clobbered by a reload.
      registerType: 'autoUpdate',
      // We register the SW from main.tsx via `virtual:pwa-register`. That
      // keeps the registration code inside our bundled JS (which CSP
      // `script-src 'self'` permits) — the plugin's default inline-script
      // injection would otherwise be blocked.
      injectRegister: false,
      includeAssets: ['favicon.svg', 'docs/logo.svg'],
      manifest: {
        name: 'MINT — Merge Image’N Text',
        short_name: 'MINT',
        description:
          'Browser-only editor for social images. Drop a photo, add text, export — no upload, no account.',
        lang: 'en',
        scope: basePath,
        start_url: basePath,
        display: 'standalone',
        orientation: 'any',
        background_color: '#FAFAF7',
        theme_color: '#2F9F7A',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          // PNG fallback for iOS — Safari ignores SVG icons on
          // "Add to Home Screen" and renders a low-quality bitmap
          // from a snapshot otherwise.
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        categories: ['productivity', 'graphics', 'design'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,json}'],
        // Cache Google Fonts CSS + the font files themselves so MINT keeps
        // its typography offline.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'mint-fonts-css',
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mint-fonts',
              expiration: {
                maxEntries: 64,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  base: basePath,
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          fabric: ['fabric'],
          mui: [
            '@emotion/react',
            '@emotion/styled',
            '@mui/icons-material',
            '@mui/material',
          ],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
});
