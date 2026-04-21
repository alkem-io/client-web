import { CalloutMediaGalleryCarousel } from '@/crd/components/callout/CalloutMediaGalleryCarousel';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { mapMediaGalleryToViewProps } from '../dataMappers/mediaGalleryDataMapper';

type MediaGalleryFramingConnectorProps = {
  callout: CalloutDetailsModelExtended;
  initialIndex?: number;
  canEdit?: boolean;
  onAddImages?: () => void;
};

/**
 * Renders the inline media-gallery carousel inside CalloutDetailDialog's framing slot.
 * Unlike memos/whiteboards this connector does NOT open a second Radix Dialog — the
 * gallery is viewed inline. Browser fullscreen on the carousel root provides the
 * "immersive" view without adding another dialog to the focus-trap stack.
 */
export function MediaGalleryFramingConnector({
  callout,
  initialIndex = 0,
  canEdit = false,
  onAddImages,
}: MediaGalleryFramingConnectorProps) {
  const { carouselItems } = mapMediaGalleryToViewProps(callout.framing.mediaGallery);

  return (
    <CalloutMediaGalleryCarousel
      items={carouselItems}
      initialIndex={initialIndex}
      canEdit={canEdit}
      onAddImages={onAddImages}
    />
  );
}
