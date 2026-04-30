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

- [ ] T001 Verify dev server runs and CRD toggle is functional: `pnpm install`, `pnpm start`, then in the browser console set `localStorage.setItem('alkemio-crd-enabled', 'true')` and reload `/user/<self>`. Confirm the existing MUI page renders with the toggle off and the existing CRD pages (Spaces / Dashboard) render with the toggle on. Document any environment issues in this task's notes — no code change.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cross-cutting infrastructure that ALL three user stories depend on. Must complete before any user-story phase can finish (US1 also depends on its own foundational helpers, included here).

**⚠️ CRITICAL**: User-story implementation cannot ship until this phase is complete.

### i18n namespace

- [ ] T002 Create the shared CRD i18n namespace skeleton at `src/crd/i18n/profilePages/profilePages.en.json` with empty top-level keys for `userProfile`, `orgProfile`, `vcProfile`, `common` (per research §7 — one shared namespace for all three actor pages).
- [ ] T003 [P] Create empty placeholder files for the other five languages: `src/crd/i18n/profilePages/profilePages.nl.json`, `profilePages.es.json`, `profilePages.bg.json`, `profilePages.de.json`, `profilePages.fr.json` — each mirroring the `en` key shape.
- [ ] T004 Register the `crd-profilePages` namespace in `src/core/i18n/config.ts` (lazy-loaded, matching the existing `crd-exploreSpaces` registration pattern) and in `@types/i18next.d.ts`.
- [ ] T005 [P] Add a Vitest assertion at `src/crd/i18n/profilePages/__tests__/keyParity.test.ts` that all six language files have identical key shapes (same pattern used by other CRD i18n namespaces).

### Shared CRD primitive

- [ ] T006 [P] Implement the new shared `CompactContributorCard` primitive at `src/crd/components/common/CompactContributorCard.tsx` per `specs/096-crd-user-pages/contracts/compactContributor.ts`. Pure presentational, built atop `card.tsx` and `avatar.tsx` only. Supports `compact` (default) and `spacious` variants; renders as `<a href>` when `href` is set, non-interactive otherwise (per `src/crd/CLAUDE.md`).

### Shared cross-actor handler

- [ ] T007 [P] Implement `useSendMessageHandler` at `src/main/crdPages/topLevelPages/userPages/publicProfile/useSendMessageHandler.ts` per the `UseSendMessageHandler` contract in `specs/096-crd-user-pages/contracts/data-mapper.ts`. Wraps `useSendMessageToUsersMutation` with a recipient-id-bound `(messageText: string) => Promise<void>` API; tracks `sending` and `error` state internally. Used by US1 (User hero) and US2 (Org hero) — same hook, different recipient ID per research §5.

### User-vertical shared helpers (also reused by sibling spec 097-crd-user-settings)

- [ ] T008 [P] Implement `useUserPageRouteContext` at `src/main/crdPages/topLevelPages/userPages/useUserPageRouteContext.ts` per the `UseUserPageRouteContext` contract in `contracts/data-mapper.ts`. Resolves `userSlug` from the URL, `userId` from `useUserProvider`, and `currentUserId` from `useCurrentUserContext`; exposes a combined `loading` flag.
- [ ] T009 [P] Implement `useCanEditSettings` at `src/main/crdPages/topLevelPages/userPages/useCanEditSettings.ts` per the `UseCanEditSettings` contract in `contracts/data-mapper.ts`. Computes `canEditSettings = isOwner || isPlatformAdmin` using `useCurrentUserContext().hasPlatformPrivilege(PlatformAdmin)`. Distinguishes `isOwner` and `isPlatformAdmin` flags so 097's Security tab can gate owner-only.
- [ ] T010 [P] Add a Vitest unit test at `src/main/crdPages/topLevelPages/userPages/__tests__/useCanEditSettings.test.ts` covering the four viewer categories: owner / platform admin / non-admin signed-in / anonymous (research §9; FR-011 acceptance scenarios 2 / 3 / 4).

**Checkpoint**: i18n namespace registered, shared primitive available, shared handlers ready. All three user stories can now begin in parallel.

---

