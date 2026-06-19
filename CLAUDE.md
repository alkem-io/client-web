# CLAUDE.md

> **Workspace context.** This repo is part of the Alkemio polyrepo at
> [alkem-io/agents-hq](https://github.com/alkem-io/agents-hq).
> Cross-repo (vertical) feature specs live there under `specs/NNN-*/`. When
> working on a `feat/NNN-...` branch in this repo, the matching workspace
> spec is the single source of truth.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Alkemio Client Web is a React 19 + TypeScript single-page application served by Vite. Its design system is **CRD** (shadcn/ui + Tailwind, under `src/crd/`) — the **sole** design system. **CRD is the only runtime path** — every route renders its CRD page. **MUI and Emotion have been fully removed** (epic #1888, story #9885): the `@mui/*` and `@emotion/*` packages are uninstalled, no source file imports them, the legacy `src/core/ui/` MUI design system is deleted, and the `designVersion` toggle is gone. Global styles live in `src/index.css`. Apollo Client is the GraphQL data layer.

> **Hard rule — never reintroduce MUI/Emotion.** Do not add `@mui/*` or `@emotion/*` (or `material-ui`) imports or dependencies anywhere. They are removed; CRD (`src/crd/`) is the only design system. New client-facing features are built in `src/crd/` with their integration glue in `src/main/crdPages/`.

The completed MUI removal is recorded in `specs/111-remove-mui-library/mui-footprint-baseline.md` and `specs/111-remove-mui-library/mui-removal-inventory.md`.

- Repository is large (~18k modules built); main work happens under `src/core`, `src/domain`, and `src/main`
- Requires Node ≥24.0.0 and pnpm ≥10.17.1 (pinned via Volta to Node 24.14.0)
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

# Type checking + linting (TypeScript + Biome + ESLint)
pnpm lint

# Run tests (non-interactive)
pnpm vitest run

# Run a single test file
pnpm vitest run src/path/to/file.test.ts --reporter=basic

# Watch mode for tests
pnpm test

# Test with coverage
pnpm test:coverage

# GraphQL codegen (requires running backend at localhost:3000/graphql)
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
  - `ui/`: App-specific layouts (footer, navigation, `CrdLayoutWrapper`)
  - `constants/`: Environment helpers and constants

- **`src/main/crdPages`**: Page-level integration for CRD pages
  - Contains page components, data mappers, hooks, and GraphQL queries for pages using the CRD design system
  - Imports from `@/crd/`, `@/domain/`, `@/core/` — never `@mui/*` or `@emotion/*` (removed)
  - Organized as `topLevelPages/<pageName>/` mirroring `src/main/topLevelPages/` structure
  - The "glue" layer: wires CRD presentational components to business logic and data

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
- **Do NOT use `useMemo`, `useCallback`, or `React.memo`** — React Compiler is enabled and handles memoization automatically. Manual memoization adds noise without benefit. Write plain expressions and let the compiler optimize.

### Component Organization

- Domain-specific components go under `src/domain/<entity>`
- Reusable UI components go under `src/core/ui`
- App-specific layouts go under `src/main/ui`
- Admin pages go under `src/main/admin`
- CRD page integration goes under `src/main/crdPages/<pageName>/`

### Browser Compatibility

Only use JavaScript/CSS features with **>90% global browser support** according to [caniuse.com](https://caniuse.com). This ensures broad compatibility without requiring polyfills.

**Avoid** (insufficient browser coverage):
- `Array.prototype.at()` — use `arr[arr.length - 1]` instead of `arr.at(-1)`
- `Object.hasOwn()` — use `Object.prototype.hasOwnProperty.call(obj, key)` or the `in` operator
- CSS `@container` queries — use media queries or JS-based responsive logic
- `structuredClone()` — use `JSON.parse(JSON.stringify())` or lodash `cloneDeep`

**Safe to use** (>95% support): `Array.prototype.flat/flatMap`, `Object.entries/fromEntries`, optional chaining (`?.`), nullish coalescing (`??`), `Promise.allSettled`, `globalThis`, `String.prototype.replaceAll`.

When in doubt, check [caniuse.com](https://caniuse.com) before introducing a newer API.

## GraphQL Workflow

1. Add/modify `.graphql` files alongside domain features
2. Run `pnpm codegen` (requires backend running at `localhost:3000/graphql`)
3. Generated files go to `src/core/apollo/generated/`
4. Commit generated outputs
5. Always use generated hooks from `src/core/apollo/generated/apollo-hooks.ts`; raw `useQuery` or unchecked responses are prohibited

### No `__typename` discrimination

Do **not** branch on `__typename` in CRD code (`src/crd/**`, `src/main/crdPages/**`) or in the data mappers/models that feed it. Prefer an explicit, schema-defined discriminator field instead — e.g. `actor.type === ActorType.VirtualContributor`, a `status` enum, a `kind` field.

**Why:** `__typename` is the *runtime object type*, which is frequently NOT what you expect. A field typed as a concrete object type (e.g. `Message.sender: Actor`) always has `__typename === 'Actor'`, so a check like `sender.__typename === 'VirtualContributor'` is silently *always false* — it type-checks, passes review, and fails only at runtime. (This exact bug shipped once: the comment VC badge never rendered. The fix was to select `Actor.type` and compare against `ActorType`.) `__typename` is also fragile across schema refactors (object type → interface/union and back) in a way an explicit enum is not.

If there is genuinely no schema field to discriminate on and `__typename` is the only option, it is allowed **only** with a comment that (a) states why no proper discriminator exists and (b) names the exact `__typename` values the code relies on, so a schema change that breaks them is caught in review.

## Internationalization (i18n)

- All user-visible strings MUST use `react-i18next` via the `t()` function
- Never hardcode text or pass string literals as fallback to `t()`—add missing keys to the appropriate translation file
- **All strings live in CRD** — every user-facing string MUST be added to the CRD per-feature namespaces under `src/crd/i18n/<feature>/`, with all supported languages (en, nl, es, bg, de, fr) edited directly in the same PR that introduces or removes a key. Key parity across all six languages is required and is enforced in review (CodeRabbit), not via Crowdin.
- **The legacy core `translation` namespace was removed** (story #9885) — `src/core/i18n/<lang>/translation.<lang>.json` no longer exists. The default namespace is now **`crd-common`** (`src/crd/i18n/common/`), so a `useTranslation()` call with no namespace argument resolves against `crd-common`. **Crowdin is no longer used.** Never reintroduce a `translation` namespace or a `src/core/i18n` locale file.

### Namespaces

- **`crd-common`** (default): The default namespace, in `src/crd/i18n/common/`. Eagerly loaded for English. Resolved by every `useTranslation()` call that omits a namespace argument (and the `{ ns: 'crd-common' }` form). Replaced the removed legacy `translation` namespace in story #9885.
- **`crd-layout`**: Layout UI strings (header/footer) in `src/crd/i18n/layout/`. Eagerly loaded for English. Used by `src/crd/layouts/` via `useTranslation('crd-layout')`.
- **`crd-exploreSpaces`**: Space explorer UI strings in `src/crd/i18n/exploreSpaces/`. Lazy-loaded on demand. Used by `src/crd/components/space/` via `useTranslation('crd-exploreSpaces')`.
- **`crd-<feature>`**: Future feature namespaces follow the same pattern: `src/crd/i18n/<feature>/<feature>.<lang>.json`, lazy-loaded, used via `useTranslation('crd-<feature>')`.

When adding strings for CRD components (including page titles), add them to the appropriate `src/crd/i18n/<feature>/<feature>.en.json`. CRD translations are managed manually (AI-assisted), not via Crowdin.

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

Execution typically completes in ~9s with 57 files / 595 tests passing.

## React 19 & React Compiler

The project uses React 19 with the React Compiler (babel-plugin-react-compiler) for automatic optimization.

**React 19 patterns to use:**

- `useTransition` and `useOptimistic` for long-running mutations
- Suspense boundaries for data fetching
- Treat rendering as pure and concurrency-safe

**React Compiler benefits:**

- Automatic memoization — do NOT add manual `useMemo`/`useCallback`/`React.memo`. The compiler handles it.
- Cleaner code with less boilerplate

For more details, see `specs/023-react-compiler-adoption/react-compiler.md`.

## Build & Bundle Analysis

### Production Build

- Takes ~20s, outputs to `build/`
- Warns about large chunks (known, non-blocking)
- Generates extensive code splitting for vendor libraries (Apollo, Tiptap, Excalidraw, etc.)

### Bundle Analysis

Run `pnpm analyze` to generate an interactive visualization showing:

- Module sizes and dependencies
- Optimization opportunities
- Vendor chunk breakdown

Results available at `build/stats.html`. See `docs/bundle-analysis.md` for details.

## Pre-commit Hooks

Husky runs lint-staged on commit:

- Formats and lints code with Biome (check + format)
- Runs ESLint (retained for `react-compiler` rule)
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

## prototype/ — Read-Only Reference (DO NOT MODIFY)

The `prototype/` folder is a verbatim copy of Jeroen's prototype. **Do not modify, lint, review, or flag any file in it.** It exists only as a design reference for building `src/crd/` components. Both `biome.json` and `eslint.config.mjs` exclude `prototype/` from linting. See `prototype/CLAUDE.md` for full details.

**No Python — anywhere.** This is a JavaScript/TypeScript repo; `.py` files must never be committed or merged into it. The upstream prototype ships helper scripts under `prototype/utils/*.py` (font merging, corruption fixes) that leak in when the `prototype/` folder is synced. When syncing the prototype or resolving a merge, **strip every `*.py` file** before committing. `.coderabbit.yaml` re-includes `**/*.py` (despite the `prototype/**` review exclusion) and flags any added/modified `.py` as a blocking issue so a stray script gets caught in review.

## src/crd — New UI Layer (shadcn/ui + Tailwind)

`src/crd/` is the presentational UI layer. Full conventions are in `src/crd/CLAUDE.md`.

**CRD is the only design system.** All client-facing features MUST be built in `src/crd/` (presentational components) with their integration glue in `src/main/crdPages/`. MUI/Emotion were fully removed (story #9885) — `@mui/*` and `@emotion/*` are uninstalled and must **never** be reintroduced.

The critical rules:

**Hard restrictions — every file in `src/crd/`:**
- **NO MUI** — zero imports from `@mui/*` or `@emotion/*`
- **NO business logic** — no imports from `@/core/apollo`, `@apollo/client`, `@/domain/*`, `@/core/auth/*`, `@/core/state/*`, `react-router-dom`, or `formik`
- **NO GraphQL types** — props must be plain TypeScript, never generated types
- **Styling is Tailwind only** — use `cn()` from `@/crd/lib/utils`, icons from `lucide-react`
- **Event handlers are props** — all `on*` handlers must be received as props; components never implement navigation, API calls, or any behavior internally. Links with `href` are fine; programmatic `window.location` or similar is not.
- **State is visual only** — `useState` for open/close, expanded, active tab. Nothing else.

**Structure:**
- `primitives/` — shadcn/ui atoms (button, card, dialog). Source: `prototype/src/app/components/ui/`
- `components/` — composites of primitives (PostCard, SpaceCard), organized by feature area
- `forms/` — form UI (inputs with labels/validation display), no form state libraries
- `layouts/` — page shells (PageLayout, TwoColumnLayout, ContentBlock)
- `styles/` — CSS tokens (`theme.css` from prototype) + Tailwind entry (`crd.css`)
- `lib/` — `cn()` utility
- `hooks/` — UI-only hooks (`useMediaQuery`)

Consumers in `src/main/crdPages/`, `src/domain/`, and `src/main/` map GraphQL data to crd component props. The data mapping never happens inside crd.

## CSS Strategy

Tailwind CSS (via `@tailwindcss/vite`) is loaded globally from `src/index.tsx` via `@/crd/styles/crd.css`; other global styles live in `src/index.css`. True CSS code-splitting is not feasible with Vite + Tailwind v4 — the CSS is processed at build time and bundled into the output regardless of where the import lives.

There is no second design system to isolate from: MUI/Emotion are removed, so there is no MUI `ThemeProvider`, no `useTheme()`, and no MUI CSS. The `.crd-root` class (which historically scoped Tailwind preflight/resets away from MUI pages) wraps the app; with MUI gone it is just the app root.

## CRD is the only runtime path

Every top-level route renders its `Crd*` page unconditionally — there is no toggle and no legacy MUI route tree. Story #9885 (epic #1888) removed the `designVersion` toggle machinery (`useCrdEnabled`, the design-version sync/upgrade hooks, the user-menu Design Version switch, the Sentry/APM `designVersion` tags) and deleted the entire legacy MUI app, then removed `@mui/*`/`@emotion/*` themselves. The only remaining trace is the server-side `UserSettings.designVersion` GraphQL field, which the client no longer reads.

The `Contributors` (`/contributors`) and `InnovationHubs` (`/innovation-hubs/*`) routes were product-dropped during the removal; `InnovationPacks` (`/innovation-packs/*`) was kept on its CRD pages.

## Recent Changes
- 111-remove-mui-library / story #9885: **MUI and Emotion fully removed (epic #1888 complete).** The `@mui/*` and `@emotion/*` packages are uninstalled, zero source files import them, the legacy `src/core/ui/` MUI design system and the `designVersion` toggle are deleted, and CRD (shadcn/ui + Tailwind) is the sole design system. Global styles consolidated into `src/index.css`. See `specs/111-remove-mui-library/mui-footprint-baseline.md` and `mui-removal-inventory.md`.
- 110-guest-whiteboard-notice: Added TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`) + shadcn/ui + Tailwind v4 + Radix UI (`@/crd/primitives/*`), `lucide-react` (icons), `react-i18next`. No new runtime dependencies.
- 105-create-space-dialog: Added TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`) + Apollo Client (generated hooks only); shadcn/ui + Tailwind v4 + Radix UI (`@/crd/primitives/*`); `lucide-react`; `react-i18next`; `yup` (validation on submit, decoupled from Formik). **No new runtime dependencies.**
- 103-innovation-library-pagination: Added TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`) + Apollo Client (generated hooks only, per constitution III); shadcn/ui + Tailwind v4 (CRD layer); `react-i18next`; `lucide-react`. All existing — **no new runtime dependencies**.


## Active Technologies
- TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`) + shadcn/ui + Tailwind v4 + Radix UI (`@/crd/primitives/*`), `lucide-react` (icons), `react-i18next`. No new runtime dependencies. (110-guest-whiteboard-notice)
- Browser `sessionStorage` (`alkemio_guest_name`, `alkemio_guest_whiteboard_url`) — existing keys, unchanged. No backend, no GraphQL. (110-guest-whiteboard-notice)
