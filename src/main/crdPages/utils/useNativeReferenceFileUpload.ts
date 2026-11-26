import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';

/**
 * The references paperclip of an existing entity on the native API. A link's file is its `link.file_id` argument
 * (files.md:540; upsertLink(file)), but no upload role for a link file is declared to obtain that file through
 * requestUpload (spaces lane design hole, 2026-11-25). Until it is, a reference file upload fails visibly with the
 * existing upload-error notice — never through the legacy storage bucket.
 */
export const useNativeReferenceFileUpload = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const onFileUpload = async (_file: File): Promise<string | null> => {
    notify(t('components.file-upload.file-upload-error'), 'error');
    return null;
  };
  return { onFileUpload, accept: undefined, canUpload: true };
};
