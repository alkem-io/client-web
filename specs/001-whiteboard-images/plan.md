# Implementation Plan: Whiteboard Image Reliability

**Branch**: `001-whiteboard-images` | **Date**: 2026-01-21 | **Spec**: specs/001-whiteboard-images/spec.md
**Input**: Feature specification from `specs/001-whiteboard-images/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Improve reliability of Excalidraw whiteboard images for paste and upload so collaborators consistently see images, and images persist across reopen.

Approach: treat images as a two-phase asset (local bytes via `dataURL`, remote retrievability via `url`) and eliminate states where we broadcast/persist images without a usable retrieval path.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript ~5.8, React 19.2, Vite 7
**Primary Dependencies**: `@alkemio/excalidraw`, Apollo Client, MUI
**Storage**: Alkemio StorageBucket via GraphQL `uploadFileOnStorageBucket`; whiteboard content stored as Excalidraw JSON (elements/appState/files)
**Testing**: Vitest + Testing Library
**Target Platform**: Browser (SPA)
**Project Type**: Web application (Vite SPA)
**Performance Goals**: Meet spec SCs (p99 visibility within 5s for two-user session); avoid blocking UI on uploads; avoid broadcasting large `dataURL` unless `url` missing
**Constraints**:
- Upload button flow is “select file → click once to place on canvas”
- Client enforces maximum upload file size (value from StorageBucket config when available) and blocks oversize before placement
- Allowed upload formats: PNG, JPEG, WebP
- No silent loss: failures are visible and recoverable
**Scale/Scope**: Multi-user real-time sessions (2+ users), bursts of multiple images; tolerate slow/unstable networks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Domain boundaries respected: whiteboard/file logic stays under `src/domain/common/whiteboard` and `src/domain/collaboration/whiteboard`; UI shells remain thin.
- React 19 discipline: avoid side effects in render; keep long-running upload/download out of synchronous render paths.
- GraphQL fidelity: use generated hooks (`useUploadFileMutation`, `useStorageConfig`, etc.); no raw Apollo calls.
- State/effects isolated: file caching and upload/download orchestration stays in dedicated modules.
- i18n: user-visible strings must use `react-i18next` keys.

GATE status: PASS (no violations required for the planned changes).

## Project Structure

### Documentation (this feature)

```text
specs/001-whiteboard-images/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
src/
├── domain/
│   ├── common/whiteboard/excalidraw/
│   │   ├── collab/
│   │   ├── fileStore/
│   │   ├── useWhiteboardFilesManager.ts
│   │   └── …
│   └── collaboration/whiteboard/
│       ├── WhiteboardDialog/
│       ├── WhiteboardVisuals/
│       ├── guestAccess/
│       └── …
└── core/
    ├── apollo/generated/
    └── ui/upload/

specs/001-whiteboard-images/ (docs + plan artifacts)
```

**Structure Decision**: Web application (single Vite SPA repository).

## Phase 0: Research (complete)

Input artifact: `specs/001-whiteboard-images/research.md`.

Key verified findings:
- Collaboration transport (`Portal.broadcastScene`) strips `dataURL` for all files, so any file broadcast/persisted without a usable `url` becomes unrecoverable for peers.
- Some flows can produce `url` missing/empty (e.g., missing StorageBucket with fallback enabled, or transient upload failures), leading to intermittent missing images.
- Single-user save path can drop files during conversion, causing permanent loss on reopen.

## Phase 1: Design

Design goals:
- Deterministic, side-effect-free file ID generation
- Always maintain at least one retrieval path for collaborators:
  - Prefer `url` + stripped `dataURL` when remote upload succeeded
  - Fall back to broadcasting `dataURL` when `url` is missing (bounded by max size)
- Never drop files silently during persistence; preserve scene integrity and surface recoverable errors

Design changes (high level):
1. Update collab broadcast behavior to only strip `dataURL` when `url` is present.
2. Update file manager APIs/types so collaboration can handle files with optional `url`.
3. Align upload limits with StorageBucket config and enforce before placement.
4. Ensure persistence paths retain files (or preserve placeholders) and provide explicit failure UX.

Constitution re-check (post-design): PASS.

## Phase 2: Planning (implementation outline)

1. Refactor collab file payload typing (`BinaryFilesWithOptionalUrl`) end-to-end.
2. Adjust broadcast logic to keep `dataURL` when `url` missing.
3. Improve file lifecycle handling:
   - cache consistency
   - avoid dropping files on conversion
   - retry strategy for upload failures (explicit user action)
4. Add/extend tests around file payload transforms and failure cases.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
