import React, { useRef, useState } from 'react';
import { Box, Button, DialogContent, IconButton, styled, Tooltip } from '@mui/material';
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
import { Caption } from '../typography';
import ImagePlaceholder from '../image/ImagePlaceholder';

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

const MAX_VISIBLE_THUMBNAILS = 6;

const MediaGallery = ({ title, items }: MediaGalleryProps) => {
  const { t } = useTranslation();
  const galleryRef = useRef<ImageGalleryRef>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
  const [fullscreen, setFullscreen] = useState<boolean>(false);

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

  const hasMoreThumbnails = items.length > MAX_VISIBLE_THUMBNAILS;
  const visibleThumbnails = items.slice(0, MAX_VISIBLE_THUMBNAILS);

  const handleShowMore = () => {
    setSelectedIndex(0);
    setDialogOpen(true);
  };

  return (
    <>
      <GalleryWrapper>
        {visibleThumbnails.map((item, index) => {
          const isVideo = item.type === 'video';
          const videoSource = isVideo
            ? JSON.stringify({
                source: [{ src: item.url, type: 'video/mp4' }],
                attributes: { preload: false, controls: true },
              })
            : undefined;
          const hasValidUrl = item.url && item.url !== '';
          const hasValidThumbnail = item.thumbnailUrl && item.thumbnailUrl !== '';

          return (
            <GalleryThumbnail key={item.id} data-src={isVideo ? undefined : item.url} data-video={videoSource}>
              {hasValidUrl || hasValidThumbnail ? (
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.alt || item.title || t('components.callout-creation.framing.mediaGallery.galleryItem')}
                  onClick={() => handleItemClick(item, index)}
                />
              ) : (
                <ImagePlaceholder text={t('components.callout-creation.framing.mediaGallery.imageNotAvailable')} />
              )}
            </GalleryThumbnail>
          );
        })}
      </GalleryWrapper>
      {hasMoreThumbnails && (
        <Box display="flex" justifyContent="end" alignItems="center" gap={gutters()} margin={gutters(1)}>
          <Caption>{t('callout.create.framingSettings.mediaGallery.nItems', { count: items.length })}</Caption>
          <Button variant="outlined" onClick={handleShowMore}>
            {t('buttons.showAll')}
          </Button>
        </Box>
      )}
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
            disableThumbnailScroll
            disableThumbnailSwipe
          />
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};

export default MediaGallery;
