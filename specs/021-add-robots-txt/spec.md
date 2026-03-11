# Feature Specification: Add robots.txt to the Platform

**Feature Branch**: `021-add-robots-txt`
**Created**: 2026-03-11
**Status**: Draft
**Input**: User description: "Add robots.txt with environment-aware crawling rules per [#9401](https://github.com/alkem-io/client-web/issues/9401)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Engine Crawler Visits Production (Priority: P1)

A search engine crawler (Google, Bing, etc.) visits the Alkemio production platform and requests `/robots.txt`. The crawler receives a valid robots.txt file with rules that allow indexing of public content, helping the platform appear in search results.

**Why this priority**: This is the primary reason for the feature. Without a robots.txt on production, crawlers have no guidance on what to index, and the platform generates 404 errors logged in Sentry.

**Independent Test**: Can be fully tested by requesting `/robots.txt` on production and verifying the response contains valid allow/disallow directives with a 200 status code.

**Acceptance Scenarios**:

1. **Given** the platform is running in production, **When** a crawler requests `/robots.txt`, **Then** it receives a 200 response with a valid robots.txt containing rules that allow crawling of public content.
2. **Given** the platform is running in production, **When** a crawler requests `/robots.txt`, **Then** the response content type is `text/plain`.
3. ~~**Given** the platform is running in production, **When** a crawler reads the robots.txt, **Then** it finds a reference to the sitemap location.~~ *Deferred — no sitemap exists yet; directive will be added when a sitemap is implemented.*

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

- What happens when the environment configuration is missing or undefined? See FR-007 (fail-safe disallow-all).
- What happens if a crawler requests `/robots.txt` with unusual casing (e.g., `/Robots.txt`)? Standard web servers handle this based on filesystem case sensitivity; no special handling needed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The platform MUST serve a valid robots.txt file at the `/robots.txt` URL path on all environments.
- **FR-002**: On production environments, the robots.txt MUST allow crawling of public content while explicitly disallowing `/admin`. The identity logic resides on a separate subdomain and is not handled by this robots.txt.
- **FR-003**: On non-production environments (development, staging, test, and any other non-production environment), the robots.txt MUST disallow all crawling by all user agents.
- **FR-004**: The robots.txt MUST follow the [Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html) standard format.
- **FR-005**: The robots.txt content MUST be generated at build time by `buildConfiguration.js` based on the `VITE_APP_ROBOTS_ALLOW_INDEXING` environment variable, producing a static `public/robots.txt` file. When the variable is `true`, production-style rules are generated; when absent or any other value, restrictive (disallow-all) rules are generated (fail-safe).
- **FR-006**: The robots.txt MUST be served with `text/plain` content type.
- **FR-007**: When the environment cannot be determined, the system MUST default to disallowing all crawling (fail-safe).

### Key Entities

- **robots.txt**: A plain text file served at the root URL that provides crawling directives to web crawlers. Key attributes: user-agent rules, allow/disallow directives, optional sitemap reference.
- **Environment**: The deployment context (production vs. non-production) that determines which robots.txt rules are served. Determined by existing environment configuration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All environments serve a valid robots.txt at `/robots.txt` returning a 200 status code.
- **SC-002**: Production robots.txt allows search engine crawlers to access public content.
- **SC-003**: Non-production robots.txt blocks all search engine crawling completely.
- **SC-004**: Sentry 404 errors for `/robots.txt` drop to zero after deployment.
- **SC-005**: The robots.txt file is valid according to the Robots Exclusion Protocol standard (can be verified with Google's robots.txt testing tool).

## Clarifications

### Session 2026-03-11

- Q: Should robots.txt content be determined at build time or runtime? → A: Build-time generation via `buildConfiguration.js`, producing a static `public/robots.txt` based on env vars.
- Q: Should production robots.txt allow all paths or disallow specific private routes? → A: Allow all but explicitly disallow `/admin`. The identity subdomain is separate and not handled by client-web robots.txt.
- Q: What is the complete list of paths to disallow on production? → A: Only `/admin`. The identity logic lives on a separate subdomain (not a path), so `/identity` is not relevant. No other private paths need disallowing.
- Q: Which env var should determine production vs non-production? → A: New `VITE_APP_ROBOTS_ALLOW_INDEXING=true`, set only in production CI/CD; absent = disallow-all (fail-safe).
- Q: Should production robots.txt include a Sitemap directive? → A: No, omit for now; add when a sitemap is implemented.

## Assumptions

- A new `VITE_APP_ROBOTS_ALLOW_INDEXING` environment variable will be introduced. It is set to `true` only in production CI/CD; absent or any other value defaults to disallow-all (fail-safe).
- Production robots.txt allows public content but explicitly disallows only `/admin`. Identity logic is on a separate subdomain and not governed by this file.
- No `Sitemap:` directive will be included in the initial robots.txt. It will be added when a sitemap is implemented.
- The robots.txt will be a static file generated into the `public/` directory at build time by `buildConfiguration.js`, following the same pattern used for `public/env-config.js`.
