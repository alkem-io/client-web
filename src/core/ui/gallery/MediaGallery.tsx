import React, { Suspense, lazy } from 'react';
import { Box, styled } from '@mui/material';
import { MediaGalleryItem } from './types';
import { useTranslation } from 'react-i18next';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import './lightgallery.css';

import lgThumbnail from 'lightgallery/plugins/thumbnail';

const LightGallery = lazy(() => import('lightgallery/react').then(module => ({ default: module.default })));

const GalleryWrapper = styled(Box)(({ theme }) => ({
  '& .custom-lightgallery': {
    display: 'flex',
    flexWrap: 'wrap',
  },
  '& ': {
    borderColor: theme.palette.primary.main,
  },
}));

const GalleryItem = styled('a')(() => ({
  display: 'block',
  aspectRatio: '4 / 3',
  flex: '1 1 300px',
  maxWidth: '100%',
  overflow: 'hidden',
  cursor: 'pointer',
  position: 'relative',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  '&:hover img': {
    transform: 'scale(1.05)',
  },
}));

interface MediaGalleryProps {
  title?: string;
  items: MediaGalleryItem[];
}

const MediaGallery = ({ title, items }: MediaGalleryProps) => {
  const { t } = useTranslation();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <GalleryWrapper>
      <Suspense fallback={<Box sx={{ minHeight: '200px' }} />}>
        <LightGallery
          speed={500}
          plugins={[lgThumbnail]}
          mode="lg-fade"
          elementClassNames="custom-lightgallery"
          zoomFromOrigin
          allowMediaOverlap={false}
        >
          {items.map(item => {
            const isVideo = item.type === 'video';
            const videoSource = isVideo
              ? JSON.stringify({
                  source: [{ src: item.url, type: 'video/mp4' }],
                  attributes: { preload: false, controls: true },
                })
              : undefined;

            return (
              <GalleryItem key={item.id} data-src={isVideo ? undefined : item.url} data-video={videoSource}>
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={
                    title || item.alt || item.title || t('components.callout-creation.framing.mediaGallery.galleryItem')
                  }
                />
              </GalleryItem>
            );
          })}
        </LightGallery>
      </Suspense>
    </GalleryWrapper>
  );
};

export default MediaGallery;
