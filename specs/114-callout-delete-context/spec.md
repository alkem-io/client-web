# Feature Specification: Context-Aware Callout Delete Confirmation

**Feature Branch**: `114-callout-delete-context`
**Created**: 2026-07-02
**Status**: Draft
**Input**: User description: "The 'delete callout' confirmation dialog needs more context about what is actually going to be deleted. Instead of a plain/standard confirmation dialog, make it context-aware for callouts that contain content. The body should list what will be deleted, making its size variable depending on what is inside. This visual variability is intentional: a dialog that looks different every time breaks the muscle-memory dismissal pattern. The confirm button label should reflect the action's scope."

## Clarifications

### Session 2026-07-08

- Q: After confirming, the deletion succeeded server-side but the callout stayed on the space board until a manual refresh, and a repeat delete attempt errored ("already deleted"). What must happen after a confirmed deletion? → A: The deleted callout MUST disappear immediately from every view that lists it (board feed, post index, dashboards) without a manual refresh, the person MUST receive a positive (green) confirmation that the deletion happened, and any open dialog showing the deleted callout MUST close. There is no server-side deletion subscription — the client is responsible for propagating the deletion to its own views.

### Session 2026-07-02

- Q: How much data should the dialog fetch to build the content list? → A: Use only easily-available data — data that arrives with the callout's standard load: contribution titles + description previews and the exact total count, framing link/reference details, framing content type, and comment count. No extra query is issued when the dialog opens. Contributions render as a table headed by the exact total ("20 contributions will be deleted"), one row per listed contribution (bold title + one-line description preview), closed by a clip-icon row noting that their attached files and links will also be removed (attachments are not individually enumerable).
- Q: What is the cap for individually-listed items? → A: 3 items per named list (contribution rows and named links each) — except when exactly 4 contributions exist, in which case the 4th renders as a row. Beyond that, an "N−3 contributions more..." row carries the contribution remainder (the header keeps the exact total); links get an "and N more links" line.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See what will be lost before deleting a callout with content (Priority: P1)

A person managing a space opens the callout options menu and chooses to delete a callout that holds contributions (posts), files, links, or other rich content. Instead of a generic "Are you sure?" prompt, the confirmation dialog shows a summary of the specific content that will be permanently removed, so the person understands the real consequence before confirming.

**Why this priority**: This is the core of the request. Deleting a callout is irreversible and can destroy other people's contributions. Surfacing the concrete impact is the single most valuable change and delivers the feature on its own.

**Independent Test**: Open the delete confirmation on a callout that contains a mix of contributions/files/links and verify the dialog lists that content, distinct from the generic prompt shown for an empty callout.

**Acceptance Scenarios**:

1. **Given** a callout that contains several contributions, **When** the person opens the delete confirmation, **Then** the dialog body shows a table headed "20 contributions will be deleted" (exact total), with a row per listed contribution — title in bold on the left, a single-line preview of its description on the right — an "17 contributions more..." row for the remainder, and a final row with a clip icon noting that attached files and links will be removed.
2. **Given** a callout whose named links (framing body link plus references) exceed the display cap, **When** the delete confirmation opens, **Then** the first 3 links are listed and an "and N more links" summary line indicates the remainder.
3. **Given** a callout that contains files/documents, links/references, or rich content such as a whiteboard, **When** the delete confirmation opens, **Then** the dialog identifies each type of content that will be removed.
4. **Given** the person reads the dialog, **When** they decide not to proceed, **Then** they can cancel and nothing is deleted.

---

### User Story 2 - Confirm button states the scope of the action (Priority: P1)

When a callout contains content, the primary confirmation button tells the person that they are deleting the callout **and** everything inside it, rather than an ambiguous generic "Delete".

**Why this priority**: The button is the point of commitment. A label that names the scope ("Delete callout and all contents") prevents accidental destructive confirmation and reinforces the listed impact. It is small but tightly coupled to Story 1.

**Independent Test**: Open the delete confirmation on a callout with content and verify the confirm button reads "Delete callout and all contents" (scope-reflecting), not a bare "Delete".

**Acceptance Scenarios**:

1. **Given** a callout that contains content, **When** the delete confirmation opens, **Then** the confirm button reflects the full scope of the deletion.
2. **Given** the person clicks the scope-reflecting confirm button, **When** the deletion completes, **Then** the callout and all of its listed content are removed.

---

### User Story 3 - Empty callouts keep a simple confirmation (Priority: P2)

When a callout has no contributions, files, links, or rich content, the person still gets a confirmation, but it stays concise — there is nothing to enumerate.

**Why this priority**: Preserves the "variable size" intent (the dialog is small when there is nothing inside) and avoids showing an empty or misleading content list. Complements the primary stories rather than standing alone.

**Independent Test**: Open the delete confirmation on an empty callout and verify no content list is shown and the copy/button remain appropriate for deleting just the callout.