## Phase 3: User Story 1 — Public User Profile Page (Priority: P1) 🎯 MVP

**Goal**: Migrate the public User profile page (`/user/:userSlug`) from MUI to CRD with the 5-tab resource strip, sidebar (bio + organizations), Settings/Message hero affordances per the FR-011/FR-012 visibility matrix, and skeleton loading states.

**Independent Test**: With CRD on, open `/user/<self>` and `/user/<otherUser>` (signed in as a regular user, then as a platform admin). Verify per the per-viewer matrix in spec.md User Story 1 acceptance scenarios 1–8: hero with no presence dot, sidebar, sticky 5-tab strip with `All Resources` active by default, tab filtering per data-model.md, Settings icon visibility, Message button visibility, message send via `useSendMessageToUsersMutation`. Toggle CRD off — existing MUI `UserProfilePage` renders unchanged.

### Mapper (TDD pair — write test first if practicing TDD)

- [ ] T011 [P] [US1] Implement `publicProfileMapper.ts` at `src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.ts` — pure function mapping the User-vertical Apollo data (`useUserQuery`, `useUserAccountQuery`, `useUserContributionsQuery`, `useUserOrganizationIdsQuery`, `useFilteredMemberships`) to `UserPublicProfileViewProps` per `contracts/publicProfile.ts` and `data-model.md`. Includes the tab→section filter (data-model.md table) and the `canEditSettings`/`isOwn` computation (the predicate value comes from `useCanEditSettings`). The mapper itself is pure; i18n labels are passed in as a `labels` arg from the integration page.
- [ ] T012 [P] [US1] Add a Vitest unit test at `src/main/crdPages/topLevelPages/userPages/publicProfile/__tests__/publicProfileMapper.test.ts` covering: tab→section filter for each of the 5 tabs, leading vs. member-of split via `useFilteredMemberships`, empty-section omission rule (FR-015), bio markdown null vs. populated, no-presence-dot invariant (the mapper must not surface `lastActiveDate`).

### Active-tab state hook

- [ ] T013 [US1] Implement `useResourceTabs` at `src/main/crdPages/topLevelPages/userPages/publicProfile/useResourceTabs.ts` — local React state (`useState<ResourceTabKey>('allResources')`) per FR-013 (NOT URL-synced); exposes `{ activeTab, onSelectTab }`. No URL search param sync; reload always lands on `allResources`.

### Presentational components (parallelizable — independent files)

- [ ] T014 [P] [US1] Implement `UserPageHero` at `src/crd/components/user/UserPageHero.tsx` per `UserPageHeroProps` in `contracts/publicProfile.ts`. Pure presentational: banner (with `pickColorFromId(userId)` gradient fallback), avatar overlay, display name, location line. **No** presence dot. Settings icon button visible when `showSettingsIcon === true`; Message button visible when `showMessageButton === true`. Click handlers received as props (no internal navigation per `src/crd/CLAUDE.md`).
- [ ] T015 [P] [US1] Implement `UserPageMessagePopover` at `src/crd/components/user/UserPageMessagePopover.tsx` — a Popover wrapping a Textarea + Send button. Internal state: open/closed flag + draft text. Calls `onSendMessage(text)` prop on submit; closes on success; preserves draft on failure with inline error display (state machine per data-model.md).
- [ ] T016 [P] [US1] Implement `UserResourceTabStrip` at `src/crd/components/user/UserResourceTabStrip.tsx` per `UserResourceTabStripProps` in `contracts/publicProfile.ts`. Sticky position. Below `md`: `overflow-x-auto no-scrollbar`; all 5 tabs remain inline; the active tab auto-scrolls into view on mount and on tab change (FR-013 clarification). Keyboard-navigable per FR-111 — Tab into strip, Left/Right arrows, Enter to activate (use the existing CRD `tabs` primitive or replicate its keyboard pattern).
- [ ] T017 [P] [US1] Implement `UserResourceSections` at `src/crd/components/user/UserResourceSections.tsx` per `UserResourceSectionsProps` in `contracts/publicProfile.ts`. Switches on `activeTab` to render Resources Hosted (with sub-sections on `allResources`; sub-section headers hidden on single-slice tabs per FR-013) / Spaces Leading / Member Of. Sections with empty data are omitted (FR-015) — except the empty-state caption rule for "No memberships yet" when applicable.
- [ ] T018 [P] [US1] Implement `UserProfileSidebar` at `src/crd/components/user/UserProfileSidebar.tsx` per `UserProfileSidebarProps` in `contracts/publicProfile.ts`. Two stacked CRD card sections: About (bio rendered via existing CRD `MarkdownContent`) + Organizations list (rendered as a stack of compact rows per the AssociatedOrganizationCard shape; uses `CompactContributorCard` from T006 if visually equivalent, otherwise a small inline organization-card component).
- [ ] T019 [US1] Implement `UserPublicProfileView` at `src/crd/components/user/UserPublicProfileView.tsx` per `UserPublicProfileViewProps` in `contracts/publicProfile.ts`. Composes the hero + sidebar + tab strip + sections inside the CRD `PageLayout` and `TwoColumnLayout` shells. Renders Skeleton placeholders (FR-009) per region while `loading === true` is forwarded by the integration page.

