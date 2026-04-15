# Implementation Plan: Permission-Aware Authorization Admin UI

**Branch**: `085-authz-admin-guard` | **Date**: 2026-04-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/085-authz-admin-guard/spec.md`

## Summary

Every "Add user" (and equivalent role/user-assignment) control across the app must be (a) rendered disabled with a tooltip when the current user lacks the `GRANT` privilege on the target entity's role-set (or equivalent authorization boundary), and (b) fall back to a visible error notification if a backend mutation fails for any reason instead of silently no-op-ing. The technical approach is a shared UI pattern built on the existing `Authorization.myPrivileges` field already returned by GraphQL and the existing `useNotification()` toast helper — no new backend capability is required. The change is a retrofit: introduce a small shared hook + disabled-button composable, then apply it uniformly to each known site.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 (React Compiler enabled) / Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: Apollo Client (generated hooks from `src/core/apollo/generated/apollo-hooks.ts`), react-i18next, MUI v5 (for legacy admin pages still on MUI), `src/crd/` shadcn/Tailwind primitives (for any CRD-path sites), existing `useNotification()` helper at `src/core/ui/notifications/useNotification.ts`
**Storage**: N/A (client-side only; privileges read from GraphQL responses)
**Testing**: Vitest + jsdom; component tests where pattern is introduced; existing `pnpm lint` + `pnpm vitest run` gates
**Target Platform**: Web SPA (Chrome/Edge/Firefox/Safari current)
**Project Type**: single (frontend SPA)
**Performance Goals**: No perceptible regression in admin-page interactions; privilege check is a synchronous array includes on already-loaded data.
**Constraints**: Must not add new GraphQL queries where `myPrivileges` is already fetched; WCAG 2.1 AA for the tooltip (keyboard-focusable, SR-announced); no manual `useMemo`/`useCallback` (React Compiler); no barrel exports; no MUI imports inside `src/crd/`; no GraphQL generated types as component prop types.
**Scale/Scope**: ~6–8 mutation sites and ~5+ button/UI sites inventoried in `research.md`. Order-of-magnitude: low tens of files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | PASS | Privilege-check hook lives under `src/domain/access/` (authorization domain); UI primitives only consume it. No business rule in components. |
| II. React 19 Concurrent UX Discipline | PASS | Pure render; no blocking work. Disabled-state calc is a pure derivation from already-loaded data. No legacy lifecycles touched. |
| III. GraphQL Contract Fidelity | PASS | Uses existing generated `Authorization.myPrivileges` field. No new queries; existing fragments already include it on role-sets. Generated hooks only. Component props are plain TS, not GraphQL types. |
| IV. State & Side-Effect Isolation | PASS | Pure derivation + existing `useNotification()`. No direct DOM access. Error handling funneled through the shared notification adapter. |
| V. Experience Quality & Safeguards | PASS | Tooltip meets WCAG 2.1 AA (keyboard-focusable wrapper on disabled controls, ARIA-described). Tests cover the derivation hook and at least one integration site. |
| Architecture Std #2 (MUI→CRD transition) | PASS | Retrofit applied in-place: MUI admin pages use MUI Tooltip+Button; CRD pages (if any Add-user control exists) use `src/crd/primitives/`. No cross-contamination. |
| Architecture Std #3 (i18n) | PASS | Tooltip/error copy added to `src/core/i18n/en/translation.en.json` (and `src/crd/i18n/<feature>.en.json` if CRD surface touched). No hardcoded strings. |
| Architecture Std #5 (No barrel exports) | PASS | All new imports use explicit file paths. |
| Architecture Std #6 SOLID / DRY | PASS | One shared hook + one disabled-with-tooltip wrapper eliminates per-site duplication; each site consumes the abstraction. |
| Engineering Workflow #5 (Root cause) | PASS | Root cause: client-side mutations lack pre-flight privilege gating and lack `onError` toasts. Fix is targeted — gate at the UI, handle error at the mutation boundary. No workarounds. |

**Gate result**: PASS. No violations; Complexity Tracking section not required.

## Project Structure

### Documentation (this feature)

```text
specs/085-authz-admin-guard/
├── plan.md              # This file
├── spec.md              # Feature spec
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output — privilege-related shapes consumed
├── contracts/
│   └── graphql-usage.md # Phase 1 output — which generated types/fields are consumed (no new schema)
├── quickstart.md        # Phase 1 output — how to verify end-to-end
├── checklists/
│   └── requirements.md  # From /speckit.specify
└── tasks.md             # Produced by /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── access/
│       └── authorization/
│           ├── useHasPrivilege.ts           # NEW — shared hook: (authorizable, privilege) => { hasPrivilege, isLoading }
│           └── useHasPrivilege.test.ts      # NEW
├── core/
│   └── ui/
│       └── button/
│           └── DisabledWithTooltipButton.tsx  # NEW (MUI variant) — wraps MUI Button, focusable disabled state + tooltip
├── crd/
│   └── components/
│       └── permissions/
│           └── DisabledWithTooltipButton.tsx  # NEW (CRD variant, only if a CRD surface has an Add-user control)
├── main/
│   └── admin/
│       └── authorizationPolicies/
│           └── AuthorizationPoliciesPage.tsx  # TOUCH — apply pattern if it exposes mutating controls
├── domain/
│   ├── platformAdmin/management/authorization/AdminAuthorizationPage.tsx   # TOUCH
│   ├── community/organizationAdmin/views/
│   │   ├── OrganizationAssociatesView.tsx                                  # TOUCH
│   │   └── OrganizationAuthorizationRoleAssignementView.tsx                # TOUCH
│   ├── community/inviteContributors/
│   │   ├── users/InviteUsersDialog.tsx                                     # TOUCH
│   │   └── virtualContributors/InviteVCsDialog.tsx                         # TOUCH
│   └── spaceAdmin/SpaceAdminCommunity/components/
│       ├── CommunityUsers.tsx                                              # TOUCH (already gated; align privilege source + error handling)
│       ├── CommunityOrganizations.tsx                                      # TOUCH (same)
│       └── CommunityVirtualContributors.tsx                                # TOUCH (same)
└── domain/access/RoleSetManager/
    ├── useRoleSetManager.ts                                                # TOUCH — add onError to assign/remove mutations
    └── useRoleSetManagerRolesAssignment.ts                                 # TOUCH — add onError

src/core/i18n/en/translation.en.json                                        # TOUCH — add tooltip + error-toast keys
```

**Structure Decision**: Single-project frontend SPA. New code is minimal: one privilege hook in `src/domain/access/authorization/` and one disabled-with-tooltip button wrapper (MUI variant in `src/core/ui/button/`, and a CRD variant in `src/crd/components/permissions/` only if a CRD surface has an Add-user control). All other changes are in-place edits to the inventoried sites. No backend changes, no new GraphQL queries — privileges are already present on `Authorization.myPrivileges` via existing fragments; any site missing the field on its query must have its `.graphql` document extended and codegen re-run in the same PR.

## Complexity Tracking

> No Constitution Check violations — section intentionally left empty.
