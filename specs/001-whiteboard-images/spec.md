# Feature Specification: Whiteboard Image Reliability

**Feature Branch**: `001-whiteboard-images`
**Created**: 2026-01-21
**Status**: Draft
**Input**: Investigate and fix Excalidraw whiteboard image handling: copy/paste images intermittently fail to load for uploader/peers; after closing and reopening sessions some images don’t reload. Analyze current file store/collab implementation, document root causes, and propose a clean plan to eliminate race conditions and failures.

## Clarifications

### Session 2026-01-21

- Q: For the upload button flow, how is the image placed onto the canvas? → A: Upload, then user clicks once to place the image.
- Q: Do we enforce an image upload limit on the client? → A: Enforce a client-side max file size and block with a clear message.
- Q: What is the UX when an upload is blocked (e.g., oversize)? → A: Block before placement; nothing added to the scene; show an error message.
- Q: Which image formats are supported for upload? → A: PNG, JPEG, and WebP.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Collaborators see pasted/uploaded images (Priority: P1)

As a whiteboard participant, when I paste or upload an image onto the whiteboard, the image is reliably visible to me and to other participants in the same session.

**Why this priority**: Missing images break collaboration and trust in the whiteboard.

**Independent Test**: Can be tested by two users in the same session pasting/uploading several images and confirming consistent visibility for both.

**Acceptance Scenarios**:

1. **Given** two users are in the same collaborative whiteboard session, **When** user A pastes an image, **Then** user B sees the image appear without manual refresh.
2. **Given** two users are in the same collaborative whiteboard session, **When** user A uploads an image via the whiteboard UI and places it on the canvas, **Then** user B sees the image appear without manual refresh.
3. **Given** a user pastes/uploads multiple images in quick succession, **When** the network is slow or briefly unstable, **Then** images eventually appear for all participants or a clear “not available yet” state is shown (no silent loss).

---

### User Story 2 - Images persist across closing and reopening (Priority: P2)

As a user, when I close a whiteboard and open it again later, all previously added images reliably load and display.

**Why this priority**: Users expect a whiteboard to be durable; missing images undermines documentation and decision records.

**Independent Test**: Can be tested by adding several images, closing the whiteboard, reopening it, and verifying all images render.

**Acceptance Scenarios**:

1. **Given** a whiteboard contains images added earlier, **When** the user closes and reopens the whiteboard, **Then** all images are displayed.
2. **Given** a whiteboard contains images and a user reloads the page, **When** they re-enter the whiteboard, **Then** all images are displayed.

---

### User Story 3 - Failures are visible and recoverable (Priority: P3)

As a user, if an image cannot be uploaded or loaded, the whiteboard communicates the issue clearly and offers a way to recover (retry, refresh, or alternate path) without losing the rest of the scene.

**Why this priority**: Even with best effort, networks and storage can fail; the UX must be resilient.

**Independent Test**: Can be tested by forcing an upload failure or blocking image downloads and verifying the UI indicates the problem and supports recovery.

**Acceptance Scenarios**:

1. **Given** an image upload fails, **When** the user remains in the session, **Then** the app shows a recoverable error state (no silent disappearance).
2. **Given** an image download fails on reopen, **When** the user retries, **Then** the app attempts to load again and succeeds if connectivity is restored.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when the user adds multiple large images rapidly?
- What happens when the user tries to upload an image larger than the allowed max file size?
- What happens when the user tries to upload an unsupported file type?
- What happens when storage is unavailable for the whiteboard (no storage bucket / permissions)?
- What happens when a collaborator joins late (after images were added)?
- What happens when the network drops mid-upload or mid-download?
- What happens when the same image is added multiple times (duplicate content)?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST ensure that images added to a collaborative whiteboard become visible to other participants in the same session.
- **FR-002**: The system MUST ensure that images previously added to a whiteboard remain visible after closing and reopening the whiteboard.
- **FR-003**: The system MUST NOT silently drop images from a whiteboard due to transient upload/download failures.
- **FR-004**: When an image cannot be uploaded or loaded, the system MUST present a user-visible, recoverable state (e.g., retry) and preserve the rest of the whiteboard content.
- **FR-005**: The system MUST maintain consistent image identity so that the same image is not duplicated unintentionally across participants or across reopen cycles.
- **FR-006**: The system MUST support concurrent image additions (multiple images, multiple users) without inconsistent outcomes between participants.
- **FR-007**: The system MUST record enough diagnostic information to investigate image failures (without exposing sensitive image content).
- **FR-008**: The upload UI flow MUST support an explicit “place on canvas” step after file selection; the image MUST be added to the scene only after placement.
- **FR-009**: The client MUST enforce a maximum upload file size and prevent oversize uploads with a clear, user-visible message.
- **FR-010**: If an upload is blocked (e.g., oversize), the client MUST block before placement and MUST NOT add any new image element or placeholder to the scene.
- **FR-011**: The client MUST accept uploads of PNG, JPEG, and WebP images, and MUST reject other file types with a clear, user-visible message.

### Key Entities *(include if feature involves data)*

- **Whiteboard Scene**: A persisted representation of the whiteboard, including elements and references to images.
- **Image Reference**: A stable identifier for an image plus the information required to retrieve and render it.
- **Collaborative Session**: A live multi-user session where scene updates and image references must remain consistent.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: In a two-user session, at least 99% of pasted/uploaded images become visible to the other participant within 5 seconds under typical network conditions.
- **SC-002**: After closing and reopening a whiteboard, 99.9% of previously added images display successfully across a representative test set.
- **SC-003**: When failures occur, 100% of failures are user-visible (no silent loss) and offer at least one recovery action.
- **SC-004**: Reported “missing whiteboard images” incidents are reduced by at least 80% compared to the baseline period.

## Assumptions

- The whiteboard feature may be used by authenticated users and by guests (when enabled).
- Users may paste images (clipboard) and upload image files (PNG/JPEG/WebP).
- Network and storage reliability can vary; the system must degrade gracefully.

## Dependencies

- A retrievable image source is available for whiteboards that support image uploads.
- Collaborative sessions distribute scene updates to participants.
