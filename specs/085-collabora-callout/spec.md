# Feature Specification: Collabora Document Callout Integration

**Feature Branch**: `085-collabora-callout`
**Created**: 2026-04-14
**Status**: Draft
**Input**: User description: "We need to add into client integration with collabora, as yet another callout type. This PR implements it on server https://github.com/alkem-io/server/pull/5970"

## Clarifications

### Session 2026-04-14

- Q: Should the Collabora editor open in a dialog overlay, a full-page route, or inline within the callout? → A: Dialog overlay, same pattern as the whiteboard callout editor.
- Q: Should new Collabora components use MUI (existing callout pattern) or CRD (shadcn/ui + Tailwind)? → A: MUI, following the existing callout component patterns for consistency.
- Q: How should the client handle WOPI access token expiry during long editing sessions? → A: Silent auto-refresh — re-fetch editor URL and reload iframe automatically before TTL expires.

### Session 2026-04-24 (P1 parity gap closure per ticket #9575)

- Q: How should the client surface Collabora's internal save state to the user (ticket AC: "Save often, and show an error or warning to save work")? → A: Listen to Collabora Online's postMessage API (`App_LoadingStatus`, `Doc_ModifiedStatus`, `App_Saved`, `Action_Save_Resp`, `Views_List`, `Error`) and render a footer under the editor matching the `MemoCollabFooter` pattern (save status + presence avatars + readonly reason).
- Q: Should the footer show a "Connected / Disconnected" indicator? → A: No — pulling the network still leaves the iframe reporting "connected", so the chip is misleading. The underlying `connectionStatus` is kept for the readonly-reason branch only.
- Q: Where should the footer live, given the CRD-vs-MUI split? → A: Build it once as a CRD component (`CollaboraCollabFooter`). The CRD framing overlay renders it directly; the MUI framing dialog wraps the same component in a `.crd-root` scope so Tailwind preflight applies. No duplication across design systems.
- Q: How should "Post Title can be OfficeDocs name" be enforced on edit? → A: `UpdateCalloutFramingInput` has no `collaboraDocument` field, so when a user changes the callout title in `EditCalloutDialog`, issue a side `updateCollaboraDocument` mutation after the main save.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Collabora Documents in a Callout (Priority: P1)

A space member navigates to a space and sees a callout of type "Collabora Document". The callout displays a list of collaborative documents (spreadsheets, presentations, text documents) as cards, each showing the document title, type icon, and creation date. The member can browse the documents in the same way they browse whiteboards or posts within other callout types.

**Why this priority**: Users must be able to discover and browse Collabora documents before they can open or create them. This is the foundation for the entire feature and the first thing users encounter.

**Independent Test**: Navigate to a space with a COLLABORA_DOCUMENT callout containing documents. Verify document cards render with title, type-appropriate icon, and metadata.

**Acceptance Scenarios**:

1. **Given** a space with a COLLABORA_DOCUMENT callout containing multiple documents, **When** a member views the callout, **Then** they see a list of document cards showing each document's title, type icon (spreadsheet/presentation/text), and creation date.
2. **Given** a COLLABORA_DOCUMENT callout with no documents yet, **When** a member views it, **Then** they see an empty state indicating no documents have been created.
3. **Given** a user without read access to the space, **When** they attempt to view the callout, **Then** they do not see the callout or its documents.

---

### User Story 2 - Open and Edit a Collabora Document (Priority: P1)

A space member clicks on a document card to open it. The system fetches a Collabora editor URL (which includes a WOPI access token) and displays the Collabora Online editor in an embedded iframe. The member can edit the document in real time. Multiple members can open the same document simultaneously and collaborate in real time through Collabora's built-in collaboration features.

**Why this priority**: Editing is the core value proposition. Without the embedded editor, Collabora documents are just metadata entries with no user value.

**Independent Test**: Click a document card, verify the Collabora editor loads in an iframe, make an edit, and confirm the change persists when reopening.

**Acceptance Scenarios**:

1. **Given** an existing Collabora document in a callout, **When** a member clicks the document card, **Then** a dialog overlay opens (following the whiteboard pattern) with the Collabora editor embedded in an iframe, loaded from the editor URL returned by the `collaboraEditorUrl` query.
2. **Given** two members opening the same document, **When** both make edits simultaneously, **Then** both see each other's changes in real time (handled by Collabora Online).
3. **Given** a member with read-only access, **When** they open a document, **Then** the editor loads in view-only mode (the server returns a read-only editor URL).
4. **Given** the WOPI service is unavailable, **When** a member tries to open a document, **Then** a user-friendly error message is displayed explaining the document editor is temporarily unavailable.
5. **Given** an editor URL with an access token approaching expiry, **When** the TTL is about to expire, **Then** the client silently re-fetches a new editor URL and reloads the iframe without user intervention.

