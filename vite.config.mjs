import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';

export default defineConfig({
  server: {
    port: 3001,
    host: 'localhost',
  },
  build: {
    sourcemap: process.env.NODE_ENV === 'development',
    sourcemapFile: '/static',
    emptyOutDir: true,
    outDir: 'build',
  },
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
});
