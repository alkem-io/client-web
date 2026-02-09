# Quickstart: Whiteboard Image Reliability

Created: 2026-01-21

## Goal

Verify that pasted and uploaded images:

- appear reliably for all collaborators
- persist across close/reopen
- fail visibly and recoverably (no silent loss)

## Preconditions

- Run the client: `pnpm install` then `pnpm start`
- Backend available at the configured `VITE_APP_ALKEMIO_DOMAIN` (GraphQL + collab server)
- A whiteboard with a valid StorageBucket configured (typical whiteboard profile)

## Scenarios

### 1) Two-user collaboration (paste)

1. Open the same whiteboard session in two browsers (or incognito + normal).
2. In Browser A, paste 3 images (small PNG/JPEG/WebP).
3. Confirm Browser B shows each image without manual refresh.

Expected:

- Images render in both browsers.
- No silent missing images.

### 2) Two-user collaboration (upload button)

1. In Browser A, use the upload control to select a PNG/JPEG/WebP.
2. Click once on the canvas to place it.
3. Confirm Browser B shows the image without refresh.

Expected:

- Placement occurs only after the user clicks.
- Collaborators see the image.

### 3) Oversize file is blocked before placement

1. Choose an image larger than the client-enforced max file size.
2. Attempt to upload.

Expected:

- Clear user-visible error.
- No image element or placeholder is added to the scene.

### 4) Unsupported format blocked

1. Choose a non-image or unsupported image type (e.g., SVG, GIF, PDF).
2. Attempt to upload.

Expected:

- Clear user-visible error.
- No scene mutation.

### 5) Reopen persistence

1. Add 2 images (mix paste + upload).
2. Close the whiteboard.
3. Reopen the same whiteboard.

Expected:

- All previously added images render.

### 6) Degraded network (manual)

1. In Browser A, simulate slow network / temporary offline.
2. Add images in quick succession.

Expected:

- Images eventually appear for all participants or show an explicit “not available yet / retry” state.
- No silent disappearance.
### 7) Retry failed image downloads

1. Open a whiteboard containing images.
2. Simulate network failure before images load (e.g., via DevTools throttling or blocking requests).
3. Observe the failure banner appears at the top of the whiteboard dialog.
4. Restore network connectivity.
5. Click the "Retry" button in the banner.

Expected:

- Failed images attempt to reload.
- On success, images render and banner disappears.
- On continued failure, banner remains with updated count.

### 8) Validation error notifications

1. Try to paste or upload an image larger than the allowed max size (e.g., > 5MB).
2. Try to paste or upload an unsupported file type (e.g., SVG, GIF, PDF).

Expected:

- User-visible notification appears with appropriate error message.
- No image element is added to the canvas.
- Whiteboard state is not corrupted.
## Troubleshooting hints

- Check client logs / Sentry tags for `TagCategoryValues.WHITEBOARD` events and labels:
  - `upload-no-storage-bucket` - whiteboard lacks storage bucket configuration
  - `upload-failed` - server-side upload failure
  - `download-fetch-failed` - image download failed
  - `download-retry-outcome` - retry attempt results
  - `convert-to-remote-failures` - files that failed remote conversion
  - `broadcast-files-skipped` - files skipped during broadcast (no usable path)
- Confirm StorageBucket config includes `maxFileSize` and `allowedMimeTypes` when enforcing limits.
- If images show as blank placeholders, check network tab for failed image requests.
- The failure banner only shows when `filesManager.getFailureState().hasFailures` is true.

## New Implementation Details

### Side-Effect Free File Adding

When pasting or uploading images, `addNewFile` now immediately creates a local file entry with a dataURL without making network calls. This ensures instant feedback for the user. The file is then asynchronously upgraded to a remote URL via `upgradeFilesToRemote`.

### DataURL Fallback for Broadcasts

When broadcasting to peers, files without a remote URL will include their dataURL so collaborators can still render the image. This prevents silent image loss during upload failures.

### Failure State Tracking

Both `FileUploader` and `FileDownloader` now track failed operations with structured failure records. The `WhiteboardFilesManager` exposes this via:

- `getFailureState()` - returns current failures
- `retryFailedDownloads()` - attempts to retry failed downloads
- `clearFailures()` - clears failure records

### UI Integration

The `WhiteboardImageFailureBanner` component displays at the top of whiteboard dialogs when failures exist, with a Retry button for recoverable failures.
