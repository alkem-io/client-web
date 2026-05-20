import { error as logError } from '@/core/logging/sentry/log';

/**
 * fetchPreviewImageBlob — D18, 2026-05-18.
 *
 * Fetches a whiteboard preview-image URL (or any image URL) as a `Blob`, used by
 * `TemplateImportConnector` to seed `whiteboardPreviewImages` on prefill so the live
 * callout-from-template flow carries the template's preview image into the new callout's
 * `WHITEBOARD_PREVIEW` Visual via `CalloutFormConnector`'s existing post-create upload step.
 *
 * **Non-fatal**: any failure (no URL, network error, CORS, non-2xx, decode error) resolves to
 * `undefined` — the seed is silently skipped. The form still displays the server URL via the
 * D16 `whiteboardPreviewServerUrl` fallback, and worst case the new callout has no preview
 * image (the pre-fix behaviour — never worse). Failures are logged via the project logger so
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
