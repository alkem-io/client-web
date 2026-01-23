# Tasks: Dynamic Page Title in Browser Tabs

**Input**: Design documents from `/specs/6557-dynamic-page-title/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Unit tests are included for the core hook functionality.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Core hook creation and i18n key setup

- [x] T001 Create `usePageTitle` hook in `src/core/routing/usePageTitle.ts`
- [x] T002 [P] Add page title i18n keys to `src/core/i18n/en/translation.en.json` under `pages.titles` section
- [x] T003 [P] Create unit tests for `usePageTitle` hook in `src/core/routing/usePageTitle.test.ts`

**Checkpoint**: Core infrastructure ready - hook exists, i18n keys defined, tests passing

---

## Phase 2: User Story 1 - Dynamic Space Titles (Priority: P1) 🎯 MVP

**Goal**: Browser tab shows space/subspace name when viewing any space page

**Independent Test**: Navigate to any space page and verify the browser tab shows "[Space Name] | Alkemio"

### Implementation for User Story 1

- [x] T004 [US1] Integrate `usePageTitle` in `src/domain/space/layout/SpacePageLayout.tsx` using `useSpace()` context
- [x] T005 [US1] Integrate `usePageTitle` in `src/domain/space/layout/SubspacePageLayout.tsx` using `useSubSpace()` context for L1/L2 subspaces

**Checkpoint**: Space and subspace pages display dynamic titles based on entity names

---

## Phase 3: User Story 2 - Static Page Titles (Priority: P1)

**Goal**: All static top-level pages display descriptive titles

**Independent Test**: Navigate to any static page (Forum, Contributors, Spaces, etc.) and verify the appropriate title appears

### Implementation for User Story 2

- [x] T006 [US2] Integrate `usePageTitle` in `src/main/topLevelPages/Home/HomePage.tsx` with `skipSuffix: true`
- [x] T007 [P] [US2] Integrate `usePageTitle` in `src/domain/communication/discussion/pages/ForumPage.tsx` with i18n key `pages.titles.forum`
- [x] T008 [P] [US2] Integrate `usePageTitle` in `src/main/topLevelPages/topLevelSpaces/SpaceExplorerPage.tsx` with i18n key `pages.titles.spaces`
- [x] T009 [P] [US2] Integrate `usePageTitle` in `src/domain/community/user/ContributorsPage.tsx` with i18n key `pages.titles.contributors`
- [x] T010 [P] [US2] Integrate `usePageTitle` in `src/main/topLevelPages/InnovationLibraryPage/InnovationLibraryPage.tsx` with i18n key `pages.titles.templateLibrary`
- [x] T011 [P] [US2] Integrate `usePageTitle` in `src/domain/platformAdmin/routing/PlatformAdminRoute.tsx` with i18n key `pages.titles.globalAdmin`
- [x] T012 [P] [US2] Integrate `usePageTitle` in `src/domain/community/userAdmin/layout/UserAdminLayout.tsx` with i18n key `pages.titles.admin`
- [x] T013 [P] [US2] Integrate `usePageTitle` in `src/main/documentation/DocumentationPage.tsx` with i18n key `pages.titles.documentation`
- [x] T014 [P] [US2] Integrate `usePageTitle` in `src/core/auth/authentication/pages/LoginPage.tsx` with i18n key `pages.titles.signIn`
- [x] T015 [P] [US2] Integrate `usePageTitle` in `src/core/auth/authentication/pages/SignUp.tsx` with i18n key `pages.titles.signUp`
- [x] T016 [P] [US2] Integrate `usePageTitle` in `src/core/pages/Errors/Error404.tsx` with i18n key `pages.titles.notFound`
- [x] T017 [P] [US2] Integrate `usePageTitle` in `src/core/pages/Errors/Error403.tsx` with i18n key `pages.titles.restricted`

**Checkpoint**: All static pages display correct titles as per Page Title Matrix

---

## Phase 4: User Story 3 - Contributor Profile Titles (Priority: P2)

**Goal**: Contributor profiles (users, organizations, VCs) show entity names in tab titles

**Independent Test**: Navigate to any user, organization, or virtual contributor profile and verify the name appears in the tab

### Implementation for User Story 3

- [x] T018 [P] [US3] Integrate `usePageTitle` in `src/domain/community/user/layout/UserPageLayout.tsx` with user profile displayName
- [x] T019 [P] [US3] Integrate `usePageTitle` in `src/domain/community/organization/layout/OrganizationPageLayout.tsx` with org profile displayName
- [x] T020 [P] [US3] Integrate `usePageTitle` in `src/domain/community/virtualContributor/layout/VCPageLayout.tsx` with VC profile displayName

**Checkpoint**: All contributor profile pages display entity names in browser tab

---

## Phase 5: User Story 4 - Innovation Pack and Template Titles (Priority: P2)

**Goal**: Innovation pack pages display descriptive titles with library context

**Independent Test**: Navigate to an innovation pack page and verify the title format includes the pack name and library context

### Implementation for User Story 4

- [x] T021 [US4] Integrate `usePageTitle` in `src/domain/InnovationPack/InnovationPackProfilePage/InnovationPackProfileLayout.tsx` with format "[Pack Name] | Template Library"

**Checkpoint**: Innovation pack pages show "[Pack Name] | Template Library | Alkemio" format

---

## Phase 6: User Story 5 - Title Updates on Navigation (Priority: P1)

**Goal**: Verify titles update correctly during SPA navigation and loading states

**Independent Test**: Navigate between different pages using in-app links and verify the title updates for each navigation

### Implementation for User Story 5

> Note: This is largely validated by the hook implementation in T001. These tasks ensure edge cases are handled.

- [x] T022 [US5] Verify hook cleanup on component unmount - ensure no stale titles persist
- [x] T023 [US5] Verify fallback behavior when entity data is undefined/loading (should show "Alkemio")

**Checkpoint**: Titles update smoothly during navigation; fallback to "Alkemio" during loading states

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T024 [P] Run TypeScript type checking (`pnpm run ts:watch`) - verify no errors
- [x] T025 [P] Run linting (`pnpm lint`) - verify no errors
- [x] T026 [P] Run unit tests (`pnpm vitest run`) - verify all tests pass
- [ ] T027 Manual testing across all page types per Page Title Matrix in spec.md
- [ ] T028 Verify no page displays default HTML title after app load completes (SC-004)
- [ ] T029 Run quickstart.md verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Stories (Phases 2-6)**: All depend on Setup (T001-T003) completion
  - User stories can proceed in parallel after Setup
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Setup - No dependencies on other stories
- **User Story 2 (P1)**: Depends only on Setup - No dependencies on other stories
- **User Story 3 (P2)**: Depends only on Setup - No dependencies on other stories
- **User Story 4 (P2)**: Depends only on Setup - No dependencies on other stories
- **User Story 5 (P1)**: Validation story - depends on hook from Setup being implemented

### Parallel Opportunities

**Within Setup (Phase 1)**:

- T002 and T003 can run in parallel (different files)

**After Setup completes**:

- All user story phases can start in parallel
- Within US2: T007-T017 can all run in parallel (different files)
- Within US3: T018-T020 can all run in parallel (different files)
- Within Polish: T024-T026 can all run in parallel

---

## Parallel Example: User Story 2 Static Pages

```bash
# After T001-T003 complete, launch all static page integrations:
Task: "Integrate usePageTitle in ForumPage.tsx"           # T007
Task: "Integrate usePageTitle in SpaceExplorerPage.tsx"   # T008
Task: "Integrate usePageTitle in Contributors page"       # T009
Task: "Integrate usePageTitle in InnovationLibraryPage"   # T010
Task: "Integrate usePageTitle in PlatformAdminRoute"      # T011
Task: "Integrate usePageTitle in admin/settings pages"    # T012
Task: "Integrate usePageTitle in DocumentationPage"       # T013
Task: "Integrate usePageTitle in Sign In page"            # T014
Task: "Integrate usePageTitle in Sign Up page"            # T015
Task: "Integrate usePageTitle in 404 page"                # T016
Task: "Integrate usePageTitle in Access Restricted page"  # T017
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 5)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: User Story 1 - Space titles (T004-T005)
3. Complete Phase 3: User Story 2 - Static pages (T006-T017)
4. Complete Phase 6: User Story 5 - Navigation validation (T022-T023)
5. **STOP and VALIDATE**: Test core functionality
6. Deploy/demo if ready

### Incremental Delivery

1. Setup → Core hook and i18n ready
2. Add US1 (Spaces) → Test independently → Most impactful feature
3. Add US2 (Static) → Test independently → Complete coverage of common pages
4. Add US3 (Profiles) → Test independently → Contributor pages covered
5. Add US4 (Packs) → Test independently → Template library covered
6. Polish → Final validation and cleanup

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Entity names come from existing contexts - no new GraphQL needed
- Hook uses React 19 patterns (useEffect for side effects)
- i18n keys added only to English file; translations handled by Crowdin
