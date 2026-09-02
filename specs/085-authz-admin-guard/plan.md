# Implementation Plan: Permission-Aware Authorization Admin UI

**Branch**: `085-authz-admin-guard` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/085-authz-admin-guard/spec.md`

## Summary

Role-assignment controls (add **and** remove, for users / organizations / virtual contributors / platform roles) must be rendered non-interactive with an explanatory tooltip when the current user lacks the privilege the backend enforces for that action, and any rejected mutation must produce a visible error notification instead of failing silently.

The technical approach has three parts:

1. **A privilege derivation hook** in `src/domain/access/` that turns an already-loaded `myPrivileges` array plus a required-privilege list into a `{ allowed, reason }` decision. No new query — `useRoleSetManager` already fetches and returns `myPrivileges`.
2. **A CRD presentational wrapper** that renders an action as `aria-disabled` + tooltip when a `disabledReason` prop is supplied. It receives a plain string; it never evaluates privileges itself.
3. **Permission-error notification inside `useRoleSetManagerRolesAssignment`** — the hook that owns all eight assign/remove mutations — scoped to authorization error codes only, because the global error link already toasts every other failure class.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 (React Compiler enabled) / Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: Apollo Client via generated hooks (`src/core/apollo/generated/apollo-hooks.ts`); react-i18next; CRD design system (`src/crd/`, shadcn/ui + Radix + Tailwind v4), specifically `src/crd/primitives/tooltip.tsx` (Radix Tooltip) and `src/crd/primitives/button.tsx`; existing `useNotification()` at `src/core/ui/notifications/useNotification.ts`
**Storage**: N/A — client-side only; privileges are read from GraphQL responses already in the Apollo cache
**Testing**: Vitest + jsdom; unit tests for the derivation hook, component tests for the gated control, integration tests per surface; gates are `pnpm lint` and `pnpm vitest run`
**Target Platform**: Web SPA (current Chrome/Edge/Firefox/Safari)
**Project Type**: single (frontend SPA)
**Performance Goals**: No additional network requests on any surface (SC-004). Enablement is a synchronous array-membership test over data the page already loads.
**Constraints**:
- **CRD only.** Constitution v1.1.0 Arch Std #2 freezes MUI, and the legacy MUI app has since been deleted outright — `@mui/*` and `@emotion/*` are gone from `package.json` and from every file in `src/`. All four inventoried surfaces are CRD, and no MUI variant of the gated control exists or may be created.
- **`src/crd/` takes no business logic.** The privilege decision is computed in `src/main/crdPages/` glue and passed down as a plain string prop.
- **i18n:** new strings go to a CRD per-feature namespace with all six locales (en, nl, es, bg, de, fr) edited in the same PR. `src/core/i18n/en/translation.en.json` is FROZEN for new keys (Arch Std #3).
- WCAG 2.1 AA: the control must be keyboard-focusable *and* non-activatable — this rules out the native `disabled` attribute (see research Decision 3).
- No manual `useMemo`/`useCallback`/`React.memo` (React Compiler); no barrel exports.
**Scale/Scope**: 4 surfaces, 3 shared CRD presentational components, 8 mutations, 1 new hook, 1 new CRD component, 6 locale files. Order of magnitude: ~15 files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | PASS | Privilege derivation lives in `src/domain/access/`; CRD components consume a plain `disabledReason` string. No authorization rule inside a component. |
| II. React 19 Concurrent UX Discipline | PASS | Pure derivation from loaded data; no effects, no lifecycle work. Loading state is an explicit, accessible fallback (FR-008), not a flicker. |
| III. GraphQL Contract Fidelity | PASS | Consumes the existing `Authorization.myPrivileges` field through generated hooks. No schema change, no new query, no codegen run required (see research Decision 1). Component props are plain TS, never generated types. |
| IV. State & Side-Effect Isolation | PASS | The single side effect (error toast) is funnelled through the existing `useNotification()` adapter, raised once at the mutation-owning hook rather than scattered per call site. |
| V. Experience Quality & Safeguards | PASS | `aria-disabled` + focusable trigger meets WCAG 2.1 AA (FR-004, SC-005). Vitest coverage specified for the hook, the component, and each surface. |
| Arch Std #2 (CRD only, MUI frozen) | PASS | All four surfaces are CRD; MUI/Emotion are no longer present in the repo at all, so the single `GatedAction` component is the whole design-system footprint. |
| Arch Std #3 (i18n) | PASS | New keys land in `crd-common` (the default, eagerly-loaded namespace) across all six locales in this PR. Core EN file untouched. |
| Arch Std #5 (No barrel exports) | PASS | All imports use explicit file paths. |
| Arch Std #6 SOLID / DRY | PASS | One hook + one wrapper consumed by every surface (6f). The wrapper takes only `disabledReason` + children, not a wide permissions object (6d/ISP). Error handling sits once in the mutation-owning hook rather than duplicated across eight call sites. |
| Workflow #5 (Root cause before fixes) | PASS | Root cause established by inspection, not assumption: `useErrorHandlerLink.ts:8-12` filters `FORBIDDEN`/`FORBIDDEN_POLICY` out of the global toast pipeline, and the affected surfaces never gate their controls. Both are addressed directly. |

**Gate result**: PASS. No violations; Complexity Tracking is intentionally empty.

**Post-design re-check (after Phase 1)**: still PASS. The design adds one domain hook, one CRD component, and one error-handling block in an existing hook. Nothing in Phase 1 introduced a new dependency, query, schema change, or cross-boundary import. Principle III is strengthened rather than strained — the feature consumes an existing field through an existing generated hook, so no `pnpm codegen` run and no schema diff are required for this PR (Workflow #2 is satisfied vacuously).

## Project Structure

### Documentation (this feature)

```text
specs/085-authz-admin-guard/
├── plan.md              # This file
├── spec.md              # Feature spec (clarified 2026-09-02)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output — privilege shapes + hook contract
├── contracts/
│   └── ui-contract.md   # Phase 1 output — component/hook contracts; no schema change
├── quickstart.md        # Phase 1 output — how to verify end-to-end
└── tasks.md             # Produced by /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── domain/access/
│   ├── permissions/
│   │   ├── useActionPermission.ts               # NEW — (privileges, required[], loading) => { allowed, reason }
│   │   └── useActionPermission.test.ts          # NEW
│   └── RoleSetManager/RolesAssignment/
│       └── useRoleSetManagerRolesAssignment.ts  # TOUCH — authorization-error notification for all 8 mutations
├── crd/
│   ├── components/common/
│   │   ├── GatedAction.tsx                      # NEW — aria-disabled + Radix tooltip wrapper
│   │   └── __tests__/GatedAction.test.tsx       # NEW
│   ├── components/admin/roles/
│   │   └── RoleMembersEditor.tsx                # TOUCH — accept + apply addDisabledReason / removeDisabledReason
│   ├── components/contributor/settings/
│   │   └── RoleAssignmentView.tsx               # TOUCH — same two props (shared by both org tabs)
│   ├── components/space/settings/
│   │   ├── AddCommunityMemberDialog.tsx         # TOUCH — same
│   │   └── MemberSettingsDialog.tsx             # TOUCH — same
│   └── i18n/common/common.{en,nl,es,bg,de,fr}.json   # TOUCH — tooltip + error keys, all six locales
└── main/crdPages/topLevelPages/
    ├── admin/authorization/CrdAdminGlobalRolesPage.tsx           # TOUCH — surface 1
    ├── organizationPages/settings/authorization/useOrgRoleAssignment.ts  # TOUCH — surface 2
    ├── organizationPages/settings/community/useOrgAssociates.ts   # TOUCH — surface 3
    └── spaceSettings/community/useCommunityTabData.ts             # TOUCH — surface 4 (forward canAddUsers)
```

**Structure Decision**: Single-project frontend SPA. New code is deliberately minimal — one domain hook and one CRD component — with every other change being an in-place edit at an inventoried site. The three shared CRD views (`RoleMembersEditor`, `RoleAssignmentView`, the two space-settings dialogs) mean four surfaces are covered by editing three presentational components.

## Complexity Tracking

> No Constitution Check violations — section intentionally left empty.
