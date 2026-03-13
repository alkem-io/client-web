# Research: Ultra-Fast CI/CD Feedback Loop with Biome, Vitest & SWC

**Status**: Phase 0 - Research
**Date**: 2026-03-11
**Scope**: Migration from ESLint+Prettier to Biome, SWC transforms for Vitest, CI workflow optimization

---

## 1. ESLint-to-Biome Rule Migration Map

**Decision**: Migrate all rules with direct Biome equivalents to Biome. Retain a minimal ESLint configuration solely for `react-compiler/react-compiler` (no Biome equivalent exists). Drop rules that Biome's formatter already enforces.

**Rationale**: Biome covers approximately 85% of the project's ESLint rules natively. The React Compiler lint rule is the only rule that requires ESLint to remain, but it can run as a standalone, minimal config with near-zero overhead. All formatting rules (quotes, jsx-quotes, spacing) move to the Biome formatter and are no longer lint concerns.

**Alternatives Considered**:
- **Drop React Compiler lint entirely**: Rejected. The rule catches non-idiomatic patterns that break compiler assumptions. It is too valuable to lose.
- **Keep full ESLint alongside Biome**: Rejected. Defeats the performance goal; running two full linters negates Biome's speed advantage.

### Rule-by-Rule Mapping

| ESLint Rule | Biome Equivalent | Mapping Quality | Notes |
|---|---|---|---|
| `@typescript-eslint/no-unused-vars` (error/warn) | `lint/correctness/noUnusedVariables` | 1:1 | Supports `argsIgnorePattern` via `"ignore": ["^_"]`. Does not have `ignoreRestSiblings` (Biome always ignores rest siblings). `caughtErrorsIgnorePattern` maps to the same underscore-prefix convention. Severity can be set to `warn` or `error`. |
| `@typescript-eslint/no-explicit-any` (error) | `lint/suspicious/noExplicitAny` | 1:1 | Direct equivalent. |
| `quotes: ['error', 'single', { avoidEscape: true }]` | Biome formatter: `quoteStyle: "single"` | Formatter | Not a lint rule in Biome; handled entirely by the formatter. `avoidEscape` behavior is the Biome default (it avoids unnecessary escapes automatically). |
| `jsx-quotes: ['error']` | Biome formatter: `jsxQuoteStyle: "double"` | Formatter | Default JSX quote style in both Prettier and Biome is double quotes. Handled by formatter, not linter. |
| `no-multiple-empty-lines: ['error']` | Biome formatter | Formatter | Biome's formatter collapses multiple empty lines to a single one automatically. No separate lint rule needed. |
| `react/jsx-pascal-case` (error) | `lint/correctness/useJsxPascalCase` | 1:1 | Direct equivalent. Biome added this rule in v1.5. |
| `react/self-closing-comp` (error) | `lint/style/useSelfClosingElements` | 1:1 | Direct equivalent. Applies to both HTML and JSX elements. |
| `react/jsx-closing-bracket-location` (error) | Biome formatter | Formatter | Biome's JSX formatting handles bracket placement consistently. No separate lint rule. |
| `react/jsx-closing-tag-location` (error) | Biome formatter | Formatter | Same as above; formatter handles tag location. |
| `react/jsx-tag-spacing` (error) | Biome formatter | Formatter | Formatter handles all JSX whitespace. |
| `react/jsx-curly-spacing` (error) | Biome formatter | Formatter | Formatter handles curly brace spacing in JSX. |
| `react/jsx-boolean-value` (error) | `lint/style/noImplicitBoolean` | Approximate | Biome enforces shorthand (`<Comp disabled />` instead of `<Comp disabled={true} />`). This matches the default behavior of ESLint's `jsx-boolean-value` with `"never"` mode. The ESLint rule default is `"never"`, which is what this project uses (no explicit config = default). |
| `react/no-string-refs` (error) | `lint/correctness/noStringRefs` | 1:1 | Direct equivalent. |
| `react/jsx-wrap-multilines` (error) | Biome formatter | Formatter | Biome's formatter handles multiline JSX wrapping with parentheses. |
| `jsx-a11y/alt-text` (warn) | `lint/a11y/useAltText` | 1:1 | Direct equivalent. Set severity to `warn`. |
| `jsx-a11y/anchor-is-valid` (warn) | `lint/a11y/useValidAnchor` | 1:1 | Direct equivalent. Set severity to `warn`. |
| `jsx-a11y/aria-role` (warn) | `lint/a11y/useValidAriaRole` | 1:1 | Direct equivalent. Set severity to `warn`. |
| `jsx-a11y/no-access-key` (warn) | `lint/a11y/noAccessKey` | 1:1 | Direct equivalent. Set severity to `warn`. |
| `jsx-a11y/img-redundant-alt` (warn) | `lint/a11y/noRedundantAlt` | 1:1 | Direct equivalent. Set severity to `warn`. |
| `react-compiler/react-compiler` (error) | **No equivalent** | N/A | **Must retain via minimal ESLint.** This is the only rule requiring ESLint. |
| `import/order` (enforced) | `lint/nursery/useImportOrder` / `organizeImports` | Approximate | Biome's `organizeImports` handles import sorting. The grouping semantics differ slightly from `eslint-plugin-import`'s `order` rule (Biome groups by: bare specifiers, then node builtins, then relative paths). For this project's usage (basic ordering without custom group config), the behavior is functionally equivalent. |
| `no-console` (error in production) | `lint/suspicious/noConsoleLog` + `lint/suspicious/noConsole` | Approximate | Biome has `noConsoleLog` (covers `console.log`) and the broader `noConsole` (all console methods). The environment-conditional severity (error in prod, off in dev) cannot be replicated in a static `biome.json`. **Strategy**: Set to `warn` in `biome.json` and enforce `error` in CI by passing `--error-on-more-diagnostics` or using a CI-specific config override. Alternatively, use `biome.ci.json` extends pattern. |
| `no-debugger` (error in production) | `lint/suspicious/noDebugger` | 1:1 | Direct equivalent. Same environment-conditional caveat as `no-console`. Set to `warn` in base config, `error` in CI. |
| `padding-line-between-statements` (various) | **No equivalent** | N/A | Biome does not have a padding-line rule. **Decision**: Drop this rule. The formatter handles general whitespace, and enforcing blank lines around interfaces/exports adds marginal value versus the complexity of retaining ESLint for it. If strongly desired, it could be added to the minimal ESLint config alongside `react-compiler`. |
| `react-hooks/exhaustive-deps` (off) | N/A | N/A | Already disabled. React Compiler handles dependency tracking. No action needed. |
| `import/prefer-default-export` (off) | N/A | N/A | Already disabled. No action needed. |
| `@typescript-eslint/explicit-function-return-type` (off) | N/A | N/A | Already disabled. No action needed. |

