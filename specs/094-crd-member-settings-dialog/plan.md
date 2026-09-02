# Implementation Plan: CRD Member Settings Dialog

**Branch**: `094-crd-member-settings-dialog` | **Date**: 2026-04-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/094-crd-member-settings-dialog/spec.md`

## Summary

Bring the CRD Space settings → Community tab to feature-parity with the legacy MUI version by introducing a single **Member settings** dialog that consolidates role management (lead, admin) and member removal. The dialog is reachable from each row's `⋮` dropdown via a **Change Role** item — same dropdown shape as the prototype (`prototype/src/app/components/space/SpaceSettingsCommunity.tsx:534-562`). The destructive **Remove from Space** item in the same dropdown and the in-dialog Remove affordance both converge on a single CRD `AlertDialog` confirmation prompt before the removal mutation runs. We will: (a) add `MemberSettingsDialog` and `RemoveMemberAlertDialog` to `src/crd/components/space/settings/`, (b) modify the existing `SpaceSettingsCommunityView` to swap its dropdown contents and remove inline lead-toggle / immediate-Remove items, (c) extend the existing integration container in `src/main/crdPages/topLevelPages/spaceSettings/` to own the dialog open state, expose a new `onAdminChange` callback wired through the existing `useCommunityAdmin`, and route both Remove paths through one AlertDialog instance, and (d) extend the existing `crd-spaceSettings` translation namespace with `community.memberSettings.*` and `community.members.dropdown.*` keys across all six supported locales. No GraphQL schema changes. No new primitives. The legacy MUI `CommunityMemberSettingsDialog` and `SpaceAdminCommunityPage` remain untouched and continue to serve users with the CRD toggle off.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4) — existing CRD primitives `dialog`, `alert-dialog`, `checkbox`, `label`, `button`, `avatar`, `dropdown-menu`; `lucide-react` (Trash2, MoreHorizontal, X icons); `react-i18next` (existing); Apollo Client (existing, unchanged — reused via `useCommunityAdmin` and generated mutation hooks); React Compiler (`babel-plugin-react-compiler`)
**Storage**: N/A (frontend SPA; data via existing GraphQL queries — no schema changes)
**Testing**: Vitest with jsdom (existing suite continues to pass)
**Target Platform**: Web SPA (Vite, localhost:3001, backend at localhost:3000)
**Project Type**: Web SPA — existing monorepo with established CRD layer
**Performance Goals**: Dialog open + Save persists single role flag in <10 s end-to-end on typical broadband (SC-003); per-row dropdown render cost flat with row count (Radix lazy-mounts dropdown content)
**Constraints**: Zero MUI/Emotion in `src/crd/`; no GraphQL/domain/auth/router imports in `src/crd/`; integration layer (`src/main/crdPages/topLevelPages/spaceSettings/`) reuses existing `useCommunityAdmin`, `useUserContext`, `useCommunityPolicyChecker`; WCAG 2.1 AA; React Compiler compatible (no manual `useMemo`/`useCallback`/`React.memo`); `.crd-root` CSS scoping; props-only / event-handler-as-prop in CRD layer
**Scale/Scope**: 1 new CRD component (`MemberSettingsDialog`), 1 new CRD types file (`memberSettingsTypes.ts`), 1 modified CRD component (`SpaceSettingsCommunityView`), 6 i18n locale files extended, 1 modified integration container (new dialog state, new `onAdminChange` wiring; reuses existing page-level `ConfirmationDialog` for the destructive confirmation), 1 modified data-mapper hook (`useCommunityTabData.ts`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Domain-Driven Frontend Boundaries | PASS | The new CRD component (`MemberSettingsDialog`) is presentational only; all role/remove mutations are issued by the existing `useCommunityAdmin` orchestrator under `src/domain/spaceAdmin/`. The integration container in `src/main/crdPages/...spaceSettings/` is the only place that crosses the boundary, exactly as the existing CRD pattern prescribes. |
| II | React 19 Concurrent UX Discipline | PASS | No legacy lifecycle patterns; no manual memoization (React Compiler handles it); dialog state is plain `useState` for visual flags only; awaited Promises drive busy state without blocking render. |
| III | GraphQL Contract Fidelity | PASS | Reuses existing generated hooks (`useAssignRoleToUserMutation`, `useRemoveRoleFromUserMutation`, `useAssignRoleToOrganizationMutation`, `useRemoveRoleFromOrganizationMutation`) via `useCommunityAdmin`. Component prop types are plain TypeScript — no GraphQL types leak into UI contracts. No schema changes. |
| IV | State & Side-Effect Isolation | PASS | CRD components hold visual-only state (open/close, in-flight). All side effects (mutations, toasts, Apollo cache writes) live in the existing integration / domain hooks. No direct DOM manipulation. |
| V | Experience Quality & Safeguards | PASS | FR-018 / FR-019 / FR-020 / SC-006 enforce WCAG 2.1 AA, keyboard operability, and mobile responsiveness. FR-017 / SC-007 enforce i18n in 6 languages. Mutation failures route through the existing toast pattern (FR-014). |
| Arch 1 | Feature directory taxonomy | PASS | New components live in `src/crd/components/space/settings/`, integration extends `src/main/crdPages/topLevelPages/spaceSettings/community/` — both within established taxonomy. |
| Arch 2 | Styling standard (CRD vs MUI) | PASS | Pure CRD; zero MUI imports introduced anywhere. The legacy MUI page remains unchanged for the toggle-off path — no MUI elements rendered from CRD. |
| Arch 3 | i18n pipeline | PASS | New keys extend the existing `crd-spaceSettings` namespace across all six supported locales; CRD i18n is manually maintained per `src/crd/CLAUDE.md` (not Crowdin). The default `translation` namespace is not imported from CRD. |
| Arch 4 | Build determinism | PASS | No Vite config changes. |
| Arch 5 | Import transparency | PASS | No barrel exports introduced; explicit file paths everywhere. |
| Arch 6 | SOLID / DRY | PASS | Single responsibility: `MemberSettingsDialog` is the role-editor, `RemoveMemberAlertDialog` is the destructive confirmation, `SpaceSettingsCommunityView` is the list+dropdown surface, integration is the wiring. The destructive AlertDialog is mounted once and consumed from both Remove paths (DRY). The existing `useCommunityAdmin` orchestrator is reused — no duplicate mutation logic. |
| Eng 5 | Root cause analysis | PASS | This work fixes a known regression in CRD (immediate-Remove without confirmation, no admin toggle, no max-leads helper text) at its source — by introducing the missing dialog and confirmation primitive — rather than patching symptoms. |

**Result**: All gates pass. No Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/094-crd-member-settings-dialog/
├── plan.md              # This file (/speckit.plan output)
├── spec.md              # Feature specification
├── research.md          # Phase 0: technical decisions + deferred-from-clarify resolutions
├── data-model.md        # Phase 1: TypeScript prop / state types for the new components
├── quickstart.md        # Phase 1: developer setup + manual test matrix
├── contracts/
│   └── crd-components.md  # Phase 1: public component contracts (props in / events out / a11y)
└── checklists/
    └── requirements.md  # Spec quality checklist (created by /speckit.specify)
```