### Integration page + routing

- [ ] T020 [US1] Implement `CrdUserProfilePage` at `src/main/crdPages/topLevelPages/userPages/publicProfile/CrdUserProfilePage.tsx`. Wires `useUserPageRouteContext` (T008) → `useCanEditSettings` (T009) → existing Apollo queries → `publicProfileMapper` (T011) → `useResourceTabs` (T013) → `useSendMessageHandler` (T007). Renders `UserPublicProfileView` with the produced props. Uses `useTransition` to wrap the send-message mutation (Constitution Principle II).
- [ ] T021 [US1] Implement `CrdUserRoutes` at `src/main/crdPages/topLevelPages/userPages/CrdUserRoutes.tsx` mirroring the existing `src/domain/community/user/routing/UserRoute.tsx` structure. Routes `/:userSlug` → `CrdUserProfilePage`. Routes `/me` → resolves the current user's nameID from `useCurrentUserContext()` and redirects to `/<resolvedSlug>` (FR-007). The settings subtree (`path="settings/*"`) delegates to `CrdUserAdminRoutes` from sibling spec 097 if available; otherwise renders a placeholder that falls back to the existing MUI route. Wraps with `CrdLayoutWrapper`.
- [ ] T022 [US1] Modify `src/main/routing/TopLevelRoutes.tsx` — add the conditional block for the User vertical: when `useCrdEnabled()` is true and the path matches `/user/*`, lazy-load `CrdUserRoutes`; otherwise lazy-load the existing `UserRoute` (preserving the existing `<NoIdentityRedirect>` and `<WithApmTransaction>` wrappers exactly per research §1).

### i18n keys (User profile)

- [ ] T023 [US1] Add User-profile i18n keys to `src/crd/i18n/profilePages/profilePages.en.json` under `userProfile.*` and any cross-actor keys to `common.*`. Keys to cover: hero (location format, Settings tooltip, Message button label, Message popover placeholder, Send button), tab strip (5 tab labels), section headings (`resourcesHosted`, `spaces`, `virtualContributors`, `spacesLeading`, `memberOf`), empty states (`emptyMembership`, `emptyLeading`, `emptyBio`, `emptyOrganizations`), sidebar (`aboutTitle`, `organizationsTitle`). Where current MUI uses generic keys already in `src/core/i18n/en/translation.en.json` (e.g., `pages.user-profile.communities.noMembership`), reuse via the `translation` namespace per FR-102 and document the choice in a comment in `publicProfileMapper.ts`.
- [ ] T024 [P] [US1] Translate all User-profile keys added in T023 into `nl.json`, `es.json`, `bg.json`, `de.json`, `fr.json` (manual AI-assisted per `src/crd/CLAUDE.md`; same PR per FR-101).

**Checkpoint**: User profile page is fully functional under CRD-on; MUI page renders unchanged under CRD-off. The 5-tab strip filters per data-model.md; Settings/Message gating matches the spec's per-viewer matrix.

---

## Phase 4: User Story 2 — Public Organization Profile Page (Priority: P1)

