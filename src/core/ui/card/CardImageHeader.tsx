import { ReactNode } from 'react';
import { Box } from '@mui/material';
import CardImage from './CardImage';
import JourneyCardBannerPlaceholder from '@/domain/journey/common/JourneyCard/JourneyCardBannerPlaceholder';

type CardBannerProps = {
  src?: string;
  alt?: string;
  overlay?: ReactNode;
};

const CardBanner = ({ src, alt, overlay }: CardBannerProps) => (
  <Box position="relative">
    {src ? <CardImage src={src} alt={alt} /> : <JourneyCardBannerPlaceholder />}
    {overlay}
  </Box>
);

export default CardBanner;
