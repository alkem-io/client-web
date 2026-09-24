import { useTranslation } from 'react-i18next';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import { MIME_TO_EXT } from './mimeToExt';

const BYTES_IN_MB = 1024 ** 2;

type UseReferenceFileUploadResult = {
  /** Upload callback to pass into a CRD form (`ReferencesEditor.onFileUpload`).
   *  Returns the resolved URL on success, or `null` on failure / no-config. */
  onFileUpload: ((file: File) => Promise<string | null>) | undefined;
  /** File-picker `accept` attribute derived from the bucket's allowed mime types. */
  accept: string | undefined;
  /** Whether the current user is allowed to upload to this bucket. */
  canUpload: boolean;
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
  { temporaryLocation }: UseReferenceFileUploadOptions = {}
): UseReferenceFileUploadResult {
  const { t } = useTranslation();
  const notify = useNotification();
  const [uploadFile] = useUploadFileMutation();

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

  const onFileUpload =
    canUpload && storageConfig
      ? async (file: File): Promise<string | null> => {
          const maxBytes = storageConfig.maxFileSize ?? 0;
          if (maxBytes && file.size > maxBytes) {
            notify(t('components.file-upload.file-size-error', { limit: maxBytes / BYTES_IN_MB }), 'error');
            return null;
          }
          try {
            const { data } = await uploadFile({
              variables: {
                file,
                uploadData: {
                  storageBucketId: storageConfig.storageBucketId,
                  temporaryLocation: isTemporaryLocation,
                },
              },
            });
            const url = data?.uploadFileOnStorageBucket.url;
            if (!url) {
              notify(t('components.file-upload.file-upload-error'), 'error');
              return null;
            }
            notify(t('components.file-upload.file-upload-success'), 'success');
            return url;
          } catch {
            notify(t('components.file-upload.file-upload-error'), 'error');
            return null;
          }
        }
      : undefined;

  return { onFileUpload, accept, canUpload };
}
