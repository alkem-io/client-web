---
description: "Implementation tasks for CRD User Profile Page (public profile view)"
---

# Tasks: CRD User Profile Page

**Input**: Design documents from `/specs/096-crd-user-pages/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/
**Sibling spec**: `097-crd-user-settings` covers the seven settings tabs. Foundational tasks marked **[SHARED-097]** are owned jointly with 097; if 097 has already landed those pieces in a feature branch, this spec reuses them.
**Tests**: Per-story functional UI tests are NOT included (per CRD-spec convention from 091/045 — manual verification follows quickstart.md). Targeted unit tests ARE included for: pure mappers (research §5), the `canEditSettings` predicate, the resource tab→section filter, and i18n key parity.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story this task belongs to (US1)
- **[SHARED-097]**: Foundational task also referenced by sibling spec 097-crd-user-settings — implement once
- All paths are absolute under `/home/carlos/DEV/Alkemio/client-web/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: i18n namespace for the public profile page + integration directory skeleton.

- [ ] T001 [SHARED-097] Register the new `crd-userPages` i18n namespace in `/home/carlos/DEV/Alkemio/client-web/src/core/i18n/config.ts` by adding it to `crdNamespaceImports` (lazy-load all 6 languages from `src/crd/i18n/userPages/userPages.<lang>.json`) — mirror the pattern used for `crd-spaceSettings`. (Sibling spec 097 registers `crd-userSettings` separately in the same file.)
- [ ] T002 Add `'crd-userPages'` to the i18next namespace type union in `/home/carlos/DEV/Alkemio/client-web/@types/i18next.d.ts` so `useTranslation('crd-userPages')` is type-checked
- [ ] T003 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.en.json` with the full skeleton of keys covering: hero (`hero.settings`, `hero.message`, `hero.messageSend`, `hero.messagePlaceholder`), public-profile sidebar (`profile.about.title`, `profile.about.empty`, `profile.organizations.title`, `profile.organizations.empty`), public-profile resource tabs (`profile.tabs.allResources`, `profile.tabs.hostedSpaces`, `profile.tabs.virtualContributors`, `profile.tabs.leading`, `profile.tabs.memberOf`, `profile.sections.resourcesHosted`, `profile.sections.spaces`, `profile.sections.virtualContributors`, `profile.sections.spacesLeading`, `profile.sections.memberOf`, `profile.empty.leading`, `profile.empty.memberOf`)
- [ ] T004 [P] Create empty placeholder JSON files for the other five languages: `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.nl.json`, `userPages.es.json`, `userPages.bg.json`, `userPages.de.json`, `userPages.fr.json` — each starts as `{}` and is filled during T035 (Polish phase)
- [ ] T005 [P] Create the integration directory at `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/publicProfile/` so subsequent integration tasks have a stable path

**Checkpoint**: i18n namespace registered, integration directory skeleton in place — Foundational phase can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared integration helpers + route shell + the conditional in `TopLevelRoutes.tsx`. These pieces are also used by sibling spec 097.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

### Integration helpers + route shells

- [ ] T006 [P] [SHARED-097] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/useUserPageRouteContext.ts` per the `UseUserPageRouteContext` contract in `specs/096-crd-user-pages/contracts/data-mapper.ts`. Wraps `useUserProvider` + `useCurrentUserContext` to return `{ userSlug, userId, currentUserId, loading }`. Resolves `/user/me` to the current user's nameID before returning
- [ ] T007 [P] [SHARED-097] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/useCanEditSettings.ts` per the `UseCanEditSettings` contract. Returns `{ canEditSettings, isOwner, isPlatformAdmin }`. `isPlatformAdmin` calls `userWrapper.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin)` exactly as `UserAdminNotificationsPage` does today (FR-008a / FR-011)
- [ ] T008 [SHARED-097] Unit-test `useCanEditSettings` at `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/useCanEditSettings.test.ts`: assert true when `currentUser.id === profileUser.id`, true when admin viewing other user, false when neither, false when both ids are undefined (anonymous). Depends on T007
- [ ] T009 [P] [SHARED-097] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/CrdUserRoutes.tsx` — top-level CRD user routes mirroring the existing `src/domain/community/user/routing/UserRoute.tsx`. Two route blocks: `path="me/*"` and `path=":userNameId/*"`. Inside each, an `<Outlet />` wrapping the public-profile index route (this spec) and a `path="settings/*"` sub-route that delegates to `CrdUserAdminRoutes` (sibling spec 097). All page components are lazy-loaded
- [ ] T011 [SHARED-097] Modify `/home/carlos/DEV/Alkemio/client-web/src/main/routing/TopLevelRoutes.tsx` at the `/user/*` route block (lines 209-220 today): inside the existing `<NoIdentityRedirect>` and `<Suspense>`, dispatch on `useCrdEnabled()` between the lazy-loaded `<CrdUserRoutes />` and the existing `<UserRoute />` — the existing wrapping (`<NoIdentityRedirect>`, `<WithApmTransaction>`, `<Suspense>`) MUST stay exactly as-is (research §1: anonymous viewers stay redirected to login for parity). Add a new lazy import `const CrdUserRoutes = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/topLevelPages/userPages/CrdUserRoutes'))`. Depends on T009

