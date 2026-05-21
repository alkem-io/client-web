# Feature Specification: CRD Authentication Pages

**Feature Branch**: `101-crd-auth-pages`
**Created**: 2026-05-20
**Status**: Draft
**Input**: User description: Migrate the existing sign-in / sign-up / password recovery flow (currently MUI-only) to the new CRD design system. UI migration only — the underlying authentication backend, validation, social providers, return-URL behaviour, and route paths stay identical to the MUI version. Today, users on `designVersion=2` still see the old MUI authentication shell because no CRD equivalents exist; this spec closes that gap.

## Overview

Alkemio's design-system migration is incremental: each page exists in both an MUI version and a CRD version, and a per-user `designVersion` preference (`1` = MUI, `2` = CRD) determines which shell renders. Most top-level pages have already been migrated. The **authentication flow has not** — sign-in, sign-up, password recovery, password reset, and email verification all still render the MUI shell regardless of the user's chosen design version. As a result, a CRD-mode user experiences a jarring visual break the moment they sign out, recover a password, or follow a verification link.

This feature delivers a CRD-styled equivalent of every authentication screen so that a user who has opted into the new design lives entirely inside the new shell, end to end. Behaviour, fields, errors, redirects, supported sign-in methods, and URLs all remain identical to the MUI version — only the look, feel, and underlying UI library change.

## Clarifications

### Session 2026-05-20

- Q: Should the CRD migration cover both the `/sign_up` quick-registration route and the `/registration` full-Kratos route, or just one of them? → A: Both routes must be migrated; every existing MUI authentication URL gets a CRD equivalent.
- Q: Must the CRD auth screens replicate the MUI screens' observability (APM transactions and analytics events)? → A: Full parity — the CRD versions emit the same APM transactions and the same analytics events the MUI versions emit today.
- Q: What level of test coverage is required for the new CRD auth screens? → A: Match the current CRD-migration test pattern — same coverage shape the already-migrated CRD pages have today (unit tests on the presentational components + integration tests on the glue layer where peer CRD pages have them). No new end-to-end Kratos round-trip tests introduced specifically for this migration.
- Q: Should this spec refactor the already-shipped CRD error pages (`CrdAuthRequiredPage`, `CrdForbiddenPage`, `CrdRedirectDialog`) onto the new shared auth shell? → A: Out of scope. They stay exactly as they are today. This spec only ships the brand-new CRD screens for the previously-unmigrated MUI auth routes; the existing CRD error pages are not touched, not refactored, and not held to visual alignment with the new screens.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in with email and password in the new design (Priority: P1)

A returning user who has set their design preference to the new version visits the application while signed out. They land on the sign-in screen and see the new CRD shell — the constellation background, the right-side card, the Alkemio logo and tagline in the card header, the "No account? Sign up" link in the top-right, an email field, a password field with a show/hide toggle, a "Forgot password?" link, a primary "Sign in" button, an "or continue with" divider, and the row of social/passkey provider icons. They enter their credentials and are signed in, then redirected to wherever they were going (or the home dashboard).

**Why this priority**: Sign-in is the single most-trafficked authentication entry point. Without it, no CRD-mode user can authenticate at all, and the design-version preference effectively traps them in MUI for the most visible moment of their session. This is the minimum viable slice — if only one screen ships, this is it.

**Independent Test**: Set `designVersion=2`, sign out, visit the sign-in URL, sign in with valid credentials, and confirm the user lands in the CRD shell on the post-login destination. Verify visual parity with the supplied screenshot, that all fields submit, that errors display, and that the social/passkey row renders the same set of methods that the MUI version offers.

**Acceptance Scenarios**:

1. **Given** a signed-out user with `designVersion=2`, **When** they visit the sign-in URL, **Then** the CRD-styled sign-in card renders inside the CRD shell (constellation background, CRD footer, no MUI styling visible) and matches the supplied sign-in screenshot.
2. **Given** the CRD sign-in screen, **When** the user enters a valid email and password and submits, **Then** they are signed in and redirected to the same destination the MUI flow would have used for the same credentials.
3. **Given** the CRD sign-in screen with an invalid email/password combination, **When** the user submits, **Then** the same server-side error message the MUI version displays appears, associated with the relevant field, and the user stays on the sign-in screen.
4. **Given** the CRD sign-in screen, **When** the user clicks the password show/hide icon, **Then** the password field toggles between obscured and plain text, and the toggle remains operable via the keyboard.
5. **Given** the CRD sign-in screen, **When** the user clicks a social/passkey provider icon, **Then** the same OIDC/passkey flow the MUI version would have started begins, returning the user to the CRD shell on success.
6. **Given** a sign-in URL with a `returnUrl` query parameter (or whatever parameter the MUI version uses), **When** the user signs in successfully, **Then** they are redirected to that destination in the CRD shell, identical to the MUI behaviour.
7. **Given** the CRD sign-in screen, **When** the user clicks "No account? Sign up", **Then** they navigate to the CRD sign-up screen.
8. **Given** the CRD sign-in screen, **When** the user clicks "Forgot password?", **Then** they navigate to the CRD password-recovery screen.

---

### User Story 2 - Create a new account in the new design (Priority: P2)

A first-time visitor with the new design active (or whose first visit defaults them to the new design) wants to create an account. They reach the sign-up screen via the "Sign up" link in the sign-in card header (or directly via the sign-up URL or a marketing link), see the CRD-styled sign-up card, read the intro paragraph linking to Terms of Use and Privacy Policy, tick the "I accept" checkbox, fill in email + first name + last name, and continue. The "Next" button stays disabled until the checkbox is ticked and the required fields are valid. They can also choose to continue with one of the social providers shown below the form.

**Why this priority**: Sign-up is the primary path for growth. Without a CRD version, every newly converted CRD-mode user (and every word-of-mouth signup arriving at a CRD-mode environment) sees an MUI screen at the very first impression of the new design. P2 because the user base of returning users (P1) is larger than the inbound of new users.

**Independent Test**: Set `designVersion=2`, navigate to the sign-up URL, complete the form, verify the account is created with the same backend effects as the MUI version, and visually compare against the supplied sign-up screenshot.

**Acceptance Scenarios**:

1. **Given** a signed-out user with `designVersion=2`, **When** they navigate to the sign-up URL, **Then** the CRD-styled sign-up card renders, matching the supplied sign-up screenshot.
2. **Given** the CRD sign-up screen with the Terms-of-Use checkbox unchecked, **When** the user fills in all required fields, **Then** the primary "Next" button remains disabled.
3. **Given** the CRD sign-up screen with the checkbox checked and all required fields valid, **When** the user clicks "Next", **Then** the same backend account-creation flow the MUI version triggers runs, and the user advances to the same next step (e.g., email-verification screen) inside the CRD shell.
4. **Given** the CRD sign-up screen, **When** the user clicks a social provider icon, **Then** the same OIDC sign-up flow the MUI version starts begins, returning the user to the CRD shell on completion.
5. **Given** the CRD sign-up screen, **When** the user clicks the Terms of Use or Privacy Policy link (in either the intro paragraph or the checkbox label), **Then** the corresponding policy opens (matching the MUI link target and behaviour).
6. **Given** the CRD sign-up screen, **When** the user clicks "Have an account? Sign in", **Then** they navigate to the CRD sign-in screen.
7. **Given** an email already registered with the same backend, **When** the user attempts to sign up with it, **Then** the same error message the MUI version shows appears, associated with the email field.

---

### User Story 3 - Recover a forgotten password in the new design (Priority: P3)

A user who cannot remember their password reaches the password-recovery screen (via the "Forgot password?" link on the sign-in card or by direct navigation), enters their email, and submits. They receive a recovery email that links back into the application; following that link puts them on a CRD-styled "set new password" screen where they choose a new password and complete the recovery. Once recovery is complete, they land in the CRD shell.

