import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  styled,
  useTheme,
  useMediaQuery,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MediaGalleryItem from './MediaGalleryItem';
import { MediaItem } from './types';

const LightboxContent = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
  position: 'relative',
});

const LightboxImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '90vh',
  objectFit: 'contain',
});

const LightboxVideo = styled('video')({
  maxWidth: '100%',
  maxHeight: '90vh',
});

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  zIndex: 1,
}));

interface MediaGalleryProps {
  items: MediaItem[];
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ items }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleItemClick = (item: MediaItem) => {
    const index = items.findIndex(i => i.id === item.id);
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setSelectedIndex(null);
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(prev => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
    }
  };

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <>
      <Grid container spacing={2}>
        {items.map(item => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id}>
            <MediaGalleryItem item={item} onClick={handleItemClick} />
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={selectedIndex !== null}
        onClose={handleClose}
        maxWidth="xl"
        fullScreen={fullScreen}
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
          },
        }}
      >
        {selectedItem && (
          <DialogContent
            sx={{
              p: 0,
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
            }}
          >
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                zIndex: 2,
              }}
            >
              <CloseIcon />
            </IconButton>

            {items.length > 1 && (
              <>
                <NavigationButton onClick={handlePrev} sx={{ left: 16 }}>
                  <ArrowBackIosNewIcon />
                </NavigationButton>
                <NavigationButton onClick={handleNext} sx={{ right: 16 }}>
                  <ArrowForwardIosIcon />
                </NavigationButton>
              </>
            )}

            <LightboxContent onClick={handleClose}>
              <Box onClick={e => e.stopPropagation()}>
                {selectedItem.type === 'image' ? (
                  <LightboxImage src={selectedItem.url} alt={selectedItem.alt || selectedItem.title} />
                ) : (
                  <LightboxVideo controls autoPlay src={selectedItem.url} />
                )}
                {selectedItem.description && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 2,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                    }}
                  >
                    <Typography variant="body1">{selectedItem.title}</Typography>
                    <Typography variant="body2">{selectedItem.description}</Typography>
                  </Box>
                )}
              </Box>
            </LightboxContent>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default MediaGallery;
