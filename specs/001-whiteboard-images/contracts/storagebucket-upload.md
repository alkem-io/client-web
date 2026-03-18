# Contract: StorageBucket Upload for Whiteboard Images

Created: 2026-01-21

## Scope

Documents how the client uploads image files for whiteboards using the existing GraphQL StorageBucket upload mutation.

## GraphQL

Mutation used:

- `uploadFileOnStorageBucket(uploadData: { storageBucketId }, file)`

Expected result:

- `id: string`
- `url: string`

Client code paths:

- Whiteboard: `src/domain/common/whiteboard/excalidraw/fileStore/FileUploader.ts`
- Other upload UI (reference): `src/core/ui/upload/FileUpload/FileUpload.tsx`

## Constraints

- Allowed formats: PNG/JPEG/WebP
- Client-side max file size enforcement:
  - Prefer `storageConfig.maxFileSize` (bytes) when available
  - Oversize files are blocked before placement and must not mutate the whiteboard scene

## Error handling

- If StorageBucket is missing for the whiteboard:
  - uploads are not supported; show a clear user-facing message
  - do not commit an image element via upload button
- If mutation fails:
  - show a recoverable error state (retry) without losing the rest of the scene

## Observability

Log failures with `TagCategoryValues.WHITEBOARD` labels:

- upload-no-storage-bucket
- upload-failed
