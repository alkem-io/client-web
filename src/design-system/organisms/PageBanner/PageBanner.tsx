import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export interface PageBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  height?: number | string;
}

export const PageBanner: React.FC<PageBannerProps> = ({ title, subtitle, backgroundImage, height = 300 }) => {
  return (
    <Box
      sx={{
        height,
        width: '100%',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        bgcolor: backgroundImage ? 'transparent' : 'primary.main',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        '&::before': backgroundImage
          ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            }
          : {},
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="h5" component="p">
            {subtitle}
          </Typography>
        )}
      </Container>
    </Box>
  );
};