**Goal**: Migrate the public Organization profile page (`/organization/:orgSlug`) from MUI to CRD with hero (banner + avatar + name + location + Verified badge + Settings/Message), sidebar (Bio + Tagsets + References + Associates), and right column (Account Resources + Lead Spaces + All Memberships) per the parity rules in the spec.

**Independent Test**: With CRD on, open `/organization/<some-org>` (signed in as a regular user, then as an org admin, then as anonymous). Verify per spec.md User Story 2 acceptance scenarios 1–10: hero affordances, sidebar sections (Associates hidden when `canReadUsers === false`), right-column section omission rules (Account Resources omitted when empty; Lead Spaces omitted when empty; All Memberships always rendered with empty caption when empty), Verified badge, message send via `useSendMessageToUsersMutation` against the org as recipient. Toggle CRD off — existing MUI `OrganizationPage` renders unchanged.

### Mapper

- [ ] T025 [P] [US2] Implement `organizationProfileMapper.ts` at `src/main/crdPages/topLevelPages/organizationPages/publicProfile/organizationProfileMapper.ts` — pure function mapping `useOrganizationProvider` data + `useOrganizationAccountQuery` + `useAccountResources` + `useFilteredMemberships(contributions, [RoleType.Lead])` to `OrganizationPublicProfileViewProps` per `contracts/organizationProfile.ts` and `data-model.md`. Implements the section-omission rules (Account Resources omitted when all three lists are empty; Lead Spaces omitted when empty; All Memberships always rendered) per FR-024. Computes `verified = organization.verification.status === VerifiedManualAttestation` and `settingsUrl = canEdit ? buildSettingsUrl(profile.url) : null`. Filters references via `isSocialNetworkSupported` (only the "other" group goes in the sidebar — same predicate file used by VC mapper).
- [ ] T026 [P] [US2] Add a Vitest unit test at `src/main/crdPages/topLevelPages/organizationPages/publicProfile/__tests__/organizationProfileMapper.test.ts` covering: four sidebar sections including Associates `canReadUsers` gating; three right-column sections including Account Resources omission when all lists empty, Lead Spaces filtering, All Memberships empty-state; Verified badge predicate (manual-attestation true / false / unset); references social/non-social split (research §9).

### Presentational components (parallelizable)

- [ ] T027 [P] [US2] Implement `OrganizationPageHero` at `src/crd/components/organization/OrganizationPageHero.tsx` per `OrganizationPageHeroProps` in `contracts/organizationProfile.ts`. Banner with `pickColorFromId(organizationId)` gradient fallback, avatar overlay, display name, location line, Verified badge (FR-020). Settings icon visible when `settingsUrl !== null`. Message button visible when `onSendMessage !== null`. Reuses `UserPageMessagePopover` (T015) directly — the popover is recipient-agnostic — OR factor a shared `MessagePopover` if visual divergence appears.
- [ ] T028 [P] [US2] Implement `OrganizationProfileSidebar` at `src/crd/components/organization/OrganizationProfileSidebar.tsx` per `OrganizationProfileSidebarProps` in `contracts/organizationProfile.ts`. Four sections: Bio (markdown via existing CRD `MarkdownContent`), Tagsets (Keywords + Capabilities as compact tag pills), References (labeled URL chips), Associates (renders every associate as a `CompactContributorCard` row in the `spacious` variant — no cap, no "View all" per FR-023; section omitted entirely when `associates === null`).
- [ ] T029 [P] [US2] Implement `OrganizationResourceSections` at `src/crd/components/organization/OrganizationResourceSections.tsx` per `OrganizationResourceSectionsProps` in `contracts/organizationProfile.ts`. Three sections: Account Resources (combined spaces + innovationPacks + innovationHubs as a single titled section — omitted when `accountResources === null`), Lead Spaces (omitted when empty), All Memberships (always rendered; empty-state caption "No memberships yet" via the existing `translation` key).
- [ ] T030 [US2] Implement `OrganizationPublicProfileView` at `src/crd/components/organization/OrganizationPublicProfileView.tsx` per `OrganizationPublicProfileViewProps` in `contracts/organizationProfile.ts`. Composes the hero + sidebar + sections inside the CRD `PageLayout` and `TwoColumnLayout` shells (`col-span-3` sidebar / `col-span-9` right column on `md+`). Renders Skeleton placeholders (FR-009) per region while loading.

