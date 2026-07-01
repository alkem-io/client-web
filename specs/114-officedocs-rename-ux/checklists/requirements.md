# Specification Quality Checklist: OfficeDocs Rename UX

**Purpose**: Validate specification completeness and quality
**Created**: 2026-06-30 (updated 2026-07-01)
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details in the user-facing stories/FRs/SCs (concrete component/query names live only in plan/research/contracts)
- [x] Focused on user value and business needs
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded (single repo; framing-only; card-title divergence explicit)
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria

## Notes

- **Session 2026-07-01 (round 1):** framing-only scope + a reusable control for future contribution documents.
- **Session 2026-07-01 (round 2):** permission model de-conflated → **union of the document's own `Update` OR
  the callout's `Update`**; three surfaces (editor header inline, per-callout "Rename document" menu →
  standalone dialog, edit-dialog box cleanup); requires selecting `collaboraDocument.authorization` in the
  gate queries.
- **Analyzer remediations folded in (2026-07-01):**
  - **C1** — `collaboraDocument.authorization` added to **all** gate queries (CalloutsSetQueries +
    CalloutContent), preferably via a shared fragment (FR-002 / T002).
  - **C2** — FR-010/SC-004 narrowed to the document-name surfaces; the space-feed **card** title is a separate
    field (callout framing name) and is explicitly **not** changed by document rename (documented as an
    optional follow-up).
  - **U1** — `deriveCalloutMenuVisibility` already exposes `isCollaboraDocument`; gains a `documentMyPrivileges`
    input for the document-edit half of the gate (T008).
  - **A1** — FR-012 clarified: the rename UI exposes a name field only (no type/extension control).
  - **N1** — resolved by **relocating** this single-repo spec from the agents-hq workspace into
    `client-web/specs/` (was `016-officedocs-rename-ux`).
