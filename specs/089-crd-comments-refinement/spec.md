# Feature Specification: CRD Comments Refinement (Parity with Legacy Experience)

**Feature Branch**: `089-crd-comments-refinement`
**Created**: 2026-04-21
**Status**: Ready
**Input**: Refine the comments experience on CRD-migrated pages so it matches the behavior community members have been using in the legacy interface. The timeline event modal is the most visible pain point: long threads can stretch to consume the entire event dialog, pushing event details off-screen. Alongside that, the input position, sort order, and reply affordances diverge from the legacy pattern and create friction.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Keep event context visible while reading comments (Priority: P1)

A community member opens a calendar event in a space's timeline to check the date, location, and description, and to see what others are saying. Today, when a popular event has many comments, the list pushes the event's banner and details out of view and the member has to scroll back up to re-read the event body. The member wants the event details to stay visible regardless of how active the discussion is.

**Why this priority**: This is the headline regression versus the legacy experience and is visible on the most-viewed modal in the space. Fixing it restores the basic usefulness of the event dialog — read the event, join the discussion — without trade-off.

**Independent Test**: Open a calendar event with 20+ comments in a space timeline. Confirm the event banner, title, date, location, and description remain visible, and that scrolling through the comments happens within the comments area only.

**Acceptance Scenarios**:

1. **Given** a calendar event with 20 comments, **When** the member opens the event detail modal, **Then** the event's banner, title, date, location, and description are visible without scrolling the dialog and the comments list has an internal scroll bar.
2. **Given** the comments list is scrolled to the bottom, **When** the member scrolls further, **Then** the event details stay pinned in place and only the comments area scrolls.
3. **Given** a calendar event with 0-4 comments, **When** the member opens the modal, **Then** the comments area shrinks to fit the content (no forced empty space) and no scroll bar is shown.

---

### User Story 2 - Post a comment without hunting for the input (Priority: P1)

A community member wants to contribute to a discussion — either on a timeline event or in a callout — and expects the input field to be in a consistent, obvious place. Today the input is at the bottom of the thread in both surfaces, which differs from the legacy experience and from how the rest of the product positions reply fields. The member wants to find the input at the top of the thread, directly under the label, so the flow "open → type → send" is frictionless regardless of thread length.

**Why this priority**: Input placement is the single most frequent interaction with the comments UI. Misalignment with the legacy experience causes drop-off ("I can't find the box") and breaks muscle memory for members who move between legacy and CRD surfaces during the migration.

**Independent Test**: Open both (a) a timeline event and (b) a callout discussion. Confirm the comment input is the first interactive element under the "Comments" label in both surfaces, ahead of any existing comments.

**Acceptance Scenarios**:

1. **Given** a member with permission to comment opens a timeline event, **When** the comments area renders, **Then** the input field appears directly beneath the "Comments (N)" label and above the list of existing comments.
2. **Given** a member with permission to comment opens a callout discussion, **When** the comments area renders, **Then** the input field appears above the existing comments in the scroll flow (not pinned to the bottom of the modal).
3. **Given** a member without permission to comment, **When** either surface renders, **Then** the input field is not shown and only the thread is visible (unchanged behavior).

---

### User Story 3 - See the most recent comments first (Priority: P2)

A member returning to a discussion wants to see what was said most recently, without having to scroll to the bottom of a long thread. The current CRD surface lets members toggle between "Newest first" and "Oldest first", but this choice doesn't exist in the legacy experience, adds visual noise, and creates inconsistency across sessions and devices.

**Why this priority**: The sort toggle is clutter that solves a problem few members asked for. Removing it reduces cognitive load and matches the legacy default everyone is already used to. Ranked P2 because it's less urgent than visibility and input placement, but still user-visible.

**Independent Test**: Open a thread with 5+ comments spanning a few days. Confirm comments appear newest-first without any sort control in the header.

**Acceptance Scenarios**:

1. **Given** a thread with comments posted across several days, **When** the thread renders, **Then** the most recent top-level comment appears at the top of the list and the oldest at the bottom.
2. **Given** the thread header displays the comment count, **When** the member looks at the header, **Then** no sort toggle control is visible.
3. **Given** a member posts a new top-level comment, **When** the thread refreshes, **Then** the new comment appears as the first item in the list.
4. **Given** a top-level comment has replies, **When** the replies render under their parent, **Then** they appear in chronological order (oldest first) so the conversation reads naturally.

---

### User Story 4 - Reply once, not recursively (Priority: P2)