### Integration page + routing

- [ ] T031 [US2] Implement `CrdOrganizationProfilePage` at `src/main/crdPages/topLevelPages/organizationPages/publicProfile/CrdOrganizationProfilePage.tsx`. Wires `useUrlResolver` → `useOrganizationProvider` → `useOrganizationAccountQuery` → `useAccountResources` → `organizationProfileMapper` (T025) → `useSendMessageHandler` (T007 — recipient ID is `organization.id`). Renders `OrganizationPublicProfileView`. Wraps the send-message mutation in `useTransition`.
- [ ] T032 [US2] Implement `CrdOrganizationRoutes` at `src/main/crdPages/topLevelPages/organizationPages/CrdOrganizationRoutes.tsx` mirroring the existing `src/domain/community/organization/pages/OrganizationRoute.tsx` structure. Routes `/:orgSlug` → `CrdOrganizationProfilePage`. The settings subtree (`path="settings/*"`) falls through to the existing MUI admin route — Org admin shell migration is out of scope. Wraps with `CrdLayoutWrapper`.
- [ ] T033 [US2] Modify `src/main/routing/TopLevelRoutes.tsx` — add the conditional block for the Organization vertical: when `useCrdEnabled()` is true and the path matches `/organization/*`, lazy-load `CrdOrganizationRoutes`; otherwise lazy-load the existing `OrganizationRoute`. Preserve the existing wrapper exactly (research §1 — anonymous viewers can load the page).

### i18n keys (Organization profile)

- [ ] T034 [US2] Add Organization-profile i18n keys to `src/crd/i18n/profilePages/profilePages.en.json` under `orgProfile.*`. Keys to cover: hero (Verified badge label, Settings tooltip, Message button label), sidebar (`bioTitle`, `bioEmpty`, `tagsetKeywords`, `tagsetCapabilities`, `referencesTitle`, `referencesEmpty`, `associatesTitle`, `associatesEmpty`, `associatesCount` interpolation), right column (`accountResourcesTitle`, `accountResourcesSpacesSubtitle`, `accountResourcesInnovationPacksSubtitle`, `accountResourcesInnovationHubsSubtitle`, `leadSpacesTitle`, `memberOfTitle`, `memberOfEmpty` — reuse the existing `translation` key for "No memberships yet" per FR-102).
- [ ] T035 [P] [US2] Translate all Organization-profile keys added in T034 into the five non-English language files under `src/crd/i18n/profilePages/`.

**Checkpoint**: Organization profile page is fully functional under CRD-on; MUI page renders unchanged under CRD-off. Settings icon links to the existing MUI admin URL; Message button works against the org as recipient.

---

## Phase 5: User Story 3 — Public Virtual Contributor Profile Page (Priority: P1)

**Goal**: Migrate the public VC profile page (`/vc/:vcSlug`) from MUI to CRD with hero (banner + avatar + name + Settings; **NO Message button**), sidebar (Description + Host + non-social References + Body of Knowledge with three discriminated-union variants), and right column (model card + social references with `lucide-react` brand icons). Honor existing 404 (`Error404` inside CRD layout) and `useRestrictedRedirect`.

**Independent Test**: With CRD on, open `/vc/<some-vc>` (one VC per BoK variant: AlkemioSpace, AlkemioKnowledgeBase, External). Verify per spec.md User Story 3 acceptance scenarios 1–9: hero with no Message button, sidebar sections, BoK section per variant including private-space placeholder and disabled Visit-button-with-tooltip, right-column model card + social brand icons. Visit an invalid VC URL → `Error404`. Toggle CRD off — existing MUI `VCProfilePage` renders unchanged.

### Mapper + BoK resolver

