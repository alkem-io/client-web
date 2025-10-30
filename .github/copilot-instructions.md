<!-- Implements constitution & agents.md. Does not introduce new governance. -->

# Alkemio Client Web – Agent Guide

## Overview

- React + TypeScript single-page app served by Vite; design system built on MUI and Emotion, GraphQL data layer via Apollo Client.
- Repository is large (≈18k modules built); main work happens under `src/core`, `src/domain`, and `src/main`. GraphQL documents live alongside features and generate strongly-typed hooks in `src/core/apollo/generated`.
- Requires Node ≥20.9.0 and pnpm ≥10.17.1 (workspace is pinned to Node 20.15.1 via Volta). Always use pnpm; the lockfile is authoritative.

## Governance & Workflow

- Specification-Driven Development is mandatory for feature work. Read `[.specify/memory/constitution.md](../.specify/memory/constitution.md)` first; it defines quality gates, module boundaries, and testing expectations.
- Artifacts live under `specs/<NNN-slug>/` (plan, spec, checklist, tasks). Follow the canonical progression: `/spec` → `/clarify` → `/plan` → `/checklist` → `/tasks` → `/implement` → `/stabilize` → `/done`.
- Classify work per [`agents.md`](../agents.md): default to the Agentic path for scoped changes (≤ ~400 LOC with known outcomes) and escalate to Full SDD when contracts, migrations, or high ambiguity enter the picture.

## Environment & Tooling

- Bootstrap with `pnpm install` (clean run in ~5s);
- Project expects `.env` (checked in) to exist; override locally in `.env.local`. `buildConfiguration.js` reads `VITE_APP_*` variables, writes `.build/docker/.env.base`, and regenerates `public/env-config.js` before dev/build commands.
- Dev server: `pnpm start` (Vite on `localhost:3001`) assumes a Traefik reverse proxy exposing backend services on `http://localhost:3000`. Without the backend, UI shells load but GraphQL calls fail.
- Path alias `@` resolves to `src`. ESLint + TypeScript enforce single quotes, semicolons, and React function components.

## Build & Validation Workflow

- **Bootstrap**: `pnpm install`
  - Prereqs: Node 20+, pnpm 10+. No extra services needed. Warns about skipped build scripts; safe to ignore for CI parity.
- **Development server**: `pnpm start`
  - Prereqs: Backend Alkemio server reachable at `VITE_APP_ALKEMIO_DOMAIN` (default `http://localhost:3000`). Regenerates `public/env-config.js` each run.
- **Production build**: `pnpm build`
  - Prereqs: .env values set. Takes ~20s, outputs to `build/`. Rewrites `.build/docker/.env.base` and `public/env-config.js`—avoid committing those artifacts.
- **Lint**: `pnpm lint`
  - Runs `tsc --noEmit` then ESLint over `src/**/*.ts(x)`. Succeeds cleanly on current HEAD; expect failures if types break.
- **Unit tests**: `pnpm vitest run --reporter=basic`
  - Vitest default is interactive watch; append `--watch=false` to exit automatically. Execution (~1.2s) passes 19 files / 247 tests; one UI spec is explicitly skipped. Use `--coverage.enabled` flags only when needed (`pnpm test:coverage`).
- **GraphQL codegen**: `pnpm codegen`
  - Requires the Alkemio GraphQL API at `http://localhost:3000/graphql` or update `codegen.yml`. Runs ESLint + Prettier on generated files via hooks.
- **Formatting**: `pnpm format` (Prettier over `src/**/*.ts{,x}`) and `pnpm lint:fix` for autofixes.
- **Serve built assets**: `pnpm serve:dev` (serves `build/` on port 3001).
- Optional: `pnpm analyze` (source-map-explorer) after `pnpm build` for bundle insights.

_Observed behavior (Oct 2025): all commands above complete without manual tweaks; production build warns about large chunks (known, non-blocking)._

## Project Layout & Architecture

