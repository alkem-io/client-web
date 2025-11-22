import React from 'react';
import { Box, Card, CardActionArea, CardMedia, Typography, styled } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { MediaItem } from './types';

const VideoOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  color: theme.palette.common.white,
  opacity: 0.8,
  transition: 'opacity 0.2s',
  '&:hover': {
    opacity: 1,
  },
}));

interface MediaGalleryItemProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
}

const MediaGalleryItem: React.FC<MediaGalleryItemProps> = ({ item, onClick }) => {
  const handleClick = () => {
    onClick(item);
  };

  return (
    <Card>
      <CardActionArea onClick={handleClick}>
        <Box position="relative">
          <CardMedia
            component="img"
            height="200"
            image={item.type === 'video' && item.thumbnailUrl ? item.thumbnailUrl : item.url}
            alt={item.alt || item.title || 'Media item'}
            sx={{ objectFit: 'cover' }}
          />
          {item.type === 'video' && (
            <VideoOverlay>
              <PlayCircleOutlineIcon sx={{ fontSize: 64 }} />
            </VideoOverlay>
          )}
        </Box>
        {item.title && (
          <Box p={1}>
            <Typography variant="subtitle2" noWrap>
              {item.title}
            </Typography>
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
};

export default MediaGalleryItem;
