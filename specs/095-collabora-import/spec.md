# Feature Specification: Document Framing on a Post — Create New or Upload

**Feature Branch**: `095-collabora-import`
**Created**: 2026-05-04
**Status**: Draft
**Input**: GitHub issue [#9629](https://github.com/alkem-io/client-web/issues/9629). Wire up the FE for the **Document** option in the "Add to post" framing picker. The server-side contract is finalised on the alkem-io/server branch `095-collabora-import` and consists of (a) one new optional `file: Upload` argument on the existing `createCalloutOnCalloutsSet` mutation, and (b) two newly-optional fields (`displayName`, `documentType`) on the framing's Collabora-document input. Two creation paths are surfaced from the same dialog: **Create new** (blank Word Document / Spreadsheet / Presentation) and **Upload** (a `.docx` / `.xlsx` / `.pptx` file up to 15 MB from the author's machine). Documents are scoped to post-level framing only in P1 — they MUST NOT appear in Response Options.

## Clarifications

### Session 2026-05-04

- Q: On the upload path, where should the document's display name come from? → A: **Hybrid (Option C).** When a file is staged and the post title is empty, the post title is auto-prefilled from the uploaded filename (extension stripped). On submit: if the author has typed or edited the post title (the current value differs from the auto-prefilled value), the FE sends `framing.collaboraDocument.displayName = <post title>`; otherwise the FE sends an empty `framing.collaboraDocument: {}` and the server derives the document's display name from the uploaded filename. The visible result is that the post title and the document's name match in both branches; the difference is whether the FE explicitly carries the value or relies on the server's filename-derivation default.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a post with a blank Collabora document as its framing (Priority: P1)

A space member with permission to create posts opens the post-creation dialog and selects **Document** as the post's "Add to post" framing type. Inside the dialog they see three blank-create cards — Word Document, Spreadsheet, Presentation — and pick one. They submit. The post is created with that blank Collabora document as its framing, the dialog closes, the view scrolls to the new post, and the document opens in the Collabora editor so they can begin filling it in.

**Why this priority**: Blank-create is the foundational case. Without it, the only way to put a document on a post is by upload, and authors without an existing file have nowhere to start. It is also the most common authoring path for new content.

**Independent Test**: Open post creation, pick Document framing, click one of the three blank-create cards, submit. Verify the post exists with that document as its framing, the dialog closes, the view scrolls/navigates to the new post, and the editor opens with an empty document of the chosen type.

**Acceptance Scenarios**:

1. **Given** a space member with permission to create posts in a space whose license includes the office-documents entitlement, **When** they open the post-creation dialog and pick **Document** in "Add to post", **Then** they see — inside the same dialog — three blank-create cards labeled Word Document, Spreadsheet, Presentation, and an alternative "or upload" zone next to them.
2. **Given** the Document framing is selected and a blank-create card is highlighted, **When** the member submits the post, **Then** the post is created with a blank Collabora document of the chosen type as its framing, the dialog closes, the view navigates to the new post, and the editor opens.
3. **Given** the post has been created and the editor is open, **When** the member returns later, **Then** the document is still the post's framing and edits made earlier persist.

---

### User Story 2 - Create a post by uploading an existing document (Priority: P1)

A space member has an existing `.docx`, `.xlsx`, or `.pptx` file on their machine that they want to publish as a post. They open the post-creation dialog, pick **Document** as the framing, drag the file into the upload zone (or click to pick it), enter a post title, and submit. The system validates the file (extension, size, single file) before any network call, uploads the file, creates the post with the uploaded document as its framing, closes the dialog, navigates to the new post, and opens the editor.

**Why this priority**: Upload is the headline new capability of this iteration. Without it, members must recreate work from scratch or paste it in piece by piece. Adoption by teams who already have document libraries depends on this path.

**Independent Test**: Open post creation, pick Document framing, drag a `.docx` (or `.xlsx` / `.pptx`) onto the upload zone, enter a title, submit. Verify the post is created with that file's content as its framing document, the dialog closes, the view navigates to the new post, and the editor opens with the file's content loaded and editable.

**Acceptance Scenarios**:

1. **Given** the post-creation dialog with Document framing selected, **When** the member is shown the dialog, **Then** they see the three blank-create cards **and** a clearly-separated upload zone (drag-and-drop area with a click-to-upload affordance) inside the same dialog, with helper text naming the accepted formats and the size cap (e.g., "Drag & drop a file, or click to upload — .docx, .xlsx, .pptx up to 15 MB").
2. **Given** the upload zone is visible, **When** the member selects a supported file, **Then** the dialog reflects the chosen file (filename, size) and the blank-create cards become inactive while a file is staged for upload. If the post title is currently empty, the system MUST auto-prefill it from the uploaded filename with the extension stripped.
3. **Given** a supported file is staged and the member submits the post, **When** the upload is in progress, **Then** the dialog shows a busy/progress indicator and prevents a second submission until the operation resolves.
4. **Given** the upload succeeds, **When** the post is created, **Then** the dialog closes, the view navigates to the new post, and the editor opens with the uploaded document's content. The document's display name on the upload path is sourced as follows: if the author has typed or edited the post title since the file was staged (so the current title differs from the auto-prefilled filename-derived value), the FE sends the post title as the document's display name; otherwise the FE sends no display name and the server derives it from the uploaded filename. Either way, the post and the document end up sharing the same visible name.
5. **Given** a member has staged a file but then changes their mind and clicks one of the blank-create cards, **When** they do so, **Then** the staged file is cleared and the form switches to the blank-create flow with no upload occurring. The post title is preserved as-is regardless of whether it was auto-prefilled from the file's name.

---

### User Story 3 - Block unsupported files before any network call (Priority: P1)

A member tries to use the upload path with a file the system does not accept in P1 — anything other than `.docx`, `.xlsx`, or `.pptx` (so PDFs, images, ODF formats, legacy `.doc`/`.xls`/`.ppt`, executables renamed `.docx`, etc.). The system rejects the attempt up-front, displays a clear inline message in the dialog, preserves all other input, and never makes a network request.

**Why this priority**: Unsupported uploads are the most likely error path. Failing late after a network call wastes the author's time; failing without preserving the rest of the form is hostile. Both must be avoided.

**Independent Test**: Attempt to upload a `.pdf`, `.doc`, `.odt`, image, or any non-supported file. Verify the file picker filters it out, or — if it slips past the picker (e.g., via drag-and-drop) — the system rejects it client-side, shows an inline error, preserves the rest of the form, and makes no network request.

**Acceptance Scenarios**:

1. **Given** the post-creation dialog is open with Document framing selected, **When** the file picker is shown, **Then** it is constrained — via the picker's accept hint — to `.docx`, `.xlsx`, `.pptx` so the user is steered toward valid choices.
2. **Given** a file with an unsupported extension is staged anyway (drag-and-drop bypasses the accept hint on some operating systems), **When** the form is submitted, **Then** the system rejects it client-side before any network request with an inline message naming the supported formats. The dialog stays open and all other input is preserved.
3. **Given** a `.docx`-named file whose actual content is not Word (extension passes, content does not), **When** the form is submitted and the upload reaches the server, **Then** the server's content sniff rejects it; the client surfaces the same supported-formats message inline; the dialog stays open and all other input is preserved.
4. **Given** any of the above rejections, **When** the rejection is shown, **Then** no post has been created (the server contract is atomic — there are no orphan posts, framings, or storage objects on any failure).

---

### User Story 4 - Block oversized files with the 15 MB cap stated up-front (Priority: P1)

A member tries to upload a file larger than 15 MB. The system rejects the attempt before any network call, names the cap, and does not waste their time on a slow upload that will fail at the end. The dialog stays open with all other input preserved.

**Why this priority**: 15 MB is generous enough for most Office documents but tight enough that members will realistically hit it. Failing late after a long upload is the worst possible UX. Surfacing the cap up-front in the helper text — and validating client-side before any request — keeps the failure cheap and the message actionable.

**Independent Test**: Attempt to upload a `.docx` slightly above 15 MB. Verify the error appears immediately on selection (not after a wait), states the 15 MB cap, leaves the rest of the form intact, and produces no network request.

**Acceptance Scenarios**:

1. **Given** the post-creation dialog with Document framing selected and the upload zone visible, **When** the dialog is rendered, **Then** the helper text near the upload zone displays the 15 MB cap.
2. **Given** a file strictly larger than 15 MB is selected, **When** the form is submitted, **Then** the system rejects it client-side before any network call, shows a message that names the 15 MB cap, leaves all other input intact, and the dialog stays open.
3. **Given** an oversized file is somehow uploaded (cap was raised on the client but the server still rejects), **When** the server returns a too-large error, **Then** the client surfaces a human-readable cap message rather than a raw HTTP code, and the dialog state is preserved for retry.

---

### User Story 5 - Document framing option respects existing license and permission gates (Priority: P1)

The Document framing option appears only to authors who (a) hold the `CREATE_CALLOUT` privilege on the destination calloutsSet and (b) are in a space whose license includes the office-documents entitlement. Authors lacking either gate see the Document option hidden or disabled with the existing "not enabled" tooltip.

**Why this priority**: Both gates already exist for adjacent functionality. Inconsistent gating (e.g., upload visible while blank-create is disabled, or Document option visible to users who can't create callouts) makes the surface look broken and produces server errors users cannot self-recover from.

**Independent Test**: As an author in a space without the office-documents entitlement, open post creation; verify the Document framing option is visibly disabled with the existing tooltip. As an authenticated viewer without `CREATE_CALLOUT`, verify the post-creation dialog is unreachable for that calloutsSet at all (existing behavior). With both gates passed, verify both blank-create and upload are reachable.

**Acceptance Scenarios**:

1. **Given** the author is in a space whose license does not include office documents, **When** they open the post-creation dialog, **Then** the Document framing option is shown disabled with the existing "not enabled" tooltip; neither the blank-create cards nor the upload zone are reachable.
2. **Given** the author lacks `CREATE_CALLOUT` on the destination calloutsSet, **When** they look for the post-creation entry point, **Then** it is hidden (existing behavior — no new code path).
3. **Given** both gates are passed, **When** the author opens the post-creation dialog and picks Document framing, **Then** both blank-create and upload are reachable as described in User Stories 1 and 2.

---

### User Story 6 - Documents do not appear among Response Options (Priority: P1)

When an author configures a post's Response Options (the contribution types members will be able to add as responses to this post), Documents is not among the choices. This iteration deliberately scopes Documents to post-level framing only.

**Why this priority**: A "Documents" tab exists today as a "Coming soon" stub in the design-system path, and as a hardcoded-disabled radio in the production-default path. Leaving either visible while the framing feature ships is confusing — members will click them expecting something to happen. The product scope is "framing only" and the surface must reflect that.

**Independent Test**: Open post creation. In the Responses section, verify Documents is absent (no tab, no radio, no toggle). Verify the four other response types (Links & Files, Posts, Memos, Whiteboards) are unchanged.

**Acceptance Scenarios**:

1. **Given** the post-creation dialog is open in the design-system path, **When** the author scrolls to the Responses section, **Then** there is no "Documents" tab and no "Coming soon" stub.
2. **Given** the post-creation dialog is open in the production-default path, **When** the author views the contribution-type radio group, **Then** there is no "Document" or "Collabora Document" radio button (visible or disabled).
3. **Given** a post is being created with Document framing, **When** the author submits, **Then** the post's settings reflect that no Document contributions are allowed (the response side is closed for documents at the model level too, not just hidden in the UI).

---

### User Story 7 - Posts behave the same regardless of how their document was created (Priority: P2)

Once a post with Document framing exists, it behaves identically whether its document was created blank or uploaded — the editor, rename, presence/save footer, deletion (cascading from the post), and any rendered preview all work the same way.

**Why this priority**: Without parity, the codebase grows two parallel cases for the same end state, and members lose trust in either path. Lower priority than the create flows themselves, but a forcing function on the implementation: there must be no second-class object.

**Independent Test**: Create one post via blank Word Document and another via uploading a `.docx`. Verify both behave identically — open the editor, edit, rename, observe save indicator, delete the post — with no behavior diverging between them.

**Acceptance Scenarios**:

1. **Given** a post created from a blank card and a post created from an upload, **When** a member opens either, **Then** the editor surface, save/presence footer, and rename action behave identically.
2. **Given** an uploaded `.pptx` post, **When** a member renames it, **Then** the new name is reflected both in the post header and inside the editor's title bar, and the underlying file's extension is preserved.
3. **Given** a post with Document framing, **When** the post is deleted, **Then** the underlying Collabora document and its backing file are removed alongside the post — no orphan storage, no manual cleanup needed.

---

### Edge Cases

- **A `.docx`-named file whose bytes are not Word.** Extension passes the client pre-check; the file is uploaded; the server's content sniff rejects it; the dialog surfaces the supported-formats message inline and preserves all other input. Server is atomic — no orphan post is created.
- **PDF.** PDFs are not in the P1 accept list. If a member drops a `.pdf`, the rejection message names what _is_ supported (`.docx`, `.xlsx`, `.pptx`), not just "PDF unsupported".
- **Multiple files dropped at once.** The pre-check enforces "exactly one file" — if two or more files are dropped, the dialog shows a "drop a single file" message inline; nothing is uploaded.
- **Folder dropped onto the upload zone.** Treated as a non-file input — rejected at the pre-check stage with a "drop a single file" message; no traversal occurs.
- **File exactly at 15 MB.** Treated as accepted; only files strictly larger than 15 MB are rejected.
- **Author closes the dialog with a file staged but not submitted.** The staged file is discarded; nothing is uploaded; no post is created.
- **Author switches framing type after staging a file.** Switching to a different framing type (Whiteboard, Memo, etc.) discards the staged file silently; the rest of the form is preserved. The author can pick Document again to start over. A post title that was auto-prefilled from the discarded filename is preserved — the author may clear it manually if they prefer.
- **Author removes a staged file after the post title was auto-prefilled from it.** The post title is preserved as-is. The author may clear it manually before submitting.
- **Author edits the post title to match the auto-prefilled value character-for-character.** The system treats this as "title equal to auto-prefill" and, on submit, sends an empty `framing.collaboraDocument: {}` so the server derives the document's display name from the uploaded filename. The visible result is identical to typing nothing.
- **Author submits with neither a blank-create card picked nor a file staged.** The submit button is disabled (or the form blocks submission inline) with a hint to choose one path or the other; no post is created.
- **Network interruption mid-upload.** The dialog reverts the busy state, surfaces a retry-able error inline, and leaves no orphan post (server is atomic). The author retries from the same dialog with all input preserved.
- **Document service temporarily unavailable.** When the server returns a "service unavailable" error, the dialog shows a non-technical message ("Document service is temporarily unavailable. Please try again in a moment.") and does NOT auto-retry. The author retries manually.
- **Editor cannot open immediately after the post is created.** The post and its document exist; the editor open is retried by clicking the post's normal entry point. The user sees a non-technical "couldn't open the document — please try again" message rather than a broken iframe.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: At post creation, the framing picker ("Add to post") MUST include a **Document** option, positioned between **Memo** and **Call to Action** per the design.
- **FR-002**: When **Document** is selected, the dialog MUST reveal a sub-panel with two creation paths inside the same dialog: a **Create new** row of three cards (Word Document, Spreadsheet, Presentation) and an **Upload** zone (drag-and-drop with a click-to-upload affordance), separated visually by an "or" divider.
- **FR-003**: The **Create new** path MUST result in a post whose framing is a brand-new blank Collabora document of the chosen type. The submission MUST NOT include any uploaded file.
- **FR-004**: The **Upload** path MUST result in a post whose framing is a Collabora document initialized from the bytes of the uploaded file. The submission MUST attach the file to the existing create-callout request without choosing a document type — the type is server-derived from the file's content.
- **FR-004a**: When a file is staged AND the post title field is empty, the system MUST auto-prefill the post title from the uploaded filename with the extension stripped. Auto-prefill MUST NOT overwrite a non-empty post title (whether the author typed it or it was auto-prefilled from a previously-staged-and-since-removed file).
- **FR-004b**: On submission via the upload path, the system MUST decide the document's display-name source by comparing the current post title against the auto-prefilled value: if they differ (i.e., the author has typed or edited the title), the FE MUST send `framing.collaboraDocument.displayName` equal to the post title; otherwise the FE MUST send an empty `framing.collaboraDocument: {}` so the server derives the document's display name from the uploaded filename. Both branches MUST result in the post and the document sharing the same visible name.
- **FR-005**: Picking a Create-new card and staging a file MUST be mutually exclusive. Picking a card clears any staged file; staging a file deselects any card. The submit action MUST be enabled only when exactly one of the two has been chosen.
- **FR-006**: The upload zone MUST present a native file picker with the accept hint constrained to `.docx`, `.xlsx`, `.pptx` (P1 list). The accept hint MUST NOT include PDF, ODF, or legacy Office extensions in P1.
- **FR-007**: The dialog MUST display the 15 MB upload cap and the accepted extensions in helper text near the upload zone, before the author selects a file.
- **FR-008**: The system MUST run client-side pre-checks on a staged file BEFORE any network request: (a) exactly one file is staged, (b) extension is one of `.docx` / `.xlsx` / `.pptx`, (c) size is ≤ 15 MB. Any pre-check failure MUST render an inline error in the dialog, preserve all other input, and produce no network request.
- **FR-009**: While an upload is in progress, the dialog MUST display a busy/progress indicator and MUST prevent a second submission of the same form.
- **FR-010**: When the server rejects a request — whether for unsupported file content, oversize, missing privilege, service unavailability, or any other reason — the dialog MUST stay open, MUST render the error inline near the offending field (or as a dialog-level error when no specific field applies), and MUST preserve all other input. The server contract is atomic, so the FE MUST NOT compensate for partial state on the backend.
- **FR-011**: When the server returns a "service unavailable" error, the dialog MUST surface a non-technical message and MUST NOT auto-retry. The author retries manually by submitting again.
- **FR-012**: On successful creation (blank or upload), the dialog MUST close, the view MUST navigate to (or scroll to) the newly-created post, and the Collabora editor MUST open on the framing document.
- **FR-013**: The Document framing option MUST be hidden or disabled when the destination space's license does not include the office-documents entitlement, consistent with the existing pattern for license-gated framing types. When disabled, the existing "not enabled" tooltip MUST be shown on hover.
- **FR-014**: The Document framing option MUST only be reachable by authors holding `CREATE_CALLOUT` on the destination calloutsSet — the same privilege that gates any other framed callout. (No new permission is introduced.)
- **FR-015**: Documents MUST NOT appear among the post's Response Options at any point in P1. Any pre-existing UI element offering "Documents" or "Collabora Document" as a response/contribution type — a tab, a radio button, a toggle, or a "Coming soon" stub — MUST be hidden, removed, or otherwise unreachable.
- **FR-016**: The post-creation pipeline MUST default the contribution `allowedTypes` so that Document is excluded from response types in P1, consistent with FR-015.
- **FR-017**: Drawing-type Collabora documents (`.odg`, `DRAWING`) MUST NOT be offered for blank-create or accepted for upload in P1, even though the server enum supports `DRAWING`.
- **FR-018**: The system MUST NOT silently convert uploaded files. A `.docx` round-trips as `.docx`, an `.xlsx` as `.xlsx`, etc.
- **FR-019**: A post with a Document framing MUST behave identically across all subsequent operations (open, edit, rename, save indicator, presence, delete) regardless of whether its document was blank-created or uploaded — there is no client-side flag distinguishing the two.
- **FR-020**: Deleting a post whose framing is a Collabora document MUST cascade to remove the underlying document and its backing file. No standalone "delete the document but keep the post" action is exposed in P1.

### Key Entities

- **Document Post**: A callout/post whose framing is a Collabora document. The framing's identity is the Collabora document (display name, document type, content). The post does not accept Documents as responses in P1.
- **Document Type (P1)**: One of three Collabora categories — Word Document, Spreadsheet, Presentation. Drives the blank-create cards and the icon shown next to the post title. Drawing exists in the server enum but is excluded from the P1 picker.
- **Supported Upload Format (P1)**: One of `.docx`, `.xlsx`, `.pptx`. The picker accept hint, the helper-text format list, and the client pre-check share this single canonical list.
- **Upload Size Cap (P1)**: 15 megabytes. Surfaced in the helper text and enforced both client-side (pre-check) and server-side.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An author with both gates passed can complete a blank-create flow — from clicking Document framing to seeing the editor open with an empty document of the chosen type — in under 5 seconds on a typical office connection.
- **SC-002**: An author can complete an upload flow — from clicking Document framing to seeing the editor open with the uploaded document loaded — in under 10 seconds for a small file (a few hundred KB) on a typical office connection.
- **SC-003**: 100% of attempts to upload a file outside the P1 accept list (`.docx` / `.xlsx` / `.pptx`) are rejected — at least client-side for extension/size mismatches (no network request), or server-side for content-mismatched files — and produce a human-readable inline error rather than a raw HTTP code.
- **SC-004**: 100% of files strictly larger than 15 MB are rejected client-side before the upload begins; 100% of equivalent server-side rejections (in the rare case the cap is mis-aligned) surface the cap-stating message rather than a raw HTTP code.
- **SC-005**: 0% of post-creation dialogs in P1 surface Documents as a response option (no tab, no radio, no toggle, in either UI path).
- **SC-006**: Posts created from blank-create vs. upload are functionally interchangeable for every operation an author or member performs after creation — no operation works on one but not the other.
- **SC-007**: When the office-documents entitlement is absent on the destination space's license, 100% of post-creation dialogs in that space show the Document framing option as disabled with the existing tooltip, and 0% allow either creation path to proceed.
- **SC-008**: After any server error during submission, 100% of dialogs preserve every other input the author had entered (title, framing choice, response settings, visibility toggle, etc.) — they never lose work.
- **SC-009**: The server contract is atomic — 0 orphan posts, 0 orphan framing rows, 0 orphan documents, and 0 orphan storage objects are observable in any failure mode (this is delivered by the server; the FE's responsibility is to not compensate as if the backend left partial state behind).

## Assumptions

- **Server contract is finalised on alkem-io/server branch `095-collabora-import`.** The FE binds to it directly: `createCalloutOnCalloutsSet(calloutData, file)` with `file: Upload` optional, and `CreateCollaboraDocumentInput.{displayName, documentType}` newly optional. The schema is additive — no breaking change. This iteration is not blocked on further server work.
- **Document framing already exists for blank-create.** The current implementation wires Document framing into the post-creation dialog with three blank-create cards. This iteration adds the Upload path alongside the existing cards inside the same dialog and aligns the picker positioning to "between Memo and Call to Action".
- **The Collabora editor surface is reused as-is.** The iframe wrapper, WOPI token refresh, and the save/presence footer driven by Collabora's postMessage API already exist (per the prior Documents MVP) and are reused unchanged for posts created via either path.
- **`displayName` defaulting from filename is server-side.** When the upload path is taken and no document `displayName` is provided (or it is empty), the server derives the display name from the uploaded filename (extension stripped). The FE does not need to mirror this logic.
- **Authorization mirrors existing post-creation rules.** `CREATE_CALLOUT` on the destination calloutsSet gates the entire post-creation entry point; no new permission scope is introduced. The office-documents license entitlement gates the Document framing option as a whole (existing pattern).
- **Single-file, single-attempt only.** No batch upload, no multi-file drag-and-drop, no background queueing in P1. One file → one post.
- **Drawing is deferred.** `.odg` / `DRAWING` exists in the server enum but is excluded from both blank-create cards and the upload accept list in P1. Reintroducing it is a follow-up.
- **Legacy Office and ODF formats are deferred.** `.doc`, `.xls`, `.ppt`, `.odt`, `.ods`, `.odp`, `.rtf`, `.csv` are accepted by the server but excluded from the P1 client picker. The narrower client list is a deliberate scoping decision for the design mockup; the broader list is a candidate follow-up.
- **PDF is intentionally not supported.** Consistent with the server side's deliberate exclusion.
- **No "replace existing document" UX in P1.** Once a post's framing document exists, it is edited via the editor or kept as-is; replacing the bytes via another upload is a follow-up ticket.
- **Documents-as-responses are explicitly out of scope.** Beyond hiding the response surface (FR-015 / FR-016), no contribution-type behavior is shipped for Documents in P1. Any partially-built UI for the response variant is hidden or removed in this iteration. The server's existing `importCollaboraDocument` mutation (which produces a `CalloutContribution`) is NOT consumed by the FE in P1.
- **No version-history UX is exposed.** Collabora's internal history is unchanged; the client surfaces no "view previous versions" or similar.
- **Public/guest sharing is out of scope.** Anonymous users see nothing new from this iteration.
- **Translation coverage follows existing scope rules.** New user-facing strings are added in both UI paths, in all languages each path already supports — no new languages are added.
