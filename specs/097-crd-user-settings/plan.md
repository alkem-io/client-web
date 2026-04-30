# Implementation Plan: CRD User Settings Page

**Branch**: `097-crd-user-settings` | **Date**: 2026-04-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/097-crd-user-settings/spec.md`

## Summary

Migrate the seven **User Settings** tabs (`My Profile`, `Account`, `Membership`, `Organizations`, `Notifications`, `Settings`, `Security`) from the current MUI implementation (`src/domain/community/userAdmin/*`) to the CRD design system (shadcn/ui + Tailwind), following the parallel-design-system migration pattern proven by 039 (spaces), 041 (dashboard), 042 (space page), 043 (search), 045 (space settings), 091 (subspace page), and the sibling 096 (public profile view). Apollo queries and mutations are completely untouched — data mappers under `src/main/crdPages/topLevelPages/userPages/settings/<tab>/` bridge generated GraphQL types to plain CRD prop types. No GraphQL schema change. Gated behind the existing `alkemio-crd-enabled` localStorage toggle, dispatched from `TopLevelRoutes.tsx` via `useCrdEnabled()`.

The seven settings tabs ship together with the public profile view (sibling spec `096-crd-user-pages`) as one user-vertical release — when CRD is enabled the entire user vertical renders in CRD; when disabled the entire vertical renders in the existing MUI files (which stay in place). One independently testable user story per tab (P1 ×7, per the spec).

**Per-tab save semantics:**

- **My Profile** — per-field explicit save with hover-reveal pencil affordance + check (Save) and × (Cancel) icons. No tab-wide buffer; switching tabs silently drops in-progress edits. On save failure the field stays in edit mode with the typed value preserved (FR-032 clarification).
- **Account** — per-action commit (no Save bar). Create / Manage / Delete trigger existing flows by navigating to the existing MUI admin routes (the CRD Account tab is a presentational read view + kebab dispatcher; see Architectural Note below).
- **Membership / Organizations / Notifications / Settings** — per-control commit on click (no Save bar). Notifications uses the optimistic-overrides pattern from current MUI.
- **Security** — Kratos `KratosForm` + `KratosUI` mounted inside a CRD card shell; the Kratos-rendered fields keep their default Kratos styling (out of scope to restyle Kratos itself this iteration).

**Authorization:**

- Settings shell — `canEditSettings = (currentUser.id === profileUser.id) || hasPlatformAdminPrivilege`. Falsy → redirect to `/user/<slug>` (the public profile view, owned by sibling spec `096-crd-user-pages`). No read-only mode anywhere in CRD settings.
- Security tab — owner only regardless of admin status (Kratos session constraint). Hidden from the strip and the route redirects to `/user/<slug>/settings/profile` for any non-owner viewer (FR-093, FR-093a).
- The `/user/*` route subtree continues to be wrapped by the existing `NoIdentityRedirect`, so anonymous viewers hitting any `/user/<slug>/settings/*` URL are redirected to login (research §1).

**Coupling with sibling spec `096-crd-user-pages`:**

- Both specs share the same `useCrdEnabled` toggle and the same `CrdLayoutWrapper`. They are gated together — toggling CRD on flips both the public profile view and the settings tabs simultaneously.
- The `useCanEditSettings` predicate, `useUserPageRouteContext` helper, and the integration-layer route file `CrdUserRoutes.tsx` are shared infrastructure; both specs reference them. To avoid duplication, the foundational tasks for these helpers are tracked in **this** spec (097); spec 096 reuses the implementation. When spec 096 lands first, those foundational pieces are already in place.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), `class-variance-authority`, `lucide-react`, Apollo Client (existing), `react-i18next` (existing), `react-router-dom` (existing — only the integration layer touches it). All required CRD primitives (`tabs`, `card`, `dialog`, `alert-dialog`, `dropdown-menu`, `switch`, `popover`, `avatar`, `badge`, `button`, `input`, `label`, `select`, `textarea`, `skeleton`, `tooltip`, `breadcrumb`, `scroll-area`, `table`, `checkbox`) already exist under `src/crd/primitives/`. Reuses existing CRD forms (`@/crd/forms/markdown/MarkdownEditor`, `@/crd/forms/tags-input`). Reuses existing CRD dialogs (`ConfirmationDialog` from `@/crd/components/dialogs/`). No new runtime dependencies.
**Storage**: localStorage (`alkemio-crd-enabled`) for CRD toggle (existing); GraphQL data layer unchanged
**Testing**: Vitest with jsdom (`pnpm vitest run`) — unit tests for mappers, route guards, the `canEditSettings` predicate, and the per-field state machine. Visual / interaction validation via `pnpm start` and manual smoke through each tab.
**Target Platform**: Web SPA (Vite dev server on `localhost:3001`)
**Project Type**: Web application (frontend only — no backend changes)
**Performance Goals**: My Profile per-field save round-trip < 3s (typical); tab switch < 200ms; pencil-hover affordance reveal < 50ms; bundle delta on the user-settings chunk ≤ +25 KB gzipped over the prior build (SC-006).
**Constraints**: Zero `@mui/*` / `@emotion/*` imports under `src/crd/` and `src/main/crdPages/topLevelPages/userPages/settings/`. Generated GraphQL types only crossable inside `src/main/crdPages/topLevelPages/userPages/settings/<tab>/<tab>Mapper.ts` (FR-005). All seven settings tabs ship together in one PR (FR-001 / FR-002). All six languages (en / nl / es / bg / de / fr) edited in the same PR per the manual CRD i18n workflow.
**Scale/Scope**: 1 settings shell + 7 settings tabs (each its own P1 user story), 1 new CRD i18n namespace (`crd-userSettings`), ~20 new CRD presentational components, 7 data mappers (one per tab), ~10 existing Apollo queries / mutations reused unchanged, ~2 new shared helpers (`useCanEditSettings`, `useUserPageRouteContext`) — these are shared with sibling spec 096 and tracked here as foundational. No new primitives required.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | CRD components purely presentational. All business logic stays in existing `src/domain/community/userAdmin/*` hooks (`useUserSettings`, `useFilteredMemberships`, `useContributionProvider.leaveCommunity`, `usePushNotificationContext`). Data mappers live under `src/main/crdPages/topLevelPages/userPages/settings/<tab>/<tab>Mapper.ts`. |
| II. React 19 Concurrent UX Discipline | PASS | All CRD views are pure render functions. Per-field save uses local visual state only; mutations wrap with `useTransition` in the integration layer (per Constitution Principle II) so a slow save never blocks a tab switch. Suspense boundaries surround each lazy-loaded CRD page. No legacy lifecycles introduced. |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes (FR-005 + Out of Scope). All Apollo operations go through generated hooks from `src/core/apollo/generated/apollo-hooks.ts`. CRD components never import generated GraphQL types — only data mappers do. |
| IV. State & Side-Effect Isolation | PASS | CRD components hold only visual state (edit/idle, hover, active tab, popover open, scroll position). All side effects (mutations, navigation, localStorage writes for the design-system toggle, Kratos flow) live in the integration layer. |
| V. Experience Quality & Safeguards | PASS | FR-110 / FR-111 / FR-112 codify WCAG 2.1 AA: semantic HTML, visible focus, accessible names on icon-only buttons, keyboard reachable tab strip, `aria-busy` on async-pending controls. Tab-strip horizontal-scroll variant on `< md` keeps every tab keyboard-reachable. |
| Arch #1: Feature directories map to domain contexts | PASS | Presentational components under `src/crd/components/user/settings/`. Integration under `src/main/crdPages/topLevelPages/userPages/settings/`. Domain hooks reused from `src/domain/community/userAdmin/`. |
| Arch #2: Styling standardizes on MUI theming | **JUSTIFIED VIOLATION** | Same intentional, constitution-acknowledged violation as 039 / 041 / 042 / 043 / 045 / 091 / 096. CRD is the announced successor design system. See Complexity Tracking. |
| Arch #3: i18n via react-i18next | PASS | New namespace `crd-userSettings`; English source only edited directly; the other five languages (nl / es / bg / de / fr) maintained manually in the same PR per `src/crd/CLAUDE.md` (no Crowdin). No hard-coded strings. |
| Arch #4: Build artifacts deterministic | PASS | No Vite config changes. No new runtime dependencies — every primitive and hook used is already in `package.json`. Existing CRD chunk-splitting strategy applies. |
| Arch #5: No barrel exports | PASS | All imports use explicit file paths. |
| Arch #6: SOLID + DRY | PASS | **SRP**: view vs. mapper vs. hook per tab. **OCP**: per-tab compositions independent; per-field `EditableField` primitive accepts a strategy callback for save. **LSP**: every editable field implements a uniform `EditableFieldProps<T>` contract (hover affordance, edit mode, Save / Cancel, error display). **ISP**: each tab's view-prop interface is minimal and tab-specific (`MyProfileViewProps`, `AccountViewProps`, etc.). **DIP**: views consume plain props injected by mappers — never call Apollo directly. **DRY**: shared `EditableField` wrapper across My Profile fields, shared `UserSettingsCard`, shared `MembershipsTable` row between Membership + Account hosted-spaces, shared `ConfirmationDialog` from `src/crd/components/dialogs/`. |

**Post-Phase 1 re-check**: All gates pass. The Arch #2 violation is identical to prior CRD migrations.

### Architectural Note — Account tab create / manage / delete flows

The existing `ContributorAccountView` (used by MUI Account tab) imports `@mui/material`, `@mui/icons-material`, and other MUI core/UI modules — it cannot be embedded in a CRD page (FR-005). The spec wording "the CRD layer wraps the same `useAccountInformation` and `ContributorAccountView` hooks" is interpreted as **wrap the data hooks** (which is fine), not the View component (which is impossible without violating FR-005).

The CRD Account tab is therefore a **thin presentational shell** that:

1. Renders the four card groups (Hosted Spaces, Virtual Contributors, Innovation Packs, Innovation Hubs) using CRD primitives + reused `CompactSpaceCard` / `ContributorCardHorizontal`-equivalent CRD components.
2. Surfaces every kebab action and create button as a callback prop.
3. The integration layer (`src/main/crdPages/topLevelPages/userPages/settings/account/`) wires those callbacks to the existing creation / management routes via `useNavigate(...)` — landing the user on the existing MUI admin pages (e.g., `/admin/innovation-packs/<id>/...`) for the heavy flows. **No CRD ports of the existing MUI creation dialogs are introduced in this spec** — this preserves "no new behavior" (Out of Scope) while honoring FR-005.

This pragmatic choice is documented in `research.md` (Decision #3) and preserves the option to port specific dialogs to CRD in a follow-up spec if desired.

## Project Structure

### Documentation (this feature)

```text
specs/097-crd-user-settings/
├── plan.md              # This file
├── spec.md              # Feature specification (7 P1 user stories)
├── research.md          # Phase 0: research findings + ambiguity resolutions
├── data-model.md        # Phase 1: entities + GraphQL → CRD prop mappings
├── quickstart.md        # Phase 1: setup, build order, smoke checklist
├── contracts/           # Phase 1: TypeScript interfaces for CRD components
│   ├── shell.ts                  # UserSettingsShell + tab strip + card primitive
│   ├── tab-myProfile.ts
│   ├── tab-account.ts
│   ├── tab-membership.ts
│   ├── tab-organizations.ts
│   ├── tab-notifications.ts
│   ├── tab-settings.ts
│   ├── tab-security.ts
│   └── data-mapper.ts             # Cross-tab mapper utility contracts
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── crd/
│   ├── primitives/                                 # ALL primitives already exist — no new ports needed
│   ├── components/
│   │   ├── dialogs/                                # EXISTING — ConfirmationDialog reused for Leave / Delete confirmations
│   │   └── user/
│   │       └── settings/                           # NEW — settings shell + per-tab presentational components
│   │           ├── UserSettingsShell.tsx           # Sticky header + 7-tab strip + outlet
│   │           ├── UserSettingsTabStrip.tsx        # Radix-Tabs over the 7 tabs; horizontal-scroll on < md; auto-scrolls active into view
│   │           ├── UserSettingsCard.tsx            # Title + bottom-bordered heading + body primitive
│   │           ├── EditableField.tsx               # Hover-pencil reveal + edit-mode Save/Cancel + per-field error/Saved indicator
│   │           ├── EditableTextField.tsx           # Text/email/single-line variant of EditableField
│   │           ├── EditableMarkdownField.tsx       # Bio variant (Enter inserts newline; Save / Cancel by icon only)
│   │           ├── EditableSelectField.tsx         # Country selector variant
│   │           ├── EditableTagsField.tsx           # Tagsets variant (uses tags-input)
│   │           ├── EditableReferenceRow.tsx        # Social Link row (URL input + per-row Save/Cancel + delete trash)
│   │           └── tabs/
│   │               ├── MyProfileView.tsx
│   │               ├── MyProfileAvatarColumn.tsx   # Right-column profile picture preview + Change Avatar
│   │               ├── AccountView.tsx
│   │               ├── AccountResourceCard.tsx     # Reusable horizontal card (avatar + title + description + kebab)
│   │               ├── MembershipView.tsx
│   │               ├── MembershipsTable.tsx        # Paginated table with search + filter + Leave kebab
│   │               ├── PendingApplicationsTable.tsx # Read-only table
│   │               ├── HomeSpaceCard.tsx           # Dropdown + Auto-redirect checkbox + caption
│   │               ├── OrganizationsView.tsx
│   │               ├── OrganizationsTable.tsx      # Search + Create button + Leave kebab
│   │               ├── NotificationsView.tsx
│   │               ├── NotificationGroupCard.tsx   # 1 group → N rows with 3 switches each
│   │               ├── NotificationRow.tsx         # `inApp` / `email` / `push` switches
│   │               ├── PushSubscriptionsListCard.tsx # CRD port of MUI's PushSubscriptionsList (presentational)
│   │               ├── PushAvailabilityBanner.tsx  # Info banner shown when push unavailable
│   │               ├── SettingsView.tsx
│   │               ├── DesignSystemSwitchCard.tsx  # CRD on/off toggle (writes to localStorage + reloads)
│   │               └── SecurityView.tsx            # Card shell wrapping Kratos KratosForm/KratosUI
│   ├── i18n/
│   │   └── userSettings/                           # NEW — manually managed (en / nl / es / bg / de / fr)
│   │       ├── userSettings.en.json
│   │       ├── userSettings.nl.json
│   │       ├── userSettings.es.json
│   │       ├── userSettings.bg.json
│   │       ├── userSettings.de.json
│   │       └── userSettings.fr.json
│   └── lib/
│       └── (existing — no new helpers required by this spec)
├── main/
│   ├── crdPages/
│   │   └── topLevelPages/
│   │       └── userPages/                          # SHARED with sibling spec 096-crd-user-pages
│   │           ├── CrdUserRoutes.tsx               # Route entry mirroring src/domain/community/user/routing/UserRoute.tsx — owned by 096
│   │           ├── useUserPageRouteContext.ts     # Resolves userId/userSlug + currentUser — shared helper
│   │           ├── useCanEditSettings.ts           # Encapsulates the canEditSettings predicate (FR-008a) — shared helper
│   │           └── settings/                       # NEW (this spec) — settings integration layer
│   │               ├── CrdUserAdminRoutes.tsx      # 7 settings sub-routes; redirect non-owner-non-admin → /user/<slug>; Security route gated to owner only
│   │               ├── myProfile/
│   │               │   ├── CrdMyProfilePage.tsx
│   │               │   ├── useMyProfileFields.ts  # Per-field save handlers (one updateUser call per field)
│   │               │   ├── useReferenceCrud.ts    # create / update / delete reference handlers
│   │               │   ├── useTagsetSave.ts       # createTagsetOnProfile path
│   │               │   ├── useAvatarUpload.ts     # File-pick → immediate visual upload mutation
│   │               │   └── myProfileMapper.ts
│   │               ├── account/
│   │               │   ├── CrdAccountPage.tsx
│   │               │   ├── useAccountActions.ts    # Navigation handlers for Create / Manage / Delete kebabs
│   │               │   └── accountMapper.ts
│   │               ├── membership/
│   │               │   ├── CrdMembershipPage.tsx
│   │               │   ├── useHomeSpace.ts         # Wraps updateUserSettings for Home Space + Auto-redirect
│   │               │   ├── useLeaveMembership.ts   # Wraps useContributionProvider.leaveCommunity
│   │               │   └── membershipMapper.ts
│   │               ├── organizations/
│   │               │   ├── CrdOrganizationsPage.tsx
│   │               │   ├── useLeaveOrganization.ts
│   │               │   ├── useCreateOrganization.ts # Privilege check + navigation to existing flow
│   │               │   └── organizationsMapper.ts
│   │               ├── notifications/
│   │               │   ├── CrdNotificationsPage.tsx
│   │               │   ├── useNotificationToggle.ts # Optimistic-overrides pattern for updateUserSettings
│   │               │   ├── usePushSubscriptionList.ts # Wraps the existing push subscription queries / context
│   │               │   └── notificationsMapper.ts
│   │               ├── settings/
│   │               │   ├── CrdSettingsPage.tsx
│   │               │   ├── useDesignSystemToggle.ts # localStorage write + reload
│   │               │   ├── useAllowMessagesToggle.ts # updateUserSettings for communication.allowOtherUsersToSendMessages
│   │               │   └── settingsMapper.ts
│   │               └── security/
│   │                   ├── CrdSecurityPage.tsx     # Mounts existing Kratos flow + REMOVED_FIELDS filter inside CRD card shell
│   │                   └── useKratosSettingsFlow.ts # Reuses the same Kratos flow hook the MUI page uses
│   └── routing/
│       └── TopLevelRoutes.tsx                      # MODIFIED (jointly with 096) — adds the conditional CrdUserRoutes vs. UserRoute branch under `useCrdEnabled()` gate
├── core/
│   └── i18n/
│       └── config.ts                               # MODIFIED — register `crd-userSettings` namespace
└── domain/community/userAdmin/                     # UNCHANGED — existing MUI files stay for toggle-off
```

**Structure Decision**: Presentational CRD components live under `src/crd/components/user/settings/`. The route entry, per-tab mappers, route guards, and integration hooks live under `src/main/crdPages/topLevelPages/userPages/settings/`. Every tab has a folder with one mapper, a top-level integration page component, and per-tab hooks. The existing MUI files under `src/domain/community/userAdmin/*` stay intact and continue to serve users when `useCrdEnabled()` returns `false`. No GraphQL changes; no new primitives.

**TopLevelRoutes wiring** (mirrors the 045 / 091 / 096 patterns): the conditional branch in `TopLevelRoutes.tsx` chooses between `CrdUserRoutes` (lazy-loaded, owned by 096; nests `CrdUserAdminRoutes` for settings) and the existing `UserRoute` (also lazy-loaded). Both are wrapped in the existing `NoIdentityRedirect` and `WithApmTransaction` — identical to today's wiring (research §1).

**`/user/me/settings/*` resolution**: handled by the shared `CrdUserRoutes.tsx` (owned by 096). Resolves the current user's nameID from `useCurrentUserContext()` and replaces `me` with the slug, then delegates the settings subtree to `CrdUserAdminRoutes`.

**Security tab redirect**: `CrdUserAdminRoutes.tsx` resolves `canEditSettings` via `useCanEditSettings()` and redirects falsy → `/user/<slug>` (public profile, owned by 096). It additionally checks `currentUser.id === profileUser.id` for the `security` route specifically and redirects falsy → `/user/<slug>/settings/profile` (FR-093a).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Arch #2 (parallel CRD design system) | CRD is the announced successor design system; all new pages adopt it per 039 / 041 / 042 / 043 / 045 / 091 / 096 precedent | Continuing MUI-only would block the CRD migration mandate; this intentional parallel-systems phase is tracked, bounded by the localStorage toggle, and removed once every page is migrated and validated. |
| Account tab navigates to existing MUI admin routes for Create / Manage / Delete instead of porting full creation dialogs | Spec Out of Scope says "no new affordances" and the existing dialogs (`CreateVirtualContributorDialog`, etc.) are large MUI components that cannot be embedded in CRD per FR-005; full ports would balloon the spec scope and introduce visual divergence that is not justified by the user-facing goal of this migration | A complete port of every Account-tab dialog would significantly inflate scope and risk visual drift between MUI and CRD versions of the same flows. Navigation to the existing MUI routes preserves behaviour exactly while keeping the CRD scope tractable; per-dialog ports can be tackled in follow-up specs as needed. |