### Source Code (repository root)

This is a single web SPA. New and modified files live within the existing established structure.

```text
src/
├── crd/                                       # Presentational design system (no business logic, no MUI)
│   ├── components/
│   │   └── space/
│   │       └── settings/
│   │           ├── MemberSettingsDialog.tsx           # NEW — Radix Dialog wrapping role/admin checkboxes + in-dialog Remove link + footer. Calls `onRemoveMember(id)` outward; the destructive confirmation is rendered by the existing page-level `ConfirmationDialog` (see Decision #4).
│   │           ├── SpaceSettingsCommunityView.tsx     # MODIFY — replace per-row dropdown contents (View Profile / Change Role / Remove from Space); drop inline lead-toggle and immediate-Remove items; rename onUser/OrgRemove props
│   │           └── memberSettingsTypes.ts             # NEW — MemberSettingsSubject (discriminated user/organization). `MemberSettingsLeadGate` lives inside MemberSettingsDialog.tsx itself; no separate `MemberSettingsCallbacks` type — the dialog accepts the three callbacks directly.
│   └── i18n/spaceSettings/
│       ├── spaceSettings.en.json                      # MODIFY — add community.memberSettings.* + community.members.dropdown.*
│       ├── spaceSettings.nl.json                      # MODIFY — mirror EN keys (English values until translated)
│       ├── spaceSettings.es.json                      # MODIFY — mirror EN keys
│       ├── spaceSettings.bg.json                      # MODIFY — mirror EN keys
│       ├── spaceSettings.de.json                      # MODIFY — mirror EN keys
│       └── spaceSettings.fr.json                      # MODIFY — mirror EN keys
│
├── main/crdPages/topLevelPages/spaceSettings/         # Integration layer
│   ├── CrdSpaceSettingsPage.tsx                       # MODIFY — own activeMemberSubject + removeOriginatedFromDialog flag; mount MemberSettingsDialog as a sibling; reuse the existing page-level community ConfirmationDialog (already wired to `community.pendingRemoval`) for the destructive confirmation; wire callbacks
│   └── community/
│       └── useCommunityTabData.ts                     # MODIFY — expose onAdminChange (wraps useAssignRoleToUserMutation / useRemoveRoleFromUserMutation with RoleName.Admin); expose viewerId (from useUserContext); construct MemberSettingsSubject for both rows; deprecate the inline onUser/OrgLeadChange callbacks (lead changes now run from the dialog's onLeadChange path)
│
├── domain/spaceAdmin/SpaceAdminCommunity/             # Untouched — legacy MUI dialog and hooks reused as the source for the toggle-off path and for mutation logic
│   ├── dialogs/CommunityMemberSettingsDialog.tsx      # UNTOUCHED — legacy MUI dialog, served when CRD toggle is off
│   └── hooks/useCommunityAdmin.ts                     # REUSE — onLeadChange, onAdminChange, onRemoveMember mutation orchestrator
│
├── core/apollo/generated/apollo-hooks.ts              # REUSE — useAssignRoleToUserMutation / useRemoveRoleFromUserMutation / useAssignRoleToOrganizationMutation / useRemoveRoleFromOrganizationMutation
└── main/routing/TopLevelRoutes.tsx                    # UNTOUCHED — already toggles MUI/CRD space settings via useCrdEnabled()
```

