# Implementation Plan: Guest whiteboard return notification (CRD)

**Branch**: `110-guest-whiteboard-notice` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/110-guest-whiteboard-notice/spec.md`

## Summary

Restore the "You've left your whiteboard" guest-return notification — currently dead because it lived only on the orphaned MUI `SignUp.tsx` page — by re-implementing it as a presentational CRD component (`GuestReturnNotice`) and rendering it above the `SignUpCard` on the CRD sign-up route. The detection logic and action handlers already exist in `useGuestSessionReturn` (reads `alkemio_guest_name` + `alkemio_guest_whiteboard_url` from session storage, returns `shouldShowNotification`, `handleBackToWhiteboard`, `handleGoToWebsite`). The integration glue in `CrdSignUpPage` consumes that hook and feeds plain props to the CRD component. New copy goes into the `crd-auth` namespace across all six languages. No MUI files are deleted (deferred to a separate MUI auth-cleanup pass per FR-013).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: shadcn/ui + Tailwind v4 + Radix UI (`@/crd/primitives/*`), `lucide-react` (icons), `react-i18next`. No new runtime dependencies.
**Storage**: Browser `sessionStorage` (`alkemio_guest_name`, `alkemio_guest_whiteboard_url`) — existing keys, unchanged. No backend, no GraphQL.
**Testing**: Vitest + jsdom. New unit tests for the CRD component (render/actions) and the integration (conditional render off session state).
**Target Platform**: Web SPA (Vite), all supported browsers (>90% caniuse coverage).
**Project Type**: Web (single SPA). CRD presentational layer + `crdPages` integration glue.
**Performance Goals**: No measurable impact — a single conditional card on an auth page. No new network calls.
**Constraints**: Zero MUI/`@emotion` and zero business-logic imports inside `src/crd/`. WCAG 2.1 AA. i18n key parity across en, nl, es, bg, de, fr.
**Scale/Scope**: One new CRD component (~80 LOC), one new CRD i18n key group (`guestReturn.*`) × 6 locales, ~10 lines of integration wiring in `CrdSignUpPage`, plus tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Standard | Status | Notes |
|---|---|---|
| I. Domain-Driven Frontend Boundaries | ✅ PASS | Session-state logic stays in the existing `useGuestSessionReturn` hook (`src/domain/collaboration/whiteboard/guestAccess`). The CRD component is pure presentation; integration lives in `src/main/crdPages/auth`. |
| II. React 19 Concurrent UX Discipline | ✅ PASS | Pure render off props + session read on mount. No legacy lifecycle, no manual memoization (React Compiler). Conditional render only. |
| III. GraphQL Contract Fidelity | ✅ N/A | No GraphQL — feature reads session storage only. No codegen needed. |
| IV. State & Side-Effect Isolation | ✅ PASS | Side effects (navigation, `sessionStorage` reads, `window.location.assign`) are confined to the existing domain hook + integration layer; the CRD component receives plain `on*` callbacks and `show`/text props. |
| V. Experience Quality & Safeguards | ✅ PASS | Real `<button>`/`<a>` controls with accessible names, visible focus ring, keyboard-reachable. Unit tests cover non-trivial logic (conditional visibility + actions). |
| Arch #2 — CRD-only, MUI frozen | ✅ PASS | New component built in `src/crd/components/auth/`. No `@mui/*`/`@emotion/*`. No MUI files added; the dead MUI ones are intentionally NOT touched here. |
| Arch #3 — i18n CRD namespaces, parity | ✅ PASS | New strings go to `src/crd/i18n/auth/auth.<lang>.json` (`crd-auth`), all six languages in this PR. Legacy core keys untouched. |
| Arch #5 — No barrel exports | ✅ PASS | Explicit file-path imports only. |
| Arch #6 — SOLID / DRY | ✅ PASS | Reuses existing `useGuestSessionReturn` (DRY); component has a single presentational responsibility (SRP); behaviour injected via props (DIP). |

**Result**: PASS — no violations, Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/110-guest-whiteboard-notice/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── GuestReturnNotice.contract.ts
└── checklists/
    └── requirements.md  # From /speckit.specify
```

### Source Code (repository root)

```text
src/crd/
├── components/
│   └── auth/
│       ├── GuestReturnNotice.tsx          # NEW — presentational CRD card
│       └── GuestReturnNotice.test.tsx     # NEW — render + action unit tests
└── i18n/
    └── auth/
        ├── auth.en.json                   # EDIT — add guestReturn.* group
        ├── auth.nl.json                   # EDIT — port existing NL copy
        ├── auth.es.json                   # EDIT — port existing ES copy
        ├── auth.bg.json                   # EDIT — port existing BG copy
        ├── auth.de.json                   # EDIT — add DE copy (legacy was EN-only)
        └── auth.fr.json                   # EDIT — add FR copy (legacy was EN-only)

src/main/crdPages/auth/
├── SignUpCrdRoute.tsx                      # EDIT — render GuestReturnNotice above SignUpCard
└── SignUpCrdRoute.test.tsx                 # NEW — integration test: conditional render off guest session

# Reused unchanged (integration logic already exists):
src/domain/collaboration/whiteboard/guestAccess/
├── hooks/useGuestSessionReturn.ts          # read session + action handlers
└── utils/sessionStorage.ts                 # get/clear guest name + whiteboard URL

# Intentionally NOT modified (dead MUI — deferred to MUI auth cleanup, FR-013):
src/core/auth/authentication/pages/SignUp.tsx
src/domain/collaboration/whiteboard/guestAccess/components/GuestSessionNotification.tsx
```

**Structure Decision**: Standard CRD split — presentational component in `src/crd/components/auth/` (peer to `SignUpCard`, `LoginCard`), integration wiring in `src/main/crdPages/auth/SignUpCrdRoute.tsx`, domain/session logic reused from the existing `useGuestSessionReturn` hook. This mirrors how `SignUpCard` is already consumed by `CrdSignUpPage`.

## Complexity Tracking

> No Constitution Check violations — section intentionally empty.
