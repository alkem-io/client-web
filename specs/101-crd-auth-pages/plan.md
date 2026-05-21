# Implementation Plan: CRD Authentication Pages

**Branch**: `101-crd-auth-pages` | **Date**: 2026-05-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/101-crd-auth-pages/spec.md`

## Summary

Build CRD-styled equivalents of every still-MUI-only authentication screen (sign-in, both registration entry points, password recovery, set-new-password, email verification, the verification-reminder, and the auth-error fallback) so that users on `designVersion=2` no longer drop out of the new shell when they sign in, register, or recover access. Visual treatment matches the supplied screenshots; backend behaviour is unchanged.

**Technical approach**: Reuse the existing Kratos data layer (`useKratosFlow`, `useReturnUrl`, all sibling auth hooks). Introduce a thin **flow-descriptor adapter** in the integration layer that turns Kratos `UiNode[]` arrays into plain TypeScript prop types so the new CRD presentational components stay clean of Kratos imports. Reproduce the MUI `KratosUI` node-grouping logic inside a new `CrdKratosFlow` component that consumes the adapted descriptor. Extend `IdentityRoute.tsx` to dispatch each `/identity/*` route between MUI and CRD with `useCrdEnabled()` — same pattern already used for `/identity/required`. Wrap every CRD auth screen in a brand-new shared `AuthShell` layout (full-bleed constellation background, right-aligned card, footer); the already-shipped `CrdAuthRequiredPage` is **not** refactored onto this shell (per spec clarification).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (with React Compiler), Node 24.14.0 (Volta-pinned)
**Primary Dependencies** (all existing — no new runtime deps):
- shadcn/ui (Radix UI) + Tailwind CSS v4 + `class-variance-authority` + `lucide-react` (CRD layer)
- `react-i18next` for the new `crd-auth` namespace
- `@ory/kratos-client` (already loaded by the existing MUI auth layer — stays in `src/core/auth/`)
- `react-router-dom` (integration layer only)
- Apollo Client (only for the `useDesignVersionSync` reconciliation already wired upstream — no new GraphQL operations introduced by this feature)
**Storage**: None new. The existing localStorage key `alkemio-design-version` and Kratos's session/cookie storage are reused unchanged.
**Testing**: Vitest + `@testing-library/react` (jsdom). Per spec clarification, match the existing CRD-migration test pattern (unit tests on new CRD presentational components, integration tests on the new integration-layer dispatchers / data adapters where peer migrated pages cover the equivalent surface). No new end-to-end Kratos tests.
**Target Platform**: Modern evergreen browsers (>90% caniuse coverage per project rule).
**Project Type**: Web SPA (single project; existing repository layout).
**Performance Goals**: No regression on the auth surface vs. MUI. The CRD bundle for these pages is lazy-loaded the same way every other migrated CRD page is.
**Constraints**:
- **Hard restriction**: every file under `src/crd/` MUST respect the CRD golden rules (no MUI, no business logic, no GraphQL types, no `react-router-dom`, no `formik`, no `@/core/auth/*` imports — see `src/crd/CLAUDE.md`).
- **Hard restriction**: every file under `src/main/crdPages/auth/` MUST NOT import from `@mui/*` or `@emotion/*` (the integration layer is MUI-free even though it sits outside `src/crd/`).
- **URL parity**: every `/identity/*` URL path must remain byte-identical to today (Kratos-issued emails contain these URLs).
- **Behaviour parity**: every field, error, redirect, and supported method must match the MUI version exactly; the backend is unchanged.
- **Observability parity** (FR-021, FR-022): same APM transaction wrapping and same analytics events as the MUI screens.
**Scale/Scope**: 8 user-facing auth screens to migrate × 6 supported languages (en, nl, es, bg, de, fr). Estimated ~8–12 new CRD presentational components + 1 new shared layout + 1 new flow-descriptor adapter + per-route dispatchers under `IdentityRoute.tsx`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|-----------|-------|
| **I. Domain-Driven Frontend Boundaries** | ✅ Pass | All Kratos / domain logic stays in `src/core/auth/`; the integration layer in `src/main/crdPages/auth/` is the only place where Kratos types and CRD prop types meet (via the flow-descriptor adapter). CRD presentational components in `src/crd/components/auth/` know nothing about Kratos. |
| **II. React 19 Concurrent UX Discipline** | ✅ Pass | Form submission is a native `<form action method>` POST that Kratos handles via full-page navigation — it is inherently non-blocking and needs no `useTransition`/Actions wrapper (introducing one would be ceremony with no behavioural benefit). The only async data-fetch this feature renders is the initial Kratos flow load, handled by the reused `useKratosFlow` hook and presented with an explicit skeleton loading state so paint is never blocked. Rendering is pure; no deprecated lifecycle patterns introduced. |
| **III. GraphQL Contract Fidelity** | ✅ N/A | This feature does not introduce new GraphQL operations. The existing `useDesignVersionSync` GraphQL hook is consumed unchanged from upstream — no codegen needed. |
| **IV. State & Side-Effect Isolation** | ✅ Pass | Persistent state stays in existing Apollo caches and Kratos cookies. CRD components hold visual-only `useState` (show/hide password, transient cooldown UI). The 30-second recovery cooldown's `sessionStorage` write stays in the integration layer; the CRD component receives a `submitDisabled` prop + `submitLabelOverride` callback. |
| **V. Experience Quality & Safeguards** | ✅ Pass | WCAG 2.1 AA enforced per `FR-019`, `FR-020`. APM + analytics parity per `FR-021`, `FR-022`. Tests follow the established CRD-migration pattern per `FR-023`. |
| **Architecture standards** | ✅ Pass | Files placed in canonical locations: `src/crd/` (design system), `src/main/crdPages/auth/` (integration), `src/core/auth/` untouched on the MUI side. Existing barrel-export ban respected — every new file is imported by explicit path. |
| **SOLID** | ✅ Pass | SRP: each CRD component renders one screen / one form region. OCP: the flow-descriptor adapter is parameterised by flow type, so adding a future Kratos node type extends without modifying existing screens. DIP: CRD components depend on the plain `KratosFlowDescriptor` abstraction, never on `@ory/kratos-client` types. |

**Result**: No violations. No entries needed in Complexity Tracking. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/101-crd-auth-pages/
├── spec.md              # /speckit.specify (done)
├── plan.md              # this file (/speckit.plan)
├── research.md          # /speckit.plan Phase 0
├── data-model.md        # /speckit.plan Phase 1
├── quickstart.md        # /speckit.plan Phase 1
├── contracts/           # /speckit.plan Phase 1 — TS interfaces for CRD components
│   ├── crd-auth-components.ts
│   └── flow-descriptor.ts
├── checklists/
│   └── requirements.md  # /speckit.specify (done)
└── tasks.md             # /speckit.tasks (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/crd/
├── components/auth/                          # NEW — presentational auth screens (pure UI, Tailwind only)
│   ├── SignInCard.tsx                        # main sign-in screen body
│   ├── SignUpCard.tsx                        # legacy quick-registration screen body (4 visible fields + checkbox)
│   ├── RegistrationCard.tsx                  # full-Kratos registration screen body
│   ├── PasswordRecoveryCard.tsx              # email-input recovery screen
│   ├── PasswordRecoveryCodeCard.tsx          # code-input second stage of recovery
│   ├── SetNewPasswordCard.tsx                # post-recovery password reset
│   ├── EmailVerificationCard.tsx             # "verify your email" screen
│   ├── EmailVerificationRequiredCard.tsx     # reminder screen
│   ├── AuthErrorCard.tsx                     # auth-error fallback
│   ├── CrdKratosFlow.tsx                     # node-grouped form renderer (CRD equivalent of MUI KratosUI)
│   ├── SocialProviderButton.tsx              # icon-only circular button for OIDC/passkey
│   ├── AuthCardHeader.tsx                    # shared logo + tagline + cross-link header
│   └── OrContinueWithDivider.tsx             # the "or continue with" horizontal rule + label
│
├── primitives/
│   └── (no new files expected — Button, Input, Card, Checkbox, Separator etc. all exist)
│
├── forms/                                    # NEW form-field wrappers (label + error, no form library)
│   ├── EmailField.tsx                        # labelled email input with error rendering
│   ├── PasswordField.tsx                     # labelled password input WITH show/hide eye toggle
│   ├── TextInputField.tsx                    # labelled text input (used for First/Last Name)
│   └── AcceptTermsCheckbox.tsx               # checkbox with rich-content label (Trans-style links inside)
│
├── layouts/
│   └── AuthShell.tsx                         # NEW — full-bleed background + right-aligned card slot + footer + help button
│
└── i18n/auth/                                # NEW namespace `crd-auth` — six language files
    ├── auth.en.json
    ├── auth.nl.json
    ├── auth.es.json
    ├── auth.bg.json
    ├── auth.de.json
    └── auth.fr.json

src/main/crdPages/auth/                       # NEW — integration / glue layer (no MUI, no Tailwind)
├── SignInCrdRoute.tsx                        # CRD sign-in page integration
├── SignUpCrdRoute.tsx                        # CRD quick-registration page integration
├── RegistrationCrdRoute.tsx                  # CRD full-registration page integration
├── PasswordRecoveryCrdRoute.tsx              # CRD recovery page integration (two-stage)
├── EmailVerificationCrdRoute.tsx             # CRD verification page integration
├── EmailVerificationRequiredCrdRoute.tsx     # CRD verification-reminder integration
├── AuthErrorCrdRoute.tsx                     # CRD auth-error integration
├── AuthShellWrapper.tsx                      # mounts the CRD AuthShell with footer language switcher wired up
├── flowDescriptorAdapter.ts                  # Kratos UiNode[] → KratosFlowDescriptor (plain TS for CRD)
├── socialProviderCustomizations.ts           # shared icon/label map (reused from existing MUI map)
├── passkeyTrigger.ts                         # invokes the browser/Kratos passkey routine for a resolved trigger
├── useAuthAnalytics.ts                       # emits the same analytics events the MUI pages emit today
└── __tests__/                                # integration tests for adapters + route dispatchers

src/core/auth/authentication/routing/
└── IdentityRoute.tsx                         # MODIFIED — extend the per-route CRD dispatcher (already used for /required) to every /identity/* route

src/core/i18n/
└── config.ts                                 # MODIFIED — register `crd-auth` in crdNamespaceImports

src/main/routing/
└── TopLevelRoutes.tsx                        # UNCHANGED — IdentityRoute() call stays where it is

public/alkemio-banner/global-banner.svg       # UNCHANGED — reused as the CRD auth-shell background
```

**Structure Decision**: Mirror the existing CRD-migration layout used by every prior migrated page. Three layers, three locations: (a) the design system (`src/crd/`), (b) the integration glue (`src/main/crdPages/auth/`), (c) route wiring (extend `IdentityRoute.tsx`). The integration layer is the only place GraphQL/Kratos types meet CRD prop types. The CRD presentational components do not touch routing, Kratos, or auth context — every behaviour they need arrives as a callback prop.

## Implementation Sequence (recommended order of work)

This is plan-level guidance — `/speckit.tasks` will produce the formal task list. Order matters because some primitives unblock multiple screens.

1. **Foundations**:
   - `AuthShell` layout (every screen depends on it).
   - `PasswordField`, `EmailField`, `TextInputField`, `AcceptTermsCheckbox` form wrappers.
   - `SocialProviderButton`, `OrContinueWithDivider`, `AuthCardHeader` shared components.
   - `crd-auth` i18n namespace skeleton (English first; other languages added before merge).
   - `flowDescriptorAdapter.ts` and the `KratosFlowDescriptor` type contract.

2. **CrdKratosFlow** — the centrepiece. Reproduce the MUI `KratosUI` grouping logic against the descriptor (default → password → reset link → submit → divider → passkey/OIDC, with the login-specific icon-row vs. registration full-width-row split).

3. **Sign-in screen** (P1) — first usable slice. Wire the route in `IdentityRoute.tsx`, prove the end-to-end pattern works against a real Kratos backend, smoke-test in browser.

4. **Sign-up screens** (P2) — both `/identity/sign_up` (curated minimal) and `/identity/registration` (full Kratos UI). Reuses `CrdKratosFlow` and the form wrappers.

5. **Password recovery + set-new-password** (P3) — the two-stage flow + cooldown logic stays in the integration layer; CRD card just renders `submitDisabled` + `submitLabelOverride`.

6. **Email verification + reminder** (P3) — relatively small; reuses the shell and CrdKratosFlow.

7. **Auth-error fallback** (P4) — simplest; static CRD card with translated copy and a back-to-sign-in button.

8. **Translations completeness** — populate all six languages for every key introduced.

9. **Analytics + APM wiring** — verify parity with MUI by side-by-side instrumentation check.

10. **Tests** — unit tests for each new CRD component (loading, error, submit states), integration tests for the per-route dispatcher behaviour + adapter correctness.

## Open Questions Resolved During Planning (see research.md for full rationale)

- **Loading state UX during Kratos flow fetch** → minimal centred skeleton card; matches the perceived weight of the MUI `Loading` component used by `LoginRoute`.
- **`PasswordField` placement** → `src/crd/forms/PasswordField.tsx` (form-field wrapper layer), not `primitives/`. It is a labelled, error-aware composition of the `input` primitive plus a `lucide-react` eye icon, which makes it a forms-layer concern.
- **`CrdKratosFlow` placement** → `src/crd/components/auth/CrdKratosFlow.tsx`. It is an auth-feature composite, not a generic primitive, and lives alongside the screens that use it.
- **Per-route dispatcher pattern** → extend `IdentityRoute.tsx` in place. The file already does `crdEnabled ? <CrdX /> : <MuiX />` for `/identity/required`; the same one-line dispatch repeats per route. Avoids a parallel `CrdIdentityRoute` and keeps both versions visible in one place.
- **Flow-descriptor shape** → see `data-model.md`. Loose-typed enough to round-trip every node type the live Kratos backend can return today; tight-typed enough that the CRD layer never has to import `@ory/kratos-client`.

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Kratos backend returns a node type / group not covered by the adapter | Low | Medium | Adapter falls back to a generic "default text input" rendering so unknown nodes degrade gracefully rather than disappear; logged via existing Sentry. |
| Visual drift between login (icon-row) and registration (full-width row) for OIDC/passkey | Medium | Low | `CrdKratosFlow` accepts a `flowType` prop and applies the same conditional layout the MUI `KratosUI` already encodes; both modes are covered by component tests. |
| The 30-second recovery cooldown sessionStorage logic regresses | Low | Medium | Cooldown logic stays untouched in the integration layer (lift from `RecoveryPage.tsx`); the CRD card receives `submitDisabled` + `submitLabelOverride` as props. |
| Accepted-terms checkbox session-state workaround (Kratos resets on validation error) breaks for the curated `SignUp.tsx` path | Medium | Medium | Mirror the existing sessionStorage-by-flow-id approach in the new integration layer; covered by an integration test that simulates a validation error and confirms the checkbox stays checked. |
| Analytics events emit twice (once from a shared upstream + once from the new screens) when the user is on CRD | Medium | Low | Audit each MUI page's emit site during research; document exactly which events fire from page-level vs. KratosUI vs. wrapper, and replicate at exactly one site in the CRD path. |
| Kratos email/verification links land on an MUI shell if the user's `designVersion` preference disagrees with localStorage | Medium | Low | The existing `useDesignVersionSync` already reconciles server-vs-localStorage on auth; covered. Anonymous-link clicks always read localStorage (default = MUI), which is the documented behaviour. |

## Phase 0: Research

See [research.md](./research.md) for full notes on:
- The MUI auth-page structural inventory (already mapped during clarification — included verbatim).
- The CRD design-system inventory (primitives present, form-field wrappers to build).
- The Kratos `UiNode` shape and how the adapter normalises it.
- The decision matrix for plan-level open questions.

## Phase 1: Design & Contracts

See:
- [data-model.md](./data-model.md) — `KratosFlowDescriptor` shape, `SocialProvider` shape, view-model shapes for every screen.
- [contracts/crd-auth-components.ts](./contracts/crd-auth-components.ts) — TypeScript interfaces for every new CRD presentational component (props in, callbacks out).
- [contracts/flow-descriptor.ts](./contracts/flow-descriptor.ts) — TypeScript interface for the adapter output (the contract between integration layer and CRD layer).
- [quickstart.md](./quickstart.md) — how to enable, run, and verify the CRD auth flow end-to-end against the live backend.

## Complexity Tracking

> No Constitution violations. Section intentionally empty.
