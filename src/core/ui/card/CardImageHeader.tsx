import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import CardImage from './CardImage';
import JourneyCardBannerPlaceholder from '@/domain/journey/common/JourneyCard/JourneyCardBannerPlaceholder';

interface CardBannerProps {
  src?: string;
  alt?: string;
  overlay?: ReactNode;
}

const CardBanner = ({ src, alt, overlay }: CardBannerProps) => {
  return (
    <Box position="relative">
      {src ? <CardImage src={src} alt={alt} /> : <JourneyCardBannerPlaceholder />}
      {overlay}
    </Box>
  );
};

export default CardBanner;
