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

- [X] T011 [P] [US1] Implement `publicProfileMapper.ts` at `src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.ts` — pure function mapping the User-vertical Apollo data (`useUserProvider`, `useUserAccountQuery`, `useUserContributions`, `useUserOrganizationIds`, `useFilteredMemberships`) to `UserPublicProfileViewProps` per `contracts/publicProfile.ts` and `data-model.md`. Includes the tab→section filter (data-model.md table) and the `canEditSettings`/`isOwn` computation (the predicate value comes from `useCanEditSettings`). The mapper itself is pure; i18n labels are passed in as a `labels` arg from the integration page. **Filter input for "Spaces Leading"**: pass `[RoleType.Lead, RoleType.Admin]` to `useFilteredMemberships` — exact parity with current MUI `UserProfilePageView.tsx:34`. **(SUPERSEDED by Phase 9 T071 — innovation packs and innovation hubs are NOW included as Template Packs and Custom Homepages sub-sections under Resources Hosted; the original "MUST be dropped" rule was reversed when the User profile moved from a 5-tab to a 3-tab layout. The mapper output now includes `hostedInnovationPacks` and `hostedInnovationHubs` per data-model.md `PublicProfileResources`.)** **MUST produce per-region `loading` flags** (Q3 — `loading.hero` ← `useUserProvider.loading`, `loading.organizations` ← `userId !== undefined && organizationIds === undefined` (Q-D heuristic; `useUserOrganizationIds` swallows the loading flag), `loading.hostedResources` ← `useUserAccountQuery.loading`, `loading.memberships` ← `userId !== undefined && contributions === undefined` (same heuristic; `useUserContributions` swallows the loading flag)) per the data-model.md "Query → region" table. **MUST compose the User Organizations list as `CompactContributorCardItem[]`** with `caption = role` and `secondaryCaption = i18n-resolved member-count line` (Q1). **MUST surface the user's reserved profile tagsets** (FR-010a): resolve `Keywords` and `Skills` from `userModel.profile.tagsets[]` via `TagsetReservedName.Keywords` / `TagsetReservedName.Skills` (case-insensitive name match, parity with MUI `UserProfileView.tsx:30,33`), build `TagsetGroup[]` via `buildTagsetGroups([{ name, tags }, …])` (reused from `organizationProfileMapper.ts`) so empty entries drop per-entry, and pass through to the sidebar.
- [X] T012 [P] [US1] Add a Vitest unit test at `src/main/crdPages/topLevelPages/userPages/publicProfile/__tests__/publicProfileMapper.test.ts` covering `buildUserProfileTagsets` (undefined / empty / case-insensitive lookup / i18n-resolved labels) and `mapHostedSpacesToCardData` (null & undefined input, missing collections, missing `about.profile` skipped, banner/tagline mapping, `isPrivate` 3-state semantics on `isContentPublic`, deterministic `pickColorFromId` accent, VC mapping with `vcType` label, dropping null profiles, innovation packs / hubs mapping including avatar fallback). NOTE: the original 5-tab filter scope is superseded by the 3-tab strip + `useResourceTabs` hook (Phase 9) — tab filtering now lives in the view, not the mapper.

### Active-tab state hook

- [X] T013 [US1] Implement `useResourceTabs` at `src/main/crdPages/topLevelPages/userPages/publicProfile/useResourceTabs.ts` — local React state (`useState<ResourceTabKey>('allResources')`) per FR-013 (NOT URL-synced); exposes `{ activeTab, onSelectTab }`. No URL search param sync; reload always lands on `allResources`.

### Presentational components (parallelizable — independent files)

- [X] T014 [P] [US1] Implement `UserPageHero` at `src/crd/components/user/UserPageHero.tsx` per `UserPageHeroProps` in `contracts/publicProfile.ts`. Pure presentational: avatar, display name, location line. **No** presence dot. Settings icon button visible when `showSettingsIcon === true`; Message button visible when `showMessageButton === true`. Click handlers received as props (no internal navigation per `src/crd/CLAUDE.md`). Consumes the shared `MessagePopover` from T006a (`src/crd/components/common/MessagePopover.tsx`) — does NOT define its own popover.
- [ ] T014a [P] [US1] Add a Vitest render test at `src/crd/components/user/__tests__/UserPageHero.test.tsx` covering the per-viewer visibility matrix per SC-003: anonymous viewer (Settings hidden, Message hidden), profile owner (Settings visible, Message hidden), non-admin viewer on someone else's profile (Settings hidden, Message visible), platform admin on someone else's profile (BOTH Settings AND Message visible). **MUST also assert** (Q5 — Cv1) that the Send button inside `MessagePopover` exposes `aria-busy="true"` while the `onSendMessage` promise is pending and `aria-busy="false"` after it resolves — covers FR-110.
- [X] T016 [P] [US1] Implement `UserResourceTabStrip` at `src/crd/components/user/UserResourceTabStrip.tsx` per `UserResourceTabStripProps` in `contracts/publicProfile.ts`. Sticky position. Below `md`: `overflow-x-auto no-scrollbar`; all 5 tabs remain inline; the active tab auto-scrolls into view on mount and on tab change (FR-013 clarification). Keyboard-navigable per FR-111 — Tab into strip, Left/Right arrows, Enter to activate (use the existing CRD `tabs` primitive or replicate its keyboard pattern).
- [ ] T016a [P] [US1] Add a Vitest keyboard-navigation test for `UserResourceTabStrip` at `src/crd/components/user/__tests__/UserResourceTabStrip.test.tsx` (Q5 — Cv2). Asserts: Tab focuses the active tab; Left/Right arrows move focus AND activate the tab (calling `onSelectTab`); Enter on a focused tab activates it. Covers FR-111 explicitly so a regression is caught by tests, not only by axe.
- [X] T017 [P] [US1] Implement `UserResourceSections` at `src/crd/components/user/UserResourceSections.tsx` per `UserResourceSectionsProps` in `contracts/publicProfile.ts`. Switches on `activeTab` to render Resources Hosted (with sub-sections on `allResources`; sub-section headers hidden on single-slice tabs per FR-013) / Spaces Leading / Member Of. Sections with empty data are omitted (FR-015) — except the empty-state caption rule for "No memberships yet" when applicable.
- [X] T018 [P] [US1] Implement `UserProfileSidebar` at `src/crd/components/user/UserProfileSidebar.tsx` per `UserProfileSidebarProps` in `contracts/publicProfile.ts`. Stacked CRD card sections in this order: **About** (bio rendered via existing CRD `MarkdownContent`) → **Tagsets** (FR-010a — accepts `tagsets: TagsetGroup[]`; renders each entry as a `text-label` uppercase header followed by a `Badge` row of tag pills, mirroring the rendering in `OrganizationProfileSidebar`; the entire block is hidden when `tagsets.length === 0`) → **Social** (existing `<SocialLinks>` block, hidden when there are no social references) → **Organizations** list (rendered as a stack of `CompactContributorCard` instances from T006 in the `compact` variant — `caption = role` label, `secondaryCaption = member-count line` per the Q1 decision; one primitive serves three sites — User Orgs, Org Associates, VC Host). No inline fallback component.
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

