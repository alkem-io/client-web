import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';

/**
 * The shell's `FileSave` plugin (client-appstore). Hand-written, like `nativePushPlugin.ts`.
 * Contract: `save` resolves when the file was saved **or** the user cancelled the native
 * save dialog, and rejects only when saving failed. `data` is the file as base64.
 */
type FileSavePlugin = { save(options: { fileName: string; mimeType: string; data: string }): Promise<void> };

const getFileSavePlugin = (): FileSavePlugin | undefined =>
  window.Capacitor?.isPluginAvailable?.('FileSave') === true
    ? (window.Capacitor?.Plugins?.FileSave as FileSavePlugin | undefined)
    : undefined;

/** Larger files are refused before encoding: the base64 copy crosses the bridge in memory (spec R-1, FR-013). */
export const MAX_APP_DOWNLOAD_BYTES = 15 * 1024 * 1024;

const readAsBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.slice(dataUrl.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * In the store app, every click on an `a[download][href]` is saved through the shell's
 * `FileSave` plugin instead of navigating the web view, which cannot download. It owns
 * every such click in the app — declarative links, attached programmatic anchors and
 * detached ones alike — so there is no list of download sites to keep in sync.
 * Without the plugin (a browser, an older store build) it installs nothing.
 */
export function useAppDownloadInterception(): void {
  const { t } = useTranslation('crd-common');
  const notify = useNotification();
  const saving = useRef(false); // FR-014: Android routes every activity result to the newest call (Plugin.java:148,180)

  useEffect(() => {
    const plugin = getFileSavePlugin();
    if (!plugin) return;

    const onClick = (event: MouseEvent) => {
      const anchor =
        event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[download][href]') : null;
      if (!anchor) return;
      event.preventDefault(); // FR-003: never navigate the web view
      if (saving.current) return;
      saving.current = true;
      const fileName = anchor.getAttribute('download') ?? '';
      fetch(anchor.href) // called inside the click, before a site's synchronous revoke (spec R-4)
        .then(response => {
          if (!response.ok) throw new Error(String(response.status));
          return response.blob();
        })
        .then(async blob => {
          if (blob.size > MAX_APP_DOWNLOAD_BYTES) throw new Error('too large');
          return plugin.save({ fileName, mimeType: blob.type, data: await readAsBase64(blob) });
        })
        .catch(() => notify(t('appDownload.failed'), 'error'))
        .finally(() => {
          saving.current = false;
        });
    };

    // A programmatic click() on a detached anchor never reaches `document` (browser-fs-access's legacy save
    // in the whiteboard editor, CrdMemoDialog, CrdWhiteboardDialog). Attach it for the click so `onClick` sees it;
    // the anchor's own click listeners still fire (browser-fs-access revokes its blob: URL from one).
    const nativeClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      if (this.isConnected || !this.hasAttribute('download')) return nativeClick.call(this);
      document.body.appendChild(this);
      try {
        nativeClick.call(this);
      } finally {
        this.remove();
      }
    };
    document.addEventListener('click', onClick, true);

    return () => {
      document.removeEventListener('click', onClick, true);
      HTMLAnchorElement.prototype.click = nativeClick;
    };
  }, [notify, t]);
}
