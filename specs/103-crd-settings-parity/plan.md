# Implementation Plan: CRD (Sub)Space Settings — Functional Parity with Legacy Settings

**Branch**: `103-crd-settings-parity` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/103-crd-settings-parity/spec.md`

## Summary

Restore six lost or broken capabilities in the new (CRD) (sub)space settings so they match the still-default legacy (MUI) settings (GitHub issue #9752). The work is almost entirely in the CRD presentation layer (`src/crd/`) and its integration glue (`src/main/crdPages/topLevelPages/spaceSettings/`); the GraphQL data layer is reused. Research shows most backend wiring already exists — several "regressions" are unwired UI or a stripped-down dialog chosen over an already-complete one. The only schema touch is adding `url` to the callout `framing.profile` selection (one fragment + `pnpm codegen`).

Effort, smallest → largest:

1. **View post (US6)** — add `url` to a callout fragment, map it, navigate from the stubbed handler.
2. **Active-phase indicator (US3)** — add a visible highlight when `isCurrentPhase` is true (the set-active mutation is already wired).
3. **Phase description rendering (US5)** — render the column description through `InlineMarkdown` instead of raw text (keep the clamp).
4. **Member invite parity (US1)** — replace the stripped settings invite dialog with the existing parity `InviteMembersDialogConnector`, parameterized by explicit `roleSetId`/`spaceId`/`spaceName`.
5. **Subspace sort/pin parity (US4)** — add the Alphabetical/Custom sort selector + @dnd-kit drag-reorder to the subspaces view; the data hook already exposes `onReorder` and the mutations.
6. **Virtual Contributor invite (US2)** — net-new CRD VC-invite dialog + connector + a separate entry point in the Community tab.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: shadcn/ui + Tailwind CSS v4 + Radix UI (`@/crd/primitives/*`), `@dnd-kit/core` + `@dnd-kit/sortable` (already used in CRD), `lucide-react`, `react-i18next`, Apollo Client + generated hooks, `react-markdown` (via CRD `InlineMarkdown`/`MarkdownContent`)
**Storage**: N/A — server persistence via existing GraphQL mutations; no client-side storage changes
**Testing**: Vitest + jsdom (`pnpm vitest run`); `pnpm lint` (TypeScript + Biome + ESLint react-compiler)
**Target Platform**: Web SPA (Vite), browsers with >90% global support (no `Array.prototype.at`, `Object.hasOwn`, `@container`, `structuredClone`)
**Project Type**: Web frontend (single SPA)
**Performance Goals**: No new render-blocking work; drag interactions stay at 60 fps using the existing @dnd-kit sensor config; invite search keeps the existing 300 ms debounce
**Constraints**: CRD components stay pure (props + callbacks, no MUI/Emotion, no GraphQL types, no routing, Tailwind-only, semantic typography tokens); all wiring in `src/main/crdPages/`; deletions/destructive actions via `ConfirmationDialog`; dirty-form closes via `useDialogCloseGuard`; all strings via `crd-*` i18n namespaces (manual, not Crowdin); URLs via `@/main/routing/urlBuilders` or entity `profile.url`; legacy MUI pages untouched and default
**Scale/Scope**: 6 user stories across 3 settings tabs (Community, Layout, Subspaces); ~1 GraphQL fragment change; ~1 net-new CRD dialog (VC invite); the rest is wiring/UI additions to existing components

**Unknowns / NEEDS CLARIFICATION**: None remaining after Phase 0 research (see `research.md`). The three spec-level decisions (full subspace-sort parity incl. pinning; separate VC entry point; live as-you-type member detection) were resolved in `/speckit.clarify`.

**Terminology**: An Innovation Flow **phase** (spec language) is the same entity as a **state** (GraphQL: `InnovationFlowState`, `currentState`) and a **column** (CRD Layout view: `LayoutPoolColumn`). These three names are used interchangeably across spec/plan/code/tasks and refer to the same thing.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Domain-Driven Frontend Boundaries | ✅ Pass | All business logic stays in `src/domain/*` hooks and `src/main/crdPages/*` connectors; CRD components remain presentational. No new state shape invented in components. |
| II. React 19 Concurrent UX Discipline | ✅ Pass | Reuse existing optimistic patterns (`markCurrentPhaseChanged`), existing @dnd-kit sensors, Suspense/loading props already present. No legacy lifecycle. No manual memoization. |
| III. GraphQL Contract Fidelity | ✅ Pass | Only generated hooks used. One fragment change (`url` on callout `framing.profile`) → `pnpm codegen` run + generated artifacts committed in this PR + schema diff noted. No generated types leak into CRD props. |
| IV. State & Side-Effect Isolation | ✅ Pass | Persistent state via Apollo; CRD `useState` limited to visual toggles; navigation handled by consumer via `urlBuilders`/`profile.url`. |
| V. Experience Quality & Safeguards | ✅ Pass | WCAG 2.1 AA: @dnd-kit `KeyboardSensor` for drag, `aria-label` on icon menus, active-phase indicator not color-only (icon + text), markdown rendered (no raw tags). Deletions confirmed; dirty dialogs guarded. |
| Arch. #2 (CRD design system) | ✅ Pass | New UI uses `src/crd/`; legacy MUI pages remain. |
| Arch. #3 (i18n) | ✅ Pass | New strings added to `crd-*` namespaces (manual/AI-assisted, all 6 languages in-PR per `src/crd/CLAUDE.md`). |
| Arch. #5 (no barrel exports) | ✅ Pass | Explicit file-path imports only. |
| Arch. #6 (SOLID/DRY) | ✅ Pass | Reuse the parity `InviteMembersDialogConnector` (DRY) rather than extend the stripped dialog; reuse existing @dnd-kit sortable patterns; reuse `InlineMarkdown`. |
| Workflow #5 (Root cause before fix) | ✅ Pass | Each item traced to a concrete root cause in research (stubbed handler, missing fragment field, stripped dialog chosen, raw-string render, missing UI) before any fix. |

**Result: PASS — no violations, Complexity Tracking not required.**

## Project Structure

### Documentation (this feature)

```text
specs/103-crd-settings-parity/
├── plan.md              # This file
├── spec.md              # Feature spec (with Clarifications)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (prop-type & entity shapes)
├── quickstart.md        # Phase 1 output (manual validation per story)
├── contracts/
│   └── graphql-operations.md   # GraphQL operations touched + the one fragment change
└── checklists/
    └── requirements.md  # Spec quality checklist (from /speckit.specify)
```

### Source Code (repository root)

```text
# CRD presentational layer (pure components) — src/crd/
src/crd/components/space/settings/
├── SpaceSettingsSubspacesView.tsx     # US4: add sortMode + onReorder + onSortModeChange props, @dnd-kit, conditional pin
├── SpaceSettingsLayoutView.types.ts   # US6: add profileUrl to LayoutCallout
├── LayoutPoolColumn.tsx               # US3: visible active-phase highlight; US5: render description via InlineMarkdown (<div>, keep line-clamp-3)
└── LayoutCalloutRow.tsx               # US6: (no change — onViewPost already wired to onViewPost(callout.id))
src/crd/components/community/
├── InviteMembersDialog.tsx            # US1: reused as-is (parity-complete)
└── VirtualContributorInviteDialog.tsx # US2: NEW — pure VC picker (on-account list + library list, message slot)
src/crd/forms/
├── ContributorSelector.tsx            # US1: reused as-is (live name+email search)
└── RoleMultiSelect.tsx                # US1: reused as-is (Member locked, Lead/Admin optional)
src/crd/i18n/<feature>/                # new strings for subspaces sort, layout active-phase, VC invite (en + nl/es/bg/de/fr)

# Integration / glue — src/main/crdPages/topLevelPages/spaceSettings/
├── CrdSpaceSettingsPage.tsx           # US1: swap stripped invite dialog → parity connector; US2: mount VC dialog + entry point; US6: wire onViewPost via profileUrl
├── subspaces/
│   ├── useSubspacesTabData.ts         # US4: expose sortMode + onSortModeChange (onReorder already present)
│   └── subspacesMapper.ts             # US4: surface sortMode (mapSortMode/mapSortModeToBackend helpers already exist)
├── layout/
│   ├── useLayoutTabData.ts            # US3: (active-phase already wired) ; US6: pass through profileUrl
│   └── layoutMapper.ts                # US6: map callout profile.url → LayoutCallout.profileUrl
└── community/
    ├── useCommunityTabData.ts         # exposes _adminRef (userAdmin / virtualContributorAdmin) — reused
    └── VirtualContributorInviteConnector.tsx  # US2: NEW — wires CRD VC dialog to virtualContributorAdmin + available-VC queries

# Integration — existing parity invite connector (parameterize)
src/main/crdPages/space/dialogs/
└── InviteMembersDialogConnector.tsx   # US1: accept optional roleSetId/spaceId/spaceName props (fallback to useUrlResolver)

# GraphQL source (one change) — src/domain/
src/domain/collaboration/InnovationFlow/graphql/
└── InnovationFlowCollaboration.fragment.graphql  # US6: add `url` under callouts.framing.profile → pnpm codegen

# Legacy MUI (reference only — DO NOT MODIFY)
src/domain/spaceAdmin/SpaceAdminSubspaces/*               # US4 parity baseline
src/domain/collaboration/InnovationFlow/InnovationFlowDragNDropEditor/*  # US3/US5 baseline
src/domain/community/inviteContributors/virtualContributors/*            # US2 baseline
```

**Structure Decision**: Standard CRD migration topology per `docs/crd/migration-guide.md` — pure presentational components in `src/crd/`, all data/permission/navigation wiring in `src/main/crdPages/topLevelPages/spaceSettings/`. No new top-level directories. Legacy `src/domain/spaceAdmin/*` and `inviteContributors/*` are read-only parity references.

## Complexity Tracking

No constitution violations — section intentionally empty.

## Phase 0 — Research

See [research.md](./research.md). All clarifications resolved; each user story has a confirmed root cause, the exact files to touch, and the existing assets to reuse.

## Phase 1 — Design & Contracts

- [data-model.md](./data-model.md) — prop-type and entity-shape changes (CRD prop additions, mapper outputs, GraphQL fields).
- [contracts/graphql-operations.md](./contracts/graphql-operations.md) — every GraphQL operation touched and the single fragment change requiring codegen.
- [quickstart.md](./quickstart.md) — per-story manual validation steps (opt into CRD, exercise each tab in both a top-level space and a subspace).

## Phase 2 — Next

`/speckit.tasks` will derive a dependency-ordered `tasks.md`. Recommended grouping: ship by user story (each is independently testable), smallest-first (US6 → US3 → US5 → US1 → US4 → US2), with the `InnovationFlowCollaboration.fragment.graphql` + `pnpm codegen` step as an early prerequisite for US6.
