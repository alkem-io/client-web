# Implementation Plan: Innovation Hub — Add Space by URL

**Branch**: `095-hub-add-space-url` | **Date**: 2026-05-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/095-hub-add-space-url/spec.md`

## Summary

Replace the existing search-based "Add Space" dialog on the Innovation Hub admin settings page with a URL-input dialog that delegates all validation to the platform's existing `urlResolver` query. A submitted URL is added to the Hub's `spaceListFilter` only when the server confirms it resolves to a Space with `level === 0` on the current instance and that Space is not already in the list. Every other outcome — bad URL, wrong host, subspace, non-Space, not-found, permission failure, network error — collapses to a single inline message: "URL is not a valid top level space". Already-in-Hub is the only other branch and shows a distinct inline message.

The change is **frontend-only**: no GraphQL schema additions, no backend work. Existing operations are reused (`urlResolver`, `updateInnovationHub`); the obsolete `InnovationHubAvailableSpaces` query is deleted.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Node ≥22 (Volta-pinned to 24.14.0)
**Primary Dependencies**: Apollo Client (existing — `useUrlResolverLazyQuery`, `useUpdateInnovationHubMutation`, both already generated); MUI (existing — the surrounding admin page is MUI, not CRD); `react-i18next` (existing); React Compiler (`babel-plugin-react-compiler`)
**Storage**: N/A — frontend SPA; data via existing GraphQL queries/mutations. No schema changes.
**Testing**: Vitest with jsdom. Manual quickstart for end-to-end validation against a running backend.
**Target Platform**: Browser (Chromium/Firefox/Safari, >90% caniuse coverage).
**Project Type**: Web (single SPA repo).
**Performance Goals**: Spec SC-001 — admin can add a Space in ≤3 steps and ≤30s end-to-end. Resolver round-trip dominates; no client-side optimisation needed.
**Constraints**:
- No client-side host or path-segment validation (server is single source of truth — spec FR-004).
- Submit disabled until `new URL(value)` succeeds — no network call for syntactically invalid input (spec FR-003).
- All user-visible strings i18n via `react-i18next`; English source only (Crowdin owns the rest) — spec FR-010, CLAUDE.md i18n rules.
- WCAG 2.1 AA — keyboard, ARIA, focus management — spec FR-011.
- No `useMemo`/`useCallback`/`React.memo` — React Compiler handles memoization (CLAUDE.md).
- This is an MUI admin page; CRD design system is **not** used here.
**Scale/Scope**: One dialog, one component file extracted, one i18n key block added, one obsolete `.graphql` file deleted. Net diff ≈ −250 / +200 LOC.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.* (Re-evaluated post-Phase-1, see end of file.)

| Principle | Compliance | Notes |
|---|---|---|
| **I. Domain-Driven Frontend Boundaries** | ✅ | Dialog lives under `src/domain/innovationHub/InnovationHubsSettings/`. No business rules leak outside this directory. The dialog is a presentational component receiving `onAdd: (spaceId: string) => Promise<void>` and `existingSpaceIds: string[]` as props; all GraphQL is invoked from `InnovationHubSpacesField.tsx` (the orchestrator) and the existing `InnovationHubSettingsPage.tsx` (data fetch + mutation). |
| **II. React 19 Concurrent UX Discipline** | ✅ | Dialog state is plain `useState` (visual only). The async resolver call is wrapped with the existing `useLoadingState` pattern (see precedent in `SpaceContentFromSpaceUrlForm.tsx:45`). No legacy lifecycle methods. Loading state and error state are explicit and accessible. |
| **III. GraphQL Contract Fidelity** | ✅ | Reuses generated hooks `useUrlResolverLazyQuery` and `useUpdateInnovationHubMutation`. No raw `useQuery`. Schema unchanged; codegen runs only because a `.graphql` file is deleted. Component prop types are plain TS, not generated GraphQL types. |
| **IV. State & Side-Effect Isolation** | ✅ | All Apollo calls remain in the orchestrator/page; the dialog component is pure presentational (props in, callbacks out). No direct DOM manipulation. |
| **V. Experience Quality & Safeguards** | ✅ | WCAG 2.1 AA: native `<dialog>`-equivalent (MUI `Dialog`/`DialogWithGrid`) handles focus trap and ESC close; URL input has visible label + `aria-describedby` linking to error message; status text uses `aria-live="polite"`. Error states are explicit. Vitest unit tests cover state transitions of the dialog component. |

**Architecture Standards**:
- §1 Feature directories — ✅ component placed under `src/domain/innovationHub/InnovationHubsSettings/`.
- §2 Styling (MUI vs CRD) — ✅ admin page is MUI; new dialog stays MUI for consistency. Migrating this admin page to CRD is out of scope.
- §3 i18n via `react-i18next`, English source only — ✅.
- §4 Build determinism — ✅ no Vite config changes.
- §5 Explicit imports, no barrel `index.ts` — ✅ all new imports use direct paths.
- §6 SOLID & DRY:
  - SRP — dialog is split out into its own file (`AddSpaceByUrlDialog.tsx`); orchestrator handles wiring; page handles data.
  - OCP — dialog accepts callbacks (`onAdd`, `onClose`) rather than mutating state internally.
  - LSP — n/a (no class hierarchy / no overrides).
  - ISP — dialog props interface is minimal: `{ open, onClose, onAdd, existingSpaceIds }`.
  - DIP — dialog depends on the `onAdd: (spaceId) => Promise<void>` abstraction, not Apollo directly.
  - DRY — no duplicated logic; URL parsing test (`new URL`) is a single inline check; the resolver call follows the existing precedent (`SpaceContentFromSpaceUrlForm.tsx`) but is not generalised since there are only two consumers and their failure-message contracts differ.

**Engineering Workflow**:
- §1 Plan documents domain context (`innovationHub`), React 19 features (none new — plain `useState` + `useLoadingState`), GraphQL operations touched (`urlResolver` reused, `InnovationHubAvailableSpaces` deleted, `updateInnovationHub` reused).
- §2 `pnpm codegen` will run as part of the implementation PR; one `.graphql` file deletion will produce a small generated diff.
- §3 No new domain façade is needed — the existing `InnovationHubSettingsPage` already exposes a typed mutation handler. UI changes follow the schema (no schema change).
- §4 Accessibility, lint, tests — addressed via quickstart and Vitest plan.
- §5 **Root Cause Analysis** — this feature itself is a *workaround* for platform issue #1848 (broken Space search), explicitly framed as such in the spec. The constitution principle forbids masking root causes; this feature is not masking — the broken search is tracked separately, and the spec calls out that URL-add is a temporary workaround that may coexist with a future restored search. ✅

**Result**: GATE PASSED. No violations to record in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/095-hub-add-space-url/
├── plan.md                                  # this file
├── research.md                              # Phase 0 output
├── data-model.md                            # Phase 1 output
├── quickstart.md                            # Phase 1 output
├── contracts/
│   └── graphql-operations.md                # Phase 1 output
├── checklists/
│   └── requirements.md                      # pre-existing
├── spec.md                                  # simplified per /speckit.clarify
└── tasks.md                                 # NOT in plan scope; created by /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── innovationHub/
│       └── InnovationHubsSettings/
│           ├── InnovationHubSettingsPage.tsx        # MODIFIED — pass existingSpaceIds + onAddSpace to InnovationHubSpacesField
│           ├── InnovationHubSpacesField.tsx         # MODIFIED — replace search dialog with <AddSpaceByUrlDialog/>; remove search state/columns/grid/imports
│           ├── AddSpaceByUrlDialog.tsx              # NEW — presentational dialog, props: { open, onClose, onAdd, existingSpaceIds }
│           ├── AddSpaceByUrlDialog.test.tsx        # NEW — Vitest unit tests for the dialog component
│           ├── useResolveSpaceUrl.ts                # NEW — small hook wrapping useUrlResolverLazyQuery; returns { resolve(url) -> { kind: 'ok' | 'invalid' | 'duplicate', spaceId? } }
│           ├── InnovationHubAvailableSpaces.graphql # DELETED — was the search-based candidate-list query
│           ├── InnovationHubsSettings.graphql      # unchanged
│           └── InnovationHubsMutations.graphql     # unchanged
└── core/
    └── i18n/
        └── en/
            └── translation.en.json                  # MODIFIED — add 8 keys under pages.admin.innovationHub.spaceListFilter.addByUrl.*

src/core/apollo/generated/
├── apollo-hooks.ts                                  # REGENERATED via pnpm codegen (removes useInnovationHubAvailableSpacesQuery)
└── graphql.ts                                       # REGENERATED via pnpm codegen
```

