# Implementation Plan: CRD Space Settings Page

**Branch**: `045-crd-space-settings` | **Date**: 2026-04-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/045-crd-space-settings/spec.md`

## Summary

Migrate the Space Settings area from MUI (`src/domain/spaceAdmin/*`) to the CRD design system (shadcn/ui + Tailwind), following the same parallel-design-system pattern used by 039 (spaces), 041 (dashboard), 042 (space page), and 043 (search). The CRD Space Settings page reuses the existing `SpaceHeader` hero (from spec 042), places a horizontal icon tab strip below, and renders each of the 8 tabs (About, Layout, Community, Subspaces, Templates, Storage, Settings, Account) inside CRD cards with a sticky Save Changes / Reset action bar. Destructive actions use CRD confirmation dialogs. Apollo queries and mutations are completely untouched — data mappers in `src/main/crdPages/topLevelPages/spaceSettings/` bridge the generated hooks to presentational CRD component props. All 8 tabs ship together; there is no mixed-shell fallback. Gated behind the existing `alkemio-crd-enabled` localStorage toggle.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), class-variance-authority, lucide-react, Apollo Client (existing, unchanged), dnd-kit (new — for accessible drag-and-drop on Layout tab)
**Storage**: localStorage (`alkemio-crd-enabled`) for CRD toggle (existing); GraphQL data layer unchanged
**Testing**: Vitest with jsdom (`pnpm vitest run`)
**Target Platform**: Web SPA (Vite dev server on localhost:3001)
**Project Type**: Web application (frontend only — no backend changes)
**Performance Goals**: About-tab save round-trip under 60s (SC-001); tab switch under 200ms; Layout tab drag response under 100ms
**Constraints**: Zero MUI / Emotion imports in `src/crd/` and `src/main/crdPages/`; parity with MUI Space Admin for every action (SC-004); all 8 tabs must ship together
**Scale/Scope**: 1 settings shell, 8 tabs, ~25 new CRD components (tab strip, save bar, per-tab compositions, card primitives), 8 data mappers, 1 new i18n namespace (`crd-spaceSettings`), ~20 existing Apollo mutations/queries reused

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | CRD components are purely presentational. Business logic remains in existing `src/domain/spaceAdmin/*` hooks; data mappers live under `src/main/crdPages/topLevelPages/spaceSettings/`. |
| II. React 19 Concurrent UX Discipline | PASS | CRD components are pure and concurrency-safe. Mutations use `useTransition` in the data mapper to keep the UI responsive during save. Skeleton + Suspense-ready loading states per card. |
| III. GraphQL Contract Fidelity | PASS | No GraphQL schema changes (FR-019). All Apollo operations go through generated hooks. CRD components never import generated GraphQL types. |
| IV. State & Side-Effect Isolation | PASS | CRD components hold only visual state (open/close, grab-mode, active tab). Dirty-state scope, navigation blocking, and mutation wiring live in `src/main/crdPages/topLevelPages/spaceSettings/`. |
| V. Experience Quality & Safeguards | PASS | FR-020 / FR-021 codify WCAG 2.1 AA including a fully specified keyboard alternative to drag-and-drop on the Layout tab. Per-card loading/error states covered by FR-016. |
| Arch #1: Feature directories map to domain contexts | PASS | CRD composites under `src/crd/components/space/settings/`, integration under `src/main/crdPages/topLevelPages/spaceSettings/`. |
| Arch #2: Styling standardizes on MUI theming | **JUSTIFIED VIOLATION** | Same intentional, constitution-acknowledged violation as 039/041/042/043. CRD is the announced successor design system. See Complexity Tracking. |
| Arch #3: i18n via react-i18next | PASS | New namespace `crd-spaceSettings`; English source only; lazy-loaded following 043 pattern. No hard-coded strings. |
| Arch #4: Build artifacts deterministic | PASS | No Vite config changes. `dnd-kit` is a runtime dependency only. |
| Arch #5: No barrel exports | PASS | All imports use explicit file paths. |
| Arch #6: SOLID | PASS | SRP: view vs. data mapper vs. hook. OCP: per-tab compositions are independent. LSP: Save bar and confirm dialog contracts honored across tabs. ISP: each tab's props interface is minimal and tab-specific. DIP: CRD components consume plain props injected by mappers. DRY: shared `SpaceSettingsCard`, `SaveBar`, `ConfirmDeleteDialog` primitives. |

**Post-Phase 1 re-check**: All gates pass; the Arch #2 violation is identical to prior CRD migrations.

## Project Structure

### Documentation (this feature)

```text
specs/045-crd-space-settings/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research findings
├── data-model.md        # Phase 1: entities + mapping notes
├── quickstart.md        # Phase 1: setup and implementation guide
├── contracts/           # Phase 1: TypeScript interfaces for CRD components
│   ├── shell.ts
│   ├── tab-about.ts
│   ├── tab-layout.ts
│   ├── tab-community.ts
│   ├── tab-subspaces.ts
│   ├── tab-templates.ts
│   ├── tab-storage.ts
│   ├── tab-settings.ts
│   ├── tab-account.ts
│   └── data-mapper.ts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── crd/
│   ├── primitives/                               # Existing + three newly ported from prototype
│   │   ├── tabs.tsx                              # NEW — ported from prototype/src/app/components/ui/tabs.tsx
│   │   ├── textarea.tsx                          # NEW — ported from prototype
│   │   └── table.tsx                             # NEW — ported from prototype
│   ├── components/
│   │   ├── dialogs/
│   │   │   └── ConfirmationDialog.tsx            # EXISTING — extended (not duplicated) to cover both delete and discard variants
│   │   ├── common/
│   │   │   └── MarkdownContent.tsx               # EXISTING — reused for read-only guideline rendering
│   │   └── space/
│   │       └── settings/                         # NEW
│   │           ├── SpaceSettingsShell.tsx        # Hero reuse + horizontal tab strip + outlet
│   │           ├── SpaceSettingsTabStrip.tsx     # ARIA tablist; keyboard arrow nav; scroll on mobile
│   │           ├── SpaceSettingsCard.tsx         # Card primitive (title + description + body)
│   │           ├── SpaceSettingsSaveBar.tsx      # Sticky Save Changes / Reset action bar
│   │           ├── SpaceSettingsAboutView.tsx    # About tab: two-column layout (form + Preview)
│   │           ├── SpaceSettingsLayoutView.tsx   # Layout tab: 4 pool column cards
│   │           ├── LayoutPoolColumn.tsx          # Single pool column (Home/Community/Subspaces/Knowledge)
│   │           ├── LayoutPageRow.tsx             # Draggable/pinned row with grab handle
│   │           ├── SpaceSettingsCommunityView.tsx# Community tab: member & lead lists, invitation form
│   │           ├── SpaceSettingsSubspacesView.tsx# Subspaces tab: grid of subspace cards
│   │           ├── SpaceSettingsTemplatesView.tsx# Templates tab: template library grid
│   │           ├── SpaceSettingsStorageView.tsx  # Storage tab: upload dropzone + document table
│   │           ├── SpaceSettingsSettingsView.tsx # Settings tab: privacy/visibility toggles
│   │           └── SpaceSettingsAccountView.tsx  # Account tab: plan + entitlements (read-only)
│   ├── primitives/                               # Reused (Dialog, DropdownMenu, Input, Switch, Radio, ...)
│   └── i18n/
│       └── spaceSettings/                        # NEW
│           └── spaceSettings.en.json
├── main/
│   └── crdPages/
│       └── topLevelPages/
│           └── spaceSettings/                    # NEW — integration layer
│               ├── CrdSpaceSettingsPage.tsx      # Route entry; picks active tab from URL
│               ├── useSpaceSettingsTab.ts        # URL <-> active tab sync + dirty-state gate
│               ├── useDirtyTabGuard.ts           # Blocks tab switch + page nav while dirty
│               ├── about/
│               │   ├── useAboutTabData.ts        # Fetch + mutation wiring (existing hooks)
│               │   └── aboutMapper.ts            # Apollo -> AboutView props
│               ├── layout/
│               │   ├── useLayoutTabData.ts
│               │   └── layoutMapper.ts
│               ├── community/
│               │   ├── useCommunityTabData.ts
│               │   └── communityMapper.ts
│               ├── subspaces/
│               │   ├── useSubspacesTabData.ts
│               │   └── subspacesMapper.ts
│               ├── templates/
│               │   ├── useTemplatesTabData.ts
│               │   └── templatesMapper.ts
│               ├── storage/
│               │   ├── useStorageTabData.ts
│               │   └── storageMapper.ts
│               ├── settings/
│               │   ├── useSettingsTabData.ts
│               │   └── settingsMapper.ts
│               └── account/
│                   ├── useAccountTabData.ts
│                   └── accountMapper.ts
└── domain/spaceAdmin/                            # UNCHANGED — existing MUI implementation remains for toggle-off
```

**Structure Decision**: Presentational CRD components live under `src/crd/components/space/settings/`. The route entry, tab routing, dirty-state guard, and per-tab data mappers live under `src/main/crdPages/topLevelPages/spaceSettings/`. This mirrors the structure used by 041/042/043 and preserves the constitutional boundary between pure UI and domain/data orchestration. Existing `src/domain/spaceAdmin/*` stays intact and continues to serve the MUI variant when `useCrdEnabled()` returns `false`.

**CRD asset reuse (per `src/crd/CLAUDE.md`)**: the plan explicitly reuses existing CRD assets instead of creating parallels:
- `src/crd/components/dialogs/ConfirmationDialog.tsx` — extended, not duplicated, to cover both delete and discard variants used by FR-014 and FR-015.
- `src/crd/forms/markdown/MarkdownEditor.tsx` — reused for About (vision / mission / impact / who) and Community guidelines editing.
- `src/crd/components/common/MarkdownContent.tsx` — reused for any read-only markdown rendering.
- `src/crd/forms/tags-input.tsx` — reused for About tags.
- `src/crd/components/space/SpaceHeader.tsx` — reused verbatim for the settings hero (same as CRD Space page).
- `src/crd/components/space/SpaceCard.tsx` — reused for the About tab's live Preview card.
- `src/crd/lib/pickColorFromId.ts` — called by `aboutMapper.ts` to produce the deterministic accent color used by the Preview when banner/avatar are missing.

New primitives ported once, then shared: `tabs.tsx`, `textarea.tsx`, `table.tsx` (see T004a–T004c).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Arch #2 (parallel CRD design system) | CRD is the announced successor design system; all new pages adopt it per 039/041/042/043 precedent | Continuing MUI-only would block the CRD migration mandate; this intentional parallel-systems phase is tracked and bounded |
| New `dnd-kit` dependency | Required for WCAG 2.1 AA keyboard drag alternative specified in FR-021 (grab-mode with Arrow/Enter/Escape) | MUI's current Layout editor uses non-accessible drag via a different lib; rebuilding accessible DnD from scratch would reinvent existing audited wheels |
