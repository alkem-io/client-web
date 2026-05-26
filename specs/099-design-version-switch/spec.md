# Feature Specification: Design Version Switch (MUI ↔ CRD)

**Feature Branch**: `099-design-version-switch`
**Created**: 2026-05-12
**Status**: Draft
**Input**: User description: "Add a user-facing switch in the user menu (in both the new and legacy design shells) for choosing between the new design and the old design. Persist the choice on the user's profile so it follows them across browsers and devices, with a fast-boot local cache that reconciles against the server preference on load. Remove the existing scattered toggle entry points so the user menu is the single user-facing control."

## Clarifications

### Session 2026-05-12

- Q: On a fresh session where the local cache and saved preference disagree, what does the user see before the corrective reload fires? → A: Render the cached design immediately; fire one reload as soon as the saved preference resolves and is known to disagree. Accept a brief flash of the "wrong" design (one-time per fresh session / cross-device change).
- Q: If the saved-preference fetch fails (server error, timeout, network drop), how should reconciliation behave? → A: Silently keep whatever design is currently rendered (cached or default). No reconciliation reload, no user-visible error.
- Q: What is the platform default when no preference is known (anonymous user, authenticated user with the field unset, or fetch failed and no cache)? → A: ~~The new design is the default.~~ **Superseded — see 2026-05-13 session below.**
- Q: Should design switches be tracked for observability/analytics? → A: Yes — emit an info-level log event for every toggle click, including the resulting design version. (Implementation note: reuse the existing Sentry info-log helper with an appropriate category.) Reconciliation reloads are not tracked.

### Session 2026-05-13

- Q (revision of 2026-05-12 Q3): Confirm the platform default for "no preference known" cases. → A: The **old design** is the default. The migration push that flips the default to the new design is deferred to a later, separate milestone. For this feature, the only behavioral change is the addition of the explicit toggle and server-backed persistence; the unset/anonymous default stays as it is today. ~~Active~~ **Superseded by 2026-05-26 session below.**

### Session 2026-05-26

- Q (revision of 2026-05-13): The deferred default flip is now shipping. → A: The **new design (CRD)** is the default. `useCrdEnabled()` returns `true` for every "no preference known" state (anonymous visitor, fresh device, missing or unrecognized LS, signed-in user with the server field unset). Only an explicit `'1'` in LS (or server `designVersion === 1` synced to LS) renders MUI. Coordinated with a backend default flip; the backend continues to be authoritative for authenticated users via `useDesignVersionSync`.
- Q: Should there be an active migration push for existing MUI users? → A: Yes — a one-shot CRD-styled modal nudges signed-in users whose server preference is `1` to switch. Dismissal is per-device (new LS key `alkemio-design-version-upgrade-dismissed`); either button (confirm or dismiss) sets the marker so the modal never re-fires on that device.
- Q: How should the avatar-menu toggle label read now that "preview" no longer fits? → A *(initial)*: state-dependent — "Use the new design" off / "Switch back to the old UI (temporarily available)" on. **Revised same session**: state-dependent labels were briefly shipped, then reverted in favor of a single neutral label: **"New look (old design available for a limited time)"**. The single label describes the feature regardless of toggle state (same pattern as "Dark mode"), drops the deprecated `caption` key, and folds the temporary-availability framing into the label itself.

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

### User Story 4 — Migration nudge for existing MUI users (Priority: P2) *(added 2026-05-26)*

A signed-in user whose server preference is still `1` (the old design) sees a one-shot CRD-styled modal on their next load inviting them to switch. The modal explains that the new design is now the default, that the old UI will remain available from the avatar menu for a limited time, and to contact support if anything feels missing. Either button (Take me to the new design / Maybe later) sets a per-device dismissal marker so the modal never re-fires on that device.

**Why this priority**: The default flip on its own only catches users with no preference. Authenticated users whose server preference says `1` (either explicit or auto-synced before the backend default flipped) stay on MUI indefinitely without active outreach. This is the only direct migration push to that population.

