import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    host: 'localhost',
  },
  build: {
    sourcemap: process.env.NODE_ENV === 'development',
    emptyOutDir: true,
    outDir: 'build',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name][hash].js',
        chunkFileNames: 'assets/[name][hash].js',
        assetFileNames: 'assets/[name][hash].[ext]',
      },
    },
  },
  optimizeDeps: { include: ['@emotion/react', '@emotion/styled', '@mui/material/Tooltip'] }
});
