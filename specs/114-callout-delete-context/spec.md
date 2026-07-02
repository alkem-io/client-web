# Feature Specification: Context-Aware Callout Delete Confirmation

**Feature Branch**: `114-callout-delete-context`  
**Created**: 2026-07-02  
**Status**: Draft  
**Input**: User description: "The 'delete callout' confirmation dialog needs more context about what is actually going to be deleted. Instead of a plain/standard confirmation dialog, make it context-aware for callouts that contain content. The body should list what will be deleted, making its size variable depending on what is inside. This visual variability is intentional: a dialog that looks different every time breaks the muscle-memory dismissal pattern. The confirm button label should reflect the action's scope."

## Clarifications

### Session 2026-07-02

- Q: How much data should the dialog fetch to build the content list? → A: Use only easily-available data — contribution count, framing link/reference details, framing content type, and comment count. No extra query is issued when the dialog opens. Contributions are summarized by count (the cached model carries no per-contribution detail), accompanied by a general note that their attached files and links will also be removed.
- Q: What is the cap for individually-listed items (named links) before an "and N more" summary line? → A: 3 items.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See what will be lost before deleting a callout with content (Priority: P1)

A person managing a space opens the callout options menu and chooses to delete a callout that holds contributions (posts), files, links, or other rich content. Instead of a generic "Are you sure?" prompt, the confirmation dialog shows a summary of the specific content that will be permanently removed, so the person understands the real consequence before confirming.

**Why this priority**: This is the core of the request. Deleting a callout is irreversible and can destroy other people's contributions. Surfacing the concrete impact is the single most valuable change and delivers the feature on its own.

**Independent Test**: Open the delete confirmation on a callout that contains a mix of contributions/files/links and verify the dialog lists that content, distinct from the generic prompt shown for an empty callout.

**Acceptance Scenarios**:

1. **Given** a callout that contains several contributions, **When** the person opens the delete confirmation, **Then** the dialog body states the number of contributions that will be deleted (e.g. "3 contributions") together with a general note that their attached files and links will be removed.
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

### Edge Cases

- **Content present but details unavailable**: When the callout is known to contain content but per-item detail (e.g. an author name or post date) is not available at the moment of deletion, the dialog still communicates that content exists and will be lost (e.g. a general "including attached files and links" note), rather than showing blanks or nothing.
- **Single item vs. many**: Wording adapts between singular and plural wherever counts appear (e.g. "1 contribution" vs. "3 contributions", "and 1 more link" vs. "and 3 more links", "and 1 comment" vs. "and 5 comments").
- **Mixed content**: A callout containing both contributions and framing content (a whiteboard, a link) surfaces each kind without duplicating or omitting a category.
- **Very long titles**: Contribution or file titles that are long are truncated so the dialog stays readable and the confirm/cancel actions remain reachable.
- **Deletion failure**: If the deletion request fails after confirmation, the person is informed and the callout is not silently lost.
- **Loss of muscle memory**: Because the dialog layout intentionally varies with content, the confirm action must never sit in a fixed position that enables blind, repeated dismissal; the person must engage with the specific dialog shown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The callout delete confirmation MUST be context-aware — its body content and size MUST vary according to what the callout actually contains.
- **FR-002**: When a callout contains contributions, the dialog MUST communicate that they will be deleted as a count ("N contributions") with correct singular/plural wording. The dialog MUST NOT issue an additional query to build the list; the cached model carries no per-contribution detail, so individual contributions are not listed.
- **FR-003**: The named-link list (FR-005) MUST be capped at 3 items and, when the total exceeds 3, MUST show an "and N more links" summary line reflecting the correct remaining count and singular/plural wording.
- **FR-004**: When a callout's framing body is a document, the dialog MUST indicate its presence by content type (e.g. "including a document"). Per-file detail (filename, file type) is not available from cached data; files attached to contributions are covered by the general note in FR-007.
- **FR-005**: When a callout has named links available at deletion time (a framing body link and framing references), the dialog MUST identify them by link title, falling back to the URL. Link contributions are not individually identifiable from cached data and are covered by the contribution count (FR-002).
- **FR-006**: When a callout contains other rich content (e.g. a whiteboard), the dialog MUST indicate its presence by content type (e.g. "including a whiteboard").
- **FR-007**: When a callout contains contributions — whose attached files and links are not individually enumerable from cached data — the dialog MUST show a general note such as "including attached files and links" alongside the contribution count.
- **FR-008**: When a callout has no content, the dialog MUST omit the content list and present a concise confirmation covering only the callout itself.
- **FR-009**: The primary confirm button label MUST reflect the scope of the action — "Delete callout and all contents" when content is present — rather than a generic "Delete".
- **FR-010**: The dialog MUST retain its destructive-action styling and a clear cancel path that performs no deletion.
- **FR-011**: All dialog text (headings, content-list labels, summary lines, button labels) MUST be provided as translatable strings across every supported language, with singular/plural variants where counts are shown.
- **FR-012**: The dialog MUST remain accessible — content list, summary, and actions reachable and operable by keyboard and assistive technology, and the destructive confirm clearly distinguishable.
- **FR-013**: On confirmation, the system MUST delete the callout and all of its contained content, and on failure MUST inform the person without leaving an inconsistent state.
- **FR-014**: When a callout has comments, the dialog MUST communicate the comment count ("and N comments") with correct singular/plural wording. Comments count as content for the purposes of FR-008 (empty vs. content-bearing) and FR-009 (confirm-button scope).

