# Feature Specification: Add robots.txt to the Platform

**Feature Branch**: `021-add-robots-txt`
**Created**: 2026-03-11
**Status**: Implemented
**Input**: User description: "Add robots.txt with environment-aware crawling rules per [#9401](https://github.com/alkem-io/client-web/issues/9401)"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Search Engine Crawler Visits Production (Priority: P1)

A search engine crawler (Google, Bing, etc.) visits the Alkemio production platform and requests `/robots.txt`. The crawler receives a valid robots.txt file with rules that allow indexing of public content, helping the platform appear in search results.

**Why this priority**: This is the primary reason for the feature. Without a robots.txt on production, crawlers have no guidance on what to index, and the platform generates 404 errors logged in Sentry.

**Independent Test**: Can be fully tested by requesting `/robots.txt` on production and verifying the response contains valid allow/disallow directives with a 200 status code.

**Acceptance Scenarios**:

1. **Given** the platform is built with production indexing enabled (`VITE_ROBOTS_ALLOW_INDEXING=true`), **When** a crawler requests `/robots.txt`, **Then** it receives a 200 response with a valid robots.txt containing rules that allow crawling of public content.
2. **Given** the platform is running in production, **When** a crawler requests `/robots.txt`, **Then** the response content type is `text/plain`.
3. ~~**Given** the platform is running in production, **When** a crawler reads the robots.txt, **Then** it finds a reference to the sitemap location.~~ _Deferred — no sitemap exists yet; directive will be added when a sitemap is implemented._

---

### User Story 2 - Crawler Visits Non-Production Environment (Priority: P1)

A search engine crawler visits a non-production environment (development, staging, test) and requests `/robots.txt`. The crawler receives a robots.txt file that disallows all crawling, preventing non-production content from appearing in search results.

**Why this priority**: Equally critical because non-production environments being indexed can cause SEO pollution, confuse users, and expose test/development data.

**Independent Test**: Can be fully tested by requesting `/robots.txt` on a non-production environment and verifying the response disallows all crawling.

**Acceptance Scenarios**:

1. **Given** the platform is running in a non-production environment, **When** a crawler requests `/robots.txt`, **Then** it receives a 200 response with a robots.txt that disallows all paths for all user agents.
2. **Given** the platform is running in staging, **When** a crawler reads the robots.txt, **Then** the file contains `Disallow: /` for all user agents, blocking all crawling.

---

### User Story 3 - Eliminating Sentry 404 Errors (Priority: P2)

Platform operators monitoring Sentry no longer see 404 errors for `/robots.txt` requests, reducing noise in error tracking and improving signal-to-noise ratio for real issues.

**Why this priority**: This is a secondary benefit. The 404 errors are a symptom that will be resolved by implementing the robots.txt file.

**Independent Test**: Can be tested by verifying that after deployment, Sentry no longer logs 404 errors for `/robots.txt`.

**Acceptance Scenarios**:

1. **Given** the platform has robots.txt deployed, **When** any client requests `/robots.txt`, **Then** the server returns a 200 status code instead of 404.

---

### Edge Cases

- What happens when the environment configuration is missing or undefined? See FR-007 (fail-safe disallow-all). If `VITE_ROBOTS_ALLOW_INDEXING` is unset or any value other than `true`, `env.sh` overwrites robots.txt with disallow-all at container startup.
- What happens if a crawler requests `/robots.txt` with unusual casing (e.g., `/Robots.txt`)? Standard web servers handle this based on filesystem case sensitivity; no special handling needed.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The platform MUST serve a valid robots.txt file at the `/robots.txt` URL path on all environments.
- **FR-002**: On production environments, the robots.txt MUST allow crawling of public content while explicitly disallowing sensitive paths (`/admin`, `/identity`, `/restricted`, `/profile`), API endpoints (`/api/`, `/graphql`), and build artifacts (`/env-config.js`, `/meta.json`, `/assets/`). AI/LLM scrapers and aggressive SEO bots MUST be blocked entirely.
- **FR-003**: On non-production environments (development, staging, test, and any other non-production environment), the robots.txt MUST disallow all crawling by all user agents.
- **FR-004**: The robots.txt MUST follow the [Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html) standard format.
- **FR-005**: The production robots.txt content MUST be committed directly as `public/robots.txt`. At container startup, `env.sh` checks `VITE_ROBOTS_ALLOW_INDEXING` (injected from K8s/Helm); if not `true`, it overwrites `robots.txt` with disallow-all content. `buildConfiguration.js` has no robots.txt logic.
- **FR-006**: The robots.txt MUST be served with `text/plain` content type. Nginx is configured with `default_type text/plain` for the `/robots.txt` location. The Vite dev server preserves correct Content-Type for static file types.
- **FR-007**: When `VITE_ROBOTS_ALLOW_INDEXING` is unset or not `true` at container startup, `env.sh` MUST overwrite `robots.txt` with disallow-all content (fail-safe).
- **FR-008**: The robots.txt MUST be served with no-cache headers to ensure crawlers always receive the current version.

