# Tasks: SubSpace Innovation Flow Replace Options

**Input**: Design documents from `/specs/001-subspace-flow-replace-options/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Reference**: [GitHub Issue #8895](https://github.com/alkem-io/client-web/issues/8895)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Domain logic**: `src/domain/collaboration/InnovationFlow/`
- **Templates UI**: `src/domain/templates/components/Dialogs/`
- **Translations**: `src/core/i18n/en/translation.en.json`
- **GraphQL ops**: `src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/`

---

## Phase 1: Setup (Backend Coordination)

**Purpose**: Ensure backend API supports the new `deleteExistingCallouts` parameter

**⚠️ BLOCKING**: This phase must be complete before any frontend implementation can proceed.

- [ ] T001 Coordinate with backend team to add `deleteExistingCallouts: Boolean` parameter to `UpdateCollaborationFromSpaceTemplateInput` GraphQL type
- [ ] T002 Wait for backend deployment with new API parameter
- [ ] T003 Run `pnpm codegen` to regenerate GraphQL types in src/core/apollo/generated/
- [ ] T004 Verify `UpdateCollaborationFromSpaceTemplateInput` includes `deleteExistingCallouts` field in src/core/apollo/generated/graphql-schema.ts

**Checkpoint**: Backend API ready - frontend implementation can begin

---

## Phase 2: Foundational (GraphQL Layer Update)

**Purpose**: Update GraphQL mutation and hook to support all three options

**⚠️ CRITICAL**: Must complete before UI work (Phase 3+) can begin

- [x] T005 Update GraphQL mutation to include `deleteExistingCallouts` parameter in src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettings.graphql
- [x] T006 Create `ImportFlowOptions` interface type in src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings.tsx
- [x] T007 Update `handleImportInnovationFlowFromSpaceTemplate` handler signature to accept options object in src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings.tsx
- [x] T008 Update mutation call to pass `deleteExistingCallouts` variable in src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings.tsx

**Checkpoint**: GraphQL layer ready - UI implementation can now begin

---

## Phase 3: User Story 1 - Complete Flow Replacement with Clean Slate (Priority: P1) 🎯 MVP

**Goal**: Allow users to delete all existing posts and replace with template posts (with confirmation dialog)

**Independent Test**: Select a new innovation flow template, choose Option 1 (Replace All), confirm deletion, and verify all previous posts are removed and new template posts are created.

### Implementation for User Story 1

- [x] T009 [P] [US1] Create `FlowReplaceOption` enum type in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T010 [P] [US1] Add translation keys for Option 1 ("Replace all posts") in src/core/i18n/en/translation.en.json under `components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog`
- [x] T011 [P] [US1] Add translation keys for confirmation dialog (title, description, confirm button) in src/core/i18n/en/translation.en.json
- [x] T012 [US1] Add Option 1 radio button with description to `OPTIONS` array in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T013 [US1] Refactor state from `addCallouts: boolean` to `selectedOption: FlowReplaceOption` in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T014 [US1] Add confirmation dialog state (`confirmDeleteDialogOpen`) in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T015 [US1] Implement confirmation dialog using `ConfirmationDialog` component for Option 1 in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T016 [US1] Update `handleConfirm` to check selected option and show confirmation for Option 1 in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T017 [US1] Implement `onConfirm` callback to call mutation with `deleteExistingCallouts: true, addCallouts: true` in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T018 [US1] Update dialog props interface to pass new `onConfirm` signature with options in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T019 [US1] Update `InnovationFlowSettingsDialog` to pass new handler signature in src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettingsDialog.tsx

**Checkpoint**: User Story 1 (Replace All) should be fully functional - users can delete all posts and replace with template posts

---

## Phase 4: User Story 2 - Flow Replacement with Content Merge (Priority: P2)

**Goal**: Allow users to keep existing posts and add template posts alongside them (existing behavior, now as explicit option)

**Independent Test**: Select a new innovation flow template, choose Option 2 (Add Template Posts), and verify existing posts remain and new template posts are added.

### Implementation for User Story 2

- [x] T020 [P] [US2] Add translation keys for Option 2 description (if different from existing) in src/core/i18n/en/translation.en.json
- [x] T021 [US2] Add Option 2 radio button with description to `OPTIONS` array in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T022 [US2] Implement Option 2 logic to call mutation with `deleteExistingCallouts: false, addCallouts: true` in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T023 [US2] Verify Option 2 does NOT show confirmation dialog (non-destructive) in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx

**Checkpoint**: User Story 2 (Add Template Posts) should work - existing posts preserved with new template posts added

---

## Phase 5: User Story 3 - Flow-Only Replacement (Priority: P3)

**Goal**: Allow users to replace only the innovation flow structure, keeping existing posts unchanged (no new posts added)

**Independent Test**: Select a new innovation flow template, choose Option 3 (Flow Only), and verify the flow structure changes but all existing posts remain exactly as they were with no new posts added.

### Implementation for User Story 3

- [x] T024 [P] [US3] Add translation keys for Option 3 description (if different from existing) in src/core/i18n/en/translation.en.json
- [x] T025 [US3] Add Option 3 radio button with description to `OPTIONS` array in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T026 [US3] Implement Option 3 logic to call mutation with `deleteExistingCallouts: false, addCallouts: false` in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T027 [US3] Verify Option 3 does NOT show confirmation dialog (non-destructive) in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx

**Checkpoint**: User Story 3 (Flow Only) should work - flow changes without affecting posts

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, accessibility, and final validation

- [x] T028 [P] Handle edge case: Skip confirmation dialog for Option 1 when SubSpace has no existing posts in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T029 [P] Handle edge case: Template has no callouts (all options should still work) in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T030 [P] Add aria-label attributes to radio buttons for accessibility in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T031 [P] Verify keyboard navigation works correctly for all options in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T032 Verify error handling displays user-friendly messages on mutation failure in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx
- [x] T033 Run `pnpm lint` and fix any linting issues
- [ ] T034 Manual testing: Test all three options against Figma design specifications
- [ ] T035 Manual testing: Verify all acceptance scenarios from spec.md pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - coordinate with backend team immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (backend API ready) - BLOCKS all UI work
- **User Stories (Phase 3-5)**: All depend on Phase 2 completion
  - User stories can proceed sequentially (P1 → P2 → P3) or in parallel
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on US1/US2

### Within Each User Story

- Translation keys before UI implementation
- State changes before event handlers
- Core implementation before edge cases

### Parallel Opportunities

- T009, T010, T011 (US1 translations and types) can run in parallel
- T020, T024 (US2/US3 translations) can run in parallel
- T028, T029, T030, T031 (Polish edge cases and a11y) can run in parallel
- Different user stories can be worked on in parallel by different team members once Phase 2 is complete

---

## Parallel Example: User Story 1

```bash
# Launch all parallel tasks for User Story 1 together:
Task: "Create FlowReplaceOption enum type in src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx"
Task: "Add translation keys for Option 1 in src/core/i18n/en/translation.en.json"
Task: "Add translation keys for confirmation dialog in src/core/i18n/en/translation.en.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Backend Coordination (wait for API)
2. Complete Phase 2: GraphQL Layer Update
3. Complete Phase 3: User Story 1 (Replace All)
4. **STOP and VALIDATE**: Test Option 1 independently with confirmation dialog
5. Deploy if ready - core pain point is solved

### Incremental Delivery

1. Complete Setup + Foundational → GraphQL ready
2. Add User Story 1 → Test independently → Deploy (MVP - solves main pain point!)
3. Add User Story 2 → Test independently → Deploy (existing behavior now explicit)
4. Add User Story 3 → Test independently → Deploy (safest option added)
5. Add Polish → Complete feature with edge cases and accessibility

### Full Feature Delivery

All 35 tasks complete:

- 3 options fully functional
- Confirmation dialog for destructive action
- All edge cases handled
- Accessibility verified
- Figma design alignment confirmed

---

## Notes

- **BLOCKING**: Backend API change is required before any frontend work can begin
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Stop at any checkpoint to validate story independently
- Avoid: cross-story dependencies that break independence
- All user-visible strings MUST use `t()` function from react-i18next
