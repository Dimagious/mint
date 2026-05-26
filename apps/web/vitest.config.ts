import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // jsdom — many tests in apps/web touch browser-only APIs (File,
    // FileReader, document) once exercised. Node-only env caused the
    // implicit File / Blob behaviour to drift from real browser semantics.
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    exclude: ['e2e/**'],
  },
});
