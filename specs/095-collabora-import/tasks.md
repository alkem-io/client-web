---

description: "Task list for Document framing on a Post — Create New or Upload"
---

# Tasks: Document Framing on a Post — Create New or Upload

**Input**: Design documents from `/specs/095-collabora-import/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/graphql-mutation-extension.md, quickstart.md

**Tests**: Tests are required for the new pure helpers per the plan's Constitution Check (Principle V — "Tests covering non-trivial logic"). UI integration is validated manually per `quickstart.md`.

**Organization**: Tasks are grouped by user story (US1–US7 from spec.md) so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- File paths are absolute or rooted at the repository root.

## Path Conventions

- Web app, single repo. All work under `src/`.
- New files added under existing domain folders to match the established pattern from `specs/085-collabora-callout/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bring the FE in sync with the server contract on alkem-io/server branch `095-collabora-import`.

- [X] T001 Update GraphQL operation in `src/domain/collaboration/calloutsSet/useCalloutCreation/calloutCreation.graphql` to add the optional `$file: Upload` variable and thread it through to the mutation field call: `createCalloutOnCalloutsSet(calloutData: $calloutData, file: $file)`. Diff is two lines per `specs/095-collabora-import/contracts/graphql-mutation-extension.md`.
- [X] T002 Run `pnpm codegen` (requires backend on `localhost:4000/graphql` running the server's `095-collabora-import` branch) and commit the regenerated files in `src/core/apollo/generated/*.ts`. Verify `useCreateCalloutMutation` accepts `{ calloutData, file? }` and `CreateCollaboraDocumentInput.{displayName, documentType}` are now optional in `graphql-schema.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure helpers, hook extension, and form-model extension required by all user stories.

**⚠️ CRITICAL**: No user-story implementation can begin until this phase is complete.

- [X] T003 [P] Create `src/domain/collaboration/calloutContributions/collaboraDocument/collaboraImportFormats.ts` exporting `COLLABORA_IMPORT_EXTENSIONS_P1` (readonly tuple `['.docx', '.xlsx', '.pptx']`), `COLLABORA_IMPORT_MAX_BYTES` (`15 * 1024 * 1024 = 15728640`), and `COLLABORA_IMPORT_ACCEPT_ATTR` (`'.docx,.xlsx,.pptx'`) per `data-model.md` "New client-side types".
- [X] T004 [P] Create `src/domain/collaboration/calloutContributions/collaboraDocument/filenameWithoutExtension.ts` — pure helper that strips the trailing extension from a filename (case-insensitive; handles uppercase `.DOCX`, multi-dot names like `Q3-Report.final.docx`, and filenames with no extension). No external imports.
- [X] T005 [P] Create `src/domain/collaboration/calloutContributions/collaboraDocument/deriveCollaboraDocumentDisplayName.ts` — pure helper implementing the typed-vs-prefill decision rule per `data-model.md`. Signature: `({ mode, postTitle, autoPrefilledTitle?, documentType? }) => DisplayNameDecision`. Branches: `blank-create` → `{ displayName, documentType }`; `upload` & prefill-equals-current → `{}`; `upload` & differs → `{ displayName }`.
- [X] T006 [P] Modify `src/domain/collaboration/callout/CalloutForm/CalloutFormModel.ts` — extend the existing `CalloutFormSubmittedValues` shape with optional `framing.collaboraDocument.uploadFile: File` and `framing.collaboraDocument.autoPrefilledTitle: string` fields per `data-model.md` "form-values extension". Existing `displayName` and `documentType` fields remain unchanged.
- [X] T007 Create `src/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile.ts` — depends on T003. Implements the discriminated-union validator per `research.md` §3 and `data-model.md`. Order: single file → extension (case-insensitive against `COLLABORA_IMPORT_EXTENSIONS_P1`) → byte size against `COLLABORA_IMPORT_MAX_BYTES`. Accepts a `FileList | File[] | DataTransferItemList`. Returns `{ ok: true, file: File } | { ok: false, error: ValidationError }` where `ValidationError` is `{ kind: 'no-file' | 'multiple-files' | 'folder' | 'extension' | 'size'; ... }`.
- [X] T008 Create `src/domain/collaboration/calloutContributions/collaboraDocument/collaboraImportFormats.spec.ts` — depends on T003. Vitest assertions on the exported tuple (exactly `.docx`, `.xlsx`, `.pptx`), the byte cap (`15 * 1024 * 1024`), and the joined accept-attr string.
- [X] T009 Create `src/domain/collaboration/calloutContributions/collaboraDocument/deriveCollaboraDocumentDisplayName.spec.ts` — depends on T005. Table-driven Vitest tests covering all four branches: blank-create + documentType; upload with prefill-equals-current; upload with prefill-differs (typed); upload with no prefill (no autoPrefilledTitle).
- [X] T010 Create `src/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile.spec.ts` — depends on T007. Table-driven tests covering each rejection branch (`no-file`, `multiple-files`, `folder`, `extension`, `size`), the exact-cap boundary (`15 * 1024 * 1024 - 1` accepted, `15 * 1024 * 1024` accepted, `15 * 1024 * 1024 + 1` rejected), case-insensitive extension match (`.DOCX`, `.Pptx`), and one happy-path assertion returning `{ ok: true, file }`.
- [X] T011 Extend `src/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation.ts` — depends on T002. Add an optional `file?: File` second argument to `handleCreateCallout`. Update `CalloutCreationUtils.handleCreateCallout` type accordingly. Inside the function, conditionally add `file` to the `variables` object only when defined. Existing blank-create callsites compile and run unchanged.
- [X] T012 Mirror the file-param change in `src/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreationWithPreviewImages.ts` — depends on T011. Forward the new optional `file` argument to the wrapped `handleCreateCallout` so the whiteboard preview-images path doesn't break.

**Checkpoint**: Foundation ready. All helpers tested green; mutation hook accepts an optional file; form model carries the staged file. UI work can now proceed.

---

## Phase 3: User Story 1 - Create a post with a blank Collabora document as its framing (Priority: P1) 🎯 MVP

**Goal**: The pre-existing blank-create path (Word Document / Spreadsheet / Presentation cards) continues to work after the dialog gains the new upload zone — no regressions.

**Independent Test**: From a permitted space, open Add Post, pick Document framing, click any of the three blank-create cards, enter a title, submit. The Collabora editor opens with an empty document of the chosen type.

### Implementation for User Story 1

- [X] T013 [US1] Update `src/main/crdPages/space/callout/calloutFormMapper.ts` to call `deriveCollaboraDocumentDisplayName({ mode: 'blank-create', postTitle, documentType })` when mapping the blank-create branch, so both branches share the same helper. Existing behaviour is preserved (the helper returns `{ displayName, documentType }` for blank-create), but the call now goes through the unified decision function. Depends on T005, T006.
- [X] T014 [US1] Add a regression test to `src/main/crdPages/space/callout/calloutFormMapper.test.ts` confirming the blank-create branch produces `framing.collaboraDocument: { displayName, documentType }` with no `file` variable when `framing.collaboraDocument.uploadFile` is undefined. Depends on T013.

**Checkpoint**: Existing blank-create end-to-end still works exactly as before. Manually validate per User Story 1's quickstart recipe.

---

## Phase 4: User Story 2 - Create a post by uploading an existing document (Priority: P1) 🎯 MVP

**Goal**: An author can upload a `.docx`, `.xlsx`, or `.pptx` file (≤ 15 MB) as the framing document of a new post; the file is uploaded with the create-callout mutation; on success the dialog closes, the view navigates to the new post, and the editor opens.

**Independent Test**: From a permitted space, open Add Post, pick Document framing, drag a `.docx` into the upload zone, submit. The post is created and the editor opens with the uploaded content.

### Implementation for User Story 2

- [X] T015 [P] [US2] Create `src/crd/forms/callout/DocumentImportZone.tsx` — pure CRD presentational component. Drag-and-drop area + click-to-upload affordance via a styled `<button>`-wrapped `<input type="file">`. Plain-TS props: `acceptedExtensions: readonly string[]`, `maxBytes: number`, `value: File | null`, `onChange: (file: File | null) => void`, `onError: (error: ValidationError | null) => void`, `busy?: boolean`, plus i18n labels passed via props (`labelDropHint`, `labelClickHint`, `labelMaxSize`, `labelRemoveFile`, error-message templates). MUST NOT import from `@apollo/client`, `@/domain/`, `@mui/*`, `@emotion/*`, or `react-router-dom`. Tailwind-only styling via `cn()` from `@/crd/lib/utils`. WCAG 2.1 AA: keyboard-operable (focus-visible ring, Enter/Space triggers picker), `aria-busy` driven by the `busy` prop, error rendered with `role="alert"`. The component does NOT call the validator — it forwards staged files via `onChange` and surfaces errors via `onError`.
- [X] T016 [P] [US2] Add CRD upload-zone strings to `src/crd/i18n/space/space.en.json` under a `forms.collaboraImport.*` namespace. Keys: `dropHint`, `clickHint`, `maxSize` (interpolates `{{cap}}` MB), `removeFile`, `errors.unsupported` (interpolates `{{formats}}`), `errors.tooLarge` (interpolates `{{cap}}` MB), `errors.multipleFiles`, `errors.folder`, `errors.serviceUnavailable` (for `STORAGE_SERVICE_UNAVAILABLE`).
- [X] T017 [US2] Manually translate the CRD upload-zone keys (from T016) into `src/crd/i18n/space/space.{nl,es,bg,de,fr}.json`, in the same PR per the CRD i18n policy. Depends on T016.
- [X] T018 [P] [US2] Add the parallel MUI upload-zone strings to `src/core/i18n/en/translation.en.json` under `callout.create.framingSettings.collaboraDocument.upload.*`. Mirror keys (`dropHint`, `clickHint`, `maxSize`, `removeFile`, `errors.unsupported`, `errors.tooLarge`, `errors.multipleFiles`, `errors.folder`, `errors.serviceUnavailable`). Crowdin handles the non-English locales. **Also (per design alignment with issue #9629)**: update the existing label key `collaboraDocument.create.documentType.TEXT_DOCUMENT` value from `"Text Document"` to `"Word Document"` to match the design mockup's "Word Document" card label. The enum value `WORDPROCESSING` is unchanged; only the user-visible label moves.
- [X] T019 [US2] Update `src/crd/forms/callout/CollaboraDocumentTypePicker.tsx` to render `<DocumentImportZone>` after the three blank-create type cards, separated by an "or" divider styled per the design mockup. The picker accepts the staged file + change handler from its parent. Visual mutual exclusion: when a file is staged the cards render as inactive; when a card is active the upload zone renders as inactive. Verify the CRD card label for the Wordprocessing type also reads "Word Document" (sourced from `src/crd/i18n/space/space.en.json` — ensure the existing key resolves to "Word Document"; if it currently says "Text Document", update the existing CRD key value in T016 / T017). Depends on T015, T016.
- [X] T020 [US2] In `src/main/crdPages/space/callout/CalloutFormConnector.tsx`, wire up the upload zone end-to-end. (a) Read `framing.collaboraDocument.uploadFile` from Formik values; render the picker with `value` and `onChange`. (b) On `onChange(file)`: run `validateCollaboraImportFile([file])`; on `ok=true` write `framing.collaboraDocument.uploadFile = file` and clear any blank-create card selection (mutual exclusion); when `framing.profile.displayName` is empty, set it to `filenameWithoutExtension(file.name)` AND set `framing.collaboraDocument.autoPrefilledTitle` to the same value (FR-004a). On `ok=false` set the inline error mapped from the discriminated-union variant via the i18n keys from T016. (c) Pre-checks run synchronously — never trigger a network request on validation failure (FR-008). (d) **On framing chip change to anything other than `document`**: clear `framing.collaboraDocument.uploadFile` and `framing.collaboraDocument.autoPrefilledTitle` so the staged file does not persist invisibly when the author switches framing types (Edge Case in spec.md). Depends on T007, T015, T019.
- [X] T021 [US2] Update `src/main/crdPages/space/callout/calloutFormMapper.ts` to branch on the upload path: when `framing.collaboraDocument.uploadFile` is set, pull the file out separately for the mutation's second argument; call `deriveCollaboraDocumentDisplayName({ mode: 'upload', postTitle, autoPrefilledTitle })` to produce either `{ displayName }` or `{}` for `framing.collaboraDocument`; do NOT include `documentType` (server-derived). The mapper's return shape adds an optional `file: File | undefined` sibling to the existing input shape so the connector can pass it through to `handleCreateCallout(input, file)`. Depends on T005, T006.
- [X] T022 [US2] In `CalloutFormConnector.tsx` submit handler, when an upload-path callout is being created, call `handleCreateCallout(input, file)` (the new second arg from T011). **Pass `busy={loading}` (sourced from `useCalloutCreation`) into `<DocumentImportZone>` for the duration of the submission so the busy indicator + `aria-busy` engage** (FR-009). On success: close dialog, navigate / scroll to the new callout, open the Collabora editor on its framing document (`callout.framing.collaboraDocument.id` → existing `collaboraEditorUrl` query path). On error: keep dialog open, render mapped inline error (specific server-error mappings live under US3 / US4 / Phase 4 service-availability tasks). Any error code not specifically mapped (`BAD_USER_INPUT`, `FORBIDDEN`, `UNAUTHENTICATED`, unknown) falls through to the existing dialog-level error toast — no special handling. Depends on T011, T021.
- [X] T023 [P] [US2] Add the parallel MUI upload-zone wiring in `src/domain/collaboration/callout/CalloutForm/CalloutFormFramingSettings.tsx`. Render a styled `<input type="file" accept={COLLABORA_IMPORT_ACCEPT_ATTR}>` inside an MUI `Box` AFTER the existing three document-type radios (lines ~344–372). Helper text shows the 15 MB cap and accepted extensions (i18n keys from T018). Hook the file change to run `validateCollaboraImportFile` and update Formik values (mirroring T020's logic — extract a shared helper into `src/domain/collaboration/calloutContributions/collaboraDocument/useCollaboraImportStaging.ts` if duplication is non-trivial). Drag-and-drop is nice-to-have on the MUI surface; click-to-upload is the must-have. Verify the MUI `handleFramingTypeChange` reconstruction at `CalloutFormFramingSettings.tsx:79+` produces a `newFraming` that excludes `uploadFile` and `autoPrefilledTitle` (existing pattern handles this automatically by rebuilding the framing object — no extra code if the existing flow is preserved).
- [X] T024 [US2] In the MUI submit handler at `src/domain/collaboration/callout/CalloutDialogs/CreateCalloutDialog.tsx:~167-177` (where `createCalloutInput` is built and `handleCreateCallout` is called), apply the same branching as T021. When the form's `framing.collaboraDocument.uploadFile` is set, extract it to pass as the second arg to `handleCreateCallout(createCalloutInput, file)`; reuse `deriveCollaboraDocumentDisplayName` for the displayName decision so the MUI and CRD paths share the same logic. Any error code not specifically mapped (`BAD_USER_INPUT`, `FORBIDDEN`, `UNAUTHENTICATED`, unknown) falls through to the existing dialog-level error toast — no special handling. Depends on T005, T011, T023.
- [X] T025 [US2] Update `src/main/crdPages/space/callout/calloutFormMapper.test.ts` with upload-path tests: (a) prefill-unchanged → submission carries `framing.collaboraDocument: {}` and a `file` value; (b) prefill-typed-over → submission carries `framing.collaboraDocument: { displayName }` and a `file` value; (c) framing-type-switch from Document to Memo discards both `uploadFile` and `autoPrefilledTitle`. Depends on T021.
- [X] T026 [US2] In `src/main/crdPages/space/callout/CalloutFormConnector.tsx` submit-error mapping, add a branch for `STORAGE_SERVICE_UNAVAILABLE` (HTTP 503 / timeout / unreachable from file-service-go): map to `forms.collaboraImport.errors.serviceUnavailable` (a non-technical "Document service is temporarily unavailable. Please try again in a moment." message — i18n key from T016) rendered as a **dialog-level alert** (since service-unavailable isn't tied to the file specifically; it's a transport-level concern). The dialog stays open with all input preserved. **MUST NOT auto-retry** (FR-011) — the user retries manually by submitting again. Depends on T022.
- [X] T027 [US2] Mirror T026 in the MUI submit handler at `CreateCalloutDialog.tsx:~167-177`: map `STORAGE_SERVICE_UNAVAILABLE` to `callout.create.framingSettings.collaboraDocument.upload.errors.serviceUnavailable` (key from T018), rendered as a dialog-level alert. Same atomic-failure semantics; no auto-retry. Depends on T024.

**Checkpoint**: Both UI paths support upload end-to-end with full error coverage (format, size, service availability). Unrecognized server errors fall through to the existing dialog-level toast. Manual validation per User Story 2's quickstart recipe.

---

## Phase 5: User Story 3 - Block unsupported files before any network call (Priority: P1)

**Goal**: Picking a file outside the accept list produces a clear inline error before any network call (or after server content-sniff for content-mismatched files), with the dialog state preserved.

**Independent Test**: Try to upload a `.pdf`, `.doc`, image, or any non-supported file. Verify (a) the file picker filters it out where supported, (b) drag-dropped unsupported files trigger an inline error naming `.docx, .xlsx, .pptx`, (c) no network request is made, (d) the rest of the form is preserved.

### Implementation for User Story 3

- [X] T028 [US3] In `src/main/crdPages/space/callout/CalloutFormConnector.tsx`, add a server-error mapping branch: when `createCalloutOnCalloutsSet` returns a `FORMAT_NOT_SUPPORTED` GraphQL error (typically surfaced as the underlying 415 from file-service-go), map it to the same `forms.collaboraImport.errors.unsupported` i18n key used for client-side `extension` rejections. Render the message inline near the upload zone — the dialog stays open, all input preserved (FR-010). Server contract is atomic, so no compensating mutation.
- [X] T029 [US3] Mirror T028 in the MUI submit handler at `CreateCalloutDialog.tsx:~167-177`: map `FORMAT_NOT_SUPPORTED` to `callout.create.framingSettings.collaboraDocument.upload.errors.unsupported`. Same atomic-failure handling.

**Checkpoint**: Both client-pre-check rejections and server content-sniff rejections produce the same human-readable supported-formats inline message. No raw HTTP code reaches the user.

---

## Phase 6: User Story 4 - Block oversized files with the 15 MB cap stated up-front (Priority: P1)

**Goal**: Files strictly larger than 15 MB are rejected before any network call. The cap is stated in the helper text up-front and named in the error message. The dialog stays open with all other input preserved.

**Independent Test**: Try to upload a `.docx` slightly above 15 MB. Verify the inline error appears immediately on selection (no upload begun), names the 15 MB cap, and the rest of the form is intact.

### Implementation for User Story 4

- [X] T030 [US4] In `src/main/crdPages/space/callout/CalloutFormConnector.tsx`, add the server-error mapping for `STORAGE_UPLOAD_FAILED` (413): route to `forms.collaboraImport.errors.tooLarge` (interpolating the cap as MB). Inline near the upload zone; dialog stays open.
- [X] T031 [US4] Mirror T030 in the MUI submit handler at `CreateCalloutDialog.tsx:~167-177`: map `STORAGE_UPLOAD_FAILED` to `callout.create.framingSettings.collaboraDocument.upload.errors.tooLarge`.
- [X] T032 [US4] Verify the 15 MB cap surfaces in helper text rendered by `<DocumentImportZone>` (via the `labelMaxSize` prop wired in T020) AND in error message templates from both i18n surfaces. Both consume `COLLABORA_IMPORT_MAX_BYTES` from the formats module from T003 — single source of truth, no duplicated literals.

**Checkpoint**: 15 MB cap is visible up-front. Pre-check rejection is immediate. Server-side fallback rejection produces the same human-readable message.

---

## Phase 7: User Story 5 - Document framing option respects existing license and permission gates (Priority: P1)

**Goal**: The Document framing option appears only when (a) the destination space's license includes `SPACE_FLAG_OFFICE_DOCUMENTS` and (b) the user holds `CREATE_CALLOUT` on the destination calloutsSet. Both gates apply uniformly to blank-create and the new upload zone.

**Independent Test**: As an author in a space without the office-documents entitlement, open Add Post — Document framing option is disabled with the existing tooltip; neither cards nor upload zone are reachable. With the entitlement, both paths are reachable.

### Implementation for User Story 5

- [X] T033 [US5] Verify the existing license-gate logic at `src/domain/collaboration/callout/CalloutForm/CalloutFormFramingSettings.tsx:73-74` (the `officeDocumentsEnabled = ... entitlements.includes(LicenseEntitlementType.SpaceFlagOfficeDocuments)` derivation, line 251 `disabled: !officeDocumentsEnabled`) covers the entire Document framing radio. Confirm that when the radio is disabled, the new upload zone added in T023 is also unreachable (parent visibility / disabled cascade). No new gating code if the cascade already covers it; otherwise add a wrapping condition.
- [X] T034 [US5] **Verification only** — the CRD chip is already license-gated at `src/main/crdPages/space/callout/CalloutFormConnector.tsx:114-116` via `disabledChips = officeDocumentsEnabled ? undefined : { document: { tooltip: t('framing.officeDocumentsNotEnabled') } }`. Confirm in a runtime smoke test that the `document` chip shows as disabled with the existing tooltip when the entitlement is absent. No code change expected.

**Checkpoint**: License gate covers both creation paths uniformly. Permission gate (`CREATE_CALLOUT`) hides the post-creation entry point itself (existing behaviour, unchanged).

---

## Phase 8: User Story 6 - Documents do not appear among Response Options (Priority: P1)

**Goal**: Documents are removed from the Response Options surfaces in both UI paths — the CRD "Coming soon" Documents tab and the MUI hardcoded-disabled COLLABORA_DOCUMENT radio.

**Independent Test**: Open Add Post in either path. In the Responses section: no "Documents" tab in the CRD path; no "Document" / "Collabora Document" radio in the MUI path. The other four response types (Links & Files, Posts, Memos, Whiteboards) are unchanged.

### Implementation for User Story 6

- [X] T035 [P] [US6] Remove the COLLABORA_DOCUMENT entry (currently `disabled: true` at ~line 157) from the radio-options array in `src/domain/collaboration/callout/CalloutForm/CalloutFormContributionSettings.tsx`. Also remove (a) the `case CalloutContributionType.CollaboraDocument` arm in the `SettingsComponent` switch (~line 53) and (b) the `case CalloutContributionType.CollaboraDocument` arm in the `enabledSettings` switch (~line 70). Adjust any in-file references that become unused after the removal.
- [X] T036 [P] [US6] Remove the "Documents" `'document'` chip + its `DocumentsPanel` body in the CRD response-options surface. Files: (a) `src/crd/forms/callout/ResponseTypeChipStrip.tsx` — remove the `'document'` entry from `CHIPS` (line ~20) and from the `ResponseTypeChipId` union (line 6); (b) `src/crd/forms/callout/ResponsePanel.tsx` — remove the `case 'document':` arm (line ~47-48) and the `DocumentsPanel` function (line ~112-119). **DO NOT delete the `framing.comingSoon` i18n key — it remains in active use by `src/crd/forms/callout/ResponseDefaultsDialog.tsx:155` and `src/crd/forms/callout/ResponseTypeChipStrip.tsx:72` (after T036's chip removal, the `title={chip.disabled ? t('framing.comingSoon') : undefined}` line stays for any future disabled chips; if no chip in the strip ends up disabled at all post-T036, the line itself becomes dead but the key may still be used by `ResponseDefaultsDialog.tsx`).** Verify with `rg "framing.comingSoon" src/` before removing the key from any JSON file; only delete it from `src/crd/i18n/space/space.{en,nl,es,bg,de,fr}.json` if zero references remain across the entire `src/` tree.
- [X] T037 [US6] Update tests under `src/main/crdPages/space/callout/` that previously asserted COLLABORA_DOCUMENT could be a contribution type. Targets: `calloutFormMapper.test.ts` (any test asserting Documents in `allowedTypes`), `deriveCalloutMenuVisibility.test.ts` (any test referencing the contribution variant). Remove or invert the assertions so the test suite passes after T035 and T036.
- [X] T038 [US6] Verify the post-creation pipeline excludes COLLABORA_DOCUMENT from `settings.contribution.allowedTypes` by default (FR-016). Trace from the form's submit-mapper through `useCalloutCreation` to confirm: with the COLLABORA_DOCUMENT radio removed (T035), the only allowedTypes that can be set come from the four remaining response types. If a hardcoded default array elsewhere includes COLLABORA_DOCUMENT, remove it. Check `src/main/crdPages/space/callout/calloutFormMapper.ts` and the MUI equivalent.

**Checkpoint**: Both UI paths show no Documents response option. Existing four response types unchanged.

---

## Phase 9: User Story 7 - Posts behave the same regardless of how their document was created (Priority: P2)

**Goal**: Posts created via blank-create vs. upload behave identically afterwards — open editor, edit, rename (preserving extension), delete (cascade) — with no client-side flag distinguishing them.

**Independent Test**: Create one post via the blank Word Document card and another by uploading a `.docx`. Verify all subsequent operations (open editor, edit, rename, delete) behave identically.

### Implementation for User Story 7

- [ ] T039 [US7] Manual validation per the User Story 7 recipe in `specs/095-collabora-import/quickstart.md` §"Manual test recipes": create a blank-Word post and an uploaded `.docx` post; open editor for both, type a few characters, observe the save indicator on each, rename via the existing rename UX (verify extension preservation on the uploaded one), delete each post and confirm cascade. No code change unless a regression is found — if one is, file a follow-up sub-task and address before merge.

**Checkpoint**: Parity confirmed; no second-class object.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates and cross-cutting verification before merge.

- [X] T040 [P] Run `pnpm lint` and resolve all TypeScript / Biome / ESLint findings on the new and modified files. No `--no-verify` skips.
- [X] T041 [P] Run `pnpm vitest run` and confirm 100% green. New test files: `validateCollaboraImportFile.spec.ts`, `deriveCollaboraDocumentDisplayName.spec.ts`, `collaboraImportFormats.spec.ts`. Modified: `calloutFormMapper.test.ts`, `deriveCalloutMenuVisibility.test.ts` (if touched in T037).
- [X] T042 [P] Confirm no forbidden imports leaked into `src/crd/forms/callout/DocumentImportZone.tsx` — `rg '@mui/|@emotion/|@apollo/client|@/domain/|react-router-dom|formik' src/crd/forms/callout/DocumentImportZone.tsx` MUST return nothing.
- [ ] T043 [P] Network-tab verification: in the running dev stack, perform one blank-create submission (verify `application/json` POST to the GraphQL endpoint, no `multipart/`) and one upload submission (verify `multipart/form-data` POST with the `apollo-require-preflight: true` header set globally). No transport-level changes are needed; this is a regression check.
- [ ] T044 [P] Accessibility walkthrough of `<DocumentImportZone>`: keyboard-only operation (Tab to focus, Enter/Space opens picker, focus-visible ring), screen-reader announcements (staged-file change announced, inline errors announced via `role="alert"`), `aria-busy="true"` while uploading. Document findings in the PR description.
- [ ] T045 [P] **Input-preservation verification (SC-008)**: against a running stack, intentionally trigger each of `FORMAT_NOT_SUPPORTED`, `STORAGE_UPLOAD_FAILED`, `STORAGE_SERVICE_UNAVAILABLE`, and at least one fall-through error (e.g., by submitting under wrong privilege so the existing dialog-level toast fires). For each, after the inline error / dialog alert / toast appears confirm that **all** other dialog inputs (post title, framing chip choice, response settings, visibility toggle, description, tags) are preserved exactly as the author left them. The dialog should never lose work.
- [ ] T046 Run the full quickstart manual checklist from `specs/095-collabora-import/quickstart.md` §"Manual test recipes" against a local stack with the server's `095-collabora-import` branch deployed. Capture screenshots or a short clip for the PR description.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup, T001–T002)**: No dependencies; T002 depends on T001 (codegen needs the updated `.graphql`).
- **Phase 2 (Foundational, T003–T012)**: Depends on Phase 1 completion (T011 / T012 need the regenerated mutation hook from T002). BLOCKS all user-story phases.
- **Phase 3 (US1, T013–T014)**: Depends on Phase 2 (uses `deriveCollaboraDocumentDisplayName` from T005).
- **Phase 4 (US2, T015–T027)**: Depends on Phase 2 (uses every helper, the extended hook, and the form-model fields).
- **Phase 5 (US3, T028–T029)**: Depends on Phase 4 (mappings live in the connector / submit handler from T022 / T024).
- **Phase 6 (US4, T030–T032)**: Depends on Phase 4 (same connectors).
- **Phase 7 (US5, T033–T034)**: Depends on Phase 4 (the upload-zone visibility cascades from the framing radio / chip).
- **Phase 8 (US6, T035–T038)**: Independent of US2 — the cleanup tasks touch different files. Can begin once Phase 2 is done.
- **Phase 9 (US7, T039)**: Manual; depends on US1 + US2 being merged and runnable end-to-end.
- **Phase 10 (Polish, T040–T046)**: After all user-story work the team intends to merge.

### Within each user story

- US1: T013 → T014.
- US2: T015 in parallel with T016 / T018 / T023 (different files) → T017 (depends on T016) → T019 (depends on T015, T016) → T020 (depends on T007, T015, T019) → T021 (depends on T005, T006) → T022 (depends on T011, T021) → T024 (depends on T005, T011, T023) → T025 (depends on T021) → T026 (depends on T022) → T027 (depends on T024).
- US3: T028 in parallel with T029 (different files).
- US4: T030 in parallel with T031 (different files); T032 is a verification of T015 + T020 + T023.
- US5: T033 in parallel with T034 (different files).
- US6: T035 in parallel with T036 (different files); T037 follows; T038 verifies.

### Parallel opportunities

- **Phase 2 wave 1 [P]**: T003, T004, T005, T006 — all touch independent files and have no upstream dependencies.
- **Phase 2 wave 2** (after their respective deps): T007 (after T003), T008 (after T003), T009 (after T005), T011 (after T002).
- **Phase 2 wave 3**: T010 (after T007), T012 (after T011).
- **Phase 4 wave 1 [P]**: T015, T016, T018, T023 — independent CRD/MUI/i18n files.
- **Phase 8 wave 1 [P]**: T035, T036 — different files, different paths.
- **Polish [P]**: T040, T041, T042, T043, T044, T045 — all read-only or test-only verification tasks.

---

## Parallel Example: Phase 2 (Foundational)

These four tasks touch different files and have no shared dependencies — launch concurrently:

```text
T003: src/domain/collaboration/calloutContributions/collaboraDocument/collaboraImportFormats.ts
T004: src/domain/collaboration/calloutContributions/collaboraDocument/filenameWithoutExtension.ts
T005: src/domain/collaboration/calloutContributions/collaboraDocument/deriveCollaboraDocumentDisplayName.ts
T006: src/domain/collaboration/callout/CalloutForm/CalloutFormModel.ts (modify existing file)
```

Then, once T003 lands, these three can run in parallel (T007 produces an artifact T010 needs; T008 / T009 are independent of T007):

```text
T007: src/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile.ts (after T003)
T008: src/domain/collaboration/calloutContributions/collaboraDocument/collaboraImportFormats.spec.ts (after T003)
T009: src/domain/collaboration/calloutContributions/collaboraDocument/deriveCollaboraDocumentDisplayName.spec.ts (after T005)
```

Then, T010 follows T007:

```text
T010: src/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile.spec.ts (after T007)
```

In parallel with the above, once T002 lands, T011 can run; once T011 lands, T012 follows:

```text
T011: src/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation.ts (after T002)
T012: src/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreationWithPreviewImages.ts (after T011)
```

---

## Parallel Example: Phase 4 (User Story 2)

Once Phase 2 is done, this wave is independent:

```text
T015: src/crd/forms/callout/DocumentImportZone.tsx (CRD presentational)
T016: src/crd/i18n/space/space.en.json (CRD strings)
T018: src/core/i18n/en/translation.en.json (MUI strings + Word Document label fix)
T023: src/domain/collaboration/callout/CalloutForm/CalloutFormFramingSettings.tsx (MUI wiring — independent of CRD wiring chain)
```

T017 (CRD non-English translations) then follows T016. T019, T020, T021, T022, T024, T025 form the CRD wiring chain. T026 / T027 (service-unavailable mappings) come after T022 / T024 since they extend the same submit handlers.

---

## Implementation Strategy

### MVP scope (User Stories 1 + 2 + 3 + 4 + 5 + 6 — all P1)

P1 includes six stories. The MVP for this iteration is the full P1 set: blank-create works (US1), upload works (US2), unsupported files rejected (US3), oversized files rejected (US4), license / permission gates respected (US5), Documents removed from Response Options (US6). US7 is parity verification (P2) and ships alongside.

Suggested order:

1. **Phase 1 + 2**: Setup (T001–T002) and Foundational (T003–T012). Two PR-sized chunks; the Foundational phase lands the helpers + extended hook + form model.
2. **Phase 3 (US1)**: T013–T014. Quick — mostly threading the new helper into the existing blank-create branch and adding a regression test.
3. **Phase 4 (US2)**: T015–T027. Bulk of the new code — both UI paths, both i18n surfaces, the wiring, the mapper update, the integration tests, AND the explicit server-error mappings for format / size / service-unavailable. Unrecognized server errors fall through to the existing dialog-level toast — no special handling. This is the headline work.
4. **Phases 5–7 (US3, US4, US5)**: T028–T034. Small targeted error-mapping and gate-verification tasks; each phase is one short PR.
5. **Phase 8 (US6)**: T035–T038. Cleanup; can run in parallel with the other phases since it touches different files.
6. **Phase 9 (US7)**: T039. Manual validation pass.
7. **Phase 10 (Polish)**: T040–T046. Lint, tests, accessibility, network verification, input-preservation regression check, full quickstart pass before merge.

### Parallel team strategy

With multiple developers:

1. Whole team completes Phase 1 + Phase 2 together (the helpers + hook + form model are shared infrastructure).
2. Once Phase 2 is done:
   - Developer A: Phase 4 (US2 — bulk work, including service-availability mapping).
   - Developer B: Phase 8 (US6 — cleanup; entirely independent files).
   - Developer C: Phase 3 (US1) and then Phase 5–7 once US2's connectors are ready.
3. Polish phase (Phase 10) is a team-wide gate.

---

## Notes

- **No new dependencies required** — `apollo-upload-client` already ships with the project (`package.json` + `src/core/apollo/graphqlLinks/httpLink.ts`).
- **Server contract is firm** on alkem-io/server branch `095-collabora-import` — this iteration consumes it unchanged.
- **Atomic-failure server contract** — the FE never compensates for partial backend state on any error.
- **Constitution**: Phase 2 helpers are pure functions with unit tests (Principle V — tests for non-trivial logic). The drag-drop CRD component meets WCAG 2.1 AA (Principle V). All mutations route through generated hooks (Principle III). All domain logic stays under `src/domain/` (Principle I).
- **Out of scope**: Drawing (`.odg`) in the picker, legacy Office formats (`.doc`, `.xls`, `.ppt`), ODF formats (`.odt`, `.ods`, `.odp`, `.rtf`, `.csv`), PDF, replace-existing-document UX, Documents as a contribution / response option (sibling ticket #9620), and any backend change.
