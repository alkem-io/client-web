# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Alkemio Client Web is a React + TypeScript single-page application served by Vite. It uses MUI and Emotion for the design system, and Apollo Client for the GraphQL data layer.

- Repository is large (~18k modules built); main work happens under `src/core`, `src/domain`, and `src/main`
- Requires Node ≥20.19.0 and pnpm ≥10.17.1 (pinned via Volta)
- Always use pnpm; the lockfile is authoritative

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
pnpm vitest run --reporter=basic

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
- Views should not import from `src/core/apollo` (no GraphQL dependencies in dumb components)
- Admin components should be prefixed with `Admin`
- Avoid over-engineering: only make changes that are directly requested or clearly necessary
- Don't add comments, docstrings, or type annotations to code you didn't change
- Don't add error handling for scenarios that can't happen; trust internal code and framework guarantees

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

## Environment Variables

- Must be prefixed with `VITE_` to be exposed to client
- Base config in `.env` (checked into repo), local overrides in `.env.local`
- Runtime injection via `buildConfiguration.js` → `public/env-config.js` → `window._env_`
- `buildConfiguration.js` runs before dev/build commands and regenerates config files

## Testing

Tests use Vitest with jsdom environment:

```bash
pnpm vitest run --reporter=basic  # Run all tests once (non-interactive)
pnpm test                          # Watch mode
pnpm test:coverage                 # With coverage (Istanbul provider)
```

Execution typically completes in ~1.2s with 19 files / 247 tests passing.

## React Compiler

The project uses the React Compiler (babel-plugin-react-compiler) to automatically optimize React components. The compiler adds automatic memoization, reducing the need for manual `useMemo`, `useCallback`, and `React.memo` calls.

Benefits:

- Automatic performance optimization
- Cleaner code with less boilerplate
- Seamless integration with React 19

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

- Keep Apollo-related hooks in Containers, not directly in Pages
- Avoid nesting objects in props except for view models
- Don't base View props on GraphQL definitions
- Group props by domain, not by functional role

### CI/CD

- All commits must be signed
- GitHub Actions enforce: successful Docker build, passing TypeScript + ESLint, working Vite build
- Run `pnpm lint` and `pnpm vitest run --reporter=basic` before staging changes

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

**Documentation**: See `specs/002-guest-whiteboard-access/` for full specification and implementation details.