- [ ] T036 [P] [US3] Implement `vcProfileMapper.ts` at `src/main/crdPages/topLevelPages/vcPages/publicProfile/vcProfileMapper.ts` — pure function mapping `useVirtualContributorProfileWithModelCardQuery` + `useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery` + `useSpaceBodyOfKnowledgeAboutQuery` + `useKnowledgeBase` data to `VCPublicProfileViewProps` per `contracts/vcProfile.ts` and `data-model.md`. Implements the BoK discriminated-union resolver (research §4) — produces one of `{ kind: 'space', ... }`, `{ kind: 'knowledgeBase', ... }`, or `{ kind: 'external', engineLabel: 'assistant' | 'other' }`. Splits references via `isSocialNetworkSupported`: social → right-column, non-social → sidebar (FR-032). Computes `hasUpdatePrivilege` from `vc.authorization.myPrivileges` and `settingsUrl = hasUpdatePrivilege ? buildSettingsUrl(profile.url) : null`. Maps social references to `lucide-react` brand keys (`linkedin` / `bluesky` / `github` / `x` / `generic`).
- [ ] T037 [P] [US3] Implement `useVCBodyOfKnowledge` at `src/main/crdPages/topLevelPages/vcPages/publicProfile/useVCBodyOfKnowledge.ts` — wraps the auxiliary BoK queries (`useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery`, `useSpaceBodyOfKnowledgeAboutQuery`, `useKnowledgeBase`) and exposes `{ bodyOfKnowledge, loading }` ready to feed into the mapper.
- [ ] T038 [P] [US3] Add a Vitest unit test at `src/main/crdPages/topLevelPages/vcPages/publicProfile/__tests__/vcProfileMapper.test.ts` covering: BoK resolver for each `kind` variant (space with/without `hasReadAccess`; knowledgeBase with/without `hasReadAccess`; external with `Assistant` vs. other engine), social/non-social references split, model-card data shape, brand-icon mapping (research §9).

### Presentational components (parallelizable)

- [ ] T039 [P] [US3] Implement `VCPageHero` at `src/crd/components/virtualContributor/VCPageHero.tsx` per `VCPageHeroProps` in `contracts/vcProfile.ts`. Banner with `pickColorFromId(vcId)` gradient fallback, avatar overlay, display name. Settings icon visible when `settingsUrl !== null`. **NO Message button** (FR-030 — the props interface intentionally omits `onSendMessage`).
- [ ] T040 [P] [US3] Implement `VCBodyOfKnowledgeSection` at `src/crd/components/virtualContributor/VCBodyOfKnowledgeSection.tsx` per `VCBodyOfKnowledgeSectionProps` in `contracts/vcProfile.ts`. Switches on `bodyOfKnowledge.kind`: `space` → SpaceCardHorizontal-equivalent CRD card linking to the backing space (or "Private space" placeholder when `hasReadAccess === false`); `knowledgeBase` → description + Visit button (disabled with `Tooltip` "Body of knowledge is private" when `hasReadAccess === false`); `external` → engine-type description per `engineLabel`.
- [ ] T041 [P] [US3] Add a Vitest render test at `src/crd/components/virtualContributor/__tests__/VCBodyOfKnowledgeSection.test.tsx` covering each `kind` variant (research §9): `space` renders the card / placeholder; `knowledgeBase` renders description + Visit button enabled or disabled per `hasReadAccess`; `external` renders the engine-type copy.
- [ ] T042 [P] [US3] Implement `VCProfileSidebar` at `src/crd/components/virtualContributor/VCProfileSidebar.tsx` per `VCProfileSidebarProps` in `contracts/vcProfile.ts`. Four sections: Description (markdown via existing CRD `MarkdownContent`), Host (renders `CompactContributorCard` from T006 in `compact` variant), non-social References (labeled URL chips; empty-state line "No references" when empty), and `VCBodyOfKnowledgeSection` (T040).
- [ ] T043 [P] [US3] Implement `VCContentView` at `src/crd/components/virtualContributor/VCContentView.tsx` per `VCContentViewProps` in `contracts/vcProfile.ts`. Right column: model card details (`aiEngine`, `prompts.persona`, `prompts.constraints`, `dataPrivacy.summary`) + social links (filtered references rendered with `lucide-react` brand icons — `Linkedin`, `Twitter`, `Github`, `Youtube`, `Globe` fallback per FR-034). Brand-icon mapping receives the `brand` field from the mapper (no logic in the view).
- [ ] T044 [US3] Implement `VCPublicProfileView` at `src/crd/components/virtualContributor/VCPublicProfileView.tsx` per `VCPublicProfileViewProps` in `contracts/vcProfile.ts`. Composes the hero + sidebar + content view inside the CRD `PageLayout` and `TwoColumnLayout` shells (`col-span-3` sidebar / `col-span-9` right column on `md+`). Renders Skeleton placeholders (FR-009) per region while loading.

