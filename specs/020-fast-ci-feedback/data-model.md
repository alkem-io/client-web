# Data Model: Configuration Entities

This document describes the configuration entities involved in migrating from ESLint + Prettier to Biome, and from Babel-based Vitest transforms to SWC-based transforms.

## 1. Biome Configuration (`biome.json`)

Root-level configuration file that replaces both `eslint.config.mjs` and `.prettierrc.yml`.

| Field | Type | Description |
|---|---|---|
| `$schema` | string | Biome JSON schema URL for IDE validation |
| `organizeImports.enabled` | boolean | Auto-sort imports (replaces `eslint-plugin-import`) |
| `linter.enabled` | boolean | Master toggle for all lint rules |
| `linter.rules.suspicious` | object | Rules detecting likely bugs (e.g., `noExplicitAny`, `noDebugger`, `noConsoleLog`) |
| `linter.rules.complexity` | object | Rules flagging unnecessary complexity |
| `linter.rules.style` | object | Code style rules (e.g., `useConst`, `noUnusedTemplateLiteral`) |
| `linter.rules.a11y` | object | Accessibility rules (replaces `eslint-plugin-jsx-a11y`) |
| `linter.rules.correctness` | object | Rules catching incorrect code (e.g., `noUnusedVariables`, `noUnusedImports`) |
| `formatter.enabled` | boolean | Master toggle for formatting |
| `formatter.indentStyle` | `"space"` | Indent with spaces (matches current Prettier `useTabs: false`) |
| `formatter.indentWidth` | 2 | Tab width (matches current Prettier `tabWidth: 2`) |
| `formatter.lineWidth` | 120 | Print width (matches current Prettier `printWidth: 120`) |
| `javascript.formatter.quoteStyle` | `"single"` | Single quotes (matches current Prettier `singleQuote: true`) |
| `javascript.formatter.trailingCommas` | `"es5"` | ES5-compatible trailing commas (matches current Prettier `trailingComma: es5`) |
| `javascript.formatter.semicolons` | `"always"` | Mandatory semicolons (matches current Prettier `semi: true`) |
| `javascript.formatter.arrowParentheses` | `"asNeeded"` | Omit parens for single-arg arrows (matches current Prettier `arrowParens: avoid`) |
| `javascript.formatter.bracketSpacing` | boolean | Spaces inside object literals (matches current Prettier `bracketSpacing: true`) |
| `javascript.parser.unsafeParameterDecoratorsEnabled` | boolean | TypeScript decorator support if needed |
| `files.include` | string[] | Glob patterns for files to process |
| `files.ignore` | string[] | Glob patterns to exclude (`node_modules/`, `build/`, `dist/`, `coverage/`, generated files) |

### Current ESLint Rules Mapping

| ESLint Rule | Biome Equivalent | Category |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | `suspicious.noExplicitAny` | suspicious |
| `@typescript-eslint/no-unused-vars` | `correctness.noUnusedVariables` | correctness |
| `no-console` | `suspicious.noConsoleLog` | suspicious |
| `no-debugger` | `suspicious.noDebugger` | suspicious |
| `no-multiple-empty-lines` | Handled by formatter | formatter |
| `quotes` (single) | `javascript.formatter.quoteStyle` | formatter |
| `jsx-a11y/alt-text` | `a11y.useAltText` | a11y |
| `jsx-a11y/anchor-is-valid` | `a11y.useValidAnchor` | a11y |
| `jsx-a11y/aria-role` | `a11y.useValidAriaRole` | a11y |
| `jsx-a11y/no-access-key` | `a11y.noAccessKey` | a11y |
| `react/self-closing-comp` | `style.useSelfClosingElements` | style |
| `react/jsx-boolean-value` | `style.noImplicitBoolean` | style |
| `react-compiler/react-compiler` | No Biome equivalent (keep as standalone ESLint rule or drop) | -- |

### Rules Without Direct Biome Equivalent

These ESLint rules have no 1:1 Biome mapping and require a decision:

- `react/jsx-pascal-case` -- enforced by convention, no Biome rule
- `react/jsx-closing-bracket-location` -- handled by Biome formatter
- `react/jsx-closing-tag-location` -- handled by Biome formatter
- `react/jsx-tag-spacing` -- handled by Biome formatter
- `react/jsx-curly-spacing` -- handled by Biome formatter
- `react/jsx-wrap-multilines` -- handled by Biome formatter
- `react/no-string-refs` -- obsolete in React 19
- `react-compiler/react-compiler` -- keep via minimal ESLint config or drop (compiler validates at build time)
- `padding-line-between-statements` -- no Biome equivalent; accept formatter output
- `import/prefer-default-export` -- already `off`

### Files Deleted After Migration

- `eslint.config.mjs`
- `.prettierrc.yml`
- `.prettierignore` (if present)

## 2. Vitest + SWC Configuration (`vitest.config.mts`)

Replaces the current implicit Babel-based transform with SWC for faster test execution.

| Field | Type | Description |
|---|---|---|
| `plugins` | Plugin[] | `[swc.vite()]` via `unplugin-swc` -- replaces `@vitejs/plugin-react` for test context |
| `test.environment` | `"jsdom"` | Browser-like DOM environment for component tests |
| `test.globals` | boolean | Whether to inject `describe`, `it`, `expect` globally |
| `test.setupFiles` | string[] | Setup files (e.g., `src/setupTests.ts`) |
| `test.include` | string[] | Test file patterns (`**/*.test.ts`, `**/*.test.tsx`) |
| `test.coverage.provider` | `"istanbul"` | Coverage instrumentation provider |
| `test.coverage.reporter` | string[] | Reporter formats (`lcov`, `text`) |
| `test.coverage.all` | boolean | Collect coverage from all source files |
| `resolve.alias` | object | Path alias `@/` -> `src/` (mirrors `tsconfig.json` paths) |

