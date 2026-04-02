# Feature Specification: Ory Stack Migration — Client-Web

**Feature Branch**: `040-ory-stack-migration`
**Created**: 2026-03-26
**Status**: Draft
**Input**: Migrate to the latest in the Ory Stack following the research from [alkemio#1677](https://github.com/alkem-io/alkemio/issues/1677) — focus on the stories in the client-web repo.
**Parent Epic**: [alkem-io/alkemio#1677](https://github.com/alkem-io/alkemio/issues/1677) — Ory Updates to latest (Oathkeeper + Hydra + Kratos)
**Related Issues**: [client-web#9396](https://github.com/alkem-io/client-web/issues/9396), [client-web#9461](https://github.com/alkem-io/client-web/issues/9461)

## Context

Alkemio's authentication stack uses Ory Kratos, Hydra, and Oathkeeper. The platform is upgrading from legacy versions (Kratos v1.3.1, Hydra v2.3.0, Oathkeeper v0.38.19-beta.1) to the unified v26.2.0 calendar versioning. This specification covers the **client-web** impact of that migration: updating the Kratos SDK, adapting authentication UI flows to breaking API changes, and evaluating Ory Elements as a replacement for the current custom-built auth UI.

The client-web currently has a fully custom Kratos UI implementation (~40 files) handling all five flow types (login, registration, settings, verification, recovery), five OIDC providers (Microsoft, LinkedIn, GitHub, Apple, Cleverbase), WebAuthn/passkeys, and terms acceptance. It uses `@ory/kratos-client` v1.3.8.

## User Scenarios & Testing

### User Story 1 — Update Kratos Client SDK and Adapt Call Sites (Priority: P1)

As a platform user, I need authentication flows to continue working seamlessly after the backend upgrades to Ory Kratos v26.2.0, so that I can log in, register, recover my password, and verify my email without disruption.

**Why this priority**: This is the foundational change. No other client-web story can be validated until the SDK is updated and all API call sites compile and function correctly against the new Kratos version. Without this, every auth flow breaks.

**Independent Test**: Can be tested by upgrading the SDK, running the backend with Kratos v26.2.0, and verifying that login, registration, recovery, verification, and settings flows all complete successfully end-to-end.

**Acceptance Scenarios**:

1. **Given** a user on the login page with backend running Kratos v26.2.0, **When** they enter valid credentials and submit, **Then** they are authenticated and redirected to the platform.
2. **Given** a new user on the registration page, **When** they complete all fields including terms acceptance and submit, **Then** their account is created and they receive a verification email.
3. **Given** a user on the recovery page, **When** they enter their email and submit, **Then** they receive a password recovery email and can set a new password.
4. **Given** a user clicking a verification link from email, **When** the verification flow completes, **Then** their email is marked as verified and they can proceed.
5. **Given** the SDK is upgraded, **When** the project is built, **Then** there are no TypeScript compilation errors related to Kratos client types.

---

### User Story 2 — Handle Oathkeeper 429-to-401 Mapping (Priority: P1)

As a user who triggers rate limiting (e.g., too many login attempts), I need to see a clear rate-limit message rather than being told I'm unauthorized, so that I understand why access is blocked and when to retry.

**Why this priority**: This is P1 because it directly impacts security UX. Without this change, rate-limited users see a generic "unauthorized" error instead of a helpful lockout message, which may cause confusion, unnecessary password resets, or support tickets.

**Independent Test**: Can be tested by triggering rate limiting on the login page (multiple failed attempts) and verifying the correct lockout message appears with a retry timer, even though the HTTP status is now 401 instead of 429.

**Acceptance Scenarios**:

1. **Given** a user who has exceeded login attempt limits, **When** Oathkeeper returns 401 (mapped from Kratos 429), **Then** the UI displays a rate-limit/lockout message with the retry-after duration in minutes.
2. **Given** a user who receives a 401 due to invalid credentials, **When** the error is displayed, **Then** the UI shows the standard "invalid credentials" message (not a lockout message).
3. **Given** rate limiting is active, **When** the lockout period expires and the user retries, **Then** the login flow proceeds normally.

---

### User Story 3 — Update OIDC Registration Node Group Handling (Priority: P1)

As a user registering via a social login provider, I need to see validation errors (e.g., missing email, name conflicts) displayed correctly during OIDC sign-up, so that I can resolve them and complete registration.

**Why this priority**: This is P1 because without it, OIDC registration validation errors become invisible — they exist in the `default` node group instead of `oidc`, and the UI will silently fail to show them.

**Independent Test**: Can be tested by initiating OIDC registration with a provider that returns incomplete profile data (e.g., missing email) and verifying that validation errors appear in the registration form.

**Acceptance Scenarios**:

1. **Given** a user registering via OIDC where the provider does not supply an email, **When** the registration flow returns validation errors in the `default` node group, **Then** the UI displays those errors to the user.
2. **Given** a user registering via OIDC where an account already exists with that email, **When** the flow returns the account-exists error, **Then** the user is redirected to login with an appropriate message.
3. **Given** the Kratos feature flag `legacy_oidc_registration_node_group` is not set, **When** OIDC registration validation fails, **Then** errors are still correctly rendered.

---

### User Story 4 — Handle OIDC Account Linking 400 Response (Priority: P2)

As a user attempting to link a social login provider to an existing account, I need the linking failure to be handled correctly when Kratos returns HTTP 400 instead of 200, so that I see an appropriate error message.

**Why this priority**: This affects a less common but important flow. Account linking failures are not everyday events, but when they occur the user needs clear feedback rather than an unhandled error.

**Independent Test**: Can be tested by triggering an OIDC account linking failure (e.g., linking a provider already associated with another account) and verifying the error is caught and displayed.

**Acceptance Scenarios**:

1. **Given** a user attempting to link an OIDC provider to their account, **When** the linking fails and Kratos returns HTTP 400, **Then** the UI displays a meaningful error message explaining the failure.
2. **Given** a successful OIDC account linking, **When** Kratos returns a success response, **Then** the flow completes and the provider appears in the user's settings.

---

### Edge Cases

- What happens when an OIDC provider returns unexpected node groups beyond `default` and `oidc`? The UI should render unknown groups in a fallback section rather than dropping them silently.
- What happens when the rate-limit 401 response body does not contain a `retry_after` value? The UI should display a generic "too many attempts, please try again later" message.
- What happens when a passkey flow encounters new node attributes introduced in v26.2.0? The script loading and execution should handle unknown attributes gracefully.
- What happens when a user is mid-flow (e.g., halfway through registration) during a deployment that upgrades Kratos? The 410 (Gone) flow expiration handler should redirect to restart the flow.

## Clarifications

### Session 2026-03-26

- Q: How should the client detect that a 401 is actually a rate-limit event? → A: Use the existing `lockout` query parameter added by the redirect chain.
- Q: Should the client support both old and new Kratos versions during rollout? → A: Coordinated deploy — client and backend upgrade together, no dual-version support needed.
- Q: What is the expected deliverable for Ory Elements evaluation (Story 5)? → A: Skip evaluation entirely — defer Ory Elements to a future feature.

## Requirements

### Functional Requirements

- **FR-001**: System MUST upgrade `@ory/kratos-client` to the version compatible with Kratos v26.2.0 and resolve all resulting type and API changes.
- **FR-002**: System MUST distinguish between genuine authentication failures (401) and rate-limiting events (401 mapped from 429) by checking for the `lockout` query parameter on the login redirect URL.
- **FR-003**: System MUST display a user-friendly lockout message with retry duration when rate limiting is detected, regardless of the HTTP status code received.
- **FR-004**: System MUST look for OIDC registration validation errors in the `default` node group in addition to the `oidc` group.
- **FR-005**: System MUST handle HTTP 400 responses from OIDC account linking flows and display appropriate error feedback.
- **FR-006**: System MUST maintain all existing authentication flows (login, registration, recovery, verification, settings) without regression after the migration.
- **FR-007**: System MUST continue to support all five OIDC providers (Microsoft, LinkedIn, GitHub, Apple, Cleverbase) after the SDK upgrade.
- **FR-008**: System MUST continue to support WebAuthn/passkey authentication after the SDK upgrade.
- **FR-009**: Ory Elements evaluation is deferred to a future feature and is explicitly out of scope for this migration.

### Key Entities

- **Kratos Flow**: Represents a self-service authentication flow (login, registration, recovery, verification, settings). Contains UI nodes organized by groups (`default`, `oidc`, `password`, `passkey`, etc.).
- **UI Node**: An individual form element within a flow. Has a `group` property that determines rendering. Groups include `default`, `oidc`, `password`, `passkey`, `webauthn`, `code`, `profile`.
- **OIDC Provider**: An external identity provider (Microsoft, LinkedIn, GitHub, Apple, Cleverbase) used for social sign-in and account linking.
- **Session**: Represents an authenticated user's session. Contains identity details and verification status.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All five authentication flows (login, registration, recovery, verification, settings) complete successfully end-to-end against Kratos v26.2.0 with zero regressions.
- **SC-002**: Rate-limited users see a lockout message with retry timer in 100% of rate-limiting scenarios, regardless of the HTTP status code returned by the gateway.
- **SC-003**: OIDC registration validation errors are visible to users in 100% of validation failure scenarios, including when errors are in the `default` node group.
- **SC-004**: OIDC account linking failures display a user-facing error message instead of an unhandled error or silent failure.
- **SC-005**: The project builds with zero TypeScript compilation errors after the SDK upgrade.
- **SC-006**: All existing automated tests pass after the migration.
- **SC-007**: Ory Elements evaluation is deferred and out of scope for this migration.

## Assumptions

- The backend (alkem-io/server) will be upgraded to Kratos v26.2.0 in parallel, and a compatible backend environment will be available for client-web testing. The client-web and backend upgrades will be deployed together as a coordinated release — no dual-version (old + new Kratos) compatibility is required in the client.
- Ory's unified calendar versioning (v26.2.0) applies across Kratos, Hydra, and Oathkeeper, but only Kratos and Oathkeeper changes have direct client-web impact.
- The `@ory/kratos-client` npm package will have a release compatible with Kratos v26.2.0. If the package naming has changed under the new versioning, the equivalent replacement package will be used.
- The Kratos feature flag `legacy_oidc_registration_node_group=true` will NOT be relied upon as a permanent solution; the client will be updated to handle the new `default` group behavior.
- Hydra changes (session cookie on logout — alkemio#1762) are handled server-side and do not require client-web changes beyond what the updated SDK provides.
- The rate-limiting detection strategy uses the existing `lockout` query parameter added by the redirect chain. When Oathkeeper maps a 429 to 401 and redirects to the login page, the `lockout` query parameter signals to the client that the 401 is a rate-limit event, not a genuine authentication failure.
