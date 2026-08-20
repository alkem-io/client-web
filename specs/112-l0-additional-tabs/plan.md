# Implementation Plan: Additional Tabs on L0 Spaces

**Branch**: `story/9857-adding-an-additional-space-tab` (spec dir `112-l0-additional-tabs`) | **Date**: 2026-06-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/112-l0-additional-tabs/spec.md`
**Story**: alkem-io/client-web#9857 · **Epic**: alkem-io/alkemio#1930 · **Server slice**: alkem-io/server#6177

## Summary

Bring the existing Subspace tab-management capability (add / delete / rename / hide a "phase") to top-level **L0 Spaces**, where it is currently disabled on the client, and label the affordances with the user-facing term **"tab"**. The four built-in L0 tabs (Dashboard, Community, Subspaces, Knowledge Base — the first four innovation-flow states, indices 0–3) are permanently protected from deletion; additional tabs are states at index ≥ 4 and are fully manageable like subspace phases. Posts in a deleted tab move to the first tab (reused subspace behaviour). Subspaces (L1/L2) are unchanged.

**Technical approach**: The data + mutation layer (`useLayoutTabData`, `useColumnMenu`, the `createStateOnInnovationFlow` / `deleteStateOnInnovationFlow` / sort-order mutations) is already level-agnostic and working for subspaces. The L0 gap is purely a set of **client-side `level !== 'L0'` guards** in `CrdSpaceSettingsPage.tsx` and `SpaceSettingsLayoutView.tsx` that suppress Add/Delete on L0, plus the absence of a **per-column "deletable" flag** to protect the first four. The plan: (1) introduce a `canManageTabs` capability prop that admits L0, (2) carry a per-column `isDeletable` flag (mapper sets it from `level === 'L0' ? index >= 4 : true`) and gate the Delete menu entry on it, (3) wire `onCreateState` / `onDeleteState` on L0 in the settings page, (4) introduce level-aware "tab" vs "phase" i18n strings across all six languages. Rendering of additional L0 tabs already works (`useCrdSpaceTabs` / `CrdSpaceCustomTabPage` handle index ≥ 4), so no main-tab-bar changes are required.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: Apollo Client (generated hooks only), shadcn/ui + Tailwind v4 + Radix UI (CRD layer `@/crd/*`), `react-i18next`, `lucide-react`. **No new runtime dependencies.**
**Storage**: N/A (server-side GraphQL; client uses the Apollo normalized cache). Persistence is via the innovation-flow GraphQL mutations already in use for subspaces.
**Testing**: Vitest + jsdom (`pnpm vitest run`). Unit tests for the per-column deletable mapping and the L0 capability gating; existing subspace tests guard against regression.
**Target Platform**: Web SPA (Vite), browsers with >90% global support per CLAUDE.md.
**Project Type**: Web frontend (single SPA). CRD-only — new UI in `src/crd/`, integration glue in `src/main/crdPages/`.
**Performance Goals**: No new network round-trips beyond the existing create/delete/sort-order mutations; tab strip updates without page reload (SC-001). UI interactions remain at interactive-frame budgets (no heavy compute introduced).
**Constraints**: CRD layer stays presentational (no Apollo/domain/router imports); all destructive actions confirmed via `ConfirmationDialog`; six-language i18n parity; no `@mui/*`/`@emotion/*`; no `__typename` discrimination.
**Scale/Scope**: A handful of files in `src/crd/components/space/settings/` and `src/main/crdPages/topLevelPages/spaceSettings/`, plus one CRD i18n namespace touched across six locale files. No schema changes on the client beyond consuming existing generated hooks.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Pass |
|---|---|---|
| **I. Domain-Driven Frontend Boundaries** | Tab identity, limits, and the create/delete orchestration stay in `src/main/crdPages/.../layout/` (integration) and `src/domain/.../InnovationFlow/` (domain). The CRD view receives a `canManageTabs` flag and per-column `isDeletable` as plain props — no business rules leak into `src/crd/`. | ✅ |
| **II. React 19 Concurrent UX Discipline** | Reuses the existing `useTransition`-based structural mutation handlers; no manual memoization; optimistic UI already present for delete/active-phase. New code adds no lifecycle anti-patterns. | ✅ |
| **III. GraphQL Contract Fidelity** | Uses existing generated hooks (`useCreateStateOnInnovationFlowMutation`, `useDeleteStateOnInnovationFlowMutation`, sort-order, current-state). No new client `.graphql` is strictly required (the create/delete already exist); if any field is added, `pnpm codegen` runs in the same PR. No raw `useQuery`. | ✅ |
| **IV. State & Side-Effect Isolation** | All Apollo state stays in the `crdPages` hooks; the CRD view holds only visual state (dialog open). | ✅ |
| **V. Experience Quality & Safeguards** | Delete is confirmed (`ConfirmationDialog`); affordances keyboard-accessible; tab labels localized; unit tests cover the protection rule. | ✅ |
| **Architecture #2 — CRD is the only design system** | All UI in `src/crd/` + `src/main/crdPages/`; no MUI. | ✅ |
| **Architecture #3 — i18n CRD namespaces, six-language parity** | New "tab" strings added to the relevant `crd-*` namespace in en/nl/es/bg/de/fr in this PR; Dutch glossary respected ("Post"/"Posts", "template"). | ✅ |
| **Architecture #5 — no barrel exports** | Explicit file-path imports only. | ✅ |
| **Architecture #6 — SOLID** | Per-column protection expressed as a data flag (OCP — extends behaviour via config, not by editing the menu's branching for each level); capability gating is a single prop (SRP). | ✅ |

**Result**: PASS — no violations, Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/112-l0-additional-tabs/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (component + data-hook contracts)
│   ├── layout-view.md
│   └── layout-data.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/crd/components/space/settings/
├── SpaceSettingsLayoutView.tsx        # ← gate change: canManageTabs admits L0; AddPhaseDialog → tab-worded on L0
├── SpaceSettingsLayoutView.types.ts   # ← LayoutPoolColumn gains `isDeletable?: boolean`
├── LayoutPoolColumn.tsx               # ← ColumnOverflowMenu Delete entry gated on isDeletable !== false
└── AddPhaseDialog.tsx                 # ← accepts level-aware labels (title/CTA) via props

src/crd/i18n/spaceSettings/            # ← add "tab" variant strings, all 6 languages
└── spaceSettings.<lang>.json

src/main/crdPages/topLevelPages/spaceSettings/
├── CrdSpaceSettingsPage.tsx           # ← pass onCreateState/onDeleteState + capability on L0
└── layout/
    ├── useLayoutTabData.ts            # ← (mostly unchanged) expose data needed for per-column flag
    ├── useColumnMenu.ts               # ← allow delete on L0; per-column protection via mapper flag
    └── layoutMapper.ts                # ← set isDeletable = level === 'L0' ? index >= 4 : true

src/main/crdPages/space/
├── hooks/useCrdSpaceTabs.tsx          # (no change — already renders index ≥ 4 as custom tabs)
└── tabs/CrdSpaceCustomTabPage.tsx     # (no change — already renders custom-tab content)

tests (co-located *.test.ts / *.test.tsx)
└── layoutMapper / capability-gating unit tests
```

**Structure Decision**: CRD-only web frontend. The change is concentrated in the Settings → Layout surface (the existing subspace tab manager) plus its CRD i18n namespace. The main Space tab bar requires no change because additional L0 tabs (index ≥ 4) already render through `useCrdSpaceTabs` → `CrdSpaceTabbedPages` → `CrdSpaceCustomTabPage`.

## Phase 0 — Research

See [research.md](./research.md). All spec clarifications are resolved; the single open technical question (where to express the "first four protected" rule) is decided there: a per-column `isDeletable` data flag set by the mapper, gating the existing `onDeletePhase` menu entry — chosen over a level check inside the CRD menu (which would leak business rules into `src/crd/`) and over a separate L0-only delete handler (which would duplicate orchestration).

## Phase 1 — Design & Contracts

- **data-model.md** — the Tab (innovation-flow state) view-model, the `isDeletable` derivation, limits, and the post-relocation-on-delete rule.
- **contracts/layout-view.md** — the `SpaceSettingsLayoutView` + `LayoutPoolColumn` prop contract changes (`canManageTabs`, `isDeletable`, level-aware Add/Delete labels).
- **contracts/layout-data.md** — the `useLayoutTabData` / `useColumnMenu` / `layoutMapper` integration contract (what L0 now passes through, the protection derivation, error surfacing).
- **quickstart.md** — how to verify the feature manually and which tests to run.
- **Agent context** — refreshed via `.specify/scripts/bash/update-agent-context.sh claude`.

### Post-design Constitution re-check

No new violations introduced by the design. The CRD layer remains free of business logic: the protection rule is computed in the integration mapper and delivered as a plain boolean prop; the menu's only logic is "show Delete when the handler exists AND the column is deletable", which is presentational gating, not a domain rule. PASS.

## Complexity Tracking

No constitution violations — section intentionally empty.
