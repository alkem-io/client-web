import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { downloadPdf, PdfDownloadError } from './downloadPdf';

export const memoPdfDownloadPath = (memoId: string) => `/api/private/rest/memo/${encodeURIComponent(memoId)}/pdf`;

const BUSY_STATUSES = [429, 503];
const NOT_EXPORTABLE_STATUS = 422;

export function useMemoPdfDownload(memoId: string | undefined): {
  download: () => Promise<void>;
  downloading: boolean;
} {
  const { t } = useTranslation('crd-space');
  const notify = useNotification();
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    if (!memoId || downloading) {
      return;
    }
    setDownloading(true);
    try {
      // No filename: the server names the file in Content-Disposition.
      await downloadPdf({ url: memoPdfDownloadPath(memoId) });
    } catch (error) {
      const status = error instanceof PdfDownloadError ? error.status : undefined;
      if (status !== undefined && BUSY_STATUSES.includes(status)) {
        notify(t('memo.downloadPdf.busy'), 'warning');
      } else if (status === NOT_EXPORTABLE_STATUS) {
        notify(t('memo.downloadPdf.tooLarge'), 'error');
      } else {
        notify(t('memo.downloadPdf.failed'), 'error');
      }
    } finally {
      setDownloading(false);
    }
  };

  return { download, downloading };
}