### Minimal ESLint Residual Config

After migration, the residual `eslint.config.mjs` would contain only:

```js
// eslint.config.mjs - minimal: React Compiler rule only
import tsParser from '@typescript-eslint/parser';
import reactCompilerPlugin from 'eslint-plugin-react-compiler';

export default [
  {
    ignores: ['node_modules/', 'build/', 'dist/', 'coverage/'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-compiler': reactCompilerPlugin,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
];
```

This removes 11 devDependencies (`@eslint/js`, `eslint-plugin-import`, `eslint-plugin-react`, `eslint-plugin-jsx-a11y`, `@typescript-eslint/eslint-plugin`, etc.) and retains only `@typescript-eslint/parser`, `eslint-plugin-react-compiler`, and `eslint` itself.

---

## 2. SWC Compatibility with Vitest

**Decision**: Use `unplugin-swc` with Vitest for test transforms. This replaces Babel entirely in the test pipeline while keeping Babel+React Compiler for the production Vite build.

**Rationale**: `unplugin-swc` is the more mature and widely-used option for Vitest+SWC integration. It provides a Vite-compatible plugin that slots directly into `vitest.config.mts`. The alternative `@vitest/plugin-swc` is an experimental first-party option but has less community adoption and documentation.

**Alternatives Considered**:
- **`@vitest/plugin-swc`**: Less mature, fewer configuration examples. Could be revisited when it reaches stable.
- **Keep Babel for tests**: Rejected. Babel transform is the primary bottleneck in test startup time. SWC provides 10-20x faster transforms.
- **`vitest-swc`**: Community wrapper; less maintained than `unplugin-swc`.

### Path Alias Resolution

The `@/*` path alias (`@/` maps to `./src/*`) must be configured in the SWC context:

