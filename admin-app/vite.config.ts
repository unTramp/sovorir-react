import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = resolve(__dirname);
const repoRoot = resolve(__dirname, '..');

export default defineConfig({
  root: rootDir,
  base: '/admin/',
  publicDir: resolve(repoRoot, 'public'),
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': resolve(repoRoot, 'src'),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  preview: {
    host: '0.0.0.0',
  },
  build: {
    outDir: resolve(repoRoot, 'dist-admin'),
    emptyOutDir: true,
  },
});
