# Feature Specification: Redirect Fallback Experience

**Feature Branch**: `001-redirect-fallback`
**Created**: 2025-11-28
**Status**: Draft
**Input**: User description: "Issue #9001: Implement hierarchical redirect handling for broken URLs with login prompts, unauthorized countdown redirects, and 404 fallback."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Login redirect resumes intent (Priority: P1)

When a logged-out visitor opens any Alkemio deep link, the product must capture the intent, send the visitor through the login surface, and restore the original destination (or its best accessible fallback) immediately after successful authentication.

**Why this priority**: Most broken journeys begin with external links shared via email or chat. Preserving intent post-login protects conversions and reduces complaint volume.

**Independent Test**: Start from a logged-out state, open a valid resource URL, authenticate, and verify that the requested page (or designated fallback) loads without manual navigation.

**Acceptance Scenarios**:

1. **Given** a logged-out user opens a valid Space URL, **When** they authenticate successfully, **Then** the system redirects them straight to that Space with no intermediate 404 screens.
2. **Given** a logged-out user opens a Callout URL that later becomes inaccessible, **When** they authenticate, **Then** the resolver seamlessly hands them off to the fallback journey in User Story 2 without duplicating prompts.

---

### User Story 2 - Unauthorized countdown fallback (Priority: P1)

Members who reach resources they are not permitted to view must see a dedicated restricted page with a 10-second countdown, manual CTA, contextual messaging, and a background 404 so the URL still behaves like “not found” for unauthorized viewers. After the countdown (or CTA click) they are redirected to the closest accessible ancestor.

**Why this priority**: Prevents dead ends for users who lose access or follow private links, improving guidance and reducing support tickets.

**Independent Test**: Log in as a user lacking access to a Sub-space, open its URL, observe the countdown screen, and confirm both the timed and manual redirects land on the allowed parent.

**Acceptance Scenarios**:

1. **Given** an authenticated user without Sub-space membership opens that Sub-space URL, **When** the restricted page appears, **Then** it displays the countdown, parent destination details, and action button while keeping the original URL visible behind a 404 backdrop.
2. **Given** the user clicks the “Go now” action before the countdown ends, **When** the navigation triggers, **Then** they immediately land on the parent Space without waiting for the timer.
3. **Given** the parent Space is also inaccessible, **When** the countdown elapses, **Then** the system iterates up the hierarchy until it finds an accessible ancestor or routes to the community home if none exist.

---

### User Story 3 - Deleted or missing items resolve gracefully (Priority: P2)

If a contribution, callout, or nested resource no longer exists, the user should be routed to the closest existing ancestor, and only receive the standard 404 page when the entire chain is gone.

**Why this priority**: Preserves navigation context for stale notification links and aligns with the “safe fallback” principle described in the issue background.

**Independent Test**: Simulate a deleted contribution link, request metadata from the resolver, and confirm the client forwards users to the surviving parent (e.g., Callout or Space) or ultimately shows the 404 when nothing exists.

**Acceptance Scenarios**:

1. **Given** a deleted Contribution URL with an existing Callout parent, **When** the client resolves the link, **Then** it routes to that Callout and displays a one-time notice explaining the fallback.
2. **Given** a resource tree where every ancestor has been removed, **When** a user opens the stale link, **Then** the standard 404 page renders with no infinite redirects.

---

### Edge Cases

- Countdown page must pause or reset correctly if the user navigates away mid-timer and comes back via browser history.
- Remembered post-login targets must expire after logout to avoid redirecting future sessions to stale or unauthorized pages.
- Handle race conditions where the resolver first reports “exists” but the item is deleted before navigation completes.
- Prevent redirect loops when parent and child share the same canonical URL or when server-provided fallback equals the current path.
- Ensure accessibility: countdown announces remaining seconds to screen readers and the manual CTA is focusable without motion.

## Requirements _(mandatory)_

This feature touches the navigation, session handling, and error-surfacing experience. To honor the constitution:

