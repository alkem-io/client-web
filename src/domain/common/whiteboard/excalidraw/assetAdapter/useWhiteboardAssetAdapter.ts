import type { FileId } from '@excalidraw-yjs/excalidraw/dist/types/element/src/types';
import type { AssetAdapter, BinaryFileData } from '@excalidraw-yjs/excalidraw/dist/types/excalidraw/types';
import { useContext, useRef, useState } from 'react';
import { useUploadFileMutation, useWhiteboardAssetDocumentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { encodeToBase64 } from '@/core/utils/encodeToBase64';
import { GuestSessionContext } from '@/domain/collaboration/whiteboard/guestAccess/context/GuestSessionContext';
import { dataUrlToFile, fetchFileToDataURL } from '../fileStore/fileConverters';

type UseWhiteboardAssetAdapterParams = {
  /** The whiteboard's storage bucket — where image bytes are persisted. */
  storageBucketId: string;
};

export type WhiteboardAssetAdapter = {
  /** Stable adapter handed straight to `<Excalidraw assetAdapter>` (identity never changes). */
  assetAdapter: AssetAdapter;
  /** Last user-facing upload (store) failure message, if any. */
  uploadError: string | undefined;
  /** Last user-facing resolve failure message, if any. */
  resolveError: string | undefined;
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
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [resolveError, setResolveError] = useState<string | undefined>(undefined);

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
        try {
          const upload = await dataUrlToFile(file.dataURL, file.id, file.mimeType);
          const { data } = await deps.uploadFile({
            variables: { file: upload, uploadData: { storageBucketId: deps.storageBucketId } },
          });
          const documentId = data?.uploadFileOnStorageBucket?.id;
          if (!documentId) {
            throw new Error('Upload returned no document id');
          }
          setUploadError(undefined);
          return documentId;
        } catch (e) {
          setUploadError(e instanceof Error ? e.message : 'Image upload failed');
          throw e;
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
          setResolveError(e instanceof Error ? e.message : 'Image load failed');
          throw e;
        }
      },
    };
  }

  return { assetAdapter: adapterRef.current, uploadError, resolveError };
}
