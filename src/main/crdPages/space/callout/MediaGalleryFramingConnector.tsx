import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  CalloutMediaGalleryCarousel,
  type CalloutMediaGalleryCarouselItem,
} from '@/crd/components/callout/CalloutMediaGalleryCarousel';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { mapMediaGalleryToViewProps } from '../dataMappers/mediaGalleryDataMapper';
import { useMediaGalleryDirectUpload } from '../hooks/useMediaGalleryDirectUpload';

type MediaGalleryFramingConnectorProps = {
  callout: CalloutDetailsModelExtended;
  initialIndex?: number;
  canEdit?: boolean;
};

const deriveDownloadName = (uri: string): string => {
  try {
    const { pathname } = new URL(uri, window.location.href);
    const basename = pathname.split('/').filter(Boolean).pop();
    return basename || 'image';
  } catch {
    return 'image';
  }
};

/**
 * Renders the inline media-gallery carousel inside CalloutDetailDialog's framing slot.
 * Unlike memos/whiteboards this connector does NOT open a second Radix Dialog — the
 * gallery is viewed inline. Browser fullscreen on the carousel root provides the
 * "immersive" view without adding another dialog to the focus-trap stack.
 *
 * "Add images" goes straight to the OS file picker via `useMediaGalleryDirectUpload`
 * (no edit-dialog round-trip — MUI parity with `CalloutFramingMediaGallery`).
 */
export function MediaGalleryFramingConnector({
  callout,
  initialIndex = 0,
  canEdit = false,
}: MediaGalleryFramingConnectorProps) {
  const { t } = useTranslation('crd-space');
  const notify = useNotification();
  const { carouselItems } = mapMediaGalleryToViewProps(callout.framing.mediaGallery);

  const { triggerAddImages, fileInputElement } = useMediaGalleryDirectUpload({
    mediaGalleryId: callout.framing.mediaGallery?.id,
    existingVisuals: callout.framing.mediaGallery?.visuals ?? [],
    enabled: canEdit,
  });

  // Fetches the image as a blob and triggers a real download. Using `<a href download>`
  // directly is unreliable for cross-origin URLs — most browsers ignore `download` and
  // just open the image in a new tab.
  const handleDownload = async (item: CalloutMediaGalleryCarouselItem) => {
    let objectUrl: string | undefined;
    try {
      const response = await fetch(item.uri);
      if (!response.ok) {
        throw new Error(`Failed to download media: ${response.status}`);
      }
      const blob = await response.blob();
      objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = deriveDownloadName(item.uri);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      notify(t('mediaGallery.downloadError'), 'error');
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  };

  return (
    <>
      <CalloutMediaGalleryCarousel
        items={carouselItems}
        initialIndex={initialIndex}
        canEdit={canEdit}
        onAddImages={triggerAddImages}
        onDownload={item => void handleDownload(item)}
      />
      {fileInputElement}
    </>
  );
}