---

### User Story 3 - Create a New Collabora Document (Priority: P1)

A space member with contribute permissions clicks a "Create" button on a COLLABORA_DOCUMENT callout. A dialog appears where they enter a document title and select the document type (spreadsheet, presentation, or text document). Upon submission, the system creates the document contribution via the existing `createContributionOnCallout` mutation and opens the newly created document in the Collabora editor.

**Why this priority**: Without creation, no documents exist to view or edit. This completes the core create-and-edit flow.

**Independent Test**: Click the create button, fill in title and type, submit. Verify the new document appears in the callout and the editor opens.

**Acceptance Scenarios**:

1. **Given** a COLLABORA_DOCUMENT callout, **When** a member with contribute permission clicks "Create", **Then** a dialog appears with fields for document title and document type (spreadsheet, presentation, text document).
2. **Given** the creation dialog is open, **When** the member fills in the title, selects a type, and submits, **Then** the system creates the document via `createContributionOnCallout` with `type: COLLABORA_DOCUMENT` and immediately opens the Collabora editor for the new document.
3. **Given** a member without contribute permission, **When** they view the callout, **Then** no "Create" button is visible.
4. **Given** the member submits the creation form, **When** the server returns an error (e.g., service unavailable), **Then** a user-friendly error message is displayed and no partial state is left behind.

---

### User Story 4 - Delete a Collabora Document (Priority: P2)

A space member with appropriate permissions can delete a Collabora document from a callout. A confirmation dialog is shown before deletion. After deletion, the document is removed from the callout's document list.

**Why this priority**: Document lifecycle management requires deletion, but it is secondary to the create-view-edit workflow.

**Independent Test**: Select a document, trigger delete, confirm. Verify the document is removed from the callout.

**Acceptance Scenarios**:

1. **Given** a Collabora document in a callout, **When** a member with delete permission triggers deletion, **Then** a confirmation dialog appears before the document is removed.
2. **Given** the confirmation dialog, **When** the member confirms, **Then** the document is deleted via the `deleteCollaboraDocument` mutation and removed from the callout's document list.
3. **Given** a member without delete permission, **When** they view a document, **Then** no delete option is available.

---

### User Story 5 - Rename a Collabora Document (Priority: P3)

A space member with write permissions can rename a Collabora document. The rename action is accessible from the document card or from within the document editor view. The updated name is reflected immediately in the callout.

**Why this priority**: Nice-to-have for document management. Lower priority than the core create/view/edit/delete flow.

**Independent Test**: Trigger rename on a document, enter a new title, confirm. Verify the new title appears in the callout.

**Acceptance Scenarios**:

1. **Given** a Collabora document, **When** a member with write permission renames it via the `updateCollaboraDocument` mutation, **Then** the new title is reflected in the document card within the callout.

---

### User Story 7 - Parity with Multi-User Memo / Whiteboard (Priority: P1)

A space member opens a Collabora document and sees a status footer identical in role to the memo/whiteboard footer: their own save state (`Saved` / `Saving…` / `Unsaved changes` / `Error saving`), avatars of other connected editors, and — if they lack edit rights — a readonly reason. Saved changes are reflected within a few seconds; network loss or an unexpected Collabora error surfaces as a toast. If the member renames the callout via the standard edit dialog, the Collabora document's name follows automatically so the post title and document name stay in sync. The document type icon appears next to the title in the editor dialog header, matching the visual pattern of other collaborative content types.

**Why this priority**: Ticket #9575 requires that "business logic will match the logic for multi-user memos and multi-user whiteboards" and "Save often, show an error or warning to save work, if not in sync or not saving". Without these, users have no feedback on whether their work is persisted, and the callout title can silently drift from the document name.

**Independent Test**: Open a Collabora document; make an edit; observe `Saving…` → `Saved` transition. Open the same document in a second browser; observe both users' avatars in the footer. Rename the callout via the edit dialog; observe the document name updating in the Collabora header on next open.

**Acceptance Scenarios**:

1. **Given** the Collabora editor is open, **When** the user types, **Then** the footer shows `Unsaved changes` and transitions to `Saved` after the iframe's autosave completes (driven by `Doc_ModifiedStatus: false` / `Action_Save_Resp: { success: true }` / `App_Saved`).
2. **Given** two users have the same document open, **When** the second user joins, **Then** both users see the other's avatar in the footer (sourced from Collabora's `Views_List` postMessage).
3. **Given** the user is not authenticated, **When** the editor loads, **Then** the footer shows the `"Sign in to edit this document"` readonly reason.
4. **Given** the callout framing is a Collabora document, **When** an authorized user renames it via `EditCalloutDialog`, **Then** the app issues a separate `updateCollaboraDocument` mutation after the main framing update so the document name matches the new callout title.
5. **Given** Collabora emits an `Error` or `Session_Closed` postMessage, **When** it reaches the client, **Then** a toast is shown (`Collabora error: {message}` / `The collaboration session was closed`) using the app's `useNotification` hook.
6. **Given** the Collabora editor dialog is open (either via CRD or MUI), **When** the header is rendered, **Then** the document type icon (text / spreadsheet / presentation) appears next to the callout title.

