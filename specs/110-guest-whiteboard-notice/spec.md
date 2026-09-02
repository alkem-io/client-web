# Feature Specification: Guest whiteboard return notification (CRD)

**Feature Branch**: `110-guest-whiteboard-notice`
**Created**: 2026-06-15
**Status**: Draft
**Input**: User description: "there is a page in MUI that notifies the guest users when they leave a public whiteboard. It has a message like 'You've left your whiteboard', and shows up together with the login/sign-up page. Check how it is implemented (related to the sign_up page). The Material UI login/signup pages may have been removed."

## Context & Findings *(investigation summary — not part of the formal spec)*

The MUI implementation **was found**, so no blocker exists. The relevant facts:

- The notification is a card titled **"You've left your whiteboard"** rendered by the legacy MUI sign-up page at `src/core/auth/authentication/pages/SignUp.tsx`, using the component `src/domain/collaboration/whiteboard/guestAccess/components/GuestSessionNotification.tsx`.
- It appears **only** when a guest session is active — i.e. `sessionStorage` holds both `alkemio_guest_name` and `alkemio_guest_whiteboard_url`. This is read by the hook `useGuestSessionReturn` (`shouldShowNotification = Boolean(guestName && whiteboardUrl)`).
- The card offers two actions — **"Back to whiteboard"** (navigates to the stored whiteboard URL) and **"Go to our website"** (opens the public marketing site) — plus a **"Want to contribute more?"** hint pointing the guest at the adjacent sign-up form.
- **The MUI `SignUp.tsx` page is now orphaned**: no router imports it. The `/sign_up` and `/registration` routes already render the CRD `SignUpCrdRoute` / `RegistrationCrdRoute` (`src/main/crdPages/auth/SignUpCrdRoute.tsx`), which renders the CRD `SignUpCard` inside the CRD `AuthShell`. The user's hunch was correct — the MUI sign-up experience has effectively been replaced by CRD.
- **Consequence (the regression this feature fixes):** because the notification lived only on the orphaned MUI page, a guest who leaves a public whiteboard and lands on the (now CRD) sign-up page **no longer sees** the "You've left your whiteboard" notification. The underlying session mechanism still works — `CrdPublicWhiteboardPage` still writes `alkemio_guest_whiteboard_url` to `sessionStorage`, and the redirect to sign-up still happens — but the CRD sign-up page has no UI to surface it.
- The existing i18n strings live under the legacy `translation` namespace at `pages.public.whiteboard.guestSessionNotification.*`. New CRD strings belong in the `crd-auth` namespace (`src/crd/i18n/auth/`), which already hosts the CRD sign-up copy.

This feature re-implements that guest return notification natively in the CRD design system and wires it into the CRD sign-up page, restoring parity for guest users.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Guest sees the return notification after leaving a whiteboard (Priority: P1)

A person who has been collaborating on a public whiteboard as a guest (they entered a display name but did not create an account) navigates away to the sign-up page — either by clicking a sign-up prompt or following a link. On the sign-up page they see a clear notification confirming they have left their whiteboard, reassuring them their guest session is still active, and giving them a one-click way back.

**Why this priority**: This is the core regression. Without it, guests who leave a whiteboard get no acknowledgement and no easy path back — the exact value the original MUI page provided. It is the minimum viable slice; everything else builds on it.

**Independent Test**: Seed `sessionStorage` with a guest name and a whiteboard URL, visit the CRD sign-up page, and confirm the notification appears with the correct title, description, and actions. Clear the session and confirm it does not appear.

**Acceptance Scenarios**:

1. **Given** an active guest session (a stored guest name and a stored whiteboard URL), **When** the guest opens the CRD sign-up page, **Then** a notification is shown with the title "You've left your whiteboard", a reassurance that the guest session is still active, and two actions: return to the whiteboard and go to the public website.
2. **Given** no active guest session (no stored guest name or no stored whiteboard URL), **When** any visitor opens the CRD sign-up page, **Then** no guest notification is shown and the normal sign-up experience is unchanged.
3. **Given** the notification is visible, **When** the guest reads it, **Then** it also presents a short "Want to contribute more?" message inviting them to create an account using the adjacent sign-up form.

---

### User Story 2 - Guest returns to their whiteboard (Priority: P1)

From the notification, the guest chooses to go back to the whiteboard they were working on and is returned to it with their guest session intact.

**Why this priority**: The "return" action is the primary reason the notification exists; a notification with no working return path delivers little value.

**Independent Test**: With a guest session seeded for a known whiteboard URL, render the notification, trigger the "Back to whiteboard" action, and confirm navigation lands on that whiteboard URL.

**Acceptance Scenarios**:

1. **Given** the notification is visible for a stored whiteboard URL, **When** the guest activates "Back to whiteboard", **Then** they are navigated to that whiteboard URL.
2. **Given** the guest returns to the whiteboard, **When** the whiteboard loads, **Then** their guest identity (display name) is still in effect (the guest session is not cleared by viewing the notification or returning).

---

### User Story 3 - Guest leaves for the public website (Priority: P2)

A guest who does not want to return to the whiteboard and does not want to sign up can leave for Alkemio's public marketing site.

**Why this priority**: A useful exit, but secondary to returning or signing up. The feature is still valuable without polishing this path.

**Acceptance Scenarios**:

1. **Given** the notification is visible, **When** the guest activates "Go to our website", **Then** they are taken to Alkemio's public website.

---

### User Story 4 - Guest signs up and the notification is dismissed (Priority: P2)

A guest decides to create an account from the adjacent sign-up form. Once they successfully authenticate, the guest session is considered complete and the notification no longer applies.