**Why this priority**: Password recovery is essential but lower-traffic than sign-in and sign-up. A user who cannot recover their password is locked out of the platform regardless of design version, so a working CRD path is a hard requirement once P1 and P2 ship, but it does not gate the most-trafficked paths.

**Independent Test**: From the CRD sign-in screen, click "Forgot password?", complete the recovery request, follow the resulting email link (or the equivalent test harness for it), set a new password, and confirm that the entire round-trip stays inside the CRD shell and that the new password successfully signs the user in.

**Acceptance Scenarios**:

1. **Given** the CRD sign-in screen, **When** the user clicks "Forgot password?", **Then** the CRD-styled password-recovery card renders, matching the supplied password-recovery screenshot.
2. **Given** the CRD password-recovery screen, **When** the user enters a registered email and clicks "Continue", **Then** the same backend recovery-email flow the MUI version triggers runs, and the user sees the same confirmation feedback the MUI version shows.
3. **Given** a user clicks the recovery link delivered by email, **When** the application opens that link with `designVersion=2`, **Then** a CRD-styled "set new password" screen renders inside the same auth shell.
4. **Given** the CRD set-new-password screen, **When** the user submits a valid new password, **Then** the backend updates the password and the user is signed in / redirected exactly as the MUI version would.
5. **Given** the CRD set-new-password screen, **When** the user submits a password the backend rejects (too short, breached, etc.), **Then** the same error the MUI version displays appears, associated with the password field.

---

### User Story 4 - Verify a new email address in the new design (Priority: P3)

After sign-up, a user is asked to verify their email. They see a CRD-styled "please verify your email" screen explaining the next step, then click the verification link sent to their inbox. The link returns them to the application, which completes the verification and lands them in the CRD shell, signed in.

**Why this priority**: Email verification is a mandatory step for new accounts; without a CRD version, every new user pops out of CRD into MUI as soon as they finish sign-up. Same priority bucket as recovery — needed for completeness once the main flows ship.

**Independent Test**: Complete a fresh sign-up in the CRD shell, observe the verification-pending screen, click the verification link from the email (or the test-harness equivalent), and confirm the verification completes inside the CRD shell.

**Acceptance Scenarios**:

1. **Given** a user just completed sign-up with `designVersion=2`, **When** the application renders the post-sign-up state, **Then** a CRD-styled "verify your email" screen appears inside the auth shell.
2. **Given** the verification email has been sent, **When** the user clicks the verification link, **Then** the verification completes via the same backend flow the MUI version uses, and the user lands in the CRD shell signed in (or on whichever destination the MUI flow uses).
3. **Given** a user revisits the application before verifying their email, **When** the application enforces the verification requirement, **Then** the CRD-styled verification reminder appears (matching whatever reminder the MUI version shows in the same state).

---

### User Story 5 - Encounter an auth-flow error in the new design (Priority: P4)

A user reaches the application in an unexpected auth state — session expired, an OIDC handshake error, an invalid recovery token, etc. They see a CRD-styled message inside the same auth card shell explaining what happened and what they can do next, with the action button(s) that the MUI version offers in the same state.

**Why this priority**: These states are low-traffic individually but visible across the whole auth surface. They are the lowest priority because users hitting them are already off the happy path. Last to ship.

**Independent Test**: Force each error state (manipulate the session, follow a stale recovery link, cancel at an OIDC provider, etc.) and confirm the CRD-styled card renders with the same copy and actions as the MUI version.

**Acceptance Scenarios**:

1. **Given** an authentication flow returns an error from the backend (the Kratos error route, an invalid recovery token, etc.), **When** a user with `designVersion=2` arrives at the auth-error route, **Then** the CRD-styled error card renders inside the new shared auth shell with the same message and recovery actions the MUI version offers.
2. **Given** a user with `designVersion=2` is already signed in and navigates to the sign-in URL, **When** the application detects the existing session, **Then** the existing `CrdAuthRequiredPage` continues to handle the response exactly as it does today; this spec does not modify that page's content, structure, or shell.

