# Implementation Plan: CRD Contributor Settings (User + Organization)

**Branch**: `097-crd-user-settings` | **Date**: 2026-05-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/097-crd-user-settings/spec.md`

## Summary

Migrate the **User Settings shell** (`/user/:userSlug/settings/{profile,account,membership,organizations,notifications,settings,security}` — 7 tabs) and the **Organization Settings shell** (`/organization/:orgSlug/settings/{profile,account,community,authorization,settings}` — 5 tabs) from the current MUI implementations (`src/domain/community/userAdmin/*`, `src/domain/community/organizationAdmin/*`) to the CRD design system (shadcn/ui + Tailwind), following the parallel-design-system migration pattern proven by 039 / 041 / 042 / 043 / 045 / 091 / 096. Apollo queries and mutations are completely untouched — per-tab data mappers under `src/main/crdPages/topLevelPages/{userPages,organizationPages}/settings/` bridge generated GraphQL types to plain CRD prop types. No GraphQL schema change. Both shells gate behind the existing `alkemio-crd-enabled` localStorage toggle dispatched via `useCrdEnabled()` — User shell from `TopLevelRoutes.tsx`, Org shell from the existing `CrdOrganizationRoutes.tsx` (extended). Both shells ship together with sibling spec `096-crd-user-pages` (the public-profile views) as one contributor-vertical CRD release: when the toggle is on, every contributor URL renders in CRD; when off, every URL renders in the existing MUI files (which stay in place).

**Save model — the central architectural choice (clarification Q4):** both Profile tabs (User Profile and Org Profile) adopt the **per-section explicit-save model** as already implemented in spec 045 About (`src/main/crdPages/topLevelPages/spaceSettings/about/` — `useAboutTabData.ts` + `SpaceSettingsAboutView.tsx` + `@/crd/components/common/InlineEditText`). Each editable section uses one `FieldFooter` containing the section's dirty indicator, Save button, and per-render status (`idle | saving | saved | error`). On success a "Saved!" indicator flashes for **1800 ms** (`SAVED_FLASH_MS` from 045) before returning to idle. On failure the section stays dirty with the user's typed values preserved + an inline error that persists until the admin edits a field in the section again — no auto-retry, no auto-revert. There are NO per-field pencil / check / × icons; the section's Save is the only commit affordance. Avatar / logo uploads commit immediately on upload completion. The earlier 5-state per-field state machine drafted in `research.md` Decision #2 is superseded by this 045-aligned model. All other settings tabs (Account, Membership, Organizations, Notifications, User Settings, Security on the User side; Account, Community, Authorization, Settings on the Org side) commit per-control on click — switches, dropdowns, table-row actions — with no Save bar anywhere in the contributor settings vertical.

**Per-actor highlights:**

- **User Settings shell (7 tabs)** — sticky header (avatar + display name) + horizontal tab strip in the order **Profile / Account / Membership / Organizations / Notifications / Settings / Security** (each entry icon + uppercase label; horizontal scroll below `md`). The Security tab is hidden in the strip for non-owner viewers, and a direct hit on `/user/<other>/settings/security` by a platform admin redirects to `/user/<other>/settings/profile` (FR-012, FR-083, FR-084).
  - Authorization predicate: `canEditUserSettings = currentUser.id === profileUser.id || hasPlatformPrivilege(PlatformAdmin)` evaluated at the shell's route boundary (FR-010). When false, redirect to the public profile owned by 096 (`/user/<slug>`). No read-only fallback.
  - Profile tab: per-section save model (045 About pattern). Sections: Display Name, First Name, Last Name, Phone, Tagline, Bio as their own single-input sections; **Skills** (`tagsets[name='Skills']`) and **Keywords** (`tagsets[name='Keywords']`) as two **independent** per-section tagset editors (parity with the existing MUI `UserForm` / `TagsetSegment`, which renders one field per profile tagset — there is NO unified "Tags" input); Location (city + country) as one compound section; Social Links / References as one list-managed section. Avatar uploads commit on file-select. References add / edit / delete operate on the section buffer until References-section Save fires (one mutation batch — patch existing + create new + delete pending); reference deletion gates a `ConfirmationDialog` per Rule #9 (FR-025).
  - Account tab: shared `ContributorAccountView` (consumed by both User Account and Org Account). Empty-state pattern ports `prototype/src/app/pages/UserAccountPage.tsx` per sub-section verbatim — "Create New Space" dashed inline card on Hosted Spaces, "Create New Contributor" dashed inline card on Virtual Contributors, up-to-3 "Empty Slot" placeholders on Template Packs, full empty-state with CTA + "Capacity: 0/1 Used" indicator on Custom Homepages (FR-033). The four "Create" affordances open CRD (shadcn) creation dialogs that are parity ports of the MUI dialogs (FR-034 / research §3): `CrdCreateSpaceDialog` (← MUI `CreateSpace` / `useSpaceCreation`), `CrdCreateVirtualContributorWizard` (← full parity port of the multi-step MUI `useVirtualContributorWizard`), `CrdCreateInnovationPackDialog` (← MUI `CreateInnovationPackDialog`), `CrdCreateInnovationHubDialog` (← MUI `CreateInnovationHubDialog`) — presentational dialogs under `src/crd/components/contributor/settings/{create,createVc}/` paired with per-flow integration hooks (mirroring `CreateSubspaceDialog` ↔ `useCreateSubspace`). `Manage` navigates to the resource's existing settings URL; `Delete` uses a CRD `ConfirmationDialog` + the existing delete mutation. No new GraphQL types/mutations.
  - Membership tab: Home Space dropdown + Auto-redirect checkbox (commits via `updateUserSettings` immediately), **My Memberships card grid** matching `prototype/src/app/pages/UserMembershipPage.tsx` — banner image (cardBanner) with deterministic-gradient fallback, type badge, role badge, tagline body, "Led by:" footer with overlapping avatar stack, kebab menu with two items (View Space/Subspace + Leave Space/Subspace — no Options label, no separator). Above the grid: search input + segmented `All / Spaces / Subspaces` filter (status axis intentionally not surfaced — see FR-043 rationale). Per-row banner / tagline / leadUsers / roleSetID enrichment fans out `useSpaceContributionDetailsQuery({spaceId})` calls via a `useMembershipEnrichment` hook (mirrors the MUI `ContributionCard` pattern; Apollo dedupes / caches). Pending Applications: compact list (display name + Pending badge), read-only. Empty-states per FR-018: muted caption when the user has no memberships at all; centered dashed-border block with "Clear Filters" CTA when search/filter narrows to zero rows.
  - Organizations tab: associated organizations table with client-side search and (privilege-gated) Create Organization button. Each row's kebab → Leave with confirmation dialog. Empty-state: muted caption.
  - Notifications tab: parity port of every group / property / channel the current MUI exposes — Push master + Push Subscriptions list, Space, Space Admin (gated), User, Platform, Platform Admin (gated), Organization (gated), Virtual Contributor cards. Toggles commit via `updateUserSettings` with the optimistic-overrides pattern (immediate UI flip, then resync after refetch). On hard failure (network error / 5xx), the switch reverts to its prior state and an inline toast surfaces the error (FR-064 — clarification Q5, parity with FR-133).
  - Settings tab: Communication & Privacy switch (allow-other-users-message via `updateUserSettings`) and the Design System CRD/MUI toggle (writes localStorage, reloads). Design System toggle is always tied to the viewer's OWN browser localStorage (FR-073) — even a platform admin viewing another user sees their own toggle state, not the target user's preference.
  - Security tab: identity-provider settings flow rendered via the existing `KratosForm` + `KratosUI` with the same `REMOVED_FIELDS` filter the MUI page uses (passwords / profile / OIDC link / unlink hidden). When the flow contains no WebAuthn nodes, an info alert reads "WebAuthn / Passkey is not enabled on this account". CRD only restyles the surrounding card / heading; the Kratos-rendered form fields keep their default styling.

- **Organization Settings shell (5 tabs)** — same `SettingsShell` primitive the User shell uses (Decision #9), passing 5 tabs in the order **Profile / Account / Community / Authorization / Settings**. Same responsive horizontal-scroll behavior.
  - Authorization predicate: `canEditOrganizationSettings = organization.authorization.myPrivileges.includes(AuthorizationPrivilege.Update)` evaluated at the shell's route boundary (FR-011). When false, redirect to `/organization/<orgSlug>` (public profile owned by 096). No read-only fallback.
  - Profile tab: per-section save model identical to User Profile (FR-090). Sections mirror the User shape — Display Name, Tagline, Description, City+Country, **Keywords** (`tagsets[name='Keywords']`) and **Capabilities** (`tagsets[name='Capabilities']`) as two **independent** per-section tagset editors (parity with the existing MUI `OrganizationForm` / `TagsetSegment`), Contact Email, Domain, Legal Entity Name, Website, Social Links / References. Verification status renders as a read-only badge (FR-094). Avatar / logo uploads commit on file-select. References gated by `ConfirmationDialog` on delete per Rule #9 (FR-025 / FR-092).
  - Account tab: shared `ContributorAccountView` (FR-100) — same sub-sections, same prototype-faithful empty states (FR-103). Per-actor mapper feeds the org's `account.id` into the shared view; the same four CRD creation dialogs (FR-034) are mounted by `CrdOrgAccountTab` with `organization.account.id` as the creation target. `Manage` navigates to the resource's existing settings URL; `Delete` uses a CRD `ConfirmationDialog` + the existing delete mutation.
  - Community tab: shared `RoleAssignmentView` (Decision #5) for the `Associate` role. Two-column layout — current Associates (with a remove × per row) and available Users (with an add + per row) — backed by the existing `useRoleSetManager` + `useRoleSetAvailableUsers`. Add fires immediately on click; **remove (×) opens a `ConfirmationDialog` (destructive variant) per Rule #9 (FR-112)** with a role-aware confirm label. Pagination on available users preserved (load-more, parity with current MUI).
  - Authorization tab: same `RoleAssignmentView` parameterized for `Admin` and `Owner` roles, exposed as two sub-tabs in local React state (no URL sync, parity with current MUI). Both sub-tabs gate remove (×) via `ConfirmationDialog` per Rule #9 (FR-121) with role-aware copy ("Remove {{name}} as Admin" / "as Owner").
  - Settings tab: two switches — `allowUsersMatchingDomainToJoin` (membership) and `contributionRolesPubliclyVisible` (privacy). Each commits via `updateOrganizationSettings` immediately. On hard failure the switch reverts and a toast surfaces the error (FR-133). NO Design System toggle on this tab (FR-132 — viewer-scoped browser preference, User-only).

**Shared CRD primitives introduced by this spec** (all under `src/crd/components/contributor/settings/` unless noted):

- `SettingsShell.tsx` — actor-agnostic shell (sticky header + tab strip + tab body slot). One shell, two consumers (Decision #9).
- `SettingsTabStrip.tsx` — actor-agnostic horizontal tab strip with auto-scroll-into-view + keyboard navigation.
- `SettingsCard.tsx` — wrapper card used across all per-tab content.
- `ContributorAccountView.tsx` — shared 4-card-group view (Decision #3) consumed by User Account + Org Account; renders the prototype-faithful empty states (FR-033 / FR-103).
- `RoleAssignmentView.tsx` — shared two-column +/× role manager (Decision #5) consumed by Org Community + Org Authorization Admin sub-tab + Org Authorization Owner sub-tab.
- `OrgVerifiedBadge.tsx` — read-only verification status indicator (Decision #12).
- `create/CrdCreateSpaceDialog.tsx`, `create/CrdCreateInnovationPackDialog.tsx`, `create/CrdCreateInnovationHubDialog.tsx` — single-step CRD creation dialogs (FR-034 / Decision #3), parity ports of MUI `CreateSpace` / `CreateInnovationPackDialog` / `CreateInnovationHubDialog`. Presentational only — plain-TS props + callbacks; the Apollo wiring lives in per-flow integration hooks (`useCrdCreateSpace` / `useCrdCreateInnovationPack` / `useCrdCreateInnovationHub`) under `src/main/crdPages/topLevelPages/.../account/`. Mirrors the existing `CreateSubspaceDialog` ↔ `useCreateSubspace` split.
- `createVc/` — the CRD Virtual Contributor creation wizard: `CrdCreateVirtualContributorWizard.tsx` (the multi-step shell) + one component per step (`InitialProfileStep`, `AddKnowledgeStep`, `ChooseCommunityStep`, `UseExistingSpaceStep`, `ExternalAiStep`, `TryVcInfoStep`). **Full parity port of MUI `useVirtualContributorWizard`** (FR-034). Step/visual state + every supporting mutation (`useCreateVirtualContributorOnAccountMutation`, `useUploadVisualMutation`, `useRefreshBodyOfKnowledgeMutation`, `useCreateLinkOnCalloutMutation`, `useCreateSpaceMutation`, `useAssignRoleToVirtualContributorMutation`) live in the integration hook `useCrdCreateVirtualContributorWizard` under `src/main/crdPages/topLevelPages/.../account/`.

**Reused from 045 verbatim** (no new primitive needed):

- `@/crd/components/common/InlineEditText` — single-line inline-edit text input (Display Name, First Name, Last Name, Phone, Tagline, Domain, Contact Email, Website, etc.).
- `@/crd/components/common/StackedPersonAvatars` — reusable overlapping-avatars row with optional tooltips and a `+N` overflow tile. **Generalized from the existing `PollVoterAvatars` (the deprecated file is deleted)** so both `CalloutPoll` (poll-voter row) and this spec's User Membership "Led by:" footer share it. Pure presentational — receives pre-localized `groupAriaLabel` / `overflowTooltipLabel` strings as props so consumers from any i18n namespace can use it without the component itself depending on a feature namespace.
- `@/crd/forms/markdown/MarkdownEditor` — Bio / Description rich-text editor.
- `@/crd/forms/tags-input` — Tagset editor primitive. Reused as the input for each profile tagset section (User: Skills + Keywords; Org: Keywords + Capabilities) — one `<TagsField>` instance per named tagset, with the tagset's name driving the section heading.
- `@/crd/components/common/CountryCombobox` — Country single-select (045 uses this).
- The `FieldFooter` pattern from 045 About — to be extracted into `@/crd/components/common/FieldFooter.tsx` if not already shared (currently defined locally in `SpaceSettingsAboutView.tsx`).
- The 045 dirty / status state shape (`SAVED_FLASH_MS = 1800`, `idle | saving | saved | error`) — encoded in the per-tab integration hook (`useUserProfileTabData` / `useOrgProfileTabData`), parallel to 045's `useAboutTabData`.

**Reused from 096 verbatim:**

- `CrdLayoutWrapper` (CRD shell + header + footer + dialogs).
- `useCrdEnabled` localStorage toggle.
- `CrdUserRoutes` (extended with `settings/*` subtree → `CrdUserSettingsRoutes`).
- `CrdOrganizationRoutes` (extended with `settings/*` dispatch → `useCrdEnabled() ? <CrdOrgSettingsRoutes /> : <MuiOrganizationAdminRoutes />`).
- `useUserPageRouteContext` + `useCanEditSettings` (User-vertical auth helpers; this spec consumes them and adds the renamed `useCanEditUserSettings` per Decision #7).

**Out of scope (for this spec):**

- VC settings shell (`/vc/:vcSlug/settings/*`) — explicitly deferred to a future spec. The Settings (gear) icon on the VC public-profile hero (096 FR-031) continues to link to the existing MUI VC admin shell.
- Public profile pages (`/user/:userSlug`, `/organization/:orgSlug`, `/vc/:vcSlug`) without `/settings` — owned by sibling spec `096-crd-user-pages`.
- New backend capabilities — no new GraphQL types, mutations, or permission semantics.
- New affordances on Account tabs — hosted resources keep the same create / edit / delete flows the current MUI exposes.
- Restyle of identity-provider rendered form fields inside User Security — only the surrounding shell is restyled.
- Restyle of the existing MUI heavy-flow dialogs (Create VC / Pack / Hub) — Account-tab kebabs navigate to those.
- Mutation of `Organization.verification.status` — read-only on the Org Profile tab; verification is managed by platform admins via a separate flow.
- Tab-wide dirty buffer / discard-confirm dialogs — every settings tab commits per-control (or per-section on Profile tabs); switching tabs never blocks navigation.

**Authorization (per-actor route wrappers preserved exactly):**

- `/user/*` — wrapped by existing `<NoIdentityRedirect>`. CRD preserves this; anonymous viewers on `/user/<slug>/settings/*` are redirected to login. Shell-level redirect (FR-010) applies after auth.
- `/organization/*` — anonymous viewers can load the public profile (parity with current MUI); the settings subtree's existing auth wrapping continues to apply.

**Coupling with sibling spec `096-crd-user-pages`:**

- Both specs share `useCrdEnabled`, `CrdLayoutWrapper`, `useUserPageRouteContext`, and the User-vertical `useCanEditSettings` helper. They flip together — toggling CRD on flips both the public profile views and the settings tabs simultaneously, on both User and Org verticals.
- 096 added `CrdOrganizationRoutes.tsx` with the public-profile route; this spec extends that file's `settings/*` dispatch to choose between `CrdOrgSettingsRoutes` and `MuiOrganizationAdminRoutes` (research §1). 096 itself is not modified.
- The 096 Settings (gear) icon click handlers (User hero / Org hero) link into URLs owned by this spec; those handlers were already wired in 096 — no change required here.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 24.14.0 (Volta-pinned).
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), `class-variance-authority`, `lucide-react`, Apollo Client (existing — unchanged), `react-i18next` (existing), `react-router-dom` (existing — only the integration layer touches it). All required CRD primitives (`tabs`, `card`, `dialog`, `alert-dialog`, `dropdown-menu`, `switch`, `popover`, `avatar`, `badge`, `button`, `input`, `label`, `select`, `textarea`, `skeleton`, `tooltip`, `breadcrumb`, `scroll-area`, `table`, `checkbox`) already exist under `src/crd/primitives/`. Reuses existing CRD forms (`@/crd/forms/markdown/MarkdownEditor`, `@/crd/forms/tags-input`). Reuses existing CRD common components (`@/crd/components/common/InlineEditText`, `@/crd/components/common/CountryCombobox`, `@/crd/components/dialogs/ConfirmationDialog`). **`FieldFooter` MAY need extraction from 045's `SpaceSettingsAboutView.tsx` to `@/crd/components/common/FieldFooter.tsx` for cross-feature reuse.** No new runtime dependencies.
**Storage**: localStorage (`alkemio-crd-enabled`) for the CRD toggle (existing). GraphQL data layer unchanged.
**Testing**: Vitest with jsdom (`pnpm vitest run`) — unit tests for: each per-tab integration hook (Profile per-section save state machine; Notifications optimistic-override + hard-failure revert; Membership filter / search; Org Community / Authorization role assignments), the two authorization-predicate hooks (`useCanEditUserSettings`, `useCanEditOrganizationSettings`), and i18n key parity across the six languages. Visual / interaction validation via `pnpm start` and the per-tab smoke checklist in `quickstart.md`.
**Target Platform**: Web SPA (Vite dev server on `localhost:3001`).
**Project Type**: Web application (frontend only — no backend changes).
**Performance Goals**:
- Per-section Profile save round-trip < 1 s perceived (mutation + refetch + Saved! flash). Save button exposes `aria-busy` while the mutation is pending.
- Notifications toggle UI flip < 100 ms perceived (optimistic-overrides pattern; FR-064).
- Tab switch < 100 ms perceived (no per-tab data prefetch; each tab's lazy chunk loads on first visit).
- User and Org settings shells SHOULD lazy-load as separate chunks (one chunk per shell). The combined lazy-loaded chunk delta SHOULD NOT exceed +50 KB gzipped over the prior build (SC-007).
- CRD ↔ MUI design-system reload (FR-071 / SC-003) < 3 s consistently.
**Constraints**: Zero `@mui/*` / `@emotion/*` imports under `src/crd/components/contributor/settings/`, `src/crd/components/user/settings/`, `src/crd/components/organization/settings/`, and the per-tab integration mappers' consumers (the mappers themselves DO import generated GraphQL types — that is the only allowed crossing per FR-006). All six languages (en / nl / es / bg / de / fr) edited in the same PR per the manual CRD i18n workflow (no Crowdin). All destructive actions go through `ConfirmationDialog` per `src/crd/CLAUDE.md` Rule #9 (Org Community / Authorization removes per FR-112 / FR-121; reference deletion on Profile tabs per FR-025; Leave actions on User Membership / Organizations per FR-044 / FR-053).
**Scale/Scope**: Two settings shells (User 7-tab + Org 5-tab) + 12 tab-body integration entry points + ~10 shared CRD presentational components + four CRD Account-tab creation dialogs/wizard (`CrdCreateSpaceDialog`, the multi-step `CrdCreateVirtualContributorWizard` with ~6 step components, `CrdCreateInnovationPackDialog`, `CrdCreateInnovationHubDialog` — FR-034) + four shared account-create integration hooks + one shared CRD i18n namespace (`crd-contributorSettings`). ~35–45 new CRD presentational components total (the VC wizard is the largest single piece). Reuses ~25 existing Apollo queries/mutations (including the existing create/delete mutations — no new mutation introduced). Two new authorization-predicate hooks (`useCanEditUserSettings`, `useCanEditOrganizationSettings`). One shared cross-actor presentational view (`ContributorAccountView`), one shared role-manager view (`RoleAssignmentView`), one shared set of four account-creation dialogs. Tab dispatchers extend two existing files (`TopLevelRoutes.tsx` for User; `CrdOrganizationRoutes.tsx` for Org).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | All CRD components purely presentational. Domain logic stays in existing `src/domain/community/{user,organization}Admin/*` hooks (`useUserSettingsQuery`, `useUpdateUserSettingsMutation`, `useOrganizationProvider`, `useUpdateOrganizationMutation`, `useRoleSetManager`, `pushNotificationContext`, etc.). Per-tab data mappers live under `src/main/crdPages/topLevelPages/<vertical>/settings/<tab>/`. |
| II. React 19 Concurrent UX Discipline | PASS | All CRD views are pure render functions. Per-section save mutations, Notifications toggles, and role-assignment add/remove wrap with `useTransition` in the integration layer (per Constitution Principle II). Suspense boundaries surround the lazy-loaded settings shells. The 045 About-pattern hook (`useUserProfileTabData` / `useOrgProfileTabData`) tracks per-section status with plain `useState` (no legacy lifecycles). |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes (Out of Scope). All Apollo operations go through generated hooks from `src/core/apollo/generated/apollo-hooks.ts`. CRD components never import generated GraphQL types — only the per-tab mappers do (FR-006). |
| IV. State & Side-Effect Isolation | PASS | CRD components hold only visual state (active tab, popover open, confirmation-dialog open). All side effects (mutations, navigation, localStorage writes, push-permission requests) live in the integration layer or in adapters (`pushNotificationContext`). Mid-edit Profile-tab values are silently dropped on tab-switch / nav-away (FR-016) — no global dirty buffer to leak. |
| V. Experience Quality & Safeguards | PASS | FR-150 / FR-151 / FR-152 / FR-153 codify WCAG 2.1 AA: semantic HTML, visible focus, accessible names on icon-only buttons (Save, Cancel, kebabs, trash icons, +/× role-assignment buttons), keyboard-navigable settings tab strip + Authorization sub-tab strip, `aria-busy` on async-pending Save buttons, all Confirmation dialogs via the CRD `AlertDialog` primitive with `variant="destructive"` and role-aware confirm labels per Rule #9. Per-region Skeleton placeholders prevent layout shift while queries resolve. |
| Arch #1: Feature directories map to domain contexts | PASS | Presentational components under `src/crd/components/{contributor,user,organization}/settings/`. Integration under `src/main/crdPages/topLevelPages/{userPages,organizationPages}/settings/<tab>/`. Domain hooks reused from `src/domain/community/{user,organization}Admin/*` and `src/domain/access/RoleSetManager/*`. |
| Arch #2: Styling standardizes on MUI theming | **JUSTIFIED VIOLATION** | Same intentional, constitution-acknowledged violation as 039 / 041 / 042 / 043 / 045 / 091 / 096. CRD is the announced successor design system. See Complexity Tracking. |
| Arch #3: i18n via react-i18next | PASS | New shared namespace `crd-contributorSettings` (one namespace covering both User and Org tabs, per research §8). English source only edited directly; other five languages (nl / es / bg / de / fr) maintained manually in the same PR per `src/crd/CLAUDE.md`. FR-142 allows reusing select existing `translation`-namespace keys. No hard-coded strings. |
| Arch #4: Build artifacts deterministic | PASS | No Vite config changes. No new runtime dependencies. Existing CRD chunk-splitting strategy applies. |
| Arch #5: No barrel exports | PASS | All imports use explicit file paths. |
| Arch #6: SOLID + DRY | PASS | **SRP**: per-tab view / mapper / integration hook each in their own file. **OCP**: shared `SettingsShell` parameterized via `tabs[]`; shared `ContributorAccountView` parameterized via `actor`; shared `RoleAssignmentView` parameterized via role. **LSP**: every per-tab view accepts the same `loading: boolean` shape; every Profile-tab field uses the same `EditableSectionState`. **ISP**: each tab's prop shape is minimal (`UserNotificationsViewProps` does NOT include the org-side toggle states). **DIP**: views consume plain props injected by the per-tab mapper — never call Apollo directly. **DRY**: shared `SettingsShell` / `SettingsTabStrip` / `ContributorAccountView` / `RoleAssignmentView` / `FieldFooter` (extracted from 045) eliminate cross-actor duplication. |
| WF #5: Root Cause Analysis Before Fixes | N/A | This is a presentation-layer migration, not a bug fix. No fetch policies / retries / defensive guards introduced — Apollo queries reused exactly as today. |

**Post-Phase 1 re-check**: All gates pass. The Arch #2 violation is identical to prior CRD migrations.

## Project Structure

### Documentation (this feature)

```text
specs/097-crd-user-settings/
├── plan.md              # This file
├── spec.md              # Feature specification (12 P1 user stories — 7 User + 5 Org)
├── research.md          # Phase 0: research findings (12 decisions; Decision #2 needs update — see "Post-clarification updates" below)
├── data-model.md        # Phase 1: entities + GraphQL → CRD prop mappings (per actor / per tab)
├── quickstart.md        # Phase 1: setup, build order, per-tab smoke checklist
├── contracts/           # Phase 1: TypeScript interfaces for CRD components
│   ├── shell.ts                  # SettingsShell + SettingsTabStrip contracts
│   ├── editable-field.ts         # EditableSection / FieldFooter / per-section save state
│   ├── data-mapper.ts            # Cross-tab mapper utility contracts
│   ├── tab-userProfile.ts        # RENAMED from tab-userMyProfile.ts (Q3 clarification)
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
│   └── tab-orgSettings.ts
└── checklists/
    └── requirements.md
```

**Post-clarification updates** (research.md / data-model.md / contracts/ rolling forward into the Phase-2 task list):

- **Q3 (tab rename)**: rename `contracts/tab-userMyProfile.ts` → `contracts/tab-userProfile.ts`; rename internal type identifiers (e.g., `UserMyProfileTabProps` → `UserProfileTabProps`); update every prose reference in `data-model.md` and `quickstart.md` (`User My Profile` → `User Profile`); update i18n key skeleton from `user.myProfile.*` → `user.profile.*`. The route segment `/settings/profile` does not change.
- **Q4 (per-section save model)**: research.md Decision #2's 5-state per-field machine (`idle | editing | pending | idle-saved | editing-error`) is superseded by the 045 per-section model. The new state shape lives in the per-tab integration hook as `Partial<Record<SectionKey, { kind: 'idle' | 'saving' | 'saved' | 'error'; error?: string }>>`. Field-level pencil/check/× icons are removed; `FieldFooter` (Save button + dirty indicator + status) lives at the section level. `SAVED_FLASH_MS = 1800` matches 045. data-model.md's "Save state per field (Profile tabs)" section becomes "Save state per section (Profile tabs)" with the new shape.
- **Q1 (empty-state policy)**: data-model.md gains an "Empty-state UX" sub-section per tab. The Account tab section captures the prototype-faithful per-sub-section patterns (FR-033 / FR-103); read-only list tabs document the muted-caption pattern (FR-018).
- **Q2 (Rule #9 across all role-removals + reference deletion)**: contract `tab-orgCommunity.ts` and `tab-orgAuthorization.ts` gain a `pendingRemoveId` state field + `onConfirmRemove` / `onCancelRemove` callback pair; `tab-userProfile.ts` (renamed) and `tab-orgProfile.ts` similarly gain `pendingReferenceDeleteId` state + confirm/cancel callbacks (mirroring the 045 About `pendingReferenceDelete` pattern).
- **Q5 (Notifications hard-failure)**: `tab-userNotifications.ts` documents the failure-revert behaviour; data-model.md "Optimistic overrides" sub-section adds the rollback path.

### Source Code (repository root)

```text
src/
├── crd/
│   ├── primitives/                                       # ALL primitives already exist — no new ports needed
│   ├── components/
│   │   ├── common/
│   │   │   ├── InlineEditText.tsx                        # EXISTING — reused from 045
│   │   │   ├── CountryCombobox.tsx                       # EXISTING — reused from 045
│   │   │   └── FieldFooter.tsx                           # NEW (or extracted from 045's SpaceSettingsAboutView.tsx) — Save button + dirty indicator + per-section status
│   │   ├── contributor/
│   │   │   └── settings/                                 # NEW — actor-agnostic settings primitives
│   │   │       ├── SettingsShell.tsx                     # NEW — sticky header + tab strip + body slot
│   │   │       ├── SettingsTabStrip.tsx                  # NEW — horizontal-scroll responsive tab strip
│   │   │       ├── SettingsCard.tsx                      # NEW — wrapper card used by every per-tab content block
│   │   │       ├── ContributorAccountView.tsx            # NEW — shared 4-card-group view (User Account + Org Account); renders prototype-faithful empty states
│   │   │       ├── RoleAssignmentView.tsx                # NEW — shared two-column +/× role manager (Org Community + Org Authorization Admin / Owner)
│   │   │       ├── OrgVerifiedBadge.tsx                  # NEW — read-only verification badge
│   │   │       ├── create/                               # NEW — single-step CRD creation dialogs (FR-034 / Decision #3) — presentational only
│   │   │       │   ├── CrdCreateSpaceDialog.tsx          # ← parity port of MUI CreateSpace / useSpaceCreation (displayName, nameID, tagline, description, tags, spaceTemplateID, addTutorialCallouts, banner+cardBanner uploads, acceptedTerms)
│   │   │       │   ├── CrdCreateInnovationPackDialog.tsx # ← parity port of MUI CreateInnovationPackDialog (displayName + description)
│   │   │       │   └── CrdCreateInnovationHubDialog.tsx  # ← parity port of MUI CreateInnovationHubDialog (subdomain + displayName + tagline + description)
│   │   │       └── createVc/                             # NEW — full parity port of MUI useVirtualContributorWizard (FR-034) — presentational only
│   │   │           ├── CrdCreateVirtualContributorWizard.tsx  # multi-step shell (step state via props)
│   │   │           ├── InitialProfileStep.tsx           # name, tagline, description, avatar, engine, bodyOfKnowledgeType + source selector
│   │   │           ├── AddKnowledgeStep.tsx             # posts[] (→ Post callouts) + documents[] (→ Link callout collection)
│   │   │           ├── ChooseCommunityStep.tsx          # pick existing space OR create a new space for the VC
│   │   │           ├── UseExistingSpaceStep.tsx         # pick a space/subspace as the VC's body of knowledge
│   │   │           ├── ExternalAiStep.tsx               # engine + apiKey + conditional assistantId
│   │   │           └── TryVcInfoStep.tsx                # success info screen
│   │   ├── user/
│   │   │   └── settings/                                 # NEW — User-specific tab views (7 files mirroring tabs)
│   │   │       ├── UserProfileTabView.tsx                # Per-section save (045 pattern)
│   │   │       ├── UserAccountTabView.tsx                # Composes ContributorAccountView with per-actor labels + callbacks
│   │   │       ├── UserMembershipTabView.tsx             # Home Space card + Memberships card grid + Pending Applications list
│   │   │       ├── UserOrganizationsTabView.tsx          # Associated organizations table
│   │   │       ├── UserNotificationsTabView.tsx          # Push master + 7 cards (gated by privilege)
│   │   │       ├── UserSettingsTabView.tsx               # Communication switch + Design System toggle
│   │   │       └── UserSecurityTabView.tsx               # Identity-provider settings flow
│   │   └── organization/
│   │       └── settings/                                 # NEW — Org-specific tab views (5 files)
│   │           ├── OrgProfileTabView.tsx                 # Per-section save (045 pattern); read-only Verified badge
│   │           ├── OrgAccountTabView.tsx                 # Composes ContributorAccountView
│   │           ├── OrgCommunityTabView.tsx               # Composes RoleAssignmentView for Associate role
│   │           ├── OrgAuthorizationTabView.tsx           # Two sub-tabs (Admin / Owner); each composes RoleAssignmentView
│   │           └── OrgSettingsTabView.tsx                # Two switches
│   ├── i18n/
│   │   └── contributorSettings/                          # NEW — manually managed (en / nl / es / bg / de / fr)
│   │       ├── contributorSettings.en.json
│   │       ├── contributorSettings.nl.json
│   │       ├── contributorSettings.es.json
│   │       ├── contributorSettings.bg.json
│   │       ├── contributorSettings.de.json
│   │       └── contributorSettings.fr.json
│   └── lib/                                              # EXISTING — no changes
├── main/
│   ├── crdPages/
│   │   └── topLevelPages/
│   │       ├── contributorAccountMapper.ts               # EXISTING — shared User/Org account → ContributorAccountViewProps mapper
│   │       ├── account/                                  # NEW — shared (actor-agnostic) account-create integration hooks; consumed by both CrdUserAccountTab and CrdOrgAccountTab
│   │       │   ├── useCrdCreateSpace.ts                  # Apollo wiring for CrdCreateSpaceDialog (useCreateSpaceMutation / useSpaceCreation + visual uploads + license-plan resolve + AccountInformation refetch)
│   │       │   ├── useCrdCreateVirtualContributorWizard.ts  # Full Apollo wiring for the VC wizard (useCreateVirtualContributorOnAccountMutation + useUploadVisualMutation + useRefreshBodyOfKnowledgeMutation + useCreateLinkOnCalloutMutation + useCreateSpaceMutation + useAssignRoleToVirtualContributorMutation; same step order + refetches as MUI)
│   │       │   ├── useCrdCreateInnovationPack.ts         # Apollo wiring for CrdCreateInnovationPackDialog (useCreateInnovationPackMutation)
│   │       │   └── useCrdCreateInnovationHub.ts          # Apollo wiring for CrdCreateInnovationHubDialog (useCreateInnovationHubMutation)
│   │       ├── userPages/                                # EXISTING (owned by 096) — extended with settings/* subtree
│   │       │   ├── CrdUserRoutes.tsx                     # MODIFIED — settings/* delegates to CrdUserSettingsRoutes
│   │       │   ├── useUserPageRouteContext.ts            # EXISTING (096) — reused
│   │       │   ├── useCanEditSettings.ts                 # EXISTING (096) — reused; renamed/aliased as useCanEditUserSettings here per Decision #7
│   │       │   └── settings/                             # NEW — User Settings integration subtree
│   │       │       ├── CrdUserSettingsRoutes.tsx         # 7-tab Routes for the User shell; redirects on canEditUserSettings false
│   │       │       ├── CrdUserSettingsPage.tsx           # Hosts SettingsShell with the User tab list; routes the active tab body
│   │       │       ├── useUserSettingsAccessGuard.ts     # Wraps useCanEditUserSettings; redirects to the user's profileUrl (from useUserPageRouteContext) when false
│   │       │       ├── useUserSettingsTab.ts             # Resolves active tab from URL; provides onTabSelect that pushes buildSettingsTabUrl(profileUrl, tabId) — see urlBuilders rule
│   │       │       ├── profile/
│   │       │       │   ├── CrdUserProfileTab.tsx
│   │       │       │   ├── useUserProfileTabData.ts      # 045-style per-section save hook (status by section + onSaveSection per section)
│   │       │       │   └── userProfileMapper.ts          # GraphQL → UserProfileTabViewProps
│   │       │       ├── account/
│   │       │       │   ├── CrdUserAccountTab.tsx          # mounts the 4 CRD creation dialogs (via the shared account-create hooks, passing the user's account.id) + the Delete ConfirmationDialog; Manage navigates to resource settings URL
│   │       │       │   └── userAccountMapper.ts
│   │       │       ├── membership/
│   │       │       │   ├── CrdUserMembershipTab.tsx
│   │       │       │   ├── useUserMembershipTabData.ts     # Home Space mutation + memberships filter/search + Leave-confirm flow
│   │       │       │   ├── useMembershipEnrichment.ts      # Per-row useSpaceContributionDetailsQuery fan-out → {bannerUrl, tagline, leadUsers, roleSetID}
│   │       │       │   └── userMembershipMapper.ts
│   │       │       ├── organizations/
│   │       │       │   ├── CrdUserOrganizationsTab.tsx
│   │       │       │   └── userOrganizationsMapper.ts
│   │       │       ├── notifications/
│   │       │       │   ├── CrdUserNotificationsTab.tsx
│   │       │       │   ├── useUserNotificationsTabData.ts  # Optimistic-override dictionary + hard-failure revert (Q5)
│   │       │       │   └── userNotificationsMapper.ts
│   │       │       ├── settings/
│   │       │       │   ├── CrdUserSettingsTab.tsx
│   │       │       │   └── userSettingsMapper.ts
│   │       │       └── security/
│   │       │           ├── CrdUserSecurityTab.tsx
│   │       │           ├── useIdentityProviderSettingsFlow.ts  # Wraps the existing Kratos flow loader (Decision #6)
│   │       │           └── userSecurityMapper.ts
│   │       └── organizationPages/                        # EXISTING (owned by 096) — extended with settings/* subtree
│   │           ├── CrdOrganizationRoutes.tsx             # MODIFIED — settings/* dispatch chooses between CrdOrgSettingsRoutes (CRD) and existing MuiOrganizationAdminRoutes
│   │           └── settings/                             # NEW — Org Settings integration subtree
│   │               ├── CrdOrgSettingsRoutes.tsx          # 5-tab Routes for the Org shell; redirects on canEditOrganizationSettings false
│   │               ├── CrdOrgSettingsPage.tsx            # Hosts SettingsShell with the Org tab list
│   │               ├── useOrgSettingsAccessGuard.ts      # Wraps useCanEditOrganizationSettings (Decision #7); redirects to the org's profileUrl (organization.profile.url) when false
│   │               ├── useOrgSettingsTab.ts              # Active tab from URL + onTabSelect routed via buildSettingsTabUrl(profileUrl, tabId) — see urlBuilders rule
│   │               ├── profile/
│   │               │   ├── CrdOrgProfileTab.tsx
│   │               │   ├── useOrgProfileTabData.ts       # 045-style per-section save hook (parallel to user version)
│   │               │   └── orgProfileMapper.ts
│   │               ├── account/
│   │               │   ├── CrdOrgAccountTab.tsx          # mounts the same 4 CRD creation dialogs (via the shared account-create hooks, passing organization.account.id) + the Delete ConfirmationDialog; Manage navigates to resource settings URL
│   │               │   └── orgAccountMapper.ts
│   │               ├── community/
│   │               │   ├── CrdOrgCommunityTab.tsx
│   │               │   ├── useOrgAssociates.ts           # Wraps useRoleSetManager + useRoleSetAvailableUsers for Associate role; pendingRemoveId state for Rule #9 dialog (Q2)
│   │               │   └── orgCommunityMapper.ts
│   │               ├── authorization/
│   │               │   ├── CrdOrgAuthorizationTab.tsx
│   │               │   ├── useOrgRoleAssignment.ts       # Parameterized by role (Admin | Owner); pendingRemoveId state per role (Q2)
│   │               │   └── orgAuthorizationMapper.ts
│   │               └── settings/
│   │                   ├── CrdOrgSettingsTab.tsx
│   │                   └── orgSettingsMapper.ts
│   └── routing/
│       └── TopLevelRoutes.tsx                            # MODIFIED — User shell dispatch (Org dispatch lives in CrdOrganizationRoutes.tsx, research §1)
├── core/
│   └── i18n/
│       └── config.ts                                     # MODIFIED — register `crd-contributorSettings` namespace
└── domain/community/                                     # UNCHANGED — existing MUI files stay for toggle-off
    ├── userAdmin/                                        # UNCHANGED
    └── organizationAdmin/                                # UNCHANGED
```

**Structure Decision**: Presentational CRD components live under `src/crd/components/{contributor,user,organization}/settings/`. Per-tab integration (route entries, per-tab pages, integration hooks, mappers) lives under two parallel sibling subtrees: `src/main/crdPages/topLevelPages/userPages/settings/` and `src/main/crdPages/topLevelPages/organizationPages/settings/`. Each tab has its own subfolder (`<tab>/`) with `Crd<Actor><Tab>Tab.tsx`, `use<Actor><Tab>TabData.ts` (where applicable), and `<actor><Tab>Mapper.ts`. The User shell's settings subtree is hosted by an extension to the existing 096 `CrdUserRoutes.tsx` (the `settings/*` route delegates to the new `CrdUserSettingsRoutes`). The Org shell's settings dispatch extends 096's existing `CrdOrganizationRoutes.tsx` (the `settings/*` route inside that file gains a `useCrdEnabled()`-gated branch). The existing MUI files under `src/domain/community/{user,organization}Admin/` stay intact and continue to serve users when `useCrdEnabled()` returns `false`. No GraphQL changes.

**TopLevelRoutes wiring**: The User shell dispatch lives in `TopLevelRoutes.tsx` (mirrors the 096 pattern for `/user/*`). The Org shell dispatch lives in 096's `CrdOrganizationRoutes.tsx`'s existing `settings/*` route — `useCrdEnabled() ? <CrdOrgSettingsRoutes /> : <MuiOrganizationAdminRoutes />`. Both dispatches preserve the route's existing wrappers (NoIdentityRedirect on User, the Org route's existing wrappers).

**Identifier + URL convention.** The settings shells use the entity's canonical **`profile.url`** field as the navigation root — never a hand-built `/user/<nameId>/...` template. On the User side this is read from `useUserPageRouteContext().profileUrl` (which already collapses `/user/me` correctly via `getProfileUrl`); on the Org side it is `organization.profile.url`. Tab navigation, access-guard redirects, and any cross-tab links go through the **`@/main/routing/urlBuilders`** module — this spec adds `buildSettingsTabUrl(profileUrl, tabId)` (composed on top of the existing `buildSettingsUrl`). New URL shapes get a new builder rather than an inline template. Rationale documented in `docs/crd/migration-guide.md` ("URL Construction"). This is the canonical CRD pattern from this spec onwards; the previously-drafted `userSlug` field on `UserPageRouteContext` is removed (`contracts/data-mapper.ts` updated to expose `profileUrl` instead).

**`/user/me/settings/*` resolution**: handled by the existing 096 `/me` route in `CrdUserRoutes.tsx`. The `settings/*` subtree under `/me` resolves to the current user's settings via the same `MeUserProvider` analog 096 wires.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Arch #2 (parallel CRD design system) | CRD is the announced successor design system; all new pages adopt it per 039 / 041 / 042 / 043 / 045 / 091 / 096 precedent | Continuing MUI-only would block the CRD migration mandate; this intentional parallel-systems phase is tracked, bounded by the localStorage toggle, and removed once every page is migrated and validated. |