A member wants to reply to a top-level comment to add context to that specific discussion thread. Today, the CRD surface shows a "Reply" button on both top-level comments and on replies themselves, which suggests replies-to-replies are possible. In practice the system silently discards any second-level nesting. This is confusing and unfair to the member who thinks their reply-to-a-reply was posted correctly.

**Why this priority**: Correctness — the UI should not advertise capabilities that don't work. The legacy experience hides the Reply button on replies for this exact reason. Fixing it removes a source of silent data loss and user confusion.

**Independent Test**: Open a thread that has at least one top-level comment with a reply. Confirm the Reply action appears only on the top-level comment, not on the reply.

**Acceptance Scenarios**:

1. **Given** a thread with a top-level comment and one reply, **When** the thread renders, **Then** only the top-level comment shows a Reply action and the reply does not.
2. **Given** the member clicks Reply on a top-level comment, **When** they submit, **Then** their reply is nested under the top-level comment at one level of depth.
3. **Given** the member is the author of a reply, **When** they view the reply, **Then** they can still delete it (Delete action remains available).

---

### User Story 5 - Read and post comments inline on list-view callouts (Priority: P1)

A community member browsing a space feed (home page, knowledge base, space feed) sees a stack of callouts. Each callout shows a footer with "N comments". Today, the only way to read or post those comments is to open the full callout detail dialog — interrupting the browsing flow. The member wants a lightweight way to peek into the discussion, read a few recent comments, and reply without leaving the feed.

**Why this priority**: Comments are the primary mode of engagement on list-view callouts. The full dialog is the right surface for deep reading, editing, and managing contributions, but for the "quick glance + quick reply" flow (by far the common case) the dialog is heavier than needed. Inline expansion keeps the feed as the member's anchor and mirrors the pattern used by most modern community UIs.

**Independent Test**: Enable CRD, navigate to a space feed with at least two callouts, each with ≥1 comment. Confirm each footer shows a chevron + "N comments"; expanding one reveals the input and the thread beneath it without opening a dialog, bounded to a readable height, and leaves the other callouts in place.

**Acceptance Scenarios**:

1. **Given** a callout in a list view with N comments, **When** the footer renders, **Then** it shows a chevron-down icon immediately followed by the comment count label, and the icon acts as the visual affordance for expansion.
2. **Given** the member clicks anywhere on the footer row, **When** the toggle fires, **Then** the callout footer expands inline to reveal the comment input (above) and the thread (below) within the same card, without opening the detail dialog.
3. **Given** the inline comments area is expanded, **When** the thread has more content than fits, **Then** the list scrolls internally within the footer region and does not push subsequent callouts down the page.
4. **Given** the footer is expanded, **When** the member clicks the chevron (or anywhere on the trigger row) again, **Then** the footer collapses back to its compact state and the chevron returns to pointing down.
5. **Given** the footer is expanded, **When** the member posts, replies to, reacts to, or deletes a comment, **Then** the action succeeds exactly as it would inside the callout detail dialog.
6. **Given** the member has multiple callouts expanded simultaneously, **When** they interact with one, **Then** each callout maintains its own expand/collapse state and its own scroll position independently.
7. **Given** the member collapses a previously expanded footer and re-expands it later, **When** the footer renders again, **Then** any unsent input text they had typed and the current thread state are preserved.
8. **Given** CRD is toggled off, **When** the member visits the same space feed, **Then** the legacy (MUI) callout list renders unchanged — no chevron, no inline expansion.

---

### Edge Cases