---

### Edge Cases

- **Returning to a partially completed flow** (e.g., the user closes the tab mid sign-up): the CRD screens must restore the same state the MUI screens would (backend-driven via the active flow id), without losing the user's input that was already submitted to the server.
- **Direct navigation to an auth URL without a valid flow id** (the server rejects the request because the flow expired): the CRD screens must surface the same recoverable-error UI the MUI version surfaces, with a path back to a fresh flow.
- **OIDC provider returns an error** (user cancels at provider, provider denies, network error): the CRD card must show the same error message the MUI card shows, in the same place.
- **A user switches design version mid-flow** (e.g., flips from MUI to CRD in the user menu while signed in, then signs out): the next visit to an auth URL must render the CRD version even though the user just left an MUI shell.
- **Cross-tab session change**: if the user signs in successfully in one tab while the sign-in screen is open in another, the screen behaves the same way the MUI version does (no regression in cross-tab behaviour).
- **Rate-limit / lockout from the backend**: the CRD card surfaces the same rate-limit message and back-off behaviour the MUI card does.
- **`returnUrl` (or equivalent) points outside the platform**: post-sign-in redirect behaviour matches MUI exactly (same allow-list / fallback).
- **Small-viewport (mobile) rendering**: the auth card collapses to a single-column layout the same way every other CRD page does on mobile; the constellation background and footer remain present and legible.
- **Language switcher in the footer**: switching language on any auth screen updates the visible strings without losing in-progress form input (matching MUI behaviour).
- **A passkey-capable browser arrives at sign-in**: the passkey button is offered exactly when the MUI version offers it (e.g., when the backend indicates passkey support for the flow).
- **A new social provider is added on the backend**: the CRD screen renders it automatically (because the provider list is backend-driven), with a sensible fallback label and icon if no visual customization exists for it yet.
- **An existing user with `designVersion=1` follows a recovery link**: they continue to see the MUI screens; this spec must not change MUI behaviour for those users.
- **Anonymous user with no stored `designVersion` preference**: they see whichever auth shell the default boot-time value selects (today: MUI / `designVersion=1`), unchanged by this spec.

## Requirements *(mandatory)*

### Functional Requirements

#### Coverage & Routing

