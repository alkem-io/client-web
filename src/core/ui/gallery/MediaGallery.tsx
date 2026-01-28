import React from 'react';
import { Box, Dialog, styled } from '@mui/material';
import { MediaItem } from './types';
import { gutters } from '../grid/utils';
import DialogHeader from '../dialog/DialogHeader';
import GalleryPager from './GalleryPager';
import { useTranslation } from 'react-i18next';

const GalleryWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: gutters(0.5)(theme),
  marginBottom: gutters(1)(theme),
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

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 'auto',
  height: 'auto',
  minHeight: gutters(10)(theme),
  minWidth: gutters(20)(theme),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& > img': {
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
  },
}));

interface MediaGalleryProps {
  title?: string;
  items: MediaItem[];
}

const MediaGallery = ({ title, items }: MediaGalleryProps) => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = React.useState<MediaItem>();
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  const handleClose = () => {
    setSelectedItem(undefined);
    setCurrentIndex(0);
  };

  const handleItemClick = (item: MediaItem, index: number) => {
    setSelectedItem(item);
    setCurrentIndex(index);
  };

  const handlePrevious = React.useCallback(() => {
    const newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedItem(items[newIndex]);
  }, [currentIndex, items]);

  const handleNext = React.useCallback(() => {
    const newIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedItem(items[newIndex]);
  }, [currentIndex, items]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setSelectedItem(items[index]);
  };

  if (!items || items.length === 0) {
    return null;
  }

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
            <GalleryItem key={item.id} data-src={isVideo ? undefined : item.url} data-video={videoSource}>
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.alt || item.title || t('components.callout-creation.framing.mediaGallery.galleryItem')}
                onClick={() => handleItemClick(item, index)}
              />
            </GalleryItem>
          );
        })}
      </GalleryWrapper>
      <Dialog open={!!selectedItem} onClose={handleClose} maxWidth="lg">
        <DialogHeader onClose={handleClose}>{title || 'Media Gallery'}</DialogHeader>
        {selectedItem && (
          <ImageContainer>
            <Box
              component="img"
              src={selectedItem.thumbnailUrl || selectedItem.url}
              alt={
                selectedItem.alt ||
                selectedItem.title ||
                t('components.callout-creation.framing.mediaGallery.galleryItem')
              }
            />
            <GalleryPager
              containerProps={{ position: 'absolute', bottom: 0, width: '100%' }}
              totalItems={items.length}
              currentIndex={currentIndex}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onDotClick={handleDotClick}
            />
          </ImageContainer>
        )}
      </Dialog>
    </>
  );
};

export default MediaGallery;