- **Empty thread**: The input and count ("Comments (0)") are visible; an "empty" message is shown in the list area.
- **Member with read but not post permission**: The thread renders normally; the input field is absent.
- **Deleted parent comment with surviving replies**: A placeholder "Deleted" entry represents the missing parent, and the replies still render beneath it (unchanged behavior).
- **Single very long comment**: The comment renders in full within the list; scrolling within the comments area reveals the rest.
- **Realtime update while reading**: A newly posted comment appears at the top of the list without disrupting the member's current scroll position in the thread below.
- **Narrow viewport (phone)**: On a phone, the timeline event modal's comments area still respects a bounded height so the event body does not get pushed off-screen; the input remains above the list.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The comments input field MUST be rendered directly beneath the comments header (count label) and above the list of existing comments on both the timeline event detail modal and the callout discussion modal.
- **FR-002**: Top-level comments MUST be ordered newest-first (most recently posted comment at the top).
- **FR-003**: Replies within a top-level thread MUST be ordered oldest-first so the conversation reads naturally in chronological order.
- **FR-004**: The thread header MUST NOT show a sort-order toggle control.
- **FR-005**: The Reply action MUST be available only on top-level comments and MUST NOT appear on replies.
- **FR-006**: The Delete action MUST remain available on both top-level comments and replies, subject to the member's existing permissions (author, or moderator).
- **FR-007**: The comments list inside the timeline event detail modal MUST have a bounded visible height with an internal scroll bar, so the event's banner, title, date, location, and description remain visible regardless of thread length.
- **FR-008**: The comment count label (e.g., "Comments (N)") MUST remain visible at the top of the comments area.
- **FR-009**: Members without permission to post comments MUST see the thread but not the input field (unchanged behavior).
- **FR-010**: Existing comment functionality — posting, replying, reacting, deleting — MUST continue to work after the refinement.
- **FR-011**: Input placement and sort order MUST be consistent between the timeline event modal and the callout discussion modal.
- **FR-012**: Every CRD list-view callout (rendered via `PostCard` under `LazyCalloutItem`) MUST show a chevron-down affordance immediately preceding the "N comments" label; the chevron MUST rotate 180° while the footer is expanded and return on collapse.
- **FR-013**: The inline comments region, when expanded, MUST render the comment input above the thread and bound the thread to a fixed max-height with an internal scrollbar so that subsequent callouts in the feed do not shift by more than the bounded footer height.
- **FR-014**: The inline comments region MUST support the full set of comment actions — post, reply (single level), react, delete — with behavior identical to the callout detail dialog and the timeline event modal.
- **FR-015**: The inline comments affordance MUST be limited to the CRD list-view path. The legacy MUI callout list, the CRD callout detail dialog, and the CRD timeline event modal MUST NOT change.
- **FR-016**: Each callout in a feed MUST maintain its own independent expand/collapse state; toggling one MUST NOT affect any other callout.
- **FR-017**: The inline comments subscription MUST be gated so that callouts the member has never expanded do NOT open a live subscription. Once expanded at least once, the subscription MAY remain active for that card to preserve state across subsequent collapses and re-expansions.

### Key Entities

- **Comment**: A message posted by a member within a discussion. Has author, content, timestamp, reactions, and an optional parent comment. Comments without a parent are "top-level"; comments with a parent are "replies".
- **Reply**: A comment whose parent is a top-level comment. Replies cannot themselves have replies (one level of nesting).
- **Thread**: The collection of comments and their replies attached to a single discussion surface (a timeline event, a callout discussion, etc.).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When a calendar event has 20+ comments, 100% of the event's core details (banner, title, date, location, description) remain visible within the event detail modal without dialog-level scrolling.
- **SC-002**: A member can find the comment input on any CRD comments surface within one visual scan of the comments area — input is always the first interactive element under the header.
- **SC-003**: A newly posted top-level comment is visible at the top of the list within 1 second of successful submission (on a normal connection), with no additional action required by the member.
- **SC-004**: The thread header on every CRD comments surface shows zero sort-order toggle controls.
- **SC-005**: Zero replies display a Reply action; 100% of top-level comments (for which the member has reply permission) display the Reply action.
- **SC-006**: Zero regressions in post/reply/react/delete flows compared to the prior CRD behavior, verified by running the existing test suite and completing each flow manually on both surfaces.
- **SC-007**: Input-placement behavior is identical between the timeline event detail modal and the callout discussion modal (both place the input at the top of the thread).
- **SC-008**: On a list-view feed with 5+ callouts, expanding the comments footer on any callout shifts later callouts in the feed by no more than the bounded footer height (~400px by default), regardless of how many comments the thread contains.
- **SC-009**: The inline comments trigger is fully operable by keyboard: `Tab` reaches it, `Enter` or `Space` toggles it, `aria-expanded` reflects the current state for assistive technology, and the visible "N comments" label remains constant across state changes.
- **SC-010**: No live comment subscription is opened for a list-view callout until the member expands its inline footer at least once, verified by absence of the corresponding subscription request in the network inspector on initial page load.

## Assumptions

- The underlying data model for comments (messages, thread relationships, reactions, timestamps) is unchanged by this feature; only presentation and placement are being refined.
- Permission checks for reading, posting, replying, and deleting comments continue to be enforced by the existing backend authorization model.
- Realtime subscription/updating of the thread (new comments appearing from other members) continues to work as it does today.
- The bounded height for the timeline event modal's comments list is a fixed value that comfortably accommodates a handful of comments before scrolling; the specific dimension is an implementation-level choice confirmed during design.
- The callout discussion modal remains a full-page surface with its own scroll context; no bounded height is applied there.
