# Feature Specification: Per-Entity URL Resolver

**Feature Branch**: `023-per-entity-url-resolver`
**Created**: 2026-03-16
**Status**: Draft
**Input**: Replace monolithic UrlResolverProvider with per-entity nameId resolution hooks. Separate route parsing (client), nameId-to-ID translation (auth-free lookupByName), and permission checking (entity queries). Enable non-blocking page rendering with skeleton states instead of full-page loading spinners.

## Clarifications

### Session 2026-03-18

- Q: Can the server be fully detached from route knowledge? → A: No. The server has two URL services: a **parser** (`url.resolver.service.ts`, 1100 lines) and a **generator** (`url.generator.service.ts`, 1250 lines). Only the parser is removed. The generator produces `profile.url` (a computed field used in 156+ client locations for navigation) and must continue generating valid URLs with nameIds. Route segment names (e.g., `/challenges/`, `/collaboration/`) remain shared between server generator and client routes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Faster Page Load with Skeleton States (Priority: P1)

As a platform user navigating to any entity page (space, organization, user profile, virtual contributor, etc.), I want to see the page layout and navigation immediately with skeleton placeholders, rather than staring at a full-page loading spinner while the system resolves URL identifiers.

**Why this priority**: This is the primary user-facing improvement. Currently, every navigation to a nameId-based URL blocks rendering entirely until the server resolves the full URL. Users perceive the platform as slow because they see nothing but a spinner during resolution. Showing the layout shell immediately makes the platform feel responsive.

**Independent Test**: Can be tested by navigating to any space URL and observing that the page layout (navigation bar, breadcrumb area, banner area) renders immediately with skeleton placeholders, with content filling in progressively as data loads.

**Acceptance Scenarios**:

1. **Given** a user navigates to a space URL (e.g., `/my-space`), **When** the page begins loading, **Then** the page layout (navigation, breadcrumb area, banner area, content area) renders immediately with skeleton placeholders instead of a full-page spinner.
2. **Given** a user navigates to a subspace URL (e.g., `/my-space/challenges/my-subspace`), **When** the page begins loading, **Then** the parent space layout renders with skeleton states while the subspace data resolves.
3. **Given** a user navigates to an organization, user profile, or virtual contributor page, **When** the page begins loading, **Then** the page layout renders immediately with skeleton states for data-dependent areas.
4. **Given** a user navigates between pages within the same space, **When** returning to a previously visited entity, **Then** the page renders instantly from cached data without any skeleton states or spinners.

---

### User Story 2 - Correct Access Control for Restricted Spaces (Priority: P1)

As a user without read access to a space, I want to be redirected to the space's About page. As an unauthenticated user accessing a private space, I want to be redirected to the login page with my intended destination preserved.

**Why this priority**: Access control is a core security requirement. The current system handles permissions during URL resolution on the server. The new system must maintain identical access control behavior while moving permission checks to entity-level queries.

**Independent Test**: Can be tested by accessing a space URL as different user types (anonymous, authenticated without read access, authenticated with read access) and verifying correct behavior in each case.

**Acceptance Scenarios**:

1. **Given** an authenticated user without read access to a space, **When** they navigate to the space's main page, **Then** they are redirected to the space's About page (public information).
2. **Given** an unauthenticated user, **When** they navigate to a private space URL, **Then** they are redirected to the login page with the original URL preserved as a return URL.
3. **Given** a user with read access to a space, **When** they navigate to the space's main page, **Then** they see the full space content (dashboard, community, subspaces, etc.).
4. **Given** a user navigates to a subspace they cannot read but can read the parent space, **When** the page loads, **Then** they are redirected to the subspace's About page while the parent space context remains accessible.
5. **Given** an authenticated user navigates to a space that returns a "forbidden" response, **When** there is a closest accessible ancestor, **Then** the user sees a redirect dialog pointing to the ancestor space.

---

### User Story 3 - Handling Non-Existent URLs (Priority: P2)

As a user who navigates to a URL with an invalid nameId (e.g., a deleted space, a mistyped URL), I want to see a clear "not found" message with a helpful redirect to the nearest accessible ancestor.

**Why this priority**: Graceful error handling for invalid URLs is essential for usability but is less critical than core rendering and access control.

**Independent Test**: Can be tested by navigating to URLs with non-existent nameIds and verifying the error page and redirect behavior.

**Acceptance Scenarios**:

