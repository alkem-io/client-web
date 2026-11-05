import path from 'path';
import swc from 'unplugin-swc';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    globals: true,
    // Unit/component tests live under src/. Both Playwright e2e suites run on
    // their own runner (@playwright/test), so keep them out of the Vitest pass.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [...configDefaults.exclude, 'e2e/**', 'tests/e2e/**'],
    // Node 25+ enables its own Web Storage globals by default; without a
    // --localstorage-file they resolve to undefined and shadow jsdom's
    // localStorage/sessionStorage. Disabling them lets jsdom's storage through
    // on every supported Node version (the flag is a no-op on Node 24).
    execArgv: ['--no-experimental-webstorage'],
  },
});
