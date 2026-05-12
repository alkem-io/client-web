# Feature Specification: Design Version Switch (MUI ↔ CRD)

**Feature Branch**: `099-design-version-switch`
**Created**: 2026-05-12
**Status**: Draft
**Input**: User description: "Add a user-facing switch in the user menu (in both the new and legacy design shells) for choosing between the new design and the old design. Persist the choice on the user's profile so it follows them across browsers and devices, with a fast-boot local cache that reconciles against the server preference on load. Remove the existing scattered toggle entry points so the user menu is the single user-facing control."

## Clarifications

### Session 2026-05-12

- Q: On a fresh session where the local cache and saved preference disagree, what does the user see before the corrective reload fires? → A: Render the cached design immediately; fire one reload as soon as the saved preference resolves and is known to disagree. Accept a brief flash of the "wrong" design (one-time per fresh session / cross-device change).
- Q: If the saved-preference fetch fails (server error, timeout, network drop), how should reconciliation behave? → A: Silently keep whatever design is currently rendered (cached or default). No reconciliation reload, no user-visible error.
- Q: What is the platform default when no preference is known (anonymous user, authenticated user with the field unset, or fetch failed and no cache)? → A: The new design is the default. Old design is shown only when explicitly chosen (saved preference or cache).
- Q: Should design switches be tracked for observability/analytics? → A: Yes — emit an info-level log event for every toggle click, including the resulting design version. (Implementation note: reuse the existing Sentry info-log helper with an appropriate category.) Reconciliation reloads are not tracked.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Switch the active design from the user menu (Priority: P1)

A signed-in user opens the user menu (the dropdown attached to their avatar in the top navigation) and finds a clearly labelled toggle above the "Dashboard" item. Flipping the toggle changes the entire platform to the other design version. The toggle's state always reflects the currently active design, and a short caption next to it tells the user the new design is in beta and the old design will remain available for a limited time.

**Why this priority**: This is the headline behaviour — it gives the user direct, discoverable control over which design they see. Without it, the feature has no user-visible value.

**Independent Test**: Sign in as any authenticated user. Open the user menu in either the new or legacy shell. Confirm the toggle is present above "Dashboard", confirm its on/off state matches the currently active design, flip it, and confirm the platform reloads into the other design.

**Acceptance Scenarios**:

1. **Given** a signed-in user currently viewing the old design, **When** they open the user menu and turn the toggle on, **Then** the platform switches to the new design and the toggle (now visible in the new menu) shows the on state.
2. **Given** a signed-in user currently viewing the new design, **When** they open the user menu and turn the toggle off, **Then** the platform switches to the old design and the toggle (now visible in the old menu) shows the off state.
3. **Given** the user menu is open, **When** the user clicks the toggle row, **Then** only the toggle changes state — the menu does not close prematurely and no unrelated navigation occurs.
4. **Given** the user menu is open, **When** the user looks beside or beneath the toggle, **Then** they see a caption clearly stating that the new design is in beta and the old design will remain available for a short time.

---

### User Story 2 — Design preference follows the user across devices (Priority: P2)

A user who has chosen the new design on one device signs in on a different browser or device. They land in the new design on that new session as well — they do not have to flip the toggle again. The first session on the new device may briefly start in the wrong design (using its fast-boot default), but the system corrects itself with at most one automatic reload so the user lands in the design they previously chose.

**Why this priority**: Without server-side persistence, the choice is meaningless when the user moves devices, and the user has to repeatedly re-toggle. The persistence is what makes the feature feel like a real preference.

**Independent Test**: Sign in on Device A and turn the toggle on. Sign in on Device B (fresh browser, no cached state) as the same user. Observe that the new design loads. If a brief reload happens first, confirm it happens at most once.

**Acceptance Scenarios**:

1. **Given** the user's saved preference is "new design" but their local cache says "old design", **When** they load the platform, **Then** the system updates the cache to match the saved preference and reloads exactly once so the new design renders.
2. **Given** the user's saved preference matches their local cache, **When** they load the platform, **Then** no reload occurs and the chosen design renders directly.
3. **Given** the user has never set a preference, **When** they load the platform on a new device, **Then** the platform uses its default design without triggering any reload.

---

### User Story 3 — Single canonical entry point; legacy controls removed (Priority: P3)

Existing scattered toggle controls (one inside a user-settings sub-tab, one inside a platform-admin layout page) are removed. The user menu is the only place a user can switch the design. This keeps the experience consistent and prevents one entry point from getting out of sync with another.

**Why this priority**: Hygiene and consistency. The headline value already works without this cleanup, but removing legacy controls earns user trust in the toggle as the canonical way to switch.

**Independent Test**: Visit each previous entry point and verify the toggle UI is gone. Verify the surrounding page still functions (no broken layout, no console errors). Verify the only remaining place to switch is the user menu.

**Acceptance Scenarios**:

1. **Given** the user navigates to the user-settings page that previously contained a design toggle, **When** the page is open, **Then** no design toggle is visible there.
2. **Given** the user navigates to the platform-admin layout page that previously contained a design toggle, **When** the page is open, **Then** no design toggle is visible there.
3. **Given** any user, **When** they search the application for ways to switch design, **Then** the user menu is the only entry point.

---

### Edge Cases