**Why this priority**: Conversion is the strategic goal of placing the notification next to the sign-up form, but the notification's own behaviour (appearing for guests) is the focus of this feature; the sign-up flow itself already exists.

**Acceptance Scenarios**:

1. **Given** a guest sees the notification and completes sign-up, **When** authentication succeeds, **Then** the stored guest session data is cleared so the notification does not reappear on subsequent visits to the sign-up page.

---

### Edge Cases

- **Partial session data**: only a guest name OR only a whiteboard URL is present (never both) → the notification MUST NOT appear (matches the existing `Boolean(guestName && whiteboardUrl)` rule).
- **Session storage unavailable / cleared mid-session** (private browsing limits, manual clear, browser restart): treated as no guest session → notification does not appear; the sign-up page behaves normally.
- **Stale or invalid stored whiteboard URL** (whiteboard since deleted or access revoked): the "Back to whiteboard" action still navigates to the stored URL; handling of an unavailable whiteboard is the whiteboard page's existing concern (not-found / access-denied states), not this notification's.
- **Already-authenticated user** lands on the sign-up page with residual guest data: out of scope for the notification's trigger; the existing post-auth cleanup clears guest data on successful login/registration.
- **Small / mobile viewport**: the notification and the sign-up form must both remain readable and usable without overlap (the legacy MUI version stacked them vertically on narrow screens).
- **Localisation**: the notification text must be available in all six supported languages (en, nl, es, bg, de, fr), consistent with CRD i18n parity rules.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The CRD sign-up page MUST display a guest return notification when, and only when, an active guest whiteboard session is detected (both a stored guest display name and a stored whiteboard URL are present).
- **FR-002**: The notification MUST communicate that the guest has left their whiteboard and that their guest session remains active.
- **FR-003**: The notification MUST provide an action that returns the guest to the whiteboard they were working on, using the stored whiteboard URL.
- **FR-004**: The notification MUST provide an action that takes the guest to Alkemio's public website.
- **FR-005**: The notification MUST include a short prompt encouraging the guest to create an account via the adjacent sign-up form.
- **FR-006**: Returning to the whiteboard or going to the website MUST NOT, by themselves, end the guest session (the guest identity must survive a round-trip back to the whiteboard).
- **FR-007**: When a guest successfully authenticates (signs up or logs in), the guest session data MUST be cleared so the notification no longer appears.
- **FR-008**: When no active guest session is present, the sign-up page MUST render exactly as it does today, with no notification and no layout disruption.
- **FR-009**: All notification text MUST be provided through the CRD translation system in the appropriate CRD feature namespace, with parity across all six supported languages (en, nl, es, bg, de, fr). No new strings may be added to the frozen legacy `translation` namespace.
- **FR-010**: The notification MUST be built as a CRD (design-system) component — presentational only, with all behaviour (navigation, session reads, action handlers) supplied by the integration layer — containing no MUI, no direct routing, and no direct business-logic imports.
- **FR-011**: The notification and the sign-up form MUST both remain fully usable and readable across supported viewport sizes, including narrow/mobile widths.
- **FR-012**: The notification MUST meet WCAG 2.1 AA: actionable controls are real buttons/links with accessible names, focus is visible, and meaningful content is reachable by keyboard and screen reader.
- **FR-013**: This feature MUST NOT delete the legacy MUI auth files. The orphaned MUI `GuestSessionNotification.tsx` and its only caller `SignUp.tsx` are part of a larger family of orphaned MUI auth pages — the MUI **Sign In** page (`LoginPage.tsx`, reachable only via the now-unrouted `LoginRoute.tsx`) is in the identical state (the `/login` route already renders the CRD `LoginCrdRoute`). All of these dead MUI auth files MUST be removed together in a separate, dedicated MUI auth-cleanup pass — not piecemeal in this notification feature. This feature only adds the CRD notification and leaves the dead MUI code untouched.

### Key Entities *(include if feature involves data)*

- **Guest session**: An anonymous collaboration session identified by a guest display name and the URL of the whiteboard the guest was working on. Persisted in browser session storage. Its presence (both fields) is the sole trigger for the notification. Not a server-side entity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of visits to the CRD sign-up page with a complete active guest session display the notification; 0% of visits without a complete guest session display it.
- **SC-002**: A guest can return to their whiteboard from the notification in a single action, and arrives back with their guest identity intact, in at least 95% of attempts.
- **SC-003**: The notification text renders correctly (no missing keys, no untranslated fallbacks) in all six supported languages.
- **SC-004**: Re-introducing the notification does not regress the sign-up page: visitors with no guest session see an unchanged sign-up experience (no added load failures, no layout shift on the sign-up form).
- **SC-005**: After a guest signs up, the notification does not reappear on a subsequent visit to the sign-up page within the same browser session.

## Assumptions

- The CRD sign-up route (`/sign_up`, and the registration route) is the correct and only place this notification needs to appear, mirroring the legacy MUI placement. (The legacy MUI page rendered it solely on the sign-up page.)
- The "go to website" destination is Alkemio's public marketing site, consistent with the legacy behaviour.
- The existing session-storage mechanism and the point at which the guest whiteboard URL is written (when entering the public whiteboard) are correct and unchanged by this feature; only the consumption/display side is being restored in CRD.
- The existing post-authentication guest-data cleanup remains the mechanism that satisfies FR-007; this feature relies on it rather than introducing a new cleanup trigger.
- CRD strings for this notification belong in the existing `crd-auth` namespace (alongside the CRD sign-up copy), unless a dedicated whiteboard-guest namespace is preferred during planning.
