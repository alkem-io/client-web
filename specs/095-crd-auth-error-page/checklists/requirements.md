# Specification Quality Checklist: CRD — Unauthorized / Forbidden Error Page

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-04-28
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- All clarifications resolved across two sessions in **Clarifications / Session 2026-04-28**:
  1. **Anonymous flow on the throw-path** → silent redirect to sign-in is preserved (MUI parity 1:1, with `returnUrl` carrying the originally-requested URL).
  2. **"Request access" action** → out of scope (MUI parity wins).
  3. **CRD route detection** → small static `isCrdRoute(pathname)` predicate next to `useCrdEnabled` in `src/main/crdPages/`. New CRD routes add a pattern when they migrate.
  4. **Sentry / observability scope** → strict MUI parity. Log only on `/restricted` (with `origin`); the boundary throw-path adds no new explicit log.
  5. **i18n namespace name** → `crd-error` (generic, future-friendly for 404/5xx). Today's feature adds only the keys it needs for the forbidden page.
  6. **Anonymous user on `/restricted` direct visit** → render the CRD page regardless of auth state, matching MUI. The page is auth-agnostic; only the boundary throw-path silently redirects anonymous users upstream.
- The action set on the CRD page is two actions: primary "Go to Home", optional secondary "Go back" (hidden when no in-app history exists). Auth-state-agnostic.
- All `/speckit.analyze` findings (3 MEDIUM + 7 LOW) addressed in a 2026-04-28 cleanup pass:
  - **C1 / SC-009**: New T022a verifies the post-sign-in `returnUrl` round-trip on three representative CRD routes.
  - **C2 / SC-001**: T016 expanded to repeat the manual QA on top-level Space, Subspace, and admin routes.
  - **I1**: Data-model decision table now includes the `isNotAuthorized` dimension (NotFound / generic errors fall through to MUI).
  - **D1**: FR-002, FR-009, FR-021 tightened to non-overlapping foci (props surface / no-internal-business-logic / auth-agnostic).
  - **D2**: FR-020 merged into FR-019.
  - **A1**: FR-005 made measurable (pinned to `<h1>` + specific i18n keys).
  - **A2**: FR-006 pinned to `lucide-react` `ShieldAlert` icon with `aria-hidden="true"`.
  - **Q1**: New T012a creates a `hasInAppHistory()` wrapper for `window.history.length` (per Constitution IV); T013 / T015 / T017 / T019 updated to use / mock the wrapper.
  - **T1**: Standardized on "CRD forbidden page" as canonical term across spec, plan, tasks, quickstart.
  - **F1**: T013 and T017 import lists now include `usePageTitle`, `useTranslation`, and the helper.
- The spec / plan / tasks set is internally consistent and ready for `/speckit.implement`.
- `/speckit.clarify` can be skipped on a future re-run unless a new question surfaces during implementation.
