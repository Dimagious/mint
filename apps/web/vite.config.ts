import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isGitHubPagesBuild = process.env.GITHUB_PAGES === 'true';
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'mint';

export default defineConfig({
  plugins: [react()],
  base: isGitHubPagesBuild ? `/${repoName}/` : '/',
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
