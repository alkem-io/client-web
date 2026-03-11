# Research: Add robots.txt to the Platform

**Feature**: 021-add-robots-txt | **Date**: 2026-03-11

## 1. Build-time Generation Pattern

**Decision**: Extend `buildConfiguration.js` to generate `public/robots.txt` alongside `public/env-config.js`. Build always generates the production variant.

**Rationale**: The script already loads all `VITE_APP_*` environment variables via `dotenv-flow`, writes to `public/`, and runs before every `build` and `start` command (see `package.json` scripts). Adding robots.txt generation here requires zero new infrastructure.

**Alternatives considered**:
- **Vite plugin**: Would require a custom plugin; more complex than a simple `writeFile` call in existing script.
- **Committed static file**: Simpler but not generated/testable; drift risk if content needs updating.
- **Multiple static files with conditional copy**: Error-prone; generation is cleaner and matches existing patterns.

## 2. Environment Detection Mechanism

**Decision**: Runtime domain detection via `env.sh`. At container startup, check `VITE_APP_ALKEMIO_DOMAIN`; if not `https://alkem.io`, overwrite robots.txt with restrictive rules.

**Rationale**: This allows the same Docker image to work for any environment. The production domain is the single source of truth — no additional env vars or build args needed. Fail-safe: any unknown or missing domain defaults to blocking all crawlers.

**Alternatives considered**:
- **`VITE_APP_ROBOTS_ALLOW_INDEXING` env var**: Required explicit opt-in per environment. Replaced by domain detection which is implicit and less error-prone.
- **Docker build arg**: Would bake the decision into the image, preventing a single image from serving multiple environments.
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

**Rationale**: Since `env.sh` can change robots.txt at container startup, caching could serve stale content. Aggressive no-cache ensures crawlers always get the current rules.

## 6. Testing Strategy

**Decision**: Extract the robots.txt content generation into a pure function (`generateRobotsTxt`), unit-test it with Vitest. 13 tests covering both production and restrictive variants.

**Production tests**: User-agent, Allow, Disallow for sensitive paths, API endpoints, build artifacts, crawl-delay, AI bot blocking, SEO bot blocking.
**Non-production tests**: User-agent, Disallow: /, no Allow directives, no AI bot rules.

**Alternatives considered**:
- **Integration test with actual file system**: Overkill for a string template function.
- **E2E test requesting /robots.txt**: Valuable but requires deployed environment; can be done as part of manual QA or CI smoke test.

## 7. .gitignore Consideration

**Decision**: Add `public/robots.txt` to `.gitignore`.

**Rationale**: Generated files should not be committed. Existing patterns: `public/meta.json` is explicitly listed in `.gitignore` (line 17), and `public/env-config.js` is covered by the glob `public/*config.js` (line 34). Adding `/public/robots.txt` explicitly follows the `meta.json` pattern.