**Acceptance Scenarios**:

1. **Given** a callout with no content, **When** the delete confirmation opens, **Then** no content list is rendered and the dialog communicates only that the callout itself will be deleted.

---

### User Story 4 - Delete a single contribution from its preview (Priority: P2)

With the callout dialog open and a contribution selected, its preview title bar (author avatar, contribution title, and the edit / share / close action cluster) offers a trashcan icon — placed before the close button — that deletes just that contribution after an explicit confirmation.

**Why this priority**: Complements the callout-level deletion: sometimes only one contribution must go, and today that requires opening the edit flow. The same confirmation discipline applies — a single click must never destroy content.

**Independent Test**: Open a callout, select a contribution, click the trashcan in the preview title bar, confirm — the contribution disappears from the grid and the preview closes. Cancelling leaves it untouched.

**Acceptance Scenarios**:

1. **Given** a selected contribution whose preview is shown and a person with permission to delete it, **When** they click the trashcan icon in the title bar, **Then** a confirmation dialog opens naming the contribution, and nothing is deleted yet.
2. **Given** the confirmation dialog is open, **When** the person confirms, **Then** the contribution is deleted, the preview closes, and the contributions grid no longer shows it.
3. **Given** the confirmation dialog is open, **When** the person cancels, **Then** nothing is deleted and the preview stays.
4. **Given** a person without delete permission on the contribution, **When** they view the preview, **Then** no trashcan icon is shown.

---

### Edge Cases

