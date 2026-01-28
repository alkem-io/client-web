# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Alkemio Client Web is a React 19 + TypeScript single-page application served by Vite. It uses MUI and Emotion for the design system, and Apollo Client for the GraphQL data layer.

- Repository is large (~18k modules built); main work happens under `src/core`, `src/domain`, and `src/main`
- Requires Node ≥20.19.0 and pnpm ≥10.17.1 (pinned via Volta to Node 20.19.0)
- Always use pnpm; the lockfile is authoritative
- All commits must be signed

## Essential Commands

```bash
# Install dependencies (always use pnpm)
pnpm install

# Development server (runs on localhost:3001, expects backend at localhost:3000)
pnpm start

# Production build
pnpm build

# Type checking + linting
pnpm lint

# Production-specific linting (uses NODE_ENV=production)
pnpm lint:prod

# Run tests (non-interactive)
pnpm vitest run

# Run a single test file
pnpm vitest run src/path/to/file.test.ts --reporter=basic

# Watch mode for tests
pnpm test

# Test with coverage
pnpm test:coverage

# GraphQL codegen (requires running backend at localhost:4000/graphql)
pnpm codegen

# Format code
pnpm format

# Bundle analysis (generates interactive visualization at build/stats.html)
pnpm analyze        # Production build with analysis
pnpm analyze:dev    # Development build with analysis
pnpm analyze:sentry # Production build with Sentry + analysis

# Serve built assets
pnpm serve:dev
```

## Architecture

### Directory Structure

- **`src/core`**: Reusable infrastructure not tied to business domain
  - `apollo/`: Apollo Client setup, generated GraphQL types/hooks in `generated/`
  - `auth/`: Authentication logic
  - `i18n/`: Internationalization
  - `ui/`: UI building blocks (buttons, dialogs, layouts)
  - `state/`: Global XState machines
  - `routing/`: Route utilities
  - `analytics/`: Analytics and tracking

- **`src/domain`**: Domain-driven slices organized by business concept
  - `space/`, `community/`, `collaboration/`, `innovationHub/`, etc.
  - Each slice contains GraphQL documents, hooks, pages/views

- **`src/main`**: App-specific code
  - `routing/`: Top-level routes (`TopLevelRoutes`)
  - `admin/`: Platform admin pages
  - `ui/`: App-specific layouts (footer, navigation)
  - `constants/`: Environment helpers and constants

### Key Files

- `src/index.tsx`: App entry point, registers service worker
- `src/root.tsx`: Global providers (Sentry, Elastic APM, Apollo, auth, theming, routing)
- `vite.config.mjs`: Vite build configuration with React Compiler enabled
- `vite.sentry.config.mjs`: Sentry-enabled build variant
- `codegen.yml`: GraphQL codegen configuration
- `buildConfiguration.js`: Generates runtime env config (`public/env-config.js`)
- `build-utils.mjs`: Generates `public/meta.json` with version info

## Code Conventions

### Path Alias

Use `@/` for imports from `src/` (e.g., `import { Button } from '@/core/ui/button'`)

### Naming

- **Files/Folders**: `camelCase` for hooks/utils, `PascalCase` for components
- **GraphQL files**: `PascalCase` (matches generated constants)
- **Variables**: `camelCase` for instances, `PascalCase` for components, `SCREAMING_SNAKE_CASE` for constants
- **Boolean props**: no `is` prefix (follows HTML convention); local boolean vars use `is` prefix

### Component Patterns

- Prefer `type` over `interface` unless extending other interfaces
- Prefer `as const` objects over `enum` (enums introduce runtime quirks and nominal typing)
- Views (dumb components) should not import from `src/core/apollo` (no GraphQL dependencies)
- Keep Apollo-related hooks in Containers/hooks, not directly in Pages
- Admin components should be prefixed with `Admin`
- Avoid over-engineering: only make changes that are directly requested or clearly necessary
- Don't add comments, docstrings, or type annotations to code you didn't change
- Don't add error handling for scenarios that can't happen; trust internal code and framework guarantees
- Barrel exports via `index.ts` files are forbidden—always use explicit file paths for imports

### State & Hooks

- `useState` pairs: `const [value, setValue] = useState()`
- Use `useMemo` when creating objects/arrays passed as props
- Use `useCallback` only for functions passed as props to children
- **Important**: React Compiler is enabled, which provides automatic memoization. Avoid excessive manual `useMemo`/`useCallback` usage.

### Component Organization

- Domain-specific components go under `src/domain/<entity>`
- Reusable UI components go under `src/core/ui`
- App-specific layouts go under `src/main/ui`
- Admin pages go under `src/main/admin`

## GraphQL Workflow

1. Add/modify `.graphql` files alongside domain features
2. Run `pnpm codegen` (requires backend running at `localhost:4000/graphql`)
3. Generated files go to `src/core/apollo/generated/`
4. Commit generated outputs
5. Always use generated hooks from `src/core/apollo/generated/apollo-hooks.ts`; raw `useQuery` or unchecked responses are prohibited

## Internationalization (i18n)