---

### User Story 6 - Create a COLLABORA_DOCUMENT Callout (Priority: P2)

A space admin creates a new callout and selects "Collabora Document" as the callout type. This creates a callout that accepts collaborative document contributions. The callout creation flow follows the same pattern as existing callout types (Post, Whiteboard, Link, Memo).

**Why this priority**: Spaces need at least one COLLABORA_DOCUMENT callout before users can add documents. This is typically done once during space setup.

**Independent Test**: Create a new callout with type COLLABORA_DOCUMENT. Verify it appears in the space and accepts document contributions.

**Acceptance Scenarios**:

1. **Given** the callout creation dialog, **When** an admin selects "Collabora Document" as the contribution type, **Then** the callout is created and appears in the space with the appropriate icon.
2. **Given** a newly created COLLABORA_DOCUMENT callout, **When** a member views it, **Then** it shows an empty state and a "Create" button (if they have contribute permissions).

---

### Edge Cases

- What happens when the Collabora server is down? The editor URL is still generated by the server, but the iframe fails to load. The client should detect iframe load failure and show a user-friendly error.
- What happens when the WOPI service is unavailable? The `collaboraEditorUrl` query returns an error. The client should show a descriptive error message rather than a blank or broken dialog.
- What happens if a user opens a document that was deleted by another user? The `collaboraEditorUrl` query returns a "not found" error. The client should close the dialog and notify the user.
- What happens when the access token TTL expires during a long editing session? The client monitors the `accessTokenTTL` and silently re-fetches a new editor URL, reloading the iframe automatically before expiry. Collabora autosaves continuously, so no data is lost during the reload.
- What happens on mobile or small screens? The Collabora editor iframe should be responsive. If Collabora Online doesn't support the screen size, a message should inform the user to use a larger screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The client MUST support `COLLABORA_DOCUMENT` as a new callout contribution type alongside existing types (Post, Whiteboard, Link, Memo).
- **FR-002**: The client MUST render Collabora document contributions as cards within a callout, displaying the document title, type-specific icon, and creation date.
- **FR-003**: The client MUST provide an "open" action on document cards that fetches the editor URL via the `collaboraEditorUrl` query and loads the Collabora Online editor in an embedded iframe.
- **FR-004**: The client MUST provide a creation dialog for new Collabora documents with fields for title and document type (spreadsheet, presentation, text document).
- **FR-005**: The client MUST use the existing `createContributionOnCallout` mutation with the new `collaboraDocument` input field to create documents.
- **FR-006**: The client MUST provide a delete action for Collabora documents, including a confirmation dialog, using the `deleteCollaboraDocument` mutation.
- **FR-007**: The client MUST provide a rename action for Collabora documents using the `updateCollaboraDocument` mutation.
- **FR-008**: The client MUST include `COLLABORA_DOCUMENT` in the callout creation flow, allowing admins to create callouts that accept collaborative document contributions.
- **FR-009**: The client MUST respect authorization — hide create/edit/delete actions when the user lacks the corresponding permissions.
- **FR-010**: The client MUST handle error states gracefully — display user-friendly messages when the WOPI service is unavailable, the document is not found, or the Collabora editor fails to load.
- **FR-011**: The client MUST support all three document types with appropriate visual differentiation: spreadsheet (table/grid icon), presentation (slides icon), text document (document icon).
- **FR-012**: The client MUST use the `accessTokenTTL` from the editor URL response to schedule a silent auto-refresh — re-fetching the editor URL and reloading the iframe before the token expires, without user intervention.
- **FR-013**: The client MUST expose save, presence, and readonly state under the editor via a footer (`CollaboraCollabFooter`) driven by Collabora Online's postMessage API. Save status derives from `Doc_ModifiedStatus` / `Action_Save_Resp` / `App_Saved`; presence from `Views_List`; runtime errors from `Error` / `Session_Closed`. Network transport status is intentionally not displayed (Collabora does not surface it reliably to the host).
- **FR-014**: The client MUST render the footer component as a single CRD component usable from both the CRD framing overlay (`src/main/crdPages/…`) and the MUI framing dialog (wrapped in a `.crd-root` scope). No MUI duplicate of the footer is introduced.
- **FR-015**: When the user renames a callout whose framing is a Collabora document (via `EditCalloutDialog`), the client MUST issue a `updateCollaboraDocument` mutation after the main `updateCalloutContent` call to keep the document `displayName` equal to the new callout title. This compensates for `UpdateCalloutFramingInput` lacking a `collaboraDocument` field.
- **FR-016**: The Collabora editor dialog (both CRD and MUI) MUST render the document type icon before the title in its header, and MUST fill the full viewport height (overriding the app theme's `MuiDialog.paper maxHeight` cap).

### Key Entities

- **COLLABORA_DOCUMENT Callout**: A callout whose contribution type is `COLLABORA_DOCUMENT`. Serves as a container for collaborative documents within a space. Follows the same callout patterns as Post, Whiteboard, Link, and Memo callouts.
- **CollaboraDocument Contribution**: A contribution within a COLLABORA_DOCUMENT callout representing a single collaborative document. Has a profile (title/description), a document type (spreadsheet/presentation/text), and standard timestamps and authorization.
- **CollaboraEditorUrl**: The result of requesting an editor URL — contains the full Collabora editor URL (ready for iframe embedding) and the access token TTL for session management.
- **CollaboraDocumentType**: An enum distinguishing the three supported document types: SPREADSHEET, PRESENTATION, TEXT_DOCUMENT. Used for icon selection and creation dialog options.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new Collabora document (any of the three types) and begin editing it within a single interaction flow — create dialog to live editor in under 10 seconds.
- **SC-002**: Users can browse all Collabora documents in a callout and open any document for editing with one click, with the editor loading within 5 seconds.
- **SC-003**: Multiple users can simultaneously open and edit the same document, with real-time collaboration handled by Collabora Online.
- **SC-004**: All document operations (create, view, edit, delete, rename) respect space-level authorization — unauthorized actions are hidden from the UI, not just blocked on the server.
- **SC-005**: When backend services (WOPI, Collabora) are unavailable, users see clear, actionable error messages instead of broken UI or silent failures.
- **SC-006**: The Collabora document callout type is fully integrated into existing callout management workflows — creation, configuration, and display follow the same patterns as other callout types.
- **SC-007**: After any edit, the footer reports `Saved` within the time it takes Collabora Online's autosave to complete (typically 1–3 seconds) — the save indicator never sticks at `Unsaved changes` once Collabora has acknowledged the save.
- **SC-008**: Renaming a Collabora-framed callout via the edit dialog produces a single atomic-looking change from the user's perspective: the callout title and the document name update together, not in two separate visible steps.

## Assumptions

- The server-side implementation (alkem-io/server#5970) is merged and deployed, providing the GraphQL schema additions: `COLLABORA_DOCUMENT` enum value, `CollaboraDocument` type, `CollaboraEditorUrl` type, `collaboraEditorUrl` query, `updateCollaboraDocument` mutation, `deleteCollaboraDocument` mutation, and the `collaboraDocument` field on `CreateContributionOnCalloutInput`.
- GraphQL codegen will be run against the updated server schema to generate the new types and hooks before development begins.
- Collabora Online is accessible from the user's browser (the editor URL points to a Collabora instance reachable from the client side, not just within the cluster).
- The Collabora editor iframe works with standard browser security policies (CSP, X-Frame-Options). The deployment must configure Collabora to allow embedding from the Alkemio domain.
- The WOPI access token and editor URL are opaque to the client — the client simply loads the URL in an iframe and does not need to understand the WOPI protocol.
- The iframe-based Collabora editor handles its own autosave, collaboration, and document rendering. The client's responsibility is limited to embedding the iframe and managing the session lifecycle (token TTL).
- Authorization checks for create/edit/delete follow the existing callout contribution authorization pattern already used for whiteboards and posts.
- The visual design for document cards and the editor dialog will follow the existing patterns established by whiteboard contributions (card grid + dialog with embedded editor).
- Callout-contribution internals (card, create button, contribution dialog) use MUI per the original 2026-04-14 decision. The editor footer is a CRD component (added in the 2026-04-24 parity round) and is rendered from both design systems via a `.crd-root` scope in the MUI path. This is the only cross-design-system touchpoint; all other CRD-layer rules (`src/crd/CLAUDE.md`) are respected — no GraphQL types or business logic in CRD, all data flows in as props, all behavior flows in via callbacks.
- Collabora's postMessage API (https://sdk.collaboraonline.com/docs/postmessage_api.html) is the authoritative source for save state and presence. The client does not parse the iframe's DOM or poll the server — it only reacts to `MessageId`-typed events posted from the iframe's `contentWindow`.
