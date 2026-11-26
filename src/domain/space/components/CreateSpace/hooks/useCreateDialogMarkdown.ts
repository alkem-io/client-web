import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useConfig } from '@/domain/platform/config/useConfig';

/**
 * The description editor of the create dialogs. Before the space exists there is no owner to upload to: the file
 * contract's requestUpload needs one (022 FR-001) and 023 FR-003 sends no uploads with the create. No designed path
 * for an inline image before creation exists (a design hole recorded by the spaces lead, 2026-11-25), so an inline
 * image upload fails visibly with the existing upload-error notice; a text description works.
 */
export const useCreateDialogMarkdown = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { integration: { iframeAllowedUrls = [] } = {} } = useConfig();

  const onImageUpload = async (_file: File): Promise<string> => {
    throw new Error(t('components.file-upload.file-upload-error'));
  };
  const onError = (message: string) => notify(message, 'error');

  return { onImageUpload, iframeAllowedUrls, onError };
};
