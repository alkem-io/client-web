# Contract: Whiteboard Collaboration Files Payload

Created: 2026-01-21

## Scope

Defines the client-side contract for how image file metadata is broadcast between collaborators over the whiteboard Socket.IO channel.

## Payload Shape

The collaboration layer broadcasts scene updates containing:

- `elements`: ordered Excalidraw elements
- `files`: map keyed by `fileId`

### File entry

Each `files[fileId]` is Excalidraw `BinaryFileData` plus an optional `url`:

- `id: string`
- `mimeType: string`
- `created: number`
- `dataURL: string` (may be empty)
- `url?: string`

## Invariants

1. A file must be renderable by receivers.

A receiver can render the image if it has at least one retrieval path:

- `url` is present and non-empty, OR
- `dataURL` is present and non-empty

Therefore: **Do not broadcast files where both are missing/empty**.

2. Bandwidth optimization is allowed only when `url` is usable.

- If `url` is present and non-empty: it is allowed to broadcast with `dataURL` replaced by `''`.
- If `url` is missing/empty: `dataURL` must not be stripped.

3. Payloads must tolerate mixed states.

Within a single update, some files may be `RemoteOnly` (url-only) and some may be `LocalOnly` (dataURL-only), but the receiver must never be left with an unrecoverable reference.

## Failure handling expectations

- If a file’s `url` download fails, the receiver should surface a recoverable state (retry) and must not silently drop the element.
- If a sender cannot upload and therefore cannot provide `url`, the sender must either:
  - provide a bounded `dataURL` fallback (size-limited), or
  - block placement/commit (upload button flow)

## Related code

- Broadcast: `src/domain/common/whiteboard/excalidraw/collab/Portal.ts`
- Reconcile + load: `src/domain/common/whiteboard/excalidraw/collab/Collab.ts`
- File services: `src/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager.ts`
