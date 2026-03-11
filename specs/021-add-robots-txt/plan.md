# Implementation Plan: Add robots.txt to the Platform

**Branch**: `021-add-robots-txt` | **Date**: 2026-03-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-add-robots-txt/spec.md`

## Summary

Add environment-aware `robots.txt` generation to the platform. The `buildConfiguration.js` script generates a comprehensive production `public/robots.txt` at build time (blocking AI/LLM scrapers, aggressive SEO bots, and sensitive paths). At container startup, `env.sh` checks `VITE_APP_ALKEMIO_DOMAIN` and overwrites with restrictive rules for non-production domains. This allows the same Docker image to serve correct robots.txt on any environment.

## Technical Context

**Language/Version**: TypeScript / Node.js 22 (build script is vanilla ESM JS)
**Primary Dependencies**: `dotenv-flow`, `dotenv-expand` (already used by `buildConfiguration.js`); no new dependencies required
**Storage**: N/A — static file written to `public/robots.txt`
**Testing**: Vitest (13 unit tests for the robots.txt generation logic)
**Target Platform**: Web (all deployment environments)
**Project Type**: Web SPA (Vite + React)
**Performance Goals**: N/A — static file served by web server / CDN
**Constraints**: Must follow RFC 9309 (Robots Exclusion Protocol); fail-safe to disallow-all
**Scale/Scope**: Touches 6 files, adds ~80 lines of build/infrastructure logic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | **PASS** | No domain logic involved; this is build infrastructure (`buildConfiguration.js`) and container startup (`env.sh`). |
| II. React 19 Concurrent UX Discipline | **N/A** | No React components touched. |
| III. GraphQL Contract Fidelity | **N/A** | No GraphQL changes. |
| IV. State & Side-Effect Isolation | **PASS** | Build-time file generation + container startup override; no application runtime side effects. |
| V. Experience Quality & Safeguards | **PASS** | No interactive elements; accessibility N/A. |
| Architecture Standard 4 (Build determinism) | **PASS** | Production content generated deterministically at build time; runtime override is environment-aware. |
| Engineering Workflow 1 (Planning docs) | **PASS** | This plan documents affected contexts and confirms no violations. |

**Gate result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/021-add-robots-txt/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Files modified
buildConfiguration.js                              # Extended with generateRobotsTxt() and build-time generation
.build/docker/env.sh                               # Runtime override for non-production domains
.build/.nginx/nginx.conf                           # No-cache location block for /robots.txt
vite.config.mjs                                    # /robots.txt in no-cache routes + Content-Type fix
.gitignore                                         # Added /public/robots.txt

# Files added
src/domain/platform/__tests__/robotsTxt.test.ts    # 13 unit tests for generation logic
```

**Structure Decision**: This feature combines build infrastructure with container startup logic. `buildConfiguration.js` generates the production robots.txt (following the existing `public/env-config.js` pattern). `env.sh` (which already runs at container startup to regenerate `env-config.js`) now also overrides robots.txt for non-production domains. This enables a single Docker image to serve correct content on any environment.

## Complexity Tracking

No constitution violations — table not applicable.
