import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';
import { generateMetaJson } from './build-utils.mjs';

/**
 * Vite configuration for the Alkemio client-web project.
 *
 * - Integrates React with React Compiler enabled for automatic memoization and performance optimization.
 * - Integrates TypeScript path resolution and SVGR plugins.
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
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    viteTsconfigPaths(),
    svgrPlugin(),
    // Plugin to prevent index.html caching in dev server
    {
      /**
       * Vite plugin server configuration hook to disable caching for all SPA routes.
       *
       * Adds middleware to the dev server that intercepts requests to all routes that serve index.html.
       * This includes '/', '/index.html', and any URL that doesn't contain a file extension and doesn't
       * start with '/api/' or '/@' (Vite internal routes). For these routes, it overrides the response
       * methods to set aggressive no-cache headers, ensuring that browsers and proxies do not cache
       * the index.html responses.
       *
       * @param {import('vite').ViteDevServer} server - The Vite development server instance.
       */
      name: 'no-cache-index',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Check if this is an HTML request (SPA route) that will serve index.html or meta.json
          const isNoCacheRoute =
            req.url &&
            (req.url === '/' ||
              req.url === '/index.html' ||
              req.url?.endsWith('/index.html') ||
              req.url === '/home' ||
              // the files below might not work - headersSent is true
              req.url?.startsWith('/meta.json') ||
              req.url?.startsWith('/env-config.js') ||
              (!req.url.includes('.') && !req.url.startsWith('/api/') && !req.url.startsWith('/@')));

          if (isNoCacheRoute) {
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
              // Remove caching headers
              if (response.headersSent) {
                // If headers are already sent, we can't modify them
                return;
              }
              try {
                response.removeHeader('Last-Modified');
                response.removeHeader('ETag');
                response.removeHeader('etag');
                response.removeHeader('If-Modified-Since');
                response.removeHeader('If-None-Match');
              } catch (e) {
                // ignore errors if headers cannot be removed
              }

              // Set comprehensive no-cache headers - most aggressive approach
              response.setHeader(
                'Cache-Control',
                'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0, private'
              );
              response.setHeader('Pragma', 'no-cache');
              response.setHeader('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');
              response.setHeader('Surrogate-Control', 'no-store');
              response.setHeader('X-Accel-Expires', '0');
              response.setHeader('Vary', '*');
              response.setHeader('Content-Type', 'text/html; charset=utf-8');

              // Additional anti-cache headers
              response.setHeader('X-Cache-Control', 'no-cache');
              response.setHeader('X-Powered-By', 'Vite-NoCache-' + Date.now());
            }
          }
          next();
        });
      },
    },
    // Plugin to generate meta.json with version info
    {
      name: 'generate-meta-json',
      config() {
        generateMetaJson();
      },
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
        manualChunks: (id) => {
          // Application-level code splitting for feature modules
          if (!id.includes('node_modules')) {
            // Split large feature areas into separate chunks
            if (id.includes('/main/guidance/')) {
              return 'app-guidance';
            }
            if (id.includes('/main/topLevelPages/')) {
              return 'app-top-level-pages';
            }
            if (id.includes('/main/inAppNotifications/')) {
              return 'app-notifications';
            }
            if (id.includes('/main/search/')) {
              return 'app-search';
            }
            if (id.includes('/main/admin/')) {
              return 'app-admin';
            }
            if (id.includes('/domain/platformAdmin/')) {
              return 'app-platform-admin';
            }
            if (id.includes('/domain/spaceAdmin/')) {
              return 'app-space-admin';
            }
          }
          
          // Separate vendor chunks for better caching
          if (id.includes('node_modules')) {
            // Apollo Client
            if (id.includes('@apollo/client')) {
              return 'vendor-apollo';
            }
            // MUI components
            if (id.includes('@mui/material') || id.includes('@mui/system')) {
              return 'vendor-mui';
            }
            if (id.includes('@mui/icons-material')) {
              return 'vendor-mui-icons';
            }
            if (id.includes('@mui/x-data-grid')) {
              return 'vendor-mui-datagrid';
            }
            if (id.includes('@mui/x-date-pickers')) {
              return 'vendor-mui-datepickers';
            }
            // Emotion styling
            if (id.includes('@emotion/')) {
              return 'vendor-emotion';
            }
            // Tiptap editor
            if (id.includes('@tiptap/')) {
              return 'vendor-tiptap';
            }
            // Markdown processing
            if (id.includes('markdown-it') || id.includes('remark') || id.includes('rehype') || id.includes('unified') || id.includes('mdast') || id.includes('hast')) {
              return 'vendor-markdown';
            }
            // Mermaid charting
            if (id.includes('mermaid')) {
              return 'vendor-mermaid';
            }
            // Excalidraw
            if (id.includes('@alkemio/excalidraw') || id.includes('excalidraw')) {
              return 'vendor-excalidraw';
            }
            // React ecosystem - split react and react-router for better caching
            if (id.includes('react/') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-react-router';
            }
            // Forms and validation
            if (id.includes('formik') || id.includes('yup')) {
              return 'vendor-forms';
            }
            // i18n
            if (id.includes('i18next')) {
              return 'vendor-i18n';
            }
            // Drag and drop
            if (id.includes('@hello-pangea/dnd') || id.includes('@atlaskit/pragmatic-drag-and-drop')) {
              return 'vendor-dnd';
            }
            // GraphQL
            if (id.includes('graphql')) {
              return 'vendor-graphql';
            }
            // Lodash
            if (id.includes('lodash')) {
              return 'vendor-lodash';
            }
            // Date utilities
            if (id.includes('date-fns') || id.includes('dayjs')) {
              return 'vendor-date';
            }
            // Sentry
            if (id.includes('@sentry/')) {
              return 'vendor-sentry';
            }
            // XState
            if (id.includes('xstate') || id.includes('@xstate')) {
              return 'vendor-xstate';
            }
            // Prosemirror
            if (id.includes('prosemirror') || id.includes('y-prosemirror')) {
              return 'vendor-prosemirror';
            }
            // YJS (real-time collaboration)
            if (id.includes('yjs') || id.includes('@hocuspocus')) {
              return 'vendor-yjs';
            }
            // Image processing
            if (id.includes('react-image') || id.includes('image-blob-reduce') || id.includes('pica')) {
              return 'vendor-image';
            }
            // Socket.io
            if (id.includes('socket.io')) {
              return 'vendor-socketio';
            }
            // Axios
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            // Elastic APM
            if (id.includes('@elastic/apm')) {
              return 'vendor-apm';
            }
            // Everything else from node_modules
            return 'vendor-other';
          }
        },
      },
    },
  },
  optimizeDeps: { include: ['@emotion/react', '@emotion/styled', '@mui/material/Tooltip', '@mui/icons-material'] },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    globals: true,
  },
});
