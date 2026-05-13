import { useTranslation } from 'react-i18next';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useOptionalStorageConfigContext } from '@/domain/storage/StorageBucket/StorageConfigContext';

type MarkdownEditorIntegrationOptions = {
  /** When true, uploads use the temporary location (cleaned up server-side if the form is abandoned). */
  temporaryLocation?: boolean;
};

type MarkdownEditorIntegration = {
  onImageUpload?: (file: File) => Promise<string>;
  iframeAllowedUrls: string[];
  onError: (message: string) => void;
};

/**
 * Glue hook for `MarkdownEditor` / `CollaborativeMarkdownEditor` consumers.
 *
 * Returns the props the CRD editor needs to enable image upload (storage-bucket mutation)
 * and iframe embed validation (platform config). When no storage bucket is in scope, the
 * upload callback is omitted and the editor renders the image dialog in URL-only mode.
 */
export const useMarkdownEditorIntegration = (
  options: MarkdownEditorIntegrationOptions = {}
): MarkdownEditorIntegration => {
  const { temporaryLocation = false } = options;
  const { t } = useTranslation();
  const notify = useNotification();
  const { integration: { iframeAllowedUrls = [] } = {} } = useConfig();
  const storageBucketId = useOptionalStorageConfigContext()?.storageBucketId;
  const [uploadFile] = useUploadFileMutation();

  const onError = (message: string) => notify(message, 'error');

  const onImageUpload = storageBucketId
    ? async (file: File): Promise<string> => {
        const result = await uploadFile({
          variables: { file, uploadData: { storageBucketId, temporaryLocation } },
        });
        const url = result.data?.uploadFileOnStorageBucket?.url;
        if (!url) {
          throw new Error(t('components.file-upload.file-upload-error'));
        }
        return url;
      }
    : undefined;

  return { onImageUpload, iframeAllowedUrls, onError };
};
