import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { version, name } from './package';

export default defineConfig({
  server: {
    port: 3001,
    host: 'localhost',
  },
  build: {
    outDir: 'build',
    // sourcemap: process.env.NODE_ENV  === 'production',
    sourcemap: true,
  },
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    sentryVitePlugin({
      org: "alkemio",
      project: "alkemio",
      debug: true,
      release: {
        name: `client-web@${version}`,
        version,
        create: process.env.NODE_ENV  === 'production',
      },
      // authToken: import.meta.env.VITE_APP_SENTRY_AUTH_TOKEN,
      // authToken: process.env.SENTRY_AUTH_TOKEN,
      // authToken: process.env.VITE_APP_SENTRY_AUTH_TOKEN,
      authToken: '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',
    }),
  ],
});