**Structure Decision**: Co-locate the new dialog with the existing `InnovationHubSpacesField.tsx` under `src/domain/innovationHub/InnovationHubsSettings/`. The orchestrator (`InnovationHubSpacesField.tsx`) keeps the list-rendering and add-button concerns; the dialog is a sibling component that owns only the visual state of the modal. The data-fetching mutation stays in the page (`InnovationHubSettingsPage.tsx`), which already has a `handleSubmitSpaceListFilter` callback we can pass down. The new `useResolveSpaceUrl` hook isolates the resolver-call + classification logic so the dialog stays simple and testable.

## Phase 0 — Outline & Research

Completed. See [research.md](./research.md). All NEEDS CLARIFICATION items resolved:

1. Where the existing dialog lives → `InnovationHubSpacesField.tsx`.
2. Which GraphQL query resolves URLs → existing `urlResolver` (returns `state`, `type`, `space.level`).
3. Which mutation attaches a Space to a Hub → existing `updateInnovationHub` with `spaceListFilter: [UUID]`.
4. How to classify failure cases → all collapse to one generic message; duplicate is the only distinct branch.
5. Submit-button enablement rule → `new URL(value)` parses cleanly.
6. Loading/error UX → spinner + status text + inline error below input; dialog stays open.
7. i18n keys → 8 new keys under `pages.admin.innovationHub.spaceListFilter.addByUrl.*` in English source only.
8. What gets removed → `InnovationHubAvailableSpaces.graphql` plus all references.

