# Phase 0 Research: Global Administration in CRD

This is a **parity migration** — the existing MUI admin is the authoritative source of truth, so there were no open product unknowns and no `[NEEDS CLARIFICATION]` markers in the spec. Research here resolves the *technical approach* questions: which existing CRD primitives to reuse, how the MUI admin is structured, and how to wire the toggle.

## Source of truth (MUI admin inventory)

- **Entry / gate**: `src/domain/platformAdmin/routing/PlatformAdminRoute.tsx`; access gated by `src/main/admin/NonPlatformAdminRedirect.tsx` via `usePlatformLevelAuthorizationQuery()` + `AuthorizationPrivilege.PlatformAdmin` (non-admins → `/restricted`).
- **Shell**: `src/domain/platformAdmin/layout/toplevel/AdminLayout.tsx` (`TopLevelLayout` + `HeaderNavigationTabs` + `PageContent`).
- **Section nav source**: `src/domain/platformAdmin/layout/toplevel/constants.ts` → `enum AdminSection` + `adminTabs[]` (10 sections, in order: Spaces, Users, Organizations, Innovation Packs, Innovation Hubs, Virtual Contributors, Authorization, Authorization Policies, Transfer, Layout). **Note the route-path quirks**: `virtualContributors`/`authorizationPolicies` enum values differ from their URL segments (`/admin/virtual-contributors`, `/admin/authorization-policies`); paths come from `adminTabs[].route`, not the enum value.
- **Shared table**: `src/domain/platformAdmin/components/AdminSearchableTable.tsx` — generic, supports `clientSide` (show-more over a full dataset) and server `fetchMore` modes, custom `columns[]`, `itemActions`, `onDelete` (→ `RemoveModal`).
- **Cell renderers**: `src/domain/platformAdmin/components/AdminListItemLayout.tsx` (`ListedInStoreColumn`, `SearchVisibilityColumn`, `AccountOwnerColumn`, `VisibilityChipColumn`).
- **Per-section files & hooks**: enumerated in the spec; e.g. `usePlatformAdminSpacesListQuery`, `usePlatformAdminUsersListQuery`, `usePlatformAdminOrganizationsListQuery`, `usePlatformAdminInnovationPacksQuery`, `usePlatformAdminInnovationHubsQuery`, `usePlatformAdminVirtualContributorsListQuery`, `usePlatformRoleSetQuery`/`useRoleSetManager`/`useRoleSetAvailableUsers`, `useAuthorizationPolicyQuery`, transfer/conversion hooks (`useTransferSpace`, `useSpaceConversion`, …), license-plan hooks (`useAssignLicensePlanToAccountMutation`, `useRevokeLicensePlanFromAccountMutation`, `usePlatformLicensingPlansQuery`), `useChangeUserEmailMutation`, `useResolveUserEmailDriftMutation`, `useAdminOrganizationVerifyMutation`, `useDeleteUser/Space/Organization/InnovationPack/InnovationHubMutation`, `useCreateOrganizationMutation`/`useUpdateOrganizationMutation`.

### Decision: reuse the MUI data layer verbatim
- **Rationale**: Constitution III + visual-only mandate. The hooks already encode pagination, refetch, validation, and authorization. Re-implementing them would risk behavioral drift.
- **Alternatives rejected**: new queries/hooks (needless codegen, drift risk); calling Apollo directly in components (violates DIP + CRD rules).

## CRD building blocks to reuse

