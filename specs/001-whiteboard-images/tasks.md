# Tasks: Whiteboard Image Reliability

**Input**: Design documents in `specs/001-whiteboard-images/` (plan.md, spec.md, research.md, data-model.md, contracts/)

## Phase 1: Setup (Shared)

**Purpose**: Confirm baseline health and establish a safe starting point.

- [X] T001 Run baseline checks (`pnpm lint` + `pnpm vitest run --reporter=basic`) and note any pre-existing failures in specs/001-whiteboard-images/research.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared primitives and contracts required by all user stories.

- [X] T002 Create file availability helpers in src/domain/common/whiteboard/excalidraw/fileStore/fileAvailability.ts (e.g., isUsableUrl, isUsableDataUrl, isFileRenderable, shouldStripDataUrlForBroadcast)
- [X] T003 [P] Create file validation helpers in src/domain/common/whiteboard/excalidraw/fileStore/fileValidation.ts (PNG/JPEG/WebP allowlist + max file size enforcement)
- [X] T004 [P] Add i18n strings for image validation/failure states in src/core/i18n/en/translation.en.json (oversize, unsupported type, upload failed, download failed, retry)
- [X] T005 [P] Extend whiteboard GraphQL fragments to expose storage bucket constraints in src/domain/collaboration/whiteboard/containers/WhiteboardQueries.graphql (storageBucket.allowedMimeTypes, storageBucket.maxFileSize)
- [X] T006 [P] Extend public whiteboard query to expose storage bucket constraints in src/domain/collaboration/whiteboard/guestAccess/GetPublicWhiteboard.graphql (storageBucket.allowedMimeTypes, storageBucket.maxFileSize)
- [X] T007 Regenerate GraphQL types/hooks after fragment changes (`pnpm codegen`) and fix resulting type errors (see codegen.yml)
- [X] T008 Update whiteboard TS models to include storage bucket constraints in src/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog.tsx and src/domain/collaboration/whiteboard/WhiteboardDialog/SingleUserWhiteboardDialog.tsx
- [X] T009 Refactor Whiteboard file cache typing to allow optional URL in src/domain/common/whiteboard/excalidraw/fileStore/WhiteboardFileCache.ts (store BinaryFileDataWithOptionalUrl, avoid forcing url: '')
- [X] T010 Update file types and exports to standardize optional URL across collab/persistence in src/domain/common/whiteboard/excalidraw/types.ts (BinaryFileDataWithOptionalUrl as primary, keep BinaryFileDataWithUrl where truly required)
- [X] T011 [P] Add unit tests for file availability + validation helpers in src/domain/common/whiteboard/excalidraw/tests/fileAvailability.spec.ts and src/domain/common/whiteboard/excalidraw/tests/fileValidation.spec.ts
- [X] T012 Update useWhiteboardFilesManager configuration surface to accept allowedMimeTypes/maxFileSize and pass through to FileUploader in src/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager.ts and src/domain/common/whiteboard/excalidraw/fileStore/FileUploader.ts

**Checkpoint**: Shared primitives and data contracts ready.

---

## Phase 3: User Story 1 - Collaborators see pasted/uploaded images (Priority: P1) 🎯 MVP

**Goal**: Images added by one participant become visible to other participants reliably.

**Independent Test**: Two browsers in the same session paste/upload multiple images; both see them without refresh (see specs/001-whiteboard-images/quickstart.md).

### Tests for User Story 1

- [X] T013 [P] [US1] Add unit tests for broadcast payload rules (strip dataURL only when url is usable) in src/domain/common/whiteboard/excalidraw/collab/tests/portalBroadcastScene.spec.ts

### Implementation for User Story 1

- [X] T014 [US1] Change collaboration file payload types to allow optional URL end-to-end in src/domain/common/whiteboard/excalidraw/collab/Collab.ts and src/domain/common/whiteboard/excalidraw/collab/useCollab.ts
- [X] T015 [US1] Update Portal.broadcastScene to conditionally strip dataURL only when url is usable and to never broadcast unrecoverable files in src/domain/common/whiteboard/excalidraw/collab/Portal.ts
- [X] T016 [US1] Fix loadFiles caching to preserve optional URL (do not coerce missing URL to empty string) in src/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager.ts
- [ ] T017 [US1] Change getUploadedFiles to return broadcastable files without requiring remote upload success (attempt upload when possible; otherwise include dataURL) in src/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager.ts
- [ ] T018 [US1] Make addNewFile side-effect free: compute deterministic fileId without network, cache local file data (id/mimeType/created/dataURL) and return id in src/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager.ts
- [ ] T019 [US1] Move upload off the generateIdForFile path by asynchronously upgrading cached files to include url, and ensure subsequent sync cycles broadcast the upgraded url in src/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager.ts
- [ ] T020 [US1] Enforce client-side file type + max size validation before placement (reject oversize/unsupported with user-visible message) in src/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper.tsx and src/domain/common/whiteboard/excalidraw/ExcalidrawWrapper.tsx
- [ ] T021 [US1] Ensure upload failures don’t cause silent loss during collaboration: keep dataURL fallback (bounded) until url is available in src/domain/common/whiteboard/excalidraw/collab/Portal.ts