## Phase 1 — Design & Contracts

Completed. Artifacts:

1. **[data-model.md](./data-model.md)** — confirms no new persistent entities; lists the local view-model state machine (idle/validating/invalid/duplicate); enumerates validation rules and where each is enforced (client vs server).
2. **[contracts/graphql-operations.md](./contracts/graphql-operations.md)** — documents the two reused GraphQL operations, the one deleted, and the absence of any schema change.
3. **[quickstart.md](./quickstart.md)** — 11 manual test cases covering each FR and acceptance scenario, plus a Definition of Done.
4. **Agent context** — to be refreshed via `.specify/scripts/bash/update-agent-context.sh claude` (run after this plan is finalised).

## Constitution re-check (post-Phase-1)

| Principle | Status | Notes |
|---|---|---|
| I. Domain-Driven Frontend Boundaries | ✅ | All new code under `src/domain/innovationHub/InnovationHubsSettings/`. |
| II. React 19 Concurrent UX Discipline | ✅ | Plain `useState`; async via existing `useLoadingState`. Spinner + status text + inline error. |
| III. GraphQL Contract Fidelity | ✅ | Reuses generated hooks; no raw `useQuery`; props are plain TS. |
| IV. State & Side-Effect Isolation | ✅ | Dialog presentational; Apollo calls confined to orchestrator/page. |
| V. Experience Quality & Safeguards | ✅ | a11y plan present; Vitest tests scoped. |

**Result**: GATE PASSED post-design. No new violations introduced. Complexity Tracking remains empty.

## Complexity Tracking

*No deviations from the constitution; this section is intentionally empty.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| — | — | — |
