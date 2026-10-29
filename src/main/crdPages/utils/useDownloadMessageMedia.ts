import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { MessageMediaDownload } from '@/crd/components/comment/MessageAttachments';
import { downloadUrlAsFile } from './downloadUrlAsFile';

/** Download handler for the media viewer opened from a chat message or comment. */
export function useDownloadMessageMedia() {
  const { t } = useTranslation('crd-common');
  const notify = useNotification();

  return (media: MessageMediaDownload) => {
    downloadUrlAsFile(media.url, media.displayName).catch(() => {
      notify(t('messageAttachments.downloadError'), 'error');
    });
  };
}
