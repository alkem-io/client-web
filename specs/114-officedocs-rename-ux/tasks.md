# Tasks: OfficeDocs Rename UX

**Input**: Design documents from `specs/114-officedocs-rename-ux/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rename-ui-contract.md
**Scope**: `client-web` only. All paths are relative to the repo root.

**Tests**: Component/unit tests are included for the **new reusable units** (control, hook, dialog),
as named in `quickstart.md` (they carry the validation/gating logic — SC-007/SC-008).

**Organization**: Grouped by user story (spec priorities). US1 and US2 are both P1; US1 (the
document-editor-without-callout-rights path) is the MVP 🎯.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US4 (user-story phases only)

---

## Phase 1: Setup

- [X] T001 Create branch `114-officedocs-rename-ux` off `develop` and run `pnpm install`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared query field, rename mechanics, and strings that US1 + US2 both depend on.

**⚠️ CRITICAL**: US1 and US2 gating/mechanics cannot be implemented until T002–T004 are done.

- [X] T002 **[C1]** Add the document's own authorization to **all** callout gate queries: add `authorization { id myPrivileges }` to the `collaboraDocument` selection in `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql` (`CalloutDetails`, feeds the list menu + the editor overlay) **and** `src/domain/collaboration/callout/graphql/CalloutContent.graphql`. Prefer extracting a shared `CollaboraDocumentGate` fragment used by both to prevent drift. (FR-002)
- [X] T003 Run `pnpm codegen` to regenerate types/hooks for the new `collaboraDocument.authorization` selection. (depends on T002)
- [X] T004 [P] Create the rename hook `useRenameCollaboraDocument` in `src/domain/collaboration/calloutContributions/collaboraDocument/useRenameCollaboraDocument.ts` — holds `editing/draft/saving/error` state, validates with `displayNameValidator` (non-blank, min 3, max 128), no-ops when unchanged after trim, calls `useUpdateCollaboraDocumentMutation` (`{ updateData: { ID, displayName } }`), and on failure keeps the persisted name + sets `error`. Exposes `readOnly = !canRename`. (FR-007, FR-008, FR-013, FR-014)
- [X] T005 [P] Add shared i18n keys under `crd-space` in `src/crd/i18n/space/space.en.json` — "Rename document" (menu + dialog title), Save/Cancel labels; reuse existing `forms.validations.*` messages. (FR-006, FR-007)
- [X] T006 [P] Unit test for `useRenameCollaboraDocument` in `src/domain/collaboration/calloutContributions/collaboraDocument/useRenameCollaboraDocument.test.ts` — valid save calls the mutation; invalid (empty/whitespace/<3/>128) rejected & not persisted; unchanged = no-op; failure retains name. (SC-008)

**Checkpoint**: Gate queries return the document privilege; rename mechanics + strings ready.

---

## Phase 3: User Story 1 - Rename via the per-callout "Rename document" action (Priority: P1) 🎯 MVP

**Goal**: A user who can edit the **document** but **not** the callout renames it from the callout's context menu → a standalone dialog, without opening the callout edit dialog.

**Independent Test**: As an account with the document's `Update` privilege but not the callout's, open the callout menu → "Rename document" is present → rename to a valid value → the document-name surfaces update. As an account with neither privilege, the action is absent.

- [X] T007 [US1] Create `RenameCollaboraDocumentDialog` in `src/domain/collaboration/calloutContributions/collaboraDocument/RenameCollaboraDocumentDialog.tsx` — a small modal (Dialog primitives `src/crd/primitives/dialog.tsx` + `Input`) with a single name field + Save/Cancel, backed by `useRenameCollaboraDocument`; props `{ open, collaboraDocumentId, displayName, onClose }`. (FR-003, FR-006, FR-007)
- [X] T008 **[U1]** [US1] Add `documentMyPrivileges?: AuthorizationPrivilege[]` to `CalloutMenuPermissionsInput` and derive `canRenameDocument = isCollaboraDocument && (documentMyPrivileges?.includes(Update) || editable)` in `src/main/crdPages/space/callout/deriveCalloutMenuVisibility.ts` (`isCollaboraDocument` already exists; `editable` is the existing callout-Update check). (FR-001, FR-002, FR-003)
- [X] T009 [US1] Add a "Rename document" item to `src/crd/components/callout/CalloutContextMenu.tsx` — new `onRenameDocument?: () => void` + visibility from `canRenameDocument`; shown only for document callouts to permitted users. (FR-003)
- [X] T010 [US1] Wire the action and host the dialog in `src/main/crdPages/space/callout/CalloutSettingsConnector.tsx` — supply `documentMyPrivileges` from `callout.framing.collaboraDocument?.authorization?.myPrivileges`, pass `onRenameDocument` down (through `src/main/crdPages/space/callout/LazyCalloutItem.tsx` if needed), and open `RenameCollaboraDocumentDialog` with the callout's `collaboraDocument.id` + current `displayName`. (FR-003, FR-010)
- [X] T011 [P] [US1] Component test for `RenameCollaboraDocumentDialog` in `src/domain/collaboration/calloutContributions/collaboraDocument/RenameCollaboraDocumentDialog.test.tsx` — valid rename persists & closes; invalid rejected with message & not persisted; cancel leaves name unchanged. (SC-008)

**Checkpoint**: US1 fully functional — the menu-action rename path works for document editors, including those without callout rights.

---

## Phase 4: User Story 2 - Rename from the open editor's title bar (Priority: P1)

**Goal**: A user who may rename (document-edit OR callout-edit) renames from the editor header; the title updates live.

**Independent Test**: Open the document as a permitted user; rename from the title bar; the title updates without reopening and persists. A non-permitted user sees the title read-only.

- [X] T012 [P] [US2] Create the reusable inline control `CollaboraDocumentDisplayName` in `src/crd/components/collabora/CollaboraDocumentDisplayName.tsx`, mirroring `WhiteboardDisplayName`/`MemoDisplayName` exactly (pencil → input → Check/Cancel; Enter=save, Escape=cancel; hidden pencil when `readOnly`). (FR-006, FR-014)
- [X] T013 [US2] Render `CollaboraDocumentDisplayName` in the header of `src/main/crdPages/space/callout/CollaboraFramingEditorOverlay.tsx` (replace the static `DialogTitle` text), accept a new `canRename: boolean` prop, back it with `useRenameCollaboraDocument`, and sync the local header title on successful rename. (FR-004, FR-006, FR-009)
- [X] T014 [US2] Derive `canRename = documentUpdate || calloutUpdate` in `src/main/crdPages/space/callout/CalloutDetailDialogConnector.tsx` (using `framing.collaboraDocument.authorization.myPrivileges` + `callout.authorization.myPrivileges`) and pass it to `CollaboraFramingEditorOverlay`. (FR-001, FR-004)
- [X] T015 [P] [US2] Component test for `CollaboraDocumentDisplayName` in `src/crd/components/collabora/CollaboraDocumentDisplayName.test.tsx` — edit/save/cancel, Enter/Escape, `readOnly` hides the affordance, invalid input rejected. (SC-007, SC-008)

**Checkpoint**: US2 works independently — in-editor rename, gated by the union, live-updating.

---

## Phase 5: User Story 3 - Callout edit dialog document box cleanup (Priority: P2)

**Goal**: On edit, the callout edit dialog's document box shows the existing document name **read-only** and drops the "Create new" type picker; no rename in the box.

**Independent Test**: Open the callout edit dialog for a Collabora-document callout; the box shows the current name read-only, no "Create new" picker, no rename control.

- [X] T016 [US3] Plumb the existing document into the edit form: add `collaboraDocumentId` (+ `displayName`, `documentType`) to `editMeta` in `src/main/crdPages/space/callout/dataMappers/mapCalloutDetailsToFormValues.ts` (mirror `memoId`), and pass `editCollaboraDocument*` props from `src/main/crdPages/space/callout/CalloutFormConnector.tsx` into `FramingEditorConnector`. (FR-005)
- [X] T017 [US3] In `src/main/crdPages/space/callout/FramingEditorConnector.tsx` `case 'document'` **edit mode**, render a read-only existing-document box (icon + type + name, memo-box style) and stop rendering the `CollaboraDocumentTypePicker` "Create new" box; **no** rename control in the box. Create mode unchanged. (FR-005, SC-005)

**Checkpoint**: US3 delivered — stale "Create new" picker gone on edit; name read-only in the box.

---

## Phase 6: User Story 4 - Download name + original extension (Priority: P3, verification)

**Goal**: A renamed document downloads with the new base name and its original extension (already backend-provided).

**Independent Test**: Rename a document, download it from Collabora's File menu; base name = new display name, extension = original.

- [ ] T018 [US4] Verify end-to-end (no client code): after a rename, downloading the document yields `<newDisplayName>.<originalExt>`, including for names containing dots/invalid filename characters; record the result in the PR notes. (FR-011, FR-012, SC-006)

**Checkpoint**: US4 confirmed — extension preserved through rename.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T019 [P] Add the new i18n keys to the remaining locales (`space.de.json`, `space.fr.json`, `space.nl.json`, `space.es.json`, `space.bg.json`).
- [ ] T020 [P] Run the `quickstart.md` acceptance walkthrough with the three-account gate matrix (can edit file / can edit callout / neither) across US1–US4, and confirm the expected **card-title divergence** (C2 — the space-feed card title does not change on document rename).
- [X] T021 Run `pnpm lint` + type-check and fix any issues introduced.
- [ ] T022 [P] Optionally run Playwright e2e for US1–US4 + the gate matrix.

---

## Dependencies & Execution Order

### Phase dependencies
- **Setup (P1)**: none.
- **Foundational (P2: T002–T006)**: needs Setup. **Blocks US1 & US2.** (T003 depends on T002; T004/T005/T006 are [P].)
- **US1 (P3: T007–T011)**: needs Foundational (query+codegen+hook+strings). T007→T008→T009→T010 mostly sequential (dialog → gate input → menu item → wiring); T011 [P] after T007.
- **US2 (P4: T012–T015)**: needs Foundational. T012 [P] (new file) can start early; T013 needs T012+T004; T014 needs T003; T015 [P] after T012.
- **US3 (P5: T016–T017)**: display-only; independent of the query/hook — can run in parallel with US1/US2.
- **US4 (P6: T018)**: verification — needs US1 or US2 delivering rename.
- **Polish (P7)**: after the desired stories.

### Parallel opportunities
- Foundational: T004, T005, T006 in parallel (T004 after T003 for hook typing).
- US1, US2, US3 can be worked in parallel by different developers once Foundational is done (US3 even earlier).
- Test tasks (T006, T011, T015) run in parallel with sibling work on different files.

### MVP
- Setup + Foundational + **US1** (T001–T011) = the defining capability (rename without callout rights). Stop & validate, then add US2, US3, US4.

---

## Notes
- [P] = different files, no incomplete-task dependency. [Story] label maps task → user story.
- Gate everywhere = `collaboraDocument.authorization.Update OR callout.authorization.Update`.
- No backend/schema change; the only data change is the client query selection (T002) + codegen (T003).
- The space-feed **card** title is a separate field (callout framing name) — deliberately not updated by rename (C2).
