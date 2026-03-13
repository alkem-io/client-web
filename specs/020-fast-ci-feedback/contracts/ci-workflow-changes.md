# CI Workflow Changes

This document describes the changes to each CI workflow file as part of the Biome + SWC migration.

## `.github/workflows/ci-lint.yml` -- CHANGED

### Current State

Single job running `pnpm run lint:prod`, which internally executes:

```bash
tsc --noEmit && cross-env NODE_ENV=production eslint src/**/*.ts{,x}
```

This is sequential: TypeScript type-checking must complete before ESLint starts.

### New State

Two parallel jobs within the same workflow:

```yaml
name: CI Lint

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  typecheck:
    runs-on: [self-hosted, macOS, ARM64, apple-silicon, m4]
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          dest: ${{ runner.temp }}/setup-pnpm

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '24.14.0'

      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_OUTPUT

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: pnpm-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('pnpm-lock.yaml') }}
          restore-keys: |
            pnpm-${{ runner.os }}-${{ runner.arch }}-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: TypeScript type-check
        run: tsc --noEmit

  lint:
    runs-on: [self-hosted, macOS, ARM64, apple-silicon, m4]
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          dest: ${{ runner.temp }}/setup-pnpm

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '24.14.0'

      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_OUTPUT

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: pnpm-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('pnpm-lock.yaml') }}
          restore-keys: |
            pnpm-${{ runner.os }}-${{ runner.arch }}-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Biome lint and format check
        run: pnpm biome ci .

  eslint-compiler:
    runs-on: [self-hosted, macOS, ARM64, apple-silicon, m4]
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          dest: ${{ runner.temp }}/setup-pnpm

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '24.14.0'

      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_OUTPUT

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: pnpm-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('pnpm-lock.yaml') }}
          restore-keys: |
            pnpm-${{ runner.os }}-${{ runner.arch }}-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: ESLint React Compiler rule
        run: pnpm eslint .
```

### Key Differences

| Aspect | Before | After |
|---|---|---|
| Jobs | 1 (`lint`) | 3 (`typecheck`, `lint`, `eslint-compiler`) |
| Execution | Sequential (`tsc && eslint`) | Parallel (3 independent jobs) |
| Lint tool | ESLint with `NODE_ENV=production` | Biome CI mode (`biome ci .`) + residual ESLint (react-compiler rule only) |
| Format check | Not checked in CI | Included in `biome ci` (fails on unformatted code) |
| Import order | Not checked in CI | Included in `biome ci` (organizeImports) |
| Wall-clock time | ~tsc_time + ~eslint_time | ~max(tsc_time, biome_time, eslint_compiler_time) |

### Expected Timing Impact

- `tsc --noEmit`: ~15-25s (unchanged)
- `biome ci .`: ~1-3s (Biome is significantly faster than ESLint)
- `eslint .` (react-compiler only): ~3-5s (minimal config, single rule, fast parse)
- Overall: wall-clock time is bounded by `tsc`, which runs in parallel with Biome and residual ESLint

Since Biome and residual ESLint both finish in seconds while `tsc` takes 15-25s, the lint workflow effectively becomes as fast as type-checking alone.

## `.github/workflows/ci-test.yml` -- NO COMMAND CHANGES

### Current State

```yaml
- name: Test with coverage
  run: pnpm run test:upload
```

### After Migration

The same command runs. The `test:upload` script calls `test:coverage`, which calls `vitest run` with coverage flags. The only internal difference is that Vitest now uses SWC instead of Babel for transforms. This is transparent to the CI workflow.

No YAML changes are needed.

### Expected Timing Impact

- Test transform speed improves due to SWC
- Estimated 20-40% faster test execution on transform-heavy suites
- The `vitest run` command and coverage flags remain identical

## `.github/workflows/ci-build.yml` -- NO CHANGES

### Current State

```yaml
- name: Build
  run: CI=false pnpm run build
```

### After Migration

No changes. The production build continues to use `vite.config.mjs` with `@vitejs/plugin-react` and `babel-plugin-react-compiler`. The Biome/SWC migration does not affect the build pipeline.

## Summary

| Workflow | File Changed | Command Changed | Structural Change |
|---|---|---|---|
| `ci-lint.yml` | Yes | Yes (`eslint` -> `biome ci`) | Yes (1 job -> 2 parallel jobs) |
| `ci-test.yml` | No | No | No (SWC is internal to Vitest) |
| `ci-build.yml` | No | No | No |
