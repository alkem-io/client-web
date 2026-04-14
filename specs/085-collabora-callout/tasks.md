# Tasks: Collabora Document Callout Integration

**Input**: Design documents from `/specs/085-collabora-callout/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted. Manual validation via quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure, GraphQL operations, codegen, and i18n keys

- [x] T001 Create directory structure: `src/domain/collaboration/calloutContributions/collaboraDocument/graphql/`
- [x] T002 [P] Create GraphQL mutation `CreateCollaboraDocumentOnCallout.graphql` in `src/domain/collaboration/calloutContributions/collaboraDocument/graphql/CreateCollaboraDocumentOnCallout.graphql` — mutation using `createContributionOnCallout` with `type: COLLABORA_DOCUMENT` and `collaboraDocument` input, returning `collaboraDocument { id, documentType, profile { id, url, displayName } }` (see contracts/graphql-schema-changes.md section 1)
- [x] T003 [P] Create GraphQL query `CollaboraEditorUrl.graphql` in `src/domain/collaboration/calloutContributions/collaboraDocument/graphql/CollaboraEditorUrl.graphql` — query for `collaboraEditorUrl(collaboraDocumentID)` returning `{ editorUrl, accessTokenTTL }` (see contracts/graphql-schema-changes.md section 2)
- [x] T004 [P] Create GraphQL mutation `UpdateCollaboraDocument.graphql` in `src/domain/collaboration/calloutContributions/collaboraDocument/graphql/UpdateCollaboraDocument.graphql` — mutation for `updateCollaboraDocument(updateData)` returning `{ id, profile { id, displayName } }` (see contracts/graphql-schema-changes.md section 3)
- [x] T005 [P] Create GraphQL mutation `DeleteCollaboraDocument.graphql` in `src/domain/collaboration/calloutContributions/collaboraDocument/graphql/DeleteCollaboraDocument.graphql` — mutation for `deleteCollaboraDocument(deleteData)` returning `{ id }` (see contracts/graphql-schema-changes.md section 4)
- [x] T006 Extend `src/domain/collaboration/calloutContributions/useCalloutContributions/CalloutContributions.graphql` — add `$includeCollaboraDocument: Boolean! = false` variable, add `collaboraDocument @include(if: $includeCollaboraDocument) { ...CalloutContributionsCollaboraDocumentCard }` field to `contributions`, add `collaboraDocument @include(if: $includeCollaboraDocument)` to `contributionsCount` in both queries, add `COLLABORA_DOCUMENT` to the `$filter` default array, and create the `CalloutContributionsCollaboraDocumentCard` fragment on `CollaboraDocument` with fields: `id, documentType, profile { id, url, displayName }, authorization { id, myPrivileges }, createdDate, createdBy { ...ContributionAuthor }` (see contracts/graphql-schema-changes.md section 5+7)
- [x] T007 Extend `src/domain/collaboration/calloutContributions/calloutContributionPreview/CalloutContributionPreview.graphql` — add `$includeCollaboraDocument: Boolean! = false` variable, add `collaboraDocument @include(if: $includeCollaboraDocument) { id, documentType, profile { id, url, displayName }, createdDate, createdBy { ...ContributionAuthor } }` field to the contribution query (see contracts/graphql-schema-changes.md section 6)
- [x] T008 Run `pnpm codegen` to regenerate types and hooks from updated GraphQL files. Verify new generated hooks: `useCreateCollaboraDocumentOnCalloutMutation`, `useCollaboraEditorUrlQuery`, `useUpdateCollaboraDocumentMutation`, `useDeleteCollaboraDocumentMutation`. Commit generated outputs in `src/core/apollo/generated/`
- [x] T009 Add i18n keys to `src/core/i18n/en/translation.en.json`: (1) `common.enums.calloutContributionType.COLLABORA_DOCUMENT` for type label, (2) `callout.create.contributionSettings.contributionTypes.collaboraDocument.title` and `.tooltip` for callout creation form, (3) `collaboraDocument.create.title` for create dialog title, (4) `collaboraDocument.create.documentType.label` for type selector label, (5) `collaboraDocument.types.SPREADSHEET`, `.PRESENTATION`, `.TEXT_DOCUMENT` for type display names, (6) `collaboraDocument.editor.error.unavailable` and `.loading` for editor error/loading states, (7) `collaboraDocument.delete.confirm` for delete confirmation, (8) `common.calloutType.COLLABORA_DOCUMENT` for callout icon label. Follow the existing key patterns for other contribution types (search for `whiteboard` keys as reference)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure updates needed by ALL user stories — icon mapping, contribution query hook, and type detection

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 Update `src/domain/collaboration/callout/icons/calloutIcons.ts` — import `DescriptionOutlined` from `@mui/icons-material` and add `[CalloutContributionType.CollaboraDocument]: DescriptionOutlined` to the `contributionIcons` record (line ~25-30). This is the generic icon for the COLLABORA_DOCUMENT contribution type in the callout system
- [x] T011 [P] Create `src/domain/collaboration/calloutContributions/collaboraDocument/collaboraDocumentIcons.ts` — export a record mapping `CollaboraDocumentType` enum values to MUI icon components: `SPREADSHEET → TableChartOutlined`, `PRESENTATION → SlideshowOutlined`, `TEXT_DOCUMENT → ArticleOutlined`. Import icons from `@mui/icons-material`. Export a helper function `getCollaboraDocumentIcon(type: CollaboraDocumentType): ComponentType<SvgIconProps>` that returns the appropriate icon
- [x] T012 Update `src/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions.tsx` — (1) add `includeCollaboraDocument: contributionType === CalloutContributionType.CollaboraDocument` to the query variables object (around line 92-95), (2) add `case CalloutContributionType.CollaboraDocument: return (effectiveData ?? data)?.lookup.callout?.contributionsCount.collaboraDocument;` to the `totalContributionsCount` switch statement (around line 127-136)
- [x] T013 Update `src/domain/collaboration/calloutContributions/calloutContributionPreview/CalloutContributionPreview.tsx` — (1) add `includeCollaboraDocument: allowedTypes.includes(CalloutContributionType.CollaboraDocument)` to the `useCalloutContributionQuery` variables (around line 55-62), (2) extend the `contributionType` detection chain (line 66-74) to include `contribution?.collaboraDocument ? CalloutContributionType.CollaboraDocument : undefined`, (3) add `collaboraDocument` cases to `displayName` (line 76-82), `author` (line 84-88), `createdDate` (line 96-99), and `contributionUrl` (line 103-106) conditional chains, (4) add `case CalloutContributionType.CollaboraDocument: return 'collaboraDocument';` to `calloutContributionTypeToShareDialogKey` function (line 116-129) — note: the return type union needs to be extended to include `'collaboraDocument'`

**Checkpoint**: Foundation ready — all existing files updated to recognize COLLABORA_DOCUMENT. User story implementation can now begin.

---

## Phase 3: User Story 1 — View Collabora Documents in a Callout (Priority: P1) MVP

**Goal**: Display Collabora document contributions as cards in a callout, showing title, type icon, and creation date

**Independent Test**: Navigate to a space with a COLLABORA_DOCUMENT callout containing documents. Verify document cards render with title, type-appropriate icon, and metadata.

### Implementation for User Story 1

- [x] T014 [US1] Create `src/domain/collaboration/calloutContributions/collaboraDocument/CollaboraDocumentCard.tsx` — follow the pattern of `WhiteboardCard.tsx`. Props interface `CollaboraDocumentCardProps` extends `CalloutContributionCardComponentProps`. Render a `ContributeCard` linking to `collaboraDocument?.profile.url`. Show: (1) `CardHeader` with `title={collaboraDocument?.profile.displayName}`, `author={collaboraDocument?.createdBy}`, and formatted `createdDate`, (2) a default image area showing the document-type-specific icon from `collaboraDocumentIcons.ts` (use `getCollaboraDocumentIcon(collaboraDocument.documentType)`) centered in an aspect-ratio box. Pass `LocationStateKeyCachedCallout` in link state as other cards do

**Checkpoint**: Card component ready. Needs CalloutView wiring (Phase 5) to be visible.

---

## Phase 4: User Story 2 — Open and Edit a Collabora Document (Priority: P1) MVP

**Goal**: Open a Collabora document in a dialog with an embedded Collabora Online iframe editor, with silent token auto-refresh

**Independent Test**: Click a document card, verify the Collabora editor loads in an iframe within a dialog

### Implementation for User Story 2

- [x] T015 [US2] Create `src/domain/collaboration/calloutContributions/collaboraDocument/CollaboraDocumentEditor.tsx` — the core iframe editor wrapper component. Props: `collaboraDocumentId: string`, `onClose: () => void`. Implementation: (1) use `useCollaboraEditorUrlQuery({ variables: { collaboraDocumentId }, fetchPolicy: 'network-only' })` to fetch editor URL, (2) render a loading state (MUI `CircularProgress` or `Skeleton`) while query loads, (3) render error state with user-friendly message (use `t('collaboraDocument.editor.error.unavailable')`) if query fails, (4) render `<iframe src={data.collaboraEditorUrl.editorUrl} title={t('collaboraDocument.editor.title')} style={{ width: '100%', height: '100%', border: 'none' }} allow="clipboard-read; clipboard-write" />` on success, (5) implement token auto-refresh in a `useEffect`: set `setTimeout` at `accessTokenTTL - 60000` ms to call `refetch()`, clear timeout on unmount. The iframe `src` updates automatically when `data` changes after refetch
- [x] T016 [P] [US2] Create `src/domain/collaboration/calloutContributions/collaboraDocument/CalloutContributionPreviewCollaboraDocument.tsx` — follow the pattern of `CalloutContributionPreviewWhiteboard.tsx`. Implement the `CalloutContributionPreviewComponentProps` interface. Render a preview area showing the document type icon and document name. Include an "Open in editor" button that calls `onOpenContribution()`
- [x] T017 [US2] Create `src/domain/collaboration/calloutContributions/collaboraDocument/CalloutContributionDialogCollaboraDocument.tsx` — follow the pattern of `CalloutContributionDialogWhiteboard.tsx`. Implement the `CalloutContributionPreviewDialogProps` interface. When `open` is true, render the `CollaboraDocumentEditor` component (from T015) with the `collaboraDocumentId` from `contribution?.collaboraDocument?.id`. Include a delete handler using `useDeleteContributionMutation` that calls `deleteContribution` with `refetchQueries: ['CalloutDetails', 'CalloutContributions']` and invokes `onContributionDeleted` on completion. Render the editor in a full-screen MUI `Dialog` component to give the Collabora iframe maximum space

**Checkpoint**: Editor components ready. Needs CalloutView wiring (Phase 5) to be accessible.

---

## Phase 5: User Story 3 — Create a New Collabora Document (Priority: P1) MVP

**Goal**: Provide a creation dialog for new Collabora documents with title and type selection, then open the editor

**Independent Test**: Click create button, fill in title and type, submit. Verify the new document appears in the callout and the editor opens.

### Implementation for User Story 3

- [x] T018 [US3] Create `src/domain/collaboration/calloutContributions/collaboraDocument/CreateContributionButtonCollaboraDocument.tsx` — follow the pattern of `CreateContributionButtonWhiteboard.tsx`. Props: `callout`, `canCreateContribution`, `onContributionCreated`. Implementation: (1) state for dialog open/close and form values (displayName string, documentType enum), (2) dialog with: TextField for document name, a radio group or select for document type (SPREADSHEET, PRESENTATION, TEXT_DOCUMENT) showing type-specific icons and translated labels from i18n, (3) on submit: call `useCreateCollaboraDocumentOnCalloutMutation` with variables `{ calloutId: callout.id, collaboraDocument: { displayName, documentType } }`, set `refetchQueries: ['CalloutContributions']`, (4) on success: navigate to the created document's `profile.url` using the returned data, (5) handle loading/error states with disabled button and error snackbar
- [x] T019 [US3] Wire all Collabora document components into `src/domain/collaboration/callout/CalloutView/CalloutView.tsx` — add a new conditional block for `CalloutContributionType.CollaboraDocument` following the exact whiteboard block pattern (lines 195-242). Import: `CreateContributionButtonCollaboraDocument`, `CollaboraDocumentCard`, `CalloutContributionPreviewCollaboraDocument`, `CalloutContributionDialogCollaboraDocument`. The block should: (1) check `callout.settings.contribution.allowedTypes.includes(CalloutContributionType.CollaboraDocument)`, (2) render `CalloutContributionsBlock` with `contributionType={CalloutContributionType.CollaboraDocument}` and `createContributionButtonComponent={CreateContributionButtonCollaboraDocument}`, (3) inside: if `contributionId` exists, show `CalloutContributionsHorizontalPager` with `cardComponent={CollaboraDocumentCard}` + `CalloutContributionPreview` with `previewComponent={CalloutContributionPreviewCollaboraDocument}` and `dialogComponent={CalloutContributionDialogCollaboraDocument}` and `openContributionDialogOnLoad={true}`, (4) if no `contributionId`, show `ContributionsCardsExpandable` with `contributionCardComponent={CollaboraDocumentCard}`. Add the `collaboraDocument` URL to the `handleClickOnContribution` URL resolution chain (around line 141-142)

**Checkpoint**: MVP complete — User Stories 1, 2, and 3 are now fully functional. Users can view, create, and edit Collabora documents within a callout. Manually test the full create → view → edit flow.

---

## Phase 6: User Story 6 — Create a COLLABORA_DOCUMENT Callout (Priority: P2)

**Goal**: Allow space admins to create callouts of type COLLABORA_DOCUMENT through the callout creation form

**Independent Test**: Open callout creation dialog, select "Collabora Document" type, create the callout. Verify it appears in the space.

### Implementation for User Story 6

- [x] T020 [US6] Update `src/domain/collaboration/callout/CalloutForm/CalloutFormContributionSettings.tsx` — (1) add a new radio button option in the `FormikRadioButtonsGroup` options array (around line 106-150): `{ icon: contributionIcons[CalloutContributionType.CollaboraDocument], value: CalloutContributionType.CollaboraDocument, label: t('callout.create.contributionSettings.contributionTypes.collaboraDocument.title'), tooltip: calloutRestrictions?.readOnlyAllowedTypes ? disabledTooltip : t('callout.create.contributionSettings.contributionTypes.collaboraDocument.tooltip') }`, (2) add `case CalloutContributionType.CollaboraDocument: return ContributionsSettingsPost;` to the `SettingsComponent` switch (line 43-56) — reuse Post settings (same as Memo) since Collabora documents have no special contribution defaults, (3) add `case CalloutContributionType.CollaboraDocument:` to the `enabledSettings` switch that disables comments (line 64-70) — comments are disabled for Collabora documents

**Checkpoint**: Admins can now create COLLABORA_DOCUMENT callouts. Combined with MVP, the full workflow is: create callout → create document → edit document.

---

## Phase 7: User Story 4 — Delete a Collabora Document (Priority: P2)

**Goal**: Allow users with delete permission to remove a Collabora document with a confirmation dialog

**Independent Test**: Open a document's context menu or dialog actions, trigger delete, confirm. Verify the document is removed.

### Implementation for User Story 4

- [x] T021 [US4] Enhance `src/domain/collaboration/calloutContributions/collaboraDocument/CalloutContributionDialogCollaboraDocument.tsx` — add a delete button/action visible only when `contribution?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete)`. On click, show a confirmation dialog (MUI `Dialog` with `t('collaboraDocument.delete.confirm')` message and confirm/cancel buttons). On confirm, call `useDeleteContributionMutation` with the contribution ID (this was scaffolded in T017 — ensure the delete handler is wired to a visible UI element with confirmation). The delete mutation already uses `refetchQueries: ['CalloutDetails', 'CalloutContributions']`

**Checkpoint**: Delete functionality complete. Users with appropriate permissions can remove documents.

---

## Phase 8: User Story 5 — Rename a Collabora Document (Priority: P3)

**Goal**: Allow users with write permission to rename a Collabora document

**Independent Test**: Trigger rename on a document, enter a new title, confirm. Verify the new title appears.

### Implementation for User Story 5

- [x] T022 [US5] Add rename capability to `src/domain/collaboration/calloutContributions/collaboraDocument/CalloutContributionDialogCollaboraDocument.tsx` or `CalloutContributionPreviewCollaboraDocument.tsx` — add an edit/rename button visible when `contribution?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update)`. On click, show an inline editable text field or a small dialog with a TextField pre-filled with the current `displayName`. On submit, call `useUpdateCollaboraDocumentMutation` with `{ updateData: { ID: collaboraDocumentId, displayName: newName } }` and `refetchQueries: ['CalloutContributions']`. Show loading state during mutation and error handling on failure

**Checkpoint**: All user stories complete. Full CRUD + edit flow operational.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Validation, cleanup, and quality checks

- [x] T023 Run `pnpm lint` to verify TypeScript compilation and linting pass with all new and modified files
- [x] T024 Run `pnpm vitest run` to verify no existing tests are broken by the changes
- [x] T025 Verify i18n completeness — search for any hardcoded strings in new components, ensure all user-visible text uses `t()` function
- [x] T026 Verify accessibility — ensure the Collabora iframe has a `title` attribute, all buttons have `aria-label` attributes, document type icons have accessible names, and the editor dialog is keyboard-navigable
- [x] T027 Run full manual validation per `specs/085-collabora-callout/quickstart.md` testing section: create callout → create document (all 3 types) → open editor → rename → delete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately (requires server PR #5970 deployed for codegen)
- **Foundational (Phase 2)**: Depends on Phase 1 completion (codegen must have run) — BLOCKS all user stories
- **US1 View (Phase 3)**: Depends on Phase 2 — Card component only
- **US2 Edit (Phase 4)**: Depends on Phase 2 — Editor/Dialog/Preview components
- **US3 Create (Phase 5)**: Depends on Phase 3 + Phase 4 — CreateButton + CalloutView wiring integrates all P1 components
- **US6 Callout Creation (Phase 6)**: Depends on Phase 2 only — independent of US1/US2/US3
- **US4 Delete (Phase 7)**: Depends on Phase 4 (dialog exists)
- **US5 Rename (Phase 8)**: Depends on Phase 4 (dialog/preview exists)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Phase 2 → T014
- **US2 (P1)**: Phase 2 → T015, T016 (parallel), T017
- **US3 (P1)**: US1 + US2 complete → T018, T019 (sequential — T019 wires everything)
- **US6 (P2)**: Phase 2 → T020 (independent of other stories)
- **US4 (P2)**: US2 complete → T021
- **US5 (P3)**: US2 complete → T022

### Within Each User Story

- GraphQL operations before components
- Components before CalloutView wiring
- Core implementation before error handling refinements

### Parallel Opportunities

- T002, T003, T004, T005 can all run in parallel (separate .graphql files)
- T010, T011 can run in parallel (separate files)
- T015, T016 can run in parallel (separate components)
- T014 (US1) and T015/T016 (US2) can run in parallel after Phase 2
- US6 (T020) can run in parallel with US1/US2/US3

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all GraphQL file creation tasks together:
Task: T002 "CreateCollaboraDocumentOnCallout.graphql"
Task: T003 "CollaboraEditorUrl.graphql"
Task: T004 "UpdateCollaboraDocument.graphql"
Task: T005 "DeleteCollaboraDocument.graphql"
```