- **FR-001**: Every authentication-flow URL that today still renders an MUI screen MUST, when the user's effective design version is `2`, render an equivalent CRD screen instead. This covers, at minimum: the sign-in screen, **both** the legacy quick-registration screen AND the full Kratos-registration screen (the two distinct registration entry points that exist in the MUI app today), the password-recovery request screen, the set-new-password screen, the email-verification screen, the email-verification reminder screen, and the auth-error fallback. Concretely, the in-scope routes are `/identity/login`, `/identity/registration`, `/identity/sign_up`, `/identity/recovery`, `/identity/verify` (including the verification-reminder sub-path), and `/identity/error`. The `/identity/required` ("already signed in" / auth-required) route is explicitly excluded — it is already served by the shipped `CrdAuthRequiredPage` and this spec does not touch it; `/identity/settings` and `/identity/logout` are likewise out of scope.
- **FR-002**: The URL paths used by the CRD screens MUST be identical to the URL paths used by the MUI screens. No path may be renamed or moved as part of this migration, so that existing bookmarks, marketing links, server-issued redirect URIs, and emails sent by the backend (recovery and verification links) continue to work unchanged.
- **FR-003**: Users with effective design version `1` (the current default) MUST continue to see the existing MUI screens unchanged. This spec must not modify any MUI route, page component, layout, or behaviour.
- **FR-004**: The selection between MUI and CRD auth screens MUST use the same design-version mechanism already used by every other migrated page (the project's existing CRD-enabled boot-time check). No new toggle, no new preference, no separate flag.

#### Visual Parity & Shell

- **FR-005**: The CRD auth screens MUST be presented inside a shared auth shell that provides the full-bleed constellation background illustration currently used by the MUI auth screens, a centred / right-aligned card containing the per-screen content, the CRD footer (terms / privacy / security / Alkemio mark / support / about / language switcher), and a floating help button. The shell MUST be reused across every screen covered by this spec so visual consistency is guaranteed by construction.
- **FR-006**: Each auth card MUST display in its header the Alkemio logo, the "Safe Spaces for Collaboration" tagline, and a contextual cross-link to the alternate flow (e.g., "No account? Sign up" on sign-in, "Have an account? Sign in" on sign-up, "No account? Sign up" on password recovery), placed exactly as shown in the supplied screenshots.
- **FR-007**: Visual treatment (typography, spacing, colours, button styles, divider, social icon row, focus indicators) MUST follow the existing CRD design system tokens and conventions — the same tokens and primitives every other migrated CRD page uses. The screens must not introduce one-off styling.
- **FR-008**: The supplied screenshots (sign-in, sign-up, password recovery) are the visual reference. The completed CRD screens MUST match those screenshots in layout, copy, control placement, and overall feel at desktop widths, and MUST degrade gracefully to a stacked single-column layout on small viewports.

#### Behaviour Parity

- **FR-009**: Form fields rendered on each screen MUST be exactly the same set of fields the MUI version renders for the same backend flow state (driven by the backend's flow descriptor, not hardcoded by the CRD layer beyond presentation customisations).
- **FR-010**: Client-side and server-side validation behaviour MUST be identical to the MUI version. Field-level errors MUST be associated with the relevant field and rendered in the same place a sighted user would expect.
- **FR-011**: Social / OIDC provider buttons MUST reflect whatever providers the backend advertises for the current flow, in the same order and with the same icons the MUI version uses. Where the MUI version applies visual customisations (icon, label) for known providers, the CRD version MUST apply the same customisations; an unrecognised provider (one with no visual customisation) MUST still render — using the backend-supplied provider label and a generic provider icon (the `Globe` icon from the shared CRD icon set) — rather than disappearing.
- **FR-012**: The passkey button (where the MUI version offers it for the current flow) MUST be offered by the CRD version under the same conditions and trigger the same backend behaviour. Because a passkey button is not a plain form submission (it initiates a browser WebAuthn ceremony rather than POSTing the form), the CRD presentational layer MUST delegate the actual trigger to the integration layer via a callback; the integration layer is responsible for invoking the correct browser/Kratos passkey routine and for surfacing the same passkey-specific error states (script not loaded, browser not supported, ceremony failed) the MUI version surfaces.
- **FR-013**: The "show / hide password" toggle MUST be present on every password input the MUI version offers it on, MUST be keyboard-operable, and MUST have an accessible label that reflects its current state.
- **FR-014**: Post-sign-in / post-sign-up / post-recovery redirect behaviour MUST be identical to the MUI version, including preservation of any return-URL query parameter the MUI version preserves, and the same fallback destination when none is supplied.
- **FR-015**: Any cross-screen affordances (e.g., the recovery-success message, the verification reminder, the "session expired" recovery action) MUST behave identically to the MUI version — same destinations, same retry semantics, same persistence. Specifically, when a flow has expired server-side, the recovery action is the one already provided by the reused flow data layer (it redirects the browser to a freshly created flow); the CRD screens inherit this behaviour unchanged by reusing that data layer rather than re-implementing expiry handling, and an explicit backend error redirects to the auth-error route covered by User Story 5.
- **FR-016**: Server-issued errors, rate-limit messages, and lockout indicators MUST surface inside the CRD card with the same copy and same recovery actions the MUI version offers.

#### Translations

- **FR-017**: Every user-visible string on the CRD auth screens MUST come from a translation file — no hardcoded text. The CRD auth screens MUST cover every language the platform supports today (English, Dutch, Spanish, Bulgarian, German, French). All languages MUST be supplied in the same delivery; no language may ship empty or fall back silently to English.
- **FR-018**: Translation keys for these CRD screens MUST follow the project's CRD i18n conventions (a dedicated per-feature namespace under the existing CRD i18n folder, populated for all supported languages). They MUST NOT modify the main `translation` namespace used by the MUI screens, and MUST NOT be routed through the Crowdin workflow that governs the MUI strings.

#### Accessibility

- **FR-019**: Every CRD auth screen MUST meet WCAG 2.1 AA. Specifically: every input has a persistent visible label, every interactive element is reachable and operable by keyboard, every interactive element shows a visible focus indicator, errors are associated with their inputs by accessible relationship (so screen readers announce them when the field receives focus), icon-only controls have accessible names, and text contrast against the card background and the illustration background meets the AA threshold.
- **FR-020**: Loading and submitting states on every form MUST be announced to assistive technology and MUST visibly disable the relevant control while a submission is in flight.

#### Observability

- **FR-021**: Every CRD auth screen MUST be instrumented with the same APM transactions (route-level tracing) the corresponding MUI screen emits today, using the same transaction names so existing dashboards, alerts, and route-level performance metrics continue to function unchanged once CRD becomes the default shell.
- **FR-022**: Every analytics event the MUI auth screens emit today (page views, submission attempts, success / failure outcomes, provider selections, etc.) MUST also be emitted by the CRD equivalents, with the same event names, properties, and timing. No event silently drops when a user is on `designVersion=2`, and no new event is introduced that does not also fire on the MUI side.

#### Testing

- **FR-023**: The CRD auth screens MUST be tested with the same shape of coverage the project's already-migrated CRD pages have today — unit / behavioural tests on each new CRD presentational component, plus integration tests on the integration / glue layer (route dispatch on `designVersion=2`, mapping of backend flow descriptors into component props, error rendering) where peer migrated pages cover the equivalent surface. This migration MUST NOT introduce new end-to-end tests that boot the authentication backend; verification of the live round-trip is performed by the same manual / out-of-band means used for peer migrations.

#### Scope Boundaries

- **FR-024**: This spec MUST NOT change the authentication backend, the set of supported sign-in methods, the URL paths, the cookies/storage used, or any server-side flow. Anything that requires a backend change is out of scope.
- **FR-025**: The existing MUI auth screens MUST remain in the codebase and continue to function unchanged for users on `designVersion=1`. They will be removed in a future cleanup once the design-version toggle itself is retired — not in this spec.
- **FR-026**: This spec MUST NOT cover authenticated identity/profile settings screens (e.g., the post-login Kratos settings flow). Those are protected, in-shell pages and are covered by separate migration work.
- **FR-027**: This spec MUST NOT introduce new authentication features (e.g., new providers, additional MFA factors, "remember last provider") that the MUI version does not already offer.

### Key Entities

- **Authentication flow**: An in-progress server-managed sign-in / sign-up / recovery / verification / settings session, identified by a flow id supplied in the URL. The screens are stateless presenters of whatever the flow currently asks for; field shape, available providers, current errors, and next step all come from the flow.
- **Design version preference**: A per-user value (`1` = MUI, `2` = CRD; default `1`) that already governs which shell renders every other migrated page. This spec consumes it; it does not introduce, alter, or replace it.
- **Return URL**: An optional query parameter that captures where the user was trying to go before being sent to authenticate. Its preservation across the flow is part of the parity requirement; the spec does not change the parameter name, scope, or persistence mechanism.
- **Authentication provider**: A passkey or third-party identity provider (Microsoft, LinkedIn, GitHub, Apple, Cleverbase, etc.) advertised by the backend for the current flow. The CRD screens render whichever set the backend returns; the spec does not introduce or remove any provider.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with design version `2` can complete a sign-in, a sign-up, a password recovery + reset round-trip, and an email verification without ever seeing the old MUI shell at any point in any of those flows.
- **SC-002**: For every authentication screen covered by this spec, a side-by-side comparison with the supplied screenshots (where supplied) and with the MUI rendering (otherwise) shows visual parity at desktop widths and a sensible responsive collapse at small viewports.
- **SC-003**: For every authentication screen, a parity test confirms that the same input that succeeds against the MUI version also succeeds against the CRD version, and the same input that fails against the MUI version also fails against the CRD version with the same error message — for valid credentials, invalid credentials, invalid email format, breached / too-short password, missing required fields, expired flow, rate limit, and OIDC-provider error.
- **SC-004**: Every authentication screen covered by this spec is fully usable by keyboard alone (Tab order is logical, every control is reachable, focus is always visible, password show/hide is keyboard-operable, social provider buttons are reachable and operable), and is announced correctly by a screen reader (form field labels, current errors, current submitting state).
- **SC-005**: Every user-visible string on the new CRD auth screens is available in all six supported languages on the day the feature ships; none falls back to English at runtime.
- **SC-006**: A user toggling their design-version preference from `1` to `2` (or vice versa) and then revisiting an authentication URL immediately sees the version corresponding to their new preference, with no manual cache clearing required.
- **SC-007**: Existing MUI auth users (design version `1`) see no functional or visual change to any authentication screen — the migration is invisible to them.
- **SC-008**: Existing email recovery links and verification links delivered by the backend before this feature ships continue to land the user on a working screen (CRD if their preference is `2`, MUI if it is `1`) without any URL changes or 404s.

## Assumptions

- The set of authentication flows, URL paths, supported providers, validation rules, return-URL semantics, and error states are taken from the live MUI implementation. The MUI version is the source of truth for behaviour; the spec deliberately defers to it rather than redefining it.
- The CRD design system's existing shell conventions (background-illustration treatment, card layout, footer, language switcher, floating help button) are the source of truth for visual style. Where the auth screens require shell elements that do not yet exist as reusable CRD building blocks (e.g., a dedicated reusable auth shell), they will be created during implementation and reused across every screen in this spec.
- The "Design Version" switch in the user menu is unauthenticated-user-irrelevant: anonymous visitors land in the default shell (`1` / MUI today) and only experience the CRD auth screens once they have opted in. This is consistent with the rest of the migration and not changed by this spec.
- The "remember last provider" affordance does **not** exist in the MUI version today, so it is out of scope here despite being mentioned as a "match if present" item in the input — parity means matching, not adding.
- Visual customisations for known social providers (icon, label, ordering) are reused from the existing MUI customisation map so that the same backend-advertised provider renders consistently across both shells. Unknown providers fall back to the backend-supplied label and a generic icon.

## Out of Scope

- Any change to the authentication backend, the set of identity providers, the cookies/storage mechanism, the URL paths, or the server-issued email templates.
- Migration of the protected, post-login Kratos identity-settings page (`/settings`) — that lives behind the authenticated shell and is covered by separate migration work.
- Any refactor, restructure, or visual realignment of the **already-shipped** CRD error pages (`CrdAuthRequiredPage`, `CrdForbiddenPage`, `CrdRedirectDialog`). They keep their current implementation and current shell. They are not migrated onto the new shared auth layout introduced by this spec, and they are not held to the visual-parity requirements that apply to the new screens.
- Removal or cleanup of the MUI auth pages, hooks, and assets — they stay in place until the design-version toggle itself is retired.
- Crowdin integration for the new CRD strings — CRD translations are managed manually (AI-assisted) per project convention; this spec ships translations in all six supported languages directly.
- Any new authentication feature not present in the MUI version (additional MFA factors, magic-link, social-login providers beyond what the backend advertises today, etc.).