### Key Difference from Production Build

The production Vite build continues to use `@vitejs/plugin-react` with `babel-plugin-react-compiler`. The SWC plugin is **only** used in the Vitest context, where React Compiler transforms are not needed (unit tests do not depend on compiler optimizations).

## 3. CI Workflow Configuration (`.github/workflows/ci-lint.yml`)

Updated workflow to run `tsc` and `biome` as parallel steps.

| Field | Type | Description |
|---|---|---|
| `jobs.typecheck` | job | Runs `tsc --noEmit` |
| `jobs.lint` | job | Runs `biome ci .` (lint + format check in CI mode) |
| `runs-on` | label[] | `[self-hosted, macOS, ARM64, apple-silicon, m4]` |
| Node version | string | `24.14.0` via `actions/setup-node@v6` |
| Cache key | string | `pnpm-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('pnpm-lock.yaml') }}` |

### Parallel Execution

The current `ci-lint.yml` runs a single sequential `pnpm run lint:prod` step, which internally runs `tsc --noEmit && eslint ...`. After migration, `tsc` and `biome` run as independent parallel jobs within the same workflow, reducing wall-clock time.

## 4. Pre-commit Hook Configuration (`.lintstagedrc.json`)

| Pattern | Current Command | New Command |
|---|---|---|
| `src/**/*.ts{,x}` | `cross-env NODE_ENV=production eslint --fix`, `prettier --write` | `biome check --write` |
| `*.{json,md}` | `prettier --write` | `biome format --write` |

`biome check --write` combines linting, import sorting, and formatting in a single pass, replacing the current two-command pipeline.

## 5. Package.json Scripts

### Updated Scripts

| Script | Current | New |
|---|---|---|
| `lint` | `tsc --noEmit && eslint src/**/*.ts{,x}` | `tsc --noEmit && biome ci .` |
| `lint:prod` | `tsc --noEmit && cross-env NODE_ENV=production eslint src/**/*.ts{,x}` | `tsc --noEmit && biome ci .` |
| `lint:fix` | `tsc --noEmit && eslint src/**/*.ts{,x} --fix` | `tsc --noEmit && biome check --write .` |
| `format` | `prettier --write src/**/*.ts{,x}` | `biome format --write .` |

Note: `lint` and `lint:prod` become identical because Biome does not use `NODE_ENV` for rule severity. Production-only strictness (e.g., `noConsoleLog` as error vs. warning) is configured statically in `biome.json`.

### Dependencies to Add

| Package | Purpose |
|---|---|
| `@biomejs/biome` | Linter + formatter (devDependency) |
| `@swc/core` | SWC compiler core for Vitest transforms (devDependency) |
| `unplugin-swc` | Vite/Vitest plugin wrapping SWC (devDependency) |

### Dependencies to Remove

| Package | Reason |
|---|---|
| `@eslint/js` | ESLint dependency |
| `@typescript-eslint/eslint-plugin` | Replaced by Biome |
| `eslint-plugin-import` | Replaced by Biome organizeImports |
| `eslint-plugin-jsx-a11y` | Replaced by Biome a11y rules |
| `eslint-plugin-react` | Replaced by Biome + formatter |
| `@types/eslint-plugin-jsx-a11y` | No longer needed |
| `prettier` | Replaced by Biome formatter |

### Dependencies to Keep (for residual React Compiler ESLint)

| Package | Reason |
|---|---|
| `eslint` | Required to run residual ESLint config |
| `@typescript-eslint/parser` | Required by residual ESLint config for TS parsing |
| `eslint-plugin-react-compiler` | The only rule without a Biome equivalent (FR-003) |

## Relationships Diagram

```
biome.json
  |
  +-- Linter rules ---------> replaces eslint.config.mjs
  +-- Formatter settings ----> replaces .prettierrc.yml
  +-- organizeImports -------> replaces eslint-plugin-import
  +-- a11y rules ------------> replaces eslint-plugin-jsx-a11y
  |
  +-- Used by:
       +-- .lintstagedrc.json (pre-commit: biome check --write)
       +-- package.json scripts (lint, lint:fix, format)
       +-- ci-lint.yml (biome ci .)

vitest.config.mts
  |
  +-- unplugin-swc (SWC transforms) --> replaces @vitejs/plugin-react in test context
  +-- @swc/core (compiler backend)
  +-- test.environment: jsdom
  +-- resolve.alias: @/ -> src/
  |
  +-- Used by:
       +-- package.json scripts (test, vitest run, test:coverage)
       +-- ci-test.yml (pnpm run test:upload)

ci-lint.yml
  |
  +-- Job: typecheck (tsc --noEmit) --|
  |                                    +--> parallel execution
  +-- Job: lint (biome ci .) ---------|
  |
  +-- Depends on: biome.json, tsconfig.json, pnpm-lock.yaml (cache key)

tsconfig.json (unchanged)
  |
  +-- Used by tsc --noEmit (type checking)
  +-- Path aliases consumed by vitest.config.mts resolve.alias

vite.config.mjs (unchanged for production builds)
  |
  +-- @vitejs/plugin-react with babel-plugin-react-compiler
  +-- Production build pipeline is NOT affected by this migration
```