| Need | Reused CRD asset | Path |
|---|---|---|
| Tab/section navigation | `SettingsTabStrip` (config-driven, mobile-scroll, a11y) | `src/crd/components/contributor/settings/SettingsTabStrip.tsx` |
| Settings header pattern | `SettingsShell` (reference; admin gets its own `AdminShell` with a title instead of an avatar) | `src/crd/components/contributor/settings/SettingsShell.tsx` |
| Searchable list reference | `PendingMembershipsTable`, `ForumDiscussionList` (sort/filter/paginate patterns) | `src/crd/components/space/settings/`, `src/crd/components/forum/` |
| Table primitive | `Table`/`TableRow`/`TableCell` | `src/crd/primitives/table.tsx` |
| Confirm destructive | `ConfirmationDialog` (`variant="destructive"`) | `src/crd/components/dialogs/ConfirmationDialog.tsx` |
| Unsaved-edits guard | `useDialogCloseGuard` + `DiscardChangesDialog` | `src/crd/components/dialogs/` |
| User / contributor pickers | `UserSelector`, `ContributorSelector` | `src/crd/forms/` |
| Search input | `SearchField` | `src/crd/forms/SearchField.tsx` |
| Text fields / tags | `FloatingField`, `tags-input` | `src/crd/forms/` |
| Badges/chips | `Badge` | `src/crd/primitives/badge.tsx` |
| Avatar fallback colour | `pickColorFromId` | `src/crd/lib/pickColorFromId.ts` |

### Decision: dedicated `AdminShell`, reusing `SettingsTabStrip`
- **Rationale**: The admin nav is a horizontal tab strip identical in behavior to settings tabs, but the header is a platform-level page title, not an entity avatar. Composing the existing strip keeps a11y/mobile behavior consistent (DRY) while a thin new shell handles the title.
- **Alternatives rejected**: forcing `SettingsShell` with a fake avatar (semantically wrong, ISP violation); a brand-new tab component (duplicates `SettingsTabStrip`).

### Decision: one `CrdAdminSearchableTable` for all list sections
- **Rationale**: Six sections share the Name + custom-columns + actions + delete shape; MUI already proves a single generic table works. One component with explicit `clientSide`/server modes satisfies DRY and matches MUI semantics exactly.
- **Alternatives rejected**: per-section bespoke tables (duplication); MUI DataGrid (forbidden).

## Routing & toggle

- **Decision**: Add a single conditional at the existing `/admin/*` route in `src/main/routing/TopLevelRoutes.tsx`: `crdEnabled ? <CrdAdminRoutes/> : <PlatformAdminRoute/>`. The CRD branch is wrapped by `CrdLayoutWrapper` (CRD header/footer); the MUI branch is unchanged. `crdEnabled` already comes from `useCrdEnabled()`.
- **Rationale**: Mirrors every other migrated route (Users, Orgs, Dashboard, Forum…). Lazy-loaded so MUI-version users fetch zero CRD admin code.
- **Sub-routes** (user detail/edit, user email-change history, org create/edit) live inside `CrdAdminRoutes` as nested routes under the shell, each deep-linkable (FR-004).

## i18n

- **Decision**: New namespace `crd-admin` at `src/crd/i18n/admin/admin.<lang>.json` for all 6 languages (en, nl, es, bg, de, fr), registered in `src/core/i18n/config.ts` `crdNamespaceImports` and in `@types/i18next.d.ts`. Lazy-loaded.
- **Rationale**: Matches the 20 existing `crd-*` namespaces; CRD i18n is manually/AI-maintained (not Crowdin). Apply the do-not-translate glossary (Space, Subspace, Post, template, Layout, Virtual Contributor) for `nl`.
- **Alternatives rejected**: reusing `translation` (forbidden in CRD); cramming into `crd-spaceSettings` (wrong feature scope).

## Testing approach

- **Decision**: Vitest + Testing Library. Each section gets: (a) presentational tests for the CRD component (render, actions fire callbacks, a11y, confirm-before-delete), (b) integration/parity tests for the page (correct hook wiring, mapper output, gating, post-mutation refetch). Mock the existing generated hooks.
- **Rationale**: FR-097 / SC-008 demand parity coverage per section/action; mirrors how existing CRD pages are tested.

## Open items / explicitly out of scope

- Removing the toggle, deleting MUI admin files, any redesign or new admin capability — **out of scope** (spec Assumptions).
- No new GraphQL operations anticipated. If a CRD view genuinely needs a field absent from the current queries, add a fragment + `pnpm codegen` in the same PR (constitution III) — treated as a contingency, not a planned task.
