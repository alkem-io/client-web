# Implementation Plan: CRD Contributor Settings (User + Organization)

**Branch**: `097-crd-user-settings` | **Date**: 2026-05-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/097-crd-user-settings/spec.md`

## Summary

Migrate the **two contributor settings shells** — the 7-tab User shell at `/user/:userSlug/settings/*` and the 5-tab Organization shell at `/organization/:orgSlug/settings/*` — from MUI to the CRD design system, following the parallel-design-system migration pattern proven by 039 / 041 / 042 / 043 / 045 / 091 / 096. Apollo queries and mutations are completely unchanged — per-tab data mappers under each integration subtree bridge generated GraphQL types to plain CRD prop types. **No GraphQL schema change.** Both shells are gated by the existing `alkemio-crd-enabled` localStorage toggle, dispatched at two locations: `TopLevelRoutes.tsx` (for `/user/*`, jointly with sibling spec 096) and `CrdOrganizationRoutes.tsx` (which currently delegates `settings/*` unconditionally to MUI — flipped to a `useCrdEnabled()` dispatch by this spec).

The 12 settings tabs ship together with the public profiles (sibling spec 096) as one CRD rollout cohort: when the toggle is on, the entire contributor vertical (3 public profile pages + 7 user settings tabs + 5 org settings tabs) renders in CRD; when off, the entire vertical renders in the existing MUI files. Each settings tab is an independently testable user story (P1 ×12, per the spec).

**Per-tab save semantics:**

- **User My Profile and Org Profile** — per-field explicit save with hover-reveal pencil affordance + check (Save) and × (Cancel) icons. No tab-wide buffer; switching tabs silently drops in-progress edits. On save failure the field stays in edit mode with the typed value preserved (FR-022 / FR-090). Org Profile uses the **same** per-field model as User My Profile — a deliberate UX divergence from current MUI's Formik-with-single-Save in `OrganizationForm`, chosen for consistency across the contributor vertical.
- **User Account / Org Account** — per-action commit (no Save bar). Create / Manage / Delete trigger existing flows by navigating to the existing MUI admin routes (the CRD Account tabs are presentational shells + kebab dispatchers; see Architectural Note below). The CRD Account view is a **shared** component reused by both actor integrations.
- **User Membership / Organizations / Notifications / Settings** — per-control commit on click (no Save bar). Notifications uses the optimistic-overrides pattern from current MUI.
- **Org Community / Org Authorization** — per-action commit on click via the existing `useRoleSetManager` + `useRoleSetAvailableUsers` flows. The shared role-assignment view is reused across Community (Associate role) and the two Authorization sub-tabs (Admin / Owner).
- **Org Settings** — per-control commit on click. Two switches: domain-membership and contribution-roles-public. **No Design System toggle here** — that toggle is User-only (viewer-scoped browser preference).
- **User Security** — identity-provider settings flow mounted inside a CRD card shell; the rendered fields keep their default styling (out of scope to restyle this iteration).

**Authorization (per-actor predicates):**

- **User shell** — `canEditUserSettings = (currentUser.id === profileUser.id) || hasPlatformAdminPrivilege`. Falsy → redirect to `/user/<slug>` (public profile, sibling spec 096). No read-only mode.
- **Org shell** — `canEditOrganizationSettings = organization.authorization.myPrivileges.includes(AuthorizationPrivilege.Update)`. Falsy → redirect to `/organization/<slug>` (public profile, sibling spec 096). No read-only mode.
- **User Security tab** — owner only regardless of admin status (identity-provider session constraint). Hidden from the strip and the route redirects to `/user/<slug>/settings/profile` for any non-owner viewer (FR-083 / FR-084).
- The `/user/*` route subtree continues to be wrapped by the existing `NoIdentityRedirect`; the `/organization/*` admin subtree is wrapped by the existing `NonAdminRedirect` (preserved unchanged).

**Coupling with sibling spec `096-crd-user-pages`:**

- Both specs share the same `useCrdEnabled` toggle and the same `CrdLayoutWrapper`. They are gated together — toggling CRD on flips both the public profiles and the settings shells simultaneously.
- The shared route helpers `useUserPageRouteContext` (already added by 096), `CrdUserRoutes.tsx` (already added by 096), and `CrdOrganizationRoutes.tsx` (already added by 096) are extended by this spec — not duplicated. The Org settings dispatch in `CrdOrganizationRoutes.tsx` is the one piece that 096 deliberately stubbed (delegated to MUI) for this spec to fill in.
- 096's existing assumption that "the Org admin shell is a future spec" is satisfied by **this** spec, expanded to also cover the User admin shell so both verticals migrate in lockstep.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), `class-variance-authority`, `lucide-react`, Apollo Client (existing — unchanged), `react-i18next` (existing), `react-router-dom` (existing — only the integration layer touches it). All required CRD primitives (`tabs`, `card`, `dialog`, `alert-dialog`, `dropdown-menu`, `switch`, `popover`, `avatar`, `badge`, `button`, `input`, `label`, `select`, `textarea`, `skeleton`, `tooltip`, `breadcrumb`, `scroll-area`, `table`, `checkbox`) already exist under `src/crd/primitives/`. Reuses existing CRD forms (`@/crd/forms/markdown/MarkdownEditor`, `@/crd/forms/tags-input`). Reuses existing CRD dialogs (`ConfirmationDialog` from `@/crd/components/dialogs/`). **No new runtime dependencies.**
**Storage**: localStorage (`alkemio-crd-enabled`) for the CRD toggle (existing). GraphQL data layer unchanged.
**Testing**: Vitest with jsdom (`pnpm vitest run`) — unit tests for mappers, route guards, the per-actor `canEdit*Settings` predicates, the per-field `EditableField` state machine, push-availability gating, and i18n key parity. Visual / interaction validation via `pnpm start` and manual smoke through each tab.
**Target Platform**: Web SPA (Vite dev server on `localhost:3001`).
**Project Type**: Web application (frontend only — no backend changes).
**Performance Goals**: Per-field save round-trip < 3s (typical) on User My Profile and Org Profile; tab switch < 200ms; pencil-hover affordance reveal < 50ms; bundle delta on the two new lazy-loaded chunks combined ≤ +50 KB gzipped over the prior build (SC-007).
**Constraints**: Zero `@mui/*` / `@emotion/*` imports under `src/crd/` and under either of the two integration subtrees (`src/main/crdPages/topLevelPages/userPages/settings/`, `src/main/crdPages/topLevelPages/organizationPages/settings/`). Generated GraphQL types only crossable inside per-tab mappers (FR-006). All 7 user tabs ship together; all 5 org tabs ship together (FR-001 / FR-002). All six languages (en / nl / es / bg / de / fr) edited in the same PR per the manual CRD i18n workflow.
**Scale/Scope**: 2 settings shells (User 7-tab, Org 5-tab) sharing a generalized `SettingsShell` primitive + 12 settings tabs (each its own P1 user story) + 1 new CRD i18n namespace (`crd-contributorSettings`) + ~30 new CRD presentational components + 12 data mappers (one per tab) + ~12 existing Apollo queries / mutations reused unchanged + ~3 new shared helpers (`useCanEditUserSettings`, `useCanEditOrganizationSettings`, the shared `EditableField` wrapper family). The shared shell, the role-assignment view (used by Community + Authorization sub-tabs), and the `ContributorAccountView`-equivalent (used by both Account tabs) are all single-implementation reuses. **No new primitives required.**

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | CRD components purely presentational. All business logic stays in existing domain hooks (`useUserSettings`, `useFilteredMemberships`, `useContributionProvider.leaveCommunity`, `usePushNotificationContext`, `useOrganizationProvider`, `useRoleSetManager`, `useRoleSetAvailableUsers`). Per-tab data mappers live under each integration subtree. |
| II. React 19 Concurrent UX Discipline | PASS | All CRD views are pure render functions. Per-field save uses local visual state only; mutations wrap with `useTransition` in the integration layer so a slow save never blocks a tab switch. Suspense boundaries surround each lazy-loaded CRD page. No legacy lifecycles introduced. |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes (FR-006 + Out of Scope). All Apollo operations go through generated hooks from `src/core/apollo/generated/apollo-hooks.ts`. CRD components never import generated GraphQL types — only data mappers do. |
| IV. State & Side-Effect Isolation | PASS | CRD components hold only visual state (edit/idle, hover, active tab, popover open, scroll position, sub-tab selection on Authorization). All side effects (mutations, navigation, localStorage writes for the design-system toggle, identity-provider flow) live in the integration layer. |
| V. Experience Quality & Safeguards | PASS | FR-150 / FR-151 / FR-152 / FR-153 codify WCAG 2.1 AA: semantic HTML, visible focus, accessible names on icon-only buttons, keyboard reachable tab strip and sub-tab strip, `aria-busy` on async-pending controls. Tab-strip horizontal-scroll variant on `< md` keeps every tab keyboard-reachable. |
| Arch #1: Feature directories map to domain contexts | PASS | Presentational components under `src/crd/components/contributor/settings/` (shared), `src/crd/components/user/settings/` (User-specific), `src/crd/components/organization/settings/` (Org-specific). Integration under two parallel subtrees of `src/main/crdPages/topLevelPages/`. Domain hooks reused from `src/domain/community/userAdmin/`, `src/domain/community/organizationAdmin/`, `src/domain/access/`. |
| Arch #2: Styling standardizes on MUI theming | **JUSTIFIED VIOLATION** | Same intentional, constitution-acknowledged violation as 039 / 041 / 042 / 043 / 045 / 091 / 096. CRD is the announced successor design system. See Complexity Tracking. |
| Arch #3: i18n via react-i18next | PASS | New combined namespace `crd-contributorSettings`; English source only edited directly; the other five languages (nl / es / bg / de / fr) maintained manually in the same PR per `src/crd/CLAUDE.md` (no Crowdin). No hard-coded strings. |
| Arch #4: Build artifacts deterministic | PASS | No Vite config changes. No new runtime dependencies. Existing CRD chunk-splitting strategy applies — two new lazy-loaded chunks (one per actor settings shell). |
| Arch #5: No barrel exports | PASS | All imports use explicit file paths. |
| Arch #6: SOLID + DRY | PASS | **SRP**: view vs. mapper vs. hook per tab. **OCP**: per-tab compositions independent; per-field `EditableField` primitive accepts a strategy callback for save; the shared `RoleAssignmentView` is parameterized by role label + role-set manager output. **LSP**: every editable field implements a uniform `EditableFieldProps<T>` contract. **ISP**: each tab's view-prop interface is minimal and tab-specific (`MyProfileViewProps`, `OrgProfileViewProps`, `RoleAssignmentViewProps`, etc.). **DIP**: views consume plain props injected by mappers — never call Apollo directly. **DRY**: shared `EditableField` wrapper across User My Profile + Org Profile fields, shared `SettingsCard`, shared `SettingsShell` + `SettingsTabStrip` (User passes 7 tabs, Org passes 5), shared `ContributorAccountView` (User Account + Org Account), shared `RoleAssignmentView` (Org Community + both Authorization sub-tabs), shared `ConfirmationDialog` from `src/crd/components/dialogs/`. |

**Post-Phase 1 re-check**: All gates pass. The Arch #2 violation is identical to prior CRD migrations.

### Architectural Note — Account tab create / manage / delete flows

The existing `ContributorAccountView` (used by both MUI User Account and MUI Org Account today) imports `@mui/material`, `@mui/icons-material`, and other MUI core/UI modules — it cannot be embedded in a CRD page (FR-006). The spec wording "render four card groups using the existing data hooks" is interpreted as **wrap the data hooks** (which is fine), not the View component (which is impossible without violating FR-006).

Each CRD Account tab is therefore a **thin presentational shell** that:

1. Renders the four card groups (Hosted Spaces, Virtual Contributors, Innovation Packs, Innovation Hubs) using CRD primitives + a reused `CompactSpaceCard` / `ContributorCardHorizontal`-equivalent CRD component.
2. Surfaces every kebab action and create button as a callback prop.
3. The integration layer wires those callbacks to the existing creation / management routes via `useNavigate(...)` — landing the user on the existing MUI admin pages for the heavy flows. **No CRD ports of the existing MUI creation dialogs are introduced in this spec** — preserving "no new behavior" while honoring FR-006.

The CRD Account view is a **single shared component** consumed by both User Account and Org Account integrations via per-actor mappers. This pragmatic choice is documented in `research.md` (Decision #3) and preserves the option to port specific dialogs to CRD in a follow-up spec if desired.

### Architectural Note — Per-actor predicate split

The two settings shells use different authorization sources (FR-010 / FR-011). Rather than collapsing them into a single discriminated union helper, this plan uses **two siblings** for clarity:

- `useCanEditUserSettings(profileUserId: string)` → `{ canEditSettings, isOwner, isPlatformAdmin }`. Same predicate the prior 097 used. **Already specced** as a shared helper between 096 and the prior 097 — referenced under `src/main/crdPages/topLevelPages/userPages/useCanEditSettings.ts` in 096's plan. This spec **renames** that helper to `useCanEditUserSettings.ts` to match the new namespace pattern; if 096 has already landed it under the old name, this rename is a one-line change in the imports.
- `useCanEditOrganizationSettings(organizationId: string)` → `{ canEditSettings, hasUpdatePrivilege }`. New helper introduced by this spec. Reads `useOrganizationProvider().permissions.canEdit` (the existing predicate the MUI `NonAdminRedirect` uses) and lifts it into a hook so the settings-shell route guard can consume it cleanly.

Both helpers are pure and testable; both are colocated with their actor-specific integration subtree (`userPages/` for the User one, `organizationPages/` for the Org one).

### Architectural Note — Edit pattern unification (User + Org Profile)

The decision to use **per-field explicit save on Org Profile** (FR-090, matching User My Profile FR-020) is a deliberate UX divergence from the current MUI `OrganizationForm.tsx` (Formik with a single Save button). Rationale:

- **Consistency**: a contributor in this product can be both a user and an org admin. Cross-tab consistency reduces cognitive load — one mental model ("each field saves on its own") instead of two.
- **Smaller blast radius per save**: per-field saves preserve the rest of the payload, so a transient validation failure on one field doesn't block saves on others.
- **Mid-edit tab switching**: with no tab-wide dirty buffer, users never face a "discard changes?" dialog when switching tabs (FR-016) — the pattern works the same way on both actor profiles.

Implementation: the `EditableField` family (text / markdown / select / tags / reference-row variants) is **shared** across both Profile tabs. The Org Profile mapper produces the same `EditableFieldProps` shape as the User My Profile mapper, just with `updateOrganization` as the underlying mutation instead of `updateUser`.

## Project Structure

### Documentation (this feature)

```text
specs/097-crd-user-settings/
├── plan.md              # This file
├── spec.md              # Feature specification (12 P1 user stories)
├── research.md          # Phase 0: research findings + ambiguity resolutions
├── data-model.md        # Phase 1: entities + GraphQL → CRD prop mappings
├── quickstart.md        # Phase 1: setup, build order, smoke checklist
├── contracts/           # Phase 1: TypeScript interfaces for CRD components
│   ├── shell.ts                       # SettingsShell + SettingsTabStrip + SettingsCard
│   ├── editable-field.ts              # EditableField family contracts
│   ├── tab-userMyProfile.ts
│   ├── tab-userAccount.ts
│   ├── tab-userMembership.ts
│   ├── tab-userOrganizations.ts
│   ├── tab-userNotifications.ts
│   ├── tab-userSettings.ts
│   ├── tab-userSecurity.ts
│   ├── tab-orgProfile.ts
│   ├── tab-orgAccount.ts
│   ├── tab-orgCommunity.ts
│   ├── tab-orgAuthorization.ts
│   ├── tab-orgSettings.ts
│   └── data-mapper.ts                 # Cross-tab mapper utility contracts (per-actor route context, predicates)
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── crd/
│   ├── primitives/                                          # ALL primitives already exist — no new ports needed
│   ├── components/
│   │   ├── dialogs/                                         # EXISTING — ConfirmationDialog reused for Leave / Delete confirmations
│   │   ├── contributor/
│   │   │   └── settings/                                    # NEW — actor-agnostic shell + edit primitives + shared views
│   │   │       ├── SettingsShell.tsx                        # Sticky header (avatar + name) + tab strip + outlet
│   │   │       ├── SettingsTabStrip.tsx                     # Radix-Tabs over tabs[]; horizontal-scroll on < md; auto-scrolls active into view
│   │   │       ├── SettingsCard.tsx                         # Title + bottom-bordered heading + body primitive
│   │   │       ├── EditableField.tsx                        # Hover-pencil reveal + edit-mode Save/Cancel + per-field error/Saved indicator
│   │   │       ├── EditableTextField.tsx                    # Text/email/single-line variant
│   │   │       ├── EditableMarkdownField.tsx                # Bio / Description variant (Enter inserts newline; icons-only commit)
│   │   │       ├── EditableSelectField.tsx                  # Country selector variant
│   │   │       ├── EditableTagsField.tsx                    # Tagsets variant (uses tags-input)
│   │   │       ├── EditableReferenceRow.tsx                 # Social Link / arbitrary reference row
│   │   │       ├── ContributorAccountView.tsx               # Shared 4-card-group view (Hosted Spaces / VCs / Packs / Hubs)
│   │   │       ├── AccountResourceCard.tsx                  # Reusable horizontal resource card (avatar + title + description + kebab)
│   │   │       └── RoleAssignmentView.tsx                   # Shared role-assignment view (Org Community + Authorization sub-tabs)
│   │   ├── user/
│   │   │   └── settings/                                    # NEW — User-specific tab views
│   │   │       └── tabs/
│   │   │           ├── MyProfileView.tsx                    # Two-column layout (form + avatar preview); composes EditableField instances
│   │   │           ├── MyProfileAvatarColumn.tsx
│   │   │           ├── MembershipView.tsx                   # Composes HomeSpaceCard + MembershipsTable + PendingApplicationsTable
│   │   │           ├── HomeSpaceCard.tsx
│   │   │           ├── MembershipsTable.tsx
│   │   │           ├── PendingApplicationsTable.tsx
│   │   │           ├── OrganizationsView.tsx                # Org-list table + search + Create Organization button
│   │   │           ├── OrganizationsTable.tsx
│   │   │           ├── NotificationsView.tsx                # Composes master toggle + push subs + N notification group cards
│   │   │           ├── NotificationGroupCard.tsx
│   │   │           ├── NotificationRow.tsx
│   │   │           ├── PushAvailabilityBanner.tsx
│   │   │           ├── PushSubscriptionsListCard.tsx
│   │   │           ├── SettingsView.tsx                     # Communication & Privacy + Design System cards
│   │   │           ├── DesignSystemSwitchCard.tsx
│   │   │           └── SecurityView.tsx                     # CRD card shell wrapping the identity-provider flow
│   │   └── organization/
│   │       └── settings/                                    # NEW — Org-specific tab views
│   │           └── tabs/
│   │               ├── OrgProfileView.tsx                   # Two-column layout (form + logo preview); composes EditableField instances
│   │               ├── OrgProfileAvatarColumn.tsx
│   │               ├── OrgVerifiedBadge.tsx                 # Read-only verification status indicator
│   │               ├── OrgCommunityView.tsx                 # Wraps RoleAssignmentView for the Associate role
│   │               ├── OrgAuthorizationView.tsx             # Sub-tab strip (Admin / Owner) → wraps RoleAssignmentView per role
│   │               └── OrgSettingsView.tsx                  # Two switches (allowUsersMatchingDomainToJoin, contributionRolesPubliclyVisible)
│   ├── i18n/
│   │   └── contributorSettings/                             # NEW — single combined namespace (manually managed, all 6 languages)
│   │       ├── contributorSettings.en.json
│   │       ├── contributorSettings.nl.json
│   │       ├── contributorSettings.es.json
│   │       ├── contributorSettings.bg.json
│   │       ├── contributorSettings.de.json
│   │       └── contributorSettings.fr.json
│   └── lib/
│       └── (existing — no new helpers required by this spec)
├── main/
│   ├── crdPages/
│   │   └── topLevelPages/
│   │       ├── userPages/                                   # SHARED with sibling spec 096-crd-user-pages
│   │       │   ├── CrdUserRoutes.tsx                        # OWNED BY 096 — extended by this spec to nest CrdUserSettingsRoutes for `settings/*`
│   │       │   ├── useUserPageRouteContext.ts              # OWNED BY 096 — reused unchanged
│   │       │   ├── useCanEditUserSettings.ts                # NEW (renamed from 096's useCanEditSettings.ts) — per-actor predicate hook
│   │       │   └── settings/                                # NEW (this spec) — User settings integration layer
│   │       │       ├── CrdUserSettingsRoutes.tsx            # 7 settings sub-routes; redirect non-owner-non-admin → /user/<slug>; Security route gated to owner only
│   │       │       ├── myProfile/
│   │       │       │   ├── CrdUserMyProfilePage.tsx
│   │       │       │   ├── useUserMyProfileFields.ts        # Per-field save handlers (one updateUser call per field)
│   │       │       │   ├── useUserReferenceCrud.ts          # create / update / delete reference handlers
│   │       │       │   ├── useUserTagsetSave.ts
│   │       │       │   ├── useUserAvatarUpload.ts
│   │       │       │   └── userMyProfileMapper.ts
│   │       │       ├── account/
│   │       │       │   ├── CrdUserAccountPage.tsx
│   │       │       │   ├── useUserAccountActions.ts         # Navigation handlers for Create / Manage / Delete kebabs
│   │       │       │   └── userAccountMapper.ts
│   │       │       ├── membership/
│   │       │       │   ├── CrdUserMembershipPage.tsx
│   │       │       │   ├── useHomeSpace.ts
│   │       │       │   ├── useLeaveMembership.ts
│   │       │       │   └── userMembershipMapper.ts
│   │       │       ├── organizations/
│   │       │       │   ├── CrdUserOrganizationsPage.tsx
│   │       │       │   ├── useLeaveOrganization.ts
│   │       │       │   ├── useCreateOrganization.ts
│   │       │       │   └── userOrganizationsMapper.ts
│   │       │       ├── notifications/
│   │       │       │   ├── CrdUserNotificationsPage.tsx
│   │       │       │   ├── useNotificationToggle.ts         # Optimistic-overrides pattern
│   │       │       │   ├── usePushSubscriptionList.ts
│   │       │       │   └── userNotificationsMapper.ts
│   │       │       ├── settings/
│   │       │       │   ├── CrdUserSettingsPage.tsx
│   │       │       │   ├── useDesignSystemToggle.ts
│   │       │       │   ├── useAllowMessagesToggle.ts
│   │       │       │   └── userSettingsMapper.ts
│   │       │       └── security/
│   │       │           ├── CrdUserSecurityPage.tsx          # Mounts existing identity-provider flow inside CRD card shell
│   │       │           └── useIdentityProviderSettingsFlow.ts
│   │       └── organizationPages/                           # SHARED with sibling spec 096
│   │           ├── CrdOrganizationRoutes.tsx                # OWNED BY 096 — MODIFIED by this spec to flip the `settings/*` dispatch
│   │           ├── useCanEditOrganizationSettings.ts        # NEW — per-actor predicate hook
│   │           └── settings/                                # NEW (this spec) — Org settings integration layer
│   │               ├── CrdOrgSettingsRoutes.tsx             # 5 settings sub-routes; redirect non-Update-privilege → /organization/<slug>
│   │               ├── profile/
│   │               │   ├── CrdOrgProfilePage.tsx
│   │               │   ├── useOrgProfileFields.ts           # Per-field save handlers (one updateOrganization call per field)
│   │               │   ├── useOrgReferenceCrud.ts
│   │               │   ├── useOrgTagsetSave.ts
│   │               │   ├── useOrgAvatarUpload.ts
│   │               │   └── orgProfileMapper.ts
│   │               ├── account/
│   │               │   ├── CrdOrgAccountPage.tsx
│   │               │   ├── useOrgAccountActions.ts          # Same shape as useUserAccountActions
│   │               │   └── orgAccountMapper.ts
│   │               ├── community/
│   │               │   ├── CrdOrgCommunityPage.tsx
│   │               │   ├── useOrgAssociates.ts              # Wraps useRoleSetManager + useRoleSetAvailableUsers for Associate role
│   │               │   └── orgCommunityMapper.ts
│   │               ├── authorization/
│   │               │   ├── CrdOrgAuthorizationPage.tsx
│   │               │   ├── useOrgRoleAssignment.ts          # Parameterized by role (Admin / Owner)
│   │               │   └── orgAuthorizationMapper.ts
│   │               └── settings/
│   │                   ├── CrdOrgSettingsPage.tsx
│   │                   ├── useOrgDomainMembershipToggle.ts  # Wraps useUpdateOrganizationSettingsMutation
│   │                   ├── useOrgContributionRolesToggle.ts
│   │                   └── orgSettingsMapper.ts
│   └── routing/
│       └── TopLevelRoutes.tsx                               # MODIFIED (jointly with 096) — adds the conditional CrdUserRoutes vs. UserRoute branch under `useCrdEnabled()` gate
├── core/
│   └── i18n/
│       └── config.ts                                        # MODIFIED — register `crd-contributorSettings` namespace
├── @types/
│   └── i18next.d.ts                                         # MODIFIED — add `crd-contributorSettings` to namespace union
└── domain/
    ├── community/userAdmin/                                 # UNCHANGED — existing MUI files stay for toggle-off
    └── community/organizationAdmin/                         # UNCHANGED — existing MUI files stay for toggle-off
```

**Structure Decision**: Three layers per actor.

1. **Presentational** (`src/crd/components/`): three subdirectories — `contributor/settings/` for actor-agnostic shared components, `user/settings/` for User-specific tabs, `organization/settings/` for Org-specific tabs. Zero MUI imports, zero GraphQL imports. The shared `SettingsShell`, `EditableField` family, `ContributorAccountView`, and `RoleAssignmentView` live in `contributor/settings/`.
2. **Integration** (`src/main/crdPages/topLevelPages/`): two parallel subtrees — `userPages/settings/` (for the 7 user tabs) and `organizationPages/settings/` (for the 5 org tabs). Each tab has a folder with one mapper, one top-level page component, and per-tab integration hooks. Both subtrees share helpers from `userPages/` (already added by 096) and `organizationPages/` (already added by 096) — this spec only **adds** new helpers and the settings subdirectories; it does not duplicate the route-context logic.
3. **MUI** (`src/domain/community/userAdmin/`, `src/domain/community/organizationAdmin/`): unchanged. Continues to serve users when `useCrdEnabled()` returns false. No deletion until the toggle is removed globally.

**TopLevelRoutes wiring** (mirrors the 045 / 091 / 096 patterns): the conditional branch in `TopLevelRoutes.tsx` for `/user/*` chooses between `<CrdUserRoutes />` (lazy-loaded, owned by 096; nests `CrdUserSettingsRoutes` for the settings subtree) and the existing `<UserRoute />` (also lazy-loaded). The Org dispatch is **not** in `TopLevelRoutes.tsx` — it lives inside `CrdOrganizationRoutes.tsx` (owned by 096), which currently delegates `settings/*` unconditionally to `<MuiOrganizationAdminRoutes />` and is flipped by this spec to dispatch on `useCrdEnabled()`. Both wirings are wrapped in the existing `NoIdentityRedirect` (User) / existing org admin auth chain (Org) — identical to today's wiring (research §1).

**`/user/me/settings/*` resolution**: handled by the shared `CrdUserRoutes.tsx` (owned by 096). Resolves the current user's nameID from `useCurrentUserContext()` and replaces `me` with the slug, then delegates the settings subtree to `CrdUserSettingsRoutes`.

**Org Settings access**: `CrdOrgSettingsRoutes.tsx` resolves `canEditOrganizationSettings` via `useCanEditOrganizationSettings()` and redirects falsy → `/organization/<slug>` (public profile, owned by 096).

**User Security tab redirect**: `CrdUserSettingsRoutes.tsx` resolves `canEditUserSettings` via `useCanEditUserSettings()` and redirects falsy → `/user/<slug>` (public profile, owned by 096). It additionally checks `currentUser.id === profileUser.id` for the `security` route specifically and redirects falsy → `/user/<slug>/settings/profile` (FR-084).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Arch #2 (parallel CRD design system) | CRD is the announced successor design system; all new pages adopt it per 039 / 041 / 042 / 043 / 045 / 091 / 096 precedent | Continuing MUI-only would block the CRD migration mandate; this intentional parallel-systems phase is tracked, bounded by the localStorage toggle, and removed once every page is migrated and validated. |
| Both Account tabs navigate to existing MUI admin routes for Create / Manage / Delete instead of porting full creation dialogs | Spec Out of Scope says "no new affordances" and the existing dialogs (`CreateVirtualContributorDialog`, `CreateInnovationPackDialog`, etc.) are large MUI components that cannot be embedded in CRD per FR-006; full ports would balloon the spec scope and introduce visual divergence not justified by the user-facing goal | A complete port of every Account-tab dialog would significantly inflate scope and risk visual drift between MUI and CRD versions of the same flows. Navigation to the existing MUI routes preserves behaviour exactly while keeping the CRD scope tractable; per-dialog ports can be tackled in follow-up specs as needed. |
| Org Profile uses per-field save instead of MUI's Formik-with-single-Save | UX consistency with User My Profile across the contributor vertical; smaller blast radius per save; no tab-wide dirty buffer means no discard-confirm dialogs anywhere | Keeping MUI's Formik shape would introduce two different save UX patterns in the same settings shell family, increasing cognitive load and adding tab-switch dirty-buffer handling that the rest of CRD avoids. |
