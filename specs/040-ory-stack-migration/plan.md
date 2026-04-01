# Implementation Plan: Ory Stack Migration — Client-Web

**Branch**: `040-ory-stack-migration` | **Date**: 2026-03-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/040-ory-stack-migration/spec.md`

## Summary

Migrate the Alkemio client-web authentication layer from `@ory/kratos-client` v1.3.8 to v26.2.0 to support the platform-wide upgrade to Ory Kratos v26.2.0. The SDK upgrade is type-compatible (additive only), but three behavioral breaking changes require client-side adaptations: Oathkeeper 429-to-401 rate-limit mapping (verify existing implementation), OIDC registration validation errors moving from `oidc` to `default` node group (verify existing rendering + review positioning), and OIDC account linking failures returning HTTP 400 instead of 200 (update error handling in `useKratosFlow.ts`).

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: `@ory/kratos-client` ^26.2.0 (upgrade from ^1.3.8), axios, Apollo Client, MUI, react-i18next
**Storage**: N/A (authentication state managed via Ory Kratos sessions/cookies)
**Testing**: Vitest with jsdom (unit); manual E2E against Kratos v26.2.0 backend
**Target Platform**: Web (SPA via Vite, served at localhost:3001)
**Project Type**: Web (frontend SPA — this migration is client-only)
**Performance Goals**: N/A — SDK swap with no architectural changes; auth flow latency is not expected to change
**Constraints**: Coordinated deploy with backend — no dual-version Kratos support; all commits signed
**Scale/Scope**: ~40 auth files under `src/core/auth/authentication/`, 5 flow types, 5 OIDC providers, WebAuthn/passkeys

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Domain-Driven Frontend Boundaries** | PASS | Auth logic stays in `src/core/auth/`. No new domain facades needed — this is an SDK upgrade within the existing auth infrastructure. |
| **II. React 19 Concurrent UX Discipline** | PASS | No new components or rendering patterns. Existing auth pages already use React 19 patterns. Changes are limited to error handling logic in hooks. |
| **III. GraphQL Contract Fidelity** | PASS | No GraphQL schema changes. Auth flows use Kratos REST API, not Apollo. The `kratosPublicBaseURL` config comes from GraphQL but the field is unchanged. |
| **IV. State & Side-Effect Isolation** | PASS | Side effects remain in dedicated hooks (`useKratosFlow`, `useKratosClient`). No new global state or cross-cutting concerns introduced. |
| **V. Experience Quality & Safeguards** | PASS | Rate-limit messaging uses i18n keys. OIDC error rendering uses existing accessible form components. No new interactive elements requiring WCAG review. |
| **Architecture Standard 3 (i18n)** | PASS | Any new error messages will be added to `translation.en.json` via `t()`. No hardcoded strings. |
| **Architecture Standard 5 (No barrels)** | PASS | No new barrel exports. All imports use explicit file paths. |
| **Engineering Workflow 5 (Root Cause)** | PASS | Each change addresses a specific Ory breaking change with documented rationale (see research.md). No workarounds or symptom-masking. |

**Gate result**: PASS — no violations.

### Post-Design Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Domain-Driven Frontend Boundaries** | PASS | All changes stay within `src/core/auth/authentication/`. Error handling changes in hooks, node rendering in `KratosUI.tsx`. No domain boundary violations. |
| **II. React 19 Concurrent UX Discipline** | PASS | No new rendering patterns. The 400-response handling in `useKratosFlow.ts` updates state via existing `setFlow` — concurrency-safe. |
| **III. GraphQL Contract Fidelity** | PASS | No GraphQL changes. |
| **IV. State & Side-Effect Isolation** | PASS | Error extraction from 400 responses stays in `useKratosFlow.ts` hook. No new global state. |
| **V. Experience Quality & Safeguards** | PASS | New error message for account linking (ID `1010016`) will be added to i18n. Existing accessible form rendering handles display. |

**Gate result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/040-ory-stack-migration/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output — SDK research findings
├── data-model.md        # Phase 1 output — entity and type changes
├── quickstart.md        # Phase 1 output — developer setup guide
└── contracts/
    └── kratos-api-changes.md  # Phase 1 output — API behavioral changes
```

### Source Code (affected files)

```text
src/core/auth/authentication/
├── hooks/
│   ├── useKratosClient.ts       # Kratos SDK initialization (SDK import update)
│   ├── useKratosFlow.ts         # Flow fetching & error handling (400 response handling)
│   └── useWhoami.ts             # Session check (verify unchanged)
├── components/
│   ├── KratosUI.tsx             # Node grouping & rendering (div node fallback, verify default group)
│   └── Kratos/
│       ├── helpers.ts           # Node type detection (add div node detection)
│       └── messages.tsx         # Error message translation (add 1010016 message)
├── pages/
│   ├── LoginPage.tsx            # Rate-limit lockout handling (verify existing implementation)
│   └── RegistrationPage.tsx     # OIDC error handling (verify default group rendering)
└── ...                          # Other files — verify no regressions

package.json                     # Bump @ory/kratos-client ^1.3.8 → ^26.2.0
src/core/i18n/en/translation.en.json  # Add i18n keys for new error messages
```

**Structure Decision**: This is a migration within the existing `src/core/auth/authentication/` infrastructure. No new directories, modules, or architectural changes needed. All modifications are surgical updates to existing files.

## Complexity Tracking

> No constitution violations — this section is empty by design.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
