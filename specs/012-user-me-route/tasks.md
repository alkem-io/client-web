# Tasks: User "Me" Route Shortcut

**Input**: Design documents from `/specs/012-user-me-route/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested in feature specification - test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization - no setup required for this feature

This feature uses the existing project structure and dependencies. No new packages or configuration needed.

**Checkpoint**: No setup tasks required - proceed to Foundational phase

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 [P] Create MeUserContext with provider and hook in src/domain/community/user/routing/MeUserContext.tsx
- [X] T002 [P] Create UserMeRoute wrapper component in src/domain/community/user/routing/UserMeRoute.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Access Own Profile via `/user/me` (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can navigate to `/user/me` and see their own profile page without knowing their nameId

**Independent Test**: Log in as any user, navigate to `/user/me`, verify your profile is displayed with all content (display name, bio, avatar), URL remains `/user/me`

### Implementation for User Story 1

- [X] T003 [US1] Modify UserRoute to add `/me/*` route before `:userNameId/*` in src/domain/community/user/routing/UserRoute.tsx
- [X] T004 [US1] Modify UserProfilePage to check MeUserContext before useUrlResolver in src/domain/community/user/userProfilePage/UserProfilePage.tsx
- [X] T005 [US1] Verify sub-routes work under `/user/me/*` (settings, contributions) by testing route structure

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Unauthenticated Access Handling (Priority: P1)

**Goal**: Unauthenticated visitors accessing `/user/me` are redirected to login, then returned to `/user/me` after authentication

**Independent Test**: Log out, navigate to `/user/me`, verify redirect to login page, complete login, verify redirect back to `/user/me` showing your profile

### Implementation for User Story 2

- [X] T006 [US2] Verify NoIdentityRedirect wraps `/me/*` route correctly in src/domain/community/user/routing/UserRoute.tsx
- [X] T007 [US2] Verify loading states display correctly while authentication and user data loads

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup that affect the complete feature

- [X] T008 Run quickstart.md manual validation checklist
- [X] T009 Verify URL remains `/user/me` throughout navigation (no client-side redirect to `/user/{nameId}`)
- [X] T010 Run `pnpm lint` and fix any issues
- [X] T011 Run `pnpm vitest run` to ensure no regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No tasks - skip
- **Foundational (Phase 2)**: No dependencies - can start immediately - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Both US1 and US2 are P1 priority but US2 verification depends on US1 routes being in place

### Within Each Phase

**Foundational Phase**:
- T001 and T002 can run in parallel (different files)

**User Story 1**:
- T003 must complete before T004 (route must exist before profile page modification)
- T005 depends on T003 (verifying route structure)

**User Story 2**:
- T006 and T007 depend on T003 being complete (routes must exist)

### Parallel Opportunities

- T001 and T002 can run in parallel (foundational phase)
- User Story 1 and User Story 2 implementation can run in parallel after T003 completes
- All Polish phase tasks marked with [P] could theoretically run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch both foundational tasks together:
Task: "Create MeUserContext in src/domain/community/user/routing/MeUserContext.tsx"
Task: "Create UserMeRoute in src/domain/community/user/routing/UserMeRoute.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001, T002)
2. Complete Phase 3: User Story 1 (T003, T004, T005)
3. **STOP and VALIDATE**: Navigate to `/user/me` as authenticated user, verify profile displays
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational (T001-T002) → Foundation ready
2. Add User Story 1 (T003-T005) → Test independently → Profile accessible via `/user/me` (MVP!)
3. Add User Story 2 (T006-T007) → Test independently → Login redirect working
4. Polish (T008-T011) → Full validation complete

### Single Developer Strategy

Execute in order:
1. T001 → T002 (or parallel if comfortable)
2. T003 → T004 → T005
3. T006 → T007
4. T008 → T009 → T010 → T011

---

## Files Summary

### Files to Create

| File | Task | Description |
|------|------|-------------|
| `src/domain/community/user/routing/MeUserContext.tsx` | T001 | Context providing current user ID for "me" routes |
| `src/domain/community/user/routing/UserMeRoute.tsx` | T002 | Wrapper component for `/user/me/*` routes |

### Files to Modify

| File | Task | Description |
|------|------|-------------|
| `src/domain/community/user/routing/UserRoute.tsx` | T003, T006 | Add `/me/*` route before `:userNameId/*` |
| `src/domain/community/user/userProfilePage/UserProfilePage.tsx` | T004 | Check MeUserContext before useUrlResolver |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No new GraphQL operations needed - feature reuses existing hooks
- No backend changes required - frontend-only routing enhancement
- Authentication already handled by existing `NoIdentityRedirect` wrapper
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
