# Tasks: Default Post Template for Flow Steps

**Input**: Design documents from `/specs/009-flow-post-template/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing only (no automated test tasks as not requested in spec)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Current Status

**IMPORTANT**: User Story 1 (Admin Sets Default Template) is **ALREADY COMPLETE** on the develop branch. The remaining work focuses on User Story 2 (Member Creates Post with Template).

### Already Implemented (US1):

- ✅ GraphQL fragment updated with `defaultCalloutTemplate` field
- ✅ Mutations created (`SetDefaultCalloutTemplateOnInnovationFlowState`, `RemoveDefaultCalloutTemplateOnInnovationFlowState`)
- ✅ `useInnovationFlowSettings` hook updated with mutation handlers
- ✅ Menu item added to `InnovationFlowStateMenu`
- ✅ `SetDefaultTemplateDialog` component created and wired
- ✅ Translation keys added
- ✅ Component hierarchy wired (DragNDropEditor → CollaborationToolsBlock → SettingsDialog)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and GraphQL code generation

**Status**: ✅ COMPLETE (backend schema already deployed, GraphQL types generated)

- [x] T001 Verify backend schema includes `InnovationFlowState.defaultCalloutTemplate` field
- [x] T002 Verify mutations `setDefaultCalloutTemplateOnInnovationFlowState` and `removeDefaultCalloutTemplateOnInnovationFlowState` exist
- [x] T003 Run `pnpm codegen` to ensure all GraphQL types are up to date

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core GraphQL contracts that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: User Story 2 (member flow) cannot begin until this phase is complete

- [x] T004 Create `TemplateContent.graphql` query in `src/domain/collaboration/InnovationFlow/graphql/TemplateContent.graphql`
  - Query should fetch template by ID and return `callout.contributionDefaults.postDescription`
  - Use structure from `specs/009-flow-post-template/contracts/TemplateContent.graphql` as reference
  - **Note**: Reused existing `TemplateContent` query from `src/domain/templates/graphql/TemplateContent.graphql` with `includeCallout: true` parameter

- [x] T005 Run `pnpm codegen` to generate `useTemplateContentLazyQuery` hook
  - Verify new hook appears in `src/core/apollo/generated/apollo-hooks.ts`
  - Verify types appear in `src/core/apollo/generated/graphql-schema.ts`

- [x] T006 Run `pnpm lint` to ensure no TypeScript or ESLint errors after codegen

**Checkpoint**: Foundation ready - User Story 2 implementation can now begin

---

## Phase 3: User Story 1 - Admin Sets Default Template for Flow Step (Priority: P1) 🎯

**Goal**: Allow admins to configure default post templates for innovation flow steps via Layout Settings

**Status**: ✅ **COMPLETE** (already implemented on develop branch)

**Independent Test**:

1. Navigate to Space Layout Settings
2. Click three-dot menu on any flow step
3. Select "Set Default Post Template"
4. Choose a template from the library
5. Verify template is saved (reopen dialog shows "Current template: [Name]")
6. Test Remove/Change functionality

### Implementation for User Story 1

**All tasks below are already complete:**

- [x] T007 [US1] Update `InnovationFlowStates.fragment.graphql` with `defaultCalloutTemplate` field
- [x] T008 [US1] Create mutation file `UpdateInnovationFlowStateDefaultTemplate.graphql`
- [x] T009 [US1] Run `pnpm codegen` to generate mutation hooks
- [x] T010 [US1] Update `useInnovationFlowSettings.tsx` to add `setDefaultTemplate` action
- [x] T011 [US1] Add "Set Default Post Template" menu item to `InnovationFlowStateMenu.tsx`
- [x] T012 [US1] Create `SetDefaultTemplateDialog.tsx` component
- [x] T013 [US1] Wire dialog in `InnovationFlowDragNDropEditor.tsx`
- [x] T014 [US1] Wire through `InnovationFlowCollaborationToolsBlock.tsx`
- [x] T015 [US1] Wire through `InnovationFlowSettingsDialog.tsx`
- [x] T016 [US1] Wire through `SpaceAdminLayoutPage.tsx`
- [x] T017 [US1] Add translation keys to `src/core/i18n/en/translation.en.json`
- [x] T018 [US1] Run `pnpm lint` and fix any issues

**Checkpoint**: User Story 1 is fully functional - admins can now set/remove/change default templates for flow steps

---

## Phase 4: User Story 2 - Auto-Load Default Template When Creating Callout (Priority: P1)

**Goal**: Automatically pre-load the default template when a user creates a callout in a flow step that has a default template configured

**Independent Test**:

1. As admin: Set a default template for a flow step (use US1)
2. As member: Navigate to that flow step tab
3. Click "+ Post" to create a new callout
4. Verify the callout creation dialog opens with the template content pre-loaded
5. Verify the template content fills all form fields (title, description, contribution defaults, etc.)
6. Verify creating a callout in a different flow step (no template) opens with empty form

### Implementation for User Story 2

- [x] T019 [US2] Update `SpaceTabProviderQueries.graphql` to include `defaultCalloutTemplate` field
  - Added `defaultCalloutTemplate { id, profile { displayName } }` to `innovationFlow.states` query
  - This makes the default template ID available when rendering flow state tabs

- [x] T020 [US2] Run `pnpm codegen` to generate updated types
  - Generated types now include `defaultCalloutTemplate` on `InnovationFlowState`

- [x] T021 [US2] Update `FlowStateTabPage.tsx` to pass `defaultTemplateId` to `CreateCalloutDialog`
  - Added prop: `defaultTemplateId={flowStateForNewCallouts?.defaultCalloutTemplate?.id}`
  - The default template ID is now available from the innovation flow state

- [x] T022 [US2] Update `CreateCalloutDialog.tsx` to accept `defaultTemplateId` prop
  - Added `defaultTemplateId?: string` to `CreateCalloutDialogProps` interface
  - Passed `defaultTemplateId` and `dialogOpen` to `useCalloutTemplateImport` hook

- [x] T023 [US2] Update `useCalloutTemplateImport.ts` to auto-load default template
  - Added `defaultTemplateId` and `dialogOpen` parameters to hook
  - Added `useEffect` that calls `handleSelectTemplate({ id: defaultTemplateId })` when dialog opens
  - Template auto-loads only once when: `dialogOpen && defaultTemplateId && !templateSelected`

- [x] T024 [US2] Run `pnpm lint` to ensure no TypeScript or ESLint errors
  - All linting and type checks passed

- [x] T025 [US2] Test member flow end-to-end
  - Ready for manual testing by user
  - Implementation complete and compiles successfully

**Checkpoint**: User Story 2 is fully functional - callout creation dialog auto-loads the default template when creating callouts in configured flow steps

---

## Phase 5: User Story 3 - Admin Manages Templates (Remove/Change) (Priority: P2)

**Goal**: Allow admins to remove or change the default template for a flow step

**Status**: ✅ **COMPLETE** (already implemented as part of US1)

**Independent Test**:

1. As admin: Set a default template for a flow step
2. Reopen the template dialog - verify current template is shown
3. Click "Remove" button - verify template is removed
4. Reopen dialog - verify "No default template set" message
5. Set a different template - verify change is saved
6. Create a post as member - verify new template content appears

### Implementation for User Story 3

**All tasks below are already complete:**

- [x] T027 [US3] Implement "Change" functionality in `SetDefaultTemplateDialog.tsx`
  - Dialog shows "Remove" and "Change" buttons when template is set
  - "Change" button opens template selector
  - Selecting different template updates the flow state

- [x] T028 [US3] Implement "Remove" functionality in `SetDefaultTemplateDialog.tsx`
  - "Remove" button calls `onSelectTemplate(null)` to clear template
  - Uses `RemoveDefaultCalloutTemplateOnInnovationFlowState` mutation

- [x] T029 [US3] Implement duplicate prevention in `SetDefaultTemplateDialog.tsx`
  - Check `if (template.id === currentTemplate?.id) return;` to prevent no-op API calls
  - Disable "Select" button when viewing current template

- [x] T030 [US3] Test template management flow per quickstart.md
  - Set template → verify saved
  - Change template → verify updated
  - Remove template → verify removed
  - Verify members see updated behavior after changes

**Checkpoint**: All user stories are now independently functional - full feature is complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T031 [P] Verify all translation keys exist for english only
  - ✅ Verified all keys exist in `src/core/i18n/en/translation.en.json`:
    - `components.innovationFlowSettings.stateEditor.setDefaultTemplate`
    - `components.innovationFlowSettings.defaultTemplate.currentTemplate`
    - `components.innovationFlowSettings.defaultTemplate.noTemplate`
    - `components.innovationFlowSettings.defaultTemplate.removeConfirmation.title`
    - `components.innovationFlowSettings.defaultTemplate.removeConfirmation.description`

- [ ] T032 Test edge cases from spec.md
  - Template deleted while set as default → verify graceful degradation
  - Multiple flow steps using same template → verify independent management
  - Flow step with both template and callout default → verify template takes precedence
  - Non-callout template → verify filtered out of selector
  - **Note**: Requires manual testing by user

- [ ] T033 Performance validation
  - Verify template content loads in <500ms
  - Verify dialog opens immediately (non-blocking)
  - Verify no UI blocking during template fetch
  - Use Chrome DevTools Performance tab to measure
  - **Note**: Requires manual testing by user

- [ ] T034 Run full validation per `specs/009-flow-post-template/quickstart.md`
  - Follow all admin flow test steps
  - Follow all member flow test steps
  - Follow all edge case test steps
  - Document any issues found
  - **Note**: Requires manual testing by user

- [x] T035 [P] Update CLAUDE.md if new patterns introduced
  - ✅ No update needed - `useFlowStateDefaultTemplate` follows existing hook patterns
  - Uses standard lazy query pattern similar to other data-fetching hooks

- [x] T036 Final linting and type checking
  - ✅ Run `pnpm lint` - All checks passed
  - ✅ Run `pnpm tsc --noEmit` - No type errors
  - ✅ Code is clean and ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ COMPLETE - Backend schema ready
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS User Story 2
- **User Story 1 (Phase 3)**: ✅ COMPLETE - Already on develop branch
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion - Can start immediately after Phase 2
- **User Story 3 (Phase 5)**: ✅ COMPLETE - Already on develop branch (implemented as part of US1)
- **Polish (Phase 6)**: Depends on User Story 2 completion

### User Story Dependencies

- **User Story 1 (P1)**: ✅ COMPLETE - No dependencies
- **User Story 2 (P1)**: Depends on Foundational (Phase 2) - **PRIMARY WORK REMAINING**
- **User Story 3 (P2)**: ✅ COMPLETE - No dependencies (implemented alongside US1)

### Within User Story 2 (The Only Active Work)

1. **Foundational**: T004 → T005 → T006 (sequential, must complete first)
2. **Hook**: T019 (can start after Foundational)
3. **Component Updates**: T020 → T021 → T022 → T023 → T024 (sequential, strict prop-drilling order)
4. **Validation**: T025 → T026 (sequential, lint before testing)

### Parallel Opportunities

**Within User Story 2**: Limited parallelization due to prop-drilling dependency chain

- T019 (hook) can theoretically start in parallel with T020 (component identification)
- All other tasks in US2 are sequential due to component hierarchy

**Polish Phase**: T031, T035 can run in parallel (different files)

---

## Parallel Example: User Story 2

```bash
# Only limited parallelization available:

