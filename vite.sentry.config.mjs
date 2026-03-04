import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { visualizer } from 'rollup-plugin-visualizer';
import { version } from './package.json';
import { generateMetaJson } from './build-utils.mjs';

export default defineConfig({
  resolve: {
    alias: {
      // These aliases ensure that all parts of the app use the same React instance,
      // preventing issues with multiple React versions in node_modules. (Excalidraw)
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
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

          // Extract the actual package name from the module path.
          // With pnpm, paths look like: .pnpm/pkg@ver/node_modules/pkg/file.js
          // The package name is what comes after the LAST node_modules/
          const parts = id.split('node_modules/');
          const segment = parts[parts.length - 1];
          const pkg = segment.startsWith('@')
            ? segment.split('/').slice(0, 2).join('/')
            : segment.split('/')[0];

          // DO NOT manually chunk react/react-dom/scheduler — Rollup must
          // place them to avoid circular cross-chunk dependencies.

          if (pkg === '@mui/icons-material') return 'vendor-mui-icons';
          if (pkg === '@mui/x-data-grid' || pkg === '@mui/x-date-pickers') return 'vendor-mui-extended';
          if (pkg.startsWith('@mui/') || pkg.startsWith('@emotion/')) return 'vendor-mui-core';
          if (pkg === '@apollo/client' || pkg === 'apollo-upload-client') return 'vendor-apollo';
          if (pkg.startsWith('@tiptap/')) return 'vendor-tiptap';
          if (pkg === 'yjs' || pkg === 'y-prosemirror' || pkg === 'socket.io-client') return 'vendor-realtime';
          if (pkg.startsWith('@sentry/') || pkg === '@elastic/apm-rum') return 'vendor-monitoring';
          if (
            pkg === 'lodash-es' || pkg === 'formik' || pkg === 'yup' ||
            pkg === 'date-fns' || pkg === 'axios' || pkg === 'react-router' ||
            pkg === 'react-i18next' || pkg === 'i18next'
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