- `src/index.tsx` boots the app and registers `src/serviceWorker.ts` for version notifications (no offline caching).
- `src/root.tsx` wires global providers: Sentry, Elastic APM, Apollo (private/public endpoints from `src/main/constants/endpoints.ts`), authentication, global state, theming, routing (`TopLevelRoutes`). Inter-app notifications, pending membership dialogs, and version handling live here.
- `src/core`: reusable infrastructure (analytics, Apollo client setup, auth, routing utilities, global XState machines, UI building blocks, common utils). Generated GraphQL schema/hooks under `src/core/apollo/generated/`—they are large; search for specific types instead of opening the files wholesale.
- `src/domain`: domain-driven slices (e.g., `space`, `innovationHub`, `community`). Each slice typically contains GraphQL documents, hooks, pages/views, and supporting logic grouped by business concepts.
- `src/main`: app-specific shells (routing, layouts, in-app notifications, admin surfaces) and environment helpers (`env.ts`, `versionHandling.tsx`).
- `public/`: static assets, service worker, generated `meta.json` (via `build-utils.mjs`) used for version comparison.
- `docs/`: developer guides (code guidelines, service worker handling, setup expectations) worth skimming when changing architecture-sensitive areas.
- Tooling/config roots:
  - `vite.config.mjs`, `vite.sentry.config.mjs` – build config (Sentry variant enables release uploads via `pnpm build:sentry`).
  - `eslint.config.mjs`, `.prettierrc.yml`, `.lintstagedrc.json` – lint/format rules (git pre-commit via Husky runs lint-staged).
  - `.scripts/fix-dev-vite.sh` – bumps inotify limits if dev server file watching becomes unstable on Linux.
  - `codegen.yml` – GraphQL codegen mapping and scalars.
  - `tsconfig.json` – strict TS config with JSX transform.

## Continuous Integration & Quality Gates

- GitHub Actions workflows (`.github/workflows/`):
  - `build-deploy-k8s-*-hetzner.yml` build Docker images on push or dispatch and deploy to Hetzner clusters (dev automatically on `develop`, sandbox/test on manual trigger). They assume Docker registry credentials and kubectl setup.
  - `build-release-docker-hub.yml` publishes images to DockerHub on tagged releases.
- CI effectively enforces: successful Docker build, passing TypeScript + ESLint, and working Vite build. Matching local steps (lint, vitest, build) before PR keeps pipelines green. Husky pre-commit mirrors lint-staged formatting, so run `pnpm lint` and `pnpm vitest run --reporter=basic` prior to staging changes.

## Practical Tips & Gotchas

- Always prefer **MCP server tools** when possible.
  - Fall back to direct terminal or console commands only if no MCP capability exists or is insufficient.
  - Use the most specific MCP server before any generic one.
    - Priority order:
      1. Domain-specific MCP servers (`github`, `context7`, `fetch`)
      2. Generic web search MCP servers (`tavily`, `brave`)
    - Selection rules:
      - Requests involving `https://github.com/alkem-io/` → use **GitHub MCP**.
      - Use **Context7 MCP** for factually correct or verified information before falling back to search MCPs.
      - Use **Tavily** or **Brave** only when developer documentation is unavailable elsewhere.
    - Examples:
      - “List open PRs in alkem-io/server” → **GitHub MCP**
      - "How do I use the useSWR hook with TypeScript in a Next.js application, specifically for data fetching with client-side caching and revalidation, according to the latest SWR documentation?" → Context7 MCP, fallback to Tavily
- Feedback Loops:
  - Prefer MCP servers supporting **feedback and validation** (e.g., GitHub comments, Context7 evaluation).
  - Use them to cross-check and refine responses before completion.
- For Git operations, **all commits must be signed**.
- Always regenerate types after editing `.graphql` files with `pnpm codegen`; commit generated outputs. Codegen fetches schema from a running server—if offline, set `GRAPHQL_SCHEMA_URL` via env or adjust `codegen.yml` temporarily.
- New env vars must be prefixed with `VITE_APP_` to be exposed. For runtime injection, ensure they flow through `.env` and `buildConfiguration.js` so they end up in `public/env-config.js` and `window._env_`.
- React components should remain function-based; hooks live close to their domain. Follow `docs/code-guidelines.md` for naming (PascalCase components, `camelCase` hooks) and folder placement (`src/domain/<entity>`).
- Large build output can consume memory; Vite already raises `max-old-space-size`. If builds fail on low-memory runners, reuse the same command but consider pruning node_modules (`pnpm prune` shortcut).
- If Vite dev server stops responding due to file watch limits on Linux, run `.scripts/fix-dev-vite.sh` (requires sudo) to raise inotify limits; restart the terminal afterward.
- Do not edit generated artifacts in `build/` or `public/env-config.js` manually—run the appropriate scripts instead.

## Search Guidance

- Treat this document as the source of truth for setup, build, and layout. Only fall back to searching the repo when information here is insufficient or demonstrably outdated.
