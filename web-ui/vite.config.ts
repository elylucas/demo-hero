import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: 'http://localhost:3000/',
  plugins: [react()],
  build: {
    sourcemap: 'inline',
    outDir: '../dist-web-ui',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  server: {
    host: 'localhost',
    port: 3000,
    hmr: {
      host: 'localhost',
      port: 3000,
    },
  },
});
