import { useTranslation } from 'react-i18next';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';

const BYTES_IN_MB = 1024 ** 2;

// Mirror of `MIME_TO_EXT` in `src/core/ui/upload/FileUpload/FileUpload.tsx`. Some
// browsers fail to map mime types to file-picker extensions reliably, so we
// resolve them explicitly here.
const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.oasis.opendocument.spreadsheet': '.ods',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.oasis.opendocument.text': '.odt',
  'text/calendar': '.ics',
  'image/bmp': '.bmp',
  'image/jpg': '.jpg',
  'image/jpeg': '.jpg,.jpeg',
  'image/x-png': '.png',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.ms-powerpoint.presentation.macroEnabled.12': '.pptm',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow': '.ppsx',
  'application/vnd.ms-powerpoint.slideshow.macroEnabled.12': '.ppsm',
  'application/vnd.openxmlformats-officedocument.presentationml.template': '.potx',
  'application/vnd.ms-powerpoint.template.macroEnabled.12': '.potm',
  'application/vnd.oasis.opendocument.presentation': '.odp',
};

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
   * Defaults to `true` (the safe create-flow value).
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
  { temporaryLocation = true }: UseReferenceFileUploadOptions = {}
): UseReferenceFileUploadResult {
  const { t } = useTranslation();
  const notify = useNotification();
  const [uploadFile] = useUploadFileMutation();

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
                  temporaryLocation,
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