## Parallel Example: Phase 3+4 (US1 + US2)

```bash
# After Phase 2 completes, launch card and editor components together:
Task: T014 "CollaboraDocumentCard.tsx" (US1)
Task: T015 "CollaboraDocumentEditor.tsx" (US2)
Task: T016 "CalloutContributionPreviewCollaboraDocument.tsx" (US2)
```

---

## Implementation Strategy

### MVP First (User Stories 1+2+3)

1. Complete Phase 1: Setup (GraphQL + i18n)
2. Complete Phase 2: Foundational (icons, hooks, type detection)
3. Complete Phases 3-5: US1 + US2 + US3 (view + edit + create)
4. **STOP and VALIDATE**: Test full create → view → edit flow
5. Deploy/demo if ready — this is a working Collabora integration

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 + US2 + US3 → Core document workflow (MVP)
3. US6 → Callout creation (admins can set up callouts)
4. US4 → Delete (lifecycle management)
5. US5 → Rename (polish)
6. Each increment adds value without breaking previous functionality

### Single Developer Strategy

Work sequentially: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9

---

## Notes

- [P] tasks = different files, no dependencies on other in-progress tasks
- [Story] label maps task to specific user story for traceability
- The CalloutView wiring (T019) is the key integration task — it connects all MVP components
- The delete mutation in the dialog (T017/T021) is split: T017 scaffolds the handler, T021 adds the visible UI with confirmation
- `pnpm codegen` (T008) REQUIRES the server with PR #5970 changes running at localhost:4000/graphql
- Commit after each phase or logical group of tasks
- Stop at any checkpoint to validate independently