### Integration page + routing

- [ ] T045 [US3] Implement `CrdVCProfilePage` at `src/main/crdPages/topLevelPages/vcPages/publicProfile/CrdVCProfilePage.tsx`. Wires `useUrlResolver` → `useRestrictedRedirect({ requiredPrivilege: AuthorizationPrivilege.Read })` → `useVirtualContributorProfileWithModelCardQuery` → `useVCBodyOfKnowledge` (T037) → `vcProfileMapper` (T036). Handles `isApolloNotFoundError` by rendering `Error404` inside the CRD layout (FR-036). Renders `VCPublicProfileView`.
- [ ] T046 [US3] Implement `CrdVCRoutes` at `src/main/crdPages/topLevelPages/vcPages/CrdVCRoutes.tsx` mirroring the existing `src/domain/community/virtualContributor/vcProfilePage/VCRoute.tsx` structure. Routes `/:vcSlug` → `CrdVCProfilePage`. The settings subtree (`path="settings/*"`) falls through to the existing MUI admin route — VC admin shell migration is out of scope. Wraps with `CrdLayoutWrapper`.
- [ ] T047 [US3] Modify `src/main/routing/TopLevelRoutes.tsx` — add the conditional block for the VC vertical: when `useCrdEnabled()` is true and the path matches `/vc/*`, lazy-load `CrdVCRoutes`; otherwise lazy-load the existing `VCRoute`. Preserve the existing wrapper exactly (research §1 — anonymous viewers can load if VC has public Read).

### i18n keys (VC profile)

- [ ] T048 [US3] Add VC-profile i18n keys to `src/crd/i18n/profilePages/profilePages.en.json` under `vcProfile.*`. Keys to cover: hero (Settings tooltip), sidebar (`descriptionTitle`, `hostTitle`, `referencesTitle`, `referencesEmpty`, `bodyOfKnowledgeTitle`, `bodyOfKnowledgePrivateTooltip`, `bodyOfKnowledgeVisitButton`, `bodyOfKnowledgeSpaceContextDescription`, `bodyOfKnowledgeExternalAssistantDescription`, `bodyOfKnowledgeExternalOtherDescription`, `privateSpaceLabel`), right column (`modelCardTitle`, `aiEngineLabel`, `promptsLabel`, `promptsPersonaLabel`, `promptsConstraintsLabel`, `dataPrivacyLabel`, `socialLinksTitle`, `socialLinksEmpty`). Where current MUI uses generic keys already in `translation.en.json` (e.g., `components.profile.fields.bodyOfKnowledge.title`), reuse via the `translation` namespace per FR-102.
- [ ] T049 [P] [US3] Translate all VC-profile keys added in T048 into the five non-English language files under `src/crd/i18n/profilePages/`.

**Checkpoint**: VC profile page is fully functional under CRD-on; MUI page renders unchanged under CRD-off. All three BoK variants render correctly; 404 and Restricted-redirect parity preserved.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation, bundle-size verification, lint/test gates, and the per-actor smoke checklist from `quickstart.md`.

