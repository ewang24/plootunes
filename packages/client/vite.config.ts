import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    svgr(),
  ],
  resolve: {
    alias: {
      '~core-assets': path.resolve(__dirname, '../core/assets'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: '../electron/dist/front_end',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
  // Electron renderer uses file:// protocol — use relative asset paths
  base: './',
});
