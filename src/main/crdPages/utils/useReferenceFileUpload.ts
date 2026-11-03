import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { FileUploadRejection, type RowFileUpload } from '@/crd/lib/fileSelection';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import { MIME_TO_EXT } from './mimeToExt';

const BYTES_IN_MB = 1024 ** 2;

type UseReferenceFileUploadResult = {
  /** Upload callback to pass into a CRD form (`ReferencesEditor.onFileUpload`).
   *  Returns the resolved URL on success, or `null` on failure / no-config. With
   *  `{ silent: true }` it notifies nothing and rejects with a `FileUploadRejection`. */
  onFileUpload: RowFileUpload | undefined;
  /** File-picker `accept` attribute derived from the bucket's allowed mime types. */
  accept: string | undefined;
  /** Whether the current user is allowed to upload to this bucket. */
  canUpload: boolean;
  /** Whether any upload started through this hook has not settled yet. */
  uploading: boolean;
};

type UseReferenceFileUploadOptions = {
  /**
   * When `true`, the file is uploaded to the *temporary* area of the bucket and the
   * server relocates it into the entity's own bucket when the form is saved. Use this
   * while **creating** an entity (its bucket doesn't exist yet, and a plain member has no
   * permanent `FileUpload` on the parent/space bucket). When **editing** an existing
   * entity the user can write to, pass `false` for a direct, permanent upload.
   *
   * When omitted, the value is taken from the resolved `storageConfig.temporaryLocation`
   * (which `useStorageConfig` sets to `false` for edit flows and `true` only for the
   * create flows that scope a temporary bucket). Hardcoding `true` here previously made
   * edit-flow reference uploads land in temporary storage, so they were never propagated
   * to `file_backup_outbox` (issue #10126).
   */
  temporaryLocation?: boolean;
  /**
   * When `false`, a failed (non-silent) upload resolves to `null` without this hook's own error
   * notification, leaving the global error handler's toast as the only one.
   */
  ownFailureToast?: boolean;
};

/**
 * Wires a CRD reference editor to the standard storage-bucket upload path.
 * Mirrors the MUI behaviour from `FormikFileInput` + `FileUploadButton` but
 * exposes only a plain `Promise<string | null>` callback so the presentational
 * layer (`src/crd/forms/references/ReferencesEditor`) stays free of Apollo /
 * domain imports.
 */
export function useReferenceFileUpload(
  storageConfig: StorageConfig | undefined,
  { temporaryLocation, ownFailureToast = true }: UseReferenceFileUploadOptions = {}
): UseReferenceFileUploadResult {
  const { t } = useTranslation();
  const notify = useNotification();
  const [uploadFile] = useUploadFileMutation();
  const [unsettled, setUnsettled] = useState(0);

  // Fall back to the value resolved by `useStorageConfig` (defaults to `false` for edit
  // flows) rather than hardcoding `true`, so reference uploads on existing entities are
  // permanent and get propagated to `file_backup_outbox` (issue #10126).
  const isTemporaryLocation = temporaryLocation ?? storageConfig?.temporaryLocation ?? false;

  const canUpload = Boolean(storageConfig?.canUpload);
  const accept = storageConfig
    ? (storageConfig.allowedMimeTypes ?? [])
        .map(mime => MIME_TO_EXT[mime])
        .filter(Boolean)
        .join(',') || undefined
    : undefined;

  // A silent upload (one file of a multi-file selection) raises no notification of its own and
  // none from the global error handler: it rejects with the reason, which the editor reports once.
  // Its type check is the server's: the declared MIME type against the bucket's allowed list.
  const onFileUpload: RowFileUpload | undefined =
    canUpload && storageConfig
      ? async (file, options) => {
          const silent = Boolean(options?.silent);
          const allowedMimeTypes = storageConfig.allowedMimeTypes ?? [];
          if (silent && allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.type)) {
            throw new FileUploadRejection({ kind: 'type' });
          }
          const maxBytes = storageConfig.maxFileSize ?? 0;
          if (maxBytes && file.size > maxBytes) {
            if (silent) throw new FileUploadRejection({ kind: 'size', maxBytes });
            notify(t('components.file-upload.file-size-error', { limit: maxBytes / BYTES_IN_MB }), 'error');
            return null;
          }
          setUnsettled(count => count + 1);
          let url: string | undefined;
          try {
            const { data } = await uploadFile({
              variables: {
                file,
                uploadData: {
                  storageBucketId: storageConfig.storageBucketId,
                  temporaryLocation: isTemporaryLocation,
                },
              },
              ...(silent ? { context: { skipGlobalErrorHandler: true } } : {}),
            });
            url = data?.uploadFileOnStorageBucket.url;
          } catch {
            if (silent) throw new FileUploadRejection({ kind: 'failed' });
            if (ownFailureToast) notify(t('components.file-upload.file-upload-error'), 'error');
            return null;
          } finally {
            setUnsettled(count => count - 1);
          }
          if (!url) {
            if (silent) throw new FileUploadRejection({ kind: 'failed' });
            notify(t('components.file-upload.file-upload-error'), 'error');
            return null;
          }
          if (!silent) notify(t('components.file-upload.file-upload-success'), 'success');
          return url;
        }
      : undefined;

  return { onFileUpload, accept, canUpload, uploading: unsettled > 0 };
}