- All user-visible strings MUST use `react-i18next` via the `t()` function
- Never hardcode text or pass string literals as fallback to `t()`—add missing keys to `src/core/i18n/en/translation.en.json`
- The project uses Crowdin for translations
- Only edit `translation.en.json`; all other locale files are generated automatically via Crowdin and must never be edited manually
- If you need to change a non-English translation file, do it from Crowdin, not in the codebase

## Environment Variables

- Must be prefixed with `VITE_` to be exposed to client
- Base config in `.env` (checked into repo), local overrides in `.env.local`
- Runtime injection via `buildConfiguration.js` → `public/env-config.js` → `window._env_`
- `buildConfiguration.js` runs before dev/build commands and regenerates config files

## Testing

Tests use Vitest with jsdom environment:

```bash
pnpm vitest run  # Run all tests once (non-interactive)
pnpm test                          # Watch mode
pnpm test:coverage                 # With coverage (Istanbul provider)
```

Execution typically completes in ~1.2s with 19 files / 247 tests passing.

## React 19 & React Compiler

The project uses React 19 with the React Compiler (babel-plugin-react-compiler) for automatic optimization.

**React 19 patterns to use:**

- `useTransition` and `useOptimistic` for long-running mutations
- Suspense boundaries for data fetching
- Treat rendering as pure and concurrency-safe

**React Compiler benefits:**

- Automatic memoization reduces need for manual `useMemo`/`useCallback`/`React.memo`
- Cleaner code with less boilerplate

For more details, see `docs/react-compiler.md`.

## Build & Bundle Analysis

### Production Build

- Takes ~20s, outputs to `build/`
- Warns about large chunks (known, non-blocking)
- Generates extensive code splitting for vendor libraries (Apollo, MUI, Tiptap, etc.)

### Bundle Analysis

Run `pnpm analyze` to generate an interactive visualization showing:

- Module sizes and dependencies
- Optimization opportunities
- Vendor chunk breakdown

Results available at `build/stats.html`. See `docs/bundle-analysis.md` for details.

## Pre-commit Hooks

Husky runs lint-staged on commit:

- Formats code with Prettier
- Runs ESLint with auto-fix
- Run `pnpm lint` before committing to catch issues early

## Debugging & Root Cause Analysis

**CRITICAL**: NEVER apply fixes, duct tape, workarounds, or mask symptoms before understanding the root cause of a problem. When investigating bugs:

1. **Reproduce first** - Confirm the issue exists and is reproducible
2. **Understand the root cause** - Investigate WHY the problem occurs, not just WHAT is happening
3. **Only then fix** - Apply the minimal fix that addresses the actual root cause
4. **Verify the fix** - Confirm the root cause is addressed, not just the symptoms masked

Adding `fetchPolicy`, `nextFetchPolicy`, debug flags, or other workarounds without understanding why they're needed creates technical debt and hides real issues. If you don't know why something works, you don't have a fix—you have a time bomb.

## Practical Tips & Gotchas

### GraphQL Code Generation

- Always regenerate types after editing `.graphql` files with `pnpm codegen`
- Codegen requires a running backend server
- Generated files are large; search for specific types instead of opening files wholesale
- Commit all generated outputs

### Development Server

- Dev server runs on `localhost:3001`
- Expects Alkemio backend at `localhost:3000` (Traefik reverse proxy)
- Without backend, UI shells load but GraphQL calls fail
- On Linux, if file watching stops, run `.scripts/fix-dev-vite.sh` (requires sudo)

### Environment & Runtime Config

- Don't edit `build/` or `public/env-config.js` manually
- Run appropriate scripts (`buildConfiguration.js`) instead
- For runtime injection, ensure vars flow through `.env` → `buildConfiguration.js` → `window._env_`

### Performance & Memory

- Vite already raises `max-old-space-size` to 8192MB
- If builds fail on low-memory runners, consider `pnpm prune`

### Component Best Practices

- Avoid nesting objects in props except for view models
- Don't base View props on GraphQL definitions—Views should not import from `src/core/apollo`
- Group props by domain, not by functional role
- Views receive props and return formatted results; they should not fetch data
- Controllers (smart components) handle data fetching, localStorage persistence, route matching

### CI/CD

- All commits must be signed
- GitHub Actions enforce: successful Docker build, passing TypeScript + ESLint, working Vite build
- Run `pnpm lint` and `pnpm vitest run` before staging changes

### Accessibility

- WCAG 2.1 AA criteria must be met for every interactive element
- Use semantic HTML, keyboard navigation, and ARIA attributes where needed

## Public Routes

### Guest Whiteboard Access (`/public/whiteboard/:whiteboardId`)

Allows anonymous and authenticated users to view and edit whiteboards without full platform authentication.

**Key Features**:

- Anonymous access with display name prompt
- Authenticated users get anonymized names (e.g., "Alice S.")
- Real-time collaboration via WebSocket
- Full editing capabilities
- Session persistence via session storage (`alkemio_guest_name` key)
- GraphQL header injection (`x-guest-name`)

**Documentation**: See `specs/005-guest-whiteboard-access/` for full specification and implementation details.
