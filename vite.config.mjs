import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import fs from 'fs';
import { version } from './package';

/**
 * Vite configuration for the Alkemio client-web project.
 *
 * - Integrates React, TypeScript path resolution, and SVGR plugins.
 * - Adds a custom plugin (`no-cache-index`) to prevent caching of `index.html` and `/home` routes in the dev server by setting aggressive no-cache headers.
 * - Adds a custom plugin (`generate-meta-json`) to generate `public/meta.json` with version info from `package.json` at build time.
 * - Sets up path aliasing for `@` to `./src`.
 * - Configures the dev server to run on `localhost:3001`.
 * - Customizes build output directory, sourcemaps, and Rollup output filenames.
 * - Optimizes dependencies for Emotion and MUI Tooltip.
 *
 * @module vite.config
 */
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    // Plugin to prevent index.html caching in dev server
    {
      /**
       * Vite plugin server configuration hook to disable caching for specific routes.
       *
       * Adds middleware to the dev server that intercepts requests to '/', '/home', and any URL ending with '/home'.
       * For these routes, it overrides the response methods to set aggressive no-cache headers, ensuring that
       * browsers and proxies do not cache the responses.
       *
       * @param {import('vite').ViteDevServer} server - The Vite development server instance.
       */
      name: 'no-cache-index',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '/home' || req.url?.endsWith('/home')) {
            // Intercept the response to remove caching headers
            const originalSend = res.send;
            const originalEnd = res.end;
            const originalWrite = res.write;

            // Override response methods to set headers just before sending
            res.send = function(chunk) {
              setNoCacheHeaders(res);
              return originalSend.call(this, chunk);
            };

            res.end = function(chunk) {
              setNoCacheHeaders(res);
              return originalEnd.call(this, chunk);
            };

            res.write = function(chunk) {
              setNoCacheHeaders(res);
              return originalWrite.call(this, chunk);
            };

            function setNoCacheHeaders(response) {

              // Set comprehensive no-cache headers - most aggressive approach
              response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
              response.setHeader('Pragma', 'no-cache');
              response.setHeader('Expires', '0');
            }
          }
          next();
        });
      }
    },
    // Plugin to generate meta.json with version info
    {
      name: 'generate-meta-json',
      apply: 'build',
      buildStart() {
        fs.writeFileSync('./public/meta.json', JSON.stringify({ version }, null, 2));
      }
    }
  ],
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
