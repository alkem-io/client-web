# Requirements Quality Checklist: Port the Error Pages to CRD

**Purpose**: Validate that the spec for story #9852 is complete, unambiguous, consistent, and testable before planning.
**Created**: 2026-06-11
**Feature**: [spec.md](../spec.md)

**Note**: This checklist is generated to gate the requirements quality of `spec.md`.

## Requirement Completeness

- [X] CHK001 Every functional requirement has a stable FR-### identifier (FR-001..FR-017)
- [X] CHK002 The P1 scope (CRD 404) is fully specified down to dispatcher, catch-all, layout, i18n, Sentry parity, and page title
- [X] CHK003 Deferred phases (P2/P3/P4) are captured as requirements (FR-015..FR-017) so the spec stays the full source of truth
- [X] CHK004 Each user story has a priority, a rationale, an independent test, and Given/When/Then acceptance scenarios
- [X] CHK005 Edge cases enumerate the boundary conditions (undefined pathname, trailing slash/query/hash, no in-app history, reserved MUI path, double-logging, catch-all vs boundary overlap, anon vs auth, i18n parity)

## Requirement Clarity & Unambiguity

- [X] CHK006 The CRD-vs-MUI dispatch condition is stated precisely (`crdEnabled && isCrdRoute(pathname) && isNotFound`)
- [X] CHK007 The "Go back" gating rule is unambiguous (shown only when `hasInAppHistory()` is true)
- [X] CHK008 The decision to NOT port the MUI search bar in P1 is recorded with rationale (A-004) rather than left implicit
- [X] CHK009 No requirement contains an unresolved [NEEDS CLARIFICATION] marker

## Requirement Consistency

- [X] CHK010 The P1 scope matches the story's roadmap "P1 — CRD 404 / Not Found page (highest value, self-contained)"
- [X] CHK011 FR-006 (props-only, no MUI/biz-logic/GraphQL/router in `src/crd/`) is consistent with the repo CRD-only constitution
- [X] CHK012 Regression requirements (FR-005, FR-013) consistently assert no change to legacy / 403 / generic behaviour
- [X] CHK013 i18n requirements (FR-010, FR-014) consistently demand six-locale parity enforced by a test

## Acceptance Criteria Quality (Testability)

- [X] CHK014 Every P1 acceptance scenario is expressed as an observable Given/When/Then outcome
- [X] CHK015 Success criteria SC-001..SC-006 are measurable and technology-agnostic where required
- [X] CHK016 The independent test for US1 maps to concrete verification steps from the story's Verification section
- [X] CHK017 Sentry parity (FR-008, SC-003) is stated as a verifiable outcome (one log per surface, no double-log)

## Scope & Boundaries

- [X] CHK018 The PR scope (P1 ships, P2–P4 defer) is explicit (Scope of this delivery, A-001, SC-006)
- [X] CHK019 Out-of-scope items are named (MUI search bar in P1; `ErrorDisplay`, `LinesFitterErrorBoundary` in P4)
- [X] CHK020 The hard CRD-only constraint (new UI in `src/crd/` + `src/main/crdPages/`, never MUI tree) is reflected in requirements

## Notes

- All items verified against the authored `spec.md`. No open clarifications remain at requirements-quality gate; deeper clarification (taxonomy sweep) is handled in the `/speckit-clarify` step.
