# Implementation Plan: CRD Space Settings Page

**Branch**: `045-crd-space-settings` | **Date**: 2026-04-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/045-crd-space-settings/spec.md`

## Summary

Migrate the Space Settings area from MUI (`src/domain/spaceAdmin/*`) to the CRD design system (shadcn/ui + Tailwind), following the same parallel-design-system pattern used by 039 (spaces), 041 (dashboard), 042 (space page), and 043 (search). The CRD Space Settings page reuses the existing `SpaceHeader` hero (from spec 042), places a horizontal icon tab strip below, and renders 8 tabs in this order: **About, Layout, Community, Subspaces, Templates, Storage, Settings, Account**. Every tab is P1 and ships together. Apollo queries and mutations are completely untouched — data mappers in `src/main/crdPages/topLevelPages/spaceSettings/` bridge the generated hooks to presentational CRD component props. Per-tab save semantics:

- **About** — per-field autosave. 2-second idle debounce on text fields; file uploads autosave immediately. Per-field spinner / "Saved!" / error indicator next to each field label. No Save button, no Reset button.
- **Layout** — local dirty buffer with a sticky Save Changes / Reset action bar. Reset reverts to the last backend-known state. Zero mutations before Save is clicked.
- **Community / Subspaces / Templates / Storage / Settings / Account** — per-action commit (no tab-wide save bar).

Layout specifics: items are **callouts/posts** (never "pages"); they can only be moved between columns, never created or deleted here; **column** titles and descriptions are inline-editable with a hover-reveal pencil pattern (callout title / description are read-only — edited from the post's own page); each column header shows only title + description + a top-right three-dot overflow menu with "Active phase" and "Default post template" (no icon, no count badge, no collapse arrow). Layout also includes the Post description display toggle (`calloutDescriptionDisplayMode`) moved back from Settings. Gated behind the existing `alkemio-crd-enabled` localStorage toggle.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), class-variance-authority, lucide-react, Apollo Client, `@dnd-kit/core` + `@dnd-kit/sortable` (all existing — no new runtime dependencies introduced)
**Storage**: localStorage (`alkemio-crd-enabled`) for CRD toggle (existing); GraphQL data layer unchanged
**Testing**: Vitest with jsdom (`pnpm vitest run`)
**Target Platform**: Web SPA (Vite dev server on localhost:3001)
**Project Type**: Web application (frontend only — no backend changes)
**Performance Goals**: Layout Save Changes round-trip under 60s; About per-field autosave (last keystroke → "Saved!" indicator) under 3s (both SC-001); tab switch under 200ms; Layout drag response under 100ms
**Constraints**: Zero MUI / Emotion imports in `src/crd/` and `src/main/crdPages/`; parity with MUI Space Admin for every action (SC-004); all 8 tabs must ship together
**Scale/Scope**: 1 settings shell, 8 tabs (each its own P1 user story), ~30 new CRD components, 8 data mappers, 1 new i18n namespace (`crd-spaceSettings`), ~25 existing Apollo mutations/queries reused

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | CRD components purely presentational. All business logic stays in existing `src/domain/spaceAdmin/*` hooks; data mappers live under `src/main/crdPages/topLevelPages/spaceSettings/`. |
| II. React 19 Concurrent UX Discipline | PASS | CRD components pure and concurrency-safe. Mutations wrapped in `useTransition` per Constitution Principle II. Skeletons + ARIA live regions for async state (FR-028, FR-032). |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes (FR-031). All Apollo operations go through generated hooks. CRD components never import generated GraphQL types. |
| IV. State & Side-Effect Isolation | PASS | CRD components hold only visual state (open/close, grab-mode, inline-edit mode, active tab). Dirty-state buffers, navigation blocking, and mutation wiring all live in `src/main/crdPages/topLevelPages/spaceSettings/`. |
| V. Experience Quality & Safeguards | PASS | FR-011 / FR-032 codify WCAG 2.1 AA including a fully specified keyboard alternative to drag-and-drop. Per-card loading / error states covered by FR-028. |
| Arch #1: Feature directories map to domain contexts | PASS | CRD composites under `src/crd/components/space/settings/`, integration under `src/main/crdPages/topLevelPages/spaceSettings/`. |
| Arch #2: Styling standardizes on MUI theming | **JUSTIFIED VIOLATION** | Same intentional, constitution-acknowledged violation as 039/041/042/043. CRD is the announced successor design system. See Complexity Tracking. |
| Arch #3: i18n via react-i18next | PASS | New namespace `crd-spaceSettings`; English source only; lazy-loaded following 043 pattern. No hard-coded strings. |
| Arch #4: Build artifacts deterministic | PASS | No Vite config changes. No new runtime dependencies — `@dnd-kit/core` / `@dnd-kit/sortable` already in `package.json`. |
| Arch #5: No barrel exports | PASS | All imports use explicit file paths. |
| Arch #6: SOLID + DRY | PASS | SRP: view vs. mapper vs. hook per tab. OCP: per-tab compositions independent. LSP: Save bar, confirm dialog, inline-edit primitive contracts honored across tabs. ISP: each tab's props interface is minimal and tab-specific. DIP: CRD components consume plain props injected by mappers. DRY: shared `SpaceSettingsCard`, `SaveBar`, `InlineEditText`, reused `ConfirmationDialog` from 084-era work, shared `MemberRow` primitive across Community users / orgs / VC tables. |

**Post-Phase 1 re-check**: All gates pass. The Arch #2 violation is identical to prior CRD migrations.

## Project Structure

### Documentation (this feature)

```text
specs/045-crd-space-settings/
├── plan.md              # This file
├── spec.md              # Feature specification (8 per-tab user stories)
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
│   ├── primitives/                               # Existing + newly ported from prototype
│   │   ├── tabs.tsx                              # NEW — ported from prototype/src/app/components/ui/tabs.tsx
│   │   ├── textarea.tsx                          # NEW — ported from prototype
│   │   └── table.tsx                             # NEW — ported from prototype (used by Community users/orgs/VC tables, Storage tree, Account entitlements)
│   ├── components/
│   │   ├── dialogs/
│   │   │   └── ConfirmationDialog.tsx            # EXISTING — extended, not duplicated, to cover delete + discard variants
│   │   ├── common/
│   │   │   ├── InlineEditText.tsx                # NEW — shared inline-edit primitive used by Layout column titles and column descriptions only (callouts are read-only here)
│   │   │   └── MarkdownContent.tsx               # EXISTING — reused for read-only guidelines
│   │   └── space/
│   │       └── settings/                         # NEW — per-tab presentational components
│   │           ├── SpaceSettingsShell.tsx        # Hero reuse + horizontal tab strip + outlet
│   │           ├── SpaceSettingsTabStrip.tsx     # Radix-Tabs-based tab strip
│   │           ├── SpaceSettingsCard.tsx         # Title + description + body primitive
│   │           ├── SpaceSettingsSaveBar.tsx      # Sticky Save Changes / Reset — Layout tab only
│   │           ├── SpaceSettingsAboutView.tsx
│   │           ├── SpaceSettingsLayoutView.tsx
│   │           ├── LayoutPoolColumn.tsx
│   │           ├── LayoutCalloutRow.tsx
│   │           ├── SpaceSettingsCommunityView.tsx
│   │           ├── CommunityUsersTable.tsx       # Main users table
│   │           ├── CommunityOrgsTable.tsx        # Inside Organizations collapsible
│   │           ├── CommunityVirtualContributorsTable.tsx  # Inside VC collapsible
│   │           ├── SpaceSettingsSubspacesView.tsx
│   │           ├── SpaceSettingsTemplatesView.tsx
│   │           ├── SpaceSettingsStorageView.tsx
│   │           ├── SpaceSettingsSettingsView.tsx
│   │           └── SpaceSettingsAccountView.tsx
│   └── i18n/
│       └── spaceSettings/                        # NEW
│           └── spaceSettings.en.json
├── main/
│   └── crdPages/
│       └── topLevelPages/
│           └── spaceSettings/                    # NEW — integration layer
│               ├── CrdSpaceSettingsPage.tsx      # Route entry
│               ├── useSpaceSettingsTab.ts        # URL <-> active tab sync
│               ├── useDirtyTabGuard.ts           # Blocks tab switch + page nav while Layout is dirty; also flushes About's pending debounced autosaves on tab switch
│               ├── about/
│               │   ├── useAboutTabData.ts        # Form buffer + mutations
│               │   └── aboutMapper.ts
│               ├── layout/
│               │   ├── useLayoutTabData.ts       # Dirty buffer + mutation batch on Save
│               │   ├── useColumnMenu.ts          # Wires per-COLUMN Active-phase + Default-post-template mutations (FR-010)
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
└── domain/spaceAdmin/                            # UNCHANGED — existing MUI implementation stays for toggle-off
```

**Structure Decision**: Presentational CRD components live under `src/crd/components/space/settings/`. The route entry, tab routing, dirty-state guard, per-column menu wiring, and per-tab data mappers live under `src/main/crdPages/topLevelPages/spaceSettings/`. Every tab has its own mapper pair (`use<Tab>TabData.ts` + `<tab>Mapper.ts`). Existing `src/domain/spaceAdmin/*` stays intact and continues to serve the MUI variant when `useCrdEnabled()` returns `false`.

**CRD asset reuse (per `src/crd/CLAUDE.md`)**: the plan explicitly reuses existing CRD assets instead of creating parallels:
- `src/crd/components/dialogs/ConfirmationDialog.tsx` — extended in place, not duplicated, to cover both delete and discard variants (FR-026, FR-027).
- `src/crd/forms/markdown/MarkdownEditor.tsx` — reused for About (What / Why / Who) and Community guidelines editing.
- `src/crd/components/common/MarkdownContent.tsx` — reused for any read-only markdown rendering.
- `src/crd/forms/tags-input.tsx` — reused for About tags.
- `src/crd/components/space/SpaceHeader.tsx` — reused verbatim for the settings hero (same as CRD Space Page, SC-008).
- `src/crd/components/space/SpaceCard.tsx` — reused for the About tab's live Preview card.
- `src/crd/lib/pickColorFromId.ts` — called by `aboutMapper.ts` to produce the deterministic accent color used when banner/avatar are missing.

New primitives ported once, then shared: `tabs.tsx`, `textarea.tsx`, `table.tsx`. New composite primitive: `InlineEditText.tsx` (shared between the Layout column title and column description — two use sites; individual callouts are read-only on this tab).

**Layout tab — per-column overflow menu**: `useColumnMenu.ts` returns the API the column-header three-dot button calls (`onChangeActivePhase(columnId, phaseId)`, `onSetAsDefaultPostTemplate(columnId, templateId)`, plus `availablePhases` and `availablePostTemplates`). The Layout view passes these callbacks via `columnMenuActions` to each `LayoutPoolColumn`. Active phase and Default post template are column-level (innovation-flow-step-level) concerns, NOT per-callout. Unit tests exercise both actions end-to-end (SC-009).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Arch #2 (parallel CRD design system) | CRD is the announced successor design system; all new pages adopt it per 039/041/042/043 precedent | Continuing MUI-only would block the CRD migration mandate; this intentional parallel-systems phase is tracked and bounded |
| Shared space-card component (About Preview + future Explore) | User instruction — About's live Preview is the same visual as the Explore Spaces card; ship the primitive once and reuse | Forking the card for About now and again for Explore later would duplicate it and risk drift |
