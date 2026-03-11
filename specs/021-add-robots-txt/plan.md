# Implementation Plan: Add robots.txt to the Platform

**Branch**: `021-add-robots-txt` | **Date**: 2026-03-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-add-robots-txt/spec.md`

## Summary

Add environment-aware `robots.txt` to the platform. Production crawling rules are committed directly as `public/robots.txt` (comprehensive rules: AI/LLM scraper blocking, aggressive SEO bot blocking, sensitive path disallows). At container startup, `env.sh` checks `VITE_ROBOTS_ALLOW_INDEXING` (injected from K8s/Helm); if not `true`, it overwrites `robots.txt` with disallow-all (fail-safe default). The same Docker image serves all environments — only the runtime env var differs.

## Technical Context

**Language/Version**: TypeScript / Node.js 22 (build script is vanilla ESM JS) + `dotenv-flow`, `dotenv-expand` (already used by `buildConfiguration.js`); no new dependencies required
**Storage**: N/A — static file committed to `public/robots.txt`, overridden at runtime by `env.sh`
**Testing**: Vitest (9 unit tests verifying production robots.txt content)
**Target Platform**: Web (all deployment environments)
**Project Type**: Web SPA (Vite + React)
**Performance Goals**: N/A — static file served by web server / CDN
**Constraints**: Must follow RFC 9309 (Robots Exclusion Protocol); fail-safe to disallow-all
**Scale/Scope**: Touches 4 files, adds ~30 lines of infrastructure logic

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                   | Status   | Notes                                                                                        |
| ------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| I. Domain-Driven Frontend Boundaries        | **PASS** | No domain logic involved; this is static file + container startup infrastructure (`env.sh`). |
| II. React 19 Concurrent UX Discipline       | **N/A**  | No React components touched.                                                                 |
| III. GraphQL Contract Fidelity              | **N/A**  | No GraphQL changes.                                                                          |
| IV. State & Side-Effect Isolation           | **PASS** | Static committed file + container startup override; no application runtime side effects.     |
| V. Experience Quality & Safeguards          | **PASS** | No interactive elements; accessibility N/A.                                                  |
| Architecture Standard 4 (Build determinism) | **PASS** | Production content committed directly; runtime override is environment-aware via `env.sh`.   |
| Engineering Workflow 1 (Planning docs)      | **PASS** | This plan documents affected contexts and confirms no violations.                            |

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
.build/docker/env.sh                               # Runtime override: if VITE_ROBOTS_ALLOW_INDEXING != true, overwrite robots.txt with disallow-all
.build/.nginx/nginx.conf                           # No-cache location block for /robots.txt with default_type text/plain
vite.config.mjs                                    # /robots.txt in no-cache routes + Content-Type fix

# Files added
public/robots.txt                                  # Committed production crawling rules (not gitignored)
src/domain/platform/__tests__/robotsTxt.test.ts    # 9 unit tests verifying production robots.txt content
```

**Structure Decision**: Production robots.txt is committed directly as `public/robots.txt` — no build-time generation, no template indirection. At container startup, `env.sh` (which already regenerates `env-config.js`) checks `VITE_ROBOTS_ALLOW_INDEXING` (injected from K8s/Helm). If not `true`, it overwrites `robots.txt` with disallow-all. The same Docker image serves all environments — only the runtime env var differs, matching the existing `VITE_APP_ALKEMIO_DOMAIN` pattern.

## Complexity Tracking

No constitution violations — table not applicable.
