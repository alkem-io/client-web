import { ReactNode } from 'react';
import { Box } from '@mui/material';
import CardImage from './CardImage';
import SpaceCardBannerPlaceholder from '@/domain/space/components/cards/components/SpaceCardBannerPlaceholder';

type CardBannerProps = {
  src?: string;
  alt?: string;
  overlay?: ReactNode;
};

const CardBanner = ({ src, alt, overlay }: CardBannerProps) => (
  <Box position="relative">
    {src ? <CardImage src={src} alt={alt} /> : <SpaceCardBannerPlaceholder />}
    {overlay}
  </Box>
);

export default CardBanner;
