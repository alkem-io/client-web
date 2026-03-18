# Data Model: Whiteboard Image Reliability

Created: 2026-01-21

## Scope

This document describes the client-side data model and invariants required to make Excalidraw whiteboard images reliable across:

- Collaborative sessions (Socket.IO sync)
- Persistence (save + reopen)
- Two entry paths: paste + upload button

## Key Concepts

### Whiteboard Scene (persisted)

A persisted Excalidraw scene consisting of:

- `elements`: Excalidraw elements (including image elements)
- `appState`: Excalidraw app state
- `files`: map of file metadata keyed by file id

Source of truth in UI:

- `excalidrawApi.getSceneElements()`
- `excalidrawApi.getAppState()`
- `excalidrawApi.getFiles()`

### File Id

A stable identifier used as the key in the Excalidraw `files` map.

- Expected to be deterministic for a given file’s contents (digest)
- Must be safe to compute synchronously and without network access

## Entities

### Excalidraw Binary File

Type lineage:

- Excalidraw: `BinaryFileData`
- Alkemio extension: `BinaryFileDataWithOptionalUrl`, `BinaryFileDataWithUrl`

Fields (client-relevant):

- `id: string`
- `mimeType: string`
- `created: number`
- `dataURL?: string` (base64, may be empty in collab payloads)
- `url?: string` (remote storage URL, optional)

### Image Element

An Excalidraw image element references a file via file id.

- `element.type === 'image'`
- element references `fileId` (Excalidraw internal structure)

## States / Lifecycle

### File Availability State

A file can be in one of these states from the perspective of a collaborator:

1. **LocalOnly**
   - Has `dataURL`
   - `url` missing
2. **RemoteOnly**
   - Has `url`
   - `dataURL` missing/empty
3. **Hybrid**
   - Has both `dataURL` and `url`
4. **Unavailable (invalid)**
   - Missing `url`
   - Missing/empty `dataURL`

Invariant: **Unavailable files must not be broadcast or persisted**.

### Entry Paths

#### Paste

- Produces `dataURL` locally via Excalidraw
- Must be uploaded to remote storage when possible to create `url`
- If remote upload is not yet available, collaboration must have a bounded fallback (see contracts)

#### Upload button

Confirmed flow:

1. User selects file
2. Client validates:
   - mime type allowlist: PNG/JPEG/WebP
   - max file size enforced before placement (prefer StorageBucket config)
3. User clicks once to place on canvas

Invariant: oversize/unsupported files are blocked before placement and do not add any scene element.

## Constraints

- Allowed upload formats: PNG/JPEG/WebP
- Max file size is enforced client-side; prefer using StorageBucket config when available
- On blocked upload (oversize/unsupported): show user-visible error and do not mutate the scene

## Integration Points

- Collaboration transport: `Portal.broadcastScene()` (Socket.IO)
- File management: `useWhiteboardFilesManager` + `FileUploader` + `FileDownloader`
- Persistence: whiteboard content serialization / save
