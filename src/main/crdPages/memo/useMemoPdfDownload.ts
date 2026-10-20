import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { downloadPdf, PdfDownloadError } from './downloadPdf';

export const memoPdfDownloadPath = (memoId: string) => `/api/private/rest/memo/${encodeURIComponent(memoId)}/pdf`;

const BUSY_STATUSES = [429, 503];
const NOT_EXPORTABLE_STATUS = 422;

/**
 * @param requestDurability Resolves once this client's pending edits are saved, so the PDF reflects
 *   the content as of the request. Omit it when there is no provider to flush.
 */
export function useMemoPdfDownload(
  memoId: string | undefined,
  requestDurability?: () => Promise<void>
): {
  download: () => Promise<void>;
  downloading: boolean;
} {
  const { t } = useTranslation('crd-space');
  const notify = useNotification();
  const [downloading, setDownloading] = useState(false);
  const inFlight = useRef<AbortController | undefined>(undefined);

  // Closing the dialog unmounts the caller: abort so the server frees the per-actor render slot.
  useEffect(() => () => inFlight.current?.abort(), []);

  const download = async () => {
    if (!memoId || downloading) {
      return;
    }
    const controller = new AbortController();
    inFlight.current = controller;
    setDownloading(true);
    try {
      await requestDurability?.();
      // No filename: the server names the file in Content-Disposition.
      await downloadPdf({ url: memoPdfDownloadPath(memoId), signal: controller.signal });
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      const status = error instanceof PdfDownloadError ? error.status : undefined;
      if (status !== undefined && BUSY_STATUSES.includes(status)) {
        notify(t('memo.downloadPdf.busy'), 'warning');
      } else if (status === NOT_EXPORTABLE_STATUS) {
        notify(t('memo.downloadPdf.tooLarge'), 'error');
      } else {
        notify(t('memo.downloadPdf.failed'), 'error');
      }
    } finally {
      if (!controller.signal.aborted) {
        setDownloading(false);
      }
    }
  };

  return { download, downloading };
}
