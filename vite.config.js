import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Lincoln-Financial---Team-Charizard/',

  server: {
    port: 3000,
    proxy: {
      // ── Dental API backend ─────────────────────────────
      '/api/dental': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },

      // ── Ollama proxy ───────────────────────────────────
      // Rewrites /api/ollama/... → http://localhost:11434/...
      // Ollama runs locally — no API key required.
      // The proxy avoids the browser's same-origin restriction when
      // the dev server port differs from Ollama's port (11434).
      '/api/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ollama/, ''),
      },
    },
  },

  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
