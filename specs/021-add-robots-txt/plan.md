# Implementation Plan: Add robots.txt to the Platform

**Branch**: `021-add-robots-txt` | **Date**: 2026-03-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-add-robots-txt/spec.md`

## Summary

Add environment-aware `robots.txt` generation to the build pipeline. The `buildConfiguration.js` script will be extended to produce a static `public/robots.txt` at build time, driven by a new `VITE_APP_ROBOTS_ALLOW_INDEXING` environment variable. Production builds allow crawling with `/admin` disallowed; all other environments disallow everything (fail-safe).

## Technical Context

**Language/Version**: TypeScript / Node.js 22 (build script is vanilla ESM JS)
**Primary Dependencies**: `dotenv-flow`, `dotenv-expand` (already used by `buildConfiguration.js`); no new dependencies required
**Storage**: N/A — static file written to `public/robots.txt`
**Testing**: Vitest (unit test for the robots.txt generation logic)
**Target Platform**: Web (all deployment environments)
**Project Type**: Web SPA (Vite + React)
**Performance Goals**: N/A — static file served by web server / CDN
**Constraints**: Must follow RFC 9309 (Robots Exclusion Protocol); fail-safe to disallow-all
**Scale/Scope**: Minimal — touches 2-3 files, adds ~30 lines of build logic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | **PASS** | No domain logic involved; this is build infrastructure (`buildConfiguration.js`). |
| II. React 19 Concurrent UX Discipline | **N/A** | No React components touched. |
| III. GraphQL Contract Fidelity | **N/A** | No GraphQL changes. |
| IV. State & Side-Effect Isolation | **PASS** | Build-time file generation only; no runtime side effects. |
| V. Experience Quality & Safeguards | **PASS** | No interactive elements; accessibility N/A. |
| Architecture Standard 4 (Build determinism) | **PASS** | Static file generated deterministically from env var; documented here. |
| Engineering Workflow 1 (Planning docs) | **PASS** | This plan documents affected contexts and confirms no violations. |

**Gate result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/021-add-robots-txt/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Files modified
buildConfiguration.js          # Extended with robots.txt generation logic

# Files added
src/domain/platform/__tests__/robotsTxt.test.ts   # Unit test for generation logic
```

**Structure Decision**: This feature fits entirely within existing build infrastructure. The `buildConfiguration.js` script already generates `public/env-config.js` and `.build/docker/.env.base` from environment variables. Adding `public/robots.txt` generation follows the exact same pattern. No new directories or structural changes needed.

## Complexity Tracking

No constitution violations — table not applicable.
