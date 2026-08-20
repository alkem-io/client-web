import type { FileId } from '@excalidraw-yjs/excalidraw/dist/types/element/src/types';
import type { AssetAdapter, BinaryFileData } from '@excalidraw-yjs/excalidraw/dist/types/excalidraw/types';
import { useContext, useRef, useState } from 'react';
import { useUploadFileMutation, useWhiteboardAssetDocumentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { encodeToBase64 } from '@/core/utils/encodeToBase64';
import { GuestSessionContext } from '@/domain/collaboration/whiteboard/guestAccess/context/GuestSessionContext';
import { dataUrlToFile, fetchFileToDataURL } from '../fileStore/fileConverters';

/**
 * Upload host timeout. A `store` whose upload has not settled within this window
 * is aborted and rejected, so a hung transport can never stall the flush-gated
 * save/close path (an unsettled `store` would block it indefinitely). 60s covers
 * a large image on a slow connection without leaving the editor blocked forever.
 */
export const UPLOAD_TIMEOUT_MS = 60_000;
/** Stable message a timed-out upload rejects with (also surfaced as `uploadError`). */
export const UPLOAD_TIMEOUT_MESSAGE = 'Image upload timed out';

type UseWhiteboardAssetAdapterParams = {
  /** The whiteboard's storage bucket — where image bytes are persisted. */
  storageBucketId: string;
};

/**
 * A single asset-operation failure, as an EVENT: a fresh object is emitted per failure, so
 * a host effect keyed on it re-fires on EVERY failure — even two identical messages in a row.
 * Plain string state would bail out (React `Object.is`) on a repeat identical message and the
 * host would silently drop the second (and later) notification. Hosts translate their own
 * user-facing copy; `message` is a diagnostic carried alongside the event.
 */
export type AssetOperationError = { message: string };

export type WhiteboardAssetAdapter = {
  /** Stable adapter handed straight to `<Excalidraw assetAdapter>` (identity never changes). */
  assetAdapter: AssetAdapter;
  /** The most recent upload (store) failure — a fresh object per failure, or `undefined`. */
  uploadError: AssetOperationError | undefined;
  /** The most recent resolve failure — a fresh object per failure, or `undefined`. */
  resolveError: AssetOperationError | undefined;
};

/**
 * The single asset boundary for whiteboard images. The editor's shared Yjs doc
 * holds only `fileId -> opaque locator` (never bytes, never a URL); this hook
 * moves the bytes:
 *   - `store` uploads a file's bytes to the whiteboard's storage bucket and
 *     returns the storage **document id** as the locator. The URL never enters Yjs.
 *   - `resolve` turns a locator back into bytes by looking up the document's
 *     current URL and fetching it (guest-name-aware for public whiteboards).
 *
 * A failed `store` throws so the editor's publish flow can never treat an
 * unpersisted image as saved; a failed `resolve` throws so a missing image is
 * surfaced rather than silently rendered blank.
 *
 * The returned `assetAdapter` has a **stable identity** across renders — a fresh
 * object would retrigger the editor's asset effects. This repo forbids manual
 * `useMemo`/`useCallback` (React Compiler), so a ref-held adapter reads its latest
 * dependencies from `depsRef` instead of being rebuilt.
 */
export function useWhiteboardAssetAdapter({
  storageBucketId,
}: UseWhiteboardAssetAdapterParams): WhiteboardAssetAdapter {
  const [uploadFile] = useUploadFileMutation();
  const [fetchDocument] = useWhiteboardAssetDocumentLazyQuery();
  const guestName = useContext(GuestSessionContext)?.guestName;
  const [uploadError, setUploadError] = useState<AssetOperationError | undefined>(undefined);
  const [resolveError, setResolveError] = useState<AssetOperationError | undefined>(undefined);

  // Latest dependencies, read by the stable operations below. Assigning during
  // render is safe here: `depsRef` never feeds render output, it only carries the
  // current closures/ids into the (identity-stable) adapter.
  const depsRef = useRef({ storageBucketId, guestName, uploadFile, fetchDocument });
  depsRef.current = { storageBucketId, guestName, uploadFile, fetchDocument };

  const adapterRef = useRef<AssetAdapter | null>(null);
  if (!adapterRef.current) {
    adapterRef.current = {
      store: async (file: BinaryFileData): Promise<string> => {
        const deps = depsRef.current;
        // Bound the upload so a hung transport can never leave `store` pending
        // forever — an unsettled `store` would stall the flush-gated save/close
        // indefinitely. Two independent mechanisms cover it: an AbortController
        // cancels the browser fetch, and a timer race rejects even if a transport
        // ignores the signal. Whichever settles first wins; a late upload
        // resolution after the deadline is dropped by the race, so a timed-out
        // store can never turn into a success or publish a locator.
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;
        const clearUploadTimer = () => {
          if (timer !== undefined) {
            clearTimeout(timer);
            timer = undefined;
          }
        };
        try {
          const upload = await dataUrlToFile(file.dataURL, file.id, file.mimeType);
          const deadline = new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
              controller.abort();
              reject(new Error(UPLOAD_TIMEOUT_MESSAGE));
            }, UPLOAD_TIMEOUT_MS);
          });
          const { data } = await Promise.race([
            deps.uploadFile({
              variables: { file: upload, uploadData: { storageBucketId: deps.storageBucketId } },
              context: { fetchOptions: { signal: controller.signal } },
            }),
            deadline,
          ]);
          const documentId = data?.uploadFileOnStorageBucket?.id;
          if (!documentId) {
            throw new Error('Upload returned no document id');
          }
          setUploadError(undefined);
          return documentId;
        } catch (e) {
          controller.abort();
          setUploadError({ message: e instanceof Error ? e.message : 'Image upload failed' });
          throw e;
        } finally {
          clearUploadTimer();
        }
      },
      resolve: async (fileId: FileId, locator: string): Promise<BinaryFileData> => {
        const deps = depsRef.current;
        try {
          const { data } = await deps.fetchDocument({ variables: { documentId: locator } });
          const document = data?.lookup.document;
          if (!document?.url) {
            throw new Error(`No stored document for locator ${locator}`);
          }
          const headers: Record<string, string> = {};
          if (deps.guestName) {
            headers['x-guest-name'] = encodeToBase64(deps.guestName);
          }
          const dataURL = await fetchFileToDataURL(document.url, headers);
          setResolveError(undefined);
          return {
            id: fileId,
            dataURL,
            mimeType: document.mimeType as BinaryFileData['mimeType'],
            created: Date.now(),
          };
        } catch (e) {
          setResolveError({ message: e instanceof Error ? e.message : 'Image load failed' });
          throw e;
        }
      },
    };
  }

  return { assetAdapter: adapterRef.current, uploadError, resolveError };
}