1. **Given** a user navigates to a URL with a non-existent entity nameId (e.g., `/nonexistent-space`), **When** the lookup returns no result, **Then** a "Not Found" error page is displayed.
2. **Given** a user navigates to a URL where the space exists but a nested entity does not (e.g., `/my-space/collaboration/deleted-callout`), **When** the nested lookup fails, **Then** the user sees a redirect dialog pointing to the parent space.
3. **Given** a user navigates to a URL where an intermediate level exists but a deeper level does not, **When** the error occurs, **Then** the redirect targets the deepest accessible ancestor, not the platform home page.

---

### User Story 4 - Reduced Server-Client Route Coupling (Priority: P2)

As a developer, I want to eliminate the server's role in **parsing** URLs, so that the server no longer needs to understand client route structures for navigation resolution. The server retains its role in **generating** entity URLs (via `profile.url`), which is a separate concern.

**Why this priority**: Currently the server has two URL-related services: one that **generates** URLs for entity profiles (1250 lines, must stay) and one that **parses** URLs to resolve nameIds to IDs (1100 lines, to be removed). The parsing service duplicates client route patterns, meaning route changes to URL structure require coordinated deployments. Removing the parsing service eliminates this duplication.

**Independent Test**: Can be tested by adding a new client route under an existing entity (e.g., a new settings sub-page) and verifying it works without changes to the server's URL resolver.

**Acceptance Scenarios**:

1. **Given** a developer adds a new client route under an existing entity (e.g., a new tab in a space), **When** the route is deployed, **Then** it works correctly without any changes to the server's URL parsing logic.
2. **Given** the server's URL generation service (`UrlGeneratorService`) produces a `profile.url` for an entity, **When** the client navigates to that URL, **Then** the client's route matching and per-entity resolution hooks handle the navigation without the server needing to parse the URL.
3. **Given** the existing set of entity types (Space, Organization, User, VirtualContributor, InnovationPack, InnovationHub, ForumDiscussion), **When** a client route references any of these entities by nameId, **Then** the client can resolve the nameId to an ID using lightweight lookups without the server parsing the full URL.
4. **Given** the server still generates `profile.url` values for all entities, **When** a route segment name changes (e.g., `/challenges/` to `/subspaces/`), **Then** both the client route definitions and the server's URL generator must be updated to stay consistent.

---

### User Story 5 - Separated Business Logic from View Components (Priority: P3)

As a developer preparing for a future UI library migration, I want URL resolution and permission logic to be cleanly separated from view components, so that changing the UI framework does not require rewriting data-fetching or authorization logic.

**Why this priority**: This is a preparatory architectural concern. While not user-facing, it reduces future migration effort significantly.

**Independent Test**: Can be tested by verifying that resolution hooks and context providers contain no UI-framework-specific imports, and that view components receive their data through props or context only.

**Acceptance Scenarios**:

1. **Given** the per-entity resolution hooks, **When** inspecting their imports, **Then** they contain no UI-framework-specific dependencies (no MUI, no Emotion, no component imports).
2. **Given** the entity context providers, **When** inspecting their implementation, **Then** they provide data and permission state through standard context APIs, independent of any UI framework.
3. **Given** a page layout component, **When** it renders, **Then** it receives all entity data and permissions from context/props and does not directly call nameId resolution logic.

---

### Edge Cases

