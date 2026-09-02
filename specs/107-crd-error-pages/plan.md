# Implementation Plan: Port the Error Pages to CRD

**Branch**: `story/9852-crd-error-pages` | **Date**: 2026-06-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/107-crd-error-pages/spec.md`
**Story**: alkem-io/client-web#9852

## Summary

Close the highest-visibility error-page migration gap: a CRD user (design version `2`,
the default) hitting an unknown URL currently drops into legacy MUI chrome. This plan
delivers **P1 — the CRD 404 / Not Found page** and wires it into both not-found entry
points (the in-router `Error40XBoundary` via `CrdAwareErrorComponent`, and the
`path="*"` catch-all in `TopLevelRoutes.tsx`), mirroring the existing CRD 403
(`CrdForbiddenPage`) pattern. Approach: add a props-only `CrdNotFoundPage` under
`src/crd/components/error/`, a shared `CrdNotFoundBranch` integration wrapper that
renders it inside `CrdLayoutWrapper`, performs the `log404NotFound()` side effect once,
and sets the tab title; extend the dispatcher with an `isNotFound` branch; toggle the
catch-all on `useCrdEnabled()`. Add a `notFound.*` i18n block across all six locales
with a parity test. P2 (generic 500 / Sentry boundary), P3 (lazy chunk dialog), and P4
(MUI cleanup) are specified but deferred to follow-up PRs.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: CRD layer (`@/crd/primitives/*`, `@/crd/lib/utils` `cn()`), `lucide-react`, `react-i18next`, `react-router-dom` (route wiring only, in `src/main`). All existing — **no new runtime dependencies**.
**Storage**: N/A (frontend SPA). The only persistent signal read is `localStorage('alkemio-design-version')` via `useCrdEnabled()`.
**Testing**: Vitest + @testing-library/react (jsdom). `pnpm vitest run` (non-interactive), `pnpm lint` (TypeScript + Biome + ESLint).
**Target Platform**: Modern evergreen browsers (>90% global support per `caniuse.com`, per CLAUDE.md).
**Project Type**: Web frontend (single SPA). CRD-only for new UI.
**Performance Goals**: N/A — static presentational page; no data fetch, no measurable perf budget beyond not regressing first paint of the error surface.
**Constraints**: Hard CRD-only rule — new UI authored under `src/crd/` (presentational) and `src/main/crdPages/` (integration); zero `@mui/*`/`@emotion/*` in new files; props-only components; six-locale i18n parity; all commits signed.
**Scale/Scope**: One presentational component, one integration wrapper, one dispatcher extension, one catch-all edit, six i18n file edits, plus tests. ~7 files touched/created.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Checked against `.specify/memory/constitution.md` (v1.1.0) and CLAUDE.md:

- **I. Domain-Driven Frontend Boundaries** — PASS. No business rules in the component; presentational page is props-only, integration glue lives in `src/main/crdPages/error/`.
- **II. React 19 Concurrent UX Discipline** — PASS. Pure rendering; no manual memoization; explicit, accessible fallback UI; no deprecated lifecycle. The single side effect (`log404NotFound`) is in an effect, not render.
- **III. GraphQL Contract Fidelity** — N/A. No GraphQL; component props are plain TypeScript, never generated types (FR-006).
- **IV. State & Side-Effect Isolation** — PASS. Visual-only `useState` not even needed; the Sentry log effect is isolated in the integration wrapper, not the presentational component.
- **Architecture Standards #2 (MUI frozen, CRD-only for new features)** — PASS. New UI in `src/crd/` + `src/main/crdPages/`; MUI only read for behaviour parity, never imported into new files.
- **Architecture Standards #3 (new strings in CRD per-feature namespaces; core EN frozen)** — PASS. New strings go in `src/crd/i18n/error/error.<lang>.json` (`crd-error` namespace) across all six locales; `src/core/i18n` untouched.
- **Accessibility (WCAG 2.1 AA)** — PASS. Semantic `<h1>`, decorative icon `aria-hidden`, keyboard-focusable buttons, `autoFocus` on primary action (mirrors `CrdForbiddenPage`).
- **Testing gate** — PASS. Unit tests for dispatcher branches + page rendering + i18n parity; `pnpm lint` + `pnpm vitest run` are the exit gates.

**Result: PASS, no violations.** Complexity Tracking left empty.

## Project Structure

### Documentation (this feature)

```text
specs/107-crd-error-pages/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (component & dispatcher contracts)
│   ├── CrdNotFoundPage.md
│   └── dispatcher-and-catchall.md
├── checklists/
│   └── requirements.md  # from /speckit-specify
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/crd/
├── components/error/
│   ├── CrdNotFoundPage.tsx          # NEW — props-only presentational 404 page (mirror CrdForbiddenPage)
│   ├── CrdNotFoundPage.test.tsx     # NEW — unit test for the presentational page
│   ├── CrdForbiddenPage.tsx         # existing — pattern reference (unchanged)
│   └── CrdAuthRequiredPage.tsx      # existing — pattern reference (unchanged)
└── i18n/error/
    ├── error.en.json                # EDIT — add notFound.* block
    ├── error.nl.json                # EDIT — add notFound.* block
    ├── error.es.json                # EDIT — add notFound.* block
    ├── error.bg.json                # EDIT — add notFound.* block
    ├── error.de.json                # EDIT — add notFound.* block
    ├── error.fr.json                # EDIT — add notFound.* block
    └── error.parity.test.ts         # NEW — six-locale key-parity test for crd-error

src/main/crdPages/error/
├── CrdAwareErrorComponent.tsx       # EDIT — add isNotFound branch + shared CrdNotFoundBranch
├── CrdAwareErrorComponent.test.tsx  # EDIT — update "out of scope" test + add isNotFound cases
├── CrdNotFoundBranch.tsx            # NEW — shared integration wrapper (CrdLayoutWrapper + log404 + title)
├── CrdNotFoundBranch.test.tsx       # NEW — unit test for the wrapper (log-once, navigation, title)
├── isCrdRoute.ts                    # existing — reused as-is (unchanged)
└── hasInAppHistory.ts               # existing — reused as-is (unchanged)

src/main/routing/
└── TopLevelRoutes.tsx               # EDIT — path="*" catch-all dispatches CrdNotFoundBranch when crdEnabled
```

**Structure Decision**: Web frontend SPA, CRD-only. Presentational component + its test live in `src/crd/components/error/`; the integration glue (router/Sentry/title-aware wrapper and the dispatcher) lives in `src/main/crdPages/error/`; route wiring stays in `src/main/routing/`. This exactly mirrors the established CRD 403 split (`CrdForbiddenPage` in `src/crd`, `CrdForbiddenBranch` inside `CrdAwareErrorComponent` in `src/main/crdPages`), satisfying the CRD-only constraint and keeping presentational/integration concerns separated.

## Complexity Tracking

> No constitution violations. Section intentionally empty.