- **Content present but details unavailable**: When the callout is known to contain content but per-item detail (e.g. a contribution's title) is not available at the moment of deletion, the dialog still communicates that content exists and will be lost — the contribution count and the general "including attached files and links" note render even when no titles can be listed — rather than showing blanks or nothing.
- **Single item vs. many**: Wording adapts between singular and plural wherever counts appear (e.g. "1 contribution will be deleted" vs. "20 contributions will be deleted", "and 1 more link" vs. "and 3 more links", "1 comment will be deleted" vs. "27 comments will be deleted").
- **Mixed content**: A callout containing both contributions and framing content (a whiteboard, a link) surfaces each kind without duplicating or omitting a category.
- **Very long titles**: Contribution or file titles that are long are truncated so the dialog stays readable and the confirm/cancel actions remain reachable.
- **Deletion failure**: If the deletion request fails after confirmation, the person is informed and the callout is not silently lost.
- **Loss of muscle memory**: Because the dialog layout intentionally varies with content, the confirm action must never sit in a fixed position that enables blind, repeated dismissal; the person must engage with the specific dialog shown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The callout delete confirmation MUST be context-aware — its body content and size MUST vary according to what the callout actually contains.
- **FR-002**: When a callout contains contributions, the dialog MUST present them as a table headed by the exact total ("20 contributions will be deleted", correct singular/plural), followed by one row per listed contribution (up to the FR-003 cap): the contribution's title in bold on the left and a single-line preview of its markdown description with ellipsis. The dialog MUST NOT issue an additional query when it opens; titles, descriptions, and the exact total count come from data already loaded with the callout.
- **FR-003**: Contribution rows are capped at 3, with one exception: when exactly 4 contributions exist, the 4th renders as a normal row (an overflow line would waste the very row it summarizes). When more than 4 exist, a final text row reads "N−3 contributions more..." (correct singular/plural); the header still carries the exact total. The named-link list (FR-005) is likewise capped at 3 items and, when the total exceeds 3, MUST show an "and N more links" summary line with correct singular/plural wording.
- **FR-004**: When a callout's framing body is a document, the table header MUST name it with a definite article — "The document will be deleted", or "The document and N contributions will be deleted" when contributions exist. Per-file detail (filename, file type) is not available for attachments; files attached to contributions are covered by the general note in FR-007.
- **FR-005**: A call-to-action callout's action button MUST render as its own table row — "Call to Action" label on the left, the action's title on the right. Framing references render as a named-links list below the table, identified by link title falling back to the URL. Link contributions are listed by title among the contributions (FR-002), not in either place.
- **FR-006**: When a callout contains other rich content (e.g. a whiteboard), the table header MUST name it by content type with a definite article, composed with the contribution total when present — "The whiteboard and 20 contributions will be deleted", or "The whiteboard will be deleted" alone. A poll's header MUST also name its collected results: "The poll and its results will be deleted" ("The poll, its results and 20 contributions will be deleted" with contributions).
- **FR-007**: When a callout contains contributions — whose attached files and links are not individually enumerable from easily-available data — the table's last row MUST show a clip (paperclip) icon with a general note such as "including attached files and links".
- **FR-008**: When a callout has no content, the dialog MUST omit the content list and present a concise confirmation covering only the callout itself.
- **FR-009**: The primary confirm button label MUST reflect the scope of the action — "Delete callout and all contents" when content is present — rather than a generic "Delete".
- **FR-010**: The dialog MUST retain its destructive-action styling and a clear cancel path that performs no deletion — both the Cancel button and an X close control in the title bar.
- **FR-011**: All dialog text (headings, content-list labels, summary lines, button labels) MUST be provided as translatable strings across every supported language, with singular/plural variants where counts are shown.
- **FR-012**: The dialog MUST remain accessible — content list, summary, and actions reachable and operable by keyboard and assistive technology, and the destructive confirm clearly distinguishable.
- **FR-013**: On confirmation, the system MUST delete the callout and all of its contained content, and on failure MUST inform the person without leaving an inconsistent state.
- **FR-015**: The selected-contribution preview's title bar MUST offer a trashcan (delete) control placed between the share and close controls, shown only to people with permission to delete that contribution.
- **FR-016**: Clicking the trashcan MUST open a confirmation dialog naming the contribution before anything is deleted; confirming deletes only that contribution and returns to the contributions grid; cancelling performs no deletion; on failure the person is informed and the contribution is not silently lost.
- **FR-017**: After a confirmed deletion succeeds, the callout MUST disappear immediately from every view that lists it — the space board feed, the post index, and any other cached listing — without requiring a manual page refresh (see Clarifications 2026-07-08). It MUST NOT remain interactable in a state where a second delete attempt can be issued against an already-deleted callout.
- **FR-018**: After a confirmed deletion succeeds, the person MUST receive a positive (success-styled) notification confirming the deletion, and when the deletion was initiated from within the callout's detail dialog, that dialog MUST close.
- **FR-014**: When a callout has comments (more than 0), the dialog MUST show a table row stating the comment count ("27 comments will be deleted", correct singular/plural), placed after the contribution rows and before the FR-007 attachments row. Comments count as content for the purposes of FR-008 (empty vs. content-bearing) and FR-009 (confirm-button scope).

### Key Entities *(include if feature involves data)*

- **Callout**: The container being deleted. Has a display title and may hold framing body content (whiteboard, link, other rich content) plus a set of contributions.
- **Contribution**: An item inside a callout (a post, whiteboard, memo, link, or document) that will be deleted with it. Has a title and a markdown description, which the dialog shows as a table row (bold title + one-line description preview, up to the cap); the exact total count is always known.
- **File / Document**: An attached asset associated with the callout. Has a filename and a file type.
- **Link / Reference**: A referenced link associated with the callout. Has a title and/or a URL.
- **Rich content**: Framing content such as a whiteboard, identified by its content type rather than enumerated in detail.
- **Comment**: A message on the callout's comment thread, deleted with the callout. Represented in the dialog by a count-only table row ("27 comments will be deleted").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For a callout containing content, 100% of delete confirmations display a content summary distinct from the empty-callout confirmation.
- **SC-002**: When the confirmation is shown, a person can identify at least the count and kind of content that will be lost without leaving or expanding the dialog.
- **SC-003**: The confirm button communicates that both the callout and its contents will be removed in 100% of content-bearing cases.
- **SC-004**: The dialog's visible layout/size differs measurably between an empty callout and a content-bearing callout, and between callouts with different amounts of content.
- **SC-005**: All confirmation strings render correctly in every supported language with no missing keys and correct singular/plural forms.
- **SC-006**: Design review confirms the dialog layout demonstrably varies with content (empty vs. content-bearing vs. different content mixes), so the confirmation cannot be dismissed from muscle memory alone. Verified qualitatively during manual verification; no analytics instrumentation is required.

## Assumptions

- **Data availability bounds the detail shown** (see Clarifications 2026-07-02): The dialog uses only data that is *easily available* at the point of deletion — data that arrives with the callout's standard load: contribution titles and the exact total count, framing link/reference details, the framing content type, and the comment count. It MUST NOT issue an additional query on open to enrich the list. Per-attachment detail (files/links inside contributions) is not enumerable, so attachments are covered by the general "including attached files and links" note (FR-007).
- **Reuse of the existing confirmation surface**: This feature enhances the existing callout delete confirmation rather than introducing a separate deletion flow; the destructive-variant confirmation and cancel behavior are preserved.
- **Cap value**: Each named list (contribution titles, named links) is capped at 3 items (see Clarifications 2026-07-02), with the "and N more …" line carrying the remainder.
- **Supported languages**: The set of languages already supported by the product (en, nl, es, bg, de, fr) applies to all new strings.
- **Permissions unchanged**: Who is allowed to delete a callout is unchanged; this feature only affects the confirmation experience for those already able to delete.

## Out of Scope

- Changing what deletion does at the data level (it already removes the callout and its contents) beyond ensuring the confirm action's stated scope matches the actual effect.
- Adding an undo / soft-delete / restore capability.
- Redesigning the generic confirmation component for non-callout deletions.
- Fetching or displaying full contribution bodies/previews inside the dialog (only summary-level identification is in scope).
