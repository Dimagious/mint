/**
 * Service worker registration helper. Lives in its own module so the
 * `virtual:pwa-register` import (which only resolves under `vite-plugin-pwa`)
 * doesn't bleed into `main.tsx`. The plugin replaces the virtual id at
 * build time; in test / dev environments where the plugin isn't active
 * this falls through to a no-op so unit tests in jsdom don't choke.
 */
export function registerServiceWorker(): void {
  // The `virtual:` module is only resolved at build time by vite-plugin-pwa.
  // Vitest / jsdom would crash on the import, so guard with a try/catch and
  // skip when the module isn't present.
  void (async () => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    try {
      const mod = await import(
        // The Vite plugin replaces this id; the comment marks it as a
        // virtual module so other tools (ESLint, TypeScript) ignore it.
        /* @vite-ignore */ 'virtual:pwa-register'
      );
      if (typeof mod.registerSW === 'function') {
        mod.registerSW({ immediate: true });
      }
    } catch {
      // Plugin not active (dev w/o PWA, vitest, etc.) — skip.
    }
  })();
}