- **Anonymous (signed-out) users**: The toggle is not rendered in either menu. The platform does not attempt any reconciliation reload for an anonymous session.
- **Preference changed on another device/tab**: The current tab does not need to live-sync; it picks up the change on its next load.
- **Network error while saving the preference**: The active design does not change, and the user is shown a non-blocking error indicating the change could not be saved. Their previously chosen design remains active.
- **Saved-preference fetch fails for a signed-in user**: The platform keeps the currently rendered design (cached or default) and skips reconciliation for that session. No reload, no user-facing error. The next successful load will reconcile.
- **Saved preference value is missing or unrecognised**: The platform treats this as "no preference" and uses the local cache (or the platform default — the new design) without triggering a reload.
- **Two browser tabs open**: A toggle action in one tab will, after its reload, only affect that tab. Other open tabs follow the saved preference on their next reload.
- **User signs out, then signs back in as a different user**: The new user's saved preference takes effect on their first load; the previous user's cache state must not silently apply to them.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The platform MUST expose a single toggle inside each user menu (legacy and new design shells) that lets a signed-in user switch between the new and old design versions.
- **FR-002**: The toggle MUST appear above the "Dashboard" entry within each user menu.
- **FR-003**: The toggle MUST be visible only when the viewer is signed in; anonymous users MUST NOT see it.
- **FR-004**: The toggle MUST be accompanied by a short caption indicating that the new design is in beta and that the old design will remain available for a limited time.
- **FR-005**: The toggle's visible on/off state MUST at all times reflect the design version currently rendered to the user.
- **FR-006**: When a signed-in user changes the toggle, the platform MUST persist the new value to that user's saved preferences before treating the change as confirmed.
- **FR-007**: On every platform load for a signed-in user, the system MUST compare the saved preference against the locally cached value and, if they disagree, update the local cache to match the saved preference and reload the page exactly once so the correct design renders. The platform MUST NOT block initial render waiting for the saved preference: the cached design renders immediately, and the corrective reload fires only after the saved preference has resolved.
- **FR-008**: If a signed-in user has no saved preference, the platform MUST use the locally cached value (or, if no cache exists, the platform default) without triggering a reload.
- **FR-008a**: If the saved-preference fetch fails or never resolves (server error, network drop, timeout), the platform MUST keep the currently rendered design active, MUST NOT trigger a reconciliation reload for that session, and MUST NOT surface an error to the user.
- **FR-008b**: When no preference is known and no local cache exists (e.g. first-ever visit, anonymous user, or signed-in user whose preference fetch failed and who has no cached value), the platform default MUST be the **new design**. The old design MUST only be rendered when explicitly selected via saved preference or local cache.
- **FR-009**: For anonymous users, the platform MUST NOT perform any preference reconciliation and MUST NOT trigger any preference-driven reload.
- **FR-010**: If saving the preference fails (e.g. network error), the platform MUST keep the previously active design and surface a clear, non-blocking error message to the user.
- **FR-011**: The platform MUST remove the previously existing design-toggle UIs from the user-settings sub-tab and the platform-admin layout page so the user menu is the sole user-facing entry point.
- **FR-012**: After a successful toggle, the entire platform shell (navigation, pages, layouts) MUST render in the newly chosen design — not only the page that was active when the toggle was used.
- **FR-013**: Switching the design MUST NOT cause loss of the user's current authentication session.
- **FR-014**: Interacting with the toggle within the open menu MUST NOT cause the menu to close before the user has confirmed the change, and MUST NOT navigate the user away from their current page on its own.
- **FR-015**: The toggle and its caption MUST be available in every language the platform's user menu otherwise supports.
- **FR-016**: Every successful toggle interaction MUST emit an info-level observability log event capturing the resulting design version (and any context the existing logging helper already includes, such as user id). Reconciliation reloads MUST NOT emit a corresponding event.
- **FR-017**: The toggle and its caption MUST meet WCAG 2.1 AA: keyboard-reachable via Tab and operable via Space/Enter, focus state visible against both menus' backgrounds, the switch's role and on/off state announced by assistive technology, and the beta caption programmatically associated with the switch (e.g. via `aria-describedby`) so it is read alongside the control.

### Key Entities

- **User Design Preference**: A persisted attribute on the user's profile indicating which design version they prefer. Has two meaningful states ("new design" and "old design") plus an implicit "not set" state.
- **Local Design Cache**: A per-browser, per-device cached copy of the user's chosen design used for instant rendering at startup before the saved preference is known. Treated as a read-through cache of the User Design Preference.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A signed-in user can switch design version in under 5 seconds end-to-end (open menu → flip toggle → see new design).
- **SC-002**: 100% of platform pages render in the chosen design after a switch — no page is left rendering in the previous design.
- **SC-003**: For a user with a saved preference, the chosen design appears on a first-time session on a new browser or device with at most one automatic reload.
- **SC-004**: Across all sessions whose local cache already matches the saved preference, the platform performs zero design-driven reloads on load.
- **SC-005**: 100% of anonymous-user sessions never display the toggle and never trigger a design-driven reload.
- **SC-006**: After this feature ships, the user menu is the only place a user can switch design (verified by absence of the toggle from every previous entry point).
- **SC-007**: Failures to save the preference are surfaced to the user in 100% of error cases without silently changing the active design.

## Assumptions

- A server-side field exists on the user's settings that stores the user's chosen design version (two meaningful values plus an unset state) and is updatable through the existing user-settings update flow.
- The platform already supports loading either of the two design shells based on a single boot-time signal, so a single page reload is sufficient to switch the user from one shell to the other.
- The platform default for "no preference known" cases (anonymous users, signed-in users with the field unset, and signed-in users whose preference fetch failed and who have no cached value) is the **new design**. This is a deliberate change from the previous default of "old design" and is part of the migration push.
- Only one design-switch operation is in flight at a time per user; the toggle does not need to support concurrent in-flight changes.
- The "beta" caption wording is finalised by product when translation keys are authored; this spec assumes the message conveys both "beta" status and "old design will remain available for a short time".
