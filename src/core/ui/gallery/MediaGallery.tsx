import React, { useRef } from 'react';
import { Box, DialogContent, IconButton, styled, Tooltip } from '@mui/material';
import { MediaGalleryItem } from './types';
import { gutters } from '../grid/utils';
import DialogHeader from '../dialog/DialogHeader';
import DialogWithGrid from '../dialog/DialogWithGrid';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { useTranslation } from 'react-i18next';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const ImageGallery = lazyWithGlobalErrorHandler(async () => {
  const ImageGallery = await import('react-image-gallery');
  await import('react-image-gallery/styles/image-gallery.css');
  await import('./MediaGallery.css');
  return { default: ImageGallery.default };
});
import type { GalleryItem, ImageGalleryRef } from 'react-image-gallery';

const GalleryWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  marginBottom: gutters(1)(theme),
  gap: gutters(0.5)(theme),
}));

const GalleryThumbnail = styled('a')(() => ({
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
  const galleryRef = useRef<ImageGalleryRef>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<number | undefined>(undefined);
  const [fullscreen, setFullscreen] = React.useState<boolean>(false);

  const handleClose = () => {
    if (fullscreen) {
      galleryRef.current?.exitFullScreen();
      setFullscreen(false);
    }
    setSelectedIndex(undefined);
    setDialogOpen(false);
  };

  const handleClickFullscreen = () => {
    if (fullscreen) {
      galleryRef.current?.exitFullScreen();
      setFullscreen(false);
    } else {
      galleryRef.current?.fullScreen();
      setFullscreen(true);
    }
  };

  const handleItemClick = (item: MediaGalleryItem, index: number) => {
    setSelectedIndex(index);
    setDialogOpen(true);
  };

  const handleDownload = async () => {
    if (selectedIndex === undefined) {
      return;
    }
    const item = items[selectedIndex];
    const response = await fetch(item.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.title || `image-${selectedIndex + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDialogEntered = () => {
    if (selectedIndex === undefined) {
      return;
    }
    galleryRef.current?.slideToIndex(selectedIndex);
  };

  if (!items || items.length === 0) {
    return null;
  }

  const galleryItems: GalleryItem[] = items.map(item => ({
    original: item.url,
    thumbnail: item.thumbnailUrl || item.url,
    originalAlt: title || item.alt || item.title || t('components.callout-creation.framing.mediaGallery.galleryItem'),
    thumbnailAlt: title || item.alt || item.title || t('components.callout-creation.framing.mediaGallery.galleryItem'),
    description: item.description,
  }));

  return (
    <>
      <GalleryWrapper>
        {items.map((item, index) => {
          const isVideo = item.type === 'video';
          const videoSource = isVideo
            ? JSON.stringify({
                source: [{ src: item.url, type: 'video/mp4' }],
                attributes: { preload: false, controls: true },
              })
            : undefined;

          return (
            <GalleryThumbnail key={item.id} data-src={isVideo ? undefined : item.url} data-video={videoSource}>
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.alt || item.title || t('components.callout-creation.framing.mediaGallery.galleryItem')}
                onClick={() => handleItemClick(item, index)}
              />
            </GalleryThumbnail>
          );
        })}
      </GalleryWrapper>
      <DialogWithGrid
        open={dialogOpen}
        onClose={handleClose}
        slotProps={{
          transition: {
            // Executed when the dialog has finished entering and is visible, load the image that the user clicked on
            onEntered: handleDialogEntered,
          },
        }}
      >
        <DialogHeader
          actions={
            <>
              <Tooltip title={t('buttons.download')} arrow>
                <IconButton
                  onClick={handleDownload}
                  title={t('buttons.download')}
                  aria-label={t('buttons.download')}
                  color="primary"
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('buttons.fullscreen')} arrow>
                <IconButton
                  onClick={handleClickFullscreen}
                  title={t('buttons.fullscreen')}
                  aria-label={t('buttons.fullscreen')}
                  color="primary"
                >
                  {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
            </>
          }
          onClose={handleClose}
        >
          {title || t('components.callout-creation.framing.mediaGallery.name')}
        </DialogHeader>
        <DialogContent sx={{ padding: 0 }}>
          <ImageGallery
            ref={galleryRef}
            items={galleryItems}
            showPlayButton={false}
            onSlide={currentIndex => setSelectedIndex(currentIndex)}
            showFullscreenButton={fullscreen}
            onScreenChange={fullscreen => setFullscreen(fullscreen)}
          />
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};

export default MediaGallery;
