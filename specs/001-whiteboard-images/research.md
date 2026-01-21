# Research: Whiteboard Image Handling (Excalidraw)

Created: 2026-01-21

## Executive Summary

We currently use Excalidraw’s built-in image support (BinaryFiles with `dataURL`) and layer our own file distribution on top for collaboration and persistence by extending file metadata with a `url`.

This feature also supports **two image entry paths**:

- Paste (clipboard)
- Upload via a UI control: select a file, then click once to place the image onto the canvas

Product constraints confirmed during clarification:

- Allowed upload formats: PNG/JPEG/WebP
- Client enforces a maximum upload file size (preferably aligned with StorageBucket config) and blocks oversize uploads before placement (no element/placeholder added)

The observed failures (“pasted images sometimes don’t load for uploader or peers” and “after reopening not all images load”) are strongly consistent with **invalid or missing remote URLs being persisted and/or broadcast**, coupled with collaboration logic that **strips `dataURL` before sending files**, which removes the only fallback that would allow peers to render images.

In addition, the current implementation uses `generateIdForFile` to **perform network upload**. This is on the critical paste/import path and can cause intermittent failures, delays, and race conditions.

## Relevant Code Locations

- File manager: `src/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager.ts`
- Uploader/downloader: `src/domain/common/whiteboard/excalidraw/fileStore/FileUploader.ts`, `FileDownloader.ts`
- Collaboration transport: `src/domain/common/whiteboard/excalidraw/collab/Portal.ts` and `Collab.ts`
- Single-user persistence path: `src/domain/collaboration/whiteboard/WhiteboardDialog/SingleUserWhiteboardDialog.tsx`
- Excalidraw integration points: `src/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper.tsx`, `ExcalidrawWrapper.tsx`

Related (existing) upload limit plumbing:

- Storage config: `src/domain/storage/StorageBucket/useStorageConfig.tsx`, `src/domain/storage/StorageBucket/StorageConfig.graphql`
- Generic upload component: `src/core/ui/upload/FileUpload/FileUpload.tsx`

## Current Data Model

### Excalidraw-native file representation

Excalidraw stores files in a map keyed by file id:

- `BinaryFiles`: `Record<fileId, BinaryFileData>`
- `BinaryFileData`: includes `id`, `mimeType`, `created`, and `dataURL` for images

Excalidraw file IDs are commonly a deterministic digest (SHA-1) of the file contents.

### Alkemio extension (`url`)

We extend file metadata with an optional/required `url`:

- `BinaryFileDataWithOptionalUrl = BinaryFileData & { url?: string }`
- `BinaryFileDataWithUrl = BinaryFileData & { url: string }`

This is used for:

- Remote download on clients that don’t have the `dataURL`
- Long-term persistence (reopen/rejoin)

## Collaboration Flow (Current)

### Outgoing (local user)

- Excalidraw calls our `generateIdForFile` prop.
  - We currently point this to `filesManager.addNewFile(file)`.
  - `addNewFile()` uploads immediately, creates a file object with **both** `url` and `dataURL`, and caches it.

- On every Excalidraw `onChange(elements, appState, files)`, we call:
  - `filesManager.getUploadedFiles(files)`
  - `collabApi.syncScene(elements, uploadedFiles)`

### Transport (Portal)

`Portal.broadcastScene()` intentionally strips `dataURL` for all transmitted files:

- it sets `dataURL` to an empty string for payload files
- peers are expected to fetch the actual bytes via `url`

### Incoming (peers)

- `Collab.reconcileElementsAndLoadFiles(remoteElements, remoteFiles)` calls `filesManager.loadFiles({ files: remoteFiles })`.
- `loadFiles()` downloads files that have **no dataURL** but have a **truthy url**.
- `pushFilesToExcalidraw()` pushes cached files to Excalidraw so images render.

## Persistence Flow (Single-user)

On save, `SingleUserWhiteboardDialog.handleUpdate()` calls:

- `filesManager.convertLocalFilesToRemoteInWhiteboard(state)`
- serializes the returned `files` into the persisted content

Important behavior:

- If conversion fails and `allowFallbackToAttached` is false, conversion logic may **drop files**.
- Dropped files become permanently missing on reopen.