- [X] T025 [P] [US2] Implement `organizationProfileMapper.ts` at `src/main/crdPages/topLevelPages/organizationPages/publicProfile/organizationProfileMapper.ts` — pure function mapping `useOrganizationProvider` data + `useOrganizationAccountQuery` + `useAccountResources` + `useFilteredMemberships(contributions, [RoleType.Lead])` to `OrganizationPublicProfileViewProps` per `contracts/organizationProfile.ts` and `data-model.md`. **Filter input is `[RoleType.Lead]` only** — no Admin (current MUI `OrganizationPageView.tsx:62` parity). Implements the section-omission rules (Account Resources omitted when all three lists are empty; Lead Spaces omitted when empty; All Memberships always rendered) per FR-024. Computes `verified = organization.verification.status === VerifiedManualAttestation` and `settingsUrl = canEdit ? buildSettingsUrl(profile.url) : null`. Filters references via `isSocialNetworkSupported` (only the "other" group goes in the sidebar — same predicate file used by VC mapper). **MUST produce per-region `loading` flags** (Q3 — `loading.hero` ← `useOrganizationProvider.loading`, `loading.sidebar` ← same, `loading.accountResources` ← `useOrganizationAccountQuery.loading`, `loading.memberships` ← `useFilteredMemberships`'s underlying contributions loading). **MUST map every Associate to an `AssociateGridItem`** (`{ id, displayName, avatarImageUrl, url }`) — NOT to `CompactContributorCardItem` (parity with current MUI `AssociatesView` which uses `ContributorCardSquare`). Mapper passes ALL associates regardless of `canReadUsers`; the view branches on `canReadUsers` (sign-in CTA vs. avatar grid). Mapper passes ALL spaces with no truncation — per FR-016 the legacy `VISIBLE_SPACE_LIMIT = 6` cap and "Show all" affordance were dropped; the view renders every item.
- [X] T026 [P] [US2] Add a Vitest unit test at `src/main/crdPages/topLevelPages/organizationPages/publicProfile/__tests__/organizationProfileMapper.test.ts` covering `mapAssociates` (avatar → avatarImageUrl rename + null fallback + order preservation) and `mapOrgHostedResources` (null / undefined / empty input, missing `about.profile` skipped, banner/tagline mapping, `isPrivate` semantics on `isContentPublic === false`, deterministic accent colour, VC mapping with `vcType`, dropping null profiles, innovation packs / hubs shape). Mapper passes ALL spaces with no truncation (per FR-016 the legacy 6-cap was dropped).
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

- [X] T036 [P] [US3] Implement `vcProfileMapper.ts` at `src/main/crdPages/topLevelPages/vcPages/publicProfile/vcProfileMapper.ts` — pure function mapping `useVirtualContributorProfileWithModelCardQuery` + `useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery` + `useSpaceBodyOfKnowledgeAboutQuery` + `useKnowledgeBase` data to `VCPublicProfileViewProps` per `contracts/vcProfile.ts` and `data-model.md`. Implements the BoK discriminated-union resolver (research §4) — produces one of `{ kind: 'space', ... }`, `{ kind: 'knowledgeBase', ... }`, `{ kind: 'external', description: string }` (the resolved `description` shape — earlier drafts of this task said `engineLabel: 'assistant' | 'other'`; that was inverted in implementation per contracts/vcProfile.ts so the integration layer owns translation resolution per FR-005), or `null` when no BoK applies (`bodyOfKnowledgeType` unset AND `modelCard.aiEngine.isExternal === false`; the view omits the section entirely per FR-033). **(EXTENDED by Phase 11 — the mapper additionally produces the redesigned `VCContentViewProps` shape: Functionality / AI Engine / Monitoring section data, plus hero `typeBadgeLabel` + `keywords[]`. See T090.)** **For `kind: 'space'` when `hasReadAccess === false`** (Q7), produce a placeholder `spaceProfile` with `displayName = t('components.card.privacy.private', { entity: 'space' })`, empty `url`, empty `id`, `null` avatar, and `level: 'L0'` — matching current MUI `defaultProfile`. The view renders the same SpaceCard for both private and public cases. **For `kind: 'knowledgeBase'`**, resolve `description = useKnowledgeBase().knowledgeBaseDescription || t('virtualContributorSpaceSettings.placeholder')` — exact parity with current MUI `VCProfilePageView.tsx:126`. The mapper receives `t` from the integration page (or composes the description in the integration page and passes the resolved string). **(SUPERSEDED by Phase 11 T084 — the social/non-social split is removed; ALL references go to the sidebar as a flat list per FR-032. The `lucide-react` brand-key mapping is also removed since the redesigned right column no longer surfaces social references.)** Computes `hasUpdatePrivilege` from `vc.authorization.myPrivileges` and `settingsUrl = hasUpdatePrivilege ? buildSettingsUrl(profile.url) : null`. **MUST produce per-region `loading` flags** (Q3 — `loading.hero` / `loading.sidebar` / `loading.contentView` ← `useVirtualContributorProfileWithModelCardQuery.loading`; `loading.bodyOfKnowledge` ← combined loading of the BoK auxiliary queries: `useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery` + `useSpaceBodyOfKnowledgeAboutQuery` for space-backed, `useKnowledgeBase` for KB-backed, `false` for external). **MUST map the VC's provider profile to a `CompactContributorCardItem`** with `caption = null` and `secondaryCaption = null` unless current MUI surfaces a role/caption (Q1).
- [X] T037 [P] [US3] Implement `useVCBodyOfKnowledge` at `src/main/crdPages/topLevelPages/vcPages/publicProfile/useVCBodyOfKnowledge.ts` — wraps the auxiliary BoK queries (`useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery`, `useSpaceBodyOfKnowledgeAboutQuery`, `useKnowledgeBase`) and exposes `{ bodyOfKnowledge, loading }` ready to feed into the mapper.
- [X] T038 [P] [US3] Add a Vitest unit test at `src/main/crdPages/topLevelPages/vcPages/publicProfile/__tests__/vcProfileMapper.test.ts` covering `resolveBodyOfKnowledge` (all four kinds: null / AlkemioSpace / AlkemioKnowledgeBase / external, with and without `hasReadAccess`, fallback IDs, deterministic colour, description fallback to placeholder), `mapVcReferences` (FR-032 flat passthrough — no social/non-social split per VC redesign), `mapHostCard` (null cases + happy path), `computeSettingsHref` (4 negative branches + happy path), and `extractVcKeywords` (case-insensitive matching, empty fallbacks). Companion test `vcContentViewMapper.test.ts` covers the redesigned VC functionality / AI-engine grids (FR-034). NOTE: the social/non-social references split was retired in the VC redesign — VC sidebar now passes references through flat.
- [ ] T038a [P] [US3] Add a Vitest render test at `src/crd/components/virtualContributor/__tests__/VCPageHero.test.tsx` covering the per-viewer visibility matrix per SC-003: anonymous viewer (Settings hidden), signed-in non-owner without `Update` privilege (Settings hidden), VC owner with `Update` privilege (`settingsUrl !== null` → Settings visible). Asserts the absence of any Message button across all scenarios per FR-030. (Q5 — Cv1: VC has no Send/Message button, so `aria-busy` assertions live in the Org and User hero tests instead — see T026a; the User hero already covers it via the Send button render path through `MessagePopover` + `useSendMessageHandler`.)

### Presentational components (parallelizable)

- [X] T039 [P] [US3] Implement `VCPageHero` at `src/crd/components/virtualContributor/VCPageHero.tsx` per `VCPageHeroProps` in `contracts/vcProfile.ts`. Avatar, display name. Settings icon visible when `settingsUrl !== null`. **NO Message button** (FR-030 — the props interface intentionally omits `onSendMessage`). **(EXTENDED by Phase 11 T082 — the hero gains a "Virtual Contributor" type badge next to the name and an outlined-Badge chip row sourced from the VC's reserved Keywords tagset; chip row is omitted entirely when the tagset is missing or empty per FR-030.)**
- [X] T040 [P] [US3] Implement `VCBodyOfKnowledgeSection` at `src/crd/components/virtualContributor/VCBodyOfKnowledgeSection.tsx` per `VCBodyOfKnowledgeSectionProps` in `contracts/vcProfile.ts`. When the `bodyOfKnowledge` prop is `null`, the component MUST return `null` (section omitted entirely per FR-033 — no header, no empty-state). Otherwise switches on `bodyOfKnowledge.kind`: `space` → SpaceCardHorizontal-equivalent CRD card linking to the backing space (or "Private space" placeholder when `hasReadAccess === false`); `knowledgeBase` → description + Visit button (disabled with `Tooltip` "Body of knowledge is private" when `hasReadAccess === false`); `external` → renders the resolved `description: string` (the mapper has already picked the right engine-type copy via `vc.aiPersona.engine` → `externalAssistantDescription` vs. `externalGenericDescription`; the view does NOT branch on engine type).
- [ ] T041 [P] [US3] Add a Vitest render test at `src/crd/components/virtualContributor/__tests__/VCBodyOfKnowledgeSection.test.tsx` covering each `kind` variant (research §9): `space` renders the card / placeholder; `knowledgeBase` renders description + Visit button enabled or disabled per `hasReadAccess`; `external` renders the engine-type copy; **`null` returns nothing** (section fully omitted per FR-033).
- [X] T042 [P] [US3] Implement `VCProfileSidebar` at `src/crd/components/virtualContributor/VCProfileSidebar.tsx` per `VCProfileSidebarProps` in `contracts/vcProfile.ts`. Four sections: Description (markdown via existing CRD `MarkdownContent`), Host (renders `CompactContributorCard` from T006 in `compact` variant), References (labeled URL chips; empty-state line "No references" when empty), and `VCBodyOfKnowledgeSection` (T040). **(SUPERSEDED by Phase 11 T084 — the References section now renders ALL `vc.profile.references[]` entries as a flat URL-chip list, no social/non-social split per FR-032. Earlier drafts of this task said "non-social References"; the redesign removed that filter.)**
- [X] T043 [P] [US3] Implement `VCContentView` at `src/crd/components/virtualContributor/VCContentView.tsx` — initial pre-redesign shape: model card summary (`aiEngine`) + social links via the shared `SocialLinks` primitive. **(SUPERSEDED by Phase 11 T089 — the redesigned VCContentView composes three new sub-components (`VCFunctionalityGrid`, `VCAiEngineGrid`, `VCMonitoringSection`) per FR-034 and `contracts/vcProfile.ts`. The `ModelCardSummary` shape, the `prompts.*` / `dataPrivacy.*` props, the `references` prop, and the social-links section all go away. Phase 8's T068 VC bullets are also superseded — VC is no longer a `SocialLinks` consumer.)**
- [X] T044 [US3] Implement `VCPublicProfileView` at `src/crd/components/virtualContributor/VCPublicProfileView.tsx` per `VCPublicProfileViewProps` in `contracts/vcProfile.ts`. Composes the hero + sidebar + content view inside the CRD `PageLayout` and `TwoColumnLayout` shells (`col-span-3` sidebar / `col-span-9` right column on `md+`). **Renders Skeleton placeholders per region**, driven by the per-region `loading` shape (Q3 — `loading.hero`, `loading.sidebar`, `loading.bodyOfKnowledge`, `loading.contentView`); the BoK section unblocks independently from the rest of the sidebar (FR-009). **Hero skeleton MUST omit the location-line placeholder** — the VC hero has no location field per FR-030 (FR-009 explicitly excludes location from the VC hero skeleton). Schema: circular avatar + name line only. **(EXTENDED by Phase 11 T097 — hero skeleton additionally renders a type-badge pill placeholder + chip-row placeholder (3–5 short rounded rectangles for the Keywords tagset row); right-column skeleton renders three section blocks (Functionality 3-col grid, AI Engine 3-col grid of 6 transparency-card placeholders, Monitoring separator + paragraph) so the redesigned right column doesn't collapse into a single block while loading per FR-009.)**

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

- [X] T048 [US3] Add VC-profile i18n keys to `src/crd/i18n/profilePages/profilePages.en.json` under `vcProfile.*`. Keys to cover (CRD-namespace, new): hero (`settingsTooltip`), sidebar (`descriptionTitle`, `hostTitle`), right column (`modelCardTitle`, `aiEngineLabel`, `socialLinksTitle`, `socialLinksEmpty`). **(SUPERSEDED by Phase 11 T093 — the redesigned right column drops the model-card / prompts / dataPrivacy / socialLinks keys and adds the new `typeBadge`, `functionality.*` (heading, capabilities/dataAccess/roleRequirements with their nested labels), `aiEngine.*` (heading, engineName.{alkemio,assistant,external}, seeDocumentation, notAvailable, unknown, yes, no, plus six `cards.*` entries with `title` and `description` per card), and `monitoring.*` (heading, body containing `<a>` markup) keys per FR-100/FR-101 and `contracts/vcProfile.ts`.)** **Parity reuses (FR-102) — do NOT add CRD-namespace duplicates; the mapper resolves them from the global `translation` namespace and forwards via the `labels` arg**: `components.profile.fields.references.title` (referencesTitle), `common.no-references` (referencesEmpty), `components.profile.fields.bodyOfKnowledge.title` (bodyOfKnowledgeTitle), `components.profile.fields.bodyOfKnowledge.privateBokTooltip` (bodyOfKnowledgePrivateTooltip), `buttons.visit` (bodyOfKnowledgeVisitButton), `components.profile.fields.bodyOfKnowledge.spaceBokDescription` interpolating `{vcName}` (bodyOfKnowledgeSpaceContextDescription), `components.profile.fields.engines.externalVCDescription` interpolating `{engineName}` from `components.profile.fields.engines.externalAssistant` / `components.profile.fields.engines.external` (bodyOfKnowledgeExternalAssistantDescription / bodyOfKnowledgeExternalOtherDescription), `components.card.privacy.private` interpolating `{ entity: 'space' }` (privateSpaceLabel), `virtualContributorSpaceSettings.placeholder` (KB description fallback). Document each reuse in a comment in `vcProfileMapper.ts`.
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
- [X] T064 [P] Demo page `src/crd/app/pages/VCProfileDemoPage.tsx` — VC profile (`MOCK_VC_DATASYNTH`). NO Message button (FR-030). Body of Knowledge in the `space` variant. Right column shows the model card + social links section. **(SUPERSEDED by Phase 11 T096 — the demo page is rewritten to render the redesigned VCContentView (Functionality + AI Engine + Monitoring); the mock data in `MOCK_VC_DATASYNTH` is rebuilt to supply `modelCard.spaceUsage` / `modelCard.aiEngine` shapes, plus a hero `typeBadgeLabel` and a non-empty `keywords[]` array.)**
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
  - **(VC entries SUPERSEDED by Phase 11.)** The redesigned VC profile no longer renders a Social Links section in the right column at all (FR-034) and the sidebar References block renders ALL entries flat with no social/non-social split (FR-032). `VCContentView.tsx`, `vcProfileMapper.ts`, and `CrdVCProfilePage.tsx` are rebuilt in Phase 11 (T084 / T089 / T090) — they DO NOT consume `SocialLinks` or `excludeSocialReferences`. Skip the VC-specific bullets that appeared in earlier drafts of this task.
  - `src/main/crdPages/topLevelPages/organizationPages/publicProfile/organizationProfileMapper.ts` — delete `splitReferences` and `brandFor`. Pass `provided.references` straight through to `view.sidebar.references`. Remove the `SocialReferenceItem` import.
  - `src/main/crdPages/topLevelPages/organizationPages/publicProfile/CrdOrganizationProfilePage.tsx` — drop the `splitReferences` call and the `socialReferences` prop wiring; pass `provided.references` straight through.
  - `src/crd/app/data/profiles.ts` — replace each `socialReferences: [...]` block with a `references: [...]` block holding raw `ReferenceLink`-shape entries (`{ id, name: 'linkedin' | 'github' | …, uri, description: null }`); the demo pages render the same way as production data.
  - `src/crd/app/pages/{UserProfileSelfDemoPage,UserProfileOtherDemoPage,OrganizationProfileDemoPage,VCProfileDemoPage}.tsx` — drop the `socialReferences` prop wiring; pass `references` straight through.

**Verification:** `pnpm lint` clean; `pnpm vitest run` green; `pnpm crd:dev` shows the four demo pages with monochrome social icons in `text-muted-foreground`, hover state going to `text-foreground`, email link opening with `mailto:` prefix.

---

## Phase 9: User profile — 3-tab restructure + Template Packs / Custom Homepages (FR-013 / FR-016 — refinement)

**Purpose**: Collapse the 5-tab User profile resource strip down to 3 tabs (Resources Hosted / Leading / Member of) and add the two missing hosted-resource sub-sections — **Template Packs** (`account.innovationPacks`) and **Custom Homepages** (`account.innovationHubs`). The data is already in `useAccountResources`; the original mapper just dropped the latter two on the assumption (now reversed — see spec.md FR-013 + Out of Scope replacement) that the prototype omitted them. The 5-tab design with two single-slice tabs (Hosted Spaces / Virtual Contributors) was a reasonable choice when Resources Hosted contained two sub-sections; with four sub-sections, splitting each into its own tab no longer scales, so the meta-view collapses to a single Resources Hosted tab and the slice-tabs go away.

**Why a separate phase**: like Phase 8, the original spec's choice (5-tab strip, prototype-faithful resource list) was implemented and shipped before this refinement. The change touches the contract (`ResourceTabKey` shrinks from 5 → 3 elements; `PublicProfileResources` gains 2 fields), the mapper, the view, the i18n keys, and the demo data — grouping them in one phase makes the rollback boundary clean.

- [ ] T069 Update the contract types in `src/crd/components/user/UserResourceTabStrip.tsx`: shrink `ResourceTabKey` to `'resourcesHosted' | 'leading' | 'memberOf'`. Update `useResourceTabs.ts` default to `'resourcesHosted'`.

- [ ] T070 Refactor `src/crd/components/user/UserResourceSections.tsx`:
  - Drop the `'allResources' | 'hostedSpaces' | 'virtualContributors'` switch branches.
  - The Resources Hosted tab now renders FOUR sub-sections in order: Spaces → Virtual Contributors → Template Packs → Custom Homepages, each with its own `text-label` uppercase header. The parent "Resources Hosted" section header is suppressed (the tab label is the heading) — the entire section is a flat strip of sub-section blocks.
  - Each sub-section is omitted entirely when its list is empty (FR-015) — no header, no empty caption per slot.
  - Add new props `hostedInnovationPacks: SimpleResourceCardItem[]` and `hostedInnovationHubs: SimpleResourceCardItem[]`. Reuse the `SimpleResourceCardItem` type from `@/crd/components/organization/OrganizationResourceSections`.
  - Add new label fields: `templatePacks` (reused from `common.innovation-packs`), `customHomepages` (reused from `common.customHomepages`).
  - Drop label fields: `resourcesHosted`, `totalBadge` (the parent header + total badge are gone).
  - Render Template Packs sub-section with the lucide `Package` icon next to the header; render Custom Homepages with `LayoutDashboard`. Both use the same card visual treatment as the existing Virtual Contributors sub-section (icon-tile + name + description).

- [ ] T071 Update `src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.ts`:
  - In `mapHostedSpacesToCardData` (or its successor), include `hostedInnovationPacks` and `hostedInnovationHubs` in the returned shape, mapping from `accountResources.innovationPacks` and `accountResources.innovationHubs` (each entry → `{ id, displayName: profile.displayName, description: profile.tagline ?? null, href: profile.url, avatarImageUrl: profile.avatar?.uri ?? null }`).
  - Update any call site in `CrdUserProfilePage.tsx` to forward the two new fields to the view.

- [ ] T072 Update `src/main/crdPages/topLevelPages/userPages/publicProfile/CrdUserProfilePage.tsx`:
  - Tab definitions array drops the two removed entries; default active tab is `'resourcesHosted'`.
  - Wire the two new `hostedInnovationPacks` / `hostedInnovationHubs` props from the mapper through to `UserResourceSections`.
  - Drop the `totalBadge` and `resourcesHosted` label values.

- [ ] T073 i18n updates in `src/crd/i18n/profilePages/profilePages.<lang>.json` (all 6 languages):
  - Drop `userProfile.tabs.hostedSpaces` and `userProfile.tabs.virtualContributors`.
  - Rename `userProfile.tabs.allResources` → `userProfile.tabs.resourcesHosted` (English label "Resources Hosted").
  - Drop `userProfile.sections.resourcesHosted` and `userProfile.sections.totalBadge` (parent header + badge are gone).
  - Add label reuses (FR-102) — these are NOT new CRD-namespace keys. The mapper resolves them from the global `translation` namespace and forwards via the `labels` arg:
    - `templatePacks` ← `common.innovation-packs` (English: "Template Packs")
    - `customHomepages` ← `common.customHomepages` (English: "Custom Homepages")
  - Document the reuse in a comment in `publicProfileMapper.ts`.

- [ ] T074 Demo data + pages:
  - `src/crd/app/data/profiles.ts` — add 2-3 mock Template Packs and 1-2 mock Custom Homepages to `MOCK_ALEX_RIVERA` (and inherited by `MOCK_ME_USER`). Shape: `SimpleResourceCardItem`.
  - `src/crd/app/pages/{UserProfileSelfDemoPage,UserProfileOtherDemoPage}.tsx` — drop the `tabs` array entries for hostedSpaces / virtualContributors; pass the new `hostedInnovationPacks` / `hostedInnovationHubs` props; drop the `totalBadge` and `resourcesHosted` label values; default the local `useState` to `'resourcesHosted'`.

**Verification:** `pnpm lint` clean; `pnpm vitest run` green; `pnpm crd:dev` shows the User profile demo with 3 tabs, Resources Hosted active by default, all four sub-sections (Spaces / Virtual Contributors / Template Packs / Custom Homepages) rendering for `MOCK_ALEX_RIVERA`, and an empty Leading tab still showing the empty-state caption.

---

## Phase 10: Organization profile — tabbed right column matching User profile (FR-024 / FR-016 — refinement)

**Purpose**: The original Organization right column was a stacked-blocks layout (Account Resources / Lead Spaces / All Memberships rendered as Card-bordered sections one below the other), parity-ported from MUI `OrganizationPageView`. Visually it was heavier than the rest of the CRD profile pages. This phase rewrites the Org right column to mirror the User profile's tabbed layout (Phase 9): a 3-tab strip (Resources Hosted / Lead Spaces / All Memberships) with the same `ResourceTabKey` union, the same `ResourceTabStrip` component (extracted to shared common), and four sub-sections under Resources Hosted (Spaces / Virtual Contributors / Template Packs / Custom Homepages — organisations CAN host VCs, the data was already in `useAccountResources`). Drops the `VISIBLE_SPACE_LIMIT = 6` cap on hosted Spaces (FR-016 refined) — every item renders, matching User profile.

**Why a separate phase**: like Phase 9, the original spec preserved current MUI's stacked layout + 6-cap as the design choice. Only after the User profile Phase 9 work landed did the visual divergence between the two profile pages become obvious. This phase reuses the User profile's components and types directly — no new types are introduced; the Org just adopts the same `ResourceTabKey` / `SimpleResourceCardItem` / `ResourceTabStrip` / `useResourceTabs` extracted to shared common locations.

- [ ] T075 Extract the shared tab strip + hook + `ResourceTabKey` type to common locations:
  - `src/crd/components/common/ProfileResourceTabStrip.tsx` (renamed/moved from `src/crd/components/user/UserResourceTabStrip.tsx`). Same component implementation; the `ResourceTabKey` union exports from here.
  - `src/main/crdPages/topLevelPages/common/useResourceTabs.ts` (moved from the userPages folder). Same hook implementation; default tab is `'resourcesHosted'`.
  - Update User-side imports in `UserPublicProfileView.tsx`, `CrdUserProfilePage.tsx`, `UserResourceSections.tsx`, `UserProfileSelfDemoPage.tsx`, `UserProfileOtherDemoPage.tsx`, the contracts file, and any tests that reference the old paths. Leave a re-export shim at the old `UserResourceTabStrip.tsx` path if anything outside this spec references it (none found at write time, but check via grep).

- [ ] T076 Refactor `src/crd/components/organization/OrganizationResourceSections.tsx`:
  - Drop the `accountResources: AccountResourcesGroup | null` prop and the related `Card` wrappers / show-all logic.
  - Add the same prop shape as `UserResourceSectionsProps` (minus User-specific labels): `activeTab`, `hostedSpaces`, `hostedVirtualContributors`, `hostedInnovationPacks`, `hostedInnovationHubs`, `leadSpaces`, `memberOf`, `labels`.
  - Implementation mirrors `UserResourceSections.tsx`: switch on `activeTab` → 3 branches. The Resources Hosted branch renders the same 4 `SubSection` blocks (Spaces / VCs / Template Packs / Custom Homepages) with the same icons (`Bot` / `Package` / `LayoutDashboard`). Lead Spaces and Member Of branches render the list with an empty-state caption.
  - **Important**: the membership cards (Lead Spaces + All Memberships) are pre-rendered `ReactNode[]` from the integration page (each is a `MembershipCardConnector` wrapping a `useContributionProvider` lookup). So the prop shape is `ReactNode[]` for those two arrays, NOT `SpaceCardItem[]`. (Same pattern as the User profile.)
  - The Spaces sub-section under Resources Hosted uses `SpaceGridCard` directly (mapper produces `SpaceGridCardData[]`).

- [ ] T077 Refactor `src/crd/components/organization/OrganizationPublicProfileView.tsx`:
  - Add a `tabStrip: { activeTab; onSelectTab }` prop.
  - Render the shared `ProfileResourceTabStrip` component above the sections panel.
  - Update the `loading` shape: `accountResources` → `hostedResources`.

- [ ] T078 Refactor `src/main/crdPages/topLevelPages/organizationPages/publicProfile/organizationProfileMapper.ts`:
  - Drop `mapAccountResources` (returns `AccountResourcesGroup | null`).
  - Add a new `mapOrgHostedResources(accountResources, vcType)` that returns `{ hostedSpaces, hostedVirtualContributors, hostedInnovationPacks, hostedInnovationHubs }`. Reuse the shared `mapHostedSpacesToCardData` from `userPages/publicProfile/publicProfileMapper.ts` if the input shape matches (it does — `useAccountResources` returns the same shape regardless of account owner).

- [ ] T079 Refactor `src/main/crdPages/topLevelPages/organizationPages/publicProfile/CrdOrganizationProfilePage.tsx`:
  - Wire `useResourceTabs` (from the new shared common location).
  - Build the tab definitions array (3 tabs, labels via `t('orgProfile.tabs.*')`).
  - Wire the four hosted-resource arrays from the new mapper helper.
  - Pass `tabStrip` prop to `OrganizationPublicProfileView`.
  - Update label keys passed to the sections (mirror `UserResourceSectionsProps.labels`).
  - Drop the obsolete `accountResourcesTitle` / `accountResourcesSpacesSubtitle` / etc. labels.

- [ ] T080 i18n updates in `src/crd/i18n/profilePages/profilePages.<lang>.json` (all 6 languages):
  - Add `orgProfile.tabs.{resourcesHosted, leading, memberOf}` (English: "Resources Hosted" / "Lead Spaces" / "All Memberships").
  - Drop the obsolete `orgProfile.rightColumn.{accountResourcesTitle, accountResourcesSpacesSubtitle, accountResourcesInnovationPacksSubtitle, accountResourcesInnovationHubsSubtitle, leadSpacesTitle, memberOfTitle}` keys (the section headers are gone — the tab labels are the headings now).
  - The Resources Hosted sub-section labels (`spacesSubsection` / `virtualContributorsSubsection`) and the FR-102 reuses (Template Packs / Custom Homepages) are passed in by the integration page from the global `translation` namespace — same pattern as User profile.

- [ ] T081 Update `src/crd/app/data/profiles.ts` and `src/crd/app/pages/OrganizationProfileDemoPage.tsx`:
  - `MOCK_ORG_ALKEMIO`: replace the `accountResources: AccountResourcesGroup` block with 4 separate arrays (`hostedSpaces`, `hostedVirtualContributors` — keep the existing 4 spaces + 2 packs + 1 hub from the demo, add a 1-2 mock VCs to exercise the new sub-section).
  - `OrganizationProfileDemoPage.tsx`: drop the `accountResources` prop wiring; add `useState<ResourceTabKey>('resourcesHosted')`; pass the 4 new arrays and the `tabStrip` prop.

**Verification:** `pnpm lint` clean; `pnpm vitest run` green; `pnpm crd:dev` shows the Org profile demo with 3 tabs, Resources Hosted active by default, all 4 sub-sections rendering for `MOCK_ORG_ALKEMIO`. Toggle to Lead Spaces / All Memberships — only that tab's content renders.

---

## Phase 11: VC profile redesign (FR-030 / FR-032 / FR-034 — Session 2026-05-06)

**Purpose**: Bring the VC profile in line with the redesigned `prototype/src/app/pages/VCProfilePage.tsx`. The hero gains a "Virtual Contributor" type badge + a Keywords skill-tag chip row; the sidebar's References block flattens to show every entry (no social/non-social split); the right column drops today's `ModelCardSummary` + `SocialLinks` shape and is rebuilt as three card-grid sections — **Functionality** (Capabilities / Data Access / Role Requirements driven by `modelCard.spaceUsage[]`), **AI Engine: <name>** (six transparency cards driven by `modelCard.aiEngine.*`), **Monitoring by Alkemio** (Separator + heading + paragraph rendered via `<Trans>`). The data-extraction logic that today lives in the MUI hook `useTemporaryHardCodedVCProfilePageData(modelCard)` is re-implemented in plain TypeScript inside the CRD mapper (the MUI hook stays untouched per spec.md Out of Scope). All hard-coded English copy moves to the `crd-profilePages` i18n namespace; the two `dangerouslySetInnerHTML` calls in the MUI source are replaced by `<Trans components={{ strong, a }} />` per CRD Golden Rule 10.

**Why a separate phase**: like Phases 8 / 9 / 10, the original tasks landed against the pre-redesign spec (FR-034 said "right column = model card details + social links"). The 2026-05-06 redesign was recorded in spec.md, plan.md, contracts/vcProfile.ts, and data-model.md, but the existing US3 tasks were never regenerated. Grouping the redesign in one phase keeps the rollback boundary clean and makes the disagreement with the older T039 / T042 / T043 / T048 task descriptions explicit (those tasks now carry "(SUPERSEDED by Phase 11 …)" pointers).

### Hero — type badge + Keywords chip row (FR-030)

- [X] T082 [US3] Update `VCPageHero` at `src/crd/components/virtualContributor/VCPageHero.tsx` to add the two new structural elements per `VCPageHeroProps` (contracts/vcProfile.ts:46–58):
  - A `Badge` (variant `secondary`) containing a `Bot` `lucide-react` icon and the resolved `typeBadgeLabel` prop, sitting beside the display name.
  - A row of outlined `Badge` chips, one per entry of the `keywords: string[]` prop, rendered below the name. When `keywords.length === 0` the entire chip row MUST be omitted (no header, no empty caption — same omission rule as the User profile Tagsets block per FR-010a).
  No banner image (the prototype removes it). No Message button (FR-030). Avatar fallback uses the `Bot` `lucide-react` icon when `avatarImageUrl === null` per the redesigned hero schema.

- [X] T083 [US3] Extend `vcProfileMapper.ts` to populate the new hero props:
  - `typeBadgeLabel`: resolve from `t('crd-profilePages:vcProfile.typeBadge')` (passed in via the `labels` arg from the integration page).
  - `keywords`: resolve `vc.profile.tagsets[]` against `TagsetReservedName.Keywords` (case-insensitive name match, parity with the User profile mapper) and return the `tags` array. Empty/missing tagset → `[]` (the view's omission rule fires).
  Update `CrdVCProfilePage.tsx` to forward both fields via the `labels` arg.

### Sidebar — flat References list (FR-032)

- [X] T084 [US3] Update `VCProfileSidebar` and `vcProfileMapper.ts` to render ALL `vc.profile.references[]` entries as a flat URL-chip list (no social/non-social split):
  - `vcProfileMapper.ts`: drop `splitVcReferences` / any social-vs-non-social helper; pass `vc.profile.references` straight through to `view.sidebar.references`. Drop the `isSocialNetworkSupported` import if it remains.
  - `VCProfileSidebar.tsx`: rename the section from "non-social References" to "References"; render every entry as a labelled URL chip. Empty list → "No references" caption (existing FR-102 reuse `common.no-references`).

### Right column — three card-grid sections (FR-034)

- [X] T085 [P] [US3] Implement `VCTransparencyCard` at `src/crd/components/virtualContributor/VCTransparencyCard.tsx` per `TransparencyCardData` in `contracts/vcProfile.ts`. Pure presentational reusable sub-component: circular icon badge (`size-10 rounded-full bg-muted` containing the resolved `lucide-react` icon — mapped from the `iconName` prop), centred title, descriptive caption, and an answer area at the bottom of `CardContent`. The answer area branches on which discriminated field is populated (`booleanAnswer` → `CheckCircle2`/`XCircle`/`Clock` row with Yes/No label; `textValue` → plain `<span>` answer; `action` → outlined `Button` linking to `href` with `target="_blank" rel="noopener noreferrer"`, OR an italic muted "Not available" caption when `href === ''`). Receives `iconName` mapping inline (no helper file).

- [X] T086 [P] [US3] Implement `VCFunctionalityGrid` at `src/crd/components/virtualContributor/VCFunctionalityGrid.tsx` per `VCFunctionalitySectionData` in `contracts/vcProfile.ts`. Pure presentational: `text-section-title` heading "Functionality" + a `grid grid-cols-1 md:grid-cols-3 gap-4` of three `Card`s.
  - **Functional Capabilities** (`CircuitBoard` icon) — bullet list rendered from the `capabilities: BulletItem[]` prop. Each row: a `Check` glyph (`text-foreground`) when `enabled`, a `Minus` glyph (`text-muted-foreground`) otherwise, followed by the `label`. Disabled rows render the label in `text-muted-foreground`.
  - **Data access from the Space where it is a member** (`Upload` icon) — same shape, sourced from `dataAccess: BulletItem[]`.
  - **Role Requirements** (`Users` icon) — descriptive paragraph (no bullet list). Branches on `roleRequirements.kind`: `'memberRequired'` → render `<Trans i18nKey={labels.roleRequirementsMemberRequiredKey} components={{ strong: <strong /> }} />` so the "member rights" phrase is wrapped in a real `<strong>` element; `'noneRequired'` → render `labels.roleRequirementsNoneRequired` as a plain `<p>`. **`dangerouslySetInnerHTML` MUST NOT appear anywhere in this file** (CRD Golden Rule 10).

- [X] T087 [P] [US3] Implement `VCAiEngineGrid` at `src/crd/components/virtualContributor/VCAiEngineGrid.tsx` per `VCAiEngineSectionData` in `contracts/vcProfile.ts`. Pure presentational: `text-section-title` heading rendered from `labels.aiEngineHeading` (already interpolated with `engineName` by the mapper, e.g., "AI Engine: Alkemio AI") + a `grid grid-cols-1 md:grid-cols-3 gap-4` rendering exactly six `VCTransparencyCard` instances in the order produced by the mapper. The view does NO mapper-style logic — it just iterates `cards: TransparencyCardData[]` and renders each via the sub-component (T085). Yes/No labels for boolean cards come from `labels.yesAnswer` / `labels.noAnswer`; the "Unknown" label for null `isInteractionDataUsedForTraining` and empty `hostingLocation` comes from `labels.unknownAnswer`; the "Not available" caption for empty `additionalTechnicalDetails` comes from `labels.technicalReferencesNotAvailable`.

- [X] T088 [P] [US3] Implement `VCMonitoringSection` at `src/crd/components/virtualContributor/VCMonitoringSection.tsx` per `VCMonitoringSectionData` in `contracts/vcProfile.ts`. Pure presentational: a horizontal `Separator` from `@/crd/primitives/separator`, then a `text-section-title` heading rendered via `t(headingKey)`, then a `<p>` containing `<Trans i18nKey={bodyKey} components={{ a: <a href="https://welcome.alkem.io/legal/#tc" target="_blank" rel="noreferrer" /> }} />`. The T&C URL is hard-coded inside the `<a>` component (product-stable; injecting via props would add overhead with no benefit per `data-model.md` note). **No `dangerouslySetInnerHTML`.**

- [X] T089 [US3] Rebuild `VCContentView` at `src/crd/components/virtualContributor/VCContentView.tsx` per the new `VCContentViewProps` in `contracts/vcProfile.ts` (the redesigned shape — three structured section data fields plus a `labels` object). The view is now a thin composition wrapper: render `<VCFunctionalityGrid>`, then `<VCAiEngineGrid>`, then `<VCMonitoringSection>` in that order, each receiving its slice of the data + the relevant labels. **Drop the entire `ModelCardSummary` type, the `aiEngine` / `prompts.persona` / `prompts.constraints` / `dataPrivacy.summary` props, and the `references: ReferenceLink[]` prop**. The `<SocialLinks>` import is removed; VC is no longer a `SocialLinks` consumer (Phase 8's T068 VC bullets are superseded).

### Mapper — Functionality / AI Engine / Monitoring extraction (FR-034)

- [X] T090 [US3] Extend `vcProfileMapper.ts` at `src/main/crdPages/topLevelPages/vcPages/publicProfile/vcProfileMapper.ts` to produce the three redesigned section data shapes from `modelCard`. Re-implements the data-extraction logic that today lives in the MUI hook `useTemporaryHardCodedVCProfilePageData(modelCard)`, in plain TypeScript locally (does NOT import the MUI hook — it lives under `src/domain/`, off-limits per CRD architectural rules). Concrete responsibilities:
  - **Inline `EMPTY_MODEL_CARD_FALLBACK`** locally per data-model.md:557–588 (the constant is duplicated locally, NOT imported from `src/domain/community/virtualContributor/model/VirtualContributorModelCardModel.ts`, per FR-005).
  - **Functionality**: walk `modelCard.spaceUsage[]`. Map the `SpaceCapabilities` entry's `flags[]` to `BulletItem[]` (one per flag, `label` resolved from a per-flag-name i18n key — `SPACE_CAPABILITY_TAGGING` → `crd-profilePages:vcProfile.functionality.capabilities.tagging`, etc.). Map `SpaceDataAccess` flags similarly to a second `BulletItem[]`. Compute `roleRequirements.kind`: `'memberRequired'` when the `SpaceRoleRequired` entry has a `SpaceRoleMember` flag with `enabled === true`, else `'noneRequired'`.
  - **AI Engine**: derive `engineName` from `modelCard.aiEngine.isExternal` + `isAssistant` — pick `engineName.alkemio` when both false, `engineName.assistant` when isAssistant, `engineName.external` when isExternal && !isAssistant. Build the six `TransparencyCardData` entries in fixed order (Open Model Transparency / Data Usage Disclosure / Knowledge Restriction / Web Access / Physical Location / Technical References). Each entry is populated per the rules in `contracts/vcProfile.ts:248–271` and spec.md FR-034 — including the special cases: `isInteractionDataUsedForTraining === null` produces "Unknown"; `canAccessWebWhenAnswering === false` uses `noIcon: 'clock'`; `hostingLocation === ''` or `'unknown'` (literal string) falls back to "Unknown"; `additionalTechnicalDetails === ''` produces `action.href === ''` (the view renders the "Not available" caption).
  - **Monitoring**: produce the two i18n keys (`headingKey: 'crd-profilePages:vcProfile.monitoring.heading'`, `bodyKey: 'crd-profilePages:vcProfile.monitoring.body'`) — the view passes them straight to `t()` and `<Trans>` respectively.
  - **Labels arg**: extend the integration-page `labels` object with the new resolved labels per `VCContentViewProps.labels` (`functionalityHeading`, `capabilitiesTitle`, `dataAccessTitle`, `roleRequirementsTitle`, `roleRequirementsMemberRequiredKey` (this is a KEY, not a resolved string — the view passes it to `<Trans>`), `roleRequirementsNoneRequired`, `aiEngineHeading` (already interpolated with the resolved `engineName`), `yesAnswer`, `noAnswer`, `unknownAnswer`, `technicalReferencesNotAvailable`).
  Document all FR-102 reuses vs. new CRD-namespace keys in a comment at the top of the new mapper functions. The MUI hook `useTemporaryHardCodedVCProfilePageData.ts` is NOT modified — it continues to power the legacy MUI page when `useCrdEnabled` is OFF.

### Tests

- [X] T091 [P] [US3] Add a Vitest unit test at `src/main/crdPages/topLevelPages/vcPages/publicProfile/__tests__/vcContentViewMapper.test.ts` covering the redesign extraction logic (FR-034 / SC-006):
  - **Empty model card fallback**: feeding `modelCard = null` produces a `VCContentView` with all bullets `enabled: false`, all boolean transparency cards `value: false`, `textValue: ''` for Physical Location → "Unknown" via the `unknownAnswer` label, `action.href === ''` for Technical References, `engineName === labels.engineName.alkemio`, `roleRequirements.kind === 'noneRequired'`.
  - **All Capabilities flags enabled** vs. **mixed flags**: assert per-flag `enabled` matches input; label resolution is correct.
  - **`SpaceRoleMember.enabled === true`** → `roleRequirements.kind === 'memberRequired'`; absence (or `enabled: false`) → `'noneRequired'`.
  - **engineName**: assert all three branches (alkemio / assistant / external).
  - **`isInteractionDataUsedForTraining === null`**: Data Usage card → answer text is the `unknownAnswer` label, not "Yes"/"No".
  - **`additionalTechnicalDetails === ''`**: Technical References card → `action.href === ''` (view-side fallback verified in T092).

- [X] T092 [P] [US3] Add a Vitest render test at `src/crd/components/virtualContributor/__tests__/VCContentView.test.tsx` covering the redesigned three-section composition (FR-034, Acceptance Scenarios 13–17):
  - Functionality renders 3 cards (Capabilities / Data Access / Role Requirements) with Check/Minus glyphs matching the `enabled` flags.
  - **Role Requirements `'memberRequired'` path renders a real `<strong>` element via `<Trans>`** — `screen.getByRole('strong')` (or `container.querySelector('strong')`) must find the wrapped phrase. **Assert no escaped HTML appears as plain text** (no `&lt;strong&gt;` in the output).
  - AI Engine renders exactly six `VCTransparencyCard` instances in fixed order; the heading interpolates the `engineName`.
  - The Technical References card with `action.href === ''` renders the italic muted "Not available" caption (not a button); with a non-empty `href`, it renders an `<a target="_blank" rel="noopener noreferrer">` button.
  - **Monitoring section's T&C link is a real `<a>` element with `target="_blank"` and `href="https://welcome.alkem.io/legal/#tc"`** (FR-034 / Acceptance Scenario 17). Assert the `<a>` exists and its attributes match. **No `dangerouslySetInnerHTML` appears anywhere in the rendered output** (assert by inspecting the container's innerHTML for the absence of any escaped `&lt;` markers from the i18n string).

### i18n keys (redesign)

- [X] T093 [US3] Add the redesigned VC keys to `src/crd/i18n/profilePages/profilePages.en.json` under `vcProfile.*`:
  - `typeBadge` ("Virtual Contributor")
  - `functionality.heading` ("Functionality"), `functionality.capabilities.title` ("Functional Capabilities"), `functionality.capabilities.tagging` ("Answer questions in comments"), `functionality.capabilities.createContent` ("Create new posts"), `functionality.capabilities.communityManagement` ("Invite other contributors"), `functionality.dataAccess.title` ("Data access from the Space where it is a member"), `functionality.dataAccess.about` ("About page"), `functionality.dataAccess.content` ("Posts & Contributions"), `functionality.dataAccess.subspaces` ("Subspaces"), `functionality.roleRequirements.title` ("Role Requirements"), `functionality.roleRequirements.memberRequired` ("This VC needs to be granted <strong>member rights</strong> to function correctly" — contains `<strong>` markup for `<Trans>`), `functionality.roleRequirements.noneRequired` ("No special member rights required").
  - `aiEngine.heading` ("AI Engine: {{engineName}}"), `aiEngine.engineName.alkemio` ("Alkemio AI"), `aiEngine.engineName.assistant` ("External AI Assistant"), `aiEngine.engineName.external` ("External AI"), `aiEngine.seeDocumentation` ("SEE DOCUMENTATION"), `aiEngine.notAvailable` ("Not available"), `aiEngine.unknown` ("Unknown"), `aiEngine.yes` ("Yes"), `aiEngine.no` ("No"), plus six `aiEngine.cards.<id>.{title,description}` blocks: `openModelTransparency` ("Open Model Transparency" / "Does the VC use an open-weight model?"), `dataUsageDisclosure` ("Data Usage Disclosure" / "Is interaction data used in any way for model training?"), `knowledgeRestriction` ("Knowledge Restriction" / "Is the VC prompted to limit the responses to a specific body of knowledge?"), `webAccess` ("Web Access" / "Can the VC access or search the web?"), `physicalLocation` ("Physical Location" / "Where is the AI service hosted?"), `technicalReferences` ("Technical References" / "Access to detailed information on the underlying models specifications").
  - `monitoring.heading` ("Monitoring by Alkemio"), `monitoring.body` ("Since Alkemio facilitates the interaction with the external provider, it holds an operational responsibility to monitor the service. As with all data and interactions on the platform, these are governed by our <a>Terms & Conditions</a>." — contains `<a>` markup for `<Trans>`).
  Drop the obsolete pre-redesign keys added by T048 (`modelCardTitle`, `aiEngineLabel`, `socialLinksTitle`, `socialLinksEmpty`).

- [X] T094 [P] [US3] Translate every redesign key from T093 into `nl.json`, `es.json`, `bg.json`, `de.json`, `fr.json` per FR-101 (manual AI-assisted; same PR; no Crowdin per `src/crd/CLAUDE.md`). Drop the obsolete pre-redesign keys from these files too. Run the existing `keyParity.test.ts` (T005) afterward to confirm shape parity across all six languages.

### Standalone preview demo

- [X] T095 [US3] Update `src/crd/app/data/profiles.ts` — rebuild `MOCK_VC_DATASYNTH` for the redesigned shape:
  - Add `profile.tagsets[]` containing a non-empty `Keywords` reserved tagset (3–5 sample keywords) so the hero chip row exercises.
  - Add `modelCard.spaceUsage[]` with `SpaceCapabilities` (mixed enabled/disabled flags), `SpaceDataAccess` (mixed), `SpaceRoleRequired` (with `SpaceRoleMember.enabled === true` so the `'memberRequired'` `<Trans>` path renders).
  - Add `modelCard.aiEngine` with: `isExternal: false`, `isAssistant: false` (so engineName resolves to "Alkemio AI"), `hostingLocation: 'EU'`, `isUsingOpenWeightsModel: true`, `isInteractionDataUsedForTraining: null` (exercises the Unknown answer), `canAccessWebWhenAnswering: false` (exercises the `Clock` glyph), `areAnswersRestrictedToBodyOfKnowledge: 'Yes'`, `additionalTechnicalDetails: 'https://example.com/tech-details.pdf'` (exercises the SEE DOCUMENTATION button).
  - Drop the old `socialReferences` block and any `prompts` / `dataPrivacy` mock fields.

- [X] T096 [US3] Update `src/crd/app/pages/VCProfileDemoPage.tsx` to wire the redesigned shape — drop the old `modelCard` summary + `references` props on `VCContentView`; pass the three structured section-data props (Functionality / AI Engine / Monitoring) plus the `labels` object resolved from `t('crd-profilePages:vcProfile.*')`. Add a non-empty `keywords` array and the `typeBadgeLabel` to the hero props. Confirm the page renders all three sections without errors.

### Skeleton (FR-009 update)

- [X] T097 [US3] Update `VCPublicProfileView`'s skeleton fragments (T044 already lays the per-region skeleton scaffolding; this task fills in the redesign-specific shapes):
  - **Hero skeleton**: add a small rounded-rectangle placeholder for the type badge next to the name-line placeholder, and a row of 3–5 short rounded-rectangle chip placeholders below it (the Keywords chip row). Keep the location-line placeholder OUT of the hero skeleton (FR-009 explicitly excludes location for VCs).
  - **Right-column skeleton** (driven by `loading.contentView`): render three section blocks — (a) a 3-column responsive grid of three card-shaped placeholders for Functionality, (b) a 3-column responsive grid of six transparency-card placeholders for AI Engine, (c) a thin `Separator` placeholder + a paragraph-shaped placeholder for Monitoring. The redesigned right column MUST NOT collapse into a single skeleton block while loading.

**Verification:** `pnpm lint` clean; `pnpm vitest run` green (new T091 + T092 tests pass alongside the existing suite); `pnpm crd:dev` shows the VC demo at `/vc/datasynth-bot` with the redesigned hero (badge + Keywords chips), flat References list in the sidebar, and the three right-column sections (Functionality with mixed Check/Minus glyphs, AI Engine with 6 transparency cards in 3-col grid + the `Clock` glyph on Web Access + "Unknown" on Data Usage Disclosure, Monitoring with the `<Trans>`-rendered T&C link opening in a new tab). The Role Requirements card shows a real `<strong>` element. No `dangerouslySetInnerHTML` appears anywhere in the rendered output. Toggle CRD off — the legacy MUI VC profile page renders unchanged.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 only — environment sanity check.
- **Foundational (Phase 2)**: T002–T010 — i18n namespace, shared `CompactContributorCard` primitive, shared `useSendMessageHandler`, User-vertical helpers (`useUserPageRouteContext`, `useCanEditSettings`). MUST complete before user-story phases land.
- **User Stories (Phases 3–5)**: All depend on Foundational. Once Foundational is done, all three stories can proceed in parallel.
- **Polish (Phase 6)**: Depends on all three user stories completing.
- **Refinements (Phases 8–11)**: Each is a delta against the original Phases 3–5 implementation, applied after the original tasks land. Phase 8 (SocialLinks) is independent of 9/10/11. Phases 9 (User 3-tab) and 10 (Org tabbed) share the extracted-to-common `ProfileResourceTabStrip` — Phase 9 first, Phase 10 builds on it. **Phase 11 (VC redesign)** depends on the original US3 phase (T036–T049) being landed and is independent of Phases 8/9/10 — it touches only the VC vertical.

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

**Within Phase 11 (VC redesign):**

- T085 (`VCTransparencyCard`), T086 (`VCFunctionalityGrid`), T087 (`VCAiEngineGrid`), T088 (`VCMonitoringSection`) — all four presentational components are independent files and can be built in parallel. T087 depends on T085 logically (composes it) but the files themselves are independent — write T085 first, then T087 imports it.
- T091 (mapper test) and T092 (view render test) — independent files; can run in parallel.
- T093 (en i18n keys) and T094 (other-language translations) — T094 depends on T093 (keys defined first).
- T082 (hero) + T083 (mapper hero fields) are tightly coupled but in different files — write the contract-aligned mapper output first, then wire the hero. T084 (sidebar refs flatten) is independent.
- T089 (rebuild `VCContentView`) depends on T085–T088. T090 (mapper for content view) depends on T093 (keys must exist). T097 (skeleton) depends on T086–T088 (skeleton mirrors the section shapes).

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
