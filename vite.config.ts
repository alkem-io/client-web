import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';

export default defineConfig({
  server: {
    port: 80,
    host: 'localhost',
  },
  build: {
    outDir: 'build',
  },
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
});