**Checkpoint**: US1 complete; validate scenarios 1–3 in specs/001-whiteboard-images/quickstart.md.

---

## Phase 4: User Story 2 - Images persist across closing and reopening (Priority: P2)

**Goal**: Images remain visible after close/reopen and reload.

**Independent Test**: Add images (paste + upload), close whiteboard, reopen, and verify all render (see specs/001-whiteboard-images/quickstart.md).

### Tests for User Story 2

- [X] T022 [P] [US2] Add unit tests to ensure persistence conversion never drops files and preserves a retrieval path (url or dataURL) in src/domain/common/whiteboard/excalidraw/tests/convertLocalFilesToRemoteInWhiteboard.spec.ts

### Implementation for User Story 2

- [ ] T023 [US2] Update convertLocalFilesToRemoteInWhiteboard to never drop files; on upload failures, preserve local dataURL (or block save with explicit error if neither dataURL nor url exists) in src/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager.ts
- [ ] T024 [US2] Surface conversion failures during single-user save without losing the rest of the scene in src/domain/collaboration/whiteboard/WhiteboardDialog/SingleUserWhiteboardDialog.tsx
- [ ] T025 [US2] Surface conversion failures during collaborative close/save without losing the rest of the scene in src/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog.tsx

**Checkpoint**: US2 complete; validate scenarios 5–6 in specs/001-whiteboard-images/quickstart.md.

---

## Phase 5: User Story 3 - Failures are visible and recoverable (Priority: P3)

**Goal**: Upload/download failures are visible, don’t silently corrupt the scene, and offer recovery actions.

**Independent Test**: Force upload/download failures; UI shows clear message and Retry; scene remains intact (see specs/001-whiteboard-images/quickstart.md).

### Tests for User Story 3

- [X] T026 [P] [US3] Add unit tests for retry state transitions (upload/download failure → retry → success) in src/domain/common/whiteboard/excalidraw/tests/fileRetry.spec.ts

### Implementation for User Story 3

- [X] T027 [US3] Extend FileDownloader to return structured failure info and support targeted retries in src/domain/common/whiteboard/excalidraw/fileStore/FileDownloader.ts
- [X] T028 [US3] Extend FileUploader to return structured failure info (no storage bucket, upload failed) for UI consumption in src/domain/common/whiteboard/excalidraw/fileStore/FileUploader.ts
- [X] T029 [US3] Extend WhiteboardFilesManager to track failed uploads/downloads and expose retry APIs in src/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager.ts
- [X] T030 [US3] Add a user-visible banner/action for missing images with Retry (download and/or upload) in src/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog.tsx and src/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialogFooter.tsx
- [ ] T031 [US3] Add Sentry logging for key lifecycle/failure events without logging image content (labels per spec/contracts) in src/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager.ts and src/domain/common/whiteboard/excalidraw/collab/Portal.ts

**Checkpoint**: US3 complete; validate scenarios 3 and 6 plus failure injection checks in specs/001-whiteboard-images/quickstart.md.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ensure quality gates (lint, tests, observability) and update docs.

- [ ] T032 [P] Update specs/001-whiteboard-images/quickstart.md with any new UI strings/steps introduced during implementation
- [ ] T033 Run full quality gates (`pnpm lint` + `pnpm vitest run --reporter=basic`) and fix only feature-related regressions (see package.json)

---

## Dependencies & Execution Order

- Phase order: Setup (Phase 1) → Foundational (Phase 2) → US1 (Phase 3) → US2 (Phase 4) → US3 (Phase 5) → Polish (Phase 6)
- User story order (recommended): US1 → US2 → US3 (matches P1/P2/P3 priorities)

## Parallel Execution Examples

### US1

- Workstream A: T015 (Portal broadcast rules) in src/domain/common/whiteboard/excalidraw/collab/Portal.ts
- Workstream B: T018–T020 (local ID generation + validation UX) in src/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager.ts and wrappers
- Workstream C: T013 tests in src/domain/common/whiteboard/excalidraw/collab/tests/portalBroadcastScene.spec.ts

### US2

- Workstream A: T023 persistence conversion in src/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager.ts
- Workstream B: T022 tests in src/domain/common/whiteboard/excalidraw/tests/convertLocalFilesToRemoteInWhiteboard.spec.ts

### US3

- Workstream A: T027–T029 retry plumbing in fileStore + manager
- Workstream B: T030 UI banner in whiteboard dialog/footer
- Workstream C: T026 tests in src/domain/common/whiteboard/excalidraw/tests/fileRetry.spec.ts

## Implementation Strategy

- MVP first: complete Phases 1–3 (US1) and validate scenarios 1–3 in specs/001-whiteboard-images/quickstart.md.
- Incremental delivery: add US2, validate reopen reliability; add US3, validate visible + recoverable failures.
