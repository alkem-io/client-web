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
    {/* Gradient overlay for blending with content below */}
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '35%',
        background:
          'linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0.9) 15%, rgba(255, 255, 255, 0.7) 35%, rgba(255, 255, 255, 0.4) 55%, rgba(255, 255, 255, 0.15) 75%, rgba(255, 255, 255, 0) 100%)',
        pointerEvents: 'none',
      }}
    />
    {overlay}
  </Box>
);

export default CardBanner;