### Key Entities *(include if feature involves data)*

- **Callout**: The container being deleted. Has a display title and may hold framing body content (whiteboard, link, other rich content) plus a set of contributions.
- **Contribution**: An item inside a callout (e.g. a post) that will be deleted with it. May carry a title, an author, and a posted date.
- **File / Document**: An attached asset associated with the callout. Has a filename and a file type.
- **Link / Reference**: A referenced link associated with the callout. Has a title and/or a URL.
- **Rich content**: Framing content such as a whiteboard, identified by its content type rather than enumerated in detail.
- **Comment**: A message on the callout's comment thread, deleted with the callout. Represented in the dialog by a count only.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For a callout containing content, 100% of delete confirmations display a content summary distinct from the empty-callout confirmation.
- **SC-002**: When the confirmation is shown, a person can identify at least the count and kind of content that will be lost without leaving or expanding the dialog.
- **SC-003**: The confirm button communicates that both the callout and its contents will be removed in 100% of content-bearing cases.
- **SC-004**: The dialog's visible layout/size differs measurably between an empty callout and a content-bearing callout, and between callouts with different amounts of content.
- **SC-005**: All confirmation strings render correctly in every supported language with no missing keys and correct singular/plural forms.
- **SC-006**: Design review confirms the dialog layout demonstrably varies with content (empty vs. content-bearing vs. different content mixes), so the confirmation cannot be dismissed from muscle memory alone. Verified qualitatively during manual verification; no analytics instrumentation is required.

## Assumptions

- **Data availability bounds the detail shown** (see Clarifications 2026-07-02): The dialog uses only data that is *easily available* at the point of deletion — a contribution count, framing link/reference details, the framing content type, and the comment count. It MUST NOT issue an additional query on open to enrich the list. The cached model carries no per-contribution or per-file detail, so contributions are represented by a count plus the general "including attached files and links" note (FR-007).
- **Reuse of the existing confirmation surface**: This feature enhances the existing callout delete confirmation rather than introducing a separate deletion flow; the destructive-variant confirmation and cancel behavior are preserved.
- **Cap value**: The named-link list is capped at 3 items (see Clarifications 2026-07-02), with the "and N more links" line carrying the remainder.
- **Supported languages**: The set of languages already supported by the product (en, nl, es, bg, de, fr) applies to all new strings.
- **Permissions unchanged**: Who is allowed to delete a callout is unchanged; this feature only affects the confirmation experience for those already able to delete.

## Out of Scope

- Changing what deletion does at the data level (it already removes the callout and its contents) beyond ensuring the confirm action's stated scope matches the actual effect.
- Adding an undo / soft-delete / restore capability.
- Redesigning the generic confirmation component for non-callout deletions.
- Fetching or displaying full contribution bodies/previews inside the dialog (only summary-level identification is in scope).