- [ ] T050 [P] Run `pnpm lint` at the repo root and resolve any TypeScript / Biome / ESLint errors in the new files.
- [ ] T051 [P] Run `pnpm vitest run` and ensure all new tests pass alongside the existing suite (target completion ~9 s per CLAUDE.md).
- [ ] T052 Run `pnpm analyze` and verify the combined gzipped bundle delta across the three new lazy-loaded chunks (User profile + Organization profile + VC profile) does NOT exceed +35 KB over the prior build (SC-005). Log the chunk sizes in this task's notes for the PR description.
- [ ] T053 Execute the manual smoke checklist in `specs/096-crd-user-pages/quickstart.md` end-to-end (User profile / Organization profile / VC profile / Authorization / Toggle blocks) against `localhost:3001`. Record any deviations as bug tasks before merge.
- [ ] T054 Run an axe / Lighthouse accessibility pass on each of the three CRD profile pages. Fix any critical or serious violations (SC-004; FR-110).
- [ ] T055 Verify the parity matrix per actor (SC-006) with seeded test fixtures: User 0 / 1 / 50+ memberships across L0/L1/L2; Organization 0 / 1 / 50+ memberships, account resources present and absent, verified and unverified; VC each of the three BoK variants.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 only — environment sanity check.
- **Foundational (Phase 2)**: T002–T010 — i18n namespace, shared `CompactContributorCard` primitive, shared `useSendMessageHandler`, User-vertical helpers (`useUserPageRouteContext`, `useCanEditSettings`). MUST complete before user-story phases land.
- **User Stories (Phases 3–5)**: All depend on Foundational. Once Foundational is done, all three stories can proceed in parallel.
- **Polish (Phase 6)**: Depends on all three user stories completing.

### User Story Dependencies

- **US1 (User profile)**: Depends only on Foundational (specifically T002–T009). Independent of US2 and US3 except for the shared `TopLevelRoutes.tsx` file (each story modifies a distinct conditional block — sequential edits to the same file but no logical cross-dependency).
- **US2 (Organization profile)**: Depends on Foundational. Reuses `useSendMessageHandler` (T007), `CompactContributorCard` (T006), and `UserPageMessagePopover` (T015 — soft dependency; US2 can implement its own popover in parallel and refactor later if visual divergence appears).
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
- T014, T015, T016, T017, T018 — all five presentational components are independent files.

**Within US2:**

- T025 (mapper), T026 (mapper test) — different files.
- T027, T028, T029 — three presentational components are independent files.

**Within US3:**

- T036 (mapper), T037 (BoK hook), T038 (mapper test) — different files.
- T039, T040, T041 (BoK render test), T042, T043 — five presentational components + one test, all independent files.

**Across user stories (after Foundational):**

- US1, US2, US3 phases can be developed in parallel by different team members. The only sequential step is each story modifying its own conditional block in `TopLevelRoutes.tsx` (T022 / T033 / T047) — coordinate the file edit order to avoid merge conflicts, but the logical edits are independent.

**Polish (Phase 6):**

- T050 (lint) and T051 (tests) can run in parallel (different processes).

---

## Parallel Example: Foundational Phase

```bash
# Once T002 + T004 (the namespace anchors) are done, the rest of Phase 2 can run in parallel:
Task: "T003 [P] Create five non-English language file placeholders in src/crd/i18n/profilePages/"
Task: "T005 [P] Add Vitest key-parity assertion at src/crd/i18n/profilePages/__tests__/keyParity.test.ts"
Task: "T006 [P] Implement CompactContributorCard at src/crd/components/common/CompactContributorCard.tsx"
Task: "T007 [P] Implement useSendMessageHandler at src/main/crdPages/topLevelPages/userPages/publicProfile/useSendMessageHandler.ts"
Task: "T008 [P] Implement useUserPageRouteContext at src/main/crdPages/topLevelPages/userPages/useUserPageRouteContext.ts"
Task: "T009 [P] Implement useCanEditSettings at src/main/crdPages/topLevelPages/userPages/useCanEditSettings.ts"
Task: "T010 [P] Add useCanEditSettings Vitest unit test at src/main/crdPages/topLevelPages/userPages/__tests__/useCanEditSettings.test.ts"
```

## Parallel Example: User Story 1 — Presentational Components

```bash
# Once T011 (mapper) and T013 (useResourceTabs) are done, the five presentational components can be built in parallel:
Task: "T014 [P] [US1] Implement UserPageHero at src/crd/components/user/UserPageHero.tsx"
Task: "T015 [P] [US1] Implement UserPageMessagePopover at src/crd/components/user/UserPageMessagePopover.tsx"
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