### Key Entities

- **robots.txt**: A plain text file served at the root URL that provides crawling directives to web crawlers. Key attributes: user-agent rules, allow/disallow directives, crawl-delay, optional sitemap reference.
- **Environment**: The deployment context (production vs. non-production) determined at container startup by `env.sh` checking `VITE_ROBOTS_ALLOW_INDEXING` (injected from K8s/Helm).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All environments serve a valid robots.txt at `/robots.txt` returning a 200 status code.
- **SC-002**: Production robots.txt allows search engine crawlers to access public content while blocking AI/LLM scrapers and aggressive bots.
- **SC-003**: Non-production robots.txt blocks all search engine crawling completely.
- **SC-004**: Sentry 404 errors for `/robots.txt` drop to zero after deployment.
- **SC-005**: The robots.txt file is valid according to the Robots Exclusion Protocol standard (can be verified with Google's robots.txt testing tool).

## Clarifications

### Session 2026-03-11

- Q: Should robots.txt content be determined at build time or runtime? → A: Runtime. `public/robots.txt` is committed with production content. At container startup, `env.sh` checks `VITE_ROBOTS_ALLOW_INDEXING`; if not `true`, it overwrites with disallow-all. `buildConfiguration.js` has no robots.txt logic.
- Q: Should production robots.txt allow all paths or disallow specific private routes? → A: Allow all but disallow `/admin`, `/identity`, `/restricted`, `/profile`, `/api/`, `/graphql`, and build artifacts (`/env-config.js`, `/meta.json`, `/assets/`).
- Q: What about AI/LLM scrapers? → A: Block them entirely with dedicated user-agent rules (GPTBot, ClaudeBot, CCBot, anthropic-ai, Google-Extended, Bytespider, PerplexityBot, Amazonbot, FacebookBot, Omgilibot, Diffbot, cohere-ai, ChatGPT-User).
- Q: What about aggressive SEO scrapers? → A: Block them entirely (AhrefsBot, SemrushBot, MJ12bot, DotBot, BLEXBot).
- Q: How is production vs non-production determined? → A: Runtime opt-in via `VITE_ROBOTS_ALLOW_INDEXING=true`, injected from K8s/Helm at container startup (matching the `VITE_APP_ALKEMIO_DOMAIN` pattern). Unset = disallow-all (fail-safe). `VITE_APP_*` naming was avoided to prevent DOM exposure via `window._env_`.
- Q: Should production robots.txt include a Sitemap directive? → A: No, omit for now; add when a sitemap is implemented.

## Assumptions

- `public/robots.txt` is committed directly with production content — not gitignored, not generated.
- Production is identified by `VITE_ROBOTS_ALLOW_INDEXING=true` at container startup (K8s/Helm runtime injection). When unset (or any non-`true` value), `env.sh` overwrites with disallow-all (fail-safe).
- Production robots.txt allows public content but disallows sensitive paths, API endpoints, build artifacts, AI/LLM scrapers, and aggressive SEO bots.
- No `Sitemap:` directive will be included in the initial robots.txt. It will be added when a sitemap is implemented.
- The same Docker image is used for all environments — only the runtime env var differs.