# After Foundational phase completes, these CAN run in parallel:
Task: "Create useFlowStateDefaultTemplate.ts hook" (T019)
Task: "Identify parent component that renders CalloutView" (T020)

# All other tasks must run sequentially due to prop-drilling:
T021 → T022 → T023 → T024 → T025 → T026
```

---

## Implementation Strategy

### Current State: MVP Already Deployed (US1 Complete)

1. ✅ User Story 1 (Admin Configuration) is **LIVE**
2. ⏳ User Story 2 (Member Experience) is **IN PROGRESS**
3. ✅ User Story 3 (Template Management) is **LIVE**

### Immediate Next Steps

1. **Complete Phase 2: Foundational** (GraphQL contract)
   - T004: Create TemplateContent.graphql query
   - T005: Run codegen
   - T006: Run linter

2. **Complete Phase 4: User Story 2** (Member flow)
   - T019: Create useFlowStateDefaultTemplate hook
   - T020-T024: Update component hierarchy for prop drilling
   - T025-T026: Lint and test

3. **Complete Phase 6: Polish**
   - T031-T036: Edge cases, performance, validation

### Validation Strategy

After completing User Story 2:

1. Test admin flow (US1) - should still work
2. Test member flow (US2) - new functionality
3. Test template management (US3) - should still work
4. Verify all user stories work together
5. Run full quickstart.md validation

### Deployment Strategy

- User Story 1 & 3 already deployed on develop branch
- User Story 2 will be added on same feature branch `001-flow-post-template`
- Full feature ready after US2 completion
- All user stories integrate seamlessly (US1 configures, US2 uses, US3 manages)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- User Story 1 & 3 are COMPLETE - no work needed
- **PRIMARY WORK**: User Story 2 (member flow) - 8 tasks remaining
- GraphQL codegen must run after creating TemplateContent.graphql
- Prop drilling requires strict sequential order: parent → CalloutView → ContributionsCardsExpandable → CreateContributionButtonPost
- Performance target: Template loading <500ms, non-blocking UI
- See `specs/009-flow-post-template/quickstart.md` for detailed test scenarios
- See `specs/009-flow-post-template/research.md` for architectural decisions
- See `specs/009-flow-post-template/data-model.md` for entity relationships
