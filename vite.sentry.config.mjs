import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { version } from './package';
import fs from 'fs';
import path from 'path';

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
    react(),
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
        fs.mkdirSync(path.resolve(__dirname, 'public'), { recursive: true });
        fs.writeFileSync('./public/meta.json', JSON.stringify({ version }, null, 2));
      }
    }
  ],
});
