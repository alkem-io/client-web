import React from 'react';
import LightGallery from 'lightgallery/react';
import { Box, styled, GlobalStyles } from '@mui/material';

// import styles
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-video.css';
import 'lightgallery/css/lg-rotate.css';

// import plugins
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import lgRotate from 'lightgallery/plugins/rotate';

import { MediaItem } from './types';

const GalleryWrapper = styled(Box)(({ theme }) => ({
  '& .custom-lightgallery': {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
}));

const GalleryItem = styled('a')(() => ({
  display: 'block',
  height: '250px',
  flex: '1 1 300px',
  maxWidth: '100%',
  overflow: 'hidden',
  borderRadius: 16,
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
  items: MediaItem[];
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <GalleryWrapper>
      <GlobalStyles
        styles={{
          '.lg-outer': { zIndex: '10000 !important' },
          '.lg-backdrop': { zIndex: '9999 !important' },
        }}
      />
      <LightGallery
        speed={500}
        plugins={[lgThumbnail, lgZoom, lgVideo, lgRotate]}
        mode="lg-fade"
        elementClassNames="custom-lightgallery"
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
            <GalleryItem
              key={item.id}
              data-src={isVideo ? undefined : item.url}
              data-video={videoSource}
              data-sub-html={
                item.title ? `<h4>${item.title}</h4>${item.description ? `<p>${item.description}</p>` : ''}` : undefined
              }
            >
              <img src={item.thumbnailUrl || item.url} alt={item.alt || item.title || 'Gallery item'} />
            </GalleryItem>
          );
        })}
      </LightGallery>
    </GalleryWrapper>
  );
};

export default MediaGallery;