```ts
// vitest.config.mts
import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

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
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    globals: true,
  },
});
```

Path aliases are resolved by Vite's `resolve.alias` configuration, not by SWC itself. Since Vitest uses Vite's module resolution pipeline, the `@/*` alias works without any SWC-specific configuration. The `vite-tsconfig-paths` plugin can also be used in the Vitest config if preferred, but explicit `resolve.alias` is simpler and avoids an extra plugin.

### React JSX Transform Configuration

SWC must be configured with `runtime: 'automatic'` to match the project's `tsconfig.json` setting of `"jsx": "react-jsx"`. This ensures SWC emits `import { jsx as _jsx } from 'react/jsx-runtime'` instead of `React.createElement`.

### Interaction with setupTests.ts

The existing `src/setupTests.ts` performs three operations:
1. Imports `@testing-library/jest-dom` and `@testing-library/jest-dom/vitest` for custom matchers
2. Patches `InMemoryCache.prototype.diff` to strip `canonizeResults` (Apollo Client 3.14 compatibility)
3. Patches `invariant.warn` to suppress warning code 13
4. Registers `afterEach(cleanup)`

None of these depend on Babel transforms or React Compiler output. They are runtime patches applied before each test suite. SWC compatibility is confirmed: all imports are standard ESM, no Babel-specific syntax is used.

---

## 3. React Compiler Isolation

**Decision**: Omit React Compiler (babel-plugin-react-compiler) from Vitest test transforms entirely. Tests run through SWC without the compiler.

**Rationale**: React Compiler is a pure optimization transform. It performs automatic memoization, hoisting, and deduplication of values. These transformations do not change component behavior -- they only change *when* React re-renders or re-computes values. Tests that assert on rendered output, user interactions, or component state are unaffected by whether memoization is applied.

**Alternatives Considered**:
- **Run React Compiler in tests via Babel**: Rejected. This would require keeping Babel in the test pipeline, negating the SWC speed improvement. It also adds test flakiness risk if compiler optimizations interact unexpectedly with test mocking.
- **Use SWC's React Compiler plugin**: Does not exist. React Compiler is a Babel-only plugin maintained by the React team.

### Configuration Approach

The key insight is that Vite and Vitest can use entirely different transform pipelines:

- **Vite (dev/build)**: Uses `@vitejs/plugin-react` with `babel-plugin-react-compiler`. This ensures production code gets compiler optimizations.
- **Vitest (tests)**: Uses `unplugin-swc` with no compiler. Tests validate behavior, not optimization.

This is achieved by having a separate `vitest.config.mts` that does NOT import `@vitejs/plugin-react` and instead uses `unplugin-swc`. Vitest will use this config file automatically when present (Vitest looks for `vitest.config.*` before falling back to `vite.config.*`).

### Impact on Test Correctness

No impact expected. The React Compiler's guarantees are:
- Components render the same output with or without the compiler
- Side effects execute in the same order
- Hooks behave identically

If a test passes without the compiler but fails with it (or vice versa), that indicates a bug in either the component or the compiler -- not a testing gap.

---

## 4. Biome Formatter Configuration

**Decision**: Map all existing Prettier options to Biome formatter equivalents. The resulting formatting will be nearly identical, with minor differences in edge cases.

**Rationale**: Biome's formatter is designed as a Prettier-compatible alternative. For the options this project uses, all have direct Biome equivalents.

**Alternatives Considered**:
- **Keep Prettier for formatting, use Biome only for linting**: Rejected. Running two tools where one suffices is slower and adds configuration complexity.
- **Accept Biome defaults without mapping**: Rejected. Would cause a massive diff across the entire codebase. Matching existing Prettier config minimizes churn.

### Option-by-Option Mapping