### Shared CRD presentational components for the hero

- [ ] T012 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserPageHero.tsx` per the `UserPageHeroProps` contract in `specs/096-crd-user-pages/contracts/publicProfile.ts`. Pure presentational: banner image (gradient fallback via `pickColorFromId`), avatar overlay, display name, location line, optional Settings (gear) icon button (renders only when `showSettingsIcon`), optional Message button (renders only when `showMessageButton` — opens `UserPageMessagePopover` from T013). Zero `@mui/*` imports. All `aria-label`s on icon-only buttons. **No presence dot** (FR-010 — clarification)
- [ ] T013 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserPageMessagePopover.tsx` — Radix `Popover` containing a `Textarea` and a Send button. Props: `{ onSend: (text: string) => Promise<void>; placeholder: string }`. Closes on success, displays inline error on failure. Uses CRD `popover.tsx` + `textarea.tsx` + `button.tsx` primitives only. Forwarded by `UserPageHero`'s Message button

**Checkpoint**: All shared primitives and helpers ready. The public profile can now be built.

---

## Phase 3: User Story 1 — Public User Profile Page (Priority: P1) 🎯 MVP

**Goal**: `/user/:userSlug` renders the CRD hero + sidebar (bio + organizations) + sticky resource tab strip with the five tabs filtering the visible sections per the prototype.

**Independent Test**: Per quickstart.md "Public profile" — open `/user/<self>` and `/user/<other>` (as both regular user and platform admin); verify hero, sidebar, sticky strip, tab → section filter, no presence dot, Settings + Message visibility per the clarification, mobile horizontal-scroll on the strip.

### CRD presentational components

- [ ] T024 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserResourceTabStrip.tsx` per the `UserResourceTabStripProps` contract in `contracts/publicProfile.ts`. Five tabs (`allResources`, `hostedSpaces`, `virtualContributors`, `leading`, `memberOf`) — sticky to its scroll container; on `< md` uses `overflow-x-auto no-scrollbar` and auto-scrolls the active tab into view (same responsive logic as the settings tab strip in sibling spec 097 — extract a small shared helper if helpful)
- [ ] T025 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserResourceSections.tsx` per the `UserResourceSectionsProps` contract. Implements the tab → section filter from data-model.md exactly: `allResources` → all three sections; `hostedSpaces` / `virtualContributors` → the matching sub-section of Resources Hosted; `leading` / `memberOf` → the matching section. Empty sections are omitted (no empty container — FR-015). Reuse the existing CRD `SpaceCard` from `@/crd/components/space/SpaceCard.tsx` for space items; render VC items with `Sparkles` (or `Bot`) iconed cards
- [ ] T026 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserProfileSidebar.tsx` per `UserProfileSidebarProps`. Two sections: About (renders `bio` markdown via the existing `@/crd/components/common/MarkdownContent`) + Organizations (compact rows with avatar, name, role, member count). Hidden on `< lg` viewports
- [ ] T027 [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserPublicProfileView.tsx` per `UserPublicProfileViewProps`. Composes `UserPageHero` (T012) + `UserProfileSidebar` (T026) + `UserResourceTabStrip` (T024) + `UserResourceSections` (T025) into the two-column layout (sidebar 4 cols on `lg+`, hidden on smaller; right column 8 cols). Forwards `onClickSettings` and `onSendMessage` to the hero. Depends on T012, T024, T025, T026

### Integration

- [ ] T028 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.ts` per `data-model.md` "Entity: `UserPublicProfile`" + "Entity: `PublicProfileResources`". Pure function mapping `useUserQuery` + `useUserAccountQuery` + `useUserContributionsQuery` + `useUserOrganizationIdsQuery` results to the `UserPublicProfileViewProps['user']` shape. Reuses `useFilteredMemberships` to split memberships into "leading" vs "member-of"
- [ ] T029 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/publicProfile/useResourceTabs.ts` — `useState<ResourceTabKey>('allResources')` with a setter; persists nothing to URL (parity with prototype). Exposes `{ activeResourceTab, onSelectResourceTab }` for forwarding to the view
- [ ] T030 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/publicProfile/useSendMessageHandler.ts` — wraps `useSendMessageToUsersMutation` from `@/core/apollo/generated/apollo-hooks`, returning an `onSendMessage(text: string): Promise<void>` callback that fires `{ message, receiverIds: [userId] }` (mirrors `UserPageBanner.handleSendMessage` exactly)
- [ ] T031 [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/publicProfile/CrdUserProfilePage.tsx`. Reads `useUserPageRouteContext`, fires the four queries (user / userAccount / userContributions / userOrganizationIds), calls `publicProfileMapper`, gets `useResourceTabs` + `useSendMessageHandler`, computes `canEditSettings` via `useCanEditSettings`, and renders `<UserPublicProfileView>` with all props wired. The `onClickSettings` prop calls `useNavigate()` to `/user/<slug>/settings/profile`. Depends on T027, T028, T029, T030
- [ ] T032 [US1] Wire the public-profile route in `CrdUserRoutes.tsx` (T009): index route (`<Route index element={<CrdUserProfilePage />} />`) inside both the `me/*` and `:userNameId/*` blocks. Depends on T031

### Tests

- [ ] T033 [P] [US1] Unit-test `publicProfileMapper` at `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.test.ts`: a user with hosted spaces + VCs + leading + member-of → all four lists populated correctly; a user with empty memberships → empty arrays for all sections; sections with zero items map to empty arrays so the view can omit them
- [ ] T034 [P] [US1] Unit-test the tab → section filter: a small render test on `UserResourceSections` (with mocked `MarkdownContent` if needed) at `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserResourceSections.test.tsx`: `allResources` renders all three sections; `hostedSpaces` renders only the Spaces sub-section; etc. Uses fixtures from contracts

### Manual smoke

- [ ] T035 [US1] Run quickstart.md "Public profile" smoke checklist with the local dev server. Verify hero + sidebar + tab filter + Settings/Message visibility (own / non-admin other / admin other) + mobile horizontal-scroll. Capture any deviations as follow-up tasks

**Checkpoint**: User Story 1 complete — the public profile is independently demoable in CRD. MVP boundary.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: i18n completeness, lint, bundle delta, end-to-end smoke for the public profile.

### i18n + accessibility

- [ ] T102 [P] Translate every key in `userPages.en.json` (T003) to Dutch in `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.nl.json`
- [ ] T103 [P] Translate to Spanish in `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.es.json`
- [ ] T104 [P] Translate to Bulgarian in `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.bg.json`
- [ ] T105 [P] Translate to German in `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.de.json`
- [ ] T106 [P] Translate to French in `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.fr.json`
- [ ] T107 Add an i18n key-parity Vitest at `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/__tests__/keyParity.test.ts` — asserts every language file has the exact same key shape as the English source. Depends on T102–T106
- [ ] T108 [P] Run an `axe` accessibility scan against the CRD public profile page on the running dev server (or the prototype preview) and fix any critical / serious violations (SC-004). Document results in the PR description

### Cleanup, lint, bundle

- [ ] T110 Run `pnpm lint` from `/home/carlos/DEV/Alkemio/client-web/` and fix all reported issues (Biome / ESLint / TypeScript)
- [ ] T111 Run `pnpm vitest run` and confirm all tests pass (T008, T033, T034, T107)
- [ ] T112 Run `pnpm analyze` and verify the user-profile chunk delta is ≤ +20 KB gzipped over the previous build (SC-005). If not, document any unavoidable budget overrun in the PR description with mitigation plan
- [ ] T113 [P] Sweep every new file under `src/crd/components/user/`, `src/crd/i18n/userPages/`, and `src/main/crdPages/topLevelPages/userPages/publicProfile/` to confirm no `@mui/*`, `@emotion/*`, or generated GraphQL types leak through view imports (FR-005 / FR-006). Use `grep -rln '@mui\|@emotion\|@/core/apollo/generated' src/crd/components/user src/main/crdPages/topLevelPages/userPages/publicProfile`; expected output: only the mapper may show `@/core/apollo/generated`
- [ ] T114 [P] Sweep all CRD public-profile components for explicit `aria-label` on every icon-only button (Settings, Message, tab strip controls) per FR-110

### Final validation

- [ ] T115 Run the full quickstart.md smoke checklist end-to-end: User Story 1, every authorization variant (own / admin-other / non-admin-other / anonymous), every CRD-on/off toggle path. Capture any regressions as bugs to fix before merge
- [ ] T116 Confirm Success Criteria SC-001 through SC-006 from spec.md hold and document in PR description (5-s page-render flow; 100% URL parity; Message/Settings visibility matrix; zero critical/serious axe issues; ≤ +20 KB bundle delta; resource sections render correctly for 0 / 1 / 50+ memberships)

**Checkpoint**: User Story 1 complete, validated, and ready for merge alongside sibling spec 097-crd-user-settings.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. T001 must precede T002. T003–T005 are parallel siblings of T002.
- **Foundational (Phase 2)**: Depends on Setup completion. Internally:
  - T006, T007, T009 are parallel (different files); they are **[SHARED-097]** so coordinate with sibling spec 097.
  - T008 depends on T007.
  - T011 depends on T009.
  - T012, T013 are parallel siblings (different files).
- **User Story (Phase 3)**: Depends on Foundational. Once Foundational is complete, the public profile components can be built in parallel.
- **Polish (Phase 4)**: Depends on User Story 1 being complete (translations need final keys; lint/analyze run on the merged surface; final smoke covers everything).

### Parallel Opportunities

- **Within Phase 1**: T003, T004, T005 in parallel after T002 lands.
- **Within Phase 2**: T012–T013 (CRD primitives) parallel; T006, T007, T009 (helpers + route shells) parallel.
- **Within Phase 3**: T024–T026 (CRD components) parallel; T028–T030 (integration hooks + mapper) parallel; the page component (T031) and route wiring (T032) sequential at the end.
- **Within Phase 4**: T102–T106 (translations) all parallel; T108, T113, T114 parallel.

---

## Implementation Strategy

The public profile is User Story 1 of this spec — it is also the entry point of the entire user vertical. The ship-together rule (FR-001 / FR-002) couples this spec with sibling 097-crd-user-settings: both are gated by the same `useCrdEnabled` toggle and merge as one user-vertical release. The phases above are organized so the public profile can be developed and demoed independently, but the PR that merges to `develop` should land both 096 and 097 at once. Use the `alkemio-crd-enabled` localStorage toggle to gate developer / QA testing along the way.

---

## Notes

- **Tests included**: pure mapper unit tests (T033, T034); `useCanEditSettings` predicate (T008); i18n key parity (T107). No per-story functional UI tests — manual smoke per quickstart.md (precedent from 091/045).
- **[P] tasks** = different files, no dependencies on incomplete tasks.
- **[Story] label** maps each task to a specific user story for traceability — Setup, Foundational, and Polish phases have NO story label.
- **[SHARED-097]** label flags tasks shared with sibling spec 097-crd-user-settings — implement once, both specs benefit.
- Verify lint + tests after each phase; commit after each task or logical group.
- **Avoid**: vague tasks, same-file conflicts within a phase. CRD components MUST stay free of `@mui/*` / `@emotion/*` / `@/core/apollo/generated` imports; the mapper is the only place generated GraphQL types may surface.
