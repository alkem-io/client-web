# Tasks: Add robots.txt to the Platform

**Input**: Design documents from `/specs/021-add-robots-txt/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included — 9 Vitest unit tests verifying production robots.txt content.

**Organization**: Tasks are grouped by phase. All tasks completed.

---

## Phase 1: Static File (Committed Production robots.txt)

**Purpose**: Commit the production robots.txt directly to the repository

- [x] T001 Create `public/robots.txt` with comprehensive production crawling rules: global `Allow: /` with sensitive path disallows (`/admin`, `/identity`, `/restricted`, `/profile`), API endpoint disallows (`/api/`, `/graphql`), build artifact disallows (`/env-config.js`, `/meta.json`, `/assets/`), `Crawl-delay: 1`, AI/LLM scraper blocking (GPTBot, ClaudeBot, CCBot, etc.), and aggressive SEO bot blocking (AhrefsBot, SemrushBot, etc.)

---

## Phase 2: Runtime Environment Override

**Purpose**: Override robots.txt at container startup for non-production environments

- [x] T002 Add runtime override logic to `.build/docker/env.sh` — after `env-config.js` generation, check `VITE_ROBOTS_ALLOW_INDEXING`; if not `true`, overwrite `robots.txt` with restrictive disallow-all rules. Production sets `VITE_ROBOTS_ALLOW_INDEXING=true` via K8s/Helm env var injection (matching the existing `VITE_APP_ALKEMIO_DOMAIN` pattern). Fail-safe: any missing or non-`true` value defaults to blocking all crawlers.

---

## Phase 3: Infrastructure (Nginx + Vite Dev Server)

**Purpose**: Ensure correct Content-Type and caching behavior

- [x] T003 Add no-cache nginx location block for `/robots.txt` in `.build/.nginx/nginx.conf` — matching the existing `meta.json` and `env-config.js` pattern, with `default_type text/plain`
- [x] T004 Add `/robots.txt` to the Vite dev server no-cache route list in `vite.config.mjs`
- [x] T005 Fix Vite dev server Content-Type override in `vite.config.mjs` — only set `text/html; charset=utf-8` for routes without file extensions or `.html` files, preserving correct Content-Type for static files like `.txt`, `.json`, `.js`

---

## Phase 4: Tests

**Purpose**: Unit tests for production robots.txt content

- [x] T006 Write 9 unit tests in `src/domain/platform/__tests__/robotsTxt.test.ts` covering: User-agent, Allow, admin/sensitive path disallows, API endpoint disallows, build artifact disallows, crawl-delay, AI bot blocking, SEO bot blocking. Tests read `public/robots.txt` directly.

---

## Phase 5: Validation

**Purpose**: Final validation

- [x] T007 Run all unit tests with `pnpm vitest run` and verify 9/9 pass
- [x] T008 Run `pnpm lint` to verify no linting issues were introduced

---

## Notes

- `public/robots.txt` is committed directly — no build-time generation, no separate template file
- `buildConfiguration.js` has no robots.txt logic; the file is static
- `env.sh` handles environment-awareness at container startup: overwrites with disallow-all when `VITE_ROBOTS_ALLOW_INDEXING != true`
- `VITE_ROBOTS_ALLOW_INDEXING` is injected at runtime (K8s/Helm), matching the `VITE_APP_ALKEMIO_DOMAIN` pattern — no Docker ARG needed
- Same Docker image works for all environments — runtime env var controls behaviour
- Local dev always sees production content (harmless; no `env.sh` runs locally)
