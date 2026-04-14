# Tasks: Account Templates in Template Picker Dialog

**Input**: Design documents from `/specs/041-account-templates-dialog/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the new GraphQL query, i18n key, and Space account context needed by all user stories

- [x] T001 Add `ImportTemplateDialogAccountTemplates` query from `specs/041-account-templates-dialog/contracts/ImportTemplateDialogAccountTemplates.graphql` to `src/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplateDialog.graphql`
- [x] T002 [P] Add `"accountTemplates": "Account templates"` key under `templateLibrary` in `src/core/i18n/en/translation.en.json`
- [x] T003 [P] Add `account { id }` to the `SpaceAboutBase` query in `src/domain/space/about/graphql/SpaceAboutQueries.graphql` so the Space's owning account ID is queryable
- [x] T004 Expose `accountId: string` in `SpaceContextProps.space` interface and populate from `spaceData?.account?.id` in `SpaceContextProvider` in `src/domain/space/context/SpaceContext.tsx`
- [x] T005 Run `pnpm codegen` to generate `useImportTemplateDialogAccountTemplatesQuery` hook and updated `SpaceAboutBase` types in `src/core/apollo/generated/apollo-hooks.ts` (requires running backend at `localhost:4000/graphql`)

---

## Phase 2: Foundational (Core Dialog Changes)

**Purpose**: Implement the account templates section in `ImportTemplatesDialog` — MUST be complete before any user story can be verified

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. All tasks modify the same file and must be applied sequentially.

- [x] T006 Add optional `accountId?: string` field to `ImportTemplatesOptions` interface in `src/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog.tsx`
- [x] T007 Wire up `useImportTemplateDialogAccountTemplatesQuery` hook with `skip: !open || !accountId` in `src/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog.tsx`
- [x] T008 Implement flattening logic: `account.innovationPacks[].templatesSet.templates` → flat `AnyTemplateWithInnovationPack[]` filtered by `templateType` in `src/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog.tsx`
- [x] T009 Extend `selectedTemplate` search to include `accountTemplates` in the lookup array: `[...templates, ...accountTemplates, ...platformTemplates].find(...)` in `src/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog.tsx`
- [x] T010 Update auto-load effect so Platform templates load when both Space and Account templates are empty (see quickstart.md Step 3e) in `src/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog.tsx`
- [x] T011 Render account templates section using `ImportTemplatesDialogGallery` with context-dependent ordering: after Space templates when `canUseSpaceTemplates`, first otherwise. Guard with `accountId && (loadingAccountTemplates || accountTemplates?.length > 0)` to hide the section when no templates of the relevant type exist (FR-002) — in `src/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog.tsx`

**Checkpoint**: Dialog now supports account templates. Callers that pass `accountId` will see the section; callers that don't are unaffected.

---

## Phase 3: User Story 1 — See Account Templates When Creating a Space (Priority: P1) 🎯 MVP

**Goal**: Facilitators see their account's private templates in the template picker during Space creation, with "Account templates" appearing above "Platform templates."

**Independent Test**: Create a private template pack with a Space template in an account, start "Create Space," verify the template appears in the picker under an "Account templates" section at the top.

### Implementation for User Story 1

- [x] T012 [US1] Pass `accountId` from `useCurrentUserContext()` to `ImportTemplatesDialog` via `SpaceTemplateSelector` in `src/domain/templates/components/TemplateSelectors/SpaceTemplateSelector.tsx` — trace the prop through any intermediate component to the dialog's `ImportTemplatesOptions`. Note: Space creation uses the user's own account because the new Space will be created under it.

**Checkpoint**: Space creation now shows Account templates section. US1 acceptance scenarios can be validated.

---

## Phase 4: User Story 2 — See Account Templates When Creating a Post from Template (Priority: P1)

**Goal**: Facilitators see their account's Post templates in the template picker when creating a Post in a Space, with section order: Space templates → Account templates → Platform templates.

**Independent Test**: Create a private template pack with a Post template, create a Post in a Space, verify the template picker shows all three sections in the correct order.

### Implementation for User Story 2

- [x] T013 [US2] Pass `accountId` from `useSpace().space.accountId` (Space's owning account) to `ImportTemplatesDialog` via `PostTemplateSelector` in `src/domain/templates/components/TemplateSelectors/PostTemplateSelector.tsx` — trace the prop through any intermediate component to the dialog's `ImportTemplatesOptions`

**Checkpoint**: Post template selection now shows Account templates section. US2 acceptance scenarios can be validated.

---

## Phase 5: User Story 3 — Account Templates for All Template Types (Priority: P2)

**Goal**: The account templates section works consistently across all remaining template types (Whiteboard, Callout, Community Guidelines, Innovation Flow, Admin).

**Independent Test**: Create account-level templates of various types and verify the "Account templates" section appears in each respective template picker dialog.

### Implementation for User Story 3

- [x] T014 [P] [US3] Pass `accountId` from `useSpace().space.accountId` to `ImportTemplatesDialog` from `WhiteboardTemplateSelector` in `src/domain/templates/components/TemplateSelectors/WhiteboardTemplateSelector.tsx`
- [x] T015 [P] [US3] Pass `accountId` from `useSpace().space.accountId` to `ImportTemplatesDialog` from `CreateCalloutDialog` in `src/domain/collaboration/callout/CalloutDialogs/CreateCalloutDialog.tsx`
- [x] T016 [P] [US3] Pass `accountId` from `useSpace().space.accountId` to `ImportTemplatesDialog` from `InnovationFlowSettingsDialog` in `src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettingsDialog.tsx`
- [x] T017 [P] [US3] Pass `accountId` from `useSpace().space.accountId` to `ImportTemplatesDialog` from `SetDefaultTemplateDialog` in `src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/SetDefaultTemplateDialog.tsx`
- [x] T018 [P] [US3] Pass `accountId` from `useSpace().space.accountId` to `ImportTemplatesDialog` from `WhiteboardDialogTemplatesLibrary` in `src/domain/templates/components/WhiteboardDialog/WhiteboardDialogTemplatesLibrary.tsx`
- [x] T019 [P] [US3] Pass `accountId` from `useSpace().space.accountId` to `ImportTemplatesDialog` from `SpaceAdminTemplatesPage` in `src/domain/spaceAdmin/SpaceAdminTemplates/SpaceAdminTemplatesPage.tsx`
- [x] T020 [P] [US3] Pass `accountId` from `useSpace().space.accountId` to `ImportTemplatesDialog` from `SpaceAdminCommunityPage` in `src/domain/spaceAdmin/SpaceAdminCommunity/SpaceAdminCommunityPage.tsx`

**Checkpoint**: All template picker invocations now show Account templates when available. US3 acceptance scenarios can be validated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and verification across all user stories

- [x] T021 [P] Run `pnpm lint` to verify type checking and ESLint pass
- [x] T022 [P] Run `pnpm vitest run` to verify all existing tests pass
- [ ] T023 Execute manual validation steps from `specs/041-account-templates-dialog/quickstart.md` Step 5 — include keyboard navigation and screen reader testing of the new "Account templates" section (Constitution Principle V: WCAG 2.1 AA)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001, T003, T004, T005 for codegen + SpaceContext) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — MVP milestone
- **US2 (Phase 4)**: Depends on Foundational — can run in parallel with US1
- **US3 (Phase 5)**: Depends on Foundational — can run in parallel with US1 and US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **US2 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories; can run in parallel with US1
- **US3 (P2)**: Can start after Foundational (Phase 2) — no dependencies on US1 or US2; all 7 callers are independent files

### Within Each Phase

- Phase 1: T001, T003 before T005 (codegen needs queries); T002, T004 are independent of T001/T003 but T004 depends on T003 (needs the query field)
- Phase 2: T006 → T007 → T008 → T009 → T010 → T011 (all modify the same file, sequential)
- Phase 3-4: Single task each
- Phase 5: All tasks marked [P] — different files, fully parallel

---

## Parallel Example: All User Stories After Foundational

```bash
# After Phase 2 is complete, all three user stories can start simultaneously:

# US1 (MVP — uses useCurrentUserContext):
Task: T012 "Pass accountId from SpaceTemplateSelector"

# US2 (parallel with US1 — uses useSpace):
Task: T013 "Pass accountId from PostTemplateSelector"

# US3 (all 7 callers in parallel — all use useSpace):
Task: T014 "Pass accountId from WhiteboardTemplateSelector"
Task: T015 "Pass accountId from CreateCalloutDialog"
Task: T016 "Pass accountId from InnovationFlowSettingsDialog"
Task: T017 "Pass accountId from SetDefaultTemplateDialog"
Task: T018 "Pass accountId from WhiteboardDialogTemplatesLibrary"
Task: T019 "Pass accountId from SpaceAdminTemplatesPage"
Task: T020 "Pass accountId from SpaceAdminCommunityPage"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (query + i18n key + SpaceContext + codegen)
2. Complete Phase 2: Foundational (core dialog changes — 6 sequential edits to ImportTemplatesDialog.tsx)
3. Complete Phase 3: US1 (wire SpaceTemplateSelector)
4. **STOP and VALIDATE**: Test Space creation with account templates
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Core ready
2. Add US1 (SpaceTemplateSelector) → Validate Space creation → **MVP!**
3. Add US2 (PostTemplateSelector) → Validate Post creation → Deploy
4. Add US3 (remaining 7 callers) → Validate all template pickers → Full feature
5. Polish → Final verification

### Single Developer Strategy (Recommended)

Since all user story tasks touch different files and follow the same pattern ("add `accountId` prop wiring"), the most efficient single-developer approach is:

1. Complete Setup + Foundational (Phases 1-2)
2. Wire ALL callers in one pass (T012-T020) — same mechanical change, minimal context switching. Note: T012 uses `useCurrentUserContext().accountId`; T013-T020 use `useSpace().space.accountId`
3. Validate end-to-end
4. Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Codegen (T005) requires a running backend at `localhost:4000/graphql`
- T006–T011 are all in `ImportTemplatesDialog.tsx` — must be sequential
- **accountId source differs by context**: T012 (Space creation) uses `useCurrentUserContext().accountId`; T013–T020 (in-Space callers) use `useSpace().space.accountId` from the Space's owning account
- Commit generated codegen outputs alongside source changes
