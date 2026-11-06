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
  },
});
