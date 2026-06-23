# Implementation Plan: Remove MUI library and code

**Branch**: `story/9885-remove-mui-library-and-code` (spec dir `111-remove-mui-library`) | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/111-remove-mui-library/spec.md`

## Summary

Story #9885 is the terminal task of epic #1888 ("Remove completely the MUI
dependency from client-web"). The codebase is mid-migration (786/2754 source files
still import `@mui/*`/`@emotion/*`; the whole `src/core/ui/` design system, auth
pages, app shell, and ~435 `src/domain` files remain MUI and serve live routes; the
`designVersion` toggle still switches between MUI and CRD route trees). A literal
removal now would break the running app and violate the constitution's Experience
Quality safeguard and the repo's "MUI removed only as pages migrate" rule.

The shippable, non-breaking slice delivered here is documentation-and-artifact only:
(1) a reproducible **MUI footprint baseline**, (2) an authoritative **MUI removal
inventory** that classifies every MUI surface and states each removal's unblocking
precondition, and (3) **documentation accuracy** updates across `CLAUDE.md`, `docs/`,
the CRD docs, and `.coderabbit.yaml`. No runtime code, dependencies, components,
routes, or translations are changed, so all exit gates pass with zero behavioral
change. The destructive removals are enumerated as deferred work in the inventory,
tied to migration-completion preconditions, for the rest of epic #1888 to execute.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19 (React Compiler enabled)
**Primary Dependencies**: Vite 7 (build/bundle analysis via `rollup-plugin-visualizer`); no new dependencies added
**Storage**: N/A (no persisted state; artifacts are committed markdown)
**Testing**: Vitest (jsdom). No new tests required — change is documentation/artifacts only; verification is via the existing suite staying green plus grep-based checks
**Target Platform**: Browser SPA served by Vite
**Project Type**: Web (single frontend repo)
**Performance Goals**: No runtime perf change in this PR; the baseline establishes the production MUI bundle contribution as the metric future migration PRs reduce
**Constraints**: Zero behavioral change; zero MUI runtime dependency removal while import count > 0; no live MUI component/route/translation deletion; exit gates (test + build + lint) must stay green
**Scale/Scope**: 2 new artifact files, edits to `CLAUDE.md` + a small set of docs + `.coderabbit.yaml`; baseline covers 786 MUI-importing files and 8 MUI/Emotion runtime packages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against `.specify/memory/constitution.md` v1.1.0:

- **I. Domain-Driven Frontend Boundaries** — PASS. No code moves between layers; no
  business logic added. Documentation-only.
- **II. React 19 Concurrent UX Discipline** — PASS (N/A). No components changed.
- **III. GraphQL Contract Fidelity** — PASS (N/A). No GraphQL/schema touch; no
  `pnpm codegen` needed.
- **IV. State & Side-Effect Isolation** — PASS (N/A). No state or effects changed.
- **V. Experience Quality & Safeguards** — PASS, and actively upheld: the scope
  decision exists precisely to avoid the accessibility/availability regression a
  premature removal would cause. No live experience is altered.
- **Architecture Standard #2 (MUI frozen; CRD-only; MUI removed only as pages
  migrate)** — PASS and reinforced. This plan removes no MUI prematurely and the
  documentation changes restate this policy accurately.
- **Architecture Standard #3 (i18n; core translations frozen)** — PASS. Legacy
  `translation.<lang>.json` files are left untouched (still serving the MUI app);
  no new keys added anywhere.
- **Engineering Workflow #2 (codegen on schema change)** — PASS (N/A, no schema
  change).
- **Engineering Workflow #5 (root cause before fixes)** — PASS. The root cause of
  "can't remove MUI yet" (incomplete migration) is identified and the work is
  scoped to it rather than masking it.

No violations. Complexity Tracking table left empty.

## Project Structure

### Documentation (this feature)

```text
specs/111-remove-mui-library/
├── plan.md                      # This file
├── research.md                  # Phase 0 output
├── data-model.md                # Phase 1 output (artifact schemas)
├── quickstart.md                # Phase 1 output (how to reproduce the measurement)
├── contracts/
│   ├── footprint-baseline.contract.md   # Required shape of the baseline artifact
│   └── removal-inventory.contract.md     # Required shape of the inventory artifact
├── checklists/
│   └── requirements.md          # From /speckit-specify
├── mui-footprint-baseline.md    # DELIVERABLE artifact (FR-001..FR-004, FR-014)
├── mui-removal-inventory.md     # DELIVERABLE artifact (FR-005..FR-007)
└── tasks.md                     # From /speckit-tasks
```

### Source Code (repository root)

No source code under `src/` is modified by this feature. The only repository files
changed outside the spec directory are documentation/configuration:

```text
client-web/
├── CLAUDE.md                    # FR-008: Overview + MUI-policy prose accuracy
├── .coderabbit.yaml             # FR-009: MUI references reviewed/corrected
└── docs/
    ├── crd/
    │   └── migration-guide.md   # FR-013: link to baseline + inventory; policy accuracy
    └── (other docs/*.md)        # FR-009: reviewed; corrected only where outdated
```

**Structure Decision**: Documentation-and-artifact change in a web (single
frontend) repo. Deliverable artifacts live in the feature spec directory (per
clarify Q1) and are linked from `docs/crd/migration-guide.md`. No `src/` tree
changes, so no source layout decision is needed.

## Complexity Tracking

> No constitution violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none)    | —          | —                                    |
