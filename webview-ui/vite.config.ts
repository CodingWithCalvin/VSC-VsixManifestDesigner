import { defineConfig } from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      preprocess: vitePreprocess(),
    }),
  ],
  build: {
    outDir: '../out/webview',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/main.ts',
      output: {
        entryFileNames: 'main.js',
        assetFileNames: 'assets/[name][extname]',
        // Single bundle for webview
        manualChunks: undefined,
      },
    },
    // Inline assets to avoid CSP issues
    assetsInlineLimit: 100000,
    // Don't minify for easier debugging during development
    minify: process.env.NODE_ENV === 'production',
    sourcemap: process.env.NODE_ENV !== 'production',
  },
  // Base path for assets (will be replaced with webview URI)
  base: './',
});
