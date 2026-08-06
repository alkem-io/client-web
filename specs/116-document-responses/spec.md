# Feature Specification: Documents as Post Responses

**Feature Branch**: `story/10083-documents-as-contributions`
**Created**: 2026-08-06
**Status**: Draft
**Input**: GitHub issue [client-web#10083](https://github.com/alkem-io/client-web/issues/10083) "Documents as contributions" — *"As a user, I want to share several documents in one overview. As a product owner, I want to offer users a way to organise their documents. Acceptance criteria: Add documents as a response type. Additional Context: Without diving into the file structure / folder management Epic, this gives users a way to organise their documents already."*

## Context

`CalloutContributionType.COLLABORA_DOCUMENT` already exists server-side end to
end: the `importCollaboraDocument` mutation (`file: Upload!`,
`uploadData: { calloutID, displayName?, sortOrder? }`) creates a
`CalloutContribution` wrapping a `CollaboraDocument`, and a callout's
`allowedTypes` gate already treats it as an ordinary response type,
independent of framing. **No server change is required or in scope.**

Client-web itself is already partway there — a prior "Documents MVP" (#9615)
wired the *read* side of Collabora-document contributions into the shared
contribution-fetch plumbing (`useCalloutContributions`,
`CalloutContributions.graphql`, `CalloutContribution.graphql`) but the
*response-type selection*, *add/upload*, and *card-rendering* surfaces were
never finished — `ResponseType` explicitly excludes `'document'` (see the
FR-015/FR-016 comment in `src/crd/forms/callout/types.ts`, left over from a
sibling story that deliberately scoped documents to **framing only** in its
first iteration), and every switch that dispatches on contribution type
(`ContributionsPreviewConnector`, `ContributionGridConnector`,
`CalloutDetailDialogConnector`) has no case for `COLLABORA_DOCUMENT` — it
silently renders nothing. This story is that story's explicitly-deferred
follow-up, completing the write/render sides so Documents becomes a normal,
fifth response type alongside Links & Files, Posts, Memos, and Whiteboards.

A separate, unrelated in-flight story (`client-web#9872`, workspace-adjacent,
not a dependency) improves the **framing** document preview's visual richness
(type-differentiated icon color) — it explicitly calls out the *contribution*
card gap this story closes as out of its own scope. The two stories touch
different files with the exception of shared read-only type-mapping helpers;
no coordination is required.

## Clarifications

### Session 2026-08-06 (iteration 1)

- **Q (Scope / Interaction): Does adding a Document response support both a "Create new blank document" path and an "Upload" path (mirroring the framing picker's two paths), or upload-only?**
  **A:** **Upload-only.** The server's `importCollaboraDocument` mutation signature is `(file: Upload!, uploadData: ImportCollaboraDocumentInput!)` — `file` is non-optional, and there is no sibling mutation that creates a blank `CollaboraDocument` contribution. Unlike callout framing (which has a dedicated blank-create branch on `createCalloutOnCalloutsSet`), the contribution side of the API only supports importing an existing file. Offering a "Create new" option in the client would have no mutation to call.
  **Rationale:** Verified directly against the generated GraphQL schema (`MutationImportCollaboraDocumentArgs`, `ImportCollaboraDocumentInput`) rather than inferred — there is no reasonable client-side workaround that doesn't invent server behavior. This is a hard constraint, not a product preference.

- **Q (UX / Scope): Does the "Add document" flow surface an explicit display-name/title input, or does it rely entirely on the server's filename-derived name (with rename available afterward)?**
  **A:** **No dedicated title input at add-time; filename-derived name, rename available afterward.** `ImportCollaboraDocumentInput.displayName` is optional and, per its own schema description, "derived from the uploaded filename (extension stripped)" when omitted. The add-document dialog is upload-only (see above), so unlike a Post/Memo/Whiteboard response — which need a name because they start **blank** — a Document response already carries a natural name (its filename). The existing rename affordance (`useRenameCollaboraDocument` / `canRenameCollaboraDocument`, already used by the framing document editor) is reused, giving authors a correction path without adding a second, largely-redundant naming step to the add flow.
  **Rationale:** Matches the "no folder/hierarchy, keep it simple" instruction in the story's own Additional Context; avoids a create-time field whose only job would be to duplicate what the filename already provides, while still leaving a rename escape hatch (parity with FR-019 in the sibling framing spec, which requires renaming to behave identically regardless of a document's origin).

- **Q (Visual / Scope): What does a Document response card look like in the contributions grid, given there is no server-side document-preview/thumbnail mechanism (confirmed absent — no `VisualType` equivalent to `WHITEBOARD_PREVIEW` exists for `CollaboraDocument`)?**
  **A:** **A type-differentiated icon card** (Word/Sheet/Slide icon + title + author), structurally mirroring the existing `ContributionWhiteboardCard` (fixed-height box, centered fallback, hover-to-open overlay, title/author gradient footer) but using the icon fallback branch only — there is no image branch, since no preview URL exists anywhere in the schema for this entity. The three icons reuse the same `lucide-react` icons (`FileText`/`Sheet`/`Presentation`) and the existing `toCollaboraPreviewType` mapping already used by the framing preview and editor overlay, so the type→icon association stays visually consistent across every surface that shows a Collabora document, without depending on or duplicating the separate, not-yet-merged accent-color work in `client-web#9872`.
  **Rationale:** Keeps this story's card self-contained and mergeable independently of `#9872`'s outcome; reuses an existing, already-tested type-mapping helper rather than inventing a new one; satisfies the story's "organise their documents" ask (visually distinguishing Doc/Sheet/Slide at a glance) without speculative color decisions that belong to the other story's own clarification record.

No further ambiguities surfaced in a second review pass (iteration 2) — the remaining implementation choices (reusing the existing generic `useDeleteContributionMutation`, opening the editor directly on click the way Whiteboard responses already do, reusing `DocumentImportZone` / `validateCollaboraImportFile` / the existing `documentImportError*` i18n keys) all have a single, precedent-backed answer already established elsewhere in this codebase, with no second reasonable interpretation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Author enables Documents as the response type for a post (Priority: P1)

A space member with permission to create posts opens the post-creation
dialog. In the Responses section, they can now pick **Documents** alongside
Links & Files, Posts, Memos, and Whiteboards as the single response type
members may add to this post — closing the literal acceptance criterion
("Add documents as a response type").

**Why this priority**: This is the story's explicit, sole stated acceptance
criterion. Without it, none of the other scenarios are reachable.

**Independent Test**: Open post creation, scroll to Responses, verify a
"Documents" chip is selectable (not a disabled/"coming soon" placeholder),
select it, and submit. Verify the created post's response type is Documents.

**Acceptance Scenarios**:

1. **Given** a space member creating a post, **When** they open the Responses section, **Then** they see a "Documents" chip alongside Links & Files, Posts, Memos, and Whiteboards, selectable exactly like the others (not disabled).
2. **Given** the member selects the Documents chip, **When** they configure the actor switches (who can add documents) and submit, **Then** the post is created with `allowedTypes: [COLLABORA_DOCUMENT]` and the Responses section shows "Documents" as the locked, active type on subsequent edits (existing read-only-after-creation behavior, unchanged for this new type).
3. **Given** an existing post whose response type is already Documents, **When** any member opens its edit dialog, **Then** the Documents chip shows as the active, locked selection (consistent with how Post/Memo/Whiteboard/Link already behave once set).

---

### User Story 2 - Member adds a document response by uploading a file (Priority: P1)

A space member with permission to contribute to a Documents-type post uploads
an existing `.docx`, `.xlsx`, or `.pptx` file from their machine. The system
validates it client-side before any network call, uploads it, and it appears
as a new response card in the post's contributions grid — giving the member
a way to share and collect several documents in one place (the story's core
"share several documents in one overview" ask).

**Why this priority**: This is the actual value delivery — without it,
enabling the response type (US1) has nothing to add. Upload is the *only*
creation path (see Clarifications), so this single scenario carries the
full "add a document" capability.

**Independent Test**: Open a Documents-type post's contributions area, click
"Add document," drag a `.docx` onto the upload zone (or click to pick one),
confirm. Verify a new document card appears in the grid with the file's
name and the uploading member as author, with no page reload.

**Acceptance Scenarios**:

1. **Given** a Documents-type post and a member with contribute permission, **When** they open the "Add document" affordance, **Then** they see a drag-and-drop / click-to-upload zone with helper text naming the accepted formats (`.docx`, `.xlsx`, `.pptx`) and the size cap, matching the existing framing-upload helper text pattern.
2. **Given** the upload zone is visible, **When** the member selects or drops a supported file, **Then** the dialog reflects the staged file (name, size) with a remove affordance before submission.
3. **Given** a staged file, **When** the member confirms, **Then** the file uploads, a new document contribution is created (server-derived display name from the filename), the contributions grid refreshes to include it, and the add dialog closes.
4. **Given** the upload is in progress, **When** the member looks at the dialog, **Then** a busy/disabled state prevents a second submission until the operation resolves.
5. **Given** the add affordance is reachable both from the feed-level post-card preview and from the full post/callout detail dialog, **When** a member uses either entry point, **Then** both create the response identically and both grids refresh to show it (parity with how Whiteboard/Memo/Post responses already work from both surfaces).

---

### User Story 3 - Documents are blocked client-side before any network call for unsupported files or oversize (Priority: P1)

A member attempts to upload a file the system does not accept (wrong
extension) or one that exceeds the size cap. The system rejects the attempt
up front with an inline, human-readable message, preserves the dialog state,
and makes no network request — reusing the exact validation and messaging
already proven by the framing document-upload flow.

**Why this priority**: Prevents wasted uploads and confusing raw-error
states; directly reuses existing, already-tested validation code, so the
implementation risk is low but the UX guarantee (no silent failure, no
half-uploaded state) is a hard requirement, not a nice-to-have.

**Independent Test**: Attempt to upload a `.pdf` and, separately, a
`.docx` above the size cap. Verify both are rejected client-side with a
message naming the supported formats / the cap, no network request fires,
and the dialog stays open with the rest of its state intact (there is no
other state to preserve here, since the flow has no other fields — see
Clarifications).

**Acceptance Scenarios**:

1. **Given** the "Add document" dialog, **When** the file picker is shown, **Then** its `accept` hint is constrained to `.docx`, `.xlsx`, `.pptx` — the same canonical P1 list the framing-upload flow uses.
2. **Given** an unsupported file is staged anyway (e.g. via drag-and-drop bypassing the accept hint), **When** the member confirms, **Then** the system rejects it client-side with an inline message naming the supported formats, and makes no network request.
3. **Given** a file larger than the cap is staged, **When** the member confirms, **Then** the system rejects it client-side with a message stating the cap, and makes no network request.
4. **Given** the server independently rejects a file that passed client-side checks (content-sniff mismatch, e.g. a `.docx`-renamed non-Word file), **When** the mutation returns its structured error, **Then** the same inline, human-readable message is shown (not a raw error code), and the dialog stays open for retry.

---

### User Story 4 - Member opens, renames, and deletes a document response like any other response (Priority: P2)

Once a document response exists, a member with the appropriate privileges
can open it (into the same Collabora editor already used for framing
documents), rename it, and delete it — with no second-class behavior
relative to Link/Post/Memo/Whiteboard responses.

**Why this priority**: Forcing function for parity and for closing the loop
on "organise their documents" (rename is the organisation tool available in
this iteration, per the story's explicit "without diving into the file
structure / folder management Epic" scope boundary) — but strictly lower
priority than being able to add one at all (US2).

**Independent Test**: Add a document response, click its card to open the
editor, rename it via the existing rename control, close, and delete it via
the existing delete-confirmation flow. Verify the grid reflects the new name
and, after deletion, the card is gone with no orphaned state.

**Acceptance Scenarios**:

1. **Given** a document response card in the contributions grid, **When** a member clicks it, **Then** the same fullscreen Collabora editor used for framing documents opens directly (no intermediate preview step), consistent with how clicking a Whiteboard response already opens its editor directly.
2. **Given** the editor is open and the member holds update rights (on the document or the callout), **When** they use the rename control, **Then** the new name persists and is reflected in the grid card after closing.
3. **Given** a member with delete rights, **When** they choose to delete the document response, **Then** the existing confirm-before-delete dialog (Golden Rule #9 in this repo's design system) appears, and only on confirmation is the underlying contribution — and its Collabora document — removed, with the grid refreshing to reflect the removal.
4. **Given** a member without update/delete rights, **When** they view a document response, **Then** they can open and read it but see no rename or delete affordance (parity with existing per-contribution privilege gating for other response types).

---

### Edge Cases

- **Response type already fixed to something else.** Documents cannot be added to a post whose response type is Link/Post/Memo/Whiteboard — the response-type strip is single-select and locked after creation (existing behavior, unchanged; Documents is simply a fifth mutually-exclusive option).
- **A `.docx`-named file whose bytes are not Word.** Extension passes the client pre-check; upload proceeds; the server's content sniff rejects it; the same inline "unsupported format" message renders (US3, Scenario 4); no orphan contribution is created (server contract is atomic, matching the framing-upload guarantee).
- **Multiple files dropped at once / a folder dropped onto the zone.** Rejected client-side with the existing "single file" / "not a file" messages (reusing `validateCollaboraImportFile`'s existing `multiple-files` / `folder` error kinds) — no network request.
- **File exactly at the size cap.** Accepted; only files strictly larger than the cap are rejected (matches the framing-upload boundary behavior).
- **Network interruption mid-upload.** The dialog reverts its busy state, surfaces a retryable inline error, and leaves no orphan contribution (server is atomic); the member retries from the same dialog.
- **Document service temporarily unavailable.** Server returns a service-unavailable error; the client shows a non-technical message and does not auto-retry (reusing the exact same handling the framing-upload flow already has for this case).
- **Two members add documents to the same post concurrently.** Each upload is an independent mutation; both contributions appear once their respective grids refetch — no client-side locking is needed (ordinary multi-writer contribution behavior, same as concurrent Whiteboard/Memo additions today).
- **A document response is opened from the feed-level post-card preview vs. the full detail dialog.** Both entry points must resolve to the identical editor overlay and identical add flow (US2 Scenario 5) — no divergent behavior between the two surfaces, matching the existing parity requirement already enforced for Whiteboard/Memo/Post responses.
- **Author has zero document responses yet.** The contributions section still renders its header ("Contributions (0)") and the add affordance when the viewer can contribute — matching the existing empty-state behavior for every other response type (visibility is driven by the presence of `allowedTypes`, not by whether any contributions exist yet).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Responses section's type picker MUST offer "Documents" as a fifth selectable response-type option, alongside Links & Files, Posts, Memos, and Whiteboards, on equal footing (not disabled, not a "coming soon" placeholder).
- **FR-002**: Selecting "Documents" and submitting post creation MUST result in a post whose `settings.contribution.allowedTypes` is `[COLLABORA_DOCUMENT]`, using the same actor-switch (Members/Admins) and enablement mechanism already used by every other response type.
- **FR-003**: Once a post's response type is Documents, it MUST be shown as the locked/active selection on every subsequent edit-dialog open, consistent with the existing read-only-after-creation rule for response type.
- **FR-004**: The system MUST offer exactly one creation path for a document response — file upload. No "create a blank document" path is offered for responses (see Clarifications; the server exposes no such mutation for contributions).
- **FR-005**: The "Add document" upload zone MUST present a native file picker with its `accept` hint constrained to `.docx`, `.xlsx`, `.pptx`, and MUST display the same size-cap and accepted-format helper text already used by the framing document-upload flow, reusing the existing canonical format/size source (`collaboraImportFormats.ts`) rather than a duplicate constant.
- **FR-006**: The system MUST run the existing client-side pre-checks (`validateCollaboraImportFile`: exactly one file, extension ∈ `.docx`/`.xlsx`/`.pptx`, size within cap) BEFORE any network request. Any pre-check failure MUST render the existing inline error messaging and produce no network request.
- **FR-007**: On a supported, in-cap file, the system MUST call the `importCollaboraDocument` mutation with the callout's id and the staged file, and MUST NOT send an explicit `displayName` (the server derives it from the filename — see Clarifications).
- **FR-008**: While the upload/mutation is in flight, the "Add document" control MUST show a busy state and MUST prevent a second concurrent submission.
- **FR-009**: On success, the contributions grid (in both the feed-level post-card preview and the full post/callout detail dialog) MUST refresh to include the new document response, and the add dialog MUST close.
- **FR-010**: On a server-side rejection (unsupported content, oversize, service unavailable, or any other error), the add dialog MUST stay open, MUST render a human-readable inline message (reusing the existing `documentImportError*` message mapping used by the framing-upload flow) rather than a raw error code, and MUST NOT leave an orphaned contribution.
- **FR-011**: A document response card in the contributions grid MUST display a type-differentiated icon (Word/Sheet/Slide, via the existing `toCollaboraPreviewType` mapping), the document's title, and its author — structurally consistent with the existing Whiteboard response card (fixed-geometry box, hover-to-open affordance, title/author footer).
- **FR-012**: Clicking a document response card MUST open the same Collabora editor overlay already used for framing documents, directly (no intermediate preview step), consistent with how a Whiteboard response card already opens its editor directly on click.
- **FR-013**: Renaming a document response (from inside its editor overlay) MUST be governed by the same rename-permission rule already used for framing documents (`canRenameCollaboraDocument`: update rights on the document OR the callout), and the renamed value MUST be reflected in the contributions grid after the editor closes.
- **FR-014**: Deleting a document response MUST go through the existing destructive-action confirmation dialog before the delete mutation fires (design-system Golden Rule #9 — no exceptions), MUST reuse the existing generic contribution-delete mutation, and MUST refresh the contributions grid on completion.
- **FR-015**: A member without update/delete privileges on a given document response MUST be able to open and read it but MUST NOT see rename or delete affordances, matching the existing per-contribution privilege gating pattern used by other response types.
- **FR-016**: The add-document affordance and the resulting grid MUST behave identically whether reached from the feed-level post-card preview or from the full post/callout detail dialog — no divergence between the two entry points.
- **FR-017**: This delivery MUST require zero server-side (`server` repo) changes — it consumes only the already-shipped, already-schema-stable `importCollaboraDocument` mutation and the already-shipped contribution-read plumbing.
- **FR-018**: Any new user-visible string introduced by this feature MUST be added to the `crd-space` i18n namespace with full key parity across all six supported languages (en, nl, es, bg, de, fr); wherever an equivalent string already exists (e.g. the `documentImportError*` messages, `callout.addDocument`, `contributionSettings.types.document`), it MUST be reused rather than duplicated.

### Key Entities

- **Document Response**: A `CalloutContribution` whose `collaboraDocument` field is populated, belonging to a post whose `settings.contribution.allowedTypes` is `[COLLABORA_DOCUMENT]`. Distinct from a **Document Framing** (the pre-existing, out-of-scope-for-this-story concept where the post itself, not a response, is a Collabora document) — the two are independent uses of the same underlying `CollaboraDocument`/`CollaboraDocumentType` entities.
- **Supported Upload Format**: One of `.docx`, `.xlsx`, `.pptx` — the single canonical list (`collaboraImportFormats.ts`) shared with the framing-upload flow; unchanged by this story.
- **Upload Size Cap**: The existing 15 MB cap defined in `collaboraImportFormats.ts`; unchanged by this story, reused as-is.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of posts with a permitted author can select "Documents" as their response type through the same UI mechanism used for the other four response types — zero remaining disabled/placeholder state for this option.
- **SC-002**: A member with contribute permission can add a supported document as a response — from opening the add affordance to seeing it in the grid — in under 10 seconds for a small file (a few hundred KB) on a typical connection, matching the framing-upload flow's equivalent benchmark.
- **SC-003**: 100% of attempts to upload an unsupported-format or oversized file are rejected client-side with a human-readable message and zero network requests; the remaining server-side content-mismatch case also surfaces a human-readable message, never a raw error code.
- **SC-004**: 100% of document responses are opened, renamed, and deleted through the exact same mechanisms (editor overlay, rename control, confirm-before-delete dialog) already proven for other response types — zero divergent/parallel implementations.
- **SC-005**: Zero server-side (`server` repo) changes are required to ship this feature, verified by the PR diff being scoped entirely to `client-web`.
- **SC-006**: `pnpm lint` and `pnpm vitest run` pass clean, with new/updated unit coverage on the new mapping/rendering branches (contribution-card data mapping, grid dispatch, response-type mapping) and the new add-document connector's validation/error paths.

## Assumptions

- **A-001**: No backend/schema work is authorized or attempted. `client-web` is the sole target repo; the `importCollaboraDocument` mutation, `CalloutContribution.collaboraDocument`, and the `allowedTypes` entitlement gate are already shipped and stable (confirmed against the generated GraphQL schema).
- **A-002**: The existing "Documents MVP" (#9615) read-side plumbing (`useCalloutContributions`, `CalloutContributions.graphql`'s `includeCollaboraDocument` variable, `CalloutContribution.graphql`'s equivalent) is reused as-is; this story fills in the write (add) and render (card + dispatch) gaps left open around it, and does not re-architect the fetch layer.
- **A-003**: "Documents as a response type" does not include any file-structure/folder/hierarchy concept (explicit story scope boundary) — a document response is a single flat file per contribution, exactly like every other response type today; "organising" documents in this iteration means being able to collect several of them under one post and tell them apart at a glance (FR-011) and rename them (FR-013), not folder/tag/hierarchy management.
- **A-004**: The "Set Default Response" mechanism (used by Post/Memo/Whiteboard to pre-fill a template body) does not apply to Documents, since there is no blank-create path and therefore nothing to template — Documents joins Links & Files in having no defaults panel entry.
- **A-005**: No pre-populate-at-creation mechanism (the way Links & Files can seed rows at post-creation time) is offered for Documents in this iteration — documents are added one at a time, after the post exists, via the same add flow used everywhere else in the grid. Nothing in the story's acceptance criteria calls for creation-time seeding, and adding it would be speculative scope.
- **A-006**: Visual/UX parity target is the existing **Whiteboard** response (fixed-geometry card, click-opens-editor-directly, confirm-before-delete) rather than Post/Memo (which use an inline read-only preview step before editing) — because, like a whiteboard, a document response's "content" only make sense inside its dedicated collaborative editor, not as an inline text/markdown preview.
- **A-007**: All server-side error codes the add-document flow needs to handle (`FORMAT_NOT_SUPPORTED`, `STORAGE_UPLOAD_FAILED`, `STORAGE_SERVICE_UNAVAILABLE`) are assumed identical to the ones the framing-upload flow already handles, since both mutations upload through the same underlying file-service-go pipeline per the schema's own mutation description ("file-service-go sniffs the MIME from content and rejects formats Collabora cannot edit").