- Extend the domain façade under `src/domain/navigation` (or equivalent) to wrap the new server-side resolver so React components inside `src/main/routes` remain orchestration-only. The façade should expose typed hooks like `useResolvedRoute()` that return resource metadata, fallback chains, and redirect intents.
- Coordinate with GraphQL (or REST if preferred by the backend) to expose a `resolveResource` operation that returns: resource type, slug, authorization state, parent chain, and deletion status. All consuming hooks must rely on generated types in `src/core/apollo/generated`, keeping UI props explicitly declared.
- Introduce concurrency-safe patterns: wrap the async resolution and countdown triggers inside `useTransition` so route changes never block paint, and gate redirects behind side-effect hooks rather than render logic.
- Persist redirect targets in a domain-level store (Apollo cache or dedicated context) so both login callbacks and restricted-page timers can read/write intent without duplicating global state.
- Instrument the countdown and fallback actions via existing telemetry adapters inside `src/core/analytics` to prove success criteria, while ensuring we log no sensitive resource identifiers for unauthorized viewers.
- Accessibility & performance: countdown overlays must meet WCAG (keyboard escape, ARIA live region for timer, sufficient contrast). Redirect calculations need to complete within 150 ms on average so we stay under the 3-second success criterion from a user perspective.
- Testing: add Vitest coverage for the resolver hook logic (mocking various server responses) plus Cypress/Jest integration flows for login, restricted page, and deleted-resource fallbacks. Include visual regression screenshots for the restricted page overlay since it blends 404 background with messaging.

### Functional Requirements

- **FR-001**: System MUST request resolution metadata for every deep link before rendering, including existence, authorization, and ordered parent chain.
- **FR-002**: System MUST capture anonymous users’ target URLs, route them through the login screen, and restore the target immediately after successful authentication.
- **FR-003**: System MUST detect when a user lacks permission and display the restricted countdown page with the 404 backdrop, contextual copy, target name, and manual “Go now” CTA.
- **FR-004**: System MUST execute a hierarchical fallback: after each countdown (or CTA) it attempts the next ancestor until an accessible destination is found or the community home is reached.
- **FR-005**: System MUST surface a dismissible notification after any automatic fallback (“We couldn’t find that page...”) and remember dismissal to avoid showing it again on refresh.
- **FR-006**: System MUST render the standard 404 page only when the resolver confirms no ancestor exists, ensuring browsers still receive a 404 response state.
- **FR-007**: System MUST emit analytics events for each fallback reason (login, unauthorized, deleted) with anonymized identifiers so support can trace broken journeys.

### Key Entities _(include if feature involves data)_

- **ResolvedResource**: Describes the requested entity (type, slug, display name, authorization state, existence flag).
- **FallbackChain**: Ordered list of parent resources, each with accessibility status and target URL, used to drive countdown destinations.
- **RedirectNotice**: UI state storing whether the fallback message has been shown for the current session plus timestamps for countdown start/stop.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of logged-out deep link visits land on their intended resource (or first accessible ancestor) within 3 seconds of successful authentication.
- **SC-002**: 99% of restricted-page countdowns complete (auto or manual) within 12 seconds end-to-end, including navigation to the fallback destination.
- **SC-003**: Support tickets tagged “broken link / 404” drop by at least 40% within one month of release as measured by Zendesk categorization.
- **SC-004**: At least 80% of stale notification links now land on an accessible ancestor instead of abandoning users on a blank 404, as measured via analytics funneling from resolver events.

## Assumptions & Dependencies

- Backend exposes a resolver endpoint that differentiates between `not_authenticated`, `not_authorized`, and `not_found`, and returns the ordered parent chain for any resource.
- Authentication callbacks can accept a `returnTo` parameter so the client may restore the exact target without rebuilding session state manually.
- Parent chain metadata includes display labels and URLs so the countdown page can communicate where the user will land.
- Telemetry hooks already exist (or will be added server-side) to capture resolver outcomes; client only needs event names and payload contracts.
