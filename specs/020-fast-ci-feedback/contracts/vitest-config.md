# Vitest Configuration Contract

This document defines the expected configuration for `vitest.config.mts` after migrating from Babel-based transforms to SWC.

## SWC Plugin Setup

The test configuration uses `unplugin-swc` to replace `@vitejs/plugin-react` (Babel) in the Vitest context:

```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

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
  // ... test config
});
```

### Why SWC Instead of Babel for Tests

- SWC is 20-70x faster than Babel for TypeScript/JSX transforms
- Test files do not need React Compiler optimizations (those are build-time only)
- SWC handles JSX automatic runtime, path aliases, and TypeScript stripping -- all that tests require

## Environment and Globals

| Setting | Value | Rationale |
|---|---|---|
| `test.environment` | `"jsdom"` | Component tests need a DOM environment |
| `test.globals` | `true` | Inject `describe`, `it`, `expect` without explicit imports |
| `test.setupFiles` | `["src/setupTests.ts"]` | Shared setup (e.g., `@testing-library/jest-dom` matchers) |
| `test.include` | `["src/**/*.test.ts", "src/**/*.test.tsx"]` | Standard test file patterns |

## Coverage Provider and Reporter

| Setting | Value |
|---|---|
| `test.coverage.provider` | `"istanbul"` |
| `test.coverage.reporter` | `["lcov", "text"]` |
| `test.coverage.all` | `true` |
| `test.coverage.enabled` | `false` (enabled via CLI flag) |

Coverage is activated on-demand via `pnpm test:coverage`, which passes `--coverage.enabled` to Vitest. The Istanbul provider is used (not v8) for compatibility with existing CI coverage upload tooling.

## Path Resolution

```ts
resolve: {
  alias: {
    react: path.resolve('./node_modules/react'),
    'react-dom': path.resolve('./node_modules/react-dom'),
    '@': path.resolve(__dirname, 'src'),
  },
},
```

- `react` and `react-dom` aliases prevent duplicate React instances when SWC resolves JSX runtime imports (avoids "Invalid hook call" errors in tests)
- `@` mirrors the `tsconfig.json` path alias (`"@/*": ["./*"]` with `baseUrl: "src"`), ensuring that imports like `@/core/ui/button` resolve correctly in tests

## What Is NOT Included

### React Compiler (babel-plugin-react-compiler)

The React Compiler plugin is **not** included in the Vitest configuration. Reasons:

1. The compiler produces optimized runtime code (auto-memoization) that is irrelevant to unit test correctness.
2. SWC does not support Babel plugins, so `babel-plugin-react-compiler` cannot run under SWC.
3. The production build (`vite.config.mjs`) continues to use `@vitejs/plugin-react` with the React Compiler -- this is unchanged.

### ESLint Plugin for React Compiler

The `eslint-plugin-react-compiler` rule (`react-compiler/react-compiler`) was part of the ESLint config. After migrating to Biome, this rule has no equivalent. The React Compiler itself validates code at build time and emits warnings/errors for patterns it cannot optimize. The ESLint plugin was a secondary check, not a strict requirement.

### Vite Production Plugins

The Vitest config does not load `vite-plugin-svgr`, `rollup-plugin-visualizer`, or Sentry plugins. These are production-build-only concerns and not needed in the test context.

## Compatibility Notes

- **@swc/core**: Platform-specific native binary. Ensure CI runners have a supported architecture (macOS ARM64 is supported).
- **unplugin-swc**: Thin wrapper; version should track `@swc/core` compatibility.
- **Existing tests**: No test code changes are required. SWC handles the same TypeScript/JSX syntax that Babel did.
- **Test execution time**: Expected improvement of 20-40% on transform-heavy test suites due to SWC's native speed.
