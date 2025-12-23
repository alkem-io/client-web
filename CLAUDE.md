# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Alkemio Client Web is a React + TypeScript single-page application served by Vite. It uses MUI and Emotion for the design system, and Apollo Client for the GraphQL data layer.

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

# Run tests (non-interactive)
pnpm vitest run --reporter=basic

# GraphQL codegen (requires running backend at localhost:4000/graphql)
pnpm codegen

# Format code
pnpm format
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

- **`src/domain`**: Domain-driven slices organized by business concept
  - `space/`, `community/`, `collaboration/`, `innovationHub/`, etc.
  - Each slice contains GraphQL documents, hooks, pages/views

- **`src/main`**: App-specific code
  - `routing/`: Top-level routes (`TopLevelRoutes`)
  - `admin/`: Platform admin pages
  - `ui/`: App-specific layouts (footer, navigation)

### Key Files

- `src/index.tsx`: App entry point, registers service worker
- `src/root.tsx`: Global providers (Sentry, Apollo, auth, theming, routing)
- `codegen.yml`: GraphQL codegen configuration
- `buildConfiguration.js`: Generates runtime env config (`public/env-config.js`)

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
- Prefer `as const` objects over `enum`
- Views should not import from `src/core/apollo` (no GraphQL dependencies in dumb components)
- Admin components should be prefixed with `Admin`

### State & Hooks

- `useState` pairs: `const [value, setValue] = useState()`
- Use `useMemo` when creating objects/arrays passed as props
- Use `useCallback` only for functions passed as props to children

## GraphQL Workflow

1. Add/modify `.graphql` files alongside domain features
2. Run `pnpm codegen` (requires backend running)
3. Generated files go to `src/core/apollo/generated/`
4. Commit generated outputs

## Environment Variables

- Must be prefixed with `VITE_` to be exposed
- Base config in `.env`, local overrides in `.env.local`
- Runtime injection via `buildConfiguration.js` → `public/env-config.js` → `window._env_`

## Testing

Tests use Vitest with jsdom environment:

```bash
pnpm vitest run --reporter=basic  # Run all tests once
pnpm test                          # Watch mode
pnpm test:coverage                 # With coverage
```

## Pre-commit

Husky runs lint-staged on commit. Run `pnpm lint` before committing to catch issues early.
