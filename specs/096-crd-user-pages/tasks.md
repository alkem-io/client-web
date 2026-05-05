---

description: "Task list for CRD Public Profile Pages (User, Organization, Virtual Contributor)"
---

# Tasks: CRD Public Profile Pages (User, Organization, Virtual Contributor)

**Input**: Design documents from `/specs/096-crd-user-pages/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Vitest unit tests are included for the three mappers, the BoK discriminated-union renderer, the `useCanEditSettings` predicate, and i18n key parity — per research §9 ("Unit-test the pure transformation logic for each actor type; rely on manual smoke for the end-to-end views"). Visual / interaction validation is manual via the per-actor smoke checklist in `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. All three stories are P1 and ship together as one user-vertical release with sibling spec `097-crd-user-settings`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1 = User profile, US2 = Organization profile, US3 = VC profile)
- File paths are absolute from the repository root (`src/...`)

## Path Conventions

This is a single Vite SPA. Source paths begin at `src/`. Three integration verticals live under `src/main/crdPages/topLevelPages/{userPages,organizationPages,vcPages}/`. Presentational CRD components live under `src/crd/components/{user,organization,virtualContributor,common}/`. The shared i18n namespace lives at `src/crd/i18n/profilePages/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Repo-wide setup — confirm prerequisites, no new tooling needed.

- [X] T001 Verify dev server runs and CRD toggle is functional: `pnpm install`, `pnpm start`, then in the browser console set `localStorage.setItem('alkemio-crd-enabled', 'true')` and reload `/user/<self>`. Confirm the existing MUI page renders with the toggle off and the existing CRD pages (Spaces / Dashboard) render with the toggle on. Document any environment issues in this task's notes — no code change.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cross-cutting infrastructure that ALL three user stories depend on. Must complete before any user-story phase can finish (US1 also depends on its own foundational helpers, included here).

**⚠️ CRITICAL**: User-story implementation cannot ship until this phase is complete.

### i18n namespace

- [X] T002 Create the shared CRD i18n namespace skeleton at `src/crd/i18n/profilePages/profilePages.en.json` with empty top-level keys for `userProfile`, `orgProfile`, `vcProfile`, `common` (per research §7 — one shared namespace for all three actor pages).
- [X] T003 [P] Create empty placeholder files for the other five languages: `src/crd/i18n/profilePages/profilePages.nl.json`, `profilePages.es.json`, `profilePages.bg.json`, `profilePages.de.json`, `profilePages.fr.json` — each mirroring the `en` key shape.
- [X] T004 Register the `crd-profilePages` namespace in `src/core/i18n/config.ts` (lazy-loaded, matching the existing `crd-exploreSpaces` registration pattern) and in `@types/i18next.d.ts`.
- [X] T005 [P] Add a Vitest assertion at `src/crd/i18n/profilePages/__tests__/keyParity.test.ts` that all six language files have identical key shapes (same pattern used by other CRD i18n namespaces).

### Shared CRD primitives

- [X] T006 [P] Implement the new shared `CompactContributorCard` primitive at `src/crd/components/common/CompactContributorCard.tsx` per `specs/096-crd-user-pages/contracts/compactContributor.ts`. Pure presentational, built atop `card.tsx` and `avatar.tsx` only. Supports `compact` (default) and `spacious` variants; renders as `<a href>` when `href` is set, non-interactive otherwise (per `src/crd/CLAUDE.md`). MUST render both `caption` AND the new optional `secondaryCaption` field (Q1 decision — used by the User profile's Organizations sidebar to surface the member-count line in addition to the role label).
- [X] T006a [P] Implement the new shared `MessagePopover` primitive at `src/crd/components/common/MessagePopover.tsx` (Q2 decision — placed in `common/` from day one, not under `user/`). Pure presentational, recipient-agnostic in-hero compose surface: a `popover.tsx` wrapping a `textarea.tsx` + Send `button.tsx`. Internal state: open/closed flag + draft text. Calls `onSendMessage(text)` prop on submit; closes on success; preserves draft on failure with inline error display (state-machine per data-model.md). Used by both `UserPageHero` (T014) and `OrganizationPageHero` (T027) — neither imports the other's vertical.

### Shared cross-actor handler

- [X] T007 [P] Implement `useSendMessageHandler` at `src/main/crdPages/topLevelPages/common/useSendMessageHandler.ts` (NEW shared `topLevelPages/common/` integration-layer folder — mirrors the cross-vertical `src/crd/components/common/` folder for presentational primitives) per the `UseSendMessageHandler` contract in `specs/096-crd-user-pages/contracts/data-mapper.ts`. Wraps `useSendMessageToUsersMutation` with a recipient-id-bound `(messageText: string) => Promise<void>` API; tracks `sending` and `error` state internally. Used by US1 (User hero) and US2 (Org hero) — same hook, different recipient ID per research §5. **Placement rationale**: keeps both integration verticals symmetric — neither User nor Organization cross-imports the other. Same rationale used to place `MessagePopover` under `src/crd/components/common/` (T006a).

### User-vertical shared helpers (also reused by sibling spec 097-crd-user-settings)

- [X] T008 [P] Implement `useUserPageRouteContext` at `src/main/crdPages/topLevelPages/userPages/useUserPageRouteContext.ts` per the `UseUserPageRouteContext` contract in `contracts/data-mapper.ts`. Resolves `userSlug` from the URL, `userId` from `useUserProvider`, and `currentUserId` from `useCurrentUserContext`; exposes a combined `loading` flag.
- [X] T009 [P] Implement `useCanEditSettings` at `src/main/crdPages/topLevelPages/userPages/useCanEditSettings.ts` per the `UseCanEditSettings` contract in `contracts/data-mapper.ts`. Computes `canEditSettings = isOwner || isPlatformAdmin` using `useCurrentUserContext().hasPlatformPrivilege(PlatformAdmin)`. Distinguishes `isOwner` and `isPlatformAdmin` flags so 097's Security tab can gate owner-only.
- [X] T010 [P] Add a Vitest unit test at `src/main/crdPages/topLevelPages/userPages/__tests__/useCanEditSettings.test.ts` covering the four viewer categories: owner / platform admin / non-admin signed-in / anonymous (research §9; FR-011 acceptance scenarios 2 / 3 / 4).

**Checkpoint**: i18n namespace registered, shared primitive available, shared handlers ready. All three user stories can now begin in parallel.

---

## Phase 3: User Story 1 — Public User Profile Page (Priority: P1) 🎯 MVP

**Goal**: Migrate the public User profile page (`/user/:userSlug`) from MUI to CRD with the 5-tab resource strip, sidebar (bio + organizations), Settings/Message hero affordances per the FR-011/FR-012 visibility matrix, and skeleton loading states.

**Independent Test**: With CRD on, open `/user/<self>` and `/user/<otherUser>` (signed in as a regular user, then as a platform admin). Verify per the per-viewer matrix in spec.md User Story 1 acceptance scenarios 1–8: hero with no presence dot, sidebar, sticky 5-tab strip with `All Resources` active by default, tab filtering per data-model.md, Settings icon visibility, Message button visibility, message send via `useSendMessageToUsersMutation`. Toggle CRD off — existing MUI `UserProfilePage` renders unchanged.

### Mapper (TDD pair — write test first if practicing TDD)

- [X] T011 [P] [US1] Implement `publicProfileMapper.ts` at `src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.ts` — pure function mapping the User-vertical Apollo data (`useUserProvider`, `useUserAccountQuery`, `useUserContributions`, `useUserOrganizationIds`, `useFilteredMemberships`) to `UserPublicProfileViewProps` per `contracts/publicProfile.ts` and `data-model.md`. Includes the tab→section filter (data-model.md table) and the `canEditSettings`/`isOwn` computation (the predicate value comes from `useCanEditSettings`). The mapper itself is pure; i18n labels are passed in as a `labels` arg from the integration page. **Filter input for "Spaces Leading"**: pass `[RoleType.Lead, RoleType.Admin]` to `useFilteredMemberships` — exact parity with current MUI `UserProfilePageView.tsx:34`. **Innovation packs and innovation hubs MUST be dropped** from the Resources Hosted output even though `useAccountResources` returns them — per spec.md Out of Scope (prototype omits them). **MUST produce per-region `loading` flags** (Q3 — `loading.hero` ← `useUserProvider.loading`, `loading.organizations` ← `userId !== undefined && organizationIds === undefined` (Q-D heuristic; `useUserOrganizationIds` swallows the loading flag), `loading.hostedResources` ← `useUserAccountQuery.loading`, `loading.memberships` ← `userId !== undefined && contributions === undefined` (same heuristic; `useUserContributions` swallows the loading flag)) per the data-model.md "Query → region" table. **MUST compose the User Organizations list as `CompactContributorCardItem[]`** with `caption = role` and `secondaryCaption = i18n-resolved member-count line` (Q1).
- [ ] T012 [P] [US1] Add a Vitest unit test at `src/main/crdPages/topLevelPages/userPages/publicProfile/__tests__/publicProfileMapper.test.ts` covering: tab→section filter for each of the 5 tabs, leading vs. member-of split via `useFilteredMemberships(contributions, [Lead, Admin])` (assert the filter input matches current MUI exactly), empty-section omission rule (FR-015), bio markdown null vs. populated, no-presence-dot invariant (the mapper must not surface `lastActiveDate`), **innovation packs and innovation hubs are dropped even when `useAccountResources` returns them** (assert the mapper output contains only `hostedSpaces` and `hostedVirtualContributors`, never `innovationPacks` / `innovationHubs`).

### Active-tab state hook

- [X] T013 [US1] Implement `useResourceTabs` at `src/main/crdPages/topLevelPages/userPages/publicProfile/useResourceTabs.ts` — local React state (`useState<ResourceTabKey>('allResources')`) per FR-013 (NOT URL-synced); exposes `{ activeTab, onSelectTab }`. No URL search param sync; reload always lands on `allResources`.

### Presentational components (parallelizable — independent files)

- [X] T014 [P] [US1] Implement `UserPageHero` at `src/crd/components/user/UserPageHero.tsx` per `UserPageHeroProps` in `contracts/publicProfile.ts`. Pure presentational: avatar, display name, location line. **No** presence dot. Settings icon button visible when `showSettingsIcon === true`; Message button visible when `showMessageButton === true`. Click handlers received as props (no internal navigation per `src/crd/CLAUDE.md`). Consumes the shared `MessagePopover` from T006a (`src/crd/components/common/MessagePopover.tsx`) — does NOT define its own popover.
- [ ] T014a [P] [US1] Add a Vitest render test at `src/crd/components/user/__tests__/UserPageHero.test.tsx` covering the per-viewer visibility matrix per SC-003: anonymous viewer (Settings hidden, Message hidden), profile owner (Settings visible, Message hidden), non-admin viewer on someone else's profile (Settings hidden, Message visible), platform admin on someone else's profile (BOTH Settings AND Message visible). **MUST also assert** (Q5 — Cv1) that the Send button inside `MessagePopover` exposes `aria-busy="true"` while the `onSendMessage` promise is pending and `aria-busy="false"` after it resolves — covers FR-110.
- [X] T016 [P] [US1] Implement `UserResourceTabStrip` at `src/crd/components/user/UserResourceTabStrip.tsx` per `UserResourceTabStripProps` in `contracts/publicProfile.ts`. Sticky position. Below `md`: `overflow-x-auto no-scrollbar`; all 5 tabs remain inline; the active tab auto-scrolls into view on mount and on tab change (FR-013 clarification). Keyboard-navigable per FR-111 — Tab into strip, Left/Right arrows, Enter to activate (use the existing CRD `tabs` primitive or replicate its keyboard pattern).
- [ ] T016a [P] [US1] Add a Vitest keyboard-navigation test for `UserResourceTabStrip` at `src/crd/components/user/__tests__/UserResourceTabStrip.test.tsx` (Q5 — Cv2). Asserts: Tab focuses the active tab; Left/Right arrows move focus AND activate the tab (calling `onSelectTab`); Enter on a focused tab activates it. Covers FR-111 explicitly so a regression is caught by tests, not only by axe.
- [X] T017 [P] [US1] Implement `UserResourceSections` at `src/crd/components/user/UserResourceSections.tsx` per `UserResourceSectionsProps` in `contracts/publicProfile.ts`. Switches on `activeTab` to render Resources Hosted (with sub-sections on `allResources`; sub-section headers hidden on single-slice tabs per FR-013) / Spaces Leading / Member Of. Sections with empty data are omitted (FR-015) — except the empty-state caption rule for "No memberships yet" when applicable.
- [X] T018 [P] [US1] Implement `UserProfileSidebar` at `src/crd/components/user/UserProfileSidebar.tsx` per `UserProfileSidebarProps` in `contracts/publicProfile.ts`. Two stacked CRD card sections: About (bio rendered via existing CRD `MarkdownContent`) + Organizations list (rendered as a stack of `CompactContributorCard` instances from T006 in the `compact` variant — `caption = role` label, `secondaryCaption = member-count line` per the Q1 decision; one primitive serves three sites — User Orgs, Org Associates, VC Host). No inline fallback component.
- [X] T019 [US1] Implement `UserPublicProfileView` at `src/crd/components/user/UserPublicProfileView.tsx` per `UserPublicProfileViewProps` in `contracts/publicProfile.ts`. Composes the hero + sidebar + tab strip + sections per the prototype layout: outer `grid grid-cols-1 lg:grid-cols-12 gap-8`, sidebar `lg:col-span-4 lg:sticky lg:top-24 self-start`, right column `lg:col-span-8`, both wrapped in the CRD `PageLayout` shell. On viewports below `lg`, the sidebar stacks **above** the right column in a single-column layout (it is **not** hidden — parity with prototype). **Renders Skeleton placeholders per region**, driven by the per-region `loading` shape (Q3 — `loading.hero`, `loading.organizations`, `loading.hostedResources`, `loading.memberships`); each region paints in independently as its driving query resolves (FR-009). Layout MUST NOT shift when a region transitions from skeleton to real content.

### Integration page + routing

- [X] T020 [US1] Implement `CrdUserProfilePage` at `src/main/crdPages/topLevelPages/userPages/publicProfile/CrdUserProfilePage.tsx`. Wires `useUserPageRouteContext` (T008) → `useCanEditSettings` (T009) → existing Apollo queries → `publicProfileMapper` (T011) → `useResourceTabs` (T013) → `useSendMessageHandler` from `src/main/crdPages/topLevelPages/common/` (T007). Renders `UserPublicProfileView` with the produced props. Uses `useTransition` to wrap the send-message mutation (Constitution Principle II).
- [X] T021 [US1] Implement `CrdUserRoutes` at `src/main/crdPages/topLevelPages/userPages/CrdUserRoutes.tsx` mirroring the existing `src/domain/community/user/routing/UserRoute.tsx` structure exactly (Q6 decision — match MUI behavior). Routes:
  - `/:userSlug/*` → renders `CrdUserProfilePage` directly under `CrdLayoutWrapper`.
  - `/me/*` → renders the same `CrdUserProfilePage` **in place** (URL stays `/user/me`), supplying the resolved current-user context via the existing `MeUserProvider` (or a CRD analog wrapping it) — same pattern as MUI's `UserMeRoute.tsx`. **Does NOT redirect to `/<slug>`.** This way bookmarks/share-links to `/user/me` keep working per-viewer (each signed-in viewer sees their own profile under that URL); URLs to `/user/<slug>` remain explicit per recipient.
  - `settings/*` (under both `/me/*` and `/:userSlug/*`) → delegates to `CrdUserAdminRoutes` from sibling spec 097 if available; otherwise renders a placeholder that falls back to the existing MUI `UserAdminRoute`.
  No modification to the existing `UserMeRoute.tsx` is required — the dispatch between CRD and MUI happens at `TopLevelRoutes.tsx` (T022), one level above. The CRD-vs-MUI choice picks an entire `<UserRoute>` subtree at a time; the MUI-side `UserMeRoute` is unaffected and continues to serve users when CRD is off.
- [X] T022 [US1] Modify `src/main/routing/TopLevelRoutes.tsx` — add the conditional block for the User vertical: when `useCrdEnabled()` is true and the path matches `/user/*`, lazy-load `CrdUserRoutes`; otherwise lazy-load the existing `UserRoute` (preserving the existing `<NoIdentityRedirect>` and `<WithApmTransaction>` wrappers exactly per research §1).

### i18n keys (User profile)

- [X] T023 [US1] Add User-profile i18n keys to `src/crd/i18n/profilePages/profilePages.en.json` under `userProfile.*` and any cross-actor keys to `common.*`. Keys to cover (CRD-namespace, new): hero (`locationFormat`, `settingsTooltip`, `messageButton`, `messagePopoverPlaceholder`, `sendButton`), tab strip (5 tab labels), section headings (`resourcesHosted`, `spaces`, `virtualContributors`, `spacesLeading`, `memberOf`), empty states (`emptyLeading`, `emptyBio`, `emptyOrganizations`), sidebar (`aboutTitle`, `organizationsTitle`), Organizations row (`memberCountLine` interpolating `{count}`). **Parity reuse (FR-102)**: `pages.user-profile.communities.noMembership` for the Member-of empty caption — do NOT duplicate; the mapper resolves it from the global `translation` namespace and forwards via the `labels` arg. Document the reuse in a comment in `publicProfileMapper.ts`.
- [X] T024 [P] [US1] Translate all User-profile keys added in T023 into `nl.json`, `es.json`, `bg.json`, `de.json`, `fr.json` (manual AI-assisted per `src/crd/CLAUDE.md`; same PR per FR-101).

**Checkpoint**: User profile page is fully functional under CRD-on; MUI page renders unchanged under CRD-off. The 5-tab strip filters per data-model.md; Settings/Message gating matches the spec's per-viewer matrix.

---

## Phase 4: User Story 2 — Public Organization Profile Page (Priority: P1)

**Goal**: Migrate the public Organization profile page (`/organization/:orgSlug`) from MUI to CRD with hero (avatar + name + location + Verified badge + Settings/Message), sidebar (Bio + Tagsets + References + Associates), and right column (Account Resources + Lead Spaces + All Memberships) per the parity rules in the spec.

**Independent Test**: With CRD on, open `/organization/<some-org>` (signed in as a regular user, then as an org admin, then as anonymous). Verify per spec.md User Story 2 acceptance scenarios 1–10: hero affordances, sidebar sections (Associates hidden when `canReadUsers === false`), right-column section omission rules (Account Resources omitted when empty; Lead Spaces omitted when empty; All Memberships always rendered with empty caption when empty), Verified badge, message send via `useSendMessageToUsersMutation` against the org as recipient. Toggle CRD off — existing MUI `OrganizationPage` renders unchanged.

### Mapper

- [X] T025 [P] [US2] Implement `organizationProfileMapper.ts` at `src/main/crdPages/topLevelPages/organizationPages/publicProfile/organizationProfileMapper.ts` — pure function mapping `useOrganizationProvider` data + `useOrganizationAccountQuery` + `useAccountResources` + `useFilteredMemberships(contributions, [RoleType.Lead])` to `OrganizationPublicProfileViewProps` per `contracts/organizationProfile.ts` and `data-model.md`. **Filter input is `[RoleType.Lead]` only** — no Admin (current MUI `OrganizationPageView.tsx:62` parity). Implements the section-omission rules (Account Resources omitted when all three lists are empty; Lead Spaces omitted when empty; All Memberships always rendered) per FR-024. Computes `verified = organization.verification.status === VerifiedManualAttestation` and `settingsUrl = canEdit ? buildSettingsUrl(profile.url) : null`. Filters references via `isSocialNetworkSupported` (only the "other" group goes in the sidebar — same predicate file used by VC mapper). **MUST produce per-region `loading` flags** (Q3 — `loading.hero` ← `useOrganizationProvider.loading`, `loading.sidebar` ← same, `loading.accountResources` ← `useOrganizationAccountQuery.loading`, `loading.memberships` ← `useFilteredMemberships`'s underlying contributions loading). **MUST map every Associate to an `AssociateGridItem`** (`{ id, displayName, avatarImageUrl, url }`) — NOT to `CompactContributorCardItem` (parity with current MUI `AssociatesView` which uses `ContributorCardSquare`). Mapper passes ALL associates regardless of `canReadUsers`; the view branches on `canReadUsers` (sign-in CTA vs. avatar grid). Mapper passes ALL spaces regardless of count; the view paginates spaces at `VISIBLE_SPACE_LIMIT = 6` with a "Show all" button (parity port of MUI `AccountResourcesView`).
- [ ] T026 [P] [US2] Add a Vitest unit test at `src/main/crdPages/topLevelPages/organizationPages/publicProfile/__tests__/organizationProfileMapper.test.ts` covering: four sidebar sections including Associates always-populated (mapper does not gate on `canReadUsers`; the `canReadUsers` flag is passed through unchanged for the view to branch on — assert `associates.canReadUsers` reflects `permissions.canReadUsers`); three right-column sections including Account Resources omission when all lists empty, Lead Spaces filter input is `[Lead]` only (assert call args), All Memberships empty-state; Verified badge predicate (manual-attestation true / false / unset); references social/non-social split (research §9); Account Resources mapper passes ALL spaces (no truncation in the mapper — pagination is in the view).
- [ ] T026a [P] [US2] Add a Vitest render test at `src/crd/components/organization/__tests__/OrganizationPageHero.test.tsx` covering the per-viewer visibility matrix per SC-003: anonymous viewer (Settings hidden, Message hidden), signed-in non-admin (Settings hidden, Message visible), org admin (`canEdit === true` → Settings visible, Message visible), Verified badge true/false. Renders `OrganizationPageHero` with each viewer scenario as `settingsUrl` / `onSendMessage` prop combinations and asserts the rendered DOM. **MUST also assert** (Q5 — Cv1) that the Send button inside `MessagePopover` exposes `aria-busy="true"` while the `onSendMessage` promise is pending and `aria-busy="false"` after it resolves — covers FR-110.

### Presentational components (parallelizable)

- [X] T027 [P] [US2] Implement `OrganizationPageHero` at `src/crd/components/organization/OrganizationPageHero.tsx` per `OrganizationPageHeroProps` in `contracts/organizationProfile.ts`. Avatar, display name, location line, Verified badge (FR-020). Settings icon visible when `settingsUrl !== null`. Message button visible when `onSendMessage !== null`. Consumes the shared `MessagePopover` from T006a (`src/crd/components/common/MessagePopover.tsx`) — same primitive the User hero uses; no cross-vertical import (Q2 decision).
- [X] T028 [P] [US2] Implement `OrganizationProfileSidebar` at `src/crd/components/organization/OrganizationProfileSidebar.tsx` per `OrganizationProfileSidebarProps` in `contracts/organizationProfile.ts`. Four sections: Bio (markdown via existing CRD `MarkdownContent`), Tagsets (Keywords + Capabilities as compact tag pills), References (labeled URL chips). **Associates** — parity port of current MUI `AssociatesView`: section header always rendered with associate count from `totalCount`. Body branches on `associates.canReadUsers`: when true, renders a square avatar grid (one cell per `AssociateGridItem`, using CRD `Avatar` primitive) capped at 12 with a "Show more (N) / Show less" button toggling local `useState` between capped and full views (state-machine in this view, NOT the mapper); when false, renders the sign-in CTA copy from `labels.associatesSignInCta` instead of the grid. Section is **never** hidden entirely. NOTE: this section does NOT consume `CompactContributorCard` (Associates is a square grid, not a sidebar row list).
- [X] T029 [P] [US2] Implement `OrganizationResourceSections` at `src/crd/components/organization/OrganizationResourceSections.tsx` per `OrganizationResourceSectionsProps` in `contracts/organizationProfile.ts`. Three sections: **Account Resources** (combined spaces + innovationPacks + innovationHubs as a single titled section — omitted when `accountResources === null`; **hosted-spaces sub-list paginates at `VISIBLE_SPACE_LIMIT = 6` with a "Show all" button** — local `useState<number>(VISIBLE_SPACE_LIMIT)` that on click sets to `accountResources.spaces.length` (no second collapse). Innovation packs and innovation hubs render every item without cap. This is a parity port of MUI `AccountResourcesView.tsx:74,82–135`.), **Lead Spaces** (omitted when empty), **All Memberships** (always rendered; empty-state caption from `labels.memberOfEmpty` — parity-reuse of `pages.user-profile.communities.noMembership` per FR-102).
- [X] T030 [US2] Implement `OrganizationPublicProfileView` at `src/crd/components/organization/OrganizationPublicProfileView.tsx` per `OrganizationPublicProfileViewProps` in `contracts/organizationProfile.ts`. Composes the hero + sidebar + sections inside the CRD `PageLayout` and `TwoColumnLayout` shells (`col-span-3` sidebar / `col-span-9` right column on `md+`). **Renders Skeleton placeholders per region**, driven by the per-region `loading` shape (Q3 — `loading.hero`, `loading.sidebar`, `loading.accountResources`, `loading.memberships`); each region paints in independently as its driving query resolves (FR-009).

### Integration page + routing

- [X] T031 [US2] Implement `CrdOrganizationProfilePage` at `src/main/crdPages/topLevelPages/organizationPages/publicProfile/CrdOrganizationProfilePage.tsx`. Wires `useUrlResolver` → `useOrganizationProvider` → `useOrganizationAccountQuery` → `useAccountResources` → `organizationProfileMapper` (T025) → `useSendMessageHandler` from `src/main/crdPages/topLevelPages/common/` (T007 — recipient ID is `organization.id`). Renders `OrganizationPublicProfileView`. Wraps the send-message mutation in `useTransition`.
- [X] T032 [US2] Implement `CrdOrganizationRoutes` at `src/main/crdPages/topLevelPages/organizationPages/CrdOrganizationRoutes.tsx` mirroring the existing `src/domain/community/organization/routing/OrganizationRoute.tsx` structure. Routes `/:orgSlug` → `CrdOrganizationProfilePage`. The settings subtree (`path="settings/*"`) falls through to the existing MUI admin route — Org admin shell migration is out of scope. Wraps with `CrdLayoutWrapper`.
- [X] T033 [US2] Modify `src/main/routing/TopLevelRoutes.tsx` — add the conditional block for the Organization vertical: when `useCrdEnabled()` is true and the path matches `/organization/*`, lazy-load `CrdOrganizationRoutes`; otherwise lazy-load the existing `OrganizationRoute`. Preserve the existing wrapper exactly (research §1 — anonymous viewers can load the page).

### i18n keys (Organization profile)

- [X] T034 [US2] Add Organization-profile i18n keys to `src/crd/i18n/profilePages/profilePages.en.json` under `orgProfile.*`. Keys to cover: hero (Verified badge label, Settings tooltip, Message button label), sidebar (`bioTitle`, `bioEmpty`, `tagsetKeywords`, `tagsetCapabilities`, `referencesTitle`, `referencesEmpty`, `associatesTitle`, `associatesCount` interpolation), right column (`accountResourcesTitle`, `accountResourcesSpacesSubtitle`, `accountResourcesInnovationPacksSubtitle`, `accountResourcesInnovationHubsSubtitle`, `leadSpacesTitle`, `memberOfTitle`). **Parity reuses (FR-102) — do NOT add CRD-namespace duplicates for these; the mapper resolves them from the global `translation` namespace and forwards via the `labels` arg**: `pages.user-profile.communities.noMembership` (memberOfEmpty), `components.dashboardNavigation.showAll` (accountResourcesShowAll), `associates-view.sign-in` (associatesSignInCta), `associates-view.more` with `{count}` (associatesShowMore), `associates-view.less` (associatesShowLess). Document each reuse in a comment in `organizationProfileMapper.ts`.
- [X] T035 [P] [US2] Translate all Organization-profile keys added in T034 into the five non-English language files under `src/crd/i18n/profilePages/`.

**Checkpoint**: Organization profile page is fully functional under CRD-on; MUI page renders unchanged under CRD-off. Settings icon links to the existing MUI admin URL; Message button works against the org as recipient.

---

## Phase 5: User Story 3 — Public Virtual Contributor Profile Page (Priority: P1)

**Goal**: Migrate the public VC profile page (`/vc/:vcSlug`) from MUI to CRD with hero (avatar + name + Settings; **NO Message button**), sidebar (Description + Host + non-social References + Body of Knowledge with three discriminated-union variants), and right column (model card + social references with `lucide-react` brand icons). Honor existing 404 (`Error404` inside CRD layout) and `useRestrictedRedirect`.

**Independent Test**: With CRD on, open `/vc/<some-vc>` (one VC per BoK variant: AlkemioSpace, AlkemioKnowledgeBase, External). Verify per spec.md User Story 3 acceptance scenarios 1–9: hero with no Message button, sidebar sections, BoK section per variant including private-space placeholder and disabled Visit-button-with-tooltip, right-column model card + social brand icons. Visit an invalid VC URL → `Error404`. Toggle CRD off — existing MUI `VCProfilePage` renders unchanged.

### Mapper + BoK resolver

- [X] T036 [P] [US3] Implement `vcProfileMapper.ts` at `src/main/crdPages/topLevelPages/vcPages/publicProfile/vcProfileMapper.ts` — pure function mapping `useVirtualContributorProfileWithModelCardQuery` + `useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery` + `useSpaceBodyOfKnowledgeAboutQuery` + `useKnowledgeBase` data to `VCPublicProfileViewProps` per `contracts/vcProfile.ts` and `data-model.md`. Implements the BoK discriminated-union resolver (research §4) — produces one of `{ kind: 'space', ... }`, `{ kind: 'knowledgeBase', ... }`, `{ kind: 'external', engineLabel: 'assistant' | 'other' }`, or `null` when no BoK applies (`bodyOfKnowledgeType` unset AND `modelCard.aiEngine.isExternal === false`; the view omits the section entirely per FR-033). **For `kind: 'space'` when `hasReadAccess === false`** (Q7), produce a placeholder `spaceProfile` with `displayName = t('components.card.privacy.private', { entity: 'space' })`, empty `url`, empty `id`, `null` avatar, and `level: 'L0'` — matching current MUI `defaultProfile`. The view renders the same SpaceCard for both private and public cases. **For `kind: 'knowledgeBase'`**, resolve `description = useKnowledgeBase().knowledgeBaseDescription || t('virtualContributorSpaceSettings.placeholder')` — exact parity with current MUI `VCProfilePageView.tsx:126`. The mapper receives `t` from the integration page (or composes the description in the integration page and passes the resolved string). Splits references via `isSocialNetworkSupported`: social → right-column, non-social → sidebar (FR-032). Computes `hasUpdatePrivilege` from `vc.authorization.myPrivileges` and `settingsUrl = hasUpdatePrivilege ? buildSettingsUrl(profile.url) : null`. Maps social references to `lucide-react` brand keys (`linkedin` / `bluesky` / `github` / `x` / `generic`). **MUST produce per-region `loading` flags** (Q3 — `loading.hero` / `loading.sidebar` / `loading.contentView` ← `useVirtualContributorProfileWithModelCardQuery.loading`; `loading.bodyOfKnowledge` ← combined loading of the BoK auxiliary queries: `useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery` + `useSpaceBodyOfKnowledgeAboutQuery` for space-backed, `useKnowledgeBase` for KB-backed, `false` for external). **MUST map the VC's provider profile to a `CompactContributorCardItem`** with `caption = null` and `secondaryCaption = null` unless current MUI surfaces a role/caption (Q1).
- [X] T037 [P] [US3] Implement `useVCBodyOfKnowledge` at `src/main/crdPages/topLevelPages/vcPages/publicProfile/useVCBodyOfKnowledge.ts` — wraps the auxiliary BoK queries (`useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery`, `useSpaceBodyOfKnowledgeAboutQuery`, `useKnowledgeBase`) and exposes `{ bodyOfKnowledge, loading }` ready to feed into the mapper.
- [ ] T038 [P] [US3] Add a Vitest unit test at `src/main/crdPages/topLevelPages/vcPages/publicProfile/__tests__/vcProfileMapper.test.ts` covering: BoK resolver for each `kind` variant (space with/without `hasReadAccess`; knowledgeBase with/without `hasReadAccess`; external with `Assistant` vs. other engine) **and the `null` case** (no `bodyOfKnowledgeType` AND `isExternal === false` → mapper produces `null`; FR-033 / acceptance scenario 7), social/non-social references split, model-card data shape, brand-icon mapping (research §9), **knowledge-base description fallback** (assert that when `useKnowledgeBase().knowledgeBaseDescription` is empty / null, `bodyOfKnowledge.description` resolves to the `virtualContributorSpaceSettings.placeholder` translation — current MUI parity).
- [ ] T038a [P] [US3] Add a Vitest render test at `src/crd/components/virtualContributor/__tests__/VCPageHero.test.tsx` covering the per-viewer visibility matrix per SC-003: anonymous viewer (Settings hidden), signed-in non-owner without `Update` privilege (Settings hidden), VC owner with `Update` privilege (`settingsUrl !== null` → Settings visible). Asserts the absence of any Message button across all scenarios per FR-030. (Q5 — Cv1: VC has no Send/Message button, so `aria-busy` assertions live in the Org and User hero tests instead — see T026a; the User hero already covers it via the Send button render path through `MessagePopover` + `useSendMessageHandler`.)

### Presentational components (parallelizable)

- [X] T039 [P] [US3] Implement `VCPageHero` at `src/crd/components/virtualContributor/VCPageHero.tsx` per `VCPageHeroProps` in `contracts/vcProfile.ts`. Avatar, display name. Settings icon visible when `settingsUrl !== null`. **NO Message button** (FR-030 — the props interface intentionally omits `onSendMessage`).
- [X] T040 [P] [US3] Implement `VCBodyOfKnowledgeSection` at `src/crd/components/virtualContributor/VCBodyOfKnowledgeSection.tsx` per `VCBodyOfKnowledgeSectionProps` in `contracts/vcProfile.ts`. When the `bodyOfKnowledge` prop is `null`, the component MUST return `null` (section omitted entirely per FR-033 — no header, no empty-state). Otherwise switches on `bodyOfKnowledge.kind`: `space` → SpaceCardHorizontal-equivalent CRD card linking to the backing space (or "Private space" placeholder when `hasReadAccess === false`); `knowledgeBase` → description + Visit button (disabled with `Tooltip` "Body of knowledge is private" when `hasReadAccess === false`); `external` → engine-type description per `engineLabel`.
- [ ] T041 [P] [US3] Add a Vitest render test at `src/crd/components/virtualContributor/__tests__/VCBodyOfKnowledgeSection.test.tsx` covering each `kind` variant (research §9): `space` renders the card / placeholder; `knowledgeBase` renders description + Visit button enabled or disabled per `hasReadAccess`; `external` renders the engine-type copy; **`null` returns nothing** (section fully omitted per FR-033).
- [X] T042 [P] [US3] Implement `VCProfileSidebar` at `src/crd/components/virtualContributor/VCProfileSidebar.tsx` per `VCProfileSidebarProps` in `contracts/vcProfile.ts`. Four sections: Description (markdown via existing CRD `MarkdownContent`), Host (renders `CompactContributorCard` from T006 in `compact` variant), non-social References (labeled URL chips; empty-state line "No references" when empty), and `VCBodyOfKnowledgeSection` (T040).
- [X] T043 [P] [US3] Implement `VCContentView` at `src/crd/components/virtualContributor/VCContentView.tsx` per `VCContentViewProps` in `contracts/vcProfile.ts`. Right column: model card details (`aiEngine`, `prompts.persona`, `prompts.constraints`, `dataPrivacy.summary`) + social links (filtered references rendered with `lucide-react` brand icons — `Linkedin`, `Twitter`, `Github`, `Youtube`, `Globe` fallback per FR-034). Brand-icon mapping receives the `brand` field from the mapper (no logic in the view).
- [X] T044 [US3] Implement `VCPublicProfileView` at `src/crd/components/virtualContributor/VCPublicProfileView.tsx` per `VCPublicProfileViewProps` in `contracts/vcProfile.ts`. Composes the hero + sidebar + content view inside the CRD `PageLayout` and `TwoColumnLayout` shells (`col-span-3` sidebar / `col-span-9` right column on `md+`). **Renders Skeleton placeholders per region**, driven by the per-region `loading` shape (Q3 — `loading.hero`, `loading.sidebar`, `loading.bodyOfKnowledge`, `loading.contentView`); the BoK section unblocks independently from the rest of the sidebar (FR-009). **Hero skeleton MUST omit the location-line placeholder** — the VC hero has no location field per FR-030 (FR-009 explicitly excludes location from the VC hero skeleton). Schema: circular avatar + name line only.

### Integration page + routing

- [X] T045 [US3] Implement `CrdVCProfilePage` at `src/main/crdPages/topLevelPages/vcPages/publicProfile/CrdVCProfilePage.tsx`. Wires `useUrlResolver` → `useRestrictedRedirect({ requiredPrivilege: AuthorizationPrivilege.Read })` → `useVirtualContributorProfileWithModelCardQuery` → `useVCBodyOfKnowledge` (T037) → `vcProfileMapper` (T036). Handles `isApolloNotFoundError` by rendering `Error404` inside the CRD layout (FR-036). All other query errors propagate to the global ErrorBoundary unchanged (Q4 — no custom CRD error component is introduced; matches current MUI which has no dedicated error display either). Renders `VCPublicProfileView`.
- [X] T046 [US3] Implement `CrdVCRoutes` at `src/main/crdPages/topLevelPages/vcPages/CrdVCRoutes.tsx` mirroring the existing `src/domain/community/virtualContributor/VCRoute.tsx` structure. Routes:
  - index `/:vcSlug` → `CrdVCProfilePage` (CRD).
  - `path="${KNOWLEDGE_BASE_PATH}/*"` → renders the existing MUI `<VCKnowledgeBaseRoute />` (lazy-imported from `@/domain/community/virtualContributor/knowledgeBase/VCKnowledgeBaseRoute`) — the knowledge-base sub-pages stay in MUI per spec.md Out of Scope; the CRD route just delegates so `/vc/:slug/knowledge-base/*` keeps working when CRD is on.
  - `path="settings/*"` → renders the existing MUI `<VCSettingsRoute />` (delegated similarly) — VC admin shell migration is out of scope.
  - `path="*"` → `Error404` inside `CrdLayoutWrapper`.
  Wraps the index route with `CrdLayoutWrapper`. The two delegated MUI subroutes do NOT wrap with `CrdLayoutWrapper` (they bring their own MUI layout).
- [X] T047 [US3] Modify `src/main/routing/TopLevelRoutes.tsx` — add the conditional block for the VC vertical: when `useCrdEnabled()` is true and the path matches `/vc/*`, lazy-load `CrdVCRoutes`; otherwise lazy-load the existing `VCRoute`. Preserve the existing wrapper exactly (research §1 — anonymous viewers can load if VC has public Read).

### i18n keys (VC profile)

- [X] T048 [US3] Add VC-profile i18n keys to `src/crd/i18n/profilePages/profilePages.en.json` under `vcProfile.*`. Keys to cover (CRD-namespace, new): hero (`settingsTooltip`), sidebar (`descriptionTitle`, `hostTitle`), right column (`modelCardTitle`, `aiEngineLabel`, `promptsLabel`, `promptsPersonaLabel`, `promptsConstraintsLabel`, `dataPrivacyLabel`, `socialLinksTitle`, `socialLinksEmpty`). **Parity reuses (FR-102) — do NOT add CRD-namespace duplicates; the mapper resolves them from the global `translation` namespace and forwards via the `labels` arg**: `components.profile.fields.references.title` (referencesTitle), `common.no-references` (referencesEmpty), `components.profile.fields.bodyOfKnowledge.title` (bodyOfKnowledgeTitle), `components.profile.fields.bodyOfKnowledge.privateBokTooltip` (bodyOfKnowledgePrivateTooltip), `buttons.visit` (bodyOfKnowledgeVisitButton), `components.profile.fields.bodyOfKnowledge.spaceBokDescription` interpolating `{vcName}` (bodyOfKnowledgeSpaceContextDescription), `components.profile.fields.engines.externalVCDescription` interpolating `{engineName}` from `components.profile.fields.engines.externalAssistant` / `components.profile.fields.engines.external` (bodyOfKnowledgeExternalAssistantDescription / bodyOfKnowledgeExternalOtherDescription), `components.card.privacy.private` interpolating `{ entity: 'space' }` (privateSpaceLabel), `virtualContributorSpaceSettings.placeholder` (KB description fallback). Document each reuse in a comment in `vcProfileMapper.ts`.
- [X] T049 [P] [US3] Translate all VC-profile keys added in T048 into the five non-English language files under `src/crd/i18n/profilePages/`.

**Checkpoint**: VC profile page is fully functional under CRD-on; MUI page renders unchanged under CRD-off. All three BoK variants render correctly; 404 and Restricted-redirect parity preserved.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation, bundle-size verification, lint/test gates, and the per-actor smoke checklist from `quickstart.md`.

- [X] T050 [P] Run `pnpm lint` at the repo root and resolve any TypeScript / Biome / ESLint errors in the new files.
- [X] T051 [P] Run `pnpm vitest run` and ensure all new tests pass alongside the existing suite (target completion ~9 s per CLAUDE.md).
- [X] T052 Run `pnpm analyze` and verify the combined gzipped bundle delta across the three new lazy-loaded chunks (User profile + Organization profile + VC profile) does NOT exceed +35 KB over the prior build (SC-005). Log the chunk sizes in this task's notes for the PR description.
- [ ] T052a [P] Add an automated cross-actor route smoke test at `src/main/routing/__tests__/crdProfileRoutes.test.tsx` per SC-002: with the CRD toggle ON, mount each of `/user/<seed-slug>`, `/organization/<seed-slug>`, `/vc/<seed-slug>` against a `MockedProvider` (Apollo) feeding the minimal seeded fixtures from the three mappers' tests, and assert each page's `Crd<Actor>ProfilePage` chunk loads without throwing. Reuses the fixtures emitted by T012 / T026 / T038.
- [ ] T052b [P] Add an automated CRD-off route smoke test at `src/main/routing/__tests__/crdToggleOff.test.tsx` per SC-007: with the CRD toggle OFF (`localStorage` unset / set to `'false'`), mount each of `/user/<seed-slug>`, `/organization/<seed-slug>`, `/vc/<seed-slug>` against a `MockedProvider` and assert that the existing MUI page module is the one that loads (assert by querying for an MUI-only test-id or by inspecting the lazy-import path), confirming the toggle-off branch in `TopLevelRoutes.tsx` is wired correctly for all three actors.
- [ ] T053 Execute the manual smoke checklist in `specs/096-crd-user-pages/quickstart.md` end-to-end (User profile / Organization profile / VC profile / Authorization / Toggle blocks) against `localhost:3001`. Record any deviations as bug tasks before merge.
- [ ] T054 Run an axe / Lighthouse accessibility pass on each of the three CRD profile pages. Fix any critical or serious violations (SC-004; FR-110).
- [ ] T055 Verify the parity matrix per actor (SC-006) with seeded test fixtures: User 0 / 1 / 50+ memberships across L0/L1/L2; Organization 0 / 1 / 50+ memberships, account resources present and absent, verified and unverified; VC each of the three BoK variants.

---

## Phase 7: Standalone preview demo pages (`src/crd/app/`)

**Purpose**: Surface the four new profile component compositions in the standalone CRD preview app (`pnpm crd:dev` → `localhost:5200`) so designers can iterate on visual treatment without running the full Alkemio backend. Pure mock data — no GraphQL, no Apollo.

- [X] T060 Create mock data file at `src/crd/app/data/profiles.ts` exporting `MOCK_ME_USER`, `MOCK_ALEX_RIVERA`, `MOCK_ORG_ALKEMIO`, `MOCK_VC_DATASYNTH`. Pull Alex Rivera mock data verbatim from `prototype/src/app/pages/UserProfilePage.tsx` (name, avatar, bio, organizations, hosted spaces, VCs, leading + member spaces). Compose Org and VC mock data shaped to match the new CRD view-prop types. All shapes are plain TypeScript — no GraphQL types, no integration imports.
- [X] T061 [P] Demo page `src/crd/app/pages/UserProfileSelfDemoPage.tsx` — viewing your OWN profile (`MOCK_ME_USER`). Settings icon visible, Message button hidden (FR-011 / FR-012 self-view).
- [X] T062 [P] Demo page `src/crd/app/pages/UserProfileOtherDemoPage.tsx` — viewing ANOTHER user's profile (`MOCK_ALEX_RIVERA`). Message button visible with a fake `onSendMessage` that resolves after 500 ms so the `aria-busy` spinner state is observable.
- [X] T063 [P] Demo page `src/crd/app/pages/OrganizationProfileDemoPage.tsx` — Org profile (`MOCK_ORG_ALKEMIO`). Verified badge, Settings (admin viewer), Message popover, 14 associates (exercises 12-cap + Show more / less), 4 hosted spaces + 2 packs + 1 hub (exercises Account Resources composition).
- [X] T064 [P] Demo page `src/crd/app/pages/VCProfileDemoPage.tsx` — VC profile (`MOCK_VC_DATASYNTH`). NO Message button (FR-030). Body of Knowledge in the `space` variant. Right column shows the model card + social links section.
- [X] T065 Wire the four demo routes in `src/crd/app/CrdApp.tsx` — `/user/me`, `/user/alex-rivera`, `/organization/alkemio`, `/vc/datasynth-bot`.
- [X] T066 Register the `crd-profilePages` namespace in the standalone app's `src/crd/app/main.tsx` `i18n.init()` (eager-loaded English JSON only — same pattern as the other CRD namespaces in this file).

**Verification:** `pnpm crd:dev`, navigate to each of the four URLs above, confirm the per-viewer matrix (Settings vs. Message visibility), the BoK section, and the Verified badge render as expected.

---

## Phase 8: Shared `SocialLinks` primitive (FR-023 / FR-034 — refinement)

**Purpose**: Replace the per-consumer social-link rendering loops (which fall back to lucide's `Link2` / `Globe` because lucide dropped brand icons) with a single shared primitive backed by co-located monochrome SVG assets. Eliminates the per-mapper `splitReferences` / `brandFor` helpers and the `SocialReferenceItem` type, collapsing three duplicated loops into one. Icons render in `text-muted-foreground` — a deliberate departure from MUI's brand-color treatment so the row reads as a unified strip.

**Why a separate phase**: the original specs assumed lucide's brand icons would be the source. After implementation, that assumption changed (lucide removed them; FR-023 / FR-034 noted the `Link2` workaround as tech debt). This phase pays off the debt with a proper primitive — the primitive itself is small but it touches three consumers + two mappers + the demo data, so it's grouped here rather than smeared across Phases 3–7.

- [ ] T067 Implement the `SocialLinks` primitive at `src/crd/components/common/SocialLinks.tsx` and the six co-located SVG assets at `src/crd/components/common/icons/social/{Globe,LinkedIn,GitHub,BlueSky,YouTube,Mail}.svg`. SVGs are imported via `vite-plugin-svgr`'s `?react` query (already used elsewhere in the repo — see `src/crd/components/space/timeline/icons/CrdAddToCalendarIcons.tsx` for precedent) so the parent's `text-muted-foreground` flows in via `currentColor`. The component:
  - Accepts `references: SocialLinksReference[]` (a structural subset of `ReferenceLink`: `{ id; name; uri }`) plus optional `className`.
  - Filters internally via `isSocialReference(ref)` (`ref.name.toLowerCase()` matches one of `website` / `linkedin` / `github` / `bsky` / `youtube` / `email`).
  - Brand-resolves internally: `name.toLowerCase()` → SVG component, with the `Globe` SVG as the `generic` fallback for any social ref whose name doesn't match a known brand.
  - Sorts via the order in MUI's `SocialNetworkEnum` (website → linkedin → github → bsky → youtube → email).
  - Prepends `mailto:` to email URIs that don't already start with it (parity with MUI `SocialLinks.getSocialLinkUrl`).
  - Renders each link as an `<a target="_blank" rel="noreferrer" aria-label={ref.name} title={ref.name}>` with a `size-5` icon, `text-muted-foreground` default, `hover:text-foreground transition-colors`.
  - Returns `null` when the filtered list is empty (so the consumer's `{hasSocial ? ... : null}` guard becomes redundant — the consumer can render `<SocialLinks references={refs} />` unconditionally).
  - Also exports `excludeSocialReferences(refs: SocialLinksReference[]): SocialLinksReference[]` — the inverse helper used by the parallel non-social References sections on the Org and VC sidebars.

- [ ] T068 Refactor consumers to use the new primitive. All file edits in one task because the type-level contract change (`SocialReferenceItem` removal) cascades:
  - `src/crd/components/user/UserProfileSidebar.tsx` — drop the local `brandIcon` helper, the `SocialReferenceItem` import, the `socialReferences` prop, and the social `<section>`. Replace with: accept `references: ReferenceLink[]`, render `<SocialLinks references={references} />` in the social section. The `socialLinksTitle` label still drives the `<h2>`.
  - `src/crd/components/organization/OrganizationProfileSidebar.tsx` — drop the `SocialReferenceItem` type export, the `brandIcon` helper, the `socialReferences` prop, and the social `<section>` loop. Accept `references: ReferenceLink[]` (replacing the previous separate `references` + `socialReferences` props). Render the non-social References section via `excludeSocialReferences(references)`; render the Social section via `<SocialLinks references={references} />`.
  - `src/crd/components/virtualContributor/VCContentView.tsx` — drop the local `SocialReferenceItem` type, the `brandIcon` helper, and the `socialReferences` prop. Accept `references: ReferenceLink[]`. Replace the social-links loop with `<SocialLinks references={references} />`. The `socialLinksTitle` and `socialLinksEmpty` labels still drive the section header / empty-state copy (the empty-state line stays in the view, since `<SocialLinks>` itself returns `null` when empty).
  - `src/main/crdPages/topLevelPages/organizationPages/publicProfile/organizationProfileMapper.ts` — delete `splitReferences` and `brandFor`. Pass `provided.references` straight through to `view.sidebar.references`. Remove the `SocialReferenceItem` import.
  - `src/main/crdPages/topLevelPages/organizationPages/publicProfile/CrdOrganizationProfilePage.tsx` — drop the `splitReferences` call and the `socialReferences` prop wiring; pass `provided.references` straight through.
  - `src/main/crdPages/topLevelPages/vcPages/publicProfile/vcProfileMapper.ts` — delete `splitVcReferences` and the `brandFor`-equivalent. Drop the `isSocialNetworkSupported` import (no longer used in this file). Pass `vc.profile.references` straight through to `view.contentView.references`. The non-social sidebar References still need filtering — use `excludeSocialReferences(vc.profile.references)` from the new primitive.
  - `src/main/crdPages/topLevelPages/vcPages/publicProfile/CrdVCProfilePage.tsx` — same pattern: drop the split, pass refs through.
  - `src/crd/app/data/profiles.ts` — replace each `socialReferences: [...]` block with a `references: [...]` block holding raw `ReferenceLink`-shape entries (`{ id, name: 'linkedin' | 'github' | …, uri, description: null }`); the demo pages render the same way as production data.
  - `src/crd/app/pages/{UserProfileSelfDemoPage,UserProfileOtherDemoPage,OrganizationProfileDemoPage,VCProfileDemoPage}.tsx` — drop the `socialReferences` prop wiring; pass `references` straight through.

**Verification:** `pnpm lint` clean; `pnpm vitest run` green; `pnpm crd:dev` shows the four demo pages with monochrome social icons in `text-muted-foreground`, hover state going to `text-foreground`, email link opening with `mailto:` prefix.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 only — environment sanity check.
- **Foundational (Phase 2)**: T002–T010 — i18n namespace, shared `CompactContributorCard` primitive, shared `useSendMessageHandler`, User-vertical helpers (`useUserPageRouteContext`, `useCanEditSettings`). MUST complete before user-story phases land.
- **User Stories (Phases 3–5)**: All depend on Foundational. Once Foundational is done, all three stories can proceed in parallel.
- **Polish (Phase 6)**: Depends on all three user stories completing.

### User Story Dependencies

- **US1 (User profile)**: Depends only on Foundational (specifically T002–T009). Independent of US2 and US3 except for the shared `TopLevelRoutes.tsx` file (each story modifies a distinct conditional block — sequential edits to the same file but no logical cross-dependency).
- **US2 (Organization profile)**: Depends on Foundational. Reuses `useSendMessageHandler` (T007), `CompactContributorCard` (T006), and the shared `MessagePopover` (T006a — placed in `src/crd/components/common/` from day one per the Q2 decision; consumed by both User and Org heroes).
- **US3 (VC profile)**: Depends on Foundational. Reuses `CompactContributorCard` (T006). Independent of US1 and US2 otherwise.

### Within Each User Story

- Mapper (and its test) before the integration page. Within US3, the BoK resolver hook (T037) before the mapper consumes it.
- Presentational components are independent (different files) and can be built in parallel — they are pure props consumers.
- The composing view (`*PublicProfileView`) depends on all sub-components.
- The integration page (`Crd*ProfilePage`) depends on the mapper + the view + the route helpers + the hooks.
- Routing wiring (`Crd*Routes`) depends on the integration page.
- `TopLevelRoutes.tsx` modification depends on the routes file.

### Parallel Opportunities

**Foundational (Phase 2):**

- T003, T005, T006, T007, T008, T009, T010 — all marked [P]. Languages, primitive, handlers, route helpers — all independent files.

**Within US1:**

- T011 (mapper), T012 (mapper test) — different files; can run in parallel after foundation.
- T014, T016, T017, T018 — all four presentational components are independent files (T006a — `MessagePopover` — lives in Phase 2 and is consumed by T014).

**Within US2:**

- T025 (mapper), T026 (mapper test), T026a (Org hero visibility test) — different files.
- T027, T028, T029 — three presentational components are independent files.

**Within US3:**

- T036 (mapper), T037 (BoK hook), T038 (mapper test), T038a (VC hero visibility test) — different files.
- T039, T040, T041 (BoK render test), T042, T043 — five presentational components + one test, all independent files.

**Across user stories (after Foundational):**

- US1, US2, US3 phases can be developed in parallel by different team members. The only sequential step is each story modifying its own conditional block in `TopLevelRoutes.tsx` (T022 / T033 / T047) — coordinate the file edit order to avoid merge conflicts, but the logical edits are independent.

**Polish (Phase 6):**

- T050 (lint), T051 (tests), T052a (automated route smoke), and T052b (CRD-off route smoke) can run in parallel (different processes / different test files). T052a + T052b depend on the routes wiring (T022, T033, T047) being landed.

---

## Parallel Example: Foundational Phase

```bash
# Once T002 + T004 (the namespace anchors) are done, the rest of Phase 2 can run in parallel:
Task: "T003 [P] Create five non-English language file placeholders in src/crd/i18n/profilePages/"
Task: "T005 [P] Add Vitest key-parity assertion at src/crd/i18n/profilePages/__tests__/keyParity.test.ts"
Task: "T006 [P] Implement CompactContributorCard at src/crd/components/common/CompactContributorCard.tsx"
Task: "T007 [P] Implement useSendMessageHandler at src/main/crdPages/topLevelPages/common/useSendMessageHandler.ts"
Task: "T008 [P] Implement useUserPageRouteContext at src/main/crdPages/topLevelPages/userPages/useUserPageRouteContext.ts"
Task: "T009 [P] Implement useCanEditSettings at src/main/crdPages/topLevelPages/userPages/useCanEditSettings.ts"
Task: "T010 [P] Add useCanEditSettings Vitest unit test at src/main/crdPages/topLevelPages/userPages/__tests__/useCanEditSettings.test.ts"
```

## Parallel Example: User Story 1 — Presentational Components

```bash
# Once T011 (mapper) and T013 (useResourceTabs) are done, the five presentational components can be built in parallel:
Task: "T014 [P] [US1] Implement UserPageHero at src/crd/components/user/UserPageHero.tsx"
Task: "T006a [P] Implement MessagePopover at src/crd/components/common/MessagePopover.tsx (shared by User + Org heroes)"
Task: "T016 [P] [US1] Implement UserResourceTabStrip at src/crd/components/user/UserResourceTabStrip.tsx"
Task: "T017 [P] [US1] Implement UserResourceSections at src/crd/components/user/UserResourceSections.tsx"
Task: "T018 [P] [US1] Implement UserProfileSidebar at src/crd/components/user/UserProfileSidebar.tsx"
```

## Parallel Example: Three User Stories at Once

```bash
# Once Foundational is done, three engineers can pick up one user-story phase each:
Engineer A: T011..T024  (Phase 3 — User Story 1)
Engineer B: T025..T035  (Phase 4 — User Story 2)
Engineer C: T036..T049  (Phase 5 — User Story 3)
# Coordinate the TopLevelRoutes.tsx edits (T022 / T033 / T047) so they merge cleanly.
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 2: Foundational (T002–T010). **CRITICAL — blocks all stories.**
3. Complete Phase 3: User Story 1 (T011–T024).
4. **STOP and VALIDATE**: Run the User profile portion of the smoke checklist; confirm spec.md User Story 1 acceptance scenarios 1–8 pass; confirm CRD-off renders the existing MUI page.
5. Demo the User profile in CRD. Hold US2 and US3 for the next iteration if scope pressure mounts.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add US1 (User profile) → smoke pass → demo (MVP).
3. Add US2 (Organization profile) → smoke pass → demo.
4. Add US3 (VC profile) → smoke pass → demo.
5. Polish (Phase 6).

### Parallel Team Strategy

With three developers:

1. Team completes Setup + Foundational together (or one developer leads it while others read the spec).
2. Once Foundational is done:
   - Developer A: User Story 1 (T011–T024).
   - Developer B: User Story 2 (T025–T035).
   - Developer C: User Story 3 (T036–T049).
3. Coordinate `TopLevelRoutes.tsx` edits (T022 / T033 / T047) — assign a merge order or merge into a shared integration branch.
4. Polish phase runs after all three stories merge.

### Ship Coupling (with sibling spec 097-crd-user-settings)

- This spec ships together with sibling spec `097-crd-user-settings` as one user-vertical release (per spec.md "Coupling" note and research §10).
- The `TopLevelRoutes.tsx` User-vertical block (T022) plumbs the settings subtree through to `CrdUserAdminRoutes` (097). Coordinate landing order: T022 lands first as a placeholder that falls back to MUI for `/user/:userSlug/settings/*`; once 097 lands, the placeholder is replaced with the real `CrdUserAdminRoutes` import.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks.
- [Story] label maps each user-story task to its phase for traceability.
- All three user stories are P1 and ship together. The MVP-first strategy above is a fallback if scope pressure forces a partial release; the spec's stated intent is to ship all three with sibling spec 097.
- Tests included: per-mapper Vitest unit tests, BoK render test, useCanEditSettings predicate test, i18n key-parity test (research §9).
- No new Apollo queries / mutations / GraphQL types — every data hook in `data-model.md` already exists and is reused unchanged.
- The existing MUI files under `src/domain/community/{user,organization,virtualContributor}/` MUST stay in place per FR-002 / FR-004 — no deletion until the global CRD toggle is removed in a future spec.
- Commit boundaries: one commit per task (or one commit per logical group within a story). Per CLAUDE.md, all commits must be signed.
- Avoid: adding `useMemo` / `useCallback` / `React.memo` (React Compiler handles memoization); adding `@mui/*` or `@emotion/*` imports under `src/crd/`; importing generated GraphQL types into views.
