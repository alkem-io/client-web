import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { version } from './package';

export default defineConfig({
  server: {
    port: 3001,
    host: 'localhost',
  },
  build: {
    sourcemap: process.env.NODE_ENV === 'production',
    sourcemapFile: '/static',
    emptyOutDir: true,
    outDir: 'build',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    sentryVitePlugin({
      org: 'alkemio',
      project: 'alkemio',
      debug: true,
      release: {
        name: `client-web@${version}`,
        version,
        create: process.env.NODE_ENV === 'production',
      },
      authToken: process.env.VITE_APP_SENTRY_AUTH_TOKEN,
    }),
  ],
});
