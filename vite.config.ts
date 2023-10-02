import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';
import { dependencies } from './package.json';

const vendorPackages = ['react', 'react-router-dom', 'react-dom', '@tiptap/pm', '@types/jest', '@types/lodash', '@types/node', '@types/react', '@types/react-dom', '@types/yup', 'react-scripts'];

function renderChunks(deps) {
  let chunks = {};
  Object.keys(deps).forEach((key) => {
    if (vendorPackages.includes(key)) return;
    chunks[key] = [key];
  });
  return chunks;
}

// function renderChunk(key) {
//   if (vendorPackages.includes(key)) {
//     return undefined;
//   }
//
//   chunks[key] = [key];
// }

export default defineConfig({
  server: {
    port: 3001,
    host: 'localhost',
  },
  build: {
    sourcemap: process.env.NODE_ENV === 'development',
    // minify: process.env.NODE_ENV === 'development',
    emptyOutDir: true,
    outDir: 'build',
    rollupOptions: {
      external: 'fsevents',
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks: {
          vendor: ['react', 'react-router-dom', 'react-dom'],
          ...renderChunks(dependencies),
        }
      },
    },
  },
  plugins: [react(), viteTsconfigPaths(), svgrPlugin(),
  //   chunkSplitPlugin({
  //   strategy: 'unbundle',
  //   customChunk: args => {
  //     // files into pages directory is export in single files
  //     let { file, id, moduleId, root } = args;
  //
  //   },
  //   customSplitting: {
  //     'react-vendor': ['react', 'react-dom'],
  //     'core': [/src\/core/],
  //     'dev': [/src\/dev/],
  //     'domain': [/src\/domain/],
  //     'main': [/src\/main/],
  //     // 'core-ui': [/src\/core\/ui/],
  //     // 'core-apollo': [/src\/core\/apollo/],
  //     // 'core-auth': [/src\/core\/auth/],
  //     // 'core-routing': [/src\/core\/routing/],
  //     // 'core-utils': [/src\/core\/utils/],
  //   }
  // })
  ],
});