- What happens when a user bookmarks a deep-linked URL (e.g., `/my-space/collaboration/my-callout/posts/my-post`) and the intermediate entities have been renamed or deleted?
- How does the system behave when the same nameId exists across different entity types (e.g., a space and an organization with the same nameId)?
- What happens when a user navigates rapidly between multiple spaces before the first resolution completes?
- How does the system handle a nameId that contains special characters or URL-encoded segments?
- What happens when a cached nameId-to-ID mapping becomes stale (e.g., entity was deleted after caching)?
- How does the `/user/me` special route continue to work without the URL resolver (currently handled via MeUserContext)?
- What happens if the server's `profile.url` generation and the client's route definitions drift out of sync (e.g., server generates `/challenges/` but client expects `/subspaces/`)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST resolve entity nameIds to internal IDs using lightweight, per-entity lookup queries rather than a single monolithic URL resolution query.
- **FR-002**: System MUST render page layouts (navigation, breadcrumbs, banners) immediately with skeleton placeholders while entity data loads, rather than blocking rendering with a full-page spinner.
- **FR-003**: System MUST maintain current access control behavior: users without read access to a space are redirected to the About page; unauthenticated users are redirected to login with return URL preservation.
- **FR-004**: System MUST display a "Not Found" page when a nameId does not correspond to any entity, with a redirect option to the nearest accessible ancestor when applicable.
- **FR-005**: System MUST support hierarchical space resolution (L0 space, L1 subspace, L2 sub-subspace) in a single lookup request to avoid sequential resolution waterfalls.
- **FR-006**: System MUST cache resolved nameId-to-ID mappings so that repeat navigations to the same entity do not trigger additional network requests.
- **FR-007**: System MUST resolve all current entity types via nameId: Space, User, Organization, VirtualContributor, InnovationPack, InnovationHub, and ForumDiscussion.
- **FR-008**: System MUST support resolution of nested entities (callouts, posts, whiteboards, memos, calendar events, templates) within their parent entity context.
- **FR-009**: NameId-to-ID translation MUST NOT perform authorization checks; authorization MUST remain the responsibility of entity data queries.
- **FR-010**: The server MUST NOT need to **parse** URLs to resolve nameIds to IDs (eliminating the URL resolver service). The server's URL **generation** service (`UrlGeneratorService`, which produces `profile.url` for entities) remains unchanged and continues to generate navigable URLs using nameIds. Route segment names (e.g., `/challenges/`, `/collaboration/`) remain shared knowledge between the server's URL generator and the client's route definitions.
- **FR-011**: System MUST continue to handle the `/user/me` special route independently of the URL resolver.
- **FR-012**: All existing navigation flows (direct URL access, in-app navigation, browser back/forward, bookmarks) MUST continue to work correctly after the migration.
- **FR-013**: System MUST handle the case where navigating between sub-pages of the same entity (e.g., `/space/settings/templates` to `/space/settings/templates/templateId`) does not produce stale cached data for the parent page.
- **FR-014**: The server's `profile.url` generation (computed field on all entity profiles) MUST continue to produce valid, navigable URLs. The client MUST be able to use `profile.url` values directly for in-app navigation without additional transformation.
- **FR-015**: The client MUST consume `profile.url` as an opaque navigation token for link generation (breadcrumbs, cards, redirects). The client MUST NOT parse `profile.url` to extract nameIds for resolution purposes; nameIds MUST come from route parameters.

### Key Entities

- **NameId**: A human-readable identifier used in URLs to reference platform entities. Each entity type has unique nameIds within its type. Used as the lookup key for nameId-to-ID translation.
- **Space**: A hierarchical collaboration entity with up to 3 levels (L0, L1, L2). Each level has its own nameId. Parent-child relationships form a hierarchy path.
- **Contributor**: A user, organization, or virtual contributor, each identified by a unique nameId in the URL.
- **Collaboration Entity**: Nested entities within spaces (callouts, posts, whiteboards, memos) identified by nameId within their parent's context.
- **Permission Set**: The set of privileges (Read, Update, Create, CreateSubspace) a user has on a given entity, returned by entity data queries via `myPrivileges`.
- **Profile URL**: A computed, absolute URL generated by the server for every entity profile (e.g., `https://app.alkem.io/my-space/challenges/my-challenge`). Uses nameIds, not UUIDs. Consumed by the client as an opaque navigation token in 156+ locations (links, breadcrumbs, cards, redirects). Not stored in the database; recomputed on each request by the server's `UrlGeneratorService`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see a page layout (navigation, skeleton placeholders) within 200ms of navigation, rather than a blank loading spinner.
- **SC-002**: All existing automated tests pass without modification (except tests directly testing the removed URL resolver).
- **SC-003**: Adding a new client-side route under an existing entity type (e.g., a new settings sub-page, a new tab) requires zero server-side changes. Route segment renames that affect server-generated `profile.url` paths still require coordinated updates.
- **SC-004**: The total number of network requests for a typical space page load does not increase by more than 1 additional request compared to the current implementation.
- **SC-005**: 100% of current access control behaviors (forbidden redirect, not-found redirect, unauthenticated redirect, about page fallback) are preserved identically.
- **SC-006**: Per-entity resolution hooks and context providers contain zero UI-framework-specific imports.
- **SC-007**: The removed server-side URL **parsing/resolver** code (`url.resolver.service.ts` and related files) reduces the server codebase by approximately 1,100+ lines. The server's URL **generation** service (`url.generator.service.ts`, ~1,250 lines) remains unchanged.