**Independent Test**: Sign in as a user whose server `designVersion` is `1`. Clear `alkemio-design-version-upgrade-dismissed` from LS. Reload any page in the app. Confirm the CRD-styled modal appears. Click Maybe later → modal disappears, MUI shell remains. Reload again → modal does NOT reappear. Clear the dismissal marker, reload, and this time click Take me to the new design → the existing toggle flow runs (server write, LS update, page reload), and the user lands in CRD.

**Acceptance Scenarios**:

1. **Given** a signed-in user with `designVersion === 1` and no LS dismissal marker, **When** any page in the app finishes loading them in, **Then** the upgrade modal appears as an overlay over the MUI shell, styled with the CRD design tokens.
2. **Given** the upgrade modal is open, **When** the user clicks Take me to the new design, **Then** the existing toggle flow runs (server `designVersion` becomes `2`, LS becomes `'2'`, the page reloads into CRD) AND the LS dismissal marker is set so the modal does not re-fire if the user later switches back to MUI.
3. **Given** the upgrade modal is open, **When** the user clicks Maybe later (or closes via the X / overlay), **Then** the modal closes, the MUI shell remains active, AND the LS dismissal marker is set so the modal does not re-fire on this device.
4. **Given** the LS dismissal marker is already set (either button was clicked previously), **When** the user loads any page, **Then** the modal does NOT appear regardless of the user's server preference.
5. **Given** an anonymous visitor or a user already on CRD (`designVersion === 2`), **When** they load any page, **Then** the modal never appears (anonymous visitors have no server preference; CRD users have already made the choice).

---

### Edge Cases

