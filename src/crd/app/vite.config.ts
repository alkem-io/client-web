import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@/crd': path.resolve(__dirname, '..'),
    },
  },
  server: {
    port: 5200,
    host: 'localhost',
  },
  build: {
    outDir: path.resolve(__dirname, '../../../build-crd'),
    emptyOutDir: true,
  },
});
