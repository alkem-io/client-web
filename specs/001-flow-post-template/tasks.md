# Tasks: Default Post Template for Flow Steps

**Input**: Design documents from `/specs/001-flow-post-template/`
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
  - Use structure from `specs/001-flow-post-template/contracts/TemplateContent.graphql` as reference
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

## Phase 4: User Story 2 - Member Creates Post with Default Template (Priority: P1)

**Goal**: Automatically pre-fill post creation dialog with template content when member creates a post in a flow step with a configured template

**Independent Test**:

1. As admin: Set a default template for a flow step (use US1)
2. As member: Navigate to a callout in that flow step
3. Click "Add Post"
4. Verify dialog opens with template content pre-filled
5. Edit content and create post successfully
6. Verify post in a different flow step (no template) opens with empty form

### Implementation for User Story 2

- [ ] T019 [US2] Create `useFlowStateDefaultTemplate.ts` hook in `src/domain/collaboration/InnovationFlow/hooks/useFlowStateDefaultTemplate.ts`
  - Accept `templateId` and `enabled` props
  - Use `useTemplateContentLazyQuery` to fetch template content
  - Return `{ defaultDescription: string | undefined, loading: boolean, error: ApolloError | undefined }`
  - Only query when `enabled` is true and `templateId` is not null
  - Extract `template.callout.contributionDefaults.postDescription` from query result
  - See implementation pattern in `specs/001-flow-post-template/plan.md` Section 9.1

- [ ] T020 [US2] Identify parent component that renders `CalloutView` with callout data
  - Use `Grep` to find `<CalloutView` usage
  - Verify component has access to `innovationFlow.states` data
  - Document component path in task notes

- [ ] T021 [US2] Update parent component to pass `flowStateDefaultTemplateId` to `CalloutView`
  - Add logic: `const flowStateName = callout.classification?.flowState?.tags[0]`
  - Add logic: `const flowState = innovationFlow?.states.find(s => s.displayName === flowStateName)`
  - Add logic: `const flowStateDefaultTemplateId = flowState?.defaultCalloutTemplate?.id`
  - Pass `flowStateDefaultTemplateId` prop to `CalloutView`

- [ ] T022 [US2] Update `CalloutView.tsx` to accept and pass through `flowStateDefaultTemplateId`
  - Add `flowStateDefaultTemplateId?: string` to props interface in `src/domain/collaboration/callout/CalloutView/CalloutView.tsx`
  - Pass prop to `ContributionsCardsExpandable` component

- [ ] T023 [US2] Update `ContributionsCardsExpandable.tsx` to accept and pass through `flowStateDefaultTemplateId`
  - Add `flowStateDefaultTemplateId?: string` to props interface in `src/domain/collaboration/calloutContributions/contributionsCardsExpandable/ContributionsCardsExpandable.tsx`
  - Pass prop to `CreateContributionButtonPost` component

- [ ] T024 [US2] Update `CreateContributionButtonPost.tsx` to load and use template content
  - Add `flowStateDefaultTemplateId?: string` to props interface in `src/domain/collaboration/calloutContributions/post/CreateContributionButtonPost.tsx`
  - Import `useFlowStateDefaultTemplate` hook
  - Call hook: `const { defaultDescription: templateDescription, loading: loadingTemplate } = useFlowStateDefaultTemplate({ templateId: flowStateDefaultTemplateId, enabled: postDialogOpen })`
  - Merge template with callout defaults: `const finalDefaultDescription = templateDescription ?? callout.contributionDefaults.postDescription`
  - Pass `finalDefaultDescription` to `PostCreationDialog` as `defaultDescription` prop
  - Update `creating` prop: `creating={creatingPost || loadingTemplate}`

- [ ] T025 [US2] Run `pnpm lint` to ensure no TypeScript or ESLint errors

- [ ] T026 [US2] Test member flow end-to-end per quickstart.md
  - Admin sets template for flow step (US1)
  - Member creates post in that flow step
  - Verify template content pre-fills
  - Verify member can edit and create post
  - Verify flow step without template shows empty form
  - Verify performance: template loads in <500ms

**Checkpoint**: User Story 2 is fully functional - members see template content when creating posts in configured flow steps

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

- [ ] T031 [P] Verify all translation keys exist for english only

- [ ] T032 Test edge cases from spec.md
  - Template deleted while set as default → verify graceful degradation
  - Multiple flow steps using same template → verify independent management
  - Flow step with both template and callout default → verify template takes precedence
  - Non-callout template → verify filtered out of selector

- [ ] T033 Performance validation
  - Verify template content loads in <500ms
  - Verify dialog opens immediately (non-blocking)
  - Verify no UI blocking during template fetch
  - Use Chrome DevTools Performance tab to measure

- [ ] T034 Run full validation per `specs/001-flow-post-template/quickstart.md`
  - Follow all admin flow test steps
  - Follow all member flow test steps
  - Follow all edge case test steps
  - Document any issues found

- [ ] T035 [P] Update CLAUDE.md if new patterns introduced
  - Document `useFlowStateDefaultTemplate` hook pattern if novel
  - Only if significantly different from existing hooks

- [ ] T036 Final linting and type checking
  - Run `pnpm lint` to ensure all code passes
  - Run `pnpm tsc --noEmit` to verify no type errors
  - Fix any issues found

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
- See `specs/001-flow-post-template/quickstart.md` for detailed test scenarios
- See `specs/001-flow-post-template/research.md` for architectural decisions
- See `specs/001-flow-post-template/data-model.md` for entity relationships