**Structure Decision**: Single Web SPA, three-layer architecture already established by 039 / 041 / 042 / 086 / 087 / 091:

1. **Presentation (CRD)** — `src/crd/components/space/settings/` and `src/crd/i18n/spaceSettings/`. Pure, no MUI, no GraphQL, no router.
2. **Integration (CRD pages)** — `src/main/crdPages/topLevelPages/spaceSettings/`. Wires hooks, maps GraphQL types to CRD props, owns dialog open/close state, runs mutations through `useCommunityAdmin`.
3. **Domain & routing** — unchanged. The existing `useCommunityAdmin` orchestrator and the existing `TopLevelRoutes.tsx` MUI ↔ CRD toggle remain in place.

## Component Mapping: CRD ← MUI

| New / Modified CRD Component | Replaces (or extends) MUI Component | Notes |
|---|---|---|
| `MemberSettingsDialog.tsx` (new) | `src/domain/spaceAdmin/SpaceAdminCommunity/dialogs/CommunityMemberSettingsDialog.tsx` | Same dialog body shape (chip → role section → authorization section → remove section → footer); uses Radix `Dialog`, shadcn `Checkbox`, lucide `Trash2`. The MUI `<Trans>` interpolation pattern is reused for the lead/admin labels and the maxLeadsWarning. The in-dialog Remove link calls `onRemoveMember(id)` outward — the destructive confirmation is rendered by the consumer's existing `ConfirmationDialog` (see next row). |
| Existing CRD `ConfirmationDialog` (reused — no new component) | `src/core/ui/dialogs/ConfirmationDialog.tsx` (used by the MUI dialog for removal confirmation) | Built on Radix `AlertDialog` (`src/crd/components/dialogs/ConfirmationDialog.tsx`). Already mounted on `CrdSpaceSettingsPage.tsx` and consumed by `community.pendingRemoval` for community removals. Both Remove paths (dropdown's "Remove from Space" item and the in-dialog Remove link) flow through `community.onUserRemove` / `onOrgRemove` → `pendingRemoval` → existing `ConfirmationDialog`. No new `RemoveMemberAlertDialog` component is created. See research.md Decision #4. |
| `SpaceSettingsCommunityView.tsx` (modify) | `src/domain/spaceAdmin/SpaceAdminCommunity/components/CommunityUsers.tsx` + `CommunityOrganizations.tsx` (row-level affordance) | Replaces the legacy edit-pencil column with a `⋮` dropdown matching the prototype. Drops the previous inline lead-toggle item and the immediate-Remove item. |
| `useCommunityTabData.ts` (modify) | `src/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin.ts` (orchestrator stays put) | Extends the integration hook to expose `onAdminChange` and `viewerId`, and to project row models into `MemberSettingsSubject`. |

## Phase 0: Outline & Research

**Status**: Complete. See [`research.md`](./research.md).

The three items deferred from `/speckit.clarify` were resolved:

1. **Translation namespace** → extend existing `crd-spaceSettings` namespace under `community.memberSettings.*` (no new namespace).
2. **Self admin demotion gating** → no UI-level pre-emption; rely on server authorization and the existing toast pattern (FR-014).
3. **Save button enabled-when-clean state** → always enabled; no-op-then-close when no changes (mirrors MUI behavior).

Two additional decisions made and documented:

4. **Confirmation primitive** → reuse the existing `src/crd/components/dialogs/ConfirmationDialog.tsx` (which is itself built on `src/crd/primitives/alert-dialog.tsx`). The CRD Space Settings page already mounts it for community removals via the `pendingRemoval` state. Both the row dropdown's "Remove from Space" item and the in-dialog Remove link route through `community.onUserRemove` / `onOrgRemove` → `pendingRemoval` → existing `ConfirmationDialog`. **No new `RemoveMemberAlertDialog` component is created**; the earlier "interim second-Dialog" assumption from the spec is removed entirely. The integration layer adds a single `removeOriginatedFromDialog` flag so a successful in-dialog Remove also closes the Member settings dialog. Risk/mitigation: reusing the shared `ConfirmationDialog` means its copy and styling apply to ALL community-removal confirmations (user, organization, virtual contributor, application reject, pending delete) — the i18n keys at `community.confirmRemove.*` were updated to include the cascade-removal warning required by FR-009; no consumer of those keys other than this page existed at the time of the change.
5. **Component scope** → 1 new CRD component (`MemberSettingsDialog`), 1 new types file (`memberSettingsTypes.ts`), 1 modified CRD component (`SpaceSettingsCommunityView`), 1 modified integration container (`CrdSpaceSettingsPage.tsx`), 1 modified integration data-mapper hook (`useCommunityTabData.ts`), 6 modified locale files. Zero new primitives.

## Phase 1: Design & Contracts

**Outputs**:

- [`data-model.md`](./data-model.md) — TypeScript types for `MemberSettingsSubject` (discriminated user/organization), `MemberSettingsLeadPolicy`, `MemberSettingsCallbacks`, `MemberSettingsDialogState` (internal), and integration-layer `ActiveMemberSettings` / `ActiveRemoveConfirmation`. Also documents the row-model → subject mapping and the new translation key inventory.
- [`contracts/crd-components.md`](./contracts/crd-components.md) — public contracts for `MemberSettingsDialog`, `RemoveMemberAlertDialog`, the modified `SpaceSettingsCommunityView`, and the integration-container wiring; plus a component diagram.
- [`quickstart.md`](./quickstart.md) — developer setup, CRD toggle steps, and a 16-step manual test matrix derived from the spec acceptance scenarios (covering entry point, lead toggle, admin toggle, removal from both paths, self-cannot-self-remove, mutation failure, concurrency guard, keyboard, mobile, i18n, CRD-toggle off).

Agent context update will be applied via `.specify/scripts/bash/update-agent-context.sh claude` to add this feature's tech-stack delta to `CLAUDE.md`.

## Post-Design Constitution Re-Check

Re-checked after data-model + contracts: **all gates still pass.** No new violations introduced by Phase 1 design.

- Domain-Driven Boundaries (I): The integration container wiring documented in the contracts adds `onAdminChange` and `viewerId` to existing hook output — both are exposed by composing existing domain hooks. No new domain knowledge crosses into `src/crd/`.
- React 19 Concurrent (II): All component state is `useState` for visual flags; no manual memoization is added. Awaited Promises drive busy state.
- GraphQL Fidelity (III): Component props are plain TypeScript (`MemberSettingsSubject`, `MemberSettingsLeadPolicy`); no generated types leak.
- State Isolation (IV): Dialog state owned by the dialog (visual only); active-row state owned by the integration container; mutations issued through the existing `useCommunityAdmin` orchestrator.
- Experience Quality (V): Contracts call out focus traps, ARIA labels, helper-text association, destructive styling that does not rely on color alone, and a tab order matching the spec Edge Cases.
- SOLID / DRY (Arch 6): One AlertDialog instance handles both Remove paths.