- **Anonymous (signed-out) users**: The toggle is not rendered in either menu. The platform does not attempt any reconciliation reload for an anonymous session.
- **Preference changed on another device/tab**: The current tab does not need to live-sync; it picks up the change on its next load.
- **Network error while saving the preference**: The active design does not change, and the user is shown a non-blocking error indicating the change could not be saved. Their previously chosen design remains active.
- **Saved-preference fetch fails for a signed-in user**: The platform keeps the currently rendered design (cached or default) and skips reconciliation for that session. No reload, no user-facing error. The next successful load will reconcile.
- **Saved preference value is missing or unrecognised**: The platform treats this as "no preference" and uses the local cache (or the platform default — the old design) without triggering a reload.
- **Two browser tabs open**: A toggle action in one tab will, after its reload, only affect that tab. Other open tabs follow the saved preference on their next reload.
- **User signs out, then signs back in as a different user**: The new user's saved preference takes effect on their first load; the previous user's cache state must not silently apply to them.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The platform MUST expose a single toggle inside each user menu (legacy and new design shells) that lets a signed-in user switch between the new and old design versions.
- **FR-002**: The toggle MUST appear above the "Dashboard" entry within each user menu.
- **FR-003**: The toggle MUST be visible only when the viewer is signed in; anonymous users MUST NOT see it.
- **FR-004**: ~~The toggle MUST be accompanied by a short caption indicating that the new design is in beta and that the old design will remain available for a limited time.~~ **Superseded 2026-05-26.** The separate `caption` key has been removed; the temporary-availability framing now lives in the toggle's state-dependent label itself (see FR-018) and in the migration-nudge modal (see FR-019).
- **FR-005**: The toggle's visible on/off state MUST at all times reflect the design version currently rendered to the user.
- **FR-006**: When a signed-in user changes the toggle, the platform MUST persist the new value to that user's saved preferences before treating the change as confirmed.
- **FR-007**: On every platform load for a signed-in user, the system MUST compare the saved preference against the locally cached value and, if they disagree, update the local cache to match the saved preference and reload the page exactly once so the correct design renders. The platform MUST NOT block initial render waiting for the saved preference: the cached design renders immediately, and the corrective reload fires only after the saved preference has resolved.
- **FR-008**: If a signed-in user has no saved preference, the platform MUST use the locally cached value (or, if no cache exists, the platform default) without triggering a reload.
- **FR-008a**: If the saved-preference fetch fails or never resolves (server error, network drop, timeout), the platform MUST keep the currently rendered design active, MUST NOT trigger a reconciliation reload for that session, and MUST NOT surface an error to the user.
- **FR-008b**: ~~When no preference is known and no local cache exists (e.g. first-ever visit, anonymous user, or signed-in user whose preference fetch failed and who has no cached value), the platform default MUST be the **old design**.~~ **Superseded 2026-05-26.** The platform default MUST be the **new design (CRD)** for every "no preference known" state — anonymous visitors, fresh devices, missing/unrecognized LS, and signed-in users with the server field unset. Only an explicit `'1'` in LS (or `designVersion === 1` synced from the server) MUST render MUI. The previously deferred default flip is now in scope and shipped via this revision.
- **FR-009**: For anonymous users, the platform MUST NOT perform any preference reconciliation and MUST NOT trigger any preference-driven reload.
- **FR-010**: If saving the preference fails (e.g. network error), the platform MUST keep the previously active design and surface a clear, non-blocking error message to the user.
- **FR-011**: The platform MUST remove the previously existing design-toggle UIs from the user-settings sub-tab and the platform-admin layout page so the user menu is the sole user-facing entry point.
- **FR-012**: After a successful toggle, the entire platform shell (navigation, pages, layouts) MUST render in the newly chosen design — not only the page that was active when the toggle was used.
- **FR-013**: Switching the design MUST NOT cause loss of the user's current authentication session.
- **FR-014**: Interacting with the toggle within the open menu MUST NOT cause the menu to close before the user has confirmed the change, and MUST NOT navigate the user away from their current page on its own.
- **FR-015**: The toggle and its caption MUST be available in every language the platform's user menu otherwise supports.
- **FR-016**: Every successful toggle interaction MUST emit an info-level observability log event capturing the resulting design version (and any context the existing logging helper already includes, such as user id). Reconciliation reloads MUST NOT emit a corresponding event.
- **FR-017**: The toggle and its caption MUST meet WCAG 2.1 AA: keyboard-reachable via Tab and operable via Space/Enter, focus state visible against both menus' backgrounds, the switch's role and on/off state announced by assistive technology, and the beta caption programmatically associated with the switch (e.g. via `aria-describedby`) so it is read alongside the control. *(Note: the caption was removed 2026-05-26 per FR-004; the keyboard/screen-reader requirements on the switch itself still apply.)*
- **FR-018** *(added 2026-05-26, revised same session)*: The toggle MUST render a single neutral label that does not depend on the toggle's current state — "New look (old design available for a limited time)" via translation key `header.designVersion.label` (CRD) / `topBar.designVersion.label` (MUI). Both shells (CRD `UserMenu` and MUI `PlatformNavigationUserMenu`) MUST use this single label. *(An earlier draft prescribed state-dependent `toCrd` / `toMui` labels; that approach was reverted before stabilization in favor of the single-label pattern, which matches every other feature-toggle in the platform.)*
- **FR-019** *(added 2026-05-26)*: A one-shot CRD-styled migration-nudge modal MUST appear on every page load for any authenticated user whose server `designVersion === 1` AND who has no per-device dismissal marker. The modal MUST be mounted at the app shell (above the route tree) so it surfaces regardless of which page the user is on. Anonymous visitors and users with `designVersion === 2` MUST NOT see it. The modal MUST render even when the surrounding shell is MUI (achieved by wrapping the dialog content in `.crd-root` so Tailwind preflight applies inside the portal).
- **FR-020** *(added 2026-05-26)*: The modal MUST provide two actions — a primary "Take me to the new design" that runs the existing toggle flow (server write → LS write → reload into CRD), and a secondary "Maybe later" (plus Esc / overlay / X) that closes without changing the design. Both actions MUST set a per-device LS dismissal marker (`alkemio-design-version-upgrade-dismissed`) so the modal never re-fires on that device, even if the user later switches back to MUI via the avatar-menu toggle.

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
- The platform default for "no preference known" cases (anonymous users, signed-in users with the field unset, and signed-in users whose preference fetch failed and who have no cached value) remains the **old design** — same as today. The eventual flip to a new-design default is deferred to a later, separate migration milestone and is intentionally out of scope here.
- Only one design-switch operation is in flight at a time per user; the toggle does not need to support concurrent in-flight changes.
- The "beta" caption wording is finalised by product when translation keys are authored; this spec assumes the message conveys both "beta" status and "old design will remain available for a short time".
