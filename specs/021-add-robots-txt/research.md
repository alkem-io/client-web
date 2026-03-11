# Research: Add robots.txt to the Platform

**Feature**: 021-add-robots-txt | **Date**: 2026-03-11

## 1. Static File Approach

**Decision**: Commit `public/robots.txt` directly with production content. No build-time generation.

**Rationale**: The simplest possible approach — a committed static file served by both Vite dev server and nginx. No build script involvement, no template indirection. SEO/product teams can update crawling rules by editing the file directly. Non-production environments are handled at container startup by `env.sh` (see section 2).

**Alternatives considered**:

- **Build-time generation via `buildConfiguration.js`**: Earlier design had a `generateRobotsTxt()` function and `ROBOTS_PRODUCTION_TEMPLATE` constant. Superseded — unnecessary complexity when a committed file works and `env.sh` handles the runtime override.
- **Separate template file (`robots.production.txt`) + copy logic**: Earlier design committed a template at repo root and had `buildConfiguration.js` copy it to `public/`. Superseded — extra indirection with no benefit over committing `public/robots.txt` directly.
- **Vite plugin**: Would require a custom plugin; more complex than a static file.
- **Multiple static files with conditional copy**: Error-prone; static file + runtime override is cleaner.

## 2. Environment Detection Mechanism

**Decision**: Runtime override via `env.sh` at container startup. The committed `public/robots.txt` contains production content. When `VITE_ROBOTS_ALLOW_INDEXING` is not `true` (unset or any other value), `env.sh` overwrites `robots.txt` with disallow-all — the fail-safe default.

**Rationale**: Follows the existing pattern for runtime environment configuration. `VITE_ROBOTS_ALLOW_INDEXING` is injected from K8s/Helm at container runtime, matching how `VITE_APP_ALKEMIO_DOMAIN` and other environment variables flow. The same Docker image works for all environments — only the runtime env var differs. Production sets `VITE_ROBOTS_ALLOW_INDEXING=true` in its K8s/Helm configuration.

**Alternatives considered**:

- **Build-time opt-in via Docker ARG**: Earlier design used `ARG ARG_ROBOTS_ALLOW_INDEXING` in Dockerfile and `ENV VITE_ROBOTS_ALLOW_INDEXING`. Superseded — inconsistent with how other variables (`VITE_APP_ALKEMIO_DOMAIN`) flow via K8s/Helm runtime injection. Would require separate Docker images per environment.
- **Domain detection via `VITE_APP_ALKEMIO_DOMAIN`**: Implicit environment identity; fragile if domains change.
- **Reuse `NODE_ENV`**: Too coarse — `NODE_ENV=production` is used for build optimizations, not deployment target.
- **`VITE_APP_ENVIRONMENT` string matching**: More complex parsing; introduces risk of typos in environment names.

## 3. robots.txt Content (RFC 9309 Compliance)

**Decision**: Two variants:

### Production (domain = https://alkem.io)

Comprehensive rules covering:

- **Global rules**: `Allow: /` with specific disallows for `/admin`, `/identity`, `/restricted`, `/profile`, `/api/`, `/graphql`, `/env-config.js`, `/meta.json`, `/assets/`
- **Crawl-delay**: `Crawl-delay: 1` for polite crawling
- **AI/LLM scrapers**: Blocked entirely (GPTBot, ChatGPT-User, Google-Extended, CCBot, anthropic-ai, ClaudeBot, Bytespider, PerplexityBot, Amazonbot, FacebookBot, Omgilibot, Diffbot, cohere-ai)
- **Aggressive SEO bots**: Blocked entirely (AhrefsBot, SemrushBot, MJ12bot, DotBot, BLEXBot)

### Non-production (default)

```text
# Non-production environment - block all crawlers
User-agent: *
Disallow: /
```

**Rationale**:

- Production allows public paths but blocks sensitive areas, API endpoints, build artifacts, AI scrapers, and aggressive bots.
- Non-production blocks everything to prevent SEO pollution.
- No `Sitemap:` directive per spec — deferred until sitemap exists.
- Format follows RFC 9309: `User-agent` directive followed by `Allow`/`Disallow` directives.
- AI bot blocking follows industry practice (NYT, Reddit, Stack Overflow, etc.).

## 4. Content Type Handling

**Decision**: Explicit handling at both nginx and Vite dev server levels.

**Implementation**:

- **Nginx**: Dedicated `location = /robots.txt` block with `default_type text/plain` ensures correct Content-Type in production.
- **Vite dev server**: Fixed Content-Type override that was forcing `text/html` on all no-cache routes. Now only sets `text/html` for routes without file extensions or `.html` files.

## 5. Caching Strategy

**Decision**: No-cache headers for robots.txt at all levels.

**Implementation**:

- **Nginx**: `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0` + `Pragma: no-cache` + `Expires: 0`
- **Vite dev server**: `/robots.txt` added to the no-cache route list

**Rationale**: The file may be overwritten at container startup by `env.sh` for non-production environments. No-cache ensures crawlers always get the current rules and that re-deployments (with potentially different `VITE_ROBOTS_ALLOW_INDEXING`) are reflected immediately.

## 6. Testing Strategy

**Decision**: One test suite in Vitest. 9 tests total.

**Production content suite** (`production (public/robots.txt)`): Reads the committed `public/robots.txt` file using `fs.readFileSync`. Tests verify `Allow: /`, all sensitive path `Disallow` directives, API endpoint disallows, build artifact disallows, AI bot blocking, SEO bot blocking, and crawl-delay against the actual committed file. This means the tests catch unintended changes to the production content.

**Alternatives considered**:

- **Testing `generateRobotsTxt()` function**: Earlier design had a separate non-production test suite for the disallow-all generator function. No longer applicable — there is no generator function; `env.sh` handles non-production override at runtime.
- **Integration test with actual file system**: Overkill for verifying static file content.
- **E2E test requesting /robots.txt**: Valuable but requires deployed environment; can be done as part of manual QA or CI smoke test.

## 7. Version Control Consideration

**Decision**: Commit `public/robots.txt` directly — not gitignored.

**Rationale**: The file is a static committed artifact, not a generated build output. It should be version-controlled so that changes are tracked, reviewed, and auditable. There is no build-time generation step that would make it a disposable artifact.

**Alternatives considered**:

- **Gitignore `public/robots.txt`** (earlier design): Was appropriate when `buildConfiguration.js` generated the file at build time. No longer applicable since the file is static and committed.
