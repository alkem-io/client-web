---
description: "Task list for 116-document-responses (story alkem-io/client-web#10083)"
---

# Tasks: Documents as Post Responses

**Input**: Design documents from `/specs/116-document-responses/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓
**Story**: alkem-io/client-web#10083

**Tests**: REQUIRED — the constitution's testing gate and this repo's exit gates mandate `pnpm lint` + `pnpm vitest run`; new/changed pure logic gets unit coverage, written test-first where feasible. Thin Apollo-wiring connectors (add/open/overlay components) follow this codebase's existing convention of no dedicated unit test for that file family (Whiteboard/Memo/Post add-connectors have none either) — covered instead by the `quickstart.md` manual recipes.

**Scope of this PR**: **US1 (P1) + US2 (P1) + US3 (P1) + US4 (P2) all ship in this one PR** — the feature is one cohesive vertical slice (enable the type → add one → reject bad input → open/rename/delete it); splitting across PRs would leave an unusable half-feature (e.g. a selectable-but-unaddable response type).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = enable Documents as response type, US2 = add via upload, US3 = client-side rejection, US4 = open/rename/delete

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the worktree builds and the existing suite is green before changes, and confirm the local backend needed for codegen is reachable (it already is — `curl localhost:3000/graphql` responds to introspection).

- [ ] T001 Verify deps installed and baseline gates pass in the worktree: `pnpm install` (if needed), `pnpm vitest run` (record baseline pass count), `pnpm lint`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The one new server-facing contract and the one DRY infrastructure extraction that every user story either directly needs (US2) or implicitly depends on (US3's error messaging). No user-story work should start before this phase completes.

- [ ] T002 Add `src/domain/collaboration/calloutContributions/collaboraDocument/graphql/ImportCollaboraDocument.graphql` per `contracts/graphql-operations.md` (mutation `ImportCollaboraDocument($file: Upload!, $uploadData: ImportCollaboraDocumentInput!)`, reusing the existing `CalloutContributionsCollaboraDocumentCard` fragment from `CalloutContributions.graphql`). Run `pnpm codegen` (backend already reachable at `localhost:3000/graphql`) and commit the regenerated `useImportCollaboraDocumentMutation` hook + types in `src/core/apollo/generated/`.
- [ ] T003 [P] Extract the inline `collaboraImportError.kind → i18n key` switch currently living in `src/main/crdPages/space/callout/CalloutFormConnector.tsx` (the `collaboraImportErrorMessage` block) into a new shared pure helper `src/domain/collaboration/calloutContributions/collaboraDocument/deriveCollaboraImportErrorMessage.ts` — signature `(error: ValidationError | null, t: TFunction, formatList: string, capMb: number) => string | null`, covering all four `ValidationError['kind']` branches (`extension`, `size`, `multiple-files`, `folder`) via the existing `documentImportError*` i18n keys. Update `CalloutFormConnector.tsx` to call the extracted helper (behavior-preserving refactor — no visible change to the framing-upload flow).
- [ ] T004 [P] New `src/domain/collaboration/calloutContributions/collaboraDocument/deriveCollaboraImportErrorMessage.spec.ts` — table-driven test covering all four `ValidationError` kinds plus `null` → `null`.

**Checkpoint**: The write mutation exists and is typed; the shared error-message mapper exists and is unit-tested; the framing-upload flow is unchanged and still green. User story implementation can now begin.

---

## Phase 3: User Story 1 - Enable Documents as the response type (Priority: P1) 🎯 MVP

**Goal**: A "Documents" chip is selectable in the Responses section of the post-creation/edit form, on equal footing with Links & Files, Posts, Memos, and Whiteboards.

**Independent Test**: Open post creation, select the Documents chip, submit — verify the created post's `allowedTypes` is `[COLLABORA_DOCUMENT]` and that reopening the edit dialog shows Documents locked/active.

### Tests for User Story 1 (write first, expect FAIL before impl)

- [ ] T005 [P] [US1] Extend `src/crd/forms/callout/ResponseTypeChipStrip.test.tsx` — add cases asserting a `'document'` chip renders (label from `contributionSettings.types.document`), is selectable (fires `onChange('document')`), is included/excluded correctly by `allowedChips` filtering, and is inert when `locked`. Expect FAIL (chip doesn't exist yet).
- [ ] T006 [P] [US1] Extend `src/main/crdPages/space/callout/calloutFormMapper.test.ts` — add cases: `responseTypeToServer('document') === CalloutContributionType.CollaboraDocument`; `mapFormToCalloutCreationInput` with `responseType: 'document'` produces `settings.contribution.allowedTypes === [CalloutContributionType.CollaboraDocument]` and omits `contributionDefaults` (documents have no defaults panel — Assumption A-004). Expect FAIL (map entry doesn't exist yet).

### Implementation for User Story 1

- [ ] T007 [US1] Edit `src/crd/forms/callout/types.ts`: add `'document'` to the `ResponseType` union; update the stale doc comment above it (currently states documents "MUST NOT appear among Response Options" per the now-superseded FR-015/FR-016 from spec 095 — replace with a note that Documents is now a supported response type, upload-only, per this story).
- [ ] T008 [US1] Edit `src/crd/forms/callout/ResponseTypeChipStrip.tsx`: add `'document'` to `ResponseTypeChipId`; add a chip entry `{ id: 'document', labelKey: 'contributionSettings.types.document', icon: FileText }` to `CHIPS` (import `FileText` from `lucide-react`). Makes T005 pass.
- [ ] T009 [US1] Edit `src/crd/forms/callout/ResponsePanel.tsx`: add `case 'document': return <SimpleContributionPanel {...props} />;` to the dispatch switch (reuses the existing sub-panel — `ActorSwitches` only; no defaults button, since `responseTypeSupportsDefaults` in `CalloutFormConnector.tsx` already excludes `'document'` by construction).
- [ ] T010 [US1] Edit `src/main/crdPages/space/callout/calloutFormMapper.ts`: add `document: CalloutContributionType.CollaboraDocument` to `RESPONSE_TO_CONTRIBUTION_TYPE`. Makes T006 pass.

**Checkpoint**: Documents is selectable, submittable, and locks correctly on edit. T005/T006 fully green. `pnpm vitest run` still green overall.

---

## Phase 4: User Story 2 - Add a document response by uploading (Priority: P1)

**Goal**: A member can upload a `.docx`/`.xlsx`/`.pptx` file as a response on a Documents-type post from either the feed-level preview or the full detail dialog, and see it appear as a card.

**Independent Test**: On a Documents-type post, open "Add document" from the feed preview, upload a supported file, confirm the card appears; repeat from the detail dialog and confirm identical behavior (FR-016).

### Tests for User Story 2 (write first, expect FAIL before impl)

- [ ] T011 [US2] New `src/main/crdPages/space/dataMappers/contributionDataMapper.test.ts` (no prior test file exists for this mapper). Cover `mapAnyContributionToCardData`: a `collaboraDocument` item for each of `WORDPROCESSING`/`SPREADSHEET`/`PRESENTATION` → `{ type: 'document', documentId, documentType: 'text'|'spreadsheet'|'presentation', title, author, createdDate }`; a `DRAWING` item → `documentType: 'text'` (matches the existing `toCollaboraPreviewType` collapsing behavior, unchanged by this story); an item with none of the five fields set → `undefined` (existing fallthrough, regression-pinned). Expect the `collaboraDocument`-branch assertions to FAIL before impl.

### Implementation for User Story 2

- [ ] T012 [US2] Edit `src/main/crdPages/space/dataMappers/contributionDataMapper.ts` per `data-model.md`: extend `ContributionCardData.type` with `'document'` and add `documentId?: string` / `documentType?: 'text' | 'spreadsheet' | 'presentation'`; extend `AnyContributionItem` with an optional `collaboraDocument` field; add the new `if (item.collaboraDocument)` branch using the existing `toCollaboraPreviewType` (import from `@/main/crdPages/space/callout/collaboraDocumentTypeMap`). Makes T011 pass.
- [ ] T013 [P] [US2] New `src/crd/components/contribution/ContributionDocumentCard.tsx`: props `{ title: string; documentType: 'text' | 'spreadsheet' | 'presentation'; author?: string; onClick?: () => void; className?: string }`. Structurally mirrors `ContributionWhiteboardCard` (fixed-height box, `bg-muted/30`, hover "Open Document" overlay reusing `t('callout.openDocument')`, title/author gradient footer) but renders only the icon-fallback branch (`FileText`/`Sheet`/`Presentation` by `documentType`, `aria-hidden`, no image branch — no preview URL exists for this entity, R7).
- [ ] T014 [US2] Edit `src/main/crdPages/space/callout/ContributionGridConnector.tsx`: add `case 'document': return <ContributionDocumentCard key={contribution.id} title={contribution.title} documentType={contribution.documentType ?? 'text'} author={contribution.author?.name} onClick={() => onContributionClick?.(contribution.id, contribution.documentId)} />;`.
- [ ] T015 [US2] New `src/main/crdPages/space/callout/DocumentContributionAddConnector.tsx`, matching the existing `open`/`onOpenChange`/`inlineTrigger`/`calloutId`/`onCreated` prop shape used by `WhiteboardContributionAddConnector`/`MemoContributionAddConnector`. Body: `DocumentImportZone` (accept `COLLABORA_IMPORT_ACCEPT_ATTR`, helper text from `callout.documentImportHint`/`documentImportMaxSize` with `capMb`/`formatList` from `collaboraImportFormats.ts`) for staging; on stage, run `validateCollaboraImportFile([file])` (FR-006) and surface `deriveCollaboraImportErrorMessage` (T003) on failure with no network call; on confirm, call `useImportCollaboraDocumentMutation({ variables: { file, uploadData: { calloutID: calloutId } }, refetchQueries: ['CalloutDetails', 'CalloutContributions'], awaitRefetchQueries: true })` (FR-007 — no `displayName`, no `sortOrder`); busy/`aria-busy` state prevents double-submit (FR-008); on success call `onCreated?.()`, close, and open the new document's editor directly (`editingDocumentContributionId` local state) via the overlay built in US4 (T020 `CollaboraContributionEditorOverlay` / T021 `DocumentContributionConnector`) — since US4 has not been implemented yet when this task executes, stub the "open on create" call as a no-op `onCreated?.()` only for now and complete the auto-open wiring as part of T023 instead, to keep US2 independently testable without a hard forward-dependency on US4's files. Map server error codes (`FORMAT_NOT_SUPPORTED`, `STORAGE_UPLOAD_FAILED`, `STORAGE_SERVICE_UNAVAILABLE`) the same way `CalloutFormConnector.tsx` does (FR-010/FR-011, Assumption A-007), reusing T003's helper for the first two and `t('callout.documentImportErrorServiceUnavailable')` (toast, no auto-retry) for the third.
- [ ] T016 [US2] Edit `src/main/crdPages/space/callout/ContributionsPreviewConnector.tsx`: `addConnector` ternary gains `contributionType === CalloutContributionType.CollaboraDocument ? <DocumentContributionAddConnector inlineTrigger={true} open={addOpen} onOpenChange={setAddOpen} calloutId={callout.id} /> : ...`; `addLabel` ternary gains `: contributionType === CalloutContributionType.CollaboraDocument ? t('callout.addDocument') : ''`; the local `ContributionCard` switch (bottom of file) gains `case CalloutContributionType.CollaboraDocument: return <ContributionDocumentCard title={contribution.title} documentType={contribution.documentType ?? 'text'} author={contribution.author?.name} onClick={onClick} />;`.
- [ ] T017 [US2] Edit `src/main/crdPages/space/callout/CalloutDetailDialogConnector.tsx`'s `ContributionsSlot`: `trailingSlot` ternary gains `: contributionType === CalloutContributionType.CollaboraDocument ? <DocumentContributionAddConnector calloutId={callout.id} onCreated={onContributionCreated} /> : null` (non-inline — standard `ContributionAddCard` trigger, matching the Whiteboard/Memo/Post branches immediately above it).

**Checkpoint**: A document can be uploaded and appears as a card from both entry points (FR-016); T011 fully green; `pnpm vitest run` still green overall.

---

## Phase 5: User Story 3 - Block unsupported/oversized files client-side (Priority: P1)

**Goal**: Uploading an unsupported extension or an oversized file is rejected before any network call, with a human-readable inline message; a server-side content-mismatch rejection surfaces the same kind of message rather than a raw error code.

**Independent Test**: Attempt a `.pdf` and, separately, an oversized `.docx` — both rejected client-side with no network request (verified in devtools); no orphan contribution created.

### Verification for User Story 3

> No new production code is needed — `DocumentContributionAddConnector` (T015) already wires `validateCollaboraImportFile` before any mutation call and `deriveCollaboraImportErrorMessage` (T003, already unit-tested in T004) for both the pre-check and server-rejection paths, satisfying FR-006/FR-010/FR-011 by construction. This phase exists to make that requirement traceability explicit and to actually exercise it, matching this repo's existing convention of not adding a redundant test at the thin-connector layer.

- [ ] T018 [US3] Manual verification per `quickstart.md`'s US3 recipe: (a) attempt to upload a `.pdf` via `DocumentContributionAddConnector` → confirm the inline "unsupported format" message (naming `.docx`, `.xlsx`, `.pptx`) and, via browser devtools Network tab, confirm zero requests to `/graphql` for `importCollaboraDocument`; (b) attempt a `.docx` file larger than 15 MB → confirm the inline cap message and zero network requests; (c) confirm the dialog stays open and re-attempting with a valid file succeeds without needing to reopen the dialog.
- [ ] T019 [US3] Confirm (by reading `DocumentContributionAddConnector`'s error-handling branch, T015) that a server-side `FORMAT_NOT_SUPPORTED` rejection (content-sniff mismatch on a renamed file) renders through `deriveCollaboraImportErrorMessage` rather than a raw Apollo/GraphQL error string — if it does not, fix the mapping in T015's file before proceeding. No new file.

**Checkpoint**: FR-006/FR-010/FR-011 verified end-to-end; SC-003 satisfied.

---

## Phase 6: User Story 4 - Open, rename, and delete a document response (Priority: P2)

**Goal**: Clicking a document response card opens the same Collabora editor used for framing documents directly; renaming and deleting go through the existing, generic mechanisms this codebase already uses for every other contribution type.

**Independent Test**: Add a document response, click it, verify the editor opens directly; rename it and verify the grid reflects the new name after closing; delete it via the shared confirm dialog and verify the card is gone.

### Implementation for User Story 4

- [ ] T020 [US4] New `src/main/crdPages/space/callout/CollaboraContributionEditorOverlay.tsx` — sibling of `CollaboraFramingEditorOverlay.tsx` (same header/iframe/footer/recovery-dialog structure, same `CollaboraDocumentEditor` + `useCollaboraEditorConnection` + `useRenameCollaboraDocument` reuse) with two deltas: (a) its `refetchDocumentName` targets `client.refetchQueries({ include: ['CalloutContributions', 'CalloutDetails'] })` instead of the framing-only `CalloutsOnCalloutsSetUsingClassification`; (b) it accepts new optional props `canDelete?: boolean` and `onDelete?: () => void` — when both are present, render a header trash-icon `Button` (ghost, icon, `aria-label={t('deleteContribution.confirm')}`) next to the existing rename/close controls that calls `onDelete` (no in-component confirmation — the parent owns that, R5).
- [ ] T021 [US4] New `src/main/crdPages/space/callout/DocumentContributionConnector.tsx`, mirroring `WhiteboardContributionConnector.tsx`'s shape but with an added `calloutPrivileges` prop (research R10 — see `data-model.md`): props `{ open: boolean; contributionId: string; calloutPrivileges: AuthorizationPrivilege[] | undefined; onClose: () => void; onDelete: (id: string, title: string) => void }`. Fetches `useCalloutContributionQuery({ variables: { contributionId, includeCollaboraDocument: true }, skip: !open || !contributionId })`; derives `canRenameCollaboraDocument({ documentPrivileges: data?.lookup.contribution?.collaboraDocument?.authorization?.myPrivileges, calloutPrivileges, includeContentEditors: true })` (the document-OR-callout OR-rule, parity with the framing overlay's rename rule — **not** `documentPrivileges` alone); derives `canDelete` from `lookup.contribution.authorization.myPrivileges` (the `CalloutContribution` wrapper's own privileges, matching the existing `canDeleteSelectedWhiteboard` precedent — **not** the nested document's privileges); renders `CollaboraContributionEditorOverlay` (T020) with `onDelete={() => onDelete(contributionId, doc.profile.displayName)}`.
- [ ] T022 [US4] Edit `src/main/crdPages/space/callout/CalloutDetailDialogConnector.tsx`: add `documentContributionId`/`documentEditorOpen` state (mirrors `whiteboardContributionId`/`whiteboardEditorOpen` exactly); extend the `initialContributionId` sync `useEffect` and the dialog-close reset `useEffect` with a `CalloutContributionType.CollaboraDocument` branch (open the editor directly, matching the Whiteboard branch); extend `handleContributionClick`'s `else if` chain with the same direct-open behavior; render a `documentOverlay` JSX constant (mirrors `whiteboardOverlay`) using `DocumentContributionConnector` (T021), passed `calloutPrivileges={callout.authorization?.myPrivileges}` (the same value already used to compute `canRenameFramingDocument` a few lines above — reuse, don't recompute) and `onDelete={(id, title) => setConfirmDeleteContribution({ id, title, kind: 'document' })}`; widen `confirmDeleteContribution`'s `kind` union from `'post' | 'whiteboard'` to `'post' | 'whiteboard' | 'document'`; widen `handleDeleteContributionConfirm`'s post-delete cleanup `if/else` into a three-way branch so a `'document'` deletion clears `documentEditorOpen`/`documentContributionId` (not the whiteboard state) and closes the overlay; render `{documentOverlay}` alongside the existing `{whiteboardOverlay}` etc. in both dialog-body branches (the `activeCommentsRoomId` present/absent JSX returns near the end of the file).
- [ ] T023 [US4] Wire the deferred "open on create" behavior from T015: once `DocumentContributionConnector`/`CollaboraContributionEditorOverlay` exist, `DocumentContributionAddConnector`'s `onCreated` success path sets local state so its parent (`ContributionsPreviewConnector`'s inline path, and `CalloutDetailDialogConnector`'s `ContributionsSlot`) can open the newly-created document's editor immediately — mirroring `WhiteboardContributionAddConnector`'s `editingWhiteboard` pattern. Implement by having `DocumentContributionAddConnector` accept an optional `onDocumentCreated?: (contributionId: string) => void` callback (in addition to `onCreated`), fired with the mutation response's `data.importCollaboraDocument.id`; wire it at both call sites (T016, T017) to set `documentContributionId` + `documentEditorOpen(true)` on the nearest `CalloutDetailDialogConnector` instance (the feed-preview inline path routes through the same detail-dialog connector once the grid is inside it — confirm during implementation whether the feed-level `ContributionsPreviewConnector` needs its own lightweight open-state, since it does not embed `CalloutDetailDialogConnector`; if so, mount a second, narrowly-scoped `DocumentContributionConnector` instance directly in `ContributionsPreviewConnector` for this "open what I just created" case only, matching how `WhiteboardContributionAddConnector` mounts its own `CrdWhiteboardView` directly rather than delegating to a parent dialog).

**Checkpoint**: All four user stories independently functional; SC-004 satisfied (open/rename/delete parity with existing response types).

---

## Phase 7: Polish & Verification

- [ ] T024 Run targeted tests: `pnpm vitest run src/crd/forms/callout/ResponseTypeChipStrip.test.tsx src/main/crdPages/space/callout/calloutFormMapper.test.ts src/main/crdPages/space/dataMappers/contributionDataMapper.test.ts src/domain/collaboration/calloutContributions/collaboraDocument/deriveCollaboraImportErrorMessage.spec.ts --reporter=basic` — all green.
- [ ] T025 Run full exit gates: `pnpm vitest run` (no regressions vs. T001 baseline) and `pnpm lint` (TypeScript + Biome + ESLint clean). Fix any failures and re-run.
- [ ] T026 Self-review the diff against `contracts/graphql-operations.md` and `spec.md`'s FR-001..FR-018: confirm zero server-side (`server` repo) changes; confirm zero new/modified locale files (R8); confirm no `@mui/*`/`@emotion/*` anywhere in the diff; confirm `CollaboraFramingEditorOverlay.tsx` and the framing document-upload flow in `CalloutFormConnector.tsx` are otherwise unchanged aside from T003's extraction (US-parity with the sibling 095 feature is preserved, not regressed).
- [ ] T027 Run `pnpm codegen` once more with a clean working tree to confirm the committed generated output (T002) is byte-for-byte reproducible (no drift from manual edits).

**Checkpoint**: PR mergeable — spec, plan, and contracts all satisfied; gates green.

---

## Dependencies & Execution Order

### Phase dependencies

- Setup (T001) → first.
- Foundational (T002–T004) → after Setup; T002 (mutation+codegen) and T003 (error-helper extraction) are independent of each other [P]; T004 (helper's test) depends on T003.
- US1 (T005–T010) → after Foundational. Test-first: T005/T006 [P] before T007–T010.
- US2 (T011–T017) → after US1 (needs a Documents-type post to add a response to) and after Foundational (needs T002's mutation, T003's error helper). Test-first: T011 before T012. T013 [P] with T012 (different files). T014–T017 depend on T012/T013 existing.
- US3 (T018–T019) → after US2 (exercises the connector T015 built); no new files.
- US4 (T020–T023) → after US2 (opens contributions US2 can now create); T020/T021 [P]-eligible in principle but T021 imports T020, so sequential in practice; T022 depends on both; T023 depends on T020–T022 all existing (closes the deferred wiring noted in T015).
- Polish (T024–T027) → after US1+US2+US3+US4.

### Within US1

- T005, T006 in parallel (different test files) before T007–T010.
- T007 before T008 (chip id type must include `'document'` before the chip entry references it) — practically fine either order since both are same-file-adjacent edits in different files; keep T007 first for clarity.

### Within US2

- T011 (test) before T012 (impl) — test-first.
- T012 and T013 in parallel (different files: mapper vs. new CRD card).
- T014, T015 depend on T012 (data shape) and T013 (card component) both existing.
- T016, T017 depend on T015 (the add connector they mount).

### Within US4

- T020 (overlay) before T021 (connector that renders it).
- T022 depends on T020 and T021.
- T023 depends on T020, T021, T022, and reopens T015/T016/T017 to complete the deferred auto-open wiring.

### Parallel opportunities

- T002 and T003: independent files (new `.graphql` operation vs. refactoring an existing `.tsx`).
- T005 and T006: independent test files.
- T012 and T013: independent implementation files (mapper vs. CRD card).

## Implementation Strategy

MVP = US1 + US2 (the story's literal acceptance criterion, "Add documents as a response type," plus the ability to actually add one — US1 alone has no user-visible value on its own since there would be nothing to add). US3 is a verification-only phase riding on US2's construction. US4 is P2 — parity/organisation value, real but lower priority than being able to add a document at all. All four ship in one PR (see Scope note above) given the tight coupling and small total size. Complete Setup → Foundational → US1 → US2 → US3 → US4 → Polish → open PR as one slice.

## Notes

- [P] = different files, no dependency.
- Commit in logical slices: (a) Foundational (mutation + codegen + error-helper extraction), (b) US1 (response-type plumbing), (c) US2 (add flow + card + grid wiring), (d) US4 (editor overlay + open/rename/delete wiring, including US3's verification pass), (e) polish/gate fixes if any.
- All commits signed (repo requirement).
- Keep the tree green between commits — run `pnpm lint` before each commit per `CLAUDE.md`.