## Primary Failure Modes (Likely Root Causes)

### 1) Empty or missing URL + stripped `dataURL` ⇒ peers cannot render

In collaboration, we always strip `dataURL` when broadcasting. Therefore, if a file is broadcast or stored with:

- `url` missing, or
- `url === ''`

Then peers have no way to fetch image bytes (and we’ve explicitly removed `dataURL`), resulting in missing images.

Key amplifiers:

- `WhiteboardFilesManager.loadFiles()` caches `url` as `''` when absent for dataURL-only files.
- `FileUploader.upload()` returns `url: ''` when `allowFallbackToAttached` is enabled.
- `Portal.broadcastScene()` sends empty `dataURL` regardless of whether the `url` is usable.

Implication for the upload button flow:

- Because upload happens before placement, we must ensure the “file accepted + uploaded” step produces a file with a usable retrieval path (`url` OR a safely broadcastable `dataURL`) before the image is committed to the shared scene.

### 2) Upload work in `generateIdForFile` introduces race conditions and failures

`generateIdForFile` is a hook Excalidraw uses to assign a stable id to a file. It’s called during paste/import.

We currently do network upload in this path:

- slow networks or transient upload failures can delay or break paste/import
- it ties UI correctness to network success
- failures can manifest as intermittent “pasted image didn’t appear”

This is inconsistent with how Excalidraw is typically integrated: the ID generator should be deterministic and side-effect-free.

### 3) Dropping files during conversion on save causes reopen loss

In `convertLocalFilesToRemoteInWhiteboard()`:

- if upload is not possible or fails and fallback is disabled, files are omitted
- the persisted scene loses image references permanently

This matches the symptom “uploaded image was fine, but after closing/opening again some images are missing” when conversion fails for a subset.

### 4) No explicit “URL upgraded” propagation guarantee

Even if a file later uploads successfully, current logic can fail to ensure the new URL is propagated and persisted deterministically.

We rely on future sync cycles to re-send files; but if the first broadcast contained no usable URL, peers can remain broken until a full sync arrives (and even then only if the local side includes the URL).

## Comparison to Upstream Excalidraw Collab (High-level)

Excalidraw’s own app separates:

- scene element synchronization
- file upload/download synchronization

and uses image element status (e.g. “saved”) to signal that collaborators should pull file bytes from storage.

That architecture avoids the “strip dataURL but URL missing” failure by ensuring that an image is only considered “saved/available” once it’s retrievable.

## Observability Gaps

We log conversion and download failures, but we don’t currently produce a clear, structured diagnostic trail for:

- file lifecycle transitions (local → uploading → uploaded → persisted)
- whether a collaborator received a file with usable retrieval info
- whether a persisted scene includes retrievable references for all images

## Working Hypotheses (How to Reproduce)

1) Enable collaboration. User A pastes image while storage bucket is missing/invalid or upload fails.
   - local sees image (because Excalidraw holds `dataURL` locally)
   - broadcast strips `dataURL` and sends `url: ''` or missing
   - peers never load the image

2) Single-user save with intermittent upload failure for one image.
   - conversion drops that file
   - scene persists without it
   - reopen cannot render the missing image

3) Copy/paste under slow network.
   - upload in `generateIdForFile` delays creation and can appear “intermittent”

## Recommended Architecture Direction

- Make file ID generation deterministic and side-effect free.
- Make collaboration/persistence treat images as a two-phase asset:
  - local availability (`dataURL`)
  - remote retrievability (`url`)
- Never broadcast/persist an image in a state where peers cannot retrieve it.

Additionally (from clarified requirements):

- Enforce max upload size before placement; use StorageBucket max when available.
- Enforce upload format allowlist (PNG/JPEG/WebP) consistently across paste and upload.

See `plan.md` for a phased remediation plan.

## Baseline checks (pre-implementation)

Ran on 2026-01-21:

- `pnpm lint`: PASS (one existing warning: unused eslint-disable directive in `src/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper.tsx`)
- `pnpm vitest run --reporter=basic`: FAIL (Vitest startup error: reporter `basic` cannot be loaded)
