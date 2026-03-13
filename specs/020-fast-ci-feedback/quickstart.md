# Quickstart: Biome + SWC Toolchain

This guide covers day-to-day development after the migration from ESLint/Prettier to Biome and from Babel to SWC for test transforms.

## Prerequisites

| Tool | Version | How to install |
|---|---|---|
| Node.js | 24.14.0 | Managed by Volta (auto-installed on first use) |
| pnpm | 10.17.1 | `corepack enable && corepack prepare pnpm@10.17.1 --activate` |
| Volta | latest | https://volta.sh |

Volta pins are in `package.json` -- running any `pnpm` or `node` command in the repo will use the correct versions automatically.

## Installation

```bash
pnpm install
```

This installs all dependencies including `@biomejs/biome`, `@swc/core`, and `unplugin-swc`.

## Available Commands

### Linting

```bash
# Type-check + Biome lint (CI-equivalent, exits non-zero on issues)
pnpm lint

# Same as above (lint:prod is now identical since Biome config is static)
pnpm lint:prod

# Type-check + auto-fix all fixable issues (lint + format + import sorting)
pnpm lint:fix
```

### Formatting

```bash
# Format all files with Biome
pnpm format
```

Biome formatting replaces Prettier. The output is nearly identical -- the same print width (120), single quotes, ES5 trailing commas, 2-space indentation, and arrow parens as-needed.

### Testing

```bash
# Run all tests once (non-interactive)
pnpm vitest run

# Watch mode
pnpm test

# Coverage report (Istanbul, lcov output)
pnpm test:coverage
```

Tests now use SWC for TypeScript/JSX transforms instead of Babel. This does not affect test behavior -- only transform speed. The React Compiler plugin is not used during tests (it is only relevant for production builds).

### Other Commands

```bash
# Production build (unchanged -- still uses Vite + Babel + React Compiler)
pnpm build

# GraphQL codegen (unchanged)
pnpm codegen

# Bundle analysis (unchanged)
pnpm analyze
```

## IDE Setup

### VS Code (recommended)

1. **Install** the [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome).

2. **Disable** the ESLint and Prettier extensions for this workspace (or globally if you only work on this project):
   - Open the Extensions sidebar
   - Find "ESLint" and "Prettier - Code formatter"
   - Click the gear icon and select "Disable (Workspace)"

3. **Configure** VS Code settings for the workspace. Create or update `.vscode/settings.json`:

   ```json
   {
     "editor.defaultFormatter": "biomejs.biome",
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "quickfix.biome": "explicit",
       "source.organizeImports.biome": "explicit"
     },
     "[typescript]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[typescriptreact]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[json]": {
       "editor.defaultFormatter": "biomejs.biome"
     }
   }
   ```

4. Reload the VS Code window (`Cmd+Shift+P` -> "Developer: Reload Window").

### JetBrains IDEs (WebStorm / IntelliJ)

1. Install the Biome plugin from the JetBrains Marketplace.
2. Disable the built-in ESLint and Prettier integrations under **Settings > Languages & Frameworks**.
3. Configure Biome as the default formatter under **Settings > Languages & Frameworks > Biome**.

## Pre-commit Hooks

Pre-commit hooks run automatically via Husky + lint-staged. On every commit:

1. **Staged `.ts` and `.tsx` files** are processed by `biome check --write` (lint + format + organize imports in a single pass).
2. **Staged `.json` and `.md` files** are processed by `biome format --write`.

If the hook modifies files, the changes are included in the commit. If lint errors cannot be auto-fixed, the commit is rejected with diagnostic output.

You do not need to run `pnpm lint:fix` or `pnpm format` manually before committing -- the hooks handle it. However, running them proactively reduces commit-time friction.

## Troubleshooting

### "biome: command not found"

Biome is installed as a project dependency, not globally. Always run it via pnpm:

```bash
pnpm biome check .
pnpm biome format --write .
```

Or use `npx biome` if needed outside of scripts.

### Formatting differs from old Prettier output

Biome's formatter is Prettier-compatible but not identical in all edge cases. After the migration, a one-time bulk format pass is applied to the entire codebase. If you see formatting diffs in a PR, verify that `pnpm format` was run. Do not manually adjust formatting to match old Prettier output.

### Tests fail with SWC transform errors

If a test file fails with a syntax/transform error:

1. Verify `@swc/core` is installed: `pnpm list @swc/core`
2. Check that `vitest.config.mts` uses the SWC plugin
3. Run `pnpm install` to ensure native binaries are present (SWC uses platform-specific binaries)
4. If on a new platform (e.g., Linux ARM64), verify that `@swc/core` publishes a binary for it

### Pre-commit hook is slow or not running

```bash
# Verify Husky is installed
ls -la .husky/

# Reinstall hooks
pnpm exec husky install
```

### ESLint extension still showing warnings in VS Code

After disabling the ESLint extension, reload the window. If warnings persist, check that no other extension (e.g., "Error Lens") is caching old diagnostics. You can also remove the old `eslint.config.mjs` reference from `.vscode/settings.json` if present.

### "biome ci" fails in CI but "biome check" passes locally

`biome ci` is stricter than `biome check` -- it reports formatting issues as errors instead of auto-fixing them. Run `pnpm format` locally and commit the result.

### Coverage report is empty or missing

Ensure the coverage command uses the correct flags:

```bash
pnpm test:coverage
```

This runs Vitest with `--coverage.enabled --coverage.provider=istanbul --coverage.all --coverage.reporter=lcov`. The output goes to `./coverage/lcov.info`.
