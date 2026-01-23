import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { visualizer } from 'rollup-plugin-visualizer';
import { version } from './package.json';
import { generateMetaJson } from './build-utils.mjs';

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
        entryFileNames: 'assets/[name][hash].js',
        chunkFileNames: 'assets/[name][hash].js',
        assetFileNames: 'assets/[name][hash].[ext]',
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    viteTsconfigPaths(),
    svgrPlugin(),
    sentryVitePlugin({
      org: 'alkemio',
      project: 'alkemio',
      debug: true,
      release: {
        name: `client-web@v${version}`,
        version,
        create: process.env.NODE_ENV === 'production',
      },
      authToken: process.env.VITE_APP_SENTRY_AUTH_TOKEN,
    }),
    // Plugin to generate meta.json with version info
    {
      name: 'generate-meta-json',
      apply: 'build',
      buildStart() {
        generateMetaJson();
      },
    },
    // Bundle analyzer - generates stats.html when ANALYZE=true
    process.env.ANALYZE === 'true' && visualizer({
      open: true,
      filename: 'build/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
});
