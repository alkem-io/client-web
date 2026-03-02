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
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@mui/icons-material')) return 'vendor-mui-icons';
          if (id.includes('@mui/x-data-grid') || id.includes('@mui/x-date-pickers')) return 'vendor-mui-extended';
          if (id.includes('@mui/') || id.includes('@emotion/')) return 'vendor-mui-core';
          if (id.includes('@apollo/client') || id.includes('apollo-upload-client')) return 'vendor-apollo';
          if (id.includes('@tiptap/')) return 'vendor-tiptap';
          if (id.includes('/yjs/') || id.includes('y-prosemirror') || id.includes('socket.io-client')) return 'vendor-realtime';
          if (id.includes('@sentry/') || id.includes('@elastic/apm-rum')) return 'vendor-monitoring';
          if (
            id.includes('lodash-es') || id.includes('/formik/') || id.includes('/yup/') ||
            id.includes('/date-fns/') || id.includes('/axios/') || id.includes('react-router') ||
            id.includes('react-i18next') || id.includes('/i18next/')
          ) return 'vendor-utils';
        },
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
