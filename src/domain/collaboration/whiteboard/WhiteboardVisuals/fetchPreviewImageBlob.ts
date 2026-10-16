import { error as logError } from '@/core/logging/sentry/log';

/**
 * fetchPreviewImageBlob — D18, 2026-05-18.
 *
 * Fetches a whiteboard preview-image URL (or any image URL) as a `Blob`. Used to seed
 * `whiteboardPreviewImages` on template prefill, which the update paths upload when a template
 * replaces an existing whiteboard's content (on create the server copies the visuals itself),
 * and by `generateCardFromPreview` to derive a CARD from a stored preview.
 *
 * **Non-fatal**: any failure (no URL, network error, CORS, non-2xx, decode error) resolves to
 * `undefined` — the seed is silently skipped. The form still displays the server URL via the
 * D16 `whiteboardPreviewServerUrl` fallback, and worst case the whiteboard keeps its old
 * preview image. Failures are logged via the project logger so
 * they're discoverable in Sentry but don't surface to the user.
 */
export async function fetchPreviewImageBlob(url: string | undefined): Promise<Blob | undefined> {
  if (!url) return undefined;
  try {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      logError(new Error(`fetchPreviewImageBlob: HTTP ${response.status} ${response.statusText} for ${url}`));
      return undefined;
    }
    return await response.blob();
  } catch (err) {
    logError(new Error('fetchPreviewImageBlob: fetch failed', { cause: err as Error }));
    return undefined;
  }
}
