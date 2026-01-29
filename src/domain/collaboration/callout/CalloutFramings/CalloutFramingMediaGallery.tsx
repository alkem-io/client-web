import React from 'react';
import MediaGallery from '@/core/ui/gallery/MediaGallery';
import { MediaItem } from '@/core/ui/gallery/types';
import { CalloutDetailsModel } from '../models/CalloutDetailsModel';

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

  return [...visuals]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(visual => ({
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

  return <MediaGallery title={callout.framing.profile.displayName} items={mediaItems} />;
};

export default CalloutFramingMediaGallery;
