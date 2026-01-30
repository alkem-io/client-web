import React from 'react';
import { Box, styled } from '@mui/material';
import { gutters } from '../grid/utils';
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

interface MediaGalleryProps {
  visuals:
    | {
        id: string;
        uri: string;
        alternateText?: string;
      }[]
    | undefined;
}

const MediaGalleryPreview = ({ visuals }: MediaGalleryProps) => {
  const { t } = useTranslation();

  if (!visuals || visuals.length === 0) {
    return null;
  }

  return (
    <>
      <GalleryWrapper>
        {visuals.map(item => {
          return (
            <GalleryItem key={item.id}>
              <img
                src={item.uri}
                alt={item.alternateText || t('components.callout-creation.framing.mediaGallery.galleryItem')}
              />
            </GalleryItem>
          );
        })}
      </GalleryWrapper>
    </>
  );
};

export default MediaGalleryPreview;
