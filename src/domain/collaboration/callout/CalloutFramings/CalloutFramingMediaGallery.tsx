import React from 'react';
import MediaGallery from '@/core/ui/gallery/MediaGallery';
import { MediaItem } from '@/core/ui/gallery/types';
import { CalloutDetailsModel } from '../models/CalloutDetailsModel';
import PageContentBlock from '@/core/ui/content/PageContentBlock';

interface CalloutFramingMediaGalleryProps {
  callout: CalloutDetailsModel;
  onCollapse?: () => void;
}

/**
 * Converts callout media gallery visuals to MediaItem format
 */
const convertVisualsToMediaItems = (callout: CalloutDetailsModel): MediaItem[] => {
  const visuals = callout.framing.mediaGallery?.visuals;

  if (!visuals) {
    return [];
  }

  return visuals.map(visual => ({
    id: visual.id,
    type: 'image', // TODO: Handle video type if available in Visual
    url: visual.uri,
    title: visual.name,
    alt: visual.alternativeText || visual.name,
  }));
};

const CalloutFramingMediaGallery = ({ callout }: CalloutFramingMediaGalleryProps) => {
  const mediaItems = convertVisualsToMediaItems(callout);

  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <PageContentBlock>
      <MediaGallery items={mediaItems} />
    </PageContentBlock>
  );
};

export default CalloutFramingMediaGallery;