| Prettier Option | Value | Biome Equivalent | Biome Value | Notes |
|---|---|---|---|---|
| `printWidth` | `120` | `lineWidth` | `120` | Direct mapping. |
| `tabWidth` | `2` | `indentWidth` | `2` | Direct mapping. |
| `useTabs` | `false` | `indentStyle` | `"space"` | Biome uses `"space"` or `"tab"`. |
| `semi` | `true` | `semicolons` | `"always"` | Direct mapping. `"always"` is the Biome default. |
| `singleQuote` | `true` | `quoteStyle` | `"single"` | Direct mapping. Biome default is `"double"`, so this must be set explicitly. |
| `trailingComma` | `es5` | `trailingCommas` | `"es5"` | Direct mapping. Note Biome uses plural `trailingCommas`. |
| `bracketSpacing` | `true` | `bracketSpacing` | `true` | Direct mapping. This is the Biome default. |
| `arrowParens` | `avoid` | `arrowParentheses` | `"asNeeded"` | Biome uses `"asNeeded"` (equivalent to Prettier's `"avoid"`) vs `"always"`. |

### Resulting biome.json Formatter Section

```json
{
  "formatter": {
    "enabled": true,
    "lineWidth": 120,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "javascript": {
    "formatter": {
      "semicolons": "always",
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "trailingCommas": "es5",
      "bracketSpacing": true,
      "arrowParentheses": "asNeeded"
    }
  }
}
```

### Known Formatting Differences

Biome's formatter produces slightly different output from Prettier in a few edge cases:
1. **Ternary expressions**: Biome may format multi-line ternaries differently (less indentation nesting).
2. **Long JSX attribute lists**: Minor differences in line-break placement at the boundary of `lineWidth`.
3. **Template literal indentation**: Biome preserves template literal content more aggressively.

These differences are cosmetic and will appear as a one-time formatting diff when the migration is applied. Running `biome format --write .` across the codebase will normalize everything.

---

## 5. Pre-commit Hook Migration

**Decision**: Keep Husky v4 with lint-staged. Replace the lint-staged commands to use Biome instead of ESLint+Prettier.

**Rationale**: Husky v4 is already configured and working. Upgrading to Husky v9 (latest) would change the hook installation mechanism (from `package.json` config to `.husky/` directory scripts) and is a separate concern from the Biome migration. The lint-staged integration works identically regardless of which tools it invokes.

**Alternatives Considered**:
- **Upgrade to Husky v9**: Deferred. Can be done independently. Would move hook definitions from `package.json` to `.husky/pre-commit` script files. Not blocked by this migration.
- **Replace Husky+lint-staged with Biome's built-in Git integration**: Biome does not have built-in Git hook support. Rejected.
- **Use lefthook**: A simpler alternative to Husky. Deferred for a separate evaluation.

### New lint-staged Configuration

Current `.lintstagedrc.json`:
```json
{
  "src/**/*.ts{,x}": ["cross-env NODE_ENV=production eslint --fix", "prettier --write"],
  "*.{json,md}": "prettier --write"
}
```

New `.lintstagedrc.json`:
```json
{
  "src/**/*.ts{,x}": ["biome check --fix --no-errors-on-unmatched", "biome format --write --no-errors-on-unmatched"],
  "*.{json,md}": "biome format --write --no-errors-on-unmatched"
}
```

Notes:
- `biome check --fix` combines linting + auto-fix (replaces `eslint --fix`).
- `biome format --write` replaces `prettier --write`.
- These could be combined into a single `biome check --fix --formatter-enabled=true` command, but separating them makes the intent explicit and mirrors the current two-step pattern.
- `--no-errors-on-unmatched` prevents errors when staged files don't match Biome's supported extensions.
- The minimal residual ESLint (React Compiler rule) does NOT need to run on every commit -- it is not auto-fixable and should run in CI only.

---

## 6. CI Workflow Optimization

**Decision**: Run `tsc --noEmit` and `biome check` as parallel steps in a single CI job. Use GitHub Actions' native job-level parallelism via separate steps that don't depend on each other, or background processes within a single step.

**Rationale**: `tsc --noEmit` (~8-12s) and `biome check` (~1-3s) are independent operations that can run concurrently. Since the project already uses self-hosted Apple Silicon runners, CPU resources are available for parallelism.

**Alternatives Considered**:
- **Separate CI jobs for tsc and biome**: Rejected. Each job requires checkout + install (~15s overhead). For commands that run in seconds, the overhead exceeds the parallelism benefit.
- **Sequential steps**: Simple but leaves ~3s on the table. Acceptable as a fallback.

### Recommended CI Approach

**Option A: Background process in single step (considered, not chosen)**

```yaml
- name: Type-check and Lint
  run: |
    tsc --noEmit &
    TSC_PID=$!
    biome check ./src
    BIOME_EXIT=$?
    wait $TSC_PID
    TSC_EXIT=$?
    if [ $TSC_EXIT -ne 0 ] || [ $BIOME_EXIT -ne 0 ]; then
      exit 1
    fi
```

This runs both in parallel within a single step. Total time is `max(tsc, biome)` instead of `tsc + biome`.

**Option B: Separate parallel jobs (CHOSEN — see contracts/ci-workflow-changes.md)**

```yaml
jobs:
  typecheck:
    runs-on: [self-hosted, macOS, ARM64, apple-silicon, m4]
    steps:
      # ... setup ...
      - run: tsc --noEmit

  biome:
    runs-on: [self-hosted, macOS, ARM64, apple-silicon, m4]
    steps:
      # ... setup ...
      - run: biome check ./src
```

This duplicates checkout + install but provides clearer job-level status reporting in GitHub PR checks. Chosen because self-hosted runners make the duplication overhead minimal, and separate jobs give per-check pass/fail visibility.

### Cache Implications

- **Biome**: Biome is a single binary (~30MB). It can be cached via `actions/cache` or installed globally on the self-hosted runner. No node_modules dependency.
- **tsc**: Requires `node_modules` (for type definitions). Already cached via pnpm store.
- **No new cache keys needed**: Biome binary can be installed via pnpm (`@biomejs/biome` devDependency), which means it's already covered by the existing pnpm cache.

### Updated ci-lint.yml

The current `ci-lint.yml` runs `pnpm run lint:prod` which executes `tsc --noEmit && cross-env NODE_ENV=production eslint src/**/*.ts{,x}`. The new workflow would:

1. Run `tsc --noEmit` and `biome check ./src` in parallel (main linting).
2. Run the minimal ESLint (React Compiler rule only) sequentially after install.
3. The React Compiler ESLint check can run in parallel with tsc+biome if desired.

---

## 7. Codegen Post-hooks

**Decision**: Replace `eslint --fix` and `prettier --write` in `codegen.yml` post-hooks with `biome format --write` and `biome check --fix`.

**Rationale**: The codegen output (generated TypeScript files) needs formatting and lint fixes applied automatically. Biome can handle both in a single pass.

**Alternatives Considered**:
- **Remove post-hooks entirely**: Rejected. Generated code would have inconsistent formatting and lint warnings.
- **Use only `biome format --write`**: Insufficient. Generated code may have lint issues (e.g., unused imports) that `biome check --fix` can auto-resolve.

### New codegen.yml hooks

Current:
```yaml
hooks:
  afterAllFileWrite:
    - eslint --fix
    - prettier --write
```

New:
```yaml
hooks:
  afterAllFileWrite:
    - biome check --fix --unsafe
    - biome format --write
```

Notes:
- `--unsafe` is used for codegen output because generated files may have patterns that Biome's safe fixes wouldn't touch but that are acceptable in generated code.
- The `/* eslint-disable @typescript-eslint/no-explicit-any */` comments at the top of generated files should be replaced with `// biome-ignore lint/suspicious/noExplicitAny: generated code` OR the files should be added to Biome's `overrides` section to disable `noExplicitAny` for `src/core/apollo/generated/*`:

```json
{
  "overrides": [
    {
      "include": ["src/core/apollo/generated/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noExplicitAny": "off"
          }
        }
      }
    }
  ]
}
```

This is cleaner than inline suppression comments and handles all generated files uniformly. The `add` plugin in `codegen.yml` that prepends `/* eslint-disable */` comments can be removed.

---

## 8. Vitest Configuration Split

**Decision**: Create a standalone `vitest.config.mts` that does NOT extend `vite.config.mjs`. It defines its own plugins (SWC instead of Babel), resolve aliases, and test settings.

**Rationale**: The test pipeline and the dev/build pipeline have fundamentally different transform requirements:
- **Vite**: Babel + React Compiler (for production optimizations)
- **Vitest**: SWC only (for speed, no compiler needed)

Sharing config via `mergeConfig` would require importing `vite.config.mjs` and then removing/overriding the React plugin, which is fragile and error-prone. A standalone config is explicit and maintainable.

**Alternatives Considered**:
- **`mergeConfig` approach**: Import the base `vite.config.mjs` and override the `plugins` array. Rejected because:
  - The base config includes dev-server middleware, meta.json generation, and visualizer plugins that are irrelevant to tests.
  - Merging plugin arrays is not straightforward; you'd need to filter out `@vitejs/plugin-react` and replace it.
  - Any future changes to `vite.config.mjs` could unintentionally affect tests.
- **Keep test config inside `vite.config.mjs`**: The current approach. Works today because both use Babel, but breaks once tests use SWC while dev uses Babel. The `test` block in `vite.config.mjs` would need to reference a different plugin set, which Vite's config schema doesn't cleanly support.
- **Use `vitest.workspace.ts`**: Overkill for a single-project setup. Workspaces are for monorepos with multiple test environments.

### Standalone vitest.config.mts Structure

```ts
import path from 'path';
import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

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
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    globals: true,
  },
});
```

### What Moves and What Stays

| Setting | vite.config.mjs | vitest.config.mts |
|---|---|---|
| React plugin | `@vitejs/plugin-react` + Babel + React Compiler | `unplugin-swc` |
| `vite-tsconfig-paths` | Yes | No (explicit alias instead) |
| `vite-plugin-svgr` | Yes | No (tests don't import SVGs as components, or mock them) |
| `resolve.alias` (react, @) | Yes | Yes (duplicated, 3 lines) |
| Dev server config | Yes | No |
| Build config | Yes | No |
| `optimizeDeps` | Yes | No |
| `test` block | **Remove** | Yes (moved here) |
| Visualizer plugin | Yes | No |
| No-cache-index plugin | Yes | No |
| Meta.json plugin | Yes | No |

The `test` block currently in `vite.config.mjs` (lines 198-202) should be removed once `vitest.config.mts` is in place. Vitest automatically prefers `vitest.config.*` over `vite.config.*`.

### SVG Import Handling

If any test file imports an SVG as a React component (via `vite-plugin-svgr`), a mock is needed in `vitest.config.mts`:

```ts
// In vitest.config.mts or a setup file
// Mock SVG imports
test: {
  // ...
  alias: {
    '\\.svg\\?react$': path.resolve('./src/__mocks__/svgMock.ts'),
  },
}
```

This is only needed if tests import SVGs. A scan of test files should confirm whether this is required before implementation.

---

## Summary of Decisions

| Area | Tool Before | Tool After | Breaking Change? |
|---|---|---|---|
| Linting (general) | ESLint (full config) | Biome | No (same rules, different tool) |
| Linting (React Compiler) | ESLint | ESLint (minimal) | No |
| Formatting | Prettier | Biome formatter | One-time diff |
| Test transforms | Babel (via @vitejs/plugin-react) | SWC (via unplugin-swc) | No |
| Test config | `vite.config.mjs` test block | `vitest.config.mts` standalone | No |
| Pre-commit | Husky v4 + lint-staged + ESLint + Prettier | Husky v4 + lint-staged + Biome | No |
| Codegen post-hooks | ESLint + Prettier | Biome | No |
| CI lint step | `tsc && eslint` (sequential) | `tsc & biome` (parallel) | No |

### Expected Performance Improvements

| Operation | Before (estimated) | After (estimated) | Improvement |
|---|---|---|---|
| `pnpm lint` (CI) | ~15-20s (tsc + eslint) | ~10-13s (tsc \|\| biome, parallel) | ~35-50% |
| Pre-commit hook | ~5-8s (eslint --fix + prettier) | ~1-2s (biome check + format) | ~75% |
| Vitest cold start | ~2-3s (Babel transform) | ~0.5-1s (SWC transform) | ~60-70% |
| `pnpm codegen` post-hooks | ~3-5s (eslint + prettier) | ~0.5-1s (biome) | ~80% |

### Dependencies to Add

- `@biomejs/biome` (devDependency)
- `unplugin-swc` (devDependency)
- `@swc/core` (devDependency, peer of unplugin-swc)

### Dependencies to Remove

- `prettier`
- `@eslint/js`
- `eslint-plugin-import`
- `eslint-plugin-react`
- `eslint-plugin-jsx-a11y`
- `@typescript-eslint/eslint-plugin`
- `@types/eslint-plugin-jsx-a11y`

### Dependencies to Keep (for React Compiler lint)

- `eslint` (minimal)
- `@typescript-eslint/parser`
- `eslint-plugin-react-compiler`
