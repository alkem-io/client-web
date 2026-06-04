import { useTranslation } from 'react-i18next';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useStorageConfigContext } from '@/domain/storage/StorageBucket/StorageConfigContext';

type MarkdownEditorIntegrationOptions = {
  /** When true, uploads use the temporary location (cleaned up server-side if the form is abandoned). */
  temporaryLocation?: boolean;
  /**
   * Explicit storage bucket to upload into, overriding the ambient
   * `StorageConfigContextProvider`. Used by editors whose entity owns its own bucket but has no
   * dedicated `locationType` (e.g. memos upload into `memo.profile.storageBucket.id`).
   */
  storageBucketId?: string;
};

type MarkdownEditorIntegration = {
  onImageUpload: (file: File) => Promise<string>;
  iframeAllowedUrls: string[];
  onError: (message: string) => void;
};

/**
 * Glue hook for `MarkdownEditor` / `CollaborativeMarkdownEditor` consumers.
 *
 * Returns the props the CRD editor needs to enable image upload (storage-bucket mutation)
 * and iframe embed validation (platform config). Requires an ambient
 * `StorageConfigContextProvider` (mounted at the page-shell level for space + forum routes).
 */
export const useMarkdownEditorIntegration = (
  options: MarkdownEditorIntegrationOptions = {}
): MarkdownEditorIntegration => {
  const { temporaryLocation = false, storageBucketId: storageBucketIdOverride } = options;
  const { t } = useTranslation();
  const notify = useNotification();
  const { integration: { iframeAllowedUrls = [] } = {} } = useConfig();
  const storageConfig = useStorageConfigContext();
  const [uploadFile] = useUploadFileMutation();

  const onError = (message: string) => notify(message, 'error');

  const onImageUpload = async (file: File): Promise<string> => {
    const storageBucketId = storageBucketIdOverride ?? storageConfig?.storageBucketId;
    if (!storageBucketId) {
      throw new Error(t('components.file-upload.file-upload-error'));
    }
    const result = await uploadFile({
      variables: { file, uploadData: { storageBucketId, temporaryLocation } },
    });
    const url = result.data?.uploadFileOnStorageBucket?.url;
    if (!url) {
      throw new Error(t('components.file-upload.file-upload-error'));
    }
    return url;
  };

  return { onImageUpload, iframeAllowedUrls, onError };
};
